"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { bookings, listings, users } from "@/lib/db/schema"
import { eq, and, or, desc } from "drizzle-orm"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { getResponseDeadline, calculateNights } from "@/lib/utils"
import { sendBookingRequestEmail, sendBookingStatusEmail } from "@/actions/emails"

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

const bookingRequestSchema = z.object({
  listingId: z.string().uuid(),
  checkIn: z.string(),
  checkOut: z.string(),
  guestCount: z.number().int().min(1),
  message: z.string().optional(),
})

export async function createBookingRequest(
  input: z.infer<typeof bookingRequestSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const parsed = bookingRequestSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const db = getDb()

    const listing = await db.query.listings.findFirst({
      where: and(
        eq(listings.id, parsed.data.listingId),
        eq(listings.isPublished, true)
      ),
      with: {
        host: {
          columns: { id: true, name: true, email: true },
        },
      },
    })

    if (!listing) {
      return { success: false, error: "Listing not found" }
    }

    if (listing.hostId === session.user.id) {
      return { success: false, error: "Cannot book your own listing" }
    }

    const checkInDate = new Date(parsed.data.checkIn)
    const checkOutDate = new Date(parsed.data.checkOut)
    const nights = calculateNights(checkInDate, checkOutDate)

    if (nights < listing.minStayDays) {
      return {
        success: false,
        error: `Minimum stay is ${listing.minStayDays} nights`,
      }
    }

    if (parsed.data.guestCount > listing.maxGuests) {
      return {
        success: false,
        error: `Maximum ${listing.maxGuests} guests allowed`,
      }
    }

    const totalPrice = nights * listing.pricePerNight

    const [booking] = await db
      .insert(bookings)
      .values({
        listingId: listing.id,
        guestId: session.user.id,
        hostId: listing.hostId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        guestCount: parsed.data.guestCount,
        message: parsed.data.message,
        status: "pending",
        hostResponseDeadline: getResponseDeadline(),
      })
      .returning({ id: bookings.id })

    // Send notification email to host
    try {
      await sendBookingRequestEmail(booking.id)
    } catch (emailErr) {
      console.error("Failed to send booking email:", emailErr)
    }

    revalidatePath("/dashboard")
    revalidatePath("/bookings")

    return { success: true, data: { id: booking.id } }
  } catch (error) {
    console.error("Create booking error:", error)
    return { success: false, error: "Failed to create booking request" }
  }
}

export async function respondToBooking(
  bookingId: string,
  action: "approve" | "decline"
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
        eq(bookings.hostId, session.user.id),
        eq(bookings.status, "pending")
      ),
    })

    if (!booking) {
      return { success: false, error: "Booking not found or already responded" }
    }

    const newStatus = action === "approve" ? "approved" : "declined"

    await db
      .update(bookings)
      .set({
        status: newStatus,
        respondedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))

    // Send status update email
    try {
      await sendBookingStatusEmail(bookingId, newStatus)
    } catch (emailErr) {
      console.error("Failed to send status email:", emailErr)
    }

    revalidatePath("/dashboard")
    revalidatePath(`/bookings/${bookingId}`)
    revalidatePath("/bookings")

    return { success: true }
  } catch (error) {
    console.error("Respond to booking error:", error)
    return { success: false, error: "Failed to respond to booking" }
  }
}

export async function getBookingById(bookingId: string) {
  try {
    const db = getDb()

    return await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        listing: {
          with: {
            photos: {
              orderBy: (photos, { asc }) => [asc(photos.order)],
              limit: 1,
            },
          },
        },
        guest: {
          columns: {
            id: true,
            name: true,
            image: true,
            bio: true,
            location: true,
            occupation: true,
          },
        },
        host: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Get booking error:", error)
    return null
  }
}

export async function getGuestBookings(guestId: string) {
  try {
    const db = getDb()

    return await db.query.bookings.findMany({
      where: eq(bookings.guestId, guestId),
      with: {
        listing: {
          with: {
            photos: {
              orderBy: (photos, { asc }) => [asc(photos.order)],
              limit: 1,
            },
          },
        },
        host: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: [desc(bookings.createdAt)],
    })
  } catch (error) {
    console.error("Get guest bookings error:", error)
    return []
  }
}

export async function getHostBookings(hostId: string) {
  try {
    const db = getDb()

    return await db.query.bookings.findMany({
      where: eq(bookings.hostId, hostId),
      with: {
        listing: {
          with: {
            photos: {
              orderBy: (photos, { asc }) => [asc(photos.order)],
              limit: 1,
            },
          },
        },
        guest: {
          columns: {
            id: true,
            name: true,
            image: true,
            bio: true,
            location: true,
            occupation: true,
          },
        },
      },
      orderBy: [desc(bookings.createdAt)],
    })
  } catch (error) {
    console.error("Get host bookings error:", error)
    return []
  }
}

export async function cancelBooking(bookingId: string): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const db = getDb()

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    })

    if (!booking) {
      return { success: false, error: "Booking not found" }
    }

    if (
      booking.guestId !== session.user.id &&
      booking.hostId !== session.user.id
    ) {
      return { success: false, error: "Unauthorized" }
    }

    if (["completed", "cancelled"].includes(booking.status)) {
      return { success: false, error: "Cannot cancel this booking" }
    }

    await db
      .update(bookings)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(bookings.id, bookingId))

    revalidatePath("/dashboard")
    revalidatePath(`/bookings/${bookingId}`)
    revalidatePath("/bookings")

    return { success: true }
  } catch (error) {
    console.error("Cancel booking error:", error)
    return { success: false, error: "Failed to cancel booking" }
  }
}