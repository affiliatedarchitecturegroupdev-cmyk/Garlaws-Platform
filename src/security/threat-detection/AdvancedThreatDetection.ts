import { NextRequest, NextResponse } from 'next/server';

// Threat Detection Event Types
interface ThreatEvent {
  id: string;
  timestamp: Date;
  type: ThreatType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  indicators: ThreatIndicator[];
  context: Record<string, any>;
  riskScore: number;
  status: 'detected' | 'investigating' | 'contained' | 'resolved';
}

type ThreatType =
  | 'brute_force'
  | 'sql_injection'
  | 'xss'
  | 'ddos'
  | 'malware'
  | 'phishing'
  | 'unauthorized_access'
  | 'data_exfiltration'
  | 'insider_threat'
  | 'anomaly_behavior';

interface ThreatIndicator {
  type: 'ip' | 'user_agent' | 'request_pattern' | 'behavioral' | 'signature';
  value: string;
  confidence: number;
  metadata?: Record<string, any>;
}

interface UserBehaviorProfile {
  userId: string;
  loginPatterns: {
    usualHours: number[];
    usualLocations: string[];
    usualDevices: string[];
    averageSessionDuration: number;
  };
  requestPatterns: {
    usualEndpoints: string[];
    usualMethods: string[];
    averageRequestRate: number;
    usualDataVolumes: number[];
  };
  riskHistory: number[];
  lastUpdated: Date;
}

// Machine Learning Model for Anomaly Detection
class AnomalyDetector {
  private static readonly NORMALIZATION_FACTOR = 1000;
  private static readonly ANOMALY_THRESHOLD = 0.85;

  // Behavioral baseline profiles
  private userBaselines = new Map<string, UserBehaviorProfile>();

  // Train behavioral model with historical data
  trainBehavioralModel(userId: string, historicalData: any[]): void {
    const profile: UserBehaviorProfile = {
      userId,
      loginPatterns: this.analyzeLoginPatterns(historicalData),
      requestPatterns: this.analyzeRequestPatterns(historicalData),
      riskHistory: historicalData.map(d => d.riskScore || 0),
      lastUpdated: new Date()
    };

    this.userBaselines.set(userId, profile);
  }

  // Detect behavioral anomalies
  detectBehavioralAnomaly(userId: string, currentActivity: any): ThreatEvent | null {
    const profile = this.userBaselines.get(userId);
    if (!profile) return null;

    const anomalies = [];
    let totalRisk = 0;

    // Login pattern analysis
    const loginAnomaly = this.analyzeLoginAnomaly(currentActivity, profile.loginPatterns);
    if (loginAnomaly.score > AnomalyDetector.ANOMALY_THRESHOLD) {
      anomalies.push(loginAnomaly);
      totalRisk += loginAnomaly.score * 0.4;
    }

    // Request pattern analysis
    const requestAnomaly = this.analyzeRequestAnomaly(currentActivity, profile.requestPatterns);
    if (requestAnomaly.score > AnomalyDetector.ANOMALY_THRESHOLD) {
      anomalies.push(requestAnomaly);
      totalRisk += requestAnomaly.score * 0.3;
    }

    // Temporal pattern analysis
    const temporalAnomaly = this.analyzeTemporalAnomaly(currentActivity, profile);
    if (temporalAnomaly.score > AnomalyDetector.ANOMALY_THRESHOLD) {
      anomalies.push(temporalAnomaly);
      totalRisk += temporalAnomaly.score * 0.3;
    }

    if (totalRisk > AnomalyDetector.ANOMALY_THRESHOLD) {
      return {
        id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        type: 'anomaly_behavior',
        severity: totalRisk > 0.95 ? 'critical' : totalRisk > 0.90 ? 'high' : 'medium',
        source: 'behavioral_analysis',
        description: `Behavioral anomaly detected for user ${userId}`,
        indicators: anomalies.flatMap(a => a.indicators),
        context: { userId, anomalies, profile },
        riskScore: totalRisk,
        status: 'detected'
      };
    }

    return null;
  }

  private analyzeLoginPatterns(data: any[]): UserBehaviorProfile['loginPatterns'] {
    // Analyze historical login data to establish patterns
    const hours = data.map(d => new Date(d.timestamp).getHours());
    const locations = data.map(d => d.location).filter(Boolean);
    const devices = data.map(d => d.deviceFingerprint).filter(Boolean);
    const durations = data.map(d => d.sessionDuration || 0);

    return {
      usualHours: this.findMostCommon(hours, 3),
      usualLocations: this.findMostCommon(locations, 3),
      usualDevices: this.findMostCommon(devices, 3),
      averageSessionDuration: durations.reduce((a, b) => a + b, 0) / durations.length
    };
  }

  private analyzeRequestPatterns(data: any[]): UserBehaviorProfile['requestPatterns'] {
    const endpoints = data.map(d => d.endpoint);
    const methods = data.map(d => d.method);
    const rates = data.map(d => d.requestsPerMinute || 0);
    const volumes = data.map(d => d.dataVolume || 0);

    return {
      usualEndpoints: this.findMostCommon(endpoints, 5),
      usualMethods: this.findMostCommon(methods, 3),
      averageRequestRate: rates.reduce((a, b) => a + b, 0) / rates.length,
      usualDataVolumes: this.findMostCommon(volumes, 3)
    };
  }

  private analyzeLoginAnomaly(activity: any, patterns: UserBehaviorProfile['loginPatterns']) {
    let score = 0;
    const indicators: ThreatIndicator[] = [];

    // Check unusual login time
    const currentHour = new Date(activity.timestamp).getHours();
    if (!patterns.usualHours.includes(currentHour)) {
      score += 0.3;
      indicators.push({
        type: 'behavioral',
        value: `unusual_login_hour_${currentHour}`,
        confidence: 0.8
      });
    }

    // Check unusual location
    if (activity.location && !patterns.usualLocations.includes(activity.location)) {
      score += 0.4;
      indicators.push({
        type: 'behavioral',
        value: `unusual_location_${activity.location}`,
        confidence: 0.9
      });
    }

    // Check unusual device
    if (activity.deviceFingerprint && !patterns.usualDevices.includes(activity.deviceFingerprint)) {
      score += 0.3;
      indicators.push({
        type: 'behavioral',
        value: `unusual_device_${activity.deviceFingerprint}`,
        confidence: 0.7
      });
    }

    return { score, indicators };
  }

  private analyzeRequestAnomaly(activity: any, patterns: UserBehaviorProfile['requestPatterns']) {
    let score = 0;
    const indicators: ThreatIndicator[] = [];

    // Check unusual endpoint access
    if (activity.endpoint && !patterns.usualEndpoints.includes(activity.endpoint)) {
      score += 0.2;
      indicators.push({
        type: 'behavioral',
        value: `unusual_endpoint_${activity.endpoint}`,
        confidence: 0.6
      });
    }

    // Check unusual request rate
    if (activity.requestsPerMinute > patterns.averageRequestRate * 2) {
      score += 0.3;
      indicators.push({
        type: 'behavioral',
        value: `high_request_rate_${activity.requestsPerMinute}`,
        confidence: 0.8
      });
    }

    return { score, indicators };
  }

  private analyzeTemporalAnomaly(activity: any, profile: UserBehaviorProfile) {
    let score = 0;
    const indicators: ThreatIndicator[] = [];

    // Check for rapid successive logins
    const recentLogins = profile.riskHistory.slice(-10);
    const highRiskCount = recentLogins.filter(risk => risk > 0.7).length;

    if (highRiskCount > 3) {
      score += 0.4;
      indicators.push({
        type: 'behavioral',
        value: `frequent_high_risk_activity_${highRiskCount}`,
        confidence: 0.9
      });
    }

    return { score, indicators };
  }

  private findMostCommon<T>(array: T[], limit: number): T[] {
    const frequency: Record<string, number> = {};
    array.forEach(item => {
      const key = String(item);
      frequency[key] = (frequency[key] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([key]) => key as T);
  }
}

// Advanced Threat Detection Engine
export class AdvancedThreatDetection {
  private static anomalyDetector = new AnomalyDetector();
  private static threatEvents: ThreatEvent[] = [];
  private static activeResponses = new Map<string, ThreatResponse>();

  // Threat Intelligence Feeds
  private static threatIntelFeeds = [
    'https://threatintel.example.com/api/v1/indicators',
    'https://openphish.com/feed.txt',
    'https://urlhaus.abuse.ch/downloads/text/'
  ];

  // Real-time Threat Detection
  static async analyzeRequest(request: NextRequest, userContext?: any): Promise<ThreatEvent | null> {
    const threats: ThreatEvent[] = [];

    // 1. Signature-based detection
    const signatureThreat = this.signatureBasedDetection(request);
    if (signatureThreat) threats.push(signatureThreat);

    // 2. Behavioral anomaly detection
    if (userContext?.userId) {
      const behavioralThreat = this.anomalyDetector.detectBehavioralAnomaly(
        userContext.userId,
        {
          timestamp: new Date(),
          location: request.headers.get('x-forwarded-for') || 'unknown',
          deviceFingerprint: request.headers.get('x-device-fingerprint') || 'unknown',
          endpoint: request.nextUrl.pathname,
          method: request.method,
          requestsPerMinute: userContext.requestsPerMinute || 0,
          sessionDuration: userContext.sessionDuration || 0
        }
      );
      if (behavioralThreat) threats.push(behavioralThreat);
    }

    // 3. Rate limiting analysis
    const rateLimitThreat = this.analyzeRateLimiting(request, userContext);
    if (rateLimitThreat) threats.push(rateLimitThreat);

    // 4. Threat intelligence correlation
    const correlatedThreats = await this.correlateWithThreatIntel(threats);
    threats.push(...correlatedThreats);

    // Return the highest severity threat
    return threats.sort((a, b) => this.getSeverityScore(b.severity) - this.getSeverityScore(a.severity))[0] || null;
  }

  // Signature-based Detection
  private static signatureBasedDetection(request: NextRequest): ThreatEvent | null {
    const userAgent = request.headers.get('user-agent') || '';
    const url = request.nextUrl.toString();
    const body = request.body ? JSON.stringify(request.body) : '';

    // SQL Injection patterns
    const sqlPatterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
      /('|(\\x27)|(\\x2D\\x2D)|(\\#)|(\\x23)|(\%27)|(\%23)|(\%2D\\x2D))/i
    ];

    // XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>.*?<\/iframe>/i
    ];

    // Check SQL injection
    for (const pattern of sqlPatterns) {
      if (pattern.test(url) || pattern.test(body)) {
        return {
          id: `sql-injection-${Date.now()}`,
          timestamp: new Date(),
          type: 'sql_injection',
          severity: 'high',
          source: 'signature_detection',
          description: 'Potential SQL injection attempt detected',
          indicators: [{
            type: 'signature',
            value: 'sql_injection_pattern',
            confidence: 0.9,
            metadata: { pattern: pattern.source, url, body }
          }],
          context: { url, userAgent },
          riskScore: 0.9,
          status: 'detected'
        };
      }
    }

    // Check XSS
    for (const pattern of xssPatterns) {
      if (pattern.test(url) || pattern.test(body)) {
        return {
          id: `xss-${Date.now()}`,
          timestamp: new Date(),
          type: 'xss',
          severity: 'high',
          source: 'signature_detection',
          description: 'Potential cross-site scripting attempt detected',
          indicators: [{
            type: 'signature',
            value: 'xss_pattern',
            confidence: 0.85,
            metadata: { pattern: pattern.source, url, body }
          }],
          context: { url, userAgent },
          riskScore: 0.85,
          status: 'detected'
        };
      }
    }

    return null;
  }

  // Rate Limiting Analysis
  private static analyzeRateLimiting(request: NextRequest, userContext?: any): ThreatEvent | null {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const requestsPerMinute = userContext?.requestsPerMinute || 0;

    // DDoS detection thresholds
    if (requestsPerMinute > 1000) {
      return {
        id: `ddos-${Date.now()}`,
        timestamp: new Date(),
        type: 'ddos',
        severity: 'critical',
        source: 'rate_limiting',
        description: 'Distributed denial of service attack detected',
        indicators: [{
          type: 'request_pattern',
          value: `high_request_rate_${requestsPerMinute}`,
          confidence: 0.95,
          metadata: { ip, requestsPerMinute }
        }],
        context: { ip, requestsPerMinute },
        riskScore: 0.95,
        status: 'detected'
      };
    }

    // Brute force detection
    if (requestsPerMinute > 100 && request.nextUrl.pathname.includes('/auth')) {
      return {
        id: `brute-force-${Date.now()}`,
        timestamp: new Date(),
        type: 'brute_force',
        severity: 'high',
        source: 'rate_limiting',
        description: 'Brute force authentication attempt detected',
        indicators: [{
          type: 'request_pattern',
          value: `auth_brute_force_${requestsPerMinute}`,
          confidence: 0.9,
          metadata: { ip, requestsPerMinute, endpoint: request.nextUrl.pathname }
        }],
        context: { ip, requestsPerMinute },
        riskScore: 0.9,
        status: 'detected'
      };
    }

    return null;
  }

  // Threat Intelligence Correlation
  private static async correlateWithThreatIntel(threats: ThreatEvent[]): Promise<ThreatEvent[]> {
    const correlatedThreats: ThreatEvent[] = [];

    for (const threat of threats) {
      // Check against threat intelligence feeds
      for (const indicator of threat.indicators) {
        const intelResult = await this.checkThreatIntelFeed(indicator);
        if (intelResult.malicious) {
          correlatedThreats.push({
            id: `intel-correlation-${Date.now()}`,
            timestamp: new Date(),
            type: threat.type,
            severity: 'critical',
            source: 'threat_intelligence',
            description: `Threat intelligence correlation: ${intelResult.description}`,
            indicators: [{
              type: 'signature',
              value: `threat_intel_${indicator.value}`,
              confidence: 0.95,
              metadata: intelResult
            }],
            context: { originalThreat: threat.id, intelResult },
            riskScore: 0.95,
            status: 'detected'
          });
        }
      }
    }

    return correlatedThreats;
  }

  // Threat Intelligence Feed Checking
  private static async checkThreatIntelFeed(indicator: ThreatIndicator): Promise<{
    malicious: boolean;
    description: string;
    source?: string;
  }> {
    // Simplified threat intelligence checking
    // In production, this would query actual threat intelligence feeds
    const knownMaliciousIndicators = [
      'malicious-ip-1.2.3.4',
      'suspicious-domain.example.com',
      'known-malware-signature'
    ];

    if (knownMaliciousIndicators.includes(indicator.value)) {
      return {
        malicious: true,
        description: `Known malicious indicator: ${indicator.value}`,
        source: 'global_threat_feed'
      };
    }

    return { malicious: false, description: 'No matches found' };
  }

  // Automated Response System
  static async executeAutomatedResponse(threat: ThreatEvent): Promise<ThreatResponse> {
    const response: ThreatResponse = {
      id: `response-${threat.id}`,
      threatId: threat.id,
      actions: [],
      timestamp: new Date(),
      status: 'executing'
    };

    this.activeResponses.set(threat.id, response);

    try {
      switch (threat.severity) {
        case 'critical':
          response.actions = await this.executeCriticalResponse(threat);
          break;
        case 'high':
          response.actions = await this.executeHighResponse(threat);
          break;
        case 'medium':
          response.actions = await this.executeMediumResponse(threat);
          break;
        default:
          response.actions = await this.executeLowResponse(threat);
      }

      response.status = 'completed';
      threat.status = 'contained';
    } catch (error) {
      response.status = 'failed';
      response.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return response;
  }

  private static async executeCriticalResponse(threat: ThreatEvent): Promise<ResponseAction[]> {
    const actions: ResponseAction[] = [];

    // Immediate blocking
    if (threat.indicators.some(i => i.type === 'ip')) {
      actions.push({
        type: 'block_ip',
        target: threat.indicators.find(i => i.type === 'ip')!.value,
        duration: 'permanent',
        reason: 'Critical threat detected'
      });
    }

    // Alert security team
    actions.push({
      type: 'alert_security_team',
      target: 'security@garlaws.com',
      reason: 'Critical threat alert',
      priority: 'critical',
      message: `CRITICAL: ${threat.description}`
    });

    // Enable enhanced monitoring
    actions.push({
      type: 'enable_enhanced_monitoring',
      target: threat.context.userId || 'system',
      duration: '24h',
      reason: 'Critical threat investigation'
    });

    return actions;
  }

  private static async executeHighResponse(threat: ThreatEvent): Promise<ResponseAction[]> {
    const actions: ResponseAction[] = [];

    // Temporary blocking
    if (threat.indicators.some(i => i.type === 'ip')) {
      actions.push({
        type: 'block_ip',
        target: threat.indicators.find(i => i.type === 'ip')!.value,
        duration: '1h',
        reason: 'High-risk activity detected'
      });
    }

    // Force password change
    if (threat.context.userId) {
      actions.push({
        type: 'force_password_change',
        target: threat.context.userId,
        reason: 'Suspicious activity detected'
      });
    }

    // Enable MFA requirement
    if (threat.context.userId) {
      actions.push({
        type: 'require_mfa',
        target: threat.context.userId,
        duration: '24h',
        reason: 'Enhanced security required'
      });
    }

    return actions;
  }

  private static async executeMediumResponse(threat: ThreatEvent): Promise<ResponseAction[]> {
    const actions: ResponseAction[] = [];

    // Log detailed activity
    actions.push({
      type: 'log_activity',
      target: threat.context.userId || 'system',
      duration: '7d',
      reason: 'Monitoring suspicious activity'
    });

    // Send user notification
    if (threat.context.userId) {
      actions.push({
        type: 'notify_user',
        target: String(threat.context.userId),
        reason: 'Suspicious activity notification',
        message: 'Unusual activity detected. Please verify your account security.'
      });
    }

    return actions;
  }

  private static async executeLowResponse(threat: ThreatEvent): Promise<ResponseAction[]> {
    const actions: ResponseAction[] = [];

    // Log for monitoring
    actions.push({
      type: 'log_threat',
      target: threat.id,
      severity: 'low',
      reason: 'Low-risk anomaly detected'
    });

    return actions;
  }

  private static getSeverityScore(severity: string): number {
    const scores = { low: 1, medium: 2, high: 3, critical: 4 };
    return scores[severity as keyof typeof scores] || 0;
  }
}

// Threat Response Types
interface ThreatResponse {
  id: string;
  threatId: string;
  actions: ResponseAction[];
  timestamp: Date;
  status: 'executing' | 'completed' | 'failed';
  error?: string;
}

interface ResponseAction {
  type: 'block_ip' | 'alert_security_team' | 'enable_enhanced_monitoring' |
        'force_password_change' | 'require_mfa' | 'log_activity' | 'notify_user' | 'log_threat';
  target: string;
  duration?: string;
  reason: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  message?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export default AdvancedThreatDetection;