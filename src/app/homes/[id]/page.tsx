import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { availability } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { Header } from '@/components/ui/Header';
import { BookingForm } from './BookingForm';
import { formatCurrency } from '@/lib/utils';

interface HomeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function HomeDetailPage({ params }: HomeDetailPageProps) {
  const { id } = await params;
  
  // Get home with host and photos using relations
  const home = await db.query.homes.findFirst({
    where: (homes, { eq, and }) => and(eq(homes.id, id), eq(homes.isActive, true)),
    with: {
      host: {
        columns: {
          id: true,
          name: true,
          email: true,
          bio: true,
          location: true,
          workInfo: true,
          profileImageUrl: true,
        },
      },
      photos: {
        orderBy: (photos, { asc }) => [asc(photos.sortOrder)],
      },
    },
  });

  if (!home) {
    notFound();
  }

  // Get availability
  const availabilityData = await db
    .select()
    .from(availability)
    .where(
      and(
        eq(availability.homeId, id),
        eq(availability.isAvailable, true),
        gte(availability.endDate, new Date())
      )
    )
    .orderBy(availability.startDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photo Gallery */}
            <div className="card">
              {home.photos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="aspect-[4/3] overflow-hidden rounded-lg">
                    <img
                      src={home.photos[0].url}
                      alt={home.photos[0].caption || home.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {home.photos.length > 1 && (
                    <div className="grid grid-cols-2 gap-2">
                      {home.photos.slice(1, 5).map((photo, index) => (
                        <div key={photo.id} className="aspect-square overflow-hidden rounded-lg">
                          <img
                            src={photo.url}
                            alt={photo.caption || `Photo ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center rounded-lg">
                  <span className="text-gray-400">No photos available</span>
                </div>
              )}
            </div>

            {/* Home Details */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{home.title}</h1>
                    <p className="text-lg text-gray-600">{home.location}</p>
                    <p className="text-gray-500">Up to {home.maxGuests} guests</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">
                      {formatCurrency(parseFloat(home.pricePerNight))}
                      <span className="text-base font-normal text-gray-500">/night</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About this place</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {home.description}
                </p>
              </div>
            </div>

            {/* Host Info */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Meet your host</h2>
              </div>
              
              <div className="card-body">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    {home.host.profileImageUrl ? (
                      <img 
                        src={home.host.profileImageUrl} 
                        alt={home.host.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-medium text-gray-600">
                        {home.host.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{home.host.name}</h3>
                    {home.host.location && (
                      <p className="text-gray-600">{home.host.location}</p>
                    )}
                    {home.host.workInfo && (
                      <p className="text-gray-600">{home.host.workInfo}</p>
                    )}
                    {home.host.bio && (
                      <p className="text-gray-700 mt-2 leading-relaxed">
                        {home.host.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingForm 
                home={home}
                availability={availabilityData}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}