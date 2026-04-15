import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserBookings } from '@/app/actions/bookings';
import { BookingsList } from '@/components/booking/bookings-list';

export default async function BookingsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const result = await getUserBookings(session.user.id);
  const bookings = result.success ? result.data : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        My Bookings
      </h1>
      <BookingsList bookings={bookings} />
    </div>
  );
}