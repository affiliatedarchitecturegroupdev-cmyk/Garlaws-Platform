import { NextRequest, NextResponse } from 'next/server';
import { securityMiddleware } from '@/lib/security-middleware';
import createMiddleware from 'next-intl/middleware';

const i18nMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'pt', 'ru', 'hi'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Locale detection strategy
  localeDetection: true
});

export function middleware(request: NextRequest) {
  // Apply i18n middleware first for locale routing
  const i18nResponse = i18nMiddleware(request);

  // Apply security middleware to all requests
  const securityResponse = securityMiddleware(request);

  // If security middleware returned a response (rate limit, etc.), return it
  if (securityResponse.status !== 200) {
    return securityResponse;
  }

  // Return the i18n middleware response (which may redirect or continue)
  return i18nResponse;
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