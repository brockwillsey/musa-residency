export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/homes/new/:path*', '/profile/:path*', '/bookings/:path*', '/messages/:path*']
}