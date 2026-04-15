import { notFound } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/db';
import { homes, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { formatCurrency } from '@/lib/utils';
import { BookingForm } from '@/components/booking-form';
import { getCurrentUser } from '@/lib/auth';

interface HomePageProps {
  params: { id: string };
}

export default async function HomePage({ params }: HomePageProps) {
  const user = await getCurrentUser();
  
  const result = await db
    .select()
    .from(homes)
    .innerJoin(users, eq(homes.hostId, users.id))
    .where(eq(homes.id, params.id))
    .limit(1);

  if (!result[0]) {
    notFound();
  }

  const { homes: home, users: host } = result[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-6">
            {home.images && home.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="relative h-80 col-span-2">
                  <Image
                    src={home.images[0]}
                    alt={home.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                {home.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative h-40">
                    <Image
                      src={image}
                      alt={`${home.title} - ${index + 2}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No images available</span>
              </div>
            )}
          </div>

          {/* Home Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{home.title}</h1>
              <p className="text-lg text-gray-600">{home.location}</p>
              <div className="flex items-center space-x-6 mt-4 text-gray-600">
                <span>{home.bedrooms} bedroom{home.bedrooms !== 1 ? 's' : ''}</span>
                <span>{home.bathrooms} bathroom{home.bathrooms !== 1 ? 's' : ''}</span>
                <span>Up to {home.maxGuests} guests</span>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">About this home</h2>
              <p className="text-gray-700 leading-relaxed">{home.description}</p>
            </div>

            {home.amenities && home.amenities.length > 0 && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-3">Amenities</h2>
                <div className="grid grid-cols-2 gap-2">
                  {home.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <span className="mr-2">•</span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">Meet your host</h2>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  {host.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold">{host.name}</h3>
                  {host.location && (
                    <p className="text-gray-600">{host.location}</p>
                  )}
                  {host.workInfo && (
                    <p className="text-gray-600">{host.workInfo}</p>
                  )}
                  {host.bio && (
                    <p className="text-gray-700 mt-2">{host.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            {user && user.id !== host.id ? (
              <BookingForm home={home} />
            ) : user?.id === host.id ? (
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <p className="text-gray-600">This is your own listing</p>
              </div>
            ) : (
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <p className="text-gray-600 mb-4">Sign in to book this home</p>
                <a 
                  href="/login" 
                  className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Sign In
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}