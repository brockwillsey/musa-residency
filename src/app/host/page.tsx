import { requireAuth } from '@/lib/auth';
import { db } from '@/db';
import { homes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HomeCard } from '@/components/home-card';

export default async function HostPage() {
  const user = await requireAuth();
  
  const userHomes = await db
    .select()
    .from(homes)
    .where(eq(homes.hostId, user.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
        <Button>
          <Link href="/host/new">List New Home</Link>
        </Button>
      </div>

      {userHomes.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Welcome to hosting!
          </h2>
          <p className="text-gray-600 mb-6">
            Start by listing your first home to connect with creative travelers worldwide.
          </p>
          <Button size="lg">
            <Link href="/host/new">List Your Home</Link>
          </Button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-6">Your Listings ({userHomes.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userHomes.map((home) => (
              <div key={home.id} className="relative">
                <HomeCard home={{ ...home, host: user }} />
                <div className="absolute top-4 right-4">
                  <Link 
                    href={`/host/edit/${home.id}`}
                    className="bg-white px-3 py-1 rounded-lg shadow text-sm hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}