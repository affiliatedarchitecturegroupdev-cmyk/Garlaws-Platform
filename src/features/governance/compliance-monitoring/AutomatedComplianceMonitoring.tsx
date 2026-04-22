'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Compliance Monitoring Types
export type ComplianceStatus =
  | 'compliant'
  | 'non-compliant'
  | 'under-review'
  | 'requires-attention'
  | 'breach-detected';

export type ComplianceSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type ComplianceAction =
  | 'monitor'
  | 'alert'
  | 'block'
  | 'remediate'
  | 'escalate'
  | 'audit';

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  regulation: string;
  category: 'data-privacy' | 'security' | 'financial' | 'healthcare' | 'gdpr' | 'ccpa' | 'hipaa' | 'pci-dss';
  conditions: ComplianceCondition[];
  actions: ComplianceAction[];
  severity: ComplianceSeverity;
  autoRemediation?: boolean;
  remediationSteps?: string[];
  status: 'active' | 'inactive' | 'draft';
  lastTriggered?: string;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceCondition {
  id: string;
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'regex' | 'in';
  value: any;
  negate?: boolean;
  description?: string;
}

export interface ComplianceEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  status: ComplianceStatus;
  severity: ComplianceSeverity;
  description: string;
  details: {
    affectedResources: string[];
    violationData: any;
    timestamp: string;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
  };
  actionsTaken: ComplianceAction[];
  remediationStatus?: 'pending' | 'in-progress' | 'completed' | 'failed';
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
}

export interface ComplianceReport {
  id: string;
  name: string;
  period: {
    start: string;
    end: string;
  };
  regulations: string[];
  metrics: {
    totalEvents: number;
    compliantEvents: number;
    nonCompliantEvents: number;
    criticalViolations: number;
    autoRemediated: number;
    manualIntervention: number;
  };
  topViolations: Array<{
    rule: string;
    count: number;
    severity: ComplianceSeverity;
  }>;
  recommendations: string[];
  status: 'draft' | 'finalized';
  generatedAt: string;
  generatedBy: string;
}

export interface ComplianceDashboard {
  overallScore: number;
  regulations: Array<{
    name: string;
    complianceScore: number;
    status: ComplianceStatus;
    lastAudit: string;
    nextAudit: string;
  }>;
  recentEvents: ComplianceEvent[];
  activeAlerts: ComplianceEvent[];
  trendData: Array<{
    date: string;
    compliant: number;
    violations: number;
  }>;
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
    mitigationStrategies: string[];
  };
}

// Automated Compliance Monitoring Hook
export function useAutomatedCompliance() {
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);
  const [complianceEvents, setComplianceEvents] = useState<ComplianceEvent[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [dashboard, setDashboard] = useState<ComplianceDashboard | null>(null);
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [lastCheck, setLastCheck] = useState<string>(new Date().toISOString());

  // Mock compliance rules based on major regulations
  const mockComplianceRules: ComplianceRule[] = [
    {
      id: 'gdpr-consent-rule',
      name: 'GDPR Consent Verification',
      description: 'Ensure valid consent for data processing activities',
      regulation: 'GDPR',
      category: 'gdpr',
      conditions: [
        {
          id: 'consent-check',
          field: 'dataOperation',
          operator: 'in',
          value: ['collect', 'process', 'share'],
          description: 'Check if operation requires consent'
        },
        {
          id: 'consent-status',
          field: 'consentGiven',
          operator: 'ne',
          value: true,
          description: 'Verify consent has been given'
        }
      ],
      actions: ['alert', 'block'],
      severity: 'high',
      autoRemediation: false,
      status: 'active',
      triggerCount: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    },
    {
      id: 'ccpa-data-deletion',
      name: 'CCPA Data Deletion Rights',
      description: 'Enforce data deletion requests within required timeframe',
      regulation: 'CCPA',
      category: 'ccpa',
      conditions: [
        {
          id: 'deletion-request',
          field: 'requestType',
          operator: 'eq',
          value: 'data-deletion',
          description: 'Identify data deletion requests'
        },
        {
          id: 'response-time',
          field: 'daysSinceRequest',
          operator: 'gt',
          value: 45,
          description: 'Check if response exceeds 45-day limit'
        }
      ],
      actions: ['alert', 'escalate'],
      severity: 'critical',
      autoRemediation: true,
      remediationSteps: [
        'Notify data controller',
        'Initiate expedited deletion process',
        'Document delay reasons',
        'Escalate to compliance officer'
      ],
      status: 'active',
      triggerCount: 0,
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    },
    {
      id: 'data-retention-policy',
      name: 'Data Retention Compliance',
      description: 'Ensure data is not retained beyond permitted periods',
      regulation: 'General',
      category: 'data-privacy',
      conditions: [
        {
          id: 'retention-period',
          field: 'dataAge',
          operator: 'gt',
          value: 'retentionPeriod',
          description: 'Check if data exceeds retention period'
        }
      ],
      actions: ['alert', 'remediate'],
      severity: 'medium',
      autoRemediation: true,
      remediationSteps: [
        'Automatically delete expired data',
        'Archive data if required for legal purposes',
        'Update retention logs'
      ],
      status: 'active',
      triggerCount: 0,
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    }
  ];

  const loadComplianceRules = useCallback(async () => {
    try {
      // In real implementation, load from compliance database
      await new Promise(resolve => setTimeout(resolve, 300));
      setComplianceRules(mockComplianceRules);
    } catch (error) {
      console.error('Failed to load compliance rules:', error);
    }
  }, []);

  const evaluateCompliance = useCallback(async (data: any, context: any = {}): Promise<ComplianceEvent[]> => {
    const violations: ComplianceEvent[] = [];

    for (const rule of complianceRules.filter(r => r.status === 'active')) {
      try {
        const ruleViolated = evaluateRule(rule, data, context);

        if (ruleViolated) {
          const event: ComplianceEvent = {
            id: `compliance_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ruleId: rule.id,
            ruleName: rule.name,
            status: 'non-compliant',
            severity: rule.severity,
            description: `Compliance violation detected: ${rule.description}`,
            details: {
              affectedResources: [data.resource || 'unknown'],
              violationData: data,
              timestamp: new Date().toISOString(),
              userId: context.userId,
              sessionId: context.sessionId,
              ipAddress: context.ipAddress
            },
            actionsTaken: rule.actions,
            createdAt: new Date().toISOString()
          };

          violations.push(event);

          // Update rule trigger count
          setComplianceRules(prev =>
            prev.map(r =>
              r.id === rule.id
                ? { ...r, triggerCount: r.triggerCount + 1, lastTriggered: new Date().toISOString(), updatedAt: new Date().toISOString() }
                : r
            )
          );

          // Auto-remediation
          if (rule.autoRemediation && rule.remediationSteps) {
            await performAutoRemediation(rule, event);
          }
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    }

    // Add events to state
    if (violations.length > 0) {
      setComplianceEvents(prev => [...violations, ...prev.slice(0, 999)]);
    }

    return violations;
  }, [complianceRules]);

  const evaluateRule = (rule: ComplianceRule, data: any, context: any): boolean => {
    // Simple rule evaluation (in real implementation, use proper expression evaluator)
    return rule.conditions.some(condition => {
      // Mock evaluation - in real implementation, evaluate against actual data
      return Math.random() > 0.8; // Simulate occasional violations
    });
  };

  const performAutoRemediation = async (rule: ComplianceRule, event: ComplianceEvent): Promise<void> => {
    try {
      // Simulate auto-remediation steps
      for (const step of rule.remediationSteps || []) {
        console.log(`Performing remediation step: ${step}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Update event status
      setComplianceEvents(prev =>
        prev.map(e =>
          e.id === event.id
            ? { ...e, remediationStatus: 'completed', resolvedAt: new Date().toISOString() }
            : e
        )
      );
    } catch (error) {
      console.error('Auto-remediation failed:', error);
      setComplianceEvents(prev =>
        prev.map(e =>
          e.id === event.id
            ? { ...e, remediationStatus: 'failed' }
            : e
        )
      );
    }
  };

  const generateComplianceReport = useCallback(async (
    startDate: string,
    endDate: string,
    regulations: string[] = []
  ): Promise<ComplianceReport> => {
    const events = complianceEvents.filter(e =>
      e.createdAt >= startDate && e.createdAt <= endDate &&
      (regulations.length === 0 || regulations.includes('general'))
    );

    const report: ComplianceReport = {
      id: `report_${Date.now()}`,
      name: `Compliance Report ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
      period: { start: startDate, end: endDate },
      regulations: regulations.length > 0 ? regulations : ['gdpr', 'ccpa', 'general'],
      metrics: {
        totalEvents: events.length,
        compliantEvents: events.filter(e => e.status === 'compliant').length,
        nonCompliantEvents: events.filter(e => e.status === 'non-compliant').length,
        criticalViolations: events.filter(e => e.severity === 'critical').length,
        autoRemediated: events.filter(e => e.remediationStatus === 'completed').length,
        manualIntervention: events.filter(e => e.remediationStatus !== 'completed' && e.status === 'non-compliant').length
      },
      topViolations: calculateTopViolations(events),
      recommendations: generateRecommendations(events),
      status: 'finalized',
      generatedAt: new Date().toISOString(),
      generatedBy: 'automated-system'
    };

    setComplianceReports(prev => [report, ...prev]);
    return report;
  }, [complianceEvents]);

  const calculateTopViolations = (events: ComplianceEvent[]) => {
    const violationCounts: Record<string, { count: number; severity: ComplianceSeverity }> = {};

    events.forEach(event => {
      if (!violationCounts[event.ruleName]) {
        violationCounts[event.ruleName] = { count: 0, severity: event.severity };
      }
      violationCounts[event.ruleName].count++;
    });

    return Object.entries(violationCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([rule, data]) => ({
        rule,
        count: data.count,
        severity: data.severity
      }));
  };

  const generateRecommendations = (events: ComplianceEvent[]): string[] => {
    const recommendations: string[] = [];

    if (events.filter(e => e.severity === 'critical').length > 0) {
      recommendations.push('Immediate attention required for critical compliance violations');
    }

    if (events.filter(e => e.remediationStatus !== 'completed').length > events.filter(e => e.remediationStatus === 'completed').length) {
      recommendations.push('Increase automated remediation capabilities to reduce manual intervention');
    }

    const frequentViolations = calculateTopViolations(events);
    if (frequentViolations.length > 0) {
      recommendations.push(`Review and strengthen controls for: ${frequentViolations[0].rule}`);
    }

    return recommendations;
  };

  const updateDashboard = useCallback(async () => {
    const recentEvents = complianceEvents.slice(0, 10);
    const activeAlerts = complianceEvents.filter(e =>
      e.status !== 'compliant' && !e.resolvedAt
    ).slice(0, 5);

    // Calculate overall compliance score
    const totalEvents = complianceEvents.length;
    const compliantEvents = complianceEvents.filter(e => e.status === 'compliant').length;
    const overallScore = totalEvents > 0 ? (compliantEvents / totalEvents) * 100 : 100;

    // Generate trend data (last 7 days)
    const trendData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayEvents = complianceEvents.filter(e =>
        new Date(e.createdAt).toDateString() === date.toDateString()
      );
      return {
        date: date.toISOString().split('T')[0],
        compliant: dayEvents.filter(e => e.status === 'compliant').length,
        violations: dayEvents.filter(e => e.status === 'non-compliant').length
      };
    });

    const dashboardData: ComplianceDashboard = {
      overallScore,
      regulations: [
        { name: 'GDPR', complianceScore: 98.5, status: 'compliant', lastAudit: '2026-04-20', nextAudit: '2026-07-20' },
        { name: 'CCPA', complianceScore: 97.2, status: 'compliant', lastAudit: '2026-04-18', nextAudit: '2026-07-18' },
        { name: 'General', complianceScore: overallScore, status: 'compliant', lastAudit: '2026-04-22', nextAudit: '2026-05-22' }
      ],
      recentEvents,
      activeAlerts,
      trendData,
      riskAssessment: {
        overallRisk: overallScore > 95 ? 'low' : overallScore > 85 ? 'medium' : 'high',
        riskFactors: activeAlerts.length > 0 ? ['Active compliance violations', 'Manual intervention required'] : [],
        mitigationStrategies: ['Automated remediation', 'Regular compliance audits', 'Staff training']
      }
    };

    setDashboard(dashboardData);
  }, [complianceEvents]);

  const startMonitoring = useCallback(() => {
    setMonitoringActive(true);
    // In real implementation, start background monitoring service
    console.log('Compliance monitoring started');
  }, []);

  const stopMonitoring = useCallback(() => {
    setMonitoringActive(false);
    // In real implementation, stop background monitoring service
    console.log('Compliance monitoring stopped');
  }, []);

  useEffect(() => {
    loadComplianceRules();
  }, [loadComplianceRules]);

  useEffect(() => {
    if (complianceEvents.length > 0) {
      updateDashboard();
    }
  }, [complianceEvents, updateDashboard]);

  return {
    complianceRules,
    complianceEvents,
    complianceReports,
    dashboard,
    monitoringActive,
    lastCheck,
    evaluateCompliance,
    generateComplianceReport,
    startMonitoring,
    stopMonitoring,
    loadComplianceRules,
    updateDashboard,
  };
}

// Compliance Monitoring Dashboard Component
interface ComplianceMonitoringDashboardProps {
  className?: string;
}

export const ComplianceMonitoringDashboard: React.FC<ComplianceMonitoringDashboardProps> = ({
  className
}) => {
  const {
    complianceRules,
    complianceEvents,
    dashboard,
    monitoringActive,
    evaluateCompliance,
    generateComplianceReport,
    startMonitoring,
    stopMonitoring
  } = useAutomatedCompliance();

  const [selectedEvent, setSelectedEvent] = useState<ComplianceEvent | null>(null);

  const handleTestCompliance = async () => {
    // Generate test data that might trigger violations
    const testData = {
      resource: 'user-data',
      dataOperation: 'share',
      consentGiven: false,
      daysSinceRequest: 50,
      dataAge: 400, // days
      retentionPeriod: 365
    };

    const violations = await evaluateCompliance(testData, {
      userId: 'test-user',
      sessionId: 'test-session',
      ipAddress: '192.168.1.1'
    });

    console.log('Compliance test completed:', violations);
  };

  const handleGenerateReport = async () => {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago

    try {
      const report = await generateComplianceReport(startDate, endDate);
      console.log('Compliance report generated:', report);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  if (!dashboard) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold">Loading Compliance Dashboard</h3>
          <p className="text-sm text-muted-foreground mt-2">Analyzing compliance status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Automated Compliance Monitoring</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time regulatory compliance monitoring and automated remediation
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            monitoringActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${monitoringActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{monitoringActive ? 'Monitoring Active' : 'Monitoring Inactive'}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={monitoringActive ? stopMonitoring : startMonitoring}
              className={cn(
                'px-4 py-2 rounded text-sm font-medium',
                monitoringActive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              )}
            >
              {monitoringActive ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
            <button
              onClick={handleTestCompliance}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            >
              Test Compliance
            </button>
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {dashboard.overallScore.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">Overall Compliance</div>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {complianceEvents.filter(e => e.status === 'compliant').length}
          </div>
          <div className="text-sm text-muted-foreground">Compliant Events</div>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {complianceEvents.filter(e => e.status === 'non-compliant').length}
          </div>
          <div className="text-sm text-muted-foreground">Violations</div>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {dashboard.activeAlerts.length}
          </div>
          <div className="text-sm text-muted-foreground">Active Alerts</div>
        </div>
      </div>

      {/* Regulations Status */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Regulatory Compliance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboard.regulations.map(regulation => (
            <div key={regulation.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{regulation.name}</h4>
                <span className={cn(
                  'px-2 py-1 rounded text-xs font-medium',
                  regulation.status === 'compliant' ? 'bg-green-100 text-green-800' :
                  regulation.status === 'non-compliant' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                )}>
                  {regulation.status}
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {regulation.complianceScore.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Last audit: {new Date(regulation.lastAudit).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Next audit: {new Date(regulation.nextAudit).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Recent Compliance Events</h3>
        <div className="space-y-3">
          {dashboard.recentEvents.map(event => (
            <div
              key={event.id}
              className={cn(
                'p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow',
                selectedEvent?.id === event.id ? 'border-primary bg-primary/5' : 'border-border'
              )}
              onClick={() => setSelectedEvent(event)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">{event.ruleName}</h4>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    event.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    event.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  )}>
                    {event.severity}
                  </span>
                  <span className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    event.status === 'compliant' ? 'bg-green-100 text-green-800' :
                    event.status === 'non-compliant' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  )}>
                    {event.status}
                  </span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(event.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Alerts */}
      {dashboard.activeAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4">Active Compliance Alerts</h3>
          <div className="space-y-3">
            {dashboard.activeAlerts.map(alert => (
              <div key={alert.id} className="bg-white p-4 rounded border border-red-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-red-900">{alert.ruleName}</h4>
                    <p className="text-sm text-red-700 mt-1">{alert.description}</p>
                    <div className="text-sm text-red-600 mt-2">
                      Severity: <span className="font-medium capitalize">{alert.severity}</span> |
                      Created: {new Date(alert.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                      Investigate
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                      Remediate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Overall Risk Level</h4>
            <div className={cn(
              'text-2xl font-bold mb-2',
              dashboard.riskAssessment.overallRisk === 'low' ? 'text-green-600' :
              dashboard.riskAssessment.overallRisk === 'medium' ? 'text-yellow-600' :
              dashboard.riskAssessment.overallRisk === 'high' ? 'text-orange-600' :
              'text-red-600'
            )}>
              {dashboard.riskAssessment.overallRisk.toUpperCase()}
            </div>
            <div className="text-sm text-muted-foreground">
              Based on current compliance metrics and active violations
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Risk Factors</h4>
            <ul className="text-sm space-y-1">
              {dashboard.riskAssessment.riskFactors.length > 0 ? (
                dashboard.riskAssessment.riskFactors.map((factor, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-red-500">•</span>
                    <span>{factor}</span>
                  </li>
                ))
              ) : (
                <li className="text-green-600">No significant risk factors identified</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Mitigation Strategies</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboard.riskAssessment.mitigationStrategies.map((strategy, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded">
                <span className="text-green-600">✓</span>
                <span className="text-sm font-medium">{strategy}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};