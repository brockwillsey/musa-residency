'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword, setAuthCookie, clearAuthCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { ActionResult } from '@/lib/utils';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  bio?: string;
  location?: string;
  workInfo?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export async function registerAction(data: RegisterData): Promise<ActionResult<{ userId: string }>> {
  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    
    if (existingUser.length > 0) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Hash password and create user
    const passwordHash = await hashPassword(data.password);
    
    const newUser = await db.insert(users).values({
      name: data.name,
      email: data.email,
      passwordHash,
      bio: data.bio,
      location: data.location,
      workInfo: data.workInfo,
    }).returning({ id: users.id });

    if (newUser.length === 0) {
      return { success: false, error: 'Failed to create account' };
    }

    // Set auth cookie and redirect
    await setAuthCookie(newUser[0].id);
    
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Failed to create account' };
  }

  redirect('/');
}

export async function loginAction(data: LoginData): Promise<ActionResult<{ userId: string }>> {
  try {
    // Find user by email
    const user = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    
    if (user.length === 0) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user[0].passwordHash);
    
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Set auth cookie and redirect
    await setAuthCookie(user[0].id);
    
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }

  redirect('/');
}

export async function logoutAction(): Promise<void> {
  await clearAuthCookie();
  redirect('/');
}