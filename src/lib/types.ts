export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

export interface User {
  id: string
  email: string
  name: string
  bio?: string
  location?: string
  workInfo?: string
  socialMedia?: {
    instagram?: string
    twitter?: string
    website?: string
  }
  profileImage?: string
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Home {
  id: string
  hostId: string
  title: string
  description: string
  location: string
  amenities?: string[]
  maxGuests: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  host?: User
  images?: HomeImage[]
  availability?: Availability[]
}

export interface HomeImage {
  id: string
  homeId: string
  url: string
  isPrimary: boolean
  createdAt: Date
}

export interface Availability {
  id: string
  homeId: string
  startDate: Date
  endDate: Date
  pricePerNight: string
  isAvailable: boolean
  createdAt: Date
}

export interface BookingRequest {
  id: string
  guestId: string
  homeId: string
  startDate: Date
  endDate: Date
  totalAmount: string
  status: 'pending' | 'approved' | 'declined' | 'paid' | 'cancelled'
  message?: string
  stripePaymentIntentId?: string
  responseDeadline: Date
  createdAt: Date
  updatedAt: Date
  guest?: User
  home?: Home
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  bookingRequestId?: string
  content: string
  isRead: boolean
  createdAt: Date
  sender?: User
  receiver?: User
}