'use server';

import { db } from '@/lib/db';
import { homes, users, availability } from '@/lib/db/schema';
import { eq, and, gte, lte, like, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { ActionResult, Home, SearchFilters } from '@/types';

export async function getHomes(filters: SearchFilters = {}): Promise<ActionResult<Home[]>> {
  try {
    let query = db
      .select({
        id: homes.id,
        hostId: homes.hostId,
        title: homes.title,
        description: homes.description,
        location: homes.location,
        address: homes.address,
        bedrooms: homes.bedrooms,
        bathrooms: homes.bathrooms,
        maxGuests: homes.maxGuests,
        pricePerNight: homes.pricePerNight,
        images: homes.images,
        amenities: homes.amenities,
        houseRules: homes.houseRules,
        isActive: homes.isActive,
        createdAt: homes.createdAt,
        updatedAt: homes.updatedAt,
        host: {
          id: users.id,
          name: users.name,
          image: users.image,
          location: users.location,
        },
      })
      .from(homes)
      .leftJoin(users, eq(homes.hostId, users.id))
      .where(eq(homes.isActive, true))
      .orderBy(desc(homes.createdAt));

    // Apply filters
    const conditions = [eq(homes.isActive, true)];

    if (filters.location) {
      conditions.push(like(homes.location, `%${filters.location}%`));
    }

    if (filters.guests && filters.guests > 0) {
      conditions.push(gte(homes.maxGuests, filters.guests));
    }

    if (filters.minPrice) {
      conditions.push(gte(homes.pricePerNight, filters.minPrice.toString()));
    }

    if (filters.maxPrice) {
      conditions.push(lte(homes.pricePerNight, filters.maxPrice.toString()));
    }

    const result = await query;
    
    return { success: true, data: result as Home[] };
  } catch (error) {
    console.error('Get homes error:', error);
    return { success: false, error: 'Failed to fetch homes' };
  }
}

export async function getHomeById(homeId: string): Promise<ActionResult<Home>> {
  try {
    const result = await db
      .select({
        id: homes.id,
        hostId: homes.hostId,
        title: homes.title,
        description: homes.description,
        location: homes.location,
        address: homes.address,
        bedrooms: homes.bedrooms,
        bathrooms: homes.bathrooms,
        maxGuests: homes.maxGuests,
        pricePerNight: homes.pricePerNight,
        images: homes.images,
        amenities: homes.amenities,
        houseRules: homes.houseRules,
        isActive: homes.isActive,
        createdAt: homes.createdAt,
        updatedAt: homes.updatedAt,
        host: {
          id: users.id,
          name: users.name,
          image: users.image,
          location: users.location,
          bio: users.bio,
        },
      })
      .from(homes)
      .leftJoin(users, eq(homes.hostId, users.id))
      .where(eq(homes.id, homeId))
      .limit(1);

    if (!result.length) {
      return { success: false, error: 'Home not found' };
    }

    return { success: true, data: result[0] as Home };
  } catch (error) {
    console.error('Get home by id error:', error);
    return { success: false, error: 'Failed to fetch home' };
  }
}

export async function getUserHomes(userId: string): Promise<ActionResult<Home[]>> {
  try {
    const result = await db
      .select()
      .from(homes)
      .where(eq(homes.hostId, userId))
      .orderBy(desc(homes.createdAt));

    return { success: true, data: result };
  } catch (error) {
    console.error('Get user homes error:', error);
    return { success: false, error: 'Failed to fetch your homes' };
  }
}

export async function createHome(data: {
  hostId: string;
  title: string;
  description: string;
  location: string;
  address?: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  images?: string[];
  amenities?: string[];
  houseRules?: string;
}): Promise<ActionResult<Home>> {
  try {
    const newHome = await db
      .insert(homes)
      .values({
        ...data,
        pricePerNight: data.pricePerNight.toString(),
      })
      .returning();

    if (!newHome.length) {
      return { success: false, error: 'Failed to create home' };
    }

    revalidatePath('/host');
    return { success: true, data: newHome[0] };
  } catch (error) {
    console.error('Create home error:', error);
    return { success: false, error: 'Failed to create home listing' };
  }
}

export async function updateHome(
  homeId: string,
  data: Partial<{
    title: string;
    description: string;
    location: string;
    address: string;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    pricePerNight: number;
    images: string[];
    amenities: string[];
    houseRules: string;
    isActive: boolean;
  }>
): Promise<ActionResult<Home>> {
  try {
    const updatedData = { ...data };
    if (data.pricePerNight) {
      updatedData.pricePerNight = data.pricePerNight.toString() as any;
    }

    const updatedHome = await db
      .update(homes)
      .set({
        ...updatedData,
        updatedAt: new Date(),
      })
      .where(eq(homes.id, homeId))
      .returning();

    if (!updatedHome.length) {
      return { success: false, error: 'Failed to update home' };
    }

    revalidatePath('/host');
    return { success: true, data: updatedHome[0] };
  } catch (error) {
    console.error('Update home error:', error);
    return { success: false, error: 'Failed to update home listing' };
  }
}