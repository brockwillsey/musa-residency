import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import type { Home } from '@/types';

interface HomesListProps {
  homes: Home[];
}

export function HomesList({ homes }: HomesListProps) {
  if (homes.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No homes listed yet
        </h3>
        <p className="text-gray-600 mb-4">
          Start earning by listing your creative space.
        </p>
        <Link href="/host/homes/new" className="btn-primary">
          List Your First Home
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {homes.map((home) => (
        <div key={home.id} className="card">
          <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
            <img
              src={home.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'}
              alt={home.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              {home.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {home.location}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>{home.bedrooms} bed • {home.bathrooms} bath</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(parseFloat(home.pricePerNight))}/night
              </span>
            </div>
            <div className="flex space-x-2">
              <Link
                href={`/homes/${home.id}`}
                className="btn-outline flex-1 text-center"
              >
                View
              </Link>
              <button className="btn-secondary flex-1">
                Edit
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}