import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ListingCard } from "@/components/listings/ListingCard"
import { SearchBar } from "@/components/search/SearchBar"
import { Button } from "@/components/ui/Button"
import { getFeaturedListings } from "@/actions/listings"
import { APP_NAME } from "@/lib/constants"
import {
  Home,
  Shield,
  Clock,
  Globe,
  ArrowRight,
  Sparkles,
  Users,
} from "lucide-react"
import { Suspense } from "react"

function HeroSearchBar() {
  return (
    <Suspense fallback={<div className="h-12 w-full max-w-3xl bg-muted rounded-lg animate-pulse" />}>
      <SearchBar />
    </Suspense>
  )
}

export default async function HomePage() {
  const featuredListings = await getFeaturedListings()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
              <Sparkles className="h-4 w-4" />
              Curated homes for culturally-minded travelers
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Live like a local,{" "}
              <span className="text-accent">anywhere in the world</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              {APP_NAME} connects remote workers with inspiring homes for
              extended stays. No phantom listings. Quick responses. Real
              availability.
            </p>
            <div className="mt-10 flex justify-center">
              <HeroSearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="mt-3 text-muted-foreground">
              Book an inspiring home in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <Globe className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-semibold text-lg">Discover</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse curated homes in cities worldwide. Every listing shows
                real availability.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <Clock className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-semibold text-lg">Request</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Send a booking request. Hosts respond within 24 hours — no more
                waiting in limbo.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <Home className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-semibold text-lg">Stay</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Pay securely once approved, then move in and make yourself at
                home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">Featured homes</h2>
                <p className="mt-1 text-muted-foreground">
                  Inspiring spaces available now
                </p>
              </div>
              <Link href="/search">
                <Button variant="outline" size="sm">
                  View all
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing as any}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Built on trust</h2>
            <p className="mt-3 text-muted-foreground">
              Every feature designed to make you feel confident
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Verified Profiles</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  All users sign in with verified accounts. View detailed
                  profiles before approving.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">24-Hour Response</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hosts must respond within 24 hours. No more waiting weeks for
                  a reply.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Payments</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pay only after your request is approved. All payments are
                  processed securely via Stripe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">
            Ready to list your home?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Share your space with fellow remote workers and earn while you
            travel. It takes just a few minutes to get started.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/listings/new">
              <Button size="lg">
                List Your Home
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" size="lg">
                Browse Homes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}