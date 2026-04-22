import { SearchForm } from '@/components/SearchForm';
import { db } from '@/db';
import { homes, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { HomeCard } from '@/components/HomeCard';

export default async function HomePage() {
  const featuredHomes = await db
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
    .where(eq(homes.isActive, true))
    .limit(6);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-orange-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Creative Spaces for
              <span className="block text-primary-600">Inspiring Stays</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with artists worldwide through curated home exchanges. 
              Find inspiring spaces that fuel your creativity and cultural exploration.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Featured Homes */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Creative Spaces</h2>
          
          {featuredHomes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredHomes.map((home) => (
                <HomeCard key={home.id} home={home} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No homes available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, secure, and designed for creative professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Your Space</h3>
              <p className="text-gray-600">
                Browse curated homes and studios from fellow artists and creative professionals worldwide.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect & Book</h3>
              <p className="text-gray-600">
                Send a booking request and connect with hosts. Payment is only processed after approval.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create & Explore</h3>
              <p className="text-gray-600">
                Immerse yourself in new cultures, connect with local art scenes, and create your best work.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}