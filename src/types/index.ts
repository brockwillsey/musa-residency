export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  bio?: string | null;
  location?: string | null;
  workInfo?: string | null;
  socialMedia?: string | null;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Home {
  id: string;
  hostId: string;
  title: string;
  description: string;
  location: string;
  address?: string | null;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: string;
  images?: string[] | null;
  amenities?: string[] | null;
  houseRules?: string | null;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
  host?: User;
}

export interface Booking {
  id: string;
  homeId: string;
  guestId: string;
  hostId: string;
  startDate: Date;
  endDate: Date;
  totalAmount: string;
  status: 'pending' | 'approved' | 'declined' | 'paid' | 'cancelled';
  message?: string | null;
  stripePaymentIntentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  responseDeadline: Date;
  home?: Home;
  guest?: User;
  host?: User;
}

export interface SearchFilters {
  location?: string;
  startDate?: string;
  endDate?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
}

export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };