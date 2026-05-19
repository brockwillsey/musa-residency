import Link from "next/link"
import { APP_NAME } from "@/lib/constants"
import { Home } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Home className="h-5 w-5 text-accent" />
              <span className="text-lg font-bold">{APP_NAME}</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              A curated home exchange platform connecting culturally-minded
              remote workers with inspiring spaces worldwide.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/search"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Browse Homes
                </Link>
              </li>
              <li>
                <Link
                  href="/listings/new"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  List Your Home
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/auth/signin"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}