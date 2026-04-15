import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserHomes } from '@/app/actions/homes';
import { getHostBookings } from '@/app/actions/bookings';
import { HostDashboard } from '@/components/host/host-dashboard';

export default async function HostPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const [homesResult, bookingsResult] = await Promise.all([
    getUserHomes(session.user.id),
    getHostBookings(session.user.id),
  ]);

  const homes = homesResult.success ? homesResult.data : [];
  const bookings = bookingsResult.success ? bookingsResult.data : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <HostDashboard homes={homes} bookings={bookings} />
    </div>
  );
}