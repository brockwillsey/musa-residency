import { Suspense } from 'react';
import { Header } from '@/components/ui/Header';
import { SearchForm } from '@/components/ui/SearchForm';
import { SearchResults } from './SearchResults';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface SearchPageProps {
  searchParams: Promise<{
    location?: string;
    startDate?: string;
    endDate?: string;
    maxGuests?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <SearchForm />
        </div>
        
        <Suspense 
          fallback={
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <SearchResults searchParams={params} />
        </Suspense>
      </main>
    </div>
  );
}