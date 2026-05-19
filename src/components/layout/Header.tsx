"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import { Avatar } from "@/components/ui/Avatar"
import { Button } from "@/components/ui/Button"
import { APP_NAME } from "@/lib/constants"
import {
  Home,
  Search,
  PlusCircle,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react"

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-accent" />
            <span className="text-lg font-bold text-foreground">
              {APP_NAME}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/search"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Search className="h-4 w-4" />
              Browse Homes
            </Link>
            {status === "authenticated" && (
              <>
                <Link
                  href="/listings/new"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  List Your Home
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/messages"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </Link>
              </>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {status === "authenticated" && session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-border p-1 pr-3 hover:shadow-sm transition-shadow"
                >
                  <Avatar
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    size="sm"
                  />
                  <span className="text-sm font-medium">
                    {session.user.name?.split(" ")[0]}
                  </span>
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg py-1 z-50">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/bookings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Home className="h-4 w-4" />
                        My Bookings
                      </Link>
                      <hr className="my-1 border-border" />
                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          signOut()
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : status === "loading" ? (
              <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
            ) : (
              <Link href="/auth/signin">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            <Link
              href="/search"
              className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="h-4 w-4" />
              Browse Homes
            </Link>
            {status === "authenticated" ? (
              <>
                <Link
                  href="/listings/new"
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PlusCircle className="h-4 w-4" />
                  List Your Home
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/messages"
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    signOut()
                  }}
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-destructive hover:bg-muted rounded-lg w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}