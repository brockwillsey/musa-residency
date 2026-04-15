'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { ActionResult, User } from '@/types';

export async function getUserProfile(userId: string): Promise<ActionResult<User>> {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, data: user[0] };
  } catch (error) {
    console.error('Get user profile error:', error);
    return { success: false, error: 'Failed to get user profile' };
  }
}

export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    bio?: string;
    location?: string;
    workInfo?: string;
    socialMedia?: string;
    image?: string;
  }
): Promise<ActionResult<User>> {
  try {
    const updatedUser = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser.length) {
      return { success: false, error: 'Failed to update profile' };
    }

    revalidatePath('/profile');
    return { success: true, data: updatedUser[0] };
  } catch (error) {
    console.error('Update user profile error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}