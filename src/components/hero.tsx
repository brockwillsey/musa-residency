import Link from 'next/link';

export function Hero() {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Exchange Homes with Fellow Artists
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Connect with creative minds worldwide. Share your space, discover new cultures, 
          and find inspiration in artist-friendly homes designed for creativity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/search" className="btn-primary text-lg px-8 py-3">
            Find Your Space
          </Link>
          <Link href="/host/homes/new" className="btn-outline text-lg px-8 py-3">
            List Your Home
          </Link>
        </div>
      </div>
    </div>
  );
}