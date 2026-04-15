import Link from 'next/link';
import { HostBookings } from '@/components/host/host-bookings';
import { HomesList } from '@/components/host/homes-list';
import type { Home, Booking } from '@/types';

interface HostDashboardProps {
  homes: Home[];
  bookings: Booking[];
}

export function HostDashboard({ homes, bookings }: HostDashboardProps) {
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Host Dashboard
        </h1>
        <Link href="/host/homes/new" className="btn-primary">
          Add New Home
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Your Homes
          </h3>
          <p className="text-3xl font-bold text-primary-600">
            {homes.length}
          </p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Pending Requests
          </h3>
          <p className="text-3xl font-bold text-yellow-600">
            {pendingBookings.length}
          </p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Total Bookings
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {bookings.length}
          </p>
        </div>
      </div>

      {/* Pending Booking Requests */}
      {pendingBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pending Requests
          </h2>
          <HostBookings bookings={pendingBookings} />
        </div>
      )}

      {/* All Booking Requests */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          All Booking Requests
        </h2>
        <HostBookings bookings={bookings} />
      </div>

      {/* Your Homes */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Your Homes
        </h2>
        <HomesList homes={homes} />
      </div>
    </div>
  );
}