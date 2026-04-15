'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <Input
            type="text"
            placeholder="Where to?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check In
          </label>
          <Input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check Out
          </label>
          <Input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <option key={num} value={num}>
                {num} guest{num !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mt-4">
        <Button type="submit" size="lg" className="w-full md:w-auto">
          Search
        </Button>
      </div>
    </form>
  );
}