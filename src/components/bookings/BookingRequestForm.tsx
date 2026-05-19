"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { formatCurrency, calculateNights } from "@/lib/utils"
import { createBookingRequest } from "@/actions/bookings"
import toast from "react-hot-toast"
import type { Listing } from "@/types"

interface BookingRequestFormProps {
  listing: Listing
}

export function BookingRequestForm({ listing }: BookingRequestFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guestCount, setGuestCount] = useState(1)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const nights =
    checkIn && checkOut
      ? calculateNights(new Date(checkIn), new Date(checkOut))
      : 0
  const totalPrice = nights * listing.pricePerNight
  const isValid =
    nights >= listing.minStayDays && guestCount <= listing.maxGuests

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!session?.user) {
      router.push("/auth/signin")
      return
    }
    if (!isValid) return

    setLoading(true)
    try {
      const result = await createBookingRequest({
        listingId: listing.id,
        checkIn,
        checkOut,
        guestCount,
        message: message || undefined,
      })
      if (result.success) {
        toast.success("Booking request sent! The host has 24 hours to respond.")
        router.push(`/bookings/${result.data?.id}`)
      } else {
        toast.error(result.error || "Failed to create booking request")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const isOwnListing = session?.user?.id === listing.hostId

  return (
    <Card>
      <CardHeader>
        <div className="text-2xl font-bold">
          {formatCurrency(listing.pricePerNight)}
          <span className="text-base font-normal text-muted-foreground">
            /night
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {isOwnListing ? (
          <p className="text-sm text-muted-foreground">
            This is your listing. You cannot book your own home.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Check In
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Check Out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split("T")[0]}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Guests</label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Array.from({ length: listing.maxGuests }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            </div>

            <Textarea
              id="message"
              label="Message to Host (optional)"
              placeholder="Introduce yourself, share your plans..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />

            {nights > 0 && (
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {formatCurrency(listing.pricePerNight)} × {nights} nights
                  </span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            )}

            {nights > 0 && nights < listing.minStayDays && (
              <p className="text-sm text-destructive">
                Minimum stay is {listing.minStayDays} nights
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              disabled={!isValid || nights === 0}
            >
              Request to Book
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You won&apos;t be charged until the host approves your request
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}