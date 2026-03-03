import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 50);
}

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

export function getStoreUrl(slug: string): string {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'dukaanhai.in';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  // Use path-based URLs in development OR when the app is tunneled (ngrok, etc.)
  // Use subdomain-based URLs only on actual production domain (dukaanhai.in)
  const isDev = process.env.NODE_ENV === 'development';
  const isNgrokOrTunnel = appUrl.includes('ngrok') || appUrl.includes('tunnel') || appUrl.includes('localhost');

  if (isDev || isNgrokOrTunnel) {
    return `${getBaseUrl()}/store/${slug}`;
  }

  return `https://${slug}.${rootDomain}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
