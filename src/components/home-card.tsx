import Link from 'next/link';
import Image from 'next/image';
import { Home, User } from '@/db/schema';
import { formatCurrency } from '@/lib/utils';

interface HomeCardProps {
  home: Home & { host: User };
}

export function HomeCard({ home }: HomeCardProps) {
  const mainImage = home.images?.[0] || '/placeholder-home.jpg';
  
  return (
    <Link href={`/homes/${home.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden group-hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <Image
            src={mainImage}
            alt={home.title}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
              {home.title}
            </h3>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(Number(home.pricePerNight))}/night
            </span>
          </div>
          
          <p className="text-gray-600 mb-2">{home.location}</p>
          
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <span>{home.bedrooms} bedroom{home.bedrooms !== 1 ? 's' : ''}</span>
            <span>{home.bathrooms} bathroom{home.bathrooms !== 1 ? 's' : ''}</span>
            <span>Up to {home.maxGuests} guests</span>
          </div>
          
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {home.description}
          </p>
          
          <div className="mt-3 text-xs text-gray-500">
            Hosted by {home.host.name}
          </div>
        </div>
      </div>
    </Link>
  );
}