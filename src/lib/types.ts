export type ActionResult<T = any> = 
  | { success: true; data: T }
  | { success: false; error: string };

export interface HomeWithPhotos {
  id: string;
  hostId: string;
  title: string;
  description: string;
  location: string;
  maxGuests: number;
  pricePerNight: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  photos: Array<{
    id: string;
    url: string;
    caption: string | null;
    sortOrder: number;
  }>;
  host: {
    id: string;
    name: string;
    profileImageUrl: string | null;
  };
}

export interface BookingWithDetails {
  id: string;
  homeId: string;
  guestId: string;
  hostId: string;
  startDate: Date;
  endDate: Date;
  totalAmount: string;
  status: string;
  message: string | null;
  hostResponseAt: Date | null;
  autoDeclineAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  home: {
    id: string;
    title: string;
    location: string;
    photos: Array<{
      url: string;
      caption: string | null;
    }>;
  };
  guest: {
    id: string;
    name: string;
    email: string;
    bio: string | null;
    location: string | null;
    workInfo: string | null;
    socialMedia: string | null;
    profileImageUrl: string | null;
  };
  host: {
    id: string;
    name: string;
    email: string;
  };
}