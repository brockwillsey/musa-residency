'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db';
import { homes } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

const homeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  pricePerNight: z.string().transform(val => parseFloat(val)),
  maxGuests: z.string().transform(val => parseInt(val)),
  bedrooms: z.string().transform(val => parseInt(val)),
  bathrooms: z.string().transform(val => parseFloat(val)),
});

export async function createHomeAction(formData: FormData) {
  try {
    const user = await requireAuth();
    
    const data = homeSchema.parse({
      title: formData.get('title'),
      description: formData.get('description'),
      location: formData.get('location'),
      pricePerNight: formData.get('pricePerNight'),
      maxGuests: formData.get('maxGuests'),
      bedrooms: formData.get('bedrooms'),
      bathrooms: formData.get('bathrooms'),
    });

    const amenities = formData.getAll('amenities') as string[];

    const newHome = await db
      .insert(homes)
      .values({
        ...data,
        hostId: user.id,
        amenities: amenities.length > 0 ? amenities : null,
        images: [], // TODO: Implement image upload
      })
      .returning();

    revalidatePath('/host');
    return { success: true, data: newHome[0] };
  } catch (error) {
    console.error('Create home error:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'An error occurred while creating the listing' };
  }
}