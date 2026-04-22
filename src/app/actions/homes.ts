'use server';

import { db } from '@/db';
import { homes } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { ActionResult } from '@/lib/utils';

export async function createHomeAction(formData: FormData): Promise<ActionResult<{ homeId: string }>> {
  try {
    const auth = await getCurrentUser();
    
    if (!auth) {
      return { success: false, error: 'You must be logged in to create a listing' };
    }

    // Extract form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const bedrooms = parseInt(formData.get('bedrooms') as string);
    const bathrooms = parseInt(formData.get('bathrooms') as string);
    const maxGuests = parseInt(formData.get('maxGuests') as string);
    const pricePerNight = formData.get('pricePerNight') as string;
    const amenities = JSON.parse(formData.get('amenities') as string) as string[];

    // Process photos (in a real app, you'd upload to S3/Cloudinary)
    const photos: string[] = [];
    let photoIndex = 0;
    
    while (true) {
      const photo = formData.get(`photo-${photoIndex}`) as File;
      if (!photo) break;
      
      // For demo purposes, we'll use placeholder URLs
      // In production, upload to cloud storage and store the URLs
      photos.push(`/api/photos/${Date.now()}-${photoIndex}.jpg`);
      photoIndex++;
    }

    // Validate required fields
    if (!title || !description || !location || !pricePerNight) {
      return { success: false, error: 'Please fill in all required fields' };
    }

    const price = parseFloat(pricePerNight);
    if (isNaN(price) || price <= 0) {
      return { success: false, error: 'Invalid price' };
    }

    // Create home listing
    const newHome = await db.insert(homes).values({
      hostId: auth.userId,
      title,
      description,
      location,
      bedrooms,
      bathrooms,
      maxGuests,
      pricePerNight: price.toFixed(2),
      amenities,
      photos,
    }).returning({ id: homes.id });

    if (newHome.length === 0) {
      return { success: false, error: 'Failed to create listing' };
    }

  } catch (error) {
    console.error('Create home error:', error);
    return { success: false, error: 'Failed to create listing' };
  }

  redirect('/host/dashboard');
}