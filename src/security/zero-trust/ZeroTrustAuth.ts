import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';

// Identity Context Interface
interface IdentityContext {
  userId: string;
  roles: string[];
  permissions: string[];
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  sessionStart?: number;
  lastActivity?: number;
  geolocation?: {
    country: string;
    region: string;
    riskScore: number;
  };
  behavioralPatterns: {
    loginFrequency: number;
    sessionDuration: number;
    accessPatterns: string[];
  };
  riskScore: number;
}

// Continuous Authentication Factors Interface
interface ContinuousAuthFactors {
  deviceTrust: number;
  behavioralAnomaly: number;
  locationRisk: number;
  timeBasedRisk: number;
  sessionAnomaly: number;
}

// Zero-Trust Authentication System
export class ZeroTrustAuth {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'zero-trust-secret';
  private static readonly REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';
  private static readonly TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';
  private static activeSessions = new Map<string, IdentityContext>();

  // Policy Engine Methods
  static evaluateAccess(context: IdentityContext, resource: string, action: string): boolean {
    // Role-based access control
    const hasRolePermission = context.roles.some(role =>
      this.checkRolePermission(role, resource, action)
    );

    // Attribute-based access control
    const hasAttributePermission = this.evaluateAttributes(context, resource, action);

    // Risk-based access control
    const riskAssessment = this.assessRisk(context);

    return hasRolePermission && hasAttributePermission && riskAssessment.allowed;
  }

  static checkRolePermission(role: string, resource: string, action: string): boolean {
    const rolePermissions: Record<string, Record<string, string[]>> = {
      admin: {
        '*': ['*']
      },
      manager: {
        'financial': ['read', 'write', 'approve'],
        'hr': ['read', 'write'],
        'projects': ['read', 'write', 'manage']
      },
      employee: {
        'financial': ['read'],
        'hr': ['read'],
        'projects': ['read', 'write']
      }
    };

    const permissions = rolePermissions[role];
    if (!permissions) return false;

    return !!(permissions[resource]?.includes(action) ||
           permissions[resource]?.includes('*') ||
           permissions['*']?.includes('*'));
  }

  static evaluateAttributes(context: IdentityContext, resource: string, action: string): boolean {
    // Time-based access control
    const currentHour = new Date().getHours();
    const isBusinessHours = currentHour >= 9 && currentHour <= 17;

    // Location-based access control
    const isTrustedLocation = (context.geolocation?.riskScore || 0) < 50;

    // Device trust assessment
    const isTrustedDevice = !!(context.deviceFingerprint &&
      this.verifyDeviceFingerprint(context.deviceFingerprint));

    return isBusinessHours && isTrustedLocation && isTrustedDevice;
  }

  static assessRisk(context: IdentityContext) {
    let riskScore = 0;

    // Behavioral risk
    if (context.behavioralPatterns.loginFrequency > 10) riskScore += 20;
    if (context.behavioralPatterns.sessionDuration > 8 * 60 * 60 * 1000) riskScore += 15; // 8 hours

    // Location risk
    if ((context.geolocation?.riskScore || 0) > 70) riskScore += 30;

    // Device risk
    if (!this.verifyDeviceFingerprint(context.deviceFingerprint)) riskScore += 25;

    return {
      score: riskScore,
      allowed: riskScore < 60,
      requiresMFA: riskScore > 30,
      requiresApproval: riskScore > 80
    };
  }

  static verifyDeviceFingerprint(fingerprint: string): boolean {
    // Verify device fingerprint against known trusted devices
    const trustedFingerprints = process.env.TRUSTED_DEVICE_FINGERPRINTS?.split(',') || [];
    return trustedFingerprints.includes(fingerprint);
  }

  // JWT Token Generation with Enhanced Security
  static generateTokens(payload: any, context: IdentityContext) {
    const enhancedPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
      iss: 'garlaws-zero-trust',
      aud: 'garlaws-platform',
      context: {
        deviceFingerprint: context.deviceFingerprint,
        ipAddress: context.ipAddress,
        riskScore: context.riskScore
      }
    };

    const accessToken = jwt.sign(enhancedPayload, this.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: this.TOKEN_EXPIRY
    });

    const refreshToken = jwt.sign({
      userId: payload.userId,
      tokenId: createHash('sha256').update(Date.now().toString()).digest('hex')
    }, this.REFRESH_TOKEN_SECRET, {
      algorithm: 'HS256',
      expiresIn: this.REFRESH_TOKEN_EXPIRY
    });

    return { accessToken, refreshToken };
  }

  // Token Validation with Context Verification
  static async validateToken(token: string, requiredContext?: Partial<IdentityContext>): Promise<any> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;

      // Validate token context
      if (requiredContext) {
        if (requiredContext.deviceFingerprint &&
            decoded.context.deviceFingerprint !== requiredContext.deviceFingerprint) {
          throw new Error('Device fingerprint mismatch');
        }

        if (requiredContext.ipAddress &&
            decoded.context.ipAddress !== requiredContext.ipAddress) {
          throw new Error('IP address mismatch');
        }
      }

      // Check token expiration with buffer
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now + 60) { // 1 minute buffer
        throw new Error('Token expired');
      }

      return decoded;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Token validation failed: ${errorMessage}`);
    }
  }

  // Continuous Authentication
  static async continuousAuthCheck(sessionId: string, factors: ContinuousAuthFactors) {
    const riskThresholds = {
      deviceTrust: 80,
      behavioralAnomaly: 70,
      locationRisk: 60,
      timeBasedRisk: 50,
      sessionAnomaly: 75
    };

    const overallRisk = (
      factors.deviceTrust * 0.3 +
      factors.behavioralAnomaly * 0.25 +
      factors.locationRisk * 0.2 +
      factors.timeBasedRisk * 0.15 +
      factors.sessionAnomaly * 0.1
    );

    return {
      riskScore: overallRisk,
      requiresReAuth: overallRisk > 70,
      requiresMFA: overallRisk > 50,
      trustLevel: overallRisk < 30 ? 'high' : overallRisk < 60 ? 'medium' : 'low'
    };
  }

  // Session Management
  static createSession(userId: string, context: IdentityContext): string {
    const sessionId = createHash('sha256')
      .update(`${userId}-${Date.now()}-${Math.random()}`)
      .digest('hex');

    this.activeSessions.set(sessionId, {
      ...context,
      sessionStart: Date.now(),
      lastActivity: Date.now()
    });

    return sessionId;
  }

  static validateSession(sessionId: string): IdentityContext | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    // Check session timeout (8 hours)
    const sessionTimeout = 8 * 60 * 60 * 1000;
    if (Date.now() - (session.sessionStart || 0) > sessionTimeout) {
      this.activeSessions.delete(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = Date.now();
    return session;
  }

  static invalidateSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
  }

  static getActiveSessions(): [string, IdentityContext][] {
    return Array.from(this.activeSessions.entries());
  }
}

// Zero-Trust Middleware
export async function zeroTrustMiddleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const sessionId = request.headers.get('x-session-id');

  if (!token || !sessionId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Validate session
    const session = ZeroTrustAuth.validateSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Validate token with context
    const decoded = await ZeroTrustAuth.validateToken(token, {
      deviceFingerprint: session.deviceFingerprint,
      ipAddress: (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown'
    });

    // Evaluate access policy
    const resource = request.nextUrl.pathname;
    const action = request.method.toLowerCase();

    const hasAccess = ZeroTrustAuth.evaluateAccess(session, resource, action);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Add security headers
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}

export default ZeroTrustAuth;