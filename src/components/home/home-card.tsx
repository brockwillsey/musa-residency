import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import type { Home } from '@/types';

interface HomeCardProps {
  home: Home;
}

export function HomeCard({ home }: HomeCardProps) {
  const imageUrl = home.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop';

  return (
    <Link href={`/homes/${home.id}`} className="card hover:shadow-lg transition-shadow">
      <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
        <img
          src={imageUrl}
          alt={home.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {home.title}
          </h3>
          <p className="text-sm text-gray-600">
            {home.location}
          </p>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>{home.bedrooms} bed • {home.bathrooms} bath • {home.maxGuests} guests</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {home.host?.image ? (
              <img
                src={home.host.image}
                alt={home.host.name || ''}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                {home.host?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-gray-600">{home.host?.name}</span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-gray-900">
              {formatCurrency(parseFloat(home.pricePerNight))}
            </span>
            <span className="text-sm text-gray-500">/night</span>
          </div>
        </div>
      </div>
    </Link>
  );
}