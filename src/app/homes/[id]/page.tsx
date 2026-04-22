import { db } from '@/db';
import { homes, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { BookingForm } from '@/components/BookingForm';
import { formatCurrency } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

interface HomePageProps {
  params: Promise<{ id: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { id } = await params;
  const auth = await getCurrentUser();

  const result = await db
    .select({
      home: homes,
      host: {
        id: users.id,
        name: users.name,
        bio: users.bio,
        location: users.location,
        profilePhotoUrl: users.profilePhotoUrl,
      },
    })
    .from(homes)
    .leftJoin(users, eq(homes.hostId, users.id))
    .where(eq(homes.id, id))
    .limit(1);

  if (result.length === 0 || !result[0].host) {
    notFound();
  }

  const { home, host } = result[0];

  const mainPhoto = home.photos[0] || '/placeholder-home.jpg';
  const additionalPhotos = home.photos.slice(1, 5);

  const isOwnHome = auth?.userId === host.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{home.title}</h1>
        <p className="text-lg text-gray-600">{home.location}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Photo Gallery */}
        <div>
          <div className="aspect-w-16 aspect-h-9 mb-4">
            <img
              src={mainPhoto}
              alt={home.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          
          {additionalPhotos.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {additionalPhotos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${home.title} photo ${index + 2}`}
                  className="w-full h-20 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>

        {/* Home Details */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold">
                {formatCurrency(parseFloat(home.pricePerNight))} / night
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <div className="text-xl font-semibold">{home.bedrooms}</div>
                <div className="text-sm text-gray-600">Bedrooms</div>
              </div>
              <div>
                <div className="text-xl font-semibold">{home.bathrooms}</div>
                <div className="text-sm text-gray-600">Bathrooms</div>
              </div>
              <div>
                <div className="text-xl font-semibold">{home.maxGuests}</div>
                <div className="text-sm text-gray-600">Max Guests</div>
              </div>
            </div>

            {home.amenities.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {home.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Host Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              {host.profilePhotoUrl ? (
                <img
                  src={host.profilePhotoUrl}
                  alt={host.name}
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />
              ) : (
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  {host.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-semibold">{host.name}</h3>
                {host.location && (
                  <p className="text-sm text-gray-600">{host.location}</p>
                )}
              </div>
            </div>
            
            {host.bio && (
              <p className="text-gray-700 text-sm">{host.bio}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Description */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">About this space</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{home.description}</p>
          </div>
        </div>

        {/* Booking Form */}
        <div>
          {auth ? (
            isOwnHome ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">This is your home.</p>
                <Link
                  href="/host/dashboard"
                  className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Manage Listing
                </Link>
              </div>
            ) : (
              <BookingForm home={home} />
            )
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">Please log in to book this home.</p>
              <Link
                href="/login"
                className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Log In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}