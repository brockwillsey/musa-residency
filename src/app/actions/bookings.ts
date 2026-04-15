'use server';

import { db } from '@/lib/db';
import { bookings, homes, users } from '@/lib/db/schema';
import { eq, or, and, gte, lte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { stripe } from '@/lib/stripe';
import type { ActionResult, Booking } from '@/types';

export async function createBooking(data: {
  homeId: string;
  guestId: string;
  hostId: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  message?: string;
}): Promise<ActionResult<Booking>> {
  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.totalAmount * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      capture_method: 'manual', // Only authorize, don't capture until approved
    });

    // Create booking with 24-hour response deadline
    const responseDeadline = new Date();
    responseDeadline.setHours(responseDeadline.getHours() + 24);

    const newBooking = await db
      .insert(bookings)
      .values({
        ...data,
        totalAmount: data.totalAmount.toString(),
        stripePaymentIntentId: paymentIntent.id,
        responseDeadline,
        status: 'pending',
      })
      .returning();

    if (!newBooking.length) {
      return { success: false, error: 'Failed to create booking' };
    }

    // TODO: Send email notification to host

    revalidatePath('/bookings');
    return { success: true, data: newBooking[0] };
  } catch (error) {
    console.error('Create booking error:', error);
    return { success: false, error: 'Failed to create booking request' };
  }
}

export async function getUserBookings(userId: string): Promise<ActionResult<Booking[]>> {
  try {
    const result = await db
      .select({
        id: bookings.id,
        homeId: bookings.homeId,
        guestId: bookings.guestId,
        hostId: bookings.hostId,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        message: bookings.message,
        stripePaymentIntentId: bookings.stripePaymentIntentId,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        responseDeadline: bookings.responseDeadline,
        home: {
          id: homes.id,
          title: homes.title,
          location: homes.location,
          images: homes.images,
        },
        host: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(bookings)
      .leftJoin(homes, eq(bookings.homeId, homes.id))
      .leftJoin(users, eq(bookings.hostId, users.id))
      .where(eq(bookings.guestId, userId));

    return { success: true, data: result as Booking[] };
  } catch (error) {
    console.error('Get user bookings error:', error);
    return { success: false, error: 'Failed to fetch your bookings' };
  }
}

export async function getHostBookings(userId: string): Promise<ActionResult<Booking[]>> {
  try {
    const result = await db
      .select({
        id: bookings.id,
        homeId: bookings.homeId,
        guestId: bookings.guestId,
        hostId: bookings.hostId,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        message: bookings.message,
        stripePaymentIntentId: bookings.stripePaymentIntentId,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        responseDeadline: bookings.responseDeadline,
        home: {
          id: homes.id,
          title: homes.title,
          location: homes.location,
          images: homes.images,
        },
        guest: {
          id: users.id,
          name: users.name,
          image: users.image,
          bio: users.bio,
          location: users.location,
        },
      })
      .from(bookings)
      .leftJoin(homes, eq(bookings.homeId, homes.id))
      .leftJoin(users, eq(bookings.guestId, users.id))
      .where(eq(bookings.hostId, userId));

    return { success: true, data: result as Booking[] };
  } catch (error) {
    console.error('Get host bookings error:', error);
    return { success: false, error: 'Failed to fetch booking requests' };
  }
}

export async function approveBooking(bookingId: string): Promise<ActionResult<void>> {
  try {
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking.length) {
      return { success: false, error: 'Booking not found' };
    }

    // Capture the payment
    if (booking[0].stripePaymentIntentId) {
      await stripe.paymentIntents.capture(booking[0].stripePaymentIntentId);
    }

    // Update booking status
    await db
      .update(bookings)
      .set({ 
        status: 'approved',
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // TODO: Send email notification to guest

    revalidatePath('/host');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Approve booking error:', error);
    return { success: false, error: 'Failed to approve booking' };
  }
}

export async function declineBooking(bookingId: string): Promise<ActionResult<void>> {
  try {
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking.length) {
      return { success: false, error: 'Booking not found' };
    }

    // Cancel the payment intent
    if (booking[0].stripePaymentIntentId) {
      await stripe.paymentIntents.cancel(booking[0].stripePaymentIntentId);
    }

    // Update booking status
    await db
      .update(bookings)
      .set({ 
        status: 'declined',
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // TODO: Send email notification to guest

    revalidatePath('/host');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Decline booking error:', error);
    return { success: false, error: 'Failed to decline booking' };
  }
}