'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Booking, Home, User } from '@/db/schema';
import { formatCurrency, formatDate, calculateNights } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { approveBookingAction, declineBookingAction } from '@/app/actions/bookings';

interface BookingDetailsProps {
  booking: Booking;
  home: Home;
  guest: User;
  host: User;
  userRole: 'guest' | 'host';
}

export function BookingDetails({ booking, home, guest, host, userRole }: BookingDetailsProps) {
  const [loading, setLoading] = useState(false);
  
  const nights = calculateNights(new Date(booking.startDate), new Date(booking.endDate));
  const mainImage = home.images?.[0] || '/placeholder-home.jpg';
  
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      approved: 'text-green-600 bg-green-50 border-green-200',
      declined: 'text-red-600 bg-red-50 border-red-200',
      cancelled: 'text-gray-600 bg-gray-50 border-gray-200',
      completed: 'text-blue-600 bg-blue-50 border-blue-200',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('bookingId', booking.id);
      const result = await approveBookingAction(formData);
      if (result.success) {
        window.location.reload();
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('bookingId', booking.id);
      const result = await declineBookingAction(formData);
      if (result.success) {
        window.location.reload();
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Booking Details
            </h1>
            <div className={`px-3 py-1 rounded-full border ${getStatusColor(booking.status || 'pending')}`}>
              {(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Home Information */}
          <div>
            <div className="relative h-48 mb-4">
              <Image
                src={mainImage}
                alt={home.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            
            <h2 className="text-xl font-semibold mb-2">{home.title}</h2>
            <p className="text-gray-600 mb-4">{home.location}</p>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>{home.bedrooms} bedroom{home.bedrooms !== 1 ? 's' : ''} • {home.bathrooms} bathroom{home.bathrooms !== 1 ? 's' : ''}</p>
              <p>Up to {home.maxGuests} guests</p>
            </div>
            
            <p className="text-gray-700 mt-4">{home.description}</p>
          </div>

          {/* Booking Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Trip Details</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium">{formatDate(new Date(booking.startDate))}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium">{formatDate(new Date(booking.endDate))}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Nights</span>
                  <span className="font-medium">{nights}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>{formatCurrency(Number(home.pricePerNight))} × {nights} nights</span>
                  <span>{formatCurrency(Number(booking.totalPrice))}</span>
                </div>
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(Number(booking.totalPrice))}</span>
                </div>
              </div>

              {/* Guest/Host Information */}
              <div>
                <h4 className="font-semibold mb-2">
                  {userRole === 'guest' ? 'Your Host' : 'Your Guest'}
                </h4>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    {(userRole === 'guest' ? host.name : guest.name).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{userRole === 'guest' ? host.name : guest.name}</p>
                    <p className="text-sm text-gray-600">
                      {userRole === 'guest' ? host.location : guest.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {booking.message && (
                <div>
                  <h4 className="font-semibold mb-2">Message</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {booking.message}
                  </p>
                </div>
              )}

              {/* Action Buttons for Host */}
              {userRole === 'host' && booking.status === 'pending' && (
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleApprove}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Processing...' : 'Approve Booking'}
                  </Button>
                  <Button
                    onClick={handleDecline}
                    disabled={loading}
                    variant="outline"
                    className="flex-1"
                  >
                    {loading ? 'Processing...' : 'Decline'}
                  </Button>
                </div>
              )}

              {/* Status Messages */}
              {booking.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    {userRole === 'guest' 
                      ? 'Your booking has been approved! You will be charged shortly.'
                      : 'You have approved this booking. Payment will be processed automatically.'
                    }
                  </p>
                </div>
              )}

              {booking.status === 'declined' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">
                    This booking request has been declined.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}