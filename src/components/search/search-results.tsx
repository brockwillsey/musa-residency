import { HomeCard } from '@/components/home/home-card';
import type { Home } from '@/types';

interface SearchResultsProps {
  homes: Home[];
}

export function SearchResults({ homes }: SearchResultsProps) {
  if (homes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No homes found
        </h3>
        <p className="text-gray-600">
          Try adjusting your search criteria or browse all available homes.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {homes.length} home{homes.length === 1 ? '' : 's'} found
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {homes.map((home) => (
          <HomeCard key={home.id} home={home} />
        ))}
      </div>
    </div>
  );
}