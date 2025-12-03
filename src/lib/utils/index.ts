import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string | Date, locale: string = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getNextFriday(fromDate: Date = new Date()): Date {
  const date = new Date(fromDate);
  const day = date.getDay();
  const daysUntilFriday = (5 - day + 7) % 7 || 7;
  date.setDate(date.getDate() + daysUntilFriday);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isOrderingClosed(cutoffDate: Date): boolean {
  return new Date() > cutoffDate;
}

export function getOrderingCutoff(pickupDate: Date): Date {
  const cutoff = new Date(pickupDate);
  // Wednesday before Friday pickup, 11:59 PM
  cutoff.setDate(cutoff.getDate() - 2);
  cutoff.setHours(23, 59, 59, 999);
  return cutoff;
}

export function canModifyOrder(pickupDate: string, pickupWindowStart: string): boolean {
  const pickupDateTime = new Date(`${pickupDate}T${pickupWindowStart}`);
  const modificationCutoff = new Date(pickupDateTime.getTime() - 24 * 60 * 60 * 1000);
  return new Date() < modificationCutoff;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GC-${timestamp}-${random}`;
}

export function getLanguageLabel(lang: string): string {
  const labels: Record<string, string> = {
    en: 'English',
    es: 'Español',
    pt: 'Português',
  };
  return labels[lang] || lang;
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-().]{10,}$/;
  return phoneRegex.test(phone);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
