"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { bookings } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { getStripe } from "@/lib/stripe"
import { revalidatePath } from "next/cache"

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

export async function createPaymentIntent(
  bookingId: string
): Promise<ActionResult<{ clientSecret: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const db = getDb()

    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, bookingId),
        eq(bookings.guestId, session.user.id),
        eq(bookings.status, "approved")
      ),
      with: {
        listing: { columns: { title: true } },
      },
    })

    if (!booking) {
      return {
        success: false,
        error: "Booking not found or not approved yet",
      }
    }

    const stripe = getStripe()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.totalPrice,
      currency: "usd",
      metadata: {
        bookingId: booking.id,
        listingTitle: booking.listing.title,
      },
    })

    await db
      .update(bookings)
      .set({
        stripePaymentIntentId: paymentIntent.id,
        status: "payment_processing",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))

    revalidatePath(`/bookings/${bookingId}`)

    return {
      success: true,
      data: { clientSecret: paymentIntent.client_secret! },
    }
  } catch (error) {
    console.error("Create payment intent error:", error)
    return { success: false, error: "Failed to create payment" }
  }
}

export async function confirmBookingPayment(
  bookingId: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const db = getDb()

    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, bookingId),
        eq(bookings.guestId, session.user.id)
      ),
    })

    if (!booking || !booking.stripePaymentIntentId) {
      return { success: false, error: "Booking or payment not found" }
    }

    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.retrieve(
      booking.stripePaymentIntentId
    )

    if (paymentIntent.status === "succeeded") {
      await db
        .update(bookings)
        .set({ status: "confirmed", updatedAt: new Date() })
        .where(eq(bookings.id, bookingId))

      revalidatePath(`/bookings/${bookingId}`)
      revalidatePath("/dashboard")
      revalidatePath("/bookings")

      return { success: true }
    }

    return { success: false, error: "Payment not yet completed" }
  } catch (error) {
    console.error("Confirm payment error:", error)
    return { success: false, error: "Failed to confirm payment" }
  }
}