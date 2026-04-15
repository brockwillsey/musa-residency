'use client';

import { useState } from 'react';
import { createHome } from '@/app/actions/homes';
import { useRouter } from 'next/navigation';

interface CreateHomeFormProps {
  userId: string;
}

export function CreateHomeForm({ userId }: CreateHomeFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    pricePerNight: 50,
    amenities: [] as string[],
    houseRules: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const commonAmenities = [
    'WiFi',
    'Kitchen',
    'Parking',
    'Air conditioning',
    'Heating',
    'Washing machine',
    'TV',
    'Workspace',
    'Art supplies',
    'Natural light',
    'Quiet area',
    'Garden/Balcony',
  ];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  function handleAmenityToggle(amenity: string) {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await createHome({
      ...formData,
      hostId: userId,
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560448204-61ef9b33c7de?w=800&h=600&fit=crop',
      ],
    });

    if (!result.success) {
      setError(result.error);
    } else {
      router.push('/host');
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Basic Information
        </h2>
        
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="input"
            placeholder="e.g., Creative Loft in Arts District"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            className="textarea"
            rows={6}
            placeholder="Describe your space, what makes it special for creative work, and what guests can expect..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              className="input"
              placeholder="e.g., Brooklyn, NY"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Address (optional)
            </label>
            <input
              id="address"
              name="address"
              type="text"
              className="input"
              placeholder="Full address (will be shown after booking)"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Property Details
        </h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="form-group">
            <label htmlFor="bedrooms" className="form-label">
              Bedrooms *
            </label>
            <select
              id="bedrooms"
              name="bedrooms"
              className="input"
              value={formData.bedrooms}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="bathrooms" className="form-label">
              Bathrooms *
            </label>
            <select
              id="bathrooms"
              name="bathrooms"
              className="input"
              value={formData.bathrooms}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="maxGuests" className="form-label">
              Max Guests *
            </label>
            <select
              id="maxGuests"
              name="maxGuests"
              className="input"
              value={formData.maxGuests}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="pricePerNight" className="form-label">
            Price per night (USD) *
          </label>
          <input
            id="pricePerNight"
            name="pricePerNight"
            type="number"
            min="1"
            required
            className="input"
            value={formData.pricePerNight}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Amenities
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {commonAmenities.map((amenity) => (
            <label key={amenity} className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={formData.amenities.includes(amenity)}
                onChange={() => handleAmenityToggle(amenity)}
              />
              <span className="text-sm text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* House Rules */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          House Rules
        </h2>
        
        <div className="form-group">
          <label htmlFor="houseRules" className="form-label">
            House Rules (optional)
          </label>
          <textarea
            id="houseRules"
            name="houseRules"
            className="textarea"
            rows={4}
            placeholder="Any specific rules or guidelines for guests..."
            value={formData.houseRules}
            onChange={handleChange}
          />
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? 'Creating...' : 'Create Listing'}
        </button>
      </div>
    </form>
  );
}