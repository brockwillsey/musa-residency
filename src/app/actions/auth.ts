'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { encrypt } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  location: z.string().optional(),
  bio: z.string().optional(),
  workInfo: z.string().optional(),
});

export async function loginAction(formData: FormData) {
  try {
    const { email, password } = loginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user[0]) {
      return { success: false, error: 'Invalid email or password' };
    }

    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' };
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ user: { email: user[0].email }, expires });

    (await cookies()).set('session', session, { expires, httpOnly: true });
    
    return { success: true, data: user[0] };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An error occurred during login' };
  }
}

export async function signupAction(formData: FormData) {
  try {
    const data = signupSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      location: formData.get('location'),
      bio: formData.get('bio'),
      workInfo: formData.get('workInfo'),
    });

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser[0]) {
      return { success: false, error: 'User already exists with this email' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        ...data,
        password: hashedPassword,
      })
      .returning();

    // Create session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ user: { email: newUser[0].email }, expires });

    (await cookies()).set('session', session, { expires, httpOnly: true });

    return { success: true, data: newUser[0] };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'An error occurred during signup' };
  }
}

export async function logoutAction() {
  (await cookies()).set('session', '', { expires: new Date(0) });
  redirect('/');
}