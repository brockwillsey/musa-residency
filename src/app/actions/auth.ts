'use server';

import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { createSession, deleteSession, getUser } from '@/lib/auth';
import { signUpSchema, signInSchema, profileUpdateSchema } from '@/lib/validations';
import { sendEmailVerification } from '@/lib/email';
import { uploadFile } from '@/lib/utils';
import { redirect } from 'next/navigation';
import type { ActionResult } from '@/lib/types';

export async function signUp(formData: FormData): Promise<ActionResult> {
  try {
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      location: formData.get('location') as string,
      bio: formData.get('bio') as string || '',
      workInfo: formData.get('workInfo') as string || '',
      socialMedia: formData.get('socialMedia') as string || '',
      profileImage: formData.get('profileImage') as File | null,
    };

    const validatedData = signUpSchema.parse(data);
    
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email)
    });
    
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' };
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    // Upload profile image if provided
    let profileImageUrl = null;
    if (validatedData.profileImage && validatedData.profileImage.size > 0) {
      profileImageUrl = await uploadFile(validatedData.profileImage);
    }
    
    // Create user
    const newUser = await db.insert(users).values({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      location: validatedData.location,
      bio: validatedData.bio || null,
      workInfo: validatedData.workInfo || null,
      socialMedia: validatedData.socialMedia || null,
      profileImageUrl,
      isEmailVerified: false,
    }).returning();
    
    // Send verification email
    try {
      await sendEmailVerification(validatedData.email, validatedData.name, newUser[0].id);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the signup if email fails
    }
    
    return { success: true, data: { userId: newUser[0].id } };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return { success: false, error: error.errors[0]?.message || 'Invalid input data' };
    }
    
    console.error('Sign up error:', error);
    return { success: false, error: 'Failed to create account. Please try again.' };
  }
}

export async function signIn(formData: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  try {
    const validatedData = signInSchema.parse(formData);
    
    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email)
    });
    
    if (!user || !user.password) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
    
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Check if email is verified (allow unverified for now, just show warning)
    if (!user.isEmailVerified) {
      console.log('User email not verified:', user.email);
      // Could redirect to verification page or show warning
    }
    
    await createSession(user.id);
    
    return { success: true, data: { userId: user.id } };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return { success: false, error: error.errors[0]?.message || 'Invalid input data' };
    }
    
    console.error('Sign in error:', error);
    return { success: false, error: 'Failed to sign in. Please try again.' };
  }
}

export async function verifyEmail(token: string): Promise<ActionResult> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.emailVerificationToken, token)
    });

    if (!user) {
      return { success: false, error: 'Invalid verification token' };
    }

    if (user.emailVerificationTokenExpiry && new Date() > user.emailVerificationTokenExpiry) {
      return { success: false, error: 'Verification token has expired' };
    }

    // Update user as verified
    await db.update(users)
      .set({
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
      })
      .where(eq(users.id, user.id));

    return { success: true, data: null };
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, error: 'Failed to verify email. Please try again.' };
  }
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      redirect('/auth/signin');
    }

    const data = {
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      bio: formData.get('bio') as string || '',
      workInfo: formData.get('workInfo') as string || '',
      socialMedia: formData.get('socialMedia') as string || '',
      profileImage: formData.get('profileImage') as File | null,
    };

    const validatedData = profileUpdateSchema.parse(data);
    
    // Upload profile image if provided
    let profileImageUrl = user.profileImageUrl;
    if (validatedData.profileImage && validatedData.profileImage.size > 0) {
      profileImageUrl = await uploadFile(validatedData.profileImage);
    }
    
    // Update user
    await db.update(users)
      .set({
        name: validatedData.name,
        location: validatedData.location,
        bio: validatedData.bio || null,
        workInfo: validatedData.workInfo || null,
        socialMedia: validatedData.socialMedia || null,
        profileImageUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    
    return { success: true, data: null };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return { success: false, error: error.errors[0]?.message || 'Invalid input data' };
    }
    
    console.error('Update profile error:', error);
    return { success: false, error: 'Failed to update profile. Please try again.' };
  }
}

export async function signOut() {
  await deleteSession();
  redirect('/');
}