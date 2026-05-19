"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Search, MapPin, Calendar } from "lucide-react"

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [location, setLocation] = useState(
    searchParams.get("location") || ""
  )
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "")
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "")

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams()
    if (location) params.set("location", location)
    if (checkIn) params.set("checkIn", checkIn)
    if (checkOut) params.set("checkOut", checkOut)
    router.push(`/search?${params.toString()}`)
  }, [location, checkIn, checkOut, router])

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-3xl">
      <div className="flex-1 relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="City or country..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full h-12 pl-10 pr-4 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="w-full sm:w-40 h-12 pl-10 pr-3 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Check in"
        />
      </div>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="w-full sm:w-40 h-12 pl-10 pr-3 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Check out"
        />
      </div>
      <Button size="lg" onClick={handleSearch} className="h-12">
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </div>
  )
}