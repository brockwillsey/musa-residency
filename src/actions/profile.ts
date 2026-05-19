"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { revalidatePath } from "next/cache"

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  bio: z.string().max(1000).optional(),
  location: z.string().max(255).optional(),
  occupation: z.string().max(255).optional(),
  company: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  socialLinks: z
    .object({
      instagram: z.string().optional(),
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
  image: z.string().url().optional(),
})

export async function updateProfile(
  input: z.infer<typeof updateProfileSchema>
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const parsed = updateProfileSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const db = getDb()

    await db
      .update(users)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("Update profile error:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

export async function getProfile(userId: string) {
  try {
    const db = getDb()

    return await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        location: true,
        occupation: true,
        company: true,
        socialLinks: true,
        phone: true,
        role: true,
        responseRate: true,
        totalHostings: true,
        createdAt: true,
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return null
  }
}