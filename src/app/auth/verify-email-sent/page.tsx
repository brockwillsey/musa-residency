import { Header } from '@/components/ui/Header';
import Link from 'next/link';

export default function VerifyEmailSentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="card">
            <div className="card-body">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
              <p className="text-gray-600 mb-6">
                We've sent you a verification link. Please check your email and click the link to activate your account.
              </p>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Didn't receive the email? Check your spam folder or try signing up again.
                </p>
                
                <Link href="/auth/signin" className="btn-outline w-full">
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}