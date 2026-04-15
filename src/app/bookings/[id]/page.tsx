import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { db } from '@/db';
import { bookings, homes, users } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { BookingDetails } from './booking-details';

interface BookingPageProps {
  params: { id: string };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const user = await requireAuth();
  
  const result = await db
    .select()
    .from(bookings)
    .innerJoin(homes, eq(bookings.homeId, homes.id))
    .innerJoin(users, eq(bookings.guestId, users.id))
    .where(
      and(
        eq(bookings.id, params.id),
        or(
          eq(bookings.guestId, user.id),
          eq(bookings.hostId, user.id)
        )
      )
    )
    .limit(1);

  if (!result[0]) {
    notFound();
  }

  const { bookings: booking, homes: home, users: guest } = result[0];
  
  // Get host information
  const hostResult = await db
    .select()
    .from(users)
    .where(eq(users.id, booking.hostId))
    .limit(1);
    
  const host = hostResult[0];
  const userRole = booking.guestId === user.id ? 'guest' : 'host';

  return (
    <div className="container mx-auto px-4 py-8">
      <BookingDetails
        booking={booking}
        home={home}
        guest={guest}
        host={host}
        userRole={userRole}
      />
    </div>
  );
}