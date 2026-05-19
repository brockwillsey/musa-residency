import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { bookings, users } from "@/lib/db/schema"
import { eq, and, lt, sql } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = getDb()

    // Find all pending bookings past their response deadline
    const expiredBookings = await db
      .select({
        id: bookings.id,
        hostId: bookings.hostId,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.status, "pending"),
          lt(bookings.hostResponseDeadline, new Date())
        )
      )

    for (const booking of expiredBookings) {
      await db
        .update(bookings)
        .set({ status: "auto_declined", updatedAt: new Date() })
        .where(eq(bookings.id, booking.id))

      // Penalize host response rate
      await db
        .update(users)
        .set({
          responseRate: sql`GREATEST(0, ${users.responseRate} - 10)`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, booking.hostId))
    }

    return NextResponse.json({
      processed: expiredBookings.length,
    })
  } catch (error) {
    console.error("Auto-decline cron error:", error)
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    )
  }
}