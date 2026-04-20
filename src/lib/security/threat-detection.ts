// Advanced Security Framework with Threat Detection and Automated Response

import {
  SecurityEvent,
  ThreatIndicator,
  SecurityRule,
  SecurityCondition,
  SecurityAction,
  SecurityIncident,
  IncidentTimelineEntry
} from './security-models';

export class ThreatDetectionEngine {
  private rules: Map<string, SecurityRule> = new Map();
  private indicators: Map<string, ThreatIndicator> = new Map();
  private activeIncidents: Map<string, SecurityIncident> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.initializeThreatIndicators();
  }

  private initializeDefaultRules() {
    const rules: SecurityRule[] = [
      {
        id: 'brute_force_detection',
        name: 'Brute Force Attack Detection',
        description: 'Detect multiple failed login attempts from same IP',
        type: 'behavioral',
        category: 'authentication',
        conditions: [
          {
            field: 'eventCount',
            operator: 'greater_than',
            value: 5,
            logic: 'AND',
            weight: 1.0
          },
          {
            field: 'timeWindow',
            operator: 'less_than',
            value: 300, // 5 minutes
            logic: 'AND',
            weight: 0.8
          },
          {
            field: 'success',
            operator: 'equals',
            value: false,
            logic: 'AND',
            weight: 1.0
          }
        ],
        actions: [
          {
            type: 'rate_limit',
            config: { duration: 900, maxRequests: 3 }, // 15 min block
            delay: 0
          },
          {
            type: 'alert',
            config: { severity: 'high', channels: ['email', 'slack'] },
            delay: 0
          }
        ],
        severity: 'high',
        enabled: true,
        priority: 100,
        cooldown: 300,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'suspicious_location',
        name: 'Login from Unusual Location',
        description: 'Detect login from geographically unusual location',
        type: 'behavioral',
        category: 'authentication',
        conditions: [
          {
            field: 'location.country',
            operator: 'not_equals',
            value: 'ZA', // South Africa
            logic: 'AND',
            weight: 0.7
          },
          {
            field: 'user.loginHistory.locations',
            operator: 'not_contains',
            value: 'current_location',
            logic: 'AND',
            weight: 0.8
          }
        ],
        actions: [
          {
            type: 'require_mfa',
            config: { temporary: true },
            delay: 0
          },
          {
            type: 'alert',
            config: { severity: 'medium', channels: ['email'] },
            delay: 0
          }
        ],
        severity: 'medium',
        enabled: true,
        priority: 80,
        cooldown: 3600,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'data_exfiltration_attempt',
        name: 'Data Exfiltration Attempt',
        description: 'Detect unusual data export patterns',
        type: 'anomaly',
        category: 'data',
        conditions: [
          {
            field: 'dataSize',
            operator: 'greater_than',
            value: 1000000, // 1MB
            logic: 'AND',
            weight: 0.8
          },
          {
            field: 'exportFrequency',
            operator: 'greater_than',
            value: 10,
            logic: 'AND',
            weight: 0.9
          },
          {
            field: 'user.permissions',
            operator: 'not_contains',
            value: 'data_export',
            logic: 'AND',
            weight: 1.0
          }
        ],
        actions: [
          {
            type: 'block',
            config: { temporary: true, duration: 3600 },
            delay: 0
          },
          {
            type: 'alert',
            config: { severity: 'critical', channels: ['email', 'sms', 'slack'] },
            delay: 0
          },
          {
            type: 'terminate_session',
            config: {},
            delay: 0
          }
        ],
        severity: 'critical',
        enabled: true,
        priority: 200,
        cooldown: 1800,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    rules.forEach(rule => this.rules.set(rule.id, rule));
  }

  private initializeThreatIndicators() {
    // Initialize with some common threat indicators
    const indicators: ThreatIndicator[] = [
      {
        id: 'known_malware_ip',
        type: 'ip_address',
        value: '192.168.1.100', // Example - would be real threat IPs
        confidence: 0.95,
        severity: 'high',
        category: 'malware',
        description: 'Known malware distribution IP',
        firstSeen: new Date(Date.now() - 86400000), // 1 day ago
        lastSeen: new Date(),
        occurrences: 15,
        blocked: true,
        metadata: { source: 'threat_intelligence_feed' }
      },
      {
        id: 'suspicious_user_agent',
        type: 'user_agent',
        value: 'MaliciousBot/1.0',
        confidence: 0.85,
        severity: 'medium',
        category: 'unauthorized_access',
        description: 'Automated scanning tool',
        firstSeen: new Date(Date.now() - 3600000), // 1 hour ago
        lastSeen: new Date(),
        occurrences: 8,
        blocked: false,
        metadata: { pattern: 'automated_scanning' }
      }
    ];

    indicators.forEach(indicator => this.indicators.set(indicator.id, indicator));
  }

  // Main event processing method
  async processSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'riskScore'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      riskScore: await this.calculateRiskScore(event as SecurityEvent)
    };

    // Check against threat indicators
    const indicatorMatch = this.checkThreatIndicators(securityEvent);
    if (indicatorMatch) {
      await this.handleThreatIndicatorMatch(securityEvent, indicatorMatch);
    }

    // Evaluate security rules
    const ruleMatches = this.evaluateSecurityRules(securityEvent);
    for (const match of ruleMatches) {
      await this.executeSecurityActions(securityEvent, match.rule, match.score);
    }

    // Log the event
    this.logSecurityEvent(securityEvent);
  }

  private async calculateRiskScore(event: SecurityEvent): Promise<number> {
    let score = 0;

    // Base scoring based on event type and success
    switch (event.type) {
      case 'authentication':
        score += event.success ? 10 : 50;
        break;
      case 'authorization':
        score += event.success ? 20 : 70;
        break;
      case 'access':
        score += event.success ? 15 : 60;
        break;
      case 'data':
        score += 80; // Data events are high risk
        break;
      case 'network':
        score += 40;
        break;
      case 'system':
        score += 30;
        break;
      case 'application':
        score += 25;
        break;
    }

    // Location-based scoring
    if (event.location) {
      if (event.location.country !== 'ZA') {
        score += 20; // International access
      }
    }

    // Time-based scoring
    const hour = event.timestamp.getHours();
    if (hour < 6 || hour > 22) {
      score += 15; // Unusual hours
    }

    // User behavior scoring
    if (event.userId) {
      // Check user history for anomalies
      const userHistory = await this.getUserSecurityHistory(event.userId);
      if (userHistory.failedAttempts > 3) {
        score += 30;
      }
      if (userHistory.unusualLocations) {
        score += 25;
      }
    }

    return Math.min(score, 100);
  }

  private checkThreatIndicators(event: SecurityEvent): ThreatIndicator | null {
    // Check IP addresses
    if (event.ipAddress) {
      const ipIndicator = Array.from(this.indicators.values())
        .find(ind => ind.type === 'ip_address' && ind.value === event.ipAddress && ind.blocked);
      if (ipIndicator) return ipIndicator;
    }

    // Check user agents
    if (event.userAgent) {
      const uaIndicator = Array.from(this.indicators.values())
        .find(ind => ind.type === 'user_agent' && event.userAgent?.includes(ind.value));
      if (uaIndicator) return uaIndicator;
    }

    return null;
  }

  private async handleThreatIndicatorMatch(event: SecurityEvent, indicator: ThreatIndicator): Promise<void> {
    // Create a security incident for the threat indicator match
    const incident: SecurityIncident = {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `Threat Indicator Match: ${indicator.description}`,
      description: `Security event matched known threat indicator: ${indicator.description}`,
      severity: indicator.severity,
      status: 'open',
      type: indicator.category,
      affectedResources: [event.resource],
      affectedUsers: event.userId ? [event.userId] : [],
      events: [event],
      indicators: [indicator],
      timeline: [
        {
          timestamp: new Date(),
          type: 'detection',
          description: `Event matched threat indicator: ${indicator.description}`,
          details: { indicatorId: indicator.id, eventId: event.id }
        }
      ],
      impact: {
        users: event.userId ? 1 : 0,
        systems: 1,
        data: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.activeIncidents.set(incident.id, incident);
    await this.triggerIncidentResponse(incident);
  }

  private evaluateSecurityRules(event: SecurityEvent): Array<{ rule: SecurityRule; score: number }> {
    const matches: Array<{ rule: SecurityRule; score: number }> = [];

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      let totalScore = 0;
      let conditionsMet = 0;

      for (const condition of rule.conditions) {
        const conditionMet = this.evaluateSecurityCondition(event, condition);
        if (conditionMet) {
          totalScore += condition.weight * 100;
          conditionsMet++;
        } else if (condition.logic === 'AND') {
          // AND logic - one false condition fails the rule
          totalScore = 0;
          break;
        }
      }

      // For OR logic, we need at least one condition met
      if (rule.conditions.some(c => c.logic === 'OR') && conditionsMet === 0) {
        continue;
      }

      if (totalScore > 0) {
        // Check cooldown period
        if (rule.lastTriggered && Date.now() - rule.lastTriggered.getTime() < rule.cooldown * 1000) {
          continue; // Still in cooldown
        }

        matches.push({ rule, score: totalScore });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  private evaluateSecurityCondition(event: SecurityEvent, condition: SecurityCondition): boolean {
    const value = this.getEventFieldValue(event, condition.field);

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'not_contains':
        return !String(value).includes(String(condition.value));
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'in_range':
        const [min, max] = condition.value;
        return Number(value) >= min && Number(value) <= max;
      case 'regex':
        return new RegExp(condition.value).test(String(value));
      default:
        return false;
    }
  }

  private getEventFieldValue(event: SecurityEvent, field: string): any {
    const parts = field.split('.');
    let value: any = event;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private async executeSecurityActions(event: SecurityEvent, rule: SecurityRule, score: number): Promise<void> {
    // Update rule's last triggered time
    rule.lastTriggered = new Date();

    // Execute actions in parallel
    const actionPromises = rule.actions.map(async (action) => {
      await this.delay(action.delay || 0);
      await this.executeSecurityAction(event, action, rule.severity);
    });

    await Promise.allSettled(actionPromises);

    // Create incident if severity is high enough
    if (rule.severity === 'high' || rule.severity === 'critical') {
      await this.createSecurityIncident(event, rule, score);
    }
  }

  private async executeSecurityAction(event: SecurityEvent, action: SecurityAction, severity: SecurityRule['severity']): Promise<void> {
    switch (action.type) {
      case 'block':
        await this.executeBlockAction(event, action.config);
        break;
      case 'alert':
        await this.executeAlertAction(event, action.config, severity);
        break;
      case 'log':
        await this.executeLogAction(event, action.config);
        break;
      case 'redirect':
        await this.executeRedirectAction(event, action.config);
        break;
      case 'rate_limit':
        await this.executeRateLimitAction(event, action.config);
        break;
      case 'terminate_session':
        await this.executeTerminateSessionAction(event, action.config);
        break;
      case 'require_mfa':
        await this.executeRequireMFAAction(event, action.config);
        break;
      case 'notify_admin':
        await this.executeNotifyAdminAction(event, action.config);
        break;
    }
  }

  private async createSecurityIncident(event: SecurityEvent, rule: SecurityRule, score: number): Promise<void> {
    const incident: SecurityIncident = {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `${rule.name} - ${event.resource}`,
      description: `Security rule "${rule.name}" was triggered for ${event.action} on ${event.resource}`,
      severity: rule.severity,
      status: 'open',
      type: rule.category,
      affectedResources: [event.resource],
      affectedUsers: event.userId ? [event.userId] : [],
      events: [event],
      indicators: [],
      timeline: [
        {
          timestamp: new Date(),
          type: 'detection',
          description: `Security rule "${rule.name}" triggered with score ${score}`,
          details: { ruleId: rule.id, eventId: event.id, score }
        }
      ],
      impact: {
        users: event.userId ? 1 : 0,
        systems: 1,
        data: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.activeIncidents.set(incident.id, incident);

    // Trigger incident response workflow
    await this.triggerIncidentResponse(incident);
  }

  private async triggerIncidentResponse(incident: SecurityIncident): Promise<void> {
    // This would trigger automated incident response workflows
    // For now, just log the incident
    console.log('Security incident created:', incident.id, incident.title);

    // In a real implementation, this would:
    // 1. Notify security team
    // 2. Start automated investigation
    // 3. Implement containment measures
    // 4. Escalate based on severity
  }

  // Action implementations (simplified)
  private async executeBlockAction(event: SecurityEvent, config: any): Promise<void> {
    console.log('Executing block action for event:', event.id, config);
    // Implement blocking logic (IP blocking, user blocking, etc.)
  }

  private async executeAlertAction(event: SecurityEvent, config: any, severity: string): Promise<void> {
    console.log('Executing alert action for event:', event.id, config, severity);
    // Send alerts via configured channels
  }

  private async executeLogAction(event: SecurityEvent, config: any): Promise<void> {
    console.log('Executing log action for event:', event.id, config);
    // Enhanced logging
  }

  private async executeRedirectAction(event: SecurityEvent, config: any): Promise<void> {
    console.log('Executing redirect action for event:', event.id, config);
    // Redirect user
  }

  private async executeRateLimitAction(event: SecurityEvent, config: any): Promise<void> {
    console.log('Executing rate limit action for event:', event.id, config);
    // Implement rate limiting
  }

  private async executeTerminateSessionAction(event: SecurityEvent, config: any): Promise<void> {
    console.log('Executing terminate session action for event:', event.id, config);
    // Terminate user session
  }

  private async executeRequireMFAAction(event: SecurityEvent, config: any): Promise<void> {
    console.log('Executing require MFA action for event:', event.id, config);
    // Require additional authentication
  }

  private async executeNotifyAdminAction(event: SecurityEvent, config: any): Promise<void> {
    console.log('Executing notify admin action for event:', event.id, config);
    // Notify administrators
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms * 1000));
  }

  private async getUserSecurityHistory(userId: string): Promise<any> {
    // Get user's security history
    return {
      failedAttempts: 0,
      unusualLocations: false,
      lastLogin: new Date()
    };
  }

  private logSecurityEvent(event: SecurityEvent): void {
    // Log to security event store
    console.log('Security event logged:', event.id, event.type, event.severity);
  }

  // Public API methods
  getActiveIncidents(): SecurityIncident[] {
    return Array.from(this.activeIncidents.values());
  }

  getSecurityRules(): SecurityRule[] {
    return Array.from(this.rules.values());
  }

  getThreatIndicators(): ThreatIndicator[] {
    return Array.from(this.indicators.values());
  }

  addSecurityRule(rule: SecurityRule): void {
    this.rules.set(rule.id, rule);
  }

  updateSecurityRule(ruleId: string, updates: Partial<SecurityRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      this.rules.set(ruleId, { ...rule, ...updates, updatedAt: new Date() });
      return true;
    }
    return false;
  }

  removeSecurityRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  addThreatIndicator(indicator: ThreatIndicator): void {
    this.indicators.set(indicator.id, indicator);
  }

  updateIncidentStatus(incidentId: string, status: SecurityIncident['status'], resolution?: string): boolean {
    const incident = this.activeIncidents.get(incidentId);
    if (incident) {
      incident.status = status;
      incident.updatedAt = new Date();
      if (resolution) {
        incident.resolution = resolution;
        incident.resolvedAt = new Date();
      }
      return true;
    }
    return false;
  }
}

// Singleton instance
export const threatDetectionEngine = new ThreatDetectionEngine();