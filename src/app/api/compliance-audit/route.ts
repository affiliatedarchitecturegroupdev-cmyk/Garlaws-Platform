import { NextRequest, NextResponse } from 'next/server';
import { complianceAuditEngine, AuditLogEntry, ComplianceRule, ComplianceReport } from '@/lib/compliance-audit-engine';

// In-memory storage (in production, use database)
const auditEntries: AuditLogEntry[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const regulation = searchParams.get('regulation');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    switch (action) {
      case 'audit_logs':
        const filters: any = {};
        if (regulation) filters.regulation = regulation;
        if (startDate) filters.startDate = new Date(startDate);
        if (endDate) filters.endDate = new Date(endDate);
        if (limit) filters.limit = parseInt(limit);

        const logs = await complianceAuditEngine.getAuditLogs(filters);
        return NextResponse.json({
          success: true,
          data: logs
        });

      case 'compliance_rules':
        const rules = complianceAuditEngine.getComplianceRules(regulation || undefined);
        return NextResponse.json({
          success: true,
          data: rules
        });

      case 'compliance_status':
        const status = await getComplianceStatus();
        return NextResponse.json({
          success: true,
          data: status
        });

      case 'audit_trail':
        const entityType = searchParams.get('entityType');
        const entityId = searchParams.get('entityId');
        if (!entityType || !entityId) {
          return NextResponse.json(
            { error: 'entityType and entityId are required' },
            { status: 400 }
          );
        }

        const trail = complianceAuditEngine.getAuditTrail(entityType, entityId);
        return NextResponse.json({
          success: true,
          data: trail
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: audit_logs, compliance_rules, compliance_status, or audit_trail' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching compliance audit data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance audit data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'log_activity':
        const auditEntry = await complianceAuditEngine.logActivity(body);
        auditEntries.push(auditEntry);
        return NextResponse.json({
          success: true,
          data: auditEntry
        });

      case 'create_rule':
        const rule = await complianceAuditEngine.createComplianceRule(body);
        return NextResponse.json({
          success: true,
          data: rule
        }, { status: 201 });

      case 'generate_report':
        if (!body.regulation || !body.startDate || !body.endDate) {
          return NextResponse.json(
            { error: 'regulation, startDate, and endDate are required' },
            { status: 400 }
          );
        }

        const report = await complianceAuditEngine.generateComplianceReport(
          body.regulation,
          new Date(body.startDate),
          new Date(body.endDate)
        );
        return NextResponse.json({
          success: true,
          data: report
        });

      case 'audit_trail':
        if (!body.entityType || !body.entityId || !body.action || !body.userId) {
          return NextResponse.json(
            { error: 'entityType, entityId, action, and userId are required' },
            { status: 400 }
          );
        }

        const trail = await complianceAuditEngine.createAuditTrail(body);
        return NextResponse.json({
          success: true,
          data: trail
        });

      case 'update_audit_trail':
        if (!body.entityType || !body.entityId || !body.action || !body.userId) {
          return NextResponse.json(
            { error: 'entityType, entityId, action, and userId are required' },
            { status: 400 }
          );
        }

        const updatedTrail = await complianceAuditEngine.updateAuditTrail(
          body.entityType,
          body.entityId,
          body.action,
          body.userId,
          body.changes
        );
        return NextResponse.json({
          success: true,
          data: updatedTrail
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: log_activity, create_rule, generate_report, audit_trail, or update_audit_trail' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing compliance audit operation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to perform compliance audit operation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'update_rule':
        if (!body.ruleId) {
          return NextResponse.json(
            { error: 'ruleId is required' },
            { status: 400 }
          );
        }

        const updatedRule = await complianceAuditEngine.updateComplianceRule(body.ruleId, body.updates);
        if (!updatedRule) {
          return NextResponse.json(
            { error: 'Compliance rule not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: updatedRule
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: update_rule' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating compliance rule:', error);
    return NextResponse.json(
      { error: 'Failed to update compliance rule' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getComplianceStatus(): Promise<any> {
  const rules = complianceAuditEngine.getComplianceRules();
  const recentLogs = await complianceAuditEngine.getAuditLogs({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    limit: 1000
  });

  const complianceStats = {
    overall: 'compliant',
    regulations: {
      POPIA: calculateRegulationCompliance('POPIA', recentLogs),
      'B-BBEE': calculateRegulationCompliance('B-BBEE', recentLogs),
      NHBRC: calculateRegulationCompliance('NHBRC', recentLogs),
      CIDB: calculateRegulationCompliance('CIDB', recentLogs)
    },
    activeRules: rules.filter(r => r.enabled).length,
    totalRules: rules.length,
    violationsLast30Days: recentLogs.filter(log =>
      log.complianceFlags.some(flag => flag.status === 'non_compliant')
    ).length,
    criticalViolations: recentLogs.filter(log =>
      log.complianceFlags.some(flag => flag.severity === 'critical')
    ).length,
    lastUpdated: new Date()
  };

  // Determine overall status
  const regulationScores = Object.values(complianceStats.regulations) as any[];
  const avgCompliance = regulationScores.reduce((sum, reg) => sum + reg.compliance, 0) / regulationScores.length;

  if (avgCompliance < 80 || complianceStats.criticalViolations > 0) {
    complianceStats.overall = 'non_compliant';
  } else if (avgCompliance < 95 || complianceStats.violationsLast30Days > 10) {
    complianceStats.overall = 'requires_attention';
  }

  return complianceStats;
}

function calculateRegulationCompliance(regulation: string, logs: AuditLogEntry[]): any {
  const relevantLogs = logs.filter(log =>
    log.complianceFlags.some(flag => flag.regulation === regulation)
  );

  if (relevantLogs.length === 0) {
    return {
      compliance: 100,
      violations: 0,
      totalChecks: 0,
      status: 'compliant'
    };
  }

  const violations = relevantLogs.filter(log =>
    log.complianceFlags.some(flag => flag.status === 'non_compliant')
  );

  const compliance = ((relevantLogs.length - violations.length) / relevantLogs.length) * 100;

  let status = 'compliant';
  if (compliance < 80) status = 'non_compliant';
  else if (compliance < 95) status = 'requires_attention';

  return {
    compliance: Math.round(compliance * 10) / 10,
    violations: violations.length,
    totalChecks: relevantLogs.length,
    status
  };
}