import { NextRequest, NextResponse } from 'next/server';

// In-memory mock storage
const testSuites: any[] = [];
const testCases: any[] = [];
const testRuns: any[] = [];
const bugs: any[] = [];
const codeQualityReports: any[] = [];
const qualityMetrics: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tenantId = searchParams.get('tenantId');

    switch (action) {
      case 'test_suites':
        return NextResponse.json({
          success: true,
          data: testSuites.filter(ts => !tenantId || ts.tenantId === tenantId)
        });

      case 'test_cases':
        const suiteId = searchParams.get('suiteId');
        let filteredCases = testCases.filter(tc => !tenantId || tc.tenantId === tenantId);
        if (suiteId) {
          filteredCases = filteredCases.filter(tc => tc.testSuiteId === suiteId);
        }
        return NextResponse.json({
          success: true,
          data: filteredCases
        });

      case 'test_runs':
        const limit = parseInt(searchParams.get('limit') || '50');
        const runs = testRuns
          .filter(tr => !tenantId || tr.tenantId === tenantId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
        return NextResponse.json({ success: true, data: runs });

      case 'bugs':
        return NextResponse.json({
          success: true,
          data: bugs.filter(b => !tenantId || b.tenantId === tenantId)
        });

      case 'code_quality_reports':
        const projectId = searchParams.get('projectId');
        let reports = codeQualityReports.filter(cqr => !tenantId || cqr.tenantId === tenantId);
        if (projectId) {
          reports = reports.filter(r => r.projectId === projectId);
        }
        return NextResponse.json({ success: true, data: reports });

      case 'quality_metrics':
        const fromDate = searchParams.get('from');
        const toDate = searchParams.get('to');
        let metrics = qualityMetrics.filter(qm => !tenantId || qm.tenantId === tenantId);

        if (fromDate && toDate) {
          metrics = metrics.filter(m =>
            new Date(m.date) >= new Date(fromDate) &&
            new Date(m.date) <= new Date(toDate)
          );
        }

        return NextResponse.json({ success: true, data: metrics });

      case 'qa_analytics':
        const analytics = {
          totalTestSuites: testSuites.length,
          totalTestCases: testCases.length,
          automatedTests: testCases.filter(tc => tc.automationStatus === 'automated').length,
          recentTestRuns: testRuns.slice(0, 10),
          openBugs: bugs.filter(b => b.status === 'open').length,
          criticalBugs: bugs.filter(b => b.severity === 'critical' && b.status !== 'resolved').length,
          avgCodeQualityScore: codeQualityReports.length > 0 ?
            codeQualityReports.reduce((sum, r) => sum + (r.score || 0), 0) / codeQualityReports.length : 0,
          testCoverage: 85.5, // Mock percentage
          testExecutionTime: testRuns.reduce((sum, run) => sum + (run.duration || 0), 0),
          bugResolutionRate: bugs.length > 0 ?
            (bugs.filter(b => b.status === 'resolved').length / bugs.length) * 100 : 100
        };
        return NextResponse.json({ success: true, data: analytics });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('QA API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'create_test_suite':
        const testSuite = {
          id: `ts-${Date.now()}`,
          name: body.name,
          description: body.description,
          tenantId: body.tenantId || 'default',
          testType: body.testType || 'unit',
          framework: body.framework,
          status: 'active',
          createdBy: body.createdBy || 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        testSuites.push(testSuite);
        return NextResponse.json({ success: true, data: testSuite }, { status: 201 });

      case 'create_test_case':
        const testCase = {
          id: `tc-${Date.now()}`,
          testSuiteId: body.testSuiteId,
          title: body.title,
          description: body.description,
          priority: body.priority || 'medium',
          status: 'draft',
          testSteps: body.testSteps || [],
          expectedResult: body.expectedResult,
          automationStatus: body.automationStatus || 'manual',
          createdBy: body.createdBy || 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        testCases.push(testCase);
        return NextResponse.json({ success: true, data: testCase }, { status: 201 });

      case 'run_test_suite':
        const run: any = {
          id: `tr-${Date.now()}`,
          testSuiteId: body.testSuiteId,
          name: body.name || `Test Run ${Date.now()}`,
          status: 'running',
          environment: body.environment || 'development',
          triggeredBy: 'manual',
          triggeredByUser: body.triggeredBy,
          startTime: new Date(),
          totalTests: testCases.filter(tc => tc.testSuiteId === body.testSuiteId).length,
          passedTests: 0,
          failedTests: 0,
          endTime: null,
          duration: 0,
          createdAt: new Date()
        };
        testRuns.push(run);

        // Simulate test execution
        setTimeout(() => {
          run.status = 'completed';
          run.endTime = new Date();
          run.duration = Math.floor(Math.random() * 300) + 60; // 1-5 minutes
          run.passedTests = Math.floor(run.totalTests * 0.85);
          run.failedTests = run.totalTests - run.passedTests;
        }, 2000);

        return NextResponse.json({ success: true, data: run }, { status: 201 });

      case 'create_bug':
        const bug = {
          id: `bug-${Date.now()}`,
          title: body.title,
          description: body.description,
          tenantId: body.tenantId || 'default',
          severity: body.severity || 'medium',
          priority: body.priority || 'medium',
          status: 'open',
          type: body.type || 'bug',
          reportedBy: body.reportedBy,
          assignedTo: body.assignedTo,
          tags: body.tags || [],
          reproductionSteps: body.reproductionSteps,
          expectedBehavior: body.expectedBehavior,
          actualBehavior: body.actualBehavior,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        bugs.push(bug);
        return NextResponse.json({ success: true, data: bug }, { status: 201 });

      case 'submit_code_quality_report':
        const report = {
          id: `cqr-${Date.now()}`,
          projectId: body.projectId,
          commitHash: body.commitHash,
          branch: body.branch || 'main',
          tool: body.tool || 'eslint',
          status: body.status || 'passed',
          score: body.score || 85,
          issues: body.issues || [],
          metrics: body.metrics || {},
          generatedAt: new Date(),
          createdAt: new Date()
        };
        codeQualityReports.push(report);
        return NextResponse.json({ success: true, data: report }, { status: 201 });

      case 'record_quality_metric':
        const metric = {
          id: `qm-${Date.now()}`,
          tenantId: body.tenantId || 'default',
          projectId: body.projectId,
          metricType: body.metricType,
          metricName: body.metricName,
          value: body.value,
          target: body.target,
          unit: body.unit,
          date: new Date(),
          metadata: body.metadata || {},
          createdAt: new Date()
        };
        qualityMetrics.push(metric);
        return NextResponse.json({ success: true, data: metric }, { status: 201 });

      case 'run_security_scan':
        const scan: any = {
          id: `scan-${Date.now()}`,
          name: body.name || 'Security Scan',
          description: body.description,
          tenantId: body.tenantId || 'default',
          scanType: body.scanType || 'sast',
          target: body.target,
          tool: body.tool || 'owasp_zap',
          status: 'running',
          vulnerabilities: [],
          severityCounts: {},
          createdBy: body.createdBy || 'system',
          createdAt: new Date()
        };

        // Simulate scan completion
        setTimeout(() => {
          scan.status = 'completed';
          // Add mock vulnerabilities
          scan.vulnerabilities = [
            { severity: 'high', title: 'SQL Injection', description: 'Potential SQL injection vulnerability' },
            { severity: 'medium', title: 'XSS', description: 'Cross-site scripting vulnerability' }
          ];
          scan.severityCounts = { critical: 0, high: 1, medium: 1, low: 3 };
        }, 3000);

        return NextResponse.json({ success: true, data: scan }, { status: 201 });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('QA API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'update_bug_status':
        const bug = bugs.find(b => b.id === body.bugId);
        if (bug) {
          bug.status = body.status;
          bug.updatedAt = new Date();
          if (body.status === 'resolved') {
            bug.resolvedAt = new Date();
            bug.resolution = body.resolution;
          }
          return NextResponse.json({ success: true, data: bug });
        }
        return NextResponse.json({ error: 'Bug not found' }, { status: 404 });

      case 'update_test_case':
        const testCase = testCases.find(tc => tc.id === body.testCaseId);
        if (testCase) {
          Object.assign(testCase, body.updates, { updatedAt: new Date() });
          return NextResponse.json({ success: true, data: testCase });
        }
        return NextResponse.json({ error: 'Test case not found' }, { status: 404 });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('QA API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}