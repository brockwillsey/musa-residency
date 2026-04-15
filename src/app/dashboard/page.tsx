import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/db'
import { homes, bookingRequests, users } from '@/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Home, Calendar, MessageCircle } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  // Get user data
  const userData = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!userData.length) {
    redirect('/login')
  }

  const user = userData[0]

  // Get user's homes
  const userHomes = await db
    .select()
    .from(homes)
    .where(eq(homes.hostId, user.id))

  // Get pending booking requests for user's homes
  const pendingRequests = await db
    .select({
      id: bookingRequests.id,
      startDate: bookingRequests.startDate,
      endDate: bookingRequests.endDate,
      totalAmount: bookingRequests.totalAmount,
      message: bookingRequests.message,
      guestName: users.name,
      homeTitle: homes.title,
      responseDeadline: bookingRequests.responseDeadline,
    })
    .from(bookingRequests)
    .innerJoin(users, eq(bookingRequests.guestId, users.id))
    .innerJoin(homes, eq(bookingRequests.homeId, homes.id))
    .where(
      and(
        eq(homes.hostId, user.id),
        eq(bookingRequests.status, 'pending'),
        gte(bookingRequests.responseDeadline, new Date())
      )
    )

  // Get user's own booking requests
  const userBookings = await db
    .select({
      id: bookingRequests.id,
      startDate: bookingRequests.startDate,
      endDate: bookingRequests.endDate,
      totalAmount: bookingRequests.totalAmount,
      status: bookingRequests.status,
      homeTitle: homes.title,
      hostName: users.name,
    })
    .from(bookingRequests)
    .innerJoin(homes, eq(bookingRequests.homeId, homes.id))
    .innerJoin(users, eq(homes.hostId, users.id))
    .where(eq(bookingRequests.guestId, user.id))
    .orderBy(bookingRequests.createdAt)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name}
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your homes and bookings
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/homes/new">
          <Card className="cursor-pointer transition-colors hover:bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Plus className="mr-2 h-5 w-5" />
                List a Home
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/search">
          <Card className="cursor-pointer transition-colors hover:bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Home className="mr-2 h-5 w-5" />
                Find a Home
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/messages">
          <Card className="cursor-pointer transition-colors hover:bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Messages
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Your Homes */}
        <Card>
          <CardHeader>
            <CardTitle>Your Homes ({userHomes.length})</CardTitle>
            <CardDescription>
              Manage your listed properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userHomes.length === 0 ? (
              <div className="text-center py-6">
                <Home className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No homes listed</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by listing your first home.
                </p>
                <div className="mt-6">
                  <Link href="/homes/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      List a Home
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {userHomes.slice(0, 3).map((home) => (
                  <div key={home.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <h4 className="font-medium">{home.title}</h4>
                      <p className="text-sm text-gray-500">{home.location}</p>
                    </div>
                    <Link href={`/homes/${home.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
                {userHomes.length > 3 && (
                  <div className="pt-3">
                    <Link href="/homes">
                      <Button variant="ghost" className="w-full">
                        View All ({userHomes.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Booking Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
            <CardDescription>
              Booking requests awaiting your response
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Booking requests will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{request.guestName}</h4>
                        <p className="text-sm text-gray-500">{request.homeTitle}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/bookings/${request.id}`}>
                        <Button size="sm">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {pendingRequests.length > 3 && (
                  <div className="pt-3">
                    <Link href="/bookings">
                      <Button variant="ghost" className="w-full">
                        View All ({pendingRequests.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Your Bookings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Bookings ({userBookings.length})</CardTitle>
            <CardDescription>
              Track your booking requests and confirmed stays
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userBookings.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start exploring and book your first stay.
                </p>
                <div className="mt-6">
                  <Link href="/search">
                    <Button>
                      <Home className="mr-2 h-4 w-4" />
                      Find a Home
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {userBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{booking.homeTitle}</h4>
                      <p className="text-sm text-gray-500">Host: {booking.hostName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        booking.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : booking.status === 'paid'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                      <Link href={`/bookings/${booking.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {userBookings.length > 5 && (
                  <div className="pt-3">
                    <Link href="/bookings">
                      <Button variant="ghost" className="w-full">
                        View All ({userBookings.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}