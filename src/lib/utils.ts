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

  // Use path-based URLs if the root domain is a test/tunnel domain,
  // or if we are explicitly in development mode.
  const isDev = process.env.NODE_ENV === 'development';
  const isTestDomain = rootDomain.includes('ngrok') ||
    rootDomain.includes('vercel.app') ||
    rootDomain.includes('localhost') ||
    rootDomain.includes('127.0.0.1');

  if (isDev || isTestDomain) {
    return `${getBaseUrl()}/store/${slug}`;
  }

  // Production / Custom domains
  return `https://${slug}.${rootDomain}`;
}

export function getProductUrl(slug: string, productId: string): string {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'dukaanhai.in';

  const isDev = process.env.NODE_ENV === 'development';
  const isTestDomain = rootDomain.includes('ngrok') ||
    rootDomain.includes('vercel.app') ||
    rootDomain.includes('localhost') ||
    rootDomain.includes('127.0.0.1');

  if (isDev || isTestDomain) {
    return `/store/${slug}/product/${productId}`;
  }

  return `/product/${productId}`; // On a subdomain, we just use /product/[id]
}

export function getStorePath(slug: string): string {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'dukaanhai.in';

  const isDev = process.env.NODE_ENV === 'development';
  const isTestDomain = rootDomain.includes('ngrok') ||
    rootDomain.includes('vercel.app') ||
    rootDomain.includes('localhost') ||
    rootDomain.includes('127.0.0.1');

  if (isDev || isTestDomain) {
    return `/store/${slug}`;
  }

  return `/`; // Root of the subdomain
}


export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
