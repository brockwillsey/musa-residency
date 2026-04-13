'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SearchForm() {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxGuests, setMaxGuests] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (maxGuests) params.set('maxGuests', maxGuests);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where do you want to go?"
            className="form-input"
          />
        </div>
        
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            Check-in
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-input"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
            Check-out
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-input"
            min={startDate || new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div>
          <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-700 mb-2">
            Guests
          </label>
          <select
            id="maxGuests"
            value={maxGuests}
            onChange={(e) => setMaxGuests(e.target.value)}
            className="form-input"
          >
            <option value="">Any</option>
            <option value="1">1 guest</option>
            <option value="2">2 guests</option>
            <option value="3">3 guests</option>
            <option value="4">4 guests</option>
            <option value="5">5+ guests</option>
          </select>
        </div>
      </div>
      
      <div className="mt-6">
        <button type="submit" className="btn-primary w-full md:w-auto">
          Search Homes
        </button>
      </div>
    </form>
  );
}