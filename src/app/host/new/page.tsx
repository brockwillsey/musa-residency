import { requireAuth } from '@/lib/auth';
import { NewHomeForm } from './new-home-form';

export default async function NewHomePage() {
  await requireAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">List Your Home</h1>
        <NewHomeForm />
      </div>
    </div>
  );
}