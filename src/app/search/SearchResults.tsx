import { db } from '@/lib/db';
import { homes, availability } from '@/lib/db/schema';
import { eq, and, ilike, gte, lte } from 'drizzle-orm';
import { HomeCard } from '@/components/ui/HomeCard';
import type { HomeWithPhotos } from '@/lib/types';

interface SearchResultsProps {
  searchParams: {
    location?: string;
    startDate?: string;
    endDate?: string;
    maxGuests?: string;
  };
}

export async function SearchResults({ searchParams }: SearchResultsProps) {
  const { location, startDate, endDate, maxGuests } = searchParams;

  // Build query conditions
  const conditions: any[] = [eq(homes.isActive, true)];
  
  if (location) {
    conditions.push(ilike(homes.location, `%${location}%`));
  }
  
  if (maxGuests) {
    const guestCount = parseInt(maxGuests);
    if (!isNaN(guestCount)) {
      conditions.push(gte(homes.maxGuests, guestCount));
    }
  }

  // Get available homes
  let availableHomeIds: string[] = [];
  if (startDate && endDate) {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    const availableRanges = await db
      .select({ homeId: availability.homeId })
      .from(availability)
      .where(
        and(
          eq(availability.isAvailable, true),
          lte(availability.startDate, startDateObj),
          gte(availability.endDate, endDateObj)
        )
      );
    
    availableHomeIds = availableRanges.map(a => a.homeId);
    
    if (availableHomeIds.length === 0) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Available Homes</h2>
          <p className="text-gray-600">
            No homes are available for the selected dates. Try different dates or locations.
          </p>
        </div>
      );
    }
  }

  // Query homes with all related data using the relations
  let homesQuery = db.query.homes.findMany({
    where: and(...conditions),
    with: {
      photos: {
        orderBy: (photos, { asc }) => [asc(photos.sortOrder)],
      },
      host: {
        columns: {
          id: true,
          name: true,
          profileImageUrl: true,
        },
      },
    },
    orderBy: (homes, { desc }) => [desc(homes.createdAt)],
  });

  const results = await homesQuery;

  // Filter by availability if dates provided
  const filteredResults = availableHomeIds.length > 0 
    ? results.filter(home => availableHomeIds.includes(home.id))
    : results;

  // Transform to HomeWithPhotos format
  const homesWithPhotos: HomeWithPhotos[] = filteredResults.map(home => ({
    id: home.id,
    hostId: home.hostId,
    title: home.title,
    description: home.description,
    location: home.location,
    maxGuests: home.maxGuests,
    pricePerNight: home.pricePerNight,
    isActive: home.isActive,
    createdAt: home.createdAt,
    updatedAt: home.updatedAt,
    photos: home.photos.map(photo => ({
      id: photo.id,
      url: photo.url,
      caption: photo.caption,
      sortOrder: photo.sortOrder || 0,
    })),
    host: {
      id: home.host.id,
      name: home.host.name,
      profileImageUrl: home.host.profileImageUrl,
    },
  }));

  if (homesWithPhotos.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Homes Found</h2>
        <p className="text-gray-600">
          Try adjusting your search criteria or browse all available homes.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {homesWithPhotos.length} {homesWithPhotos.length === 1 ? 'home' : 'homes'} found
        </h2>
        
        {(location || startDate || endDate || maxGuests) && (
          <div className="text-sm text-gray-600">
            {location && <span>in {location} </span>}
            {startDate && endDate && <span>from {startDate} to {endDate} </span>}
            {maxGuests && <span>for {maxGuests} guests</span>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {homesWithPhotos.map(home => (
          <HomeCard key={home.id} home={home} />
        ))}
      </div>
    </div>
  );
}