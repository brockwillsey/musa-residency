import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numAmount);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function calculateNights(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isDateAvailable(
  date: Date,
  availability: Array<{ startDate: Date; endDate: Date; isAvailable: boolean }>
): boolean {
  return availability.some(
    (avail) =>
      avail.isAvailable &&
      date >= avail.startDate &&
      date <= avail.endDate
  );
}

export function isDateRangeAvailable(
  startDate: Date,
  endDate: Date,
  availability: Array<{ startDate: Date; endDate: Date; isAvailable: boolean }>
): boolean {
  const availableRanges = availability.filter(avail => avail.isAvailable);
  
  return availableRanges.some(
    (avail) =>
      startDate >= avail.startDate &&
      endDate <= avail.endDate
  );
}

export async function uploadFile(file: File): Promise<string> {
  // This would typically upload to a cloud storage service like AWS S3, Cloudinary, etc.
  // For now, we'll simulate the upload and return a placeholder URL
  const formData = new FormData();
  formData.append('file', file);
  
  // In a real implementation, you would upload to your preferred storage service
  // const response = await fetch('/api/upload', { method: 'POST', body: formData });
  // const { url } = await response.json();
  // return url;
  
  // Placeholder implementation
  return `https://images.unsplash.com/photo-1494790108755-2616c667c8a9?w=400&h=400&fit=crop`;
}