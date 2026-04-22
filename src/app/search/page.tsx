import { db } from '@/db';
import { homes } from '@/db/schema';
import { eq, ilike, gte, lte } from 'drizzle-orm';
import { HomeCard } from '@/components/HomeCard';

interface SearchPageProps {
  searchParams: Promise<{
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const { location, checkIn, checkOut, guests } = params;

  let query = db
    .select({
      id: homes.id,
      title: homes.title,
      location: homes.location,
      bedrooms: homes.bedrooms,
      bathrooms: homes.bathrooms,
      maxGuests: homes.maxGuests,
      pricePerNight: homes.pricePerNight,
      photos: homes.photos,
    })
    .from(homes)
    .where(eq(homes.isActive, true));

  // Apply filters
  if (location) {
    query = query.where(ilike(homes.location, `%${location}%`));
  }

  if (guests) {
    const guestCount = parseInt(guests);
    if (!isNaN(guestCount)) {
      query = query.where(gte(homes.maxGuests, guestCount));
    }
  }

  const searchResults = await query.limit(20);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {location ? `Homes in ${location}` : 'All Available Homes'}
        </h1>
        
        {(checkIn || checkOut || guests) && (
          <div className="text-gray-600">
            {checkIn && checkOut && (
              <span>
                {new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}
              </span>
            )}
            {guests && (
              <span className="ml-4">
                {guests} {parseInt(guests) === 1 ? 'guest' : 'guests'}
              </span>
            )}
          </div>
        )}
      </div>

      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {searchResults.map((home) => (
            <HomeCard key={home.id} home={home} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">
            No homes found matching your criteria.
          </p>
          <p className="text-gray-500">
            Try adjusting your search filters or browse all available homes.
          </p>
        </div>
      )}
    </div>
  );
}