'use client';

import { formatDate, formatCurrency } from '@/lib/utils';
import type { Booking } from '@/types';

interface BookingsListProps {
  bookings: Booking[];
}

export function BookingsList({ bookings }: BookingsListProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No bookings yet
        </h3>
        <p className="text-gray-600">
          When you book a home, your requests will appear here.
        </p>
      </div>
    );
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <div key={booking.id} className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              {booking.home?.images?.[0] && (
                <img
                  src={booking.home.images[0]}
                  alt={booking.home.title || ''}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {booking.home?.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {booking.home?.location}
                </p>
                <p className="text-sm text-gray-500">
                  Hosted by {booking.host?.name}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Check-in:</span>
              <p className="text-gray-600">{formatDate(booking.startDate)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Check-out:</span>
              <p className="text-gray-600">{formatDate(booking.endDate)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total:</span>
              <p className="text-gray-600">{formatCurrency(parseFloat(booking.totalAmount))}</p>
            </div>
          </div>

          {booking.message && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Your message:</span>
              <p className="text-gray-600 mt-1">{booking.message}</p>
            </div>
          )}

          {booking.status === 'pending' && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Response deadline: {formatDate(booking.responseDeadline)}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}