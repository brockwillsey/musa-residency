"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Search, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { searchHomes } from '@/app/actions/search'
import { formatCurrency } from '@/lib/utils'
import type { Home } from '@/lib/types'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [homes, setHomes] = useState<Home[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    setIsLoading(true)
    setHasSearched(true)

    const result = await searchHomes({
      location: searchQuery,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })

    if (result.success) {
      setHomes(result.data)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    // Load initial homes on page load
    handleSearch()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Find Your Creative Space
        </h1>
        <p className="text-gray-600">
          Discover inspiring homes and studios around the world
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Search Homes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Where do you want to stay?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Check In</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Check Out</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isLoading} className="w-full">
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for homes...</p>
          </div>
        </div>
      ) : hasSearched ? (
        homes.length === 0 ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No homes found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all available homes.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {homes.length} home{homes.length !== 1 ? 's' : ''} found
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {homes.map((home) => (
                <Link key={home.id} href={`/homes/${home.id}`}>
                  <Card className="cursor-pointer transition-shadow hover:shadow-md">
                    <div className="aspect-video bg-gray-200 rounded-t-lg">
                      {home.images && home.images[0] ? (
                        <img
                          src={home.images[0].url}
                          alt={home.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <MapPin className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-1">
                            {home.title}
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="mr-1 h-3 w-3" />
                            {home.location}
                          </CardDescription>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="mr-1 h-3 w-3" />
                          {home.maxGuests}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {home.description}
                      </p>
                      {home.amenities && home.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {home.amenities.slice(0, 3).map((amenity) => (
                            <span
                              key={amenity}
                              className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                            >
                              {amenity}
                            </span>
                          ))}
                          {home.amenities.length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                              +{home.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      {home.availability && home.availability.length > 0 && (
                        <div className="text-sm font-medium">
                          From {formatCurrency(home.availability[0].pricePerNight)}/night
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )
      ) : null}
    </div>
  )
}