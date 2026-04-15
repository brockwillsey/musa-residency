import { SearchForm } from '@/components/search/search-form';
import { SearchResults } from '@/components/search/search-results';
import { getHomes } from '@/app/actions/homes';

interface SearchPageProps {
  searchParams: {
    location?: string;
    startDate?: string;
    endDate?: string;
    guests?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const filters = {
    location: searchParams.location,
    startDate: searchParams.startDate,
    endDate: searchParams.endDate,
    guests: searchParams.guests ? parseInt(searchParams.guests) : undefined,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
  };

  const result = await getHomes(filters);
  const homes = result.success ? result.data : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Find Your Perfect Creative Space
        </h1>
        <SearchForm initialFilters={filters} />
      </div>
      <SearchResults homes={homes} />
    </div>
  );
}