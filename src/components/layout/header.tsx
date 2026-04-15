"use client"

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, User, LogOut, MessageCircle } from 'lucide-react'

export function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              Musa Residency
            </Link>
          </div>

          <nav className="flex items-center gap-4">
            {status === 'loading' ? (
              <div>Loading...</div>
            ) : session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}