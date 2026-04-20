import { NextRequest, NextResponse } from 'next/server';
import { logger, LogCategory } from '@/lib/logger';
import { alertManager } from '@/components/ErrorBoundary';

// Security configuration
export interface SecurityConfig {
  enableRateLimiting: boolean;
  maxRequestsPerMinute: number;
  enableInputValidation: boolean;
  enableSecurityHeaders: boolean;
  enableAuditLogging: boolean;
  blockedIPs: string[];
  allowedOrigins: string[];
  sensitiveRoutes: string[];
}

export class SecurityMiddleware {
  private static config: SecurityConfig = {
    enableRateLimiting: true,
    maxRequestsPerMinute: 60,
    enableInputValidation: true,
    enableSecurityHeaders: true,
    enableAuditLogging: true,
    blockedIPs: [],
    allowedOrigins: ['localhost:3000', '127.0.0.1:3000'],
    sensitiveRoutes: ['/api/users', '/api/financial', '/api/security']
  };

  private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  static configure(config: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static async authenticate(request: NextRequest): Promise<{ user?: any; isAuthenticated: boolean }> {
    try {
      // Check for authentication token
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return { isAuthenticated: false };
      }

      // In a real implementation, validate JWT token
      // For now, we'll do basic validation
      if (token.length < 10) {
        logger.warn(LogCategory.SECURITY, 'Invalid token format', { tokenLength: token.length });
        return { isAuthenticated: false };
      }

      // Mock user validation - in production, decode and validate JWT
      const user = { id: 'user_123', role: 'user' };

      logger.info(LogCategory.SECURITY, 'User authenticated successfully', {
        userId: user.id,
        endpoint: request.nextUrl.pathname
      });

      return { user, isAuthenticated: true };
    } catch (error) {
      logger.error(LogCategory.SECURITY, 'Authentication error', error as Error);
      return { isAuthenticated: false };
    }
  }

  static authorize(user: any, requiredRole: string, resource: string): boolean {
    try {
      // Basic role-based authorization
      const userRole = user?.role || 'guest';
      const roleHierarchy = {
        'admin': 4,
        'manager': 3,
        'user': 2,
        'guest': 1
      };

      const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
      const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 999;

      const isAuthorized = userLevel >= requiredLevel;

      if (!isAuthorized) {
        logger.warn(LogCategory.SECURITY, 'Authorization denied', {
          userId: user?.id,
          userRole,
          requiredRole,
          resource,
          endpoint: resource
        });
      }

      return isAuthorized;
    } catch (error) {
      logger.error(LogCategory.SECURITY, 'Authorization error', error as Error);
      return false;
    }
  }

  static async validateRequest(request: NextRequest): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check request method
      const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
      if (!allowedMethods.includes(request.method)) {
        errors.push(`Method ${request.method} not allowed`);
      }

      // Check Content-Type for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const contentType = request.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          errors.push('Content-Type must be application/json');
        }
      }

      // Validate request size
      const contentLength = parseInt(request.headers.get('content-length') || '0');
      if (contentLength > 10 * 1024 * 1024) { // 10MB limit
        errors.push('Request too large');
      }

      // Check for malicious patterns in URL
      const url = request.nextUrl.pathname + request.nextUrl.search;
      const maliciousPatterns = [
        /\.\./,  // Directory traversal
        /<script/i,  // XSS
        /javascript:/i,  // JavaScript URLs
        /data:/i,  // Data URLs
        /vbscript:/i  // VBScript
      ];

      for (const pattern of maliciousPatterns) {
        if (pattern.test(url)) {
          errors.push('Malicious pattern detected in URL');
          break;
        }
      }

      // Validate JSON payload if present
      if (request.method !== 'GET' && request.headers.get('content-type')?.includes('application/json')) {
        try {
          const body = await request.clone().json();

          // Check for nested objects/depth
          const checkDepth = (obj: any, depth = 0): boolean => {
            if (depth > 10) return false; // Max depth 10
            if (typeof obj === 'object' && obj !== null) {
              for (const value of Object.values(obj)) {
                if (!checkDepth(value, depth + 1)) return false;
              }
            }
            return true;
          };

          if (!checkDepth(body)) {
            errors.push('Request payload too deeply nested');
          }

          // Check for potentially dangerous keys
          const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
          const checkKeys = (obj: any): boolean => {
            if (typeof obj === 'object' && obj !== null) {
              for (const key of Object.keys(obj)) {
                if (dangerousKeys.includes(key) || !checkKeys(obj[key])) {
                  return false;
                }
              }
            }
            return true;
          };

          if (!checkKeys(body)) {
            errors.push('Potentially dangerous keys detected');
          }
        } catch (e) {
          errors.push('Invalid JSON payload');
        }
      }

      return { isValid: errors.length === 0, errors };
    } catch (error) {
      logger.error(LogCategory.SECURITY, 'Request validation error', error as Error);
      return { isValid: false, errors: ['Validation error'] };
    }
  }

  static checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = this.config.maxRequestsPerMinute;

    const existing = this.rateLimitMap.get(identifier);

    if (!existing || now > existing.resetTime) {
      // First request or window expired
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
    }

    if (existing.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: existing.resetTime };
    }

    existing.count++;
    return {
      allowed: true,
      remaining: maxRequests - existing.count,
      resetTime: existing.resetTime
    };
  }

  static addSecurityHeaders(response: NextResponse): NextResponse {
    if (!this.config.enableSecurityHeaders) return response;

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Enhanced Content Security Policy
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
        "font-src 'self' fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' wss: ws:",
        "media-src 'self' blob:",
        "object-src 'none'",
        "frame-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests"
      ].join('; ')
    );

    // CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // HSTS in production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    return response;
  }

  static async auditLog(request: NextRequest, user?: any, action?: string): Promise<void> {
    if (!this.config.enableAuditLogging) return;

    try {
      const auditEntry = {
        timestamp: new Date().toISOString(),
        userId: user?.id,
        userRole: user?.role,
        action: action || request.method,
        resource: request.nextUrl.pathname,
        method: request.method,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             request.headers.get('x-client-ip') ||
             'unknown',
        userAgent: request.headers.get('user-agent'),
        queryParams: Object.fromEntries(request.nextUrl.searchParams),
        success: true // This would be set based on response status
      };

      logger.logBusinessEvent('audit_log', auditEntry);
    } catch (error) {
      logger.error(LogCategory.SECURITY, 'Audit logging failed', error as Error);
    }
  }

  // Main middleware function
  static async handleSecurity(request: NextRequest): Promise<{ response?: NextResponse; continue: boolean }> {
    try {
      // Check if IP is blocked
      const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                      request.headers.get('x-real-ip') ||
                      request.headers.get('x-client-ip') ||
                      'unknown';
      if (this.config.blockedIPs.includes(clientIP)) {
        logger.warn(LogCategory.SECURITY, 'Blocked IP attempted access', { ip: clientIP });

        // Create security alert
        alertManager.addAlert({
          type: 'error',
          title: 'Blocked IP Access Attempt',
          message: `Blocked IP ${clientIP} attempted to access ${request.nextUrl.pathname}`,
          severity: 'high',
          source: 'security_middleware'
        });

        return {
          response: this.createProtectedResponse({ error: 'Access denied' }, 403),
          continue: false
        };
      }

      // Rate limiting
      if (this.config.enableRateLimiting) {
        const rateLimit = this.checkRateLimit(clientIP);
        if (!rateLimit.allowed) {
          logger.warn(LogCategory.SECURITY, 'Rate limit exceeded', {
            ip: clientIP,
            remaining: rateLimit.remaining,
            resetTime: rateLimit.resetTime
          });

          const response = NextResponse.json(
            { error: 'Rate limit exceeded' },
            {
              status: 429,
              headers: {
                'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
                'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                'X-RateLimit-Reset': rateLimit.resetTime.toString()
              }
            }
          );

          return { response: this.addSecurityHeaders(response), continue: false };
        }
      }

      // Request validation
      if (this.config.enableInputValidation) {
        const validation = await this.validateRequest(request);
        if (!validation.isValid) {
          logger.warn(LogCategory.SECURITY, 'Request validation failed', {
            errors: validation.errors,
            path: request.nextUrl.pathname
          });

          return {
            response: this.createProtectedResponse(
              { error: 'Invalid request', details: validation.errors },
              400
            ),
            continue: false
          };
        }
      }

      // Log security event for sensitive routes
      if (this.config.sensitiveRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
        logger.logSecurityEvent('sensitive_route_accessed', undefined, {
          path: request.nextUrl.pathname,
          method: request.method,
          ip: clientIP
        });
      }

      return { continue: true };
    } catch (error) {
      logger.error(LogCategory.SECURITY, 'Security middleware error', error as Error);

      return {
        response: this.createProtectedResponse({ error: 'Security check failed' }, 500),
        continue: false
      };
    }
  }

  // Utility method for creating protected API responses
  static createProtectedResponse(data: any, status = 200): NextResponse {
    const response = NextResponse.json(data, { status });
    return this.addSecurityHeaders(response);
  }
}

// Legacy compatibility function
export function securityMiddleware(request: NextRequest) {
  // For backward compatibility, this just adds security headers
  const response = NextResponse.next();
  return SecurityMiddleware.addSecurityHeaders(response);
}

// Clean up rate limit store periodically
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of SecurityMiddleware['rateLimitMap'].entries()) {
      if (now > data.resetTime) {
        SecurityMiddleware['rateLimitMap'].delete(ip);
      }
    }
  }, 60000); // Clean up every minute
}