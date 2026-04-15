'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createHomeAction } from '@/app/actions/homes';

export function NewHomeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    amenities.forEach(amenity => formData.append('amenities', amenity));

    const result = await createHomeAction(formData);

    if (result.success) {
      router.push('/host');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div>
        <Label htmlFor="title">Home Title</Label>
        <Input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Beautiful artist loft in downtown"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          placeholder="Describe your home, the neighborhood, and what makes it special for creative guests..."
          className="mt-1"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          type="text"
          required
          placeholder="Brooklyn, New York"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pricePerNight">Price per Night ($)</Label>
          <Input
            id="pricePerNight"
            name="pricePerNight"
            type="number"
            step="0.01"
            min="0"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="maxGuests">Max Guests</Label>
          <select
            id="maxGuests"
            name="maxGuests"
            required
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <option key={num} value={num}>
                {num} guest{num !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            name="bedrooms"
            type="number"
            min="0"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            name="bathrooms"
            type="number"
            step="0.5"
            min="0"
            required
            className="mt-1"
          />
        </div>
      </div>

      {/* Amenities */}
      <div>
        <Label>Amenities</Label>
        <div className="mt-2 flex gap-2">
          <Input
            type="text"
            placeholder="Add an amenity"
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
          />
          <Button type="button" onClick={addAmenity} variant="outline">
            Add
          </Button>
        </div>
        
        {amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => removeAmenity(amenity)}
                  className="ml-2 text-primary-500 hover:text-primary-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Creating listing...' : 'Create Listing'}
      </Button>
    </form>
  );
}