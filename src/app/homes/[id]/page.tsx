import { getHomeById } from '@/app/actions/homes';
import { HomeDetails } from '@/components/home/home-details';
import { BookingForm } from '@/components/booking/booking-form';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface HomePageProps {
  params: {
    id: string;
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const session = await auth();
  const result = await getHomeById(params.id);

  if (!result.success) {
    redirect('/search');
  }

  const home = result.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <HomeDetails home={home} />
        </div>
        <div className="lg:col-span-1">
          {session?.user && session.user.id !== home.hostId ? (
            <BookingForm home={home} userId={session.user.id} />
          ) : !session?.user ? (
            <div className="card p-6">
              <p className="text-gray-600 text-center">
                <a href="/auth/signin" className="text-primary-600 hover:text-primary-500">
                  Sign in
                </a>{' '}
                to book this home
              </p>
            </div>
          ) : (
            <div className="card p-6">
              <p className="text-gray-600 text-center">
                This is your own listing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}