import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CreateHomeForm } from './CreateHomeForm';

export default async function HostPage() {
  const auth = await getCurrentUser();
  
  if (!auth) {
    redirect('/login');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Home</h1>
        <p className="text-gray-600">
          Share your creative space with fellow artists and remote professionals.
        </p>
      </div>

      <CreateHomeForm />
    </div>
  );
}