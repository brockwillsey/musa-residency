import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CreateHomeForm } from '@/components/host/create-home-form';

export default async function CreateHomePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          List Your Home
        </h1>
        <CreateHomeForm userId={session.user.id} />
      </div>
    </div>
  );
}