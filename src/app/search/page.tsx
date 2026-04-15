import { Suspense } from 'react';
import { SearchForm } from '@/components/search-form';
import { SearchResults } from './search-results';

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Find Your Perfect Home</h1>
      
      <div className="mb-8">
        <SearchForm />
      </div>
      
      <Suspense fallback={<div>Loading homes...</div>}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}