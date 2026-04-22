'use server';

import { db } from '@/db';
import { bookings, homes, users } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import type { ActionResult } from '@/lib/utils';

interface CreateBookingData {
  homeId: string;
  startDate: Date;
  endDate: Date;
  guests: number;
  message?: string;
}

export async function createBookingAction(data: CreateBookingData): Promise<ActionResult<{ bookingId: string }>> {
  try {
    const auth = await getCurrentUser();
    
    if (!auth) {
      return { success: false, error: 'You must be logged in to book' };
    }

    // Get home details
    const home = await db.select().from(homes).where(eq(homes.id, data.homeId)).limit(1);
    
    if (home.length === 0) {
      return { success: false, error: 'Home not found' };
    }

    const homeData = home[0];

    // Check if user is trying to book their own home
    if (homeData.hostId === auth.userId) {
      return { success: false, error: 'You cannot book your own home' };
    }

    // Check guest capacity
    if (data.guests > homeData.maxGuests) {
      return { success: false, error: 'Too many guests for this property' };
    }

    // Check for date conflicts (simplified - in production, check availability table)
    const conflictingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.homeId, data.homeId),
          gte(bookings.endDate, data.startDate),
          lte(bookings.startDate, data.endDate),
          eq(bookings.status, 'approved') // or 'paid'
        )
      );

    if (conflictingBookings.length > 0) {
      return { success: false, error: 'These dates are not available' };
    }

    // Calculate total amount
    const nights = Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 3600 * 24));
    const totalAmount = nights * parseFloat(homeData.pricePerNight);

    // Create Stripe PaymentIntent (but don't capture until approved)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      capture_method: 'manual', // Don't capture until approved
      metadata: {
        homeId: data.homeId,
        guestId: auth.userId,
        hostId: homeData.hostId,
      },
    });

    // Create booking
    const newBooking = await db.insert(bookings).values({
      homeId: data.homeId,
      guestId: auth.userId,
      hostId: homeData.hostId,
      startDate: data.startDate,
      endDate: data.endDate,
      totalAmount: totalAmount.toFixed(2),
      status: 'pending',
      message: data.message,
      stripePaymentIntentId: paymentIntent.id,
    }).returning({ id: bookings.id });

    if (newBooking.length === 0) {
      return { success: false, error: 'Failed to create booking request' };
    }

    // In production, send email notification to host here

  } catch (error) {
    console.error('Create booking error:', error);
    return { success: false, error: 'Failed to create booking request' };
  }

  redirect('/bookings');
}

export async function approveBookingAction(bookingId: string): Promise<ActionResult<void>> {
  try {
    const auth = await getCurrentUser();
    
    if (!auth) {
      return { success: false, error: 'You must be logged in' };
    }

    // Get booking details
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (booking.length === 0) {
      return { success: false, error: 'Booking not found' };
    }

    const bookingData = booking[0];

    // Verify user is the host
    if (bookingData.hostId !== auth.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update booking status
    await db
      .update(bookings)
      .set({
        status: 'approved',
        hostResponseAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // In production, send approval email to guest with payment link

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Approve booking error:', error);
    return { success: false, error: 'Failed to approve booking' };
  }
}

export async function declineBookingAction(bookingId: string): Promise<ActionResult<void>> {
  try {
    const auth = await getCurrentUser();
    
    if (!auth) {
      return { success: false, error: 'You must be logged in' };
    }

    // Get booking details
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (booking.length === 0) {
      return { success: false, error: 'Booking not found' };
    }

    const bookingData = booking[0];

    // Verify user is the host
    if (bookingData.hostId !== auth.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Cancel Stripe PaymentIntent if it exists
    if (bookingData.stripePaymentIntentId) {
      await stripe.paymentIntents.cancel(bookingData.stripePaymentIntentId);
    }

    // Update booking status
    await db
      .update(bookings)
      .set({
        status: 'declined',
        hostResponseAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // In production, send decline email to guest

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Decline booking error:', error);
    return { success: false, error: 'Failed to decline booking' };
  }
}