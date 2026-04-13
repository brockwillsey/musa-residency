import { SignInForm } from './SignInForm';
import { Header } from '@/components/ui/Header';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your Musa Residency account</p>
          </div>
          
          <SignInForm />
        </div>
      </main>
    </div>
  );
}