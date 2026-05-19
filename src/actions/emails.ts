"use server"

import { getDb } from "@/lib/db"
import { bookings, users, listings } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function sendBookingRequestEmail(bookingId: string) {
  try {
    const { getResend, EMAIL_FROM } = await import("@/lib/email")

    const db = getDb()

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        listing: { columns: { title: true, city: true } },
        guest: { columns: { name: true, email: true } },
        host: { columns: { name: true, email: true } },
      },
    })

    if (!booking) return

    const resend = getResend()

    await resend.emails.send({
      from: EMAIL_FROM,
      to: booking.host.email,
      subject: `New booking request for ${booking.listing.title}`,
      html: `
        <h2>New Booking Request</h2>
        <p><strong>${booking.guest.name || "A guest"}</strong> has requested to book your listing <strong>${booking.listing.title}</strong> in ${booking.listing.city}.</p>
        <p><strong>Check-in:</strong> ${booking.checkIn.toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${booking.checkOut.toLocaleDateString()}</p>
        <p><strong>Guests:</strong> ${booking.guestCount}</p>
        ${booking.message ? `<p><strong>Message:</strong> ${booking.message}</p>` : ""}
        <p>You have <strong>24 hours</strong> to respond to this request.</p>
        <p><a href="${process.env.NEXTAUTH_URL}/dashboard">View in Dashboard</a></p>
      `,
    })
  } catch (error) {
    console.error("Send booking request email error:", error)
  }
}

export async function sendBookingStatusEmail(
  bookingId: string,
  status: string
) {
  try {
    const { getResend, EMAIL_FROM } = await import("@/lib/email")

    const db = getDb()

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        listing: { columns: { title: true, city: true } },
        guest: { columns: { name: true, email: true } },
        host: { columns: { name: true } },
      },
    })

    if (!booking) return

    const resend = getResend()
    const statusText =
      status === "approved"
        ? "approved! You can now proceed with payment."
        : "declined by the host."

    await resend.emails.send({
      from: EMAIL_FROM,
      to: booking.guest.email,
      subject: `Booking ${status}: ${booking.listing.title}`,
      html: `
        <h2>Booking ${status === "approved" ? "Approved" : "Declined"}</h2>
        <p>Your booking request for <strong>${booking.listing.title}</strong> in ${booking.listing.city} has been ${statusText}</p>
        ${
          status === "approved"
            ? `<p><a href="${process.env.NEXTAUTH_URL}/bookings/${bookingId}">Complete Your Booking</a></p>`
            : `<p><a href="${process.env.NEXTAUTH_URL}/search">Browse Other Listings</a></p>`
        }
      `,
    })
  } catch (error) {
    console.error("Send booking status email error:", error)
  }
}