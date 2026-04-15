import { db } from '@/db';
import { homes, users, availability } from '@/db/schema';
import { eq, and, gte, lte, ilike } from 'drizzle-orm';
import { HomeCard } from '@/components/home-card';

interface SearchResultsProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function SearchResults({ searchParams }: SearchResultsProps) {
  const { location, checkIn, checkOut, guests } = searchParams;
  
  let query = db
    .select()
    .from(homes)
    .innerJoin(users, eq(homes.hostId, users.id))
    .where(eq(homes.isActive, true));

  // Add location filter
  if (location && typeof location === 'string') {
    query = query.where(ilike(homes.location, `%${location}%`));
  }

  // Add guest capacity filter
  if (guests && typeof guests === 'string') {
    const guestCount = parseInt(guests);
    if (!isNaN(guestCount)) {
      query = query.where(gte(homes.maxGuests, guestCount));
    }
  }

  const results = await query.limit(20);

  // If dates are provided, filter by availability
  if (checkIn && checkOut && typeof checkIn === 'string' && typeof checkOut === 'string') {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Get homes with available slots during the requested period
    const availableHomes = await db
      .select({ homeId: availability.homeId })
      .from(availability)
      .where(
        and(
          lte(availability.startDate, checkInDate),
          gte(availability.endDate, checkOutDate),
          eq(availability.isBooked, false)
        )
      );
    
    const availableHomeIds = availableHomes.map(a => a.homeId);
    const filteredResults = results.filter(result => 
      availableHomeIds.includes(result.homes.id)
    );
    
    return (
      <div>
        <p className="text-gray-600 mb-6">
          Found {filteredResults.length} available homes for {location || 'your search'}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map(({ homes: home, users: host }) => (
            <HomeCard key={home.id} home={{ ...home, host }} />
          ))}
        </div>
        
        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No homes available for your selected dates.</p>
            <p className="text-gray-500">Try different dates or browse all homes below.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-600 mb-6">
        Found {results.length} homes for {location || 'your search'}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map(({ homes: home, users: host }) => (
          <HomeCard key={home.id} home={{ ...home, host }} />
        ))}
      </div>
      
      {results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No homes found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}