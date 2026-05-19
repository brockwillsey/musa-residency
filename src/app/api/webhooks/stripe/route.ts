import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { bookings } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const { getStripe } = await import("@/lib/stripe")
    const stripe = getStripe()

    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured")
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      )
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    const db = getDb()

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object
        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          await db
            .update(bookings)
            .set({ status: "confirmed", updatedAt: new Date() })
            .where(eq(bookings.id, bookingId))
        }
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object
        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          await db
            .update(bookings)
            .set({ status: "approved", updatedAt: new Date() })
            .where(eq(bookings.id, bookingId))
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    )
  }
}