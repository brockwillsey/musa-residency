'use client';

import { useState } from 'react';
import { createBooking } from '@/app/actions/bookings';
import { formatCurrency, calculateNights } from '@/lib/utils';
import type { Home } from '@/types';

interface BookingFormProps {
  home: Home;
  userId: string;
}

export function BookingForm({ home, userId }: BookingFormProps) {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  const nights = formData.startDate && formData.endDate 
    ? calculateNights(new Date(formData.startDate), new Date(formData.endDate))
    : 0;
  
  const totalAmount = nights * parseFloat(home.pricePerNight);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.startDate || !formData.endDate) {
      setError('Please select your dates');
      setIsLoading(false);
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('Check-out date must be after check-in date');
      setIsLoading(false);
      return;
    }

    const result = await createBooking({
      homeId: home.id,
      guestId: userId,
      hostId: home.hostId,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      totalAmount,
      message: formData.message || undefined,
    });

    if (!result.success) {
      setError(result.error);
    } else {
      // Redirect to bookings page
      window.location.href = '/bookings';
    }

    setIsLoading(false);
  }

  return (
    <div className="card p-6 sticky top-8">
      <div className="mb-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(parseFloat(home.pricePerNight))}
          </span>
          <span className="text-gray-600">per night</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="form-group">
            <label htmlFor="startDate" className="form-label">
              Check-in
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              className="input"
              value={formData.startDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
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
              required
              className="input"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="message" className="form-label">
            Message to host (optional)
          </label>
          <textarea
            id="message"
            name="message"
            className="textarea"
            rows={3}
            placeholder="Tell the host a bit about yourself and your creative practice..."
            value={formData.message}
            onChange={handleChange}
          />
        </div>

        {nights > 0 && (
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{formatCurrency(parseFloat(home.pricePerNight))} × {nights} night{nights > 1 ? 's' : ''}</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !formData.startDate || !formData.endDate}
          className="btn-primary w-full"
        >
          {isLoading ? 'Sending request...' : 'Request to Book'}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Your payment will be authorized but not charged until the host approves your request.
      </p>
    </div>
  );
}