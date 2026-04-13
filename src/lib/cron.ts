import { db } from './db';
import { bookings, users, homes } from './db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { sendBookingStatusEmail, cancelPaymentIntent } from './email';

export async function processAutoDeclineBookings() {
  try {
    // Find bookings that should be auto-declined (pending and past auto-decline time)
    const expiredBookings = await db
      .select({
        id: bookings.id,
        stripePaymentIntentId: bookings.stripePaymentIntentId,
        guest: {
          email: users.email,
          name: users.name,
        },
        home: {
          title: homes.title,
        },
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.guestId, users.id))
      .leftJoin(homes, eq(bookings.homeId, homes.id))
      .where(
        and(
          eq(bookings.status, 'pending'),
          lt(bookings.autoDeclineAt, new Date())
        )
      );

    for (const booking of expiredBookings) {
      try {
        // Cancel payment intent if exists
        if (booking.stripePaymentIntentId) {
          await cancelPaymentIntent(booking.stripePaymentIntentId);
        }

        // Update booking status
        await db.update(bookings)
          .set({
            status: 'declined',
            hostResponseAt: new Date(),
          })
          .where(eq(bookings.id, booking.id));

        // Send notification email to guest
        if (booking.guest?.email && booking.guest?.name && booking.home?.title) {
          await sendBookingStatusEmail(
            booking.guest.email,
            booking.guest.name,
            booking.home.title,
            'declined',
            booking.id
          );
        }

        console.log(`Auto-declined booking ${booking.id}`);
      } catch (error) {
        console.error(`Failed to auto-decline booking ${booking.id}:`, error);
      }
    }

    return { success: true, processed: expiredBookings.length };
  } catch (error) {
    console.error('Auto-decline cron job failed:', error);
    return { success: false, error: error.message };
  }
}

// This would be called by a cron service like Vercel Cron, AWS EventBridge, etc.
export async function handler() {
  return await processAutoDeclineBookings();
}