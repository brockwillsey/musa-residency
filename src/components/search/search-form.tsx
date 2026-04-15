'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SearchFilters } from '@/types';

interface SearchFormProps {
  initialFilters?: SearchFilters;
}

export function SearchForm({ initialFilters = {} }: SearchFormProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value || undefined,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      }
    });
    
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="form-group">
          <label htmlFor="location" className="form-label">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Where to?"
            className="input"
            value={filters.location || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="startDate" className="form-label">
            Check-in
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            className="input"
            value={filters.startDate || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="endDate" className="form-label">
            Check-out
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            className="input"
            value={filters.endDate || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="guests" className="form-label">
            Guests
          </label>
          <select
            id="guests"
            name="guests"
            className="input"
            value={filters.guests || ''}
            onChange={handleChange}
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full">
            Search
          </button>
        </div>
      </div>
    </form>
  );
}