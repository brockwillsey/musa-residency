import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

const secretKey = process.env.JWT_SECRET!;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function getUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  
  if (!session) return null;
  
  try {
    const payload = await decrypt(session);
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId)
    });
    return user || null;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, expiresAt });
  
  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}