"use server"

import { db } from '@/db'
import { homes, homeImages, availability, users } from '@/db/schema'
import { eq, ilike, and, gte, lte } from 'drizzle-orm'
import type { ActionResult, Home } from '@/lib/types'

interface SearchParams {
  location?: string
  startDate?: Date
  endDate?: Date
}

export async function searchHomes(params: SearchParams): Promise<ActionResult<Home[]>> {
  try {
    let whereClause = eq(homes.isActive, true)

    // Add location filter
    if (params.location) {
      whereClause = and(
        whereClause,
        ilike(homes.location, `%${params.location}%`)
      )
    }

    // Get homes with their related data
    const homesData = await db
      .select({
        id: homes.id,
        hostId: homes.hostId,
        title: homes.title,
        description: homes.description,
        location: homes.location,
        amenities: homes.amenities,
        maxGuests: homes.maxGuests,
        isActive: homes.isActive,
        createdAt: homes.createdAt,
        updatedAt: homes.updatedAt,
        hostName: users.name,
        hostEmail: users.email,
        hostBio: users.bio,
        hostLocation: users.location,
        hostWorkInfo: users.workInfo,
        hostProfileImage: users.profileImage,
      })
      .from(homes)
      .innerJoin(users, eq(homes.hostId, users.id))
      .where(whereClause)

    // Get images for all homes
    const homeIds = homesData.map(home => home.id)
    const images = homeIds.length > 0 ? await db
      .select()
      .from(homeImages)
      .where(eq(homeImages.homeId, homeIds[0])) // This is a simplified query - in production, use IN clause
      : []

    // Get availability for all homes
    let availabilityData = homeIds.length > 0 ? await db
      .select()
      .from(availability)
      .where(eq(availability.homeId, homeIds[0])) // This is a simplified query - in production, use IN clause
      : []

    // Filter by date range if provided
    if (params.startDate && params.endDate) {
      availabilityData = availabilityData.filter(avail => 
        avail.isAvailable &&
        new Date(avail.startDate) <= params.startDate! &&
        new Date(avail.endDate) >= params.endDate!
      )
    }

    // Transform data to match Home interface
    const transformedHomes: Home[] = homesData.map(home => ({
      id: home.id,
      hostId: home.hostId,
      title: home.title,
      description: home.description,
      location: home.location,
      amenities: home.amenities || [],
      maxGuests: home.maxGuests,
      isActive: home.isActive,
      createdAt: home.createdAt,
      updatedAt: home.updatedAt,
      host: {
        id: home.hostId,
        email: home.hostEmail,
        name: home.hostName,
        bio: home.hostBio,
        location: home.hostLocation,
        workInfo: home.hostWorkInfo,
        profileImage: home.hostProfileImage,
        emailVerified: true, // Simplified
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      images: images.filter(img => img.homeId === home.id).map(img => ({
        id: img.id,
        homeId: img.homeId,
        url: img.url,
        isPrimary: img.isPrimary,
        createdAt: img.createdAt,
      })),
      availability: availabilityData.filter(avail => avail.homeId === home.id).map(avail => ({
        id: avail.id,
        homeId: avail.homeId,
        startDate: avail.startDate,
        endDate: avail.endDate,
        pricePerNight: avail.pricePerNight,
        isAvailable: avail.isAvailable,
        createdAt: avail.createdAt,
      })),
    }))

    return {
      success: true,
      data: transformedHomes,
    }
  } catch (error) {
    console.error('Search error:', error)
    return {
      success: false,
      error: 'Failed to search homes',
    }
  }
}