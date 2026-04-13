import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import type { HomeWithPhotos } from '@/lib/types';

interface HomeCardProps {
  home: HomeWithPhotos;
}

export function HomeCard({ home }: HomeCardProps) {
  const primaryPhoto = home.photos.find(p => p.sortOrder === 0) || home.photos[0];

  return (
    <Link href={`/homes/${home.id}`} className="block group">
      <div className="card hover:shadow-md transition-shadow">
        <div className="aspect-[4/3] relative overflow-hidden">
          {primaryPhoto ? (
            <img
              src={primaryPhoto.url}
              alt={primaryPhoto.caption || home.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No photo available</span>
            </div>
          )}
        </div>
        
        <div className="card-body">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{home.title}</h3>
            <span className="text-lg font-bold text-primary-600 flex-shrink-0 ml-2">
              {formatCurrency(parseFloat(home.pricePerNight))}
              <span className="text-sm font-normal text-gray-500">/night</span>
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-2">{home.location}</p>
          <p className="text-gray-500 text-sm">Up to {home.maxGuests} guests</p>
          
          <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              {home.host.profileImageUrl ? (
                <img 
                  src={home.host.profileImageUrl} 
                  alt={home.host.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-gray-600">
                  {home.host.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="ml-2 text-sm text-gray-600">Hosted by {home.host.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}