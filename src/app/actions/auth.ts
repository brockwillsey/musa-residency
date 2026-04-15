'use server';

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import type { ActionResult } from '@/types';

export async function signIn(email: string, password: string): Promise<ActionResult<void>> {
  try {
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirectTo: '/',
    });
    
    if (!result) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'Failed to sign in' };
  }
}

export async function signOut(): Promise<void> {
  await nextAuthSignOut({ redirectTo: '/' });
}

export async function signUp(
  email: string, 
  password: string, 
  name: string
): Promise<ActionResult<void>> {
  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: 'User already exists' };
    }

    // For demo purposes, we'll create user without password hashing
    // In production, hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    await db.insert(users).values({
      email,
      name,
      // Note: In a real app, store the hashed password
    });

    // Sign in the new user
    await nextAuthSignIn('credentials', {
      email,
      password,
      redirectTo: '/profile',
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: 'Failed to create account' };
  }
}