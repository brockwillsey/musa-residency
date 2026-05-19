"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import {
  listings,
  listingPhotos,
  availability,
} from "@/lib/db/schema"
import { eq, and, or, ilike, gte, lte, sql } from "drizzle-orm"
import { z } from "zod"
import { revalidatePath } from "next/cache"

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

const createListingSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(20),
  city: z.string().min(1).max(255),
  country: z.string().min(1).max(255),
  address: z.string().optional(),
  pricePerNight: z.number().int().positive(),
  minStayDays: z.number().int().min(1).default(30),
  maxGuests: z.number().int().min(1).default(2),
  bedrooms: z.number().int().min(0).default(1),
  bathrooms: z.number().int().min(0).default(1),
  amenities: z.array(z.string()).default([]),
  creativeAmenities: z.array(z.string()).default([]),
  houseRules: z.string().optional(),
  wifiSpeed: z.string().optional(),
})

export async function createListing(
  input: z.infer<typeof createListingSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const parsed = createListingSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const db = getDb()
    const [listing] = await db
      .insert(listings)
      .values({
        hostId: session.user.id,
        ...parsed.data,
      })
      .returning({ id: listings.id })

    revalidatePath("/dashboard")
    revalidatePath("/search")

    return { success: true, data: { id: listing.id } }
  } catch (error) {
    console.error("Create listing error:", error)
    return { success: false, error: "Failed to create listing" }
  }
}

export async function updateListing(
  listingId: string,
  input: Partial<z.infer<typeof createListingSchema>>
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const db = getDb()

    const [existing] = await db
      .select({ hostId: listings.hostId })
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1)

    if (!existing || existing.hostId !== session.user.id) {
      return { success: false, error: "Listing not found or unauthorized" }
    }

    await db
      .update(listings)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(listings.id, listingId))

    revalidatePath(`/listings/${listingId}`)
    revalidatePath("/dashboard")
    revalidatePath("/search")

    return { success: true }
  } catch (error) {
    console.error("Update listing error:", error)
    return { success: false, error: "Failed to update listing" }
  }
}

export async function publishListing(
  listingId: string,
  publish: boolean
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const db = getDb()

    const [existing] = await db
      .select({ hostId: listings.hostId })
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1)

    if (!existing || existing.hostId !== session.user.id) {
      return { success: false, error: "Listing not found or unauthorized" }
    }

    await db
      .update(listings)
      .set({ isPublished: publish, updatedAt: new Date() })
      .where(eq(listings.id, listingId))

    revalidatePath(`/listings/${listingId}`)
    revalidatePath("/dashboard")
    revalidatePath("/search")

    return { success: true }
  } catch (error) {
    console.error("Publish listing error:", error)
    return { success: false, error: "Failed to update listing" }
  }
}

export async function addListingPhotos(
  listingId: string,
  photos: { url: string; caption?: string; order: number }[]
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const db = getDb()

    const [existing] = await db
      .select({ hostId: listings.hostId })
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1)

    if (!existing || existing.hostId !== session.user.id) {
      return { success: false, error: "Listing not found or unauthorized" }
    }

    if (photos.length > 0) {
      await db.insert(listingPhotos).values(
        photos.map((p) => ({
          listingId,
          url: p.url,
          caption: p.caption,
          order: p.order,
        }))
      )
    }

    revalidatePath(`/listings/${listingId}`)
    return { success: true }
  } catch (error) {
    console.error("Add photos error:", error)
    return { success: false, error: "Failed to add photos" }
  }
}

export async function deleteListingPhoto(
  photoId: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const db = getDb()

    const [photo] = await db
      .select({
        id: listingPhotos.id,
        listingId: listingPhotos.listingId,
      })
      .from(listingPhotos)
      .where(eq(listingPhotos.id, photoId))
      .limit(1)

    if (!photo) {
      return { success: false, error: "Photo not found" }
    }

    const [listing] = await db
      .select({ hostId: listings.hostId })
      .from(listings)
      .where(eq(listings.id, photo.listingId))
      .limit(1)

    if (!listing || listing.hostId !== session.user.id) {
      return { success: false, error: "Unauthorized" }
    }

    await db.delete(listingPhotos).where(eq(listingPhotos.id, photoId))

    revalidatePath(`/listings/${photo.listingId}`)
    return { success: true }
  } catch (error) {
    console.error("Delete photo error:", error)
    return { success: false, error: "Failed to delete photo" }
  }
}

export async function setAvailability(
  listingId: string,
  ranges: { startDate: string; endDate: string; isBlocked?: boolean }[]
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const db = getDb()

    const [existing] = await db
      .select({ hostId: listings.hostId })
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1)

    if (!existing || existing.hostId !== session.user.id) {
      return { success: false, error: "Listing not found or unauthorized" }
    }

    // Clear existing availability
    await db
      .delete(availability)
      .where(eq(availability.listingId, listingId))

    // Insert new availability
    if (ranges.length > 0) {
      await db.insert(availability).values(
        ranges.map((r) => ({
          listingId,
          startDate: new Date(r.startDate),
          endDate: new Date(r.endDate),
          isBlocked: r.isBlocked ?? false,
        }))
      )
    }

    revalidatePath(`/listings/${listingId}`)
    revalidatePath("/search")
    return { success: true }
  } catch (error) {
    console.error("Set availability error:", error)
    return { success: false, error: "Failed to set availability" }
  }
}

export async function searchListings(filters: {
  location?: string
  checkIn?: string
  checkOut?: string
  guests?: number
}) {
  try {
    const db = getDb()

    const conditions = [eq(listings.isPublished, true)]

    if (filters.location) {
      conditions.push(
        or(
          ilike(listings.city, `%${filters.location}%`),
          ilike(listings.country, `%${filters.location}%`)
        )!
      )
    }

    if (filters.guests) {
      conditions.push(gte(listings.maxGuests, filters.guests))
    }

    const results = await db.query.listings.findMany({
      where: and(...conditions),
      with: {
        photos: {
          orderBy: (photos, { asc }) => [asc(photos.order)],
          limit: 1,
        },
        host: {
          columns: {
            id: true,
            name: true,
            image: true,
            responseRate: true,
          },
        },
        availability: true,
      },
      orderBy: (listings, { desc }) => [desc(listings.createdAt)],
    })

    // Filter by availability dates if provided
    if (filters.checkIn && filters.checkOut) {
      const checkInDate = new Date(filters.checkIn)
      const checkOutDate = new Date(filters.checkOut)

      return results.filter((listing) => {
        if (listing.availability.length === 0) return true
        return listing.availability.some((avail) => {
          if (avail.isBlocked) return false
          return avail.startDate <= checkInDate && avail.endDate >= checkOutDate
        })
      })
    }

    return results
  } catch (error) {
    console.error("Search listings error:", error)
    return []
  }
}

export async function getListingById(id: string) {
  try {
    const db = getDb()

    const listing = await db.query.listings.findFirst({
      where: eq(listings.id, id),
      with: {
        photos: {
          orderBy: (photos, { asc }) => [asc(photos.order)],
        },
        host: {
          columns: {
            id: true,
            name: true,
            image: true,
            bio: true,
            location: true,
            responseRate: true,
            createdAt: true,
          },
        },
        availability: true,
      },
    })

    return listing || null
  } catch (error) {
    console.error("Get listing error:", error)
    return null
  }
}

export async function getHostListings(hostId: string) {
  try {
    const db = getDb()

    return await db.query.listings.findMany({
      where: eq(listings.hostId, hostId),
      with: {
        photos: {
          orderBy: (photos, { asc }) => [asc(photos.order)],
          limit: 1,
        },
      },
      orderBy: (listings, { desc }) => [desc(listings.createdAt)],
    })
  } catch (error) {
    console.error("Get host listings error:", error)
    return []
  }
}

export async function getFeaturedListings() {
  try {
    const db = getDb()

    return await db.query.listings.findMany({
      where: eq(listings.isPublished, true),
      with: {
        photos: {
          orderBy: (photos, { asc }) => [asc(photos.order)],
          limit: 1,
        },
        host: {
          columns: {
            id: true,
            name: true,
            image: true,
            responseRate: true,
          },
        },
      },
      orderBy: (listings, { desc }) => [desc(listings.createdAt)],
      limit: 6,
    })
  } catch (error) {
    console.error("Get featured listings error:", error)
    return []
  }
}

export async function deleteListing(listingId: string): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const db = getDb()

    const [existing] = await db
      .select({ hostId: listings.hostId })
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1)

    if (!existing || existing.hostId !== session.user.id) {
      return { success: false, error: "Listing not found or unauthorized" }
    }

    await db.delete(listings).where(eq(listings.id, listingId))

    revalidatePath("/dashboard")
    revalidatePath("/search")
    return { success: true }
  } catch (error) {
    console.error("Delete listing error:", error)
    return { success: false, error: "Failed to delete listing" }
  }
}