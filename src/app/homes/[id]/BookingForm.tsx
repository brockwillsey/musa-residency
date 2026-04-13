'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBookingRequest } from '@/app/actions/bookings';
import { formatCurrency, calculateNights, isDateRangeAvailable } from '@/lib/utils';
import type { Availability } from '@/lib/db/schema';

interface BookingFormProps {
  home: {
    id: string;
    title: string;
    pricePerNight: string;
    maxGuests: number;
    hostId: string;
  };
  availability: Availability[];
}

export function BookingForm({ home, availability }: BookingFormProps) {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const nights = formData.startDate && formData.endDate 
    ? calculateNights(formData.startDate, formData.endDate)
    : 0;
  
  const totalAmount = nights * parseFloat(home.pricePerNight);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate dates
    if (!formData.startDate || !formData.endDate) {
      setError('Please select check-in and check-out dates');
      setIsLoading(false);
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (!isDateRangeAvailable(startDate, endDate, availability)) {
      setError('Selected dates are not available');
      setIsLoading(false);
      return;
    }

    try {
      const result = await createBookingRequest({
        homeId: home.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        message: formData.message,
      });

      if (result.success) {
        router.push(`/bookings/${result.data.bookingId}`);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to submit booking request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // Get min date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <div className="card">
      <div className="card-header">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {formatCurrency(parseFloat(home.pricePerNight))}
            <span className="text-base font-normal text-gray-500">/night</span>
          </div>
        </div>
      </div>

      <div className="card-body">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Check-in
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              min={minDateString}
              required
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              Check-out
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate || minDateString}
              required
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message to host (optional)
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              className="form-textarea"
              placeholder="Tell the host about yourself and why you'd like to stay..."
            />
          </div>

          {nights > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>{formatCurrency(parseFloat(home.pricePerNight))} × {nights} nights</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || nights === 0}
            className="btn-primary w-full"
          >
            {isLoading ? 'Submitting...' : 'Request to Book'}
          </button>

          <div className="text-xs text-gray-500 text-center">
            You won't be charged until the host approves your request
          </div>
        </form>
      </div>
    </div>
  );
}