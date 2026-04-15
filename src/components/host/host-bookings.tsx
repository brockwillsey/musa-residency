'use client';

import { useState } from 'react';
import { approveBooking, declineBooking } from '@/app/actions/bookings';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Booking } from '@/types';

interface HostBookingsProps {
  bookings: Booking[];
}

export function HostBookings({ bookings }: HostBookingsProps) {
  const [loadingBookings, setLoadingBookings] = useState<Record<string, 'approve' | 'decline'>>({});

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No booking requests yet.</p>
      </div>
    );
  }

  async function handleBookingAction(bookingId: string, action: 'approve' | 'decline') {
    setLoadingBookings(prev => ({ ...prev, [bookingId]: action }));

    const result = action === 'approve' 
      ? await approveBooking(bookingId)
      : await declineBooking(bookingId);

    if (!result.success) {
      alert(result.error);
    }

    setLoadingBookings(prev => {
      const newState = { ...prev };
      delete newState[bookingId];
      return newState;
    });
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
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              {booking.guest?.image ? (
                <img
                  src={booking.guest.image}
                  alt={booking.guest.name || ''}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  {booking.guest?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {booking.guest?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {booking.home?.title}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.guest?.location}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
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
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Message from guest:</span>
              <p className="text-gray-600 mt-1">{booking.message}</p>
            </div>
          )}

          {booking.guest?.bio && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <span className="font-medium text-gray-700">About the guest:</span>
              <p className="text-gray-600 mt-1">{booking.guest.bio}</p>
            </div>
          )}

          {booking.status === 'pending' && (
            <div className="flex space-x-3">
              <button
                onClick={() => handleBookingAction(booking.id, 'approve')}
                disabled={loadingBookings[booking.id] === 'approve'}
                className="btn-primary"
              >
                {loadingBookings[booking.id] === 'approve' ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => handleBookingAction(booking.id, 'decline')}
                disabled={loadingBookings[booking.id] === 'decline'}
                className="btn-secondary"
              >
                {loadingBookings[booking.id] === 'decline' ? 'Declining...' : 'Decline'}
              </button>
            </div>
          )}

          {booking.status === 'pending' && (
            <div className="mt-2 text-sm text-gray-500">
              Response deadline: {formatDate(booking.responseDeadline)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}