import { PropertyData } from '@/lib/types/property';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  ipAddress?: string;
  userAgent?: string;
  statusCode: number;
  duration: number; // milliseconds
  requestSize?: number;
  responseSize?: number;
  metadata: Record<string, any>;
  complianceFlags: ComplianceFlag[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  retentionPeriod: number; // days
}

export interface ComplianceFlag {
  regulation: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'requires_review';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediationSteps?: string[];
}

export interface AuditTrail {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  timestamp: Date;
  previousState?: any;
  newState?: any;
  metadata: Record<string, any>;
  chainOfCustody: CustodyRecord[];
  immutable: boolean;
  hash: string; // For immutability verification
}

export interface CustodyRecord {
  custodianId: string;
  timestamp: Date;
  action: string;
  justification: string;
  digitalSignature?: string;
}

export interface ComplianceRule {
  id: string;
  regulation: string;
  ruleName: string;
  description: string;
  category: 'data_protection' | 'financial' | 'operational' | 'security' | 'quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  conditions: ComplianceCondition[];
  actions: ComplianceAction[];
  enabled: boolean;
  lastTested?: Date;
  complianceRate?: number;
}

export interface ComplianceCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'regex';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface ComplianceAction {
  type: 'alert' | 'block' | 'log' | 'notify' | 'remediate';
  target: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoRemediation?: boolean;
}

export interface ComplianceReport {
  id: string;
  regulation: string;
  period: {
    start: Date;
    end: Date;
  };
  overallCompliance: number; // percentage
  sections: ComplianceSection[];
  recommendations: string[];
  generatedAt: Date;
  approvedBy?: string;
  status: 'draft' | 'reviewed' | 'approved' | 'submitted';
}

export interface ComplianceSection {
  name: string;
  compliance: number;
  violations: number;
  criticalIssues: number;
  findings: ComplianceFinding[];
}

export interface ComplianceFinding {
  ruleId: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: any;
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
}

export class ComplianceAuditEngine {
  private auditLogs: Map<string, AuditLogEntry[]> = new Map();
  private auditTrails: Map<string, AuditTrail[]> = new Map();
  private complianceRules: Map<string, ComplianceRule> = new Map();
  private complianceReports: Map<string, ComplianceReport> = new Map();

  constructor() {
    this.initializeDefaultComplianceRules();
  }

  // Audit Logging
  async logActivity(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'complianceFlags' | 'riskLevel' | 'dataClassification' | 'retentionPeriod'>): Promise<AuditLogEntry> {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      complianceFlags: await this.evaluateComplianceFlags({
        ...entry,
        timestamp: new Date(),
        id: '',
        riskLevel: 'low',
        dataClassification: 'internal',
        retentionPeriod: 1095
      }),
      riskLevel: this.assessRiskLevel({
        ...entry,
        timestamp: new Date(),
        id: '',
        complianceFlags: [],
        dataClassification: 'internal',
        retentionPeriod: 1095
      }),
      dataClassification: this.classifyData({
        ...entry,
        timestamp: new Date(),
        id: '',
        complianceFlags: [],
        riskLevel: 'low',
        retentionPeriod: 1095
      }),
      retentionPeriod: this.determineRetentionPeriod({
        ...entry,
        timestamp: new Date(),
        id: '',
        complianceFlags: [],
        riskLevel: 'low',
        dataClassification: 'internal'
      })
    };

    // Store audit entry
    const dateKey = auditEntry.timestamp.toISOString().split('T')[0];
    if (!this.auditLogs.has(dateKey)) {
      this.auditLogs.set(dateKey, []);
    }
    this.auditLogs.get(dateKey)!.push(auditEntry);

    // Check compliance rules
    await this.checkComplianceRules(auditEntry);

    return auditEntry;
  }

  async getAuditLogs(filters?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    resource?: string;
    riskLevel?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    const allLogs: AuditLogEntry[] = [];

    // Collect logs from date range
    const startDate = filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = filters?.endDate || new Date();

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateKey = date.toISOString().split('T')[0];
      const logs = this.auditLogs.get(dateKey) || [];
      allLogs.push(...logs);
    }

    // Apply filters
    let filteredLogs = allLogs.filter(log => {
      if (filters?.userId && log.userId !== filters.userId) return false;
      if (filters?.resource && log.resource !== filters.resource) return false;
      if (filters?.riskLevel && log.riskLevel !== filters.riskLevel) return false;
      return true;
    });

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    if (filters?.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }

    return filteredLogs;
  }

  // Audit Trails
  async createAuditTrail(trail: Omit<AuditTrail, 'id' | 'chainOfCustody' | 'hash'>): Promise<AuditTrail> {
    const auditTrail: AuditTrail = {
      ...trail,
      id: `trail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chainOfCustody: [{
        custodianId: trail.userId,
        timestamp: new Date(),
        action: 'created',
        justification: 'Initial audit trail creation'
      }],
      hash: this.generateTrailHash(trail)
    };

    // Store audit trail
    const entityKey = `${trail.entityType}:${trail.entityId}`;
    if (!this.auditTrails.has(entityKey)) {
      this.auditTrails.set(entityKey, []);
    }
    this.auditTrails.get(entityKey)!.push(auditTrail);

    return auditTrail;
  }

  async updateAuditTrail(entityType: string, entityId: string, action: string, userId: string, changes: any): Promise<AuditTrail> {
    const entityKey = `${entityType}:${entityId}`;
    const trails = this.auditTrails.get(entityKey) || [];
    const latestTrail = trails[trails.length - 1];

    if (!latestTrail) {
      throw new Error(`No audit trail found for ${entityType}:${entityId}`);
    }

    // Create new trail entry
    const newTrail: AuditTrail = {
      ...latestTrail,
      id: `trail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      userId,
      timestamp: new Date(),
      previousState: latestTrail.newState,
      newState: changes,
      chainOfCustody: [
        ...latestTrail.chainOfCustody,
        {
          custodianId: userId,
          timestamp: new Date(),
          action,
          justification: `Audit trail update: ${action}`
        }
      ],
      hash: this.generateTrailHash({ ...latestTrail, action, userId, timestamp: new Date(), newState: changes })
    };

    trails.push(newTrail);
    return newTrail;
  }

  getAuditTrail(entityType: string, entityId: string): AuditTrail[] {
    const entityKey = `${entityType}:${entityId}`;
    return this.auditTrails.get(entityKey) || [];
  }

  // Compliance Rules
  async createComplianceRule(rule: Omit<ComplianceRule, 'id'>): Promise<ComplianceRule> {
    const complianceRule: ComplianceRule = {
      ...rule,
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.complianceRules.set(complianceRule.id, complianceRule);
    return complianceRule;
  }

  async updateComplianceRule(ruleId: string, updates: Partial<ComplianceRule>): Promise<ComplianceRule | null> {
    const rule = this.complianceRules.get(ruleId);
    if (!rule) return null;

    const updatedRule = { ...rule, ...updates };
    this.complianceRules.set(ruleId, updatedRule);
    return updatedRule;
  }

  getComplianceRules(regulation?: string): ComplianceRule[] {
    const allRules = Array.from(this.complianceRules.values());
    return regulation ? allRules.filter(r => r.regulation === regulation) : allRules;
  }

  // Compliance Evaluation
  private async evaluateComplianceFlags(entry: Omit<AuditLogEntry, 'complianceFlags'>): Promise<ComplianceFlag[]> {
    const flags: ComplianceFlag[] = [];
    const rules = this.getComplianceRules();

    for (const rule of rules) {
      if (!rule.enabled) continue;

      const isViolated = this.evaluateConditions(rule.conditions, entry);
      if (isViolated) {
        flags.push({
          regulation: rule.regulation,
          requirement: rule.ruleName,
          status: 'non_compliant',
          severity: rule.severity,
          description: rule.description,
          remediationSteps: rule.actions.map(a => a.message)
        });
      }
    }

    return flags;
  }

  private evaluateConditions(conditions: ComplianceCondition[], data: any): boolean {
    // Simple condition evaluation - in production, use a proper rule engine
    return conditions.some(condition => {
      const fieldValue = this.getNestedValue(data, condition.field);
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        default:
          return false;
      }
    });
  }

  private async checkComplianceRules(entry: AuditLogEntry): Promise<void> {
    const violatedRules = entry.complianceFlags.filter(flag => flag.status === 'non_compliant');

    for (const violation of violatedRules) {
      const rule = this.getComplianceRules(violation.regulation)
        .find(r => r.ruleName === violation.requirement);

      if (rule) {
        await this.executeComplianceActions(rule.actions, entry);
      }
    }
  }

  private async executeComplianceActions(actions: ComplianceAction[], entry: AuditLogEntry): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'alert':
          console.warn(`Compliance Alert: ${action.message}`, entry);
          break;
        case 'log':
          console.log(`Compliance Log: ${action.message}`, entry);
          break;
        case 'block':
          // In a real implementation, this would block the action
          console.error(`Compliance Block: ${action.message}`, entry);
          break;
        case 'notify':
          // Send notification to compliance team
          console.info(`Compliance Notification: ${action.message}`, entry);
          break;
      }
    }
  }

  // Risk Assessment
  private assessRiskLevel(entry: Omit<AuditLogEntry, 'riskLevel'>): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0;

    // Risk factors
    if (entry.statusCode >= 400) riskScore += 20;
    if (entry.method === 'DELETE') riskScore += 30;
    if (entry.resource.includes('admin') || entry.resource.includes('config')) riskScore += 25;
    if (entry.complianceFlags.length > 0) riskScore += entry.complianceFlags.length * 15;
    if (entry.dataClassification === 'restricted') riskScore += 40;

    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  // Data Classification
  private classifyData(entry: Omit<AuditLogEntry, 'dataClassification'>): 'public' | 'internal' | 'confidential' | 'restricted' {
    if (entry.resource.includes('payment') || entry.resource.includes('financial')) return 'restricted';
    if (entry.resource.includes('personal') || entry.resource.includes('user')) return 'confidential';
    if (entry.resource.includes('admin') || entry.resource.includes('config')) return 'confidential';
    return 'internal';
  }

  // Retention Period
  private determineRetentionPeriod(entry: Omit<AuditLogEntry, 'retentionPeriod'>): number {
    switch (entry.dataClassification) {
      case 'restricted': return 2555; // 7 years
      case 'confidential': return 1825; // 5 years
      case 'internal': return 1095; // 3 years
      case 'public': return 365; // 1 year
      default: return 1095;
    }
  }

  // Compliance Reporting
  async generateComplianceReport(regulation: string, startDate: Date, endDate: Date): Promise<ComplianceReport> {
    const logs = await this.getAuditLogs({ startDate, endDate });
    const relevantLogs = logs.filter(log =>
      log.complianceFlags.some(flag => flag.regulation === regulation)
    );

    const sections: ComplianceSection[] = [];
    const findings: ComplianceFinding[] = [];

    // Analyze compliance by category
    const categories = ['data_protection', 'financial', 'operational', 'security', 'quality'];

    for (const category of categories) {
      const categoryLogs = relevantLogs.filter(log =>
        log.complianceFlags.some(flag => {
          const rule = this.getComplianceRules(regulation).find(r => r.ruleName === flag.requirement);
          return rule?.category === category;
        })
      );

      const violations = categoryLogs.filter(log =>
        log.complianceFlags.some(flag => flag.status === 'non_compliant')
      );

      const compliance = categoryLogs.length > 0 ?
        ((categoryLogs.length - violations.length) / categoryLogs.length) * 100 : 100;

      sections.push({
        name: category.replace('_', ' ').toUpperCase(),
        compliance,
        violations: violations.length,
        criticalIssues: violations.filter(log =>
          log.complianceFlags.some(flag => flag.severity === 'critical')
        ).length,
        findings: [] // Would be populated with specific findings
      });
    }

    const overallCompliance = sections.reduce((sum, section) => sum + section.compliance, 0) / sections.length;

    const report: ComplianceReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      regulation,
      period: { start: startDate, end: endDate },
      overallCompliance,
      sections,
      recommendations: this.generateComplianceRecommendations(sections),
      generatedAt: new Date(),
      status: 'draft'
    };

    this.complianceReports.set(report.id, report);
    return report;
  }

  private generateComplianceRecommendations(sections: ComplianceSection[]): string[] {
    const recommendations: string[] = [];

    sections.forEach(section => {
      if (section.compliance < 80) {
        recommendations.push(
          `Improve ${section.name} compliance (currently ${section.compliance.toFixed(1)}%)`
        );
      }
      if (section.criticalIssues > 0) {
        recommendations.push(
          `Address ${section.criticalIssues} critical issues in ${section.name}`
        );
      }
    });

    return recommendations;
  }

  // Utility Methods
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private generateTrailHash(trail: any): string {
    const crypto = require('crypto');
    const data = JSON.stringify({
      entityType: trail.entityType,
      entityId: trail.entityId,
      action: trail.action,
      userId: trail.userId,
      timestamp: trail.timestamp,
      previousState: trail.previousState,
      newState: trail.newState,
      metadata: trail.metadata
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private initializeDefaultComplianceRules(): void {
    // POPIA Compliance Rules
    this.createComplianceRule({
      regulation: 'POPIA',
      ruleName: 'Data Subject Consent',
      description: 'Ensure data processing has proper consent',
      category: 'data_protection',
      severity: 'high',
      conditions: [
        {
          field: 'resource',
          operator: 'contains',
          value: 'personal'
        }
      ],
      actions: [
        {
          type: 'alert',
          target: 'compliance_team',
          message: 'Personal data access requires consent verification',
          severity: 'high'
        }
      ],
      enabled: true
    });

    // B-BBEE Compliance Rules
    this.createComplianceRule({
      regulation: 'B-BBEE',
      ruleName: 'Procurement Compliance',
      description: 'Verify supplier B-BBEE compliance for procurement',
      category: 'financial',
      severity: 'medium',
      conditions: [
        {
          field: 'resource',
          operator: 'contains',
          value: 'procurement'
        }
      ],
      actions: [
        {
          type: 'log',
          target: 'compliance_log',
          message: 'Procurement activity logged for B-BBEE compliance',
          severity: 'medium'
        }
      ],
      enabled: true
    });

    // NHBRC Compliance Rules
    this.createComplianceRule({
      regulation: 'NHBRC',
      ruleName: 'Construction Standards',
      description: 'Ensure construction activities meet NHBRC standards',
      category: 'quality',
      severity: 'high',
      conditions: [
        {
          field: 'resource',
          operator: 'contains',
          value: 'construction'
        }
      ],
      actions: [
        {
          type: 'notify',
          target: 'quality_team',
          message: 'Construction activity requires NHBRC compliance check',
          severity: 'high'
        }
      ],
      enabled: true
    });

    // CIDB Compliance Rules
    this.createComplianceRule({
      regulation: 'CIDB',
      ruleName: 'Contractor Registration',
      description: 'Verify contractor CIDB registration',
      category: 'operational',
      severity: 'medium',
      conditions: [
        {
          field: 'resource',
          operator: 'contains',
          value: 'contractor'
        }
      ],
      actions: [
        {
          type: 'alert',
          target: 'operations_team',
          message: 'Contractor registration requires CIDB verification',
          severity: 'medium'
        }
      ],
      enabled: true
    });
  }
}

export const complianceAuditEngine = new ComplianceAuditEngine();