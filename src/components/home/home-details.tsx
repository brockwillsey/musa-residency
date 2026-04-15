import { formatCurrency } from '@/lib/utils';
import type { Home } from '@/types';

interface HomeDetailsProps {
  home: Home;
}

export function HomeDetails({ home }: HomeDetailsProps) {
  const imageUrls = home.images?.length 
    ? home.images 
    : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'];

  return (
    <div className="space-y-6">
      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="aspect-[4/3] overflow-hidden rounded-lg">
          <img
            src={imageUrls[0]}
            alt={home.title}
            className="w-full h-full object-cover"
          />
        </div>
        {imageUrls.length > 1 && (
          <div className="grid grid-cols-2 gap-4">
            {imageUrls.slice(1, 5).map((url, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={url}
                  alt={`${home.title} - Image ${index + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Title and Host Info */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {home.title}
        </h1>
        <p className="text-gray-600 mb-4">
          {home.location}
        </p>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>{home.bedrooms} bedroom{home.bedrooms > 1 ? 's' : ''}</span>
          <span>•</span>
          <span>{home.bathrooms} bathroom{home.bathrooms > 1 ? 's' : ''}</span>
          <span>•</span>
          <span>Up to {home.maxGuests} guest{home.maxGuests > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Host Profile */}
      {home.host && (
        <div className="border-b pb-6">
          <div className="flex items-center space-x-4">
            {home.host.image ? (
              <img
                src={home.host.image}
                alt={home.host.name || ''}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                {home.host.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                Hosted by {home.host.name}
              </h3>
              {home.host.location && (
                <p className="text-sm text-gray-600">{home.host.location}</p>
              )}
            </div>
          </div>
          {home.host.bio && (
            <p className="mt-4 text-gray-700">{home.host.bio}</p>
          )}
        </div>
      )}

      {/* Description */}
      <div className="border-b pb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          About this space
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap">
          {home.description}
        </p>
      </div>

      {/* Amenities */}
      {home.amenities && home.amenities.length > 0 && (
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Amenities
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {home.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-gray-700">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* House Rules */}
      {home.houseRules && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            House Rules
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {home.houseRules}
          </p>
        </div>
      )}
    </div>
  );
}