import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { Header } from '@/components/ui/Header';
import { ProfileForm } from './ProfileForm';

export default async function ProfilePage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
            <p className="text-gray-600">Update your artist profile information</p>
          </div>
          
          <ProfileForm user={user} />
        </div>
      </main>
    </div>
  );
}