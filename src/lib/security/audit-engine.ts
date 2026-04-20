// Comprehensive Audit Trails and Logging System

import { AuditLogEntry } from './security-models';

export interface AuditTrail {
  id: string;
  entityType: 'user' | 'system' | 'data' | 'security' | 'compliance';
  entityId: string;
  action: string;
  actor: {
    type: 'user' | 'system' | 'api';
    id?: string;
    name?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  before?: any;
  after?: any;
  metadata: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceFlags: string[];
  timestamp: Date;
  sessionId?: string;
  correlationId?: string;
}

export interface AuditQuery {
  entityType?: string;
  entityId?: string;
  actorId?: string;
  action?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  riskLevel?: AuditTrail['riskLevel'];
  complianceFlags?: string[];
  limit?: number;
  offset?: number;
}

export interface AuditReport {
  id: string;
  title: string;
  query: AuditQuery;
  results: AuditTrail[];
  summary: {
    totalEvents: number;
    uniqueActors: number;
    riskDistribution: Record<string, number>;
    complianceViolations: number;
    dateRange: {
      start: Date;
      end: Date;
    };
  };
  generatedAt: Date;
  generatedBy: string;
}

export interface AuditAlert {
  id: string;
  name: string;
  description?: string;
  condition: {
    field: string;
    operator: 'equals' | 'greater_than' | 'contains' | 'regex';
    value: any;
    timeframe: number; // minutes
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  lastTriggered?: Date;
  cooldown: number; // minutes
  notificationChannels: string[];
  createdAt: Date;
}

export interface DataLineage {
  dataId: string;
  dataType: string;
  createdAt: Date;
  createdBy: string;
  transformations: Array<{
    timestamp: Date;
    operation: string;
    actor: string;
    parameters: Record<string, any>;
    result: any;
  }>;
  currentLocation: string;
  accessHistory: Array<{
    timestamp: Date;
    actor: string;
    action: 'read' | 'write' | 'delete' | 'export';
    reason?: string;
  }>;
  retention: {
    policy: string;
    expiresAt: Date;
    disposalMethod: 'delete' | 'anonymize' | 'archive';
  };
}

class AuditTrailEngine {
  private auditTrails: AuditTrail[] = [];
  private alerts: Map<string, AuditAlert> = new Map();
  private dataLineage: Map<string, DataLineage> = new Map();
  private retentionPeriod = 7 * 365 * 24 * 60 * 60 * 1000; // 7 years in milliseconds

  constructor() {
    this.initializeDefaultAlerts();
    this.startCleanupScheduler();
  }

  private initializeDefaultAlerts() {
    const defaultAlerts: AuditAlert[] = [
      {
        id: 'high_risk_actions',
        name: 'High Risk Security Actions',
        description: 'Alert on high-risk security-related actions',
        condition: {
          field: 'riskLevel',
          operator: 'equals',
          value: 'high',
          timeframe: 60 // 1 hour
        },
        severity: 'high',
        enabled: true,
        cooldown: 30, // 30 minutes
        notificationChannels: ['email', 'slack'],
        createdAt: new Date()
      },
      {
        id: 'data_export_alert',
        name: 'Large Data Exports',
        description: 'Alert on large data export operations',
        condition: {
          field: 'metadata.exportSize',
          operator: 'greater_than',
          value: 1000000, // 1MB
          timeframe: 1440 // 24 hours
        },
        severity: 'medium',
        enabled: true,
        cooldown: 60, // 1 hour
        notificationChannels: ['email'],
        createdAt: new Date()
      },
      {
        id: 'compliance_violations',
        name: 'Compliance Violations',
        description: 'Alert on potential compliance violations',
        condition: {
          field: 'complianceFlags',
          operator: 'contains',
          value: ['gdpr_violation', 'popia_violation'],
          timeframe: 60
        },
        severity: 'critical',
        enabled: true,
        cooldown: 15, // 15 minutes
        notificationChannels: ['email', 'sms', 'slack'],
        createdAt: new Date()
      }
    ];

    defaultAlerts.forEach(alert => this.alerts.set(alert.id, alert));
  }

  private startCleanupScheduler() {
    // Clean up old audit trails weekly
    setInterval(() => {
      this.cleanupOldEntries();
    }, 7 * 24 * 60 * 60 * 1000); // Weekly
  }

  // Main audit logging method
  async logAuditTrail(trail: Omit<AuditTrail, 'id' | 'timestamp'>): Promise<AuditTrail> {
    const auditTrail: AuditTrail = {
      ...trail,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.auditTrails.push(auditTrail);

    // Check for alerts
    await this.checkAlerts(auditTrail);

    // Update data lineage if applicable
    if (trail.entityType === 'data') {
      await this.updateDataLineage(auditTrail);
    }

    // Keep only last 100,000 entries in memory (configurable)
    if (this.auditTrails.length > 100000) {
      this.auditTrails = this.auditTrails.slice(-50000);
    }

    return auditTrail;
  }

  // Quick audit logging for common operations
  async logUserAction(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    metadata: Record<string, any> = {},
    sessionId?: string
  ): Promise<AuditTrail> {
    const riskLevel = this.assessActionRisk(action, metadata);

    return this.logAuditTrail({
      entityType: 'user',
      entityId: userId,
      action,
      actor: {
        type: 'user',
        id: userId,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent
      },
      metadata: {
        ...metadata,
        resourceId
      },
      riskLevel,
      complianceFlags: this.checkComplianceFlags(action, metadata),
      sessionId,
      correlationId: metadata.correlationId
    });
  }

  async logSystemAction(
    action: string,
    entityType: AuditTrail['entityType'],
    entityId: string,
    metadata: Record<string, any> = {}
  ): Promise<AuditTrail> {
    return this.logAuditTrail({
      entityType,
      entityId,
      action,
      actor: {
        type: 'system',
        name: 'System'
      },
      metadata,
      riskLevel: 'low',
      complianceFlags: [],
      correlationId: metadata.correlationId
    });
  }

  async logDataAccess(
    userId: string,
    dataType: string,
    dataId: string,
    action: 'read' | 'write' | 'delete' | 'export',
    metadata: Record<string, any> = {}
  ): Promise<AuditTrail> {
    const riskLevel = this.assessDataAccessRisk(action, dataType, metadata);

    const auditTrail = await this.logAuditTrail({
      entityType: 'data',
      entityId: dataId,
      action: `data_${action}`,
      actor: {
        type: userId ? 'user' : 'system',
        id: userId || 'system',
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent
      },
      metadata: {
        ...metadata,
        dataType,
        operation: action
      },
      riskLevel,
      complianceFlags: this.checkDataComplianceFlags(action, dataType),
      sessionId: metadata.sessionId
    });

    // Update data lineage
    await this.updateDataLineage(auditTrail);

    return auditTrail;
  }

  private assessActionRisk(action: string, metadata: Record<string, any>): AuditTrail['riskLevel'] {
    // Risk assessment based on action type and metadata
    const highRiskActions = [
      'delete_user', 'delete_data', 'export_sensitive_data',
      'change_permissions', 'bypass_security', 'admin_login'
    ];

    const mediumRiskActions = [
      'update_user', 'export_data', 'change_password',
      'access_sensitive_area', 'bulk_operation'
    ];

    if (highRiskActions.includes(action)) return 'high';
    if (mediumRiskActions.includes(action)) return 'medium';

    // Check metadata for additional risk factors
    if (metadata.bulkOperation && metadata.recordCount > 1000) return 'medium';
    if (metadata.sensitiveData) return 'high';
    if (metadata.bypassSecurity) return 'critical';

    return 'low';
  }

  private assessDataAccessRisk(
    action: string,
    dataType: string,
    metadata: Record<string, any>
  ): AuditTrail['riskLevel'] {
    let risk = 'low';

    // Risk based on action
    if (action === 'delete') risk = 'high';
    if (action === 'export') risk = 'medium';

    // Risk based on data type
    const sensitiveDataTypes = ['personal_data', 'financial_data', 'health_data'];
    if (sensitiveDataTypes.includes(dataType)) {
      risk = risk === 'high' ? 'critical' : 'high';
    }

    // Risk based on volume
    if (metadata.recordCount > 10000) {
      risk = risk === 'low' ? 'medium' : 'high';
    }

    return risk as AuditTrail['riskLevel'];
  }

  private checkComplianceFlags(action: string, metadata: Record<string, any>): string[] {
    const flags: string[] = [];

    // GDPR compliance flags
    if (['export_personal_data', 'delete_user', 'access_sensitive_data'].includes(action)) {
      flags.push('gdpr_audit_required');
    }

    if (metadata.withoutConsent) {
      flags.push('gdpr_consent_violation');
    }

    // POPIA compliance flags
    if (action.includes('personal_info') && !metadata.lawfulBasis) {
      flags.push('popia_processing_violation');
    }

    // SOX compliance flags
    if (action.includes('financial') && metadata.bypassControls) {
      flags.push('sox_control_violation');
    }

    return flags;
  }

  private checkDataComplianceFlags(action: string, dataType: string): string[] {
    const flags: string[] = [];

    if (dataType === 'personal_data' && action === 'export') {
      flags.push('gdpr_data_export');
    }

    if (dataType === 'financial_data' && action === 'delete') {
      flags.push('sox_record_alteration');
    }

    return flags;
  }

  private async checkAlerts(auditTrail: AuditTrail): Promise<void> {
    for (const alert of this.alerts.values()) {
      if (!alert.enabled) continue;

      // Check cooldown
      if (alert.lastTriggered &&
          Date.now() - alert.lastTriggered.getTime() < alert.cooldown * 60 * 1000) {
        continue;
      }

      // Evaluate condition
      if (this.evaluateAlertCondition(alert.condition, auditTrail)) {
        alert.lastTriggered = new Date();
        await this.triggerAlert(alert, auditTrail);
      }
    }
  }

  private evaluateAlertCondition(condition: AuditAlert['condition'], auditTrail: AuditTrail): boolean {
    const value = this.getAuditTrailFieldValue(auditTrail, condition.field);

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'contains':
        if (Array.isArray(condition.value)) {
          return condition.value.some(v => String(value).includes(String(v)));
        }
        return String(value).includes(String(condition.value));
      case 'regex':
        return new RegExp(condition.value).test(String(value));
      default:
        return false;
    }
  }

  private getAuditTrailFieldValue(auditTrail: AuditTrail, field: string): any {
    const parts = field.split('.');
    let value: any = auditTrail;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private async triggerAlert(alert: AuditAlert, auditTrail: AuditTrail): Promise<void> {
    console.log(`Alert triggered: ${alert.name}`, { alert, auditTrail });

    // In a real implementation, this would:
    // 1. Send notifications via configured channels
    // 2. Create incident tickets
    // 3. Log to external monitoring systems
    // 4. Trigger automated responses
  }

  private async updateDataLineage(auditTrail: AuditTrail): Promise<void> {
    const dataId = auditTrail.entityId;
    let lineage = this.dataLineage.get(dataId);

    if (!lineage) {
      lineage = {
        dataId,
        dataType: auditTrail.metadata?.dataType || 'unknown',
        createdAt: auditTrail.timestamp,
        createdBy: auditTrail.actor.id || 'system',
        transformations: [],
        accessHistory: [],
        currentLocation: 'database',
        retention: {
          policy: 'default',
          expiresAt: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years
          disposalMethod: 'delete'
        }
      };
      this.dataLineage.set(dataId, lineage);
    }

    // Add to access history
    lineage.accessHistory.push({
      timestamp: auditTrail.timestamp,
      actor: auditTrail.actor.id || 'system',
      action: auditTrail.action.includes('read') ? 'read' :
              auditTrail.action.includes('write') ? 'write' :
              auditTrail.action.includes('delete') ? 'delete' : 'export',
      reason: auditTrail.metadata?.reason
    });

    // Add transformation if applicable
    if (auditTrail.action.includes('transform') || auditTrail.action.includes('update')) {
      lineage.transformations.push({
        timestamp: auditTrail.timestamp,
        operation: auditTrail.action,
        actor: auditTrail.actor.id || 'system',
        parameters: auditTrail.metadata || {},
        result: auditTrail.after || {}
      });
    }
  }

  private cleanupOldEntries(): void {
    const cutoffDate = new Date(Date.now() - this.retentionPeriod);

    // Clean up audit trails
    this.auditTrails = this.auditTrails.filter(trail => trail.timestamp > cutoffDate);

    // Clean up data lineage (keep for 10 years for compliance)
    const dataRetentionCutoff = new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000);
    for (const [key, lineage] of this.dataLineage.entries()) {
      if (lineage.createdAt < dataRetentionCutoff) {
        this.dataLineage.delete(key);
      }
    }
  }

  // Query methods
  queryAuditTrails(query: AuditQuery): AuditTrail[] {
    let results = [...this.auditTrails];

    if (query.entityType) {
      results = results.filter(trail => trail.entityType === query.entityType);
    }

    if (query.entityId) {
      results = results.filter(trail => trail.entityId === query.entityId);
    }

    if (query.actorId) {
      results = results.filter(trail => trail.actor.id === query.actorId);
    }

    if (query.action) {
      results = results.filter(trail => trail.action === query.action);
    }

    if (query.dateRange) {
      results = results.filter(trail =>
        trail.timestamp >= query.dateRange!.start &&
        trail.timestamp <= query.dateRange!.end
      );
    }

    if (query.riskLevel) {
      results = results.filter(trail => trail.riskLevel === query.riskLevel);
    }

    if (query.complianceFlags && query.complianceFlags.length > 0) {
      results = results.filter(trail =>
        query.complianceFlags!.some(flag => trail.complianceFlags.includes(flag))
      );
    }

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    results = results.slice(offset, offset + limit);

    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  generateAuditReport(query: AuditQuery, title: string, generatedBy: string): AuditReport {
    const results = this.queryAuditTrails({ ...query, limit: undefined, offset: undefined });

    const summary = {
      totalEvents: results.length,
      uniqueActors: new Set(results.map(r => r.actor.id)).size,
      riskDistribution: results.reduce((dist, result) => {
        dist[result.riskLevel] = (dist[result.riskLevel] || 0) + 1;
        return dist;
      }, {} as Record<string, number>),
      complianceViolations: results.filter(r => r.complianceFlags.length > 0).length,
      dateRange: query.dateRange || {
        start: new Date(Math.min(...results.map(r => r.timestamp.getTime()))),
        end: new Date(Math.max(...results.map(r => r.timestamp.getTime())))
      }
    };

    return {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      query,
      results: results.slice(0, 1000), // Limit results in report
      summary,
      generatedAt: new Date(),
      generatedBy
    };
  }

  // Alert management
  addAlert(alert: AuditAlert): void {
    this.alerts.set(alert.id, alert);
  }

  updateAlert(alertId: string, updates: Partial<AuditAlert>): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      this.alerts.set(alertId, { ...alert, ...updates });
      return true;
    }
    return false;
  }

  removeAlert(alertId: string): boolean {
    return this.alerts.delete(alertId);
  }

  getAlerts(): AuditAlert[] {
    return Array.from(this.alerts.values());
  }

  // Data lineage
  getDataLineage(dataId: string): DataLineage | undefined {
    return this.dataLineage.get(dataId);
  }

  getDataLineageReport(dataId: string): any {
    const lineage = this.dataLineage.get(dataId);
    if (!lineage) return null;

    return {
      dataId,
      dataType: lineage.dataType,
      createdAt: lineage.createdAt,
      createdBy: lineage.createdBy,
      currentLocation: lineage.currentLocation,
      retention: lineage.retention,
      accessCount: lineage.accessHistory.length,
      transformationCount: lineage.transformations.length,
      lastAccessed: lineage.accessHistory.length > 0 ?
        lineage.accessHistory[lineage.accessHistory.length - 1].timestamp : null,
      accessSummary: lineage.accessHistory.reduce((summary, access) => {
        summary[access.action] = (summary[access.action] || 0) + 1;
        return summary;
      }, {} as Record<string, number>)
    };
  }

  // Compliance reporting
  generateComplianceReport(startDate: Date, endDate: Date): any {
    const relevantAudits = this.auditTrails.filter(trail =>
      trail.timestamp >= startDate && trail.timestamp <= endDate
    );

    const complianceSummary = {
      totalAudits: relevantAudits.length,
      gdprCompliant: relevantAudits.filter(t => !t.complianceFlags.includes('gdpr_violation')).length,
      popiaCompliant: relevantAudits.filter(t => !t.complianceFlags.includes('popia_processing_violation')).length,
      complianceViolations: relevantAudits.filter(t => t.complianceFlags.length > 0).length,
      riskDistribution: relevantAudits.reduce((dist, audit) => {
        dist[audit.riskLevel] = (dist[audit.riskLevel] || 0) + 1;
        return dist;
      }, {} as Record<string, number>),
      topViolationTypes: relevantAudits
        .flatMap(t => t.complianceFlags)
        .reduce((counts, flag) => {
          counts[flag] = (counts[flag] || 0) + 1;
          return counts;
        }, {} as Record<string, number>)
    };

    return {
      period: { start: startDate, end: endDate },
      summary: complianceSummary,
      recommendations: this.generateComplianceRecommendations(complianceSummary),
      generatedAt: new Date()
    };
  }

  private generateComplianceRecommendations(summary: any): string[] {
    const recommendations: string[] = [];

    if (summary.complianceViolations > 0) {
      recommendations.push('Review and address compliance violations immediately');
      recommendations.push('Enhance training on compliance requirements');
    }

    if (summary.gdprCompliant < summary.totalAudits * 0.95) {
      recommendations.push('Strengthen GDPR compliance measures');
      recommendations.push('Implement automated consent management');
    }

    if (summary.topViolationTypes['data_export'] > 10) {
      recommendations.push('Review data export policies and controls');
    }

    return recommendations;
  }

  // Statistics
  getAuditStatistics(): any {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const trails24h = this.auditTrails.filter(t => t.timestamp >= last24h);
    const trails7d = this.auditTrails.filter(t => t.timestamp >= last7d);
    const trails30d = this.auditTrails.filter(t => t.timestamp >= last30d);

    return {
      totalAudits: this.auditTrails.length,
      last24h: {
        count: trails24h.length,
        riskDistribution: this.calculateRiskDistribution(trails24h),
        topActions: this.getTopActions(trails24h)
      },
      last7d: {
        count: trails7d.length,
        riskDistribution: this.calculateRiskDistribution(trails7d),
        topActions: this.getTopActions(trails7d)
      },
      last30d: {
        count: trails30d.length,
        riskDistribution: this.calculateRiskDistribution(trails30d),
        topActions: this.getTopActions(trails30d)
      }
    };
  }

  private calculateRiskDistribution(trails: AuditTrail[]): Record<string, number> {
    return trails.reduce((dist, trail) => {
      dist[trail.riskLevel] = (dist[trail.riskLevel] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);
  }

  private getTopActions(trails: AuditTrail[]): Array<{ action: string; count: number }> {
    const actionCounts = trails.reduce((counts, trail) => {
      counts[trail.action] = (counts[trail.action] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));
  }
}

// Singleton instance
export const auditTrailEngine = new AuditTrailEngine();