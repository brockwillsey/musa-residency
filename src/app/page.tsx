import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchForm } from '@/components/search-form';
import { db } from '@/db';
import { homes, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { HomeCard } from '@/components/home-card';

export default async function HomePage() {
  const featuredHomes = await db
    .select()
    .from(homes)
    .innerJoin(users, eq(homes.hostId, users.id))
    .where(eq(homes.isActive, true))
    .limit(6);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Home Exchange for Creative Minds
            </h1>
            <p className="text-xl mb-8">
              Connect with fellow artists and creatives worldwide. Exchange your home for authentic cultural experiences and creative inspiration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="bg-white text-primary-600 hover:bg-gray-50">
                <Link href="/search">Find a Home</Link>
              </Button>
              <Button size="lg" className="bg-primary-500 hover:bg-primary-600">
                <Link href="/host">List Your Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Find Your Perfect Creative Space
            </h2>
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Featured Homes */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Featured Homes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredHomes.map(({ homes: home, users: host }) => (
              <HomeCard key={home.id} home={{ ...home, host }} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg">
              <Link href="/search">View All Homes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">
                Set up your artist profile and list your home or creative space with photos and availability.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect & Request</h3>
              <p className="text-gray-600">
                Browse homes, connect with hosts, and send booking requests with your creative project details.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create & Inspire</h3>
              <p className="text-gray-600">
                Stay in inspiring spaces, immerse yourself in new cultures, and create meaningful art.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}