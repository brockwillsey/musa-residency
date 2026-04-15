"use server"

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { ActionResult } from '@/lib/types'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  bio: z.string().optional(),
  location: z.string().optional(),
  workInfo: z.string().optional(),
  socialMedia: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
  }).optional(),
})

export async function registerUser(
  data: z.infer<typeof registerSchema>
): Promise<ActionResult<{ userId: string }>> {
  try {
    const validatedData = registerSchema.parse(data)

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1)

    if (existingUser.length > 0) {
      return {
        success: false,
        error: 'User with this email already exists',
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        bio: validatedData.bio,
        location: validatedData.location,
        workInfo: validatedData.workInfo,
        socialMedia: validatedData.socialMedia,
      })
      .returning({ id: users.id })

    return {
      success: true,
      data: { userId: newUser[0].id },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    console.error('Registration error:', error)
    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    }
  }
}