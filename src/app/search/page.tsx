import { Suspense } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ListingCard } from "@/components/listings/ListingCard"
import { SearchBar } from "@/components/search/SearchBar"
import { EmptyState } from "@/components/ui/EmptyState"
import { searchListings } from "@/actions/listings"
import { Search } from "lucide-react"

async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<{
    location?: string
    checkIn?: string
    checkOut?: string
    guests?: string
  }>
}) {
  const params = await searchParams

  const listings = await searchListings({
    location: params.location,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    guests: params.guests ? parseInt(params.guests) : undefined,
  })

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-12 w-12" />}
        title="No homes found"
        description={
          params.location
            ? `We couldn't find any available homes matching "${params.location}". Try adjusting your search.`
            : "There are no homes available at the moment. Check back soon!"
        }
      />
    )
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-6">
        {listings.length} {listings.length === 1 ? "home" : "homes"} found
        {params.location && (
          <span>
            {" "}
            in &quot;{params.location}&quot;
          </span>
        )}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing as any} />
        ))}
      </div>
    </div>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    location?: string
    checkIn?: string
    checkOut?: string
    guests?: string
  }>
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-3xl font-bold mb-6">Browse Homes</h1>
        <div className="mb-8">
          <Suspense
            fallback={
              <div className="h-12 w-full max-w-3xl bg-muted rounded-lg animate-pulse" />
            }
          >
            <SearchBar />
          </Suspense>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-muted animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-muted animate-pulse rounded" />
                    <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}