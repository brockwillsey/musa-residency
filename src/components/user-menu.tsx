'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User } from '@/db/schema';
import { logoutAction } from '@/app/actions/auth';

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <span>{user.name}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
          <div className="py-1">
            <Link 
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <Link 
              href="/host"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Host Dashboard
            </Link>
            <Link 
              href="/bookings"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              My Bookings
            </Link>
            <form action={logoutAction}>
              <button 
                type="submit"
                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}