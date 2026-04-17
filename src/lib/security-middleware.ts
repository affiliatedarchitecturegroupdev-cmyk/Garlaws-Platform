import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // requests per window
};

function getClientIP(request: NextRequest): string {
  // Get client IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return realIP || clientIP || 'unknown';
}

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    // First request or window expired
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return false;
  }

  if (clientData.count >= RATE_LIMIT.maxRequests) {
    return true;
  }

  clientData.count++;
  return false;
}

function validateInput(input: string): boolean {
  // Basic input validation - check for common attack patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /\.\./, // Directory traversal
    /union.*select/i, // SQL injection
    /eval\(/i,
    /document\.cookie/i,
  ];

  return !suspiciousPatterns.some(pattern => pattern.test(input));
}

export function securityMiddleware(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (isRateLimited(clientIP)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitStore.get(clientIP)?.resetTime || 0 - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimitStore.get(clientIP)?.resetTime || 0 - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, RATE_LIMIT.maxRequests - (rateLimitStore.get(clientIP)?.count || 0)).toString(),
          },
        }
      );
    }
  }

  // Input validation for request body
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    try {
      const body = request.body;
      if (body) {
        const text = body.toString();
        if (!validateInput(text)) {
          return new NextResponse(
            JSON.stringify({ error: 'Invalid input detected' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      }
    } catch (error) {
      // Continue if body parsing fails
    }
  }

  // Security headers
  const response = NextResponse.next();

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google.com *.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: https: *.cloudinary.com *.supabase.co",
      "connect-src 'self' *.supabase.co wss: ws:",
      "media-src 'self' blob:",
      "object-src 'none'",
      "frame-src 'self' *.youtube.com *.vimeo.com",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // Additional security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HSTS (HTTP Strict Transport Security) - only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

// Clean up rate limit store periodically
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) {
        rateLimitStore.delete(ip);
      }
    }
  }, 60000); // Clean up every minute
}