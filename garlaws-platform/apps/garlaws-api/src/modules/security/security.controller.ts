import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { RateLimiterService } from './rate-limiter.service';

@Controller('api/security')
export class SecurityController {
  constructor(
    private readonly rateLimiterService: RateLimiterService,
    private readonly throttlerStorage: ThrottlerStorage,
  ) {}

  @Get('status')
  getSecurityStatus() {
    return {
      status: 'operational',
      version: '1.0.0',
      features: {
        rateLimiting: true,
        cors: true,
        helmet: true,
        encryption: true,
      },
      compliance: {
        popia: true,
        bbee: 'Level 2',
        sars: 'VAT 15%',
      },
    };
  }

  @Get('rate-limit/status')
  async getRateLimitStatus(@Headers('x-forwarded-for') ip: string) {
    const limits = await this.rateLimiterService.getClientLimits(ip || 'unknown');
    return {
      ip: ip || 'unknown',
      limits,
    };
  }

  @Get('headers')
  getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'",
    };
  }
}