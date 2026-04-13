import { SignUpForm } from './SignUpForm';
import { Header } from '@/components/ui/Header';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Musa Residency</h1>
            <p className="text-gray-600">Create your artist profile to start exchanging</p>
          </div>
          
          <SignUpForm />
        </div>
      </main>
    </div>
  );
}