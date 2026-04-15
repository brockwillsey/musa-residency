import { getHomes } from '@/app/actions/homes';
import { HomeCard } from '@/components/home/home-card';

export async function FeaturedHomes() {
  const result = await getHomes();
  const homes = result.success ? result.data.slice(0, 6) : [];

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Featured Creative Spaces
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover inspiring homes from our community of artists, writers, and creative professionals.
        </p>
      </div>
      
      {homes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {homes.map((home) => (
            <HomeCard key={home.id} home={home} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No homes available yet. Be the first to list yours!</p>
        </div>
      )}
    </div>
  );
}