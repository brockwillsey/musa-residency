'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db';
import { bookings, homes, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { createPaymentIntent, capturePaymentIntent } from '@/lib/stripe';
import { sendBookingRequestNotification, sendBookingStatusUpdate } from '@/lib/email';

const bookingSchema = z.object({
  homeId: z.string().uuid(),
  checkIn: z.string().transform(val => new Date(val)),
  checkOut: z.string().transform(val => new Date(val)),
  totalPrice: z.string().transform(val => parseFloat(val)),
  message: z.string().optional(),
});

export async function createBookingAction(formData: FormData) {
  try {
    const user = await requireAuth();
    
    const data = bookingSchema.parse({
      homeId: formData.get('homeId'),
      checkIn: formData.get('checkIn'),
      checkOut: formData.get('checkOut'),
      totalPrice: formData.get('totalPrice'),
      message: formData.get('message'),
    });

    // Get home and host information
    const home = await db
      .select()
      .from(homes)
      .innerJoin(users, eq(homes.hostId, users.id))
      .where(eq(homes.id, data.homeId))
      .limit(1);

    if (!home[0]) {
      return { success: false, error: 'Home not found' };
    }

    const { homes: homeData, users: hostData } = home[0];

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(data.totalPrice, {
      homeId: data.homeId,
      guestId: user.id,
      hostId: hostData.id,
    });

    // Create booking
    const newBooking = await db
      .insert(bookings)
      .values({
        homeId: data.homeId,
        guestId: user.id,
        hostId: hostData.id,
        startDate: data.checkIn,
        endDate: data.checkOut,
        totalPrice: data.totalPrice.toString(),
        message: data.message,
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
      })
      .returning();

    // Send notification email to host
    try {
      await sendBookingRequestNotification(
        hostData.email,
        user.name || 'A guest',
        homeData.title,
        newBooking[0].id
      );
    } catch (emailError) {
      console.error('Failed to send booking notification:', emailError);
    }

    revalidatePath('/bookings');
    return { success: true, data: newBooking[0] };
  } catch (error) {
    console.error('Create booking error:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'An error occurred while creating the booking' };
  }
}

export async function approveBookingAction(formData: FormData) {
  try {
    const user = await requireAuth();
    const bookingId = formData.get('bookingId') as string;

    // Get booking with related data
    const booking = await db
      .select()
      .from(bookings)
      .innerJoin(homes, eq(bookings.homeId, homes.id))
      .innerJoin(users, eq(bookings.guestId, users.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking[0]) {
      return { success: false, error: 'Booking not found' };
    }

    const { bookings: bookingData, homes: homeData, users: guestData } = booking[0];

    // Verify user is the host
    if (bookingData.hostId !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Capture payment
    if (bookingData.stripePaymentIntentId) {
      await capturePaymentIntent(bookingData.stripePaymentIntentId);
    }

    // Update booking status
    await db
      .update(bookings)
      .set({ status: 'approved' })
      .where(eq(bookings.id, bookingId));

    // Send notification email to guest
    try {
      await sendBookingStatusUpdate(
        guestData.email,
        'approved',
        homeData.title
      );
    } catch (emailError) {
      console.error('Failed to send booking approval notification:', emailError);
    }

    revalidatePath('/bookings');
    return { success: true, data: null };
  } catch (error) {
    console.error('Approve booking error:', error);
    return { success: false, error: 'An error occurred while approving the booking' };
  }
}

export async function declineBookingAction(formData: FormData) {
  try {
    const user = await requireAuth();
    const bookingId = formData.get('bookingId') as string;

    // Get booking with related data
    const booking = await db
      .select()
      .from(bookings)
      .innerJoin(homes, eq(bookings.homeId, homes.id))
      .innerJoin(users, eq(bookings.guestId, users.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking[0]) {
      return { success: false, error: 'Booking not found' };
    }

    const { bookings: bookingData, homes: homeData, users: guestData } = booking[0];

    // Verify user is the host
    if (bookingData.hostId !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update booking status
    await db
      .update(bookings)
      .set({ status: 'declined' })
      .where(eq(bookings.id, bookingId));

    // Send notification email to guest
    try {
      await sendBookingStatusUpdate(
        guestData.email,
        'declined',
        homeData.title
      );
    } catch (emailError) {
      console.error('Failed to send booking decline notification:', emailError);
    }

    revalidatePath('/bookings');
    return { success: true, data: null };
  } catch (error) {
    console.error('Decline booking error:', error);
    return { success: false, error: 'An error occurred while declining the booking' };
  }
}