import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  location: z.string().min(1, 'Location is required').max(100),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  workInfo: z.string().max(200, 'Work info must be less than 200 characters').optional(),
  socialMedia: z.string().url('Invalid URL').optional().or(z.literal('')),
  profileImage: z.instanceof(File).optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const homeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(2000),
  location: z.string().min(1, 'Location is required').max(100),
  maxGuests: z.number().min(1, 'Must accommodate at least 1 guest').max(20),
  pricePerNight: z.number().min(1, 'Price must be greater than $0'),
});

export const availabilitySchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date'),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
});

export const bookingRequestSchema = z.object({
  homeId: z.string().uuid('Invalid home ID'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date'),
  message: z.string().max(1000, 'Message must be less than 1000 characters').optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const now = new Date();
  return start >= now && end > start;
}, {
  message: 'Invalid date range',
});

export const searchSchema = z.object({
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxGuests: z.number().optional(),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  location: z.string().min(1, 'Location is required').max(100),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  workInfo: z.string().max(200, 'Work info must be less than 200 characters').optional(),
  socialMedia: z.string().url('Invalid URL').optional().or(z.literal('')),
  profileImage: z.instanceof(File).optional(),
});