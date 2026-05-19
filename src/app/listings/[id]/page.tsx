import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { PhotoGallery } from "@/components/listings/PhotoGallery"
import { BookingRequestForm } from "@/components/bookings/BookingRequestForm"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { getListingById } from "@/actions/listings"
import { formatDate } from "@/lib/utils"
import {
  MapPin,
  Bed,
  Bath,
  Users,
  Wifi,
  Calendar,
  Palette,
  Shield,
} from "lucide-react"
import Link from "next/link"

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const listing = await getListingById(id)

  if (!listing || (!listing.isPublished && !listing.host)) {
    notFound()
  }

  const amenities = (listing.amenities as string[]) || []
  const creativeAmenities = (listing.creativeAmenities as string[]) || []

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{listing.title}</h1>
        <p className="text-muted-foreground flex items-center gap-1 mb-6">
          <MapPin className="h-4 w-4" />
          {listing.city}, {listing.country}
        </p>

        <PhotoGallery photos={listing.photos} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Host Info */}
            <div className="flex items-center gap-4 pb-6 border-b border-border">
              <Link href={`/users/${listing.host.id}`}>
                <Avatar
                  src={listing.host.image}
                  alt={listing.host.name || "Host"}
                  size="lg"
                />
              </Link>
              <div>
                <h2 className="font-semibold text-lg">
                  Hosted by{" "}
                  <Link
                    href={`/users/${listing.host.id}`}
                    className="hover:text-accent transition-colors"
                  >
                    {listing.host.name || "Host"}
                  </Link>
                </h2>
                {listing.host.location && (
                  <p className="text-sm text-muted-foreground">
                    {listing.host.location}
                  </p>
                )}
                {listing.host.responseRate !== null && (
                  <p className="text-sm text-muted-foreground">
                    <Shield className="inline h-3.5 w-3.5 mr-1" />
                    {listing.host.responseRate}% response rate
                  </p>
                )}
              </div>
            </div>

            {/* Quick Facts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-2 text-sm">
                <Bed className="h-5 w-5 text-muted-foreground" />
                <span>
                  {listing.bedrooms}{" "}
                  {listing.bedrooms === 1 ? "bedroom" : "bedrooms"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bath className="h-5 w-5 text-muted-foreground" />
                <span>
                  {listing.bathrooms}{" "}
                  {listing.bathrooms === 1 ? "bathroom" : "bathrooms"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>Up to {listing.maxGuests} guests</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>Min. {listing.minStayDays} nights</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-lg mb-3">About this home</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* WiFi */}
            {listing.wifiSpeed && (
              <div className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-accent" />
                <span className="text-sm">
                  WiFi: {listing.wifiSpeed}
                </span>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Creative Amenities */}
            {creativeAmenities.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Palette className="h-5 w-5 text-accent" />
                  Creative Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {creativeAmenities.map((amenity) => (
                    <Badge key={amenity} variant="accent">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* House Rules */}
            {listing.houseRules && (
              <div>
                <h3 className="font-semibold text-lg mb-3">House Rules</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {listing.houseRules}
                </p>
              </div>
            )}

            {/* Availability */}
            {listing.availability.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Availability</h3>
                <div className="space-y-2">
                  {listing.availability
                    .filter((a) => !a.isBlocked)
                    .map((avail) => (
                      <div
                        key={avail.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Calendar className="h-4 w-4 text-accent" />
                        {formatDate(avail.startDate)} —{" "}
                        {formatDate(avail.endDate)}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingRequestForm listing={listing} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}