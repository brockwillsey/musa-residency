import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { formatCurrency } from "@/lib/utils"
import { MapPin, Bed, Bath, Users } from "lucide-react"
import type { ListingWithPhotos, ListingWithHost } from "@/types"

type ListingCardProps = {
  listing: ListingWithPhotos & Partial<ListingWithHost>
}

export function ListingCard({ listing }: ListingCardProps) {
  const primaryPhoto = listing.photos?.[0]

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow group">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto.url}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <MapPin className="h-12 w-12" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="accent">
              {formatCurrency(listing.pricePerNight)}/night
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1">
            {listing.title}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {listing.city}, {listing.country}
          </p>
          <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              {listing.bedrooms}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {listing.bathrooms}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {listing.maxGuests}
            </span>
          </div>
          {listing.minStayDays > 1 && (
            <p className="text-xs text-muted-foreground mt-2">
              Min. {listing.minStayDays} nights
            </p>
          )}
        </div>
      </Card>
    </Link>
  )
}