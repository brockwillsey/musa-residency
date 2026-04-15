'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home } from '@/db/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, calculateNights } from '@/lib/utils';
import { createBookingAction } from '@/app/actions/bookings';

interface BookingFormProps {
  home: Home;
}

export function BookingForm({ home }: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [message, setMessage] = useState('');

  const nights = checkIn && checkOut ? calculateNights(new Date(checkIn), new Date(checkOut)) : 0;
  const totalPrice = nights * Number(home.pricePerNight);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('homeId', home.id);
      formData.append('checkIn', checkIn);
      formData.append('checkOut', checkOut);
      formData.append('message', message);
      formData.append('totalPrice', totalPrice.toString());

      const result = await createBookingAction(formData);
      
      if (result.success) {
        router.push(`/bookings/${result.data.id}`);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">
            {formatCurrency(Number(home.pricePerNight))}
          </span>
          <span className="text-gray-500">per night</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check In
            </label>
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check Out
            </label>
            <Input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message to Host (Optional)
          </label>
          <Textarea
            placeholder="Tell the host a bit about yourself and your trip..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>

        {nights > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>{formatCurrency(Number(home.pricePerNight))} × {nights} nights</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          size="lg" 
          className="w-full"
          disabled={loading || !checkIn || !checkOut}
        >
          {loading ? 'Sending Request...' : 'Request to Book'}
        </Button>
      </form>

      <p className="text-xs text-gray-500 mt-4">
        You won't be charged until your request is approved by the host.
      </p>
    </div>
  );
}