import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { bookings, homes, users } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function BookingsPage() {
  const auth = await getCurrentUser();
  
  if (!auth) {
    redirect('/login');
  }

  const userBookings = await db
    .select({
      id: bookings.id,
      startDate: bookings.startDate,
      endDate: bookings.endDate,
      totalAmount: bookings.totalAmount,
      status: bookings.status,
      createdAt: bookings.createdAt,
      home: {
        id: homes.id,
        title: homes.title,
        location: homes.location,
        photos: homes.photos,
      },
      host: {
        id: users.id,
        name: users.name,
      },
      guest: {
        id: users.id,
        name: users.name,
      },
      isHost: eq(bookings.hostId, auth.userId),
    })
    .from(bookings)
    .leftJoin(homes, eq(bookings.homeId, homes.id))
    .leftJoin(users, eq(bookings.hostId, users.id))
    .where(or(eq(bookings.guestId, auth.userId), eq(bookings.hostId, auth.userId)))
    .orderBy(bookings.createdAt);

  const guestBookings = userBookings.filter(b => !b.isHost);
  const hostBookings = userBookings.filter(b => b.isHost);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

      <div className="space-y-8">
        {/* Guest Bookings */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Trips</h2>
          
          {guestBookings.length > 0 ? (
            <div className="space-y-4">
              {guestBookings.map((booking) => (
                <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-4">
                    {booking.home?.photos[0] && (
                      <img
                        src={booking.home.photos[0]}
                        alt={booking.home.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{booking.home?.title}</h3>
                      <p className="text-gray-600">{booking.home?.location}</p>
                      <p className="text-sm text-gray-500">
                        Host: {booking.host?.name}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {formatCurrency(parseFloat(booking.totalAmount))}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                      </div>
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                        booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                        booking.status === 'declined' ? 'bg-red-100 text-red-800' :
                        booking.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No trips yet.</p>
            </div>
          )}
        </div>

        {/* Host Bookings */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hosting Requests</h2>
          
          {hostBookings.length > 0 ? (
            <div className="space-y-4">
              {hostBookings.map((booking) => (
                <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-4">
                    {booking.home?.photos[0] && (
                      <img
                        src={booking.home.photos[0]}
                        alt={booking.home.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{booking.home?.title}</h3>
                      <p className="text-gray-600">{booking.home?.location}</p>
                      <p className="text-sm text-gray-500">
                        Guest: {booking.guest?.name}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {formatCurrency(parseFloat(booking.totalAmount))}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                      </div>
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                        booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                        booking.status === 'declined' ? 'bg-red-100 text-red-800' :
                        booking.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No hosting requests yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}