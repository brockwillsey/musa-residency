import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Home, Users, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Creative Spaces for Creative Souls
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
          Connect with artists worldwide through our specialized home exchange platform. 
          Trade spaces, share cultures, and find inspiration in communities across the globe.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/register">
            <Button size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" size="lg">
              Browse Homes
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Home className="h-8 w-8 text-primary" />
              <CardTitle>Curated Creative Spaces</CardTitle>
              <CardDescription>
                Discover homes and studios designed for creative work, from artist lofts to writer's retreats.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary" />
              <CardTitle>Artist Community</CardTitle>
              <CardDescription>
                Connect with like-minded creatives who understand the importance of inspiring environments.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-8 w-8 text-primary" />
              <CardTitle>Global Cultural Exchange</CardTitle>
              <CardDescription>
                Immerse yourself in local art scenes and build meaningful connections across cultures.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="mt-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Simple steps to start your creative journey
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
              1
            </div>
            <h3 className="mt-4 text-lg font-semibold">Create Your Profile</h3>
            <p className="mt-2 text-gray-600">
              Share your creative practice, showcase your space, and tell your story.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
              2
            </div>
            <h3 className="mt-4 text-lg font-semibold">Find Your Match</h3>
            <p className="mt-2 text-gray-600">
              Search for spaces that inspire you and connect with compatible artists.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
              3
            </div>
            <h3 className="mt-4 text-lg font-semibold">Start Creating</h3>
            <p className="mt-2 text-gray-600">
              Book your stay, immerse in new cultures, and create your best work.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}