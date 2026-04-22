import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface Home {
  id: string;
  title: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: string;
  photos: string[];
}

interface HomeCardProps {
  home: Home;
}

export function HomeCard({ home }: HomeCardProps) {
  const mainPhoto = home.photos[0] || '/placeholder-home.jpg';

  return (
    <Link href={`/homes/${home.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-w-16 aspect-h-9 overflow-hidden">
          <img
            src={mainPhoto}
            alt={home.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
            {home.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-2">{home.location}</p>
          
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <span>{home.bedrooms} bed</span>
            <span className="mx-1">•</span>
            <span>{home.bathrooms} bath</span>
            <span className="mx-1">•</span>
            <span>Up to {home.maxGuests} guests</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(parseFloat(home.pricePerNight))}
              <span className="text-sm font-normal text-gray-500">/night</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}