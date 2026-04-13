import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { UserMenu } from './UserMenu';

export async function Header() {
  const user = await getUser();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Musa Residency
            </Link>
            
            {user && (
              <nav className="hidden md:flex space-x-6">
                <Link href="/search" className="text-gray-600 hover:text-gray-900">
                  Browse Homes
                </Link>
                <Link href="/host/homes" className="text-gray-600 hover:text-gray-900">
                  My Listings
                </Link>
                <Link href="/bookings" className="text-gray-600 hover:text-gray-900">
                  My Bookings
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/host/homes/new" className="btn-primary">
                  List Your Home
                </Link>
                <UserMenu user={user} />
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}