import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // Skip for localhost and direct paths
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const isVercel = hostname.includes('vercel.app');

  if (isLocalhost || isVercel) {
    return NextResponse.next();
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'dukaanhai.com';
  const subdomain = hostname.replace(`.${rootDomain}`, '');

  // If it's a subdomain (not www or root)
  if (subdomain && subdomain !== 'www' && subdomain !== rootDomain && !hostname.startsWith(rootDomain)) {
    // Rewrite to /store/[slug]
    url.pathname = `/store/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Handle custom domains
  if (!hostname.includes(rootDomain)) {
    // Could be a custom domain — rewrite to /store/[domain]
    url.pathname = `/domain/${hostname}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
