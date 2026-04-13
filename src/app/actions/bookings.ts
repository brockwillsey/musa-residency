'use server';

import { db } from '@/lib/db';
import { bookings, homes, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/auth';
import { bookingRequestSchema } from '@/lib/validations';
import { createPaymentIntent, capturePaymentIntent, cancelPaymentIntent } from '@/lib/stripe';
import { sendBookingNotificationEmail, sendBookingStatusEmail } from '@/lib/email';
import { calculateNights } from '@/lib/utils';
import { redirect } from 'next/navigation';
import type { ActionResult } from '@/lib/types';

export async function createBookingRequest(formData: {
  homeId: string;
  startDate: string;
  endDate: string;
  message?: string;
}): Promise<ActionResult<{ bookingId: string }>> {
  try {
    const user = await getUser();
    if (!user) {
      redirect('/auth/signin');
    }

    const validatedData = bookingRequestSchema.parse(formData);

    // Get home details with host
    const home = await db.query.homes.findFirst({
      where: and(
        eq(homes.id, validatedData.homeId),
        eq(homes.isActive, true)
      ),
      with: {
        host: true,
      },
    });

    if (!home) {
      return { success: false, error: 'Home not found or unavailable' };
    }

    if (home.hostId === user.id) {
      return { success: false, error: 'You cannot book your own property' };
    }

    // Calculate total amount
    const nights = calculateNights(validatedData.startDate, validatedData.endDate);
    const totalAmount = nights * parseFloat(home.pricePerNight);

    // Calculate auto-decline time (24 hours from now)
    const autoDeclineAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create payment intent (but don't capture)
    const paymentIntent = await createPaymentIntent(
      totalAmount,
      '',
      user.email
    );

    // Create booking
    const newBooking = await db.insert(bookings).values({
      homeId: validatedData.homeId,
      guestId: user.id,
      hostId: home.hostId,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      totalAmount: totalAmount.toString(),
      message: validatedData.message || null,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
      autoDeclineAt,
    }).returning();

    // Send notification email to host
    try {
      await sendBookingNotificationEmail(
        home.host.email,
        home.host.name,
        user.name,
        home.title,
        newBooking[0].id
      );
    } catch (emailError) {
      console.error('Failed to send booking notification email:', emailError);
      // Don't fail the booking if email fails
    }

    return { success: true, data: { bookingId: newBooking[0].id } };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return { success: false, error: error.errors[0]?.message || 'Invalid booking data' };
    }

    console.error('Create booking error:', error);
    return { success: false, error: 'Failed to create booking request. Please try again.' };
  }
}

export async function approveBooking(bookingId: string): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      redirect('/auth/signin');
    }

    // Get booking details with relations
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        home: true,
        guest: true,
      },
    });

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    if (booking.hostId !== user.id) {
      return { success: false, error: 'You can only approve your own booking requests' };
    }

    if (booking.status !== 'pending') {
      return { success: false, error: 'This booking has already been processed' };
    }

    // Capture payment
    if (booking.stripePaymentIntentId) {
      try {
        await capturePaymentIntent(booking.stripePaymentIntentId);
      } catch (paymentError) {
        console.error('Payment capture failed:', paymentError);
        return { success: false, error: 'Payment processing failed. Please try again.' };
      }
    }

    // Update booking status
    await db.update(bookings)
      .set({ 
        status: 'approved',
        hostResponseAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // Send confirmation email to guest
    try {
      await sendBookingStatusEmail(
        booking.guest.email,
        booking.guest.name,
        booking.home.title,
        'approved',
        bookingId
      );
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
    }

    return { success: true, data: null };
  } catch (error) {
    console.error('Approve booking error:', error);
    return { success: false, error: 'Failed to approve booking. Please try again.' };
  }
}

export async function declineBooking(bookingId: string): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      redirect('/auth/signin');
    }

    // Get booking details with relations
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        home: true,
        guest: true,
      },
    });

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    if (booking.hostId !== user.id) {
      return { success: false, error: 'You can only decline your own booking requests' };
    }

    if (booking.status !== 'pending') {
      return { success: false, error: 'This booking has already been processed' };
    }

    // Cancel payment intent
    if (booking.stripePaymentIntentId) {
      try {
        await cancelPaymentIntent(booking.stripePaymentIntentId);
      } catch (paymentError) {
        console.error('Payment cancellation failed:', paymentError);
      }
    }

    // Update booking status
    await db.update(bookings)
      .set({ 
        status: 'declined',
        hostResponseAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // Send notification email to guest
    try {
      await sendBookingStatusEmail(
        booking.guest.email,
        booking.guest.name,
        booking.home.title,
        'declined',
        bookingId
      );
    } catch (emailError) {
      console.error('Failed to send booking decline email:', emailError);
    }

    return { success: true, data: null };
  } catch (error) {
    console.error('Decline booking error:', error);
    return { success: false, error: 'Failed to decline booking. Please try again.' };
  }
}