import { NextRequest, NextResponse } from 'next/server';
import { securityMiddleware } from '@/lib/security-middleware';

export function middleware(request: NextRequest) {
  // Apply security middleware to all requests
  const securityResponse = securityMiddleware(request);

  // If security middleware returned a response (rate limit, etc.), return it
  if (securityResponse.status !== 200) {
    return securityResponse;
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health check endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/health|_next/static|_next/image|favicon.ico).*)',
  ],
};