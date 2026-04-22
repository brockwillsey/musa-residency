import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { UserMenu } from './UserMenu';

export async function Header() {
  const auth = await getCurrentUser();
  let user = null;

  if (auth) {
    const result = await db.select().from(users).where(eq(users.id, auth.userId)).limit(1);
    user = result[0] || null;
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">Musa Residency</h1>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/search" className="text-gray-700 hover:text-primary-600">
              Search Homes
            </Link>
            {user && (
              <Link href="/host" className="text-gray-700 hover:text-primary-600">
                Host Your Home
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary-600"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}