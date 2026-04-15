import Link from 'next/link';
import Image from 'next/image';
import { Booking, Home, User } from '@/db/schema';
import { formatCurrency, formatDate } from '@/lib/utils';

interface BookingCardProps {
  booking: Booking;
  home: Home;
  otherUser: User;
  userRole: 'guest' | 'host';
}

export function BookingCard({ booking, home, otherUser, userRole }: BookingCardProps) {
  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const mainImage = home.images?.[0] || '/placeholder-home.jpg';

  return (
    <Link href={`/bookings/${booking.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex space-x-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={mainImage}
              alt={home.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{home.title}</h3>
                <p className="text-gray-600">{home.location}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {userRole === 'guest' ? 'Hosted by' : 'Requested by'} {otherUser.name}
                </p>
              </div>
              
              <div className="text-right">
                {getStatusBadge(booking.status || 'pending')}
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatCurrency(Number(booking.totalPrice))}
                </p>
              </div>
            </div>
            
            <div className="mt-3 text-sm text-gray-600">
              <p>
                {formatDate(new Date(booking.startDate))} - {formatDate(new Date(booking.endDate))}
              </p>
              {booking.message && (
                <p className="mt-1 line-clamp-2">
                  Message: {booking.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}