import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { UserMenu } from './user-menu';

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary-600">
          Musa Residency
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link href="/search" className="text-gray-600 hover:text-gray-900">
            Search Homes
          </Link>
          
          {user ? (
            <>
              <Link href="/host" className="text-gray-600 hover:text-gray-900">
                List Your Home
              </Link>
              <Link href="/bookings" className="text-gray-600 hover:text-gray-900">
                My Bookings
              </Link>
              <UserMenu user={user} />
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Log In
              </Link>
              <Link 
                href="/signup" 
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}