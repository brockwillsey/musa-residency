'use client';

import { useState, useTransition } from 'react';
import { createBookingAction } from '@/app/actions/bookings';
import { formatCurrency, calculateNights } from '@/lib/utils';

interface Home {
  id: string;
  title: string;
  pricePerNight: string;
  maxGuests: number;
}

interface BookingFormProps {
  home: Home;
}

export function BookingForm({ home }: BookingFormProps) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const nights = checkIn && checkOut ? calculateNights(new Date(checkIn), new Date(checkOut)) : 0;
  const totalAmount = nights * parseFloat(home.pricePerNight);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!checkIn || !checkOut) {
      setError('Please select check-in and check-out dates');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setError('Check-out date must be after check-in date');
      return;
    }

    if (nights < 1) {
      setError('Minimum stay is 1 night');
      return;
    }

    startTransition(async () => {
      const result = await createBookingAction({
        homeId: home.id,
        startDate: new Date(checkIn),
        endDate: new Date(checkOut),
        guests,
        message: message.trim() || undefined,
      });

      if (!result.success) {
        setError(result.error);
      } else {
        // Redirect will be handled by the action
      }
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
      <div className="mb-4">
        <span className="text-2xl font-bold">
          {formatCurrency(parseFloat(home.pricePerNight))}
        </span>
        <span className="text-gray-600"> / night</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
              Check-in
            </label>
            <input
              type="date"
              id="checkIn"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
              Check-out
            </label>
            <input
              type="date"
              id="checkOut"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
            Guests
          </label>
          <select
            id="guests"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {Array.from({ length: home.maxGuests }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Guest' : 'Guests'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message to Host (Optional)
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Tell the host about yourself and your stay..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {nights > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{formatCurrency(parseFloat(home.pricePerNight))} × {nights} nights</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || nights === 0}
          className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Sending Request...' : 'Request to Book'}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-4 text-center">
        You won't be charged until your request is approved by the host.
      </p>
    </div>
  );
}