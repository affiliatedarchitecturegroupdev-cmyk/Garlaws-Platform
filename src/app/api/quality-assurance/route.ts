import { NextRequest, NextResponse } from 'next/server';
import { qualityAssuranceEngine } from '@/lib/quality-assurance-engine';

// In-memory storage for QA results
const qaResults: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const regulation = searchParams.get('regulation');

    switch (action) {
      case 'quality_gates':
        const gates = qualityAssuranceEngine.getQualityGates();
        return NextResponse.json({
          success: true,
          data: gates
        });

      case 'run_compliance_checks':
        const complianceResults = await qualityAssuranceEngine.runComplianceChecks(regulation || undefined);
        return NextResponse.json({
          success: true,
          data: complianceResults
        });

      case 'qa_status':
        const qaStatus = await getQAStatus();
        return NextResponse.json({
          success: true,
          data: qaStatus
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: quality_gates, run_compliance_checks, or qa_status' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching QA data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QA data' },
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
      case 'run_qa_tests':
        if (!body.testSuite || !body.environment || !body.triggeredBy) {
          return NextResponse.json(
            { error: 'testSuite, environment, and triggeredBy are required' },
            { status: 400 }
          );
        }

        const qaTest = await qualityAssuranceEngine.runQualityTests(
          body.testSuite,
          body.environment,
          body.triggeredBy
        );
        qaResults.push(qaTest);
        return NextResponse.json({
          success: true,
          data: qaTest
        });

      case 'validate_quality_gates':
        if (!body.deployment) {
          return NextResponse.json(
            { error: 'deployment data is required' },
            { status: 400 }
          );
        }

        const validation = await qualityAssuranceEngine.validateQualityGates(body.deployment);
        return NextResponse.json({
          success: true,
          data: validation
        });

      case 'create_quality_gate':
        const gate = await qualityAssuranceEngine.createQualityGate(body);
        return NextResponse.json({
          success: true,
          data: gate
        }, { status: 201 });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: run_qa_tests, validate_quality_gates, or create_quality_gate' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing QA operation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to perform QA operation' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getQAStatus(): Promise<any> {
  const recentTests = qaResults.slice(-10); // Last 10 test runs
  const gates = qualityAssuranceEngine.getQualityGates();

  const testStats = {
    total: recentTests.length,
    passed: recentTests.filter(t => t.status === 'passed').length,
    failed: recentTests.filter(t => t.status === 'failed').length,
    running: recentTests.filter(t => t.status === 'running').length
  };

  const gateStats = {
    total: gates.length,
    enabled: gates.filter(g => g.enabled).length,
    blocking: gates.filter(g => g.blocking).length
  };

  const complianceStats = await qualityAssuranceEngine.runComplianceChecks();

  return {
    tests: testStats,
    gates: gateStats,
    compliance: {
      total: complianceStats.length,
      compliant: complianceStats.filter(c => !c.remediationRequired).length,
      requiringRemediation: complianceStats.filter(c => c.remediationRequired).length
    },
    lastUpdated: new Date(),
    overallHealth: calculateOverallHealth(testStats, gateStats, complianceStats)
  };
}

function calculateOverallHealth(testStats: any, gateStats: any, complianceStats: any[]): 'healthy' | 'warning' | 'critical' {
  let score = 100;

  // Deduct points for failed tests
  score -= (testStats.failed / Math.max(testStats.total, 1)) * 30;

  // Deduct points for compliance issues
  const complianceIssues = complianceStats.filter(c => c.remediationRequired).length;
  score -= (complianceIssues / Math.max(complianceStats.length, 1)) * 40;

  // Deduct points for disabled blocking gates
  const enabledBlockingGates = gateStats.enabled - (gateStats.total - gateStats.blocking);
  const disabledBlocking = gateStats.blocking - enabledBlockingGates;
  score -= (disabledBlocking / Math.max(gateStats.blocking, 1)) * 30;

  if (score >= 80) return 'healthy';
  if (score >= 60) return 'warning';
  return 'critical';
}