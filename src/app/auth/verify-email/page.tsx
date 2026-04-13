import { verifyEmail } from '@/app/actions/auth';
import { Header } from '@/components/ui/Header';
import Link from 'next/link';

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const { token } = params;

  let verificationResult = null;
  if (token) {
    verificationResult = await verifyEmail(token);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="card">
            <div className="card-body">
              {!token ? (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
                  <p className="text-gray-600 mb-6">
                    This verification link is invalid or missing. Please try signing up again.
                  </p>
                </>
              ) : verificationResult?.success ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
                  <p className="text-gray-600 mb-6">
                    Your email has been successfully verified. You can now sign in to your account.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
                  <p className="text-gray-600 mb-6">
                    {verificationResult?.error || 'This verification link is invalid or has expired. Please try signing up again.'}
                  </p>
                </>
              )}
              
              <div className="space-y-4">
                <Link href="/auth/signin" className="btn-primary w-full">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-outline w-full">
                  Sign Up Again
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}