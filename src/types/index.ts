import type { InferSelectModel, InferInsertModel } from "drizzle-orm"
import type {
  users,
  listings,
  listingPhotos,
  availability,
  bookings,
  messages,
} from "@/lib/db/schema"

// ─── Select Types (read from DB) ────────────────────────────

export type User = InferSelectModel<typeof users>
export type Listing = InferSelectModel<typeof listings>
export type ListingPhoto = InferSelectModel<typeof listingPhotos>
export type Availability = InferSelectModel<typeof availability>
export type Booking = InferSelectModel<typeof bookings>
export type Message = InferSelectModel<typeof messages>

// ─── Insert Types (write to DB) ──────────────────────────────

export type NewUser = InferInsertModel<typeof users>
export type NewListing = InferInsertModel<typeof listings>
export type NewListingPhoto = InferInsertModel<typeof listingPhotos>
export type NewAvailability = InferInsertModel<typeof availability>
export type NewBooking = InferInsertModel<typeof bookings>
export type NewMessage = InferInsertModel<typeof messages>

// ─── Composite Types ────────────────────────────────────────

export type ListingWithPhotos = Listing & {
  photos: ListingPhoto[]
}

export type ListingWithHost = Listing & {
  host: Pick<User, "id" | "name" | "image" | "bio" | "location" | "responseRate">
}

export type ListingFull = Listing & {
  host: Pick<User, "id" | "name" | "image" | "bio" | "location" | "responseRate">
  photos: ListingPhoto[]
  availability: Availability[]
}

export type BookingWithDetails = Booking & {
  listing: ListingWithPhotos
  guest: Pick<User, "id" | "name" | "image" | "bio" | "location" | "occupation">
  host: Pick<User, "id" | "name" | "image">
}

export type MessageWithSender = Message & {
  sender: Pick<User, "id" | "name" | "image">
}

// ─── Search & Filter Types ──────────────────────────────────

export type SearchFilters = {
  city?: string
  country?: string
  checkIn?: string
  checkOut?: string
  minPrice?: number
  maxPrice?: number
  guests?: number
  minStay?: number
}

export type BookingStatus =
  | "pending"
  | "approved"
  | "declined"
  | "auto_declined"
  | "payment_processing"
  | "confirmed"
  | "cancelled"
  | "completed"

// ─── NextAuth Extensions ────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
  }
}