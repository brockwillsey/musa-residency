"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { messages, bookings } from "@/lib/db/schema"
import { eq, and, or, desc } from "drizzle-orm"
import { z } from "zod"
import { revalidatePath } from "next/cache"

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

const sendMessageSchema = z.object({
  bookingId: z.string().uuid(),
  content: z.string().min(1).max(5000),
})

export async function sendMessage(
  input: z.infer<typeof sendMessageSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const parsed = sendMessageSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const db = getDb()

    // Verify user is part of this booking
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, parsed.data.bookingId),
        or(
          eq(bookings.guestId, session.user.id),
          eq(bookings.hostId, session.user.id)
        )
      ),
    })

    if (!booking) {
      return { success: false, error: "Booking not found or unauthorized" }
    }

    const [message] = await db
      .insert(messages)
      .values({
        bookingId: parsed.data.bookingId,
        senderId: session.user.id,
        content: parsed.data.content,
      })
      .returning({ id: messages.id })

    revalidatePath(`/messages/${parsed.data.bookingId}`)
    revalidatePath("/messages")

    return { success: true, data: { id: message.id } }
  } catch (error) {
    console.error("Send message error:", error)
    return { success: false, error: "Failed to send message" }
  }
}

export async function getBookingMessages(bookingId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return []

    const db = getDb()

    // Verify access
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, bookingId),
        or(
          eq(bookings.guestId, session.user.id),
          eq(bookings.hostId, session.user.id)
        )
      ),
    })

    if (!booking) return []

    return await db.query.messages.findMany({
      where: eq(messages.bookingId, bookingId),
      with: {
        sender: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: [desc(messages.createdAt)],
    })
  } catch (error) {
    console.error("Get messages error:", error)
    return []
  }
}

export async function getUserConversations() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return []

    const db = getDb()

    const userBookings = await db.query.bookings.findMany({
      where: or(
        eq(bookings.guestId, session.user.id),
        eq(bookings.hostId, session.user.id)
      ),
      with: {
        listing: {
          columns: { id: true, title: true, city: true },
        },
        guest: {
          columns: { id: true, name: true, image: true },
        },
        host: {
          columns: { id: true, name: true, image: true },
        },
        messages: {
          orderBy: (messages, { desc }) => [desc(messages.createdAt)],
          limit: 1,
          with: {
            sender: {
              columns: { id: true, name: true },
            },
          },
        },
      },
      orderBy: [desc(bookings.updatedAt)],
    })

    return userBookings
  } catch (error) {
    console.error("Get conversations error:", error)
    return []
  }
}

export async function markMessagesAsRead(bookingId: string): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const db = getDb()

    // Mark all messages from other user as read
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.bookingId, bookingId),
          eq(messages.isRead, false)
        )
      )

    revalidatePath(`/messages/${bookingId}`)
    return { success: true }
  } catch (error) {
    console.error("Mark messages read error:", error)
    return { success: false, error: "Failed to mark messages as read" }
  }
}