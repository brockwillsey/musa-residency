import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const secretKey = process.env.JWT_SECRET;
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

export async function login(formData: FormData) {
  const user = { email: formData.get('email'), password: formData.get('password') };
  
  // Here you would verify the user credentials
  // This is a simplified version
  
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ user, expires });
  
  (await cookies()).set('session', session, { expires, httpOnly: true });
}

export async function logout() {
  (await cookies()).set('session', '', { expires: new Date(0) });
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.email) return null;
  
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);
    
  return user[0] || null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}