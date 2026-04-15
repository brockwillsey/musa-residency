import { requireAuth } from '@/lib/auth';
import { db } from '@/db';
import { bookings, homes, users } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import { BookingCard } from './booking-card';

export default async function BookingsPage() {
  const user = await requireAuth();
  
  // Get bookings where user is either guest or host
  const userBookings = await db
    .select()
    .from(bookings)
    .innerJoin(homes, eq(bookings.homeId, homes.id))
    .innerJoin(users, eq(bookings.guestId, users.id))
    .where(or(
      eq(bookings.guestId, user.id),
      eq(bookings.hostId, user.id)
    ))
    .orderBy(bookings.createdAt);

  const guestBookings = userBookings.filter(b => b.bookings.guestId === user.id);
  const hostBookings = userBookings.filter(b => b.bookings.hostId === user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

      <div className="space-y-8">
        {/* Guest Bookings */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Trips</h2>
          {guestBookings.length > 0 ? (
            <div className="grid gap-4">
              {guestBookings.map(({ bookings: booking, homes: home, users: guest }) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  home={home}
                  otherUser={guest}
                  userRole="guest"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming trips</p>
          )}
        </div>

        {/* Host Bookings */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Hosting Requests</h2>
          {hostBookings.length > 0 ? (
            <div className="grid gap-4">
              {hostBookings.map(({ bookings: booking, homes: home, users: guest }) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  home={home}
                  otherUser={guest}
                  userRole="host"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hosting requests</p>
          )}
        </div>
      </div>
    </div>
  );
}