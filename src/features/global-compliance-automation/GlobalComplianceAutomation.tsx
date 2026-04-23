'use client';

import { useState, useEffect, useCallback } from 'react';

interface ComplianceRegulation {
  id: string;
  name: string;
  code: string;
  region: string;
  category: 'privacy' | 'financial' | 'data' | 'security' | 'environmental';
  status: 'active' | 'proposed' | 'deprecated';
  effectiveDate: Date;
  lastUpdated: Date;
  requirements: string[];
  penalties: {
    type: 'fine' | 'imprisonment' | 'business_impact';
    description: string;
    maxAmount?: number;
  }[];
}

interface ComplianceCheck {
  id: string;
  regulationId: string;
  tenantId: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'requires_attention';
  lastChecked: Date;
  nextCheck: Date;
  results: {
    requirement: string;
    status: 'compliant' | 'non_compliant' | 'partial';
    evidence?: string;
    remediation?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
  score: number; // 0-100 compliance score
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ComplianceReport {
  id: string;
  tenantId: string;
  period: {
    start: Date;
    end: Date;
  };
  regulations: ComplianceCheck[];
  overallScore: number;
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    issues: number;
    recommendations: string[];
  };
  generatedAt: Date;
  submittedTo?: string[];
}

interface GlobalComplianceAutomationProps {
  tenantId?: string;
  region?: string;
  onComplianceAlert?: (alert: { regulation: string; issue: string; severity: string }) => void;
  onReportGenerated?: (report: ComplianceReport) => void;
}

const REGULATIONS: ComplianceRegulation[] = [
  {
    id: 'gdpr',
    name: 'General Data Protection Regulation',
    code: 'GDPR',
    region: 'European Union',
    category: 'privacy',
    status: 'active',
    effectiveDate: new Date('2018-05-25'),
    lastUpdated: new Date('2023-12-01'),
    requirements: [
      'Lawful basis for processing personal data',
      'Data subject rights (access, rectification, erasure)',
      'Data protection impact assessment for high-risk processing',
      'Data breach notification within 72 hours',
      'Data Protection Officer appointment for large organizations',
      'Privacy by design and default'
    ],
    penalties: [
      {
        type: 'fine',
        description: 'Up to 4% of global annual turnover or €20 million',
        maxAmount: 20000000
      }
    ]
  },
  {
    id: 'ccpa',
    name: 'California Consumer Privacy Act',
    code: 'CCPA',
    region: 'United States (California)',
    category: 'privacy',
    status: 'active',
    effectiveDate: new Date('2020-01-01'),
    lastUpdated: new Date('2024-01-01'),
    requirements: [
      'Right to know what personal information is collected',
      'Right to delete personal information',
      'Right to opt-out of sale of personal information',
      'Data minimization practices',
      'Security safeguards for personal information'
    ],
    penalties: [
      {
        type: 'fine',
        description: 'Up to $7,500 per violation',
        maxAmount: 7500
      }
    ]
  },
  {
    id: 'pipL',
    name: 'Personal Information Protection Law',
    code: 'PIPL',
    region: 'China',
    category: 'privacy',
    status: 'active',
    effectiveDate: new Date('2021-11-01'),
    lastUpdated: new Date('2023-09-01'),
    requirements: [
      'Legal basis for processing personal information',
      'Data subject rights and consent management',
      'Cross-border data transfer restrictions',
      'Security assessment for critical information infrastructure',
      'Personal information protection impact assessment'
    ],
    penalties: [
      {
        type: 'fine',
        description: 'Up to 5% of previous year\'s revenue',
        maxAmount: undefined // Percentage based
      }
    ]
  },
  {
    id: 'pdpa',
    name: 'Personal Data Protection Act',
    code: 'PDPA',
    region: 'Singapore',
    category: 'privacy',
    status: 'active',
    effectiveDate: new Date('2021-02-01'),
    lastUpdated: new Date('2023-06-01'),
    requirements: [
      'Consent for collection, use, and disclosure of personal data',
      'Purpose limitation and data minimization',
      'Accuracy and retention of personal data',
      'Security safeguards and data breach notification',
      'Data portability rights',
      'Accountability and governance requirements'
    ],
    penalties: [
      {
        type: 'fine',
        description: 'Up to SGD $1 million',
        maxAmount: 1000000
      }
    ]
  },
  {
    id: 'lgpd',
    name: 'Brazilian General Data Protection Law',
    code: 'LGPD',
    region: 'Brazil',
    category: 'privacy',
    status: 'active',
    effectiveDate: new Date('2020-09-18'),
    lastUpdated: new Date('2023-08-01'),
    requirements: [
      'Lawful basis for processing personal data',
      'Data subject rights (confirmation, access, correction, etc.)',
      'Data protection impact assessment',
      'Data breach notification within 72 hours',
      'International data transfer requirements',
      'Privacy program and data protection officer'
    ],
    penalties: [
      {
        type: 'fine',
        description: 'Up to 2% of revenue or R$50 million',
        maxAmount: 50000000
      }
    ]
  },
  {
    id: 'popia',
    name: 'Protection of Personal Information Act',
    code: 'POPIA',
    region: 'South Africa',
    category: 'privacy',
    status: 'active',
    effectiveDate: new Date('2021-07-01'),
    lastUpdated: new Date('2023-07-01'),
    requirements: [
      'Accountability and responsibility for personal information',
      'Processing limitation and purpose specification',
      'Further processing limitation',
      'Information quality principles',
      'Openness about processing practices',
      'Security safeguards and data breach notification'
    ],
    penalties: [
      {
        type: 'fine',
        description: 'Up to ZAR 10 million or imprisonment up to 12 months',
        maxAmount: 10000000
      },
      {
        type: 'imprisonment',
        description: 'Up to 12 months imprisonment',
        maxAmount: undefined
      }
    ]
  }
];

export default function GlobalComplianceAutomation({
  tenantId = 'default',
  region = 'global',
  onComplianceAlert,
  onReportGenerated
}: GlobalComplianceAutomationProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'regulations' | 'checks' | 'reports' | 'alerts'>('overview');
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [selectedRegulation, setSelectedRegulation] = useState<ComplianceRegulation | null>(null);
  const [isRunningCheck, setIsRunningCheck] = useState(false);

  const runComplianceCheck = useCallback(async (regulationId: string) => {
    setIsRunningCheck(true);

    const regulation = REGULATIONS.find(r => r.id === regulationId);
    if (!regulation) return;

    // Simulate compliance check
    const checkResults = regulation.requirements.map((requirement, index) => {
      const status = Math.random() > 0.8 ? 'non_compliant' :
                    Math.random() > 0.6 ? 'partial' : 'compliant';
      const severity = status === 'non_compliant' ? 'high' :
                      status === 'partial' ? 'medium' : 'low';

      return {
        requirement,
        status: status as 'compliant' | 'non_compliant' | 'partial',
        evidence: status === 'compliant' ? 'Automated verification passed' : undefined,
        remediation: status !== 'compliant' ? `Implement ${requirement.toLowerCase()}` : undefined,
        severity: severity as 'low' | 'medium' | 'high' | 'critical'
      };
    });

    const compliantCount = checkResults.filter(r => r.status === 'compliant').length;
    const score = Math.round((compliantCount / regulation.requirements.length) * 100);

    const check: ComplianceCheck = {
      id: `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      regulationId,
      tenantId,
      status: score >= 80 ? 'passed' : score >= 60 ? 'requires_attention' : 'failed',
      lastChecked: new Date(),
      nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      results: checkResults,
      score,
      riskLevel: score >= 80 ? 'low' : score >= 60 ? 'medium' : score >= 40 ? 'high' : 'critical'
    };

    setComplianceChecks(prev => [check, ...prev.filter(c => c.regulationId !== regulationId)]);

    // Trigger alerts for critical issues
    const criticalIssues = checkResults.filter(r => r.severity === 'critical' || r.status === 'non_compliant');
    criticalIssues.forEach(issue => {
      onComplianceAlert?.({
        regulation: regulation.name,
        issue: issue.requirement,
        severity: issue.severity
      });
    });

    setIsRunningCheck(false);
  }, [tenantId, onComplianceAlert]);

  const generateComplianceReport = useCallback(() => {
    const period = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    };

    const relevantChecks = complianceChecks.filter(check =>
      check.lastChecked >= period.start && check.lastChecked <= period.end
    );

    const overallScore = relevantChecks.length > 0
      ? Math.round(relevantChecks.reduce((sum, check) => sum + check.score, 0) / relevantChecks.length)
      : 0;

    const criticalIssues = relevantChecks.flatMap(check =>
      check.results.filter(r => r.severity === 'critical' || r.status === 'non_compliant')
    ).length;

    const riskLevel = overallScore >= 80 ? 'low' :
                     overallScore >= 60 ? 'medium' :
                     overallScore >= 40 ? 'high' : 'critical';

    const report: ComplianceReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      period,
      regulations: relevantChecks,
      overallScore,
      riskAssessment: {
        level: riskLevel as any,
        issues: criticalIssues,
        recommendations: [
          riskLevel === 'critical' ? 'Immediate remediation required for critical compliance gaps' :
          riskLevel === 'high' ? 'Address high-priority compliance issues within 30 days' :
          riskLevel === 'medium' ? 'Review and improve compliance processes' :
          'Maintain current compliance standards'
        ]
      },
      generatedAt: new Date()
    };

    setReports(prev => [report, ...prev]);
    onReportGenerated?.(report);
  }, [complianceChecks, tenantId, onReportGenerated]);

  const getApplicableRegulations = useCallback(() => {
    if (region === 'global') return REGULATIONS;
    return REGULATIONS.filter(r => r.region.includes(region) || r.region === 'Global');
  }, [region]);

  const getComplianceStatusColor = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'passed': return '#10B981';
      case 'requires_attention': return '#F59E0B';
      case 'failed': return '#EF4444';
      case 'pending': return '#6B7280';
      case 'running': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getRiskColor = (risk: ComplianceCheck['riskLevel']) => {
    switch (risk) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#7C2D12';
      default: return '#6B7280';
    }
  };

  const applicableRegulations = getApplicableRegulations();
  const totalChecks = complianceChecks.length;
  const passedChecks = complianceChecks.filter(c => c.status === 'passed').length;
  const failedChecks = complianceChecks.filter(c => c.status === 'failed').length;
  const overallComplianceScore = complianceChecks.length > 0
    ? Math.round(complianceChecks.reduce((sum, c) => sum + c.score, 0) / complianceChecks.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Global Compliance Automation</h1>
            <p className="text-gray-600">Automated compliance monitoring for international regulations</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Region</div>
              <div className="font-medium">{region === 'global' ? 'Global' : region}</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{applicableRegulations.length}</div>
            <div className="text-sm text-gray-600">Regulations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{passedChecks}</div>
            <div className="text-sm text-gray-600">Passed Checks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{failedChecks}</div>
            <div className="text-sm text-gray-600">Failed Checks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{overallComplianceScore}%</div>
            <div className="text-sm text-gray-600">Compliance Score</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'regulations', label: 'Regulations', icon: '⚖️' },
              { id: 'checks', label: 'Compliance Checks', icon: '✅' },
              { id: 'reports', label: 'Reports', icon: '📄' },
              { id: 'alerts', label: 'Alerts', icon: '🚨' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Compliance Score Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Compliance Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overall Score</span>
                      <span className="text-2xl font-bold text-blue-600">{overallComplianceScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${overallComplianceScore}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-medium text-green-600">{passedChecks}</div>
                        <div className="text-gray-600">Passed</div>
                      </div>
                      <div>
                        <div className="font-medium text-yellow-600">
                          {complianceChecks.filter(c => c.status === 'requires_attention').length}
                        </div>
                        <div className="text-gray-600">Attention</div>
                      </div>
                      <div>
                        <div className="font-medium text-red-600">{failedChecks}</div>
                        <div className="text-gray-600">Failed</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Risk Assessment</h3>
                  <div className="space-y-4">
                    {complianceChecks.slice(0, 5).map((check) => {
                      const regulation = REGULATIONS.find(r => r.id === check.regulationId);
                      return (
                        <div key={check.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{regulation?.code}</div>
                            <div className="text-xs text-gray-600">{regulation?.name}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="px-2 py-1 text-xs rounded"
                              style={{ backgroundColor: getRiskColor(check.riskLevel) }}
                            >
                              {check.riskLevel}
                            </span>
                            <span className="text-sm font-medium">{check.score}%</span>
                          </div>
                        </div>
                      );
                    })}
                    {complianceChecks.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <div className="text-4xl mb-2">📋</div>
                        <div>No compliance checks yet</div>
                        <div className="text-sm">Run checks to see risk assessment</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Quick Actions</h3>
                <div className="flex gap-4">
                  <button
                    onClick={generateComplianceReport}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Generate Report
                  </button>
                  <button
                    onClick={() => setActiveTab('checks')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Run Compliance Check
                  </button>
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    View Alerts
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Regulations Tab */}
          {activeTab === 'regulations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Applicable Regulations</h2>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Categories</option>
                    <option>Privacy</option>
                    <option>Financial</option>
                    <option>Data</option>
                    <option>Security</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Regions</option>
                    <option>European Union</option>
                    <option>United States</option>
                    <option>Asia</option>
                    <option>Global</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {applicableRegulations.map((regulation) => {
                  const check = complianceChecks.find(c => c.regulationId === regulation.id);
                  return (
                    <div
                      key={regulation.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{regulation.name}</h3>
                          <p className="text-sm text-gray-600">{regulation.code} - {regulation.region}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          regulation.category === 'privacy' ? 'bg-blue-100 text-blue-800' :
                          regulation.category === 'financial' ? 'bg-green-100 text-green-800' :
                          regulation.category === 'data' ? 'bg-purple-100 text-purple-800' :
                          regulation.category === 'security' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {regulation.category}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm text-gray-500 mb-2">Key Requirements:</div>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {regulation.requirements.slice(0, 3).map((req, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <span>{req}</span>
                            </li>
                          ))}
                          {regulation.requirements.length > 3 && (
                            <li className="text-gray-500">...and {regulation.requirements.length - 3} more</li>
                          )}
                        </ul>
                      </div>

                      {check && (
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Last Check</span>
                            <span
                              className="px-2 py-1 text-xs rounded"
                              style={{ backgroundColor: getComplianceStatusColor(check.status) }}
                            >
                              {check.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Score: {check.score}%</span>
                            <span>Risk: {check.riskLevel}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedRegulation(regulation)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => runComplianceCheck(regulation.id)}
                          disabled={isRunningCheck}
                          className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {isRunningCheck ? 'Checking...' : 'Run Check'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Compliance Checks Tab */}
          {activeTab === 'checks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Compliance Checks</h2>
                <button
                  onClick={() => {
                    applicableRegulations.forEach(reg => {
                      if (!complianceChecks.find(c => c.regulationId === reg.id)) {
                        runComplianceCheck(reg.id);
                      }
                    });
                  }}
                  disabled={isRunningCheck}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isRunningCheck ? 'Running Checks...' : 'Run All Checks'}
                </button>
              </div>

              {complianceChecks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">🔍</div>
                  <div>No compliance checks have been run yet</div>
                  <div className="text-sm">Click "Run All Checks" to start compliance monitoring</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {complianceChecks.map((check) => {
                    const regulation = REGULATIONS.find(r => r.id === check.regulationId);
                    return (
                      <div key={check.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {regulation?.name} ({regulation?.code})
                            </h3>
                            <p className="text-sm text-gray-600">
                              Last checked: {check.lastChecked.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className="px-3 py-1 text-sm rounded-full text-white"
                              style={{ backgroundColor: getComplianceStatusColor(check.status) }}
                            >
                              {check.status.replace('_', ' ')}
                            </span>
                            <span
                              className="px-3 py-1 text-sm rounded-full text-white"
                              style={{ backgroundColor: getRiskColor(check.riskLevel) }}
                            >
                              {check.riskLevel} risk
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-lg font-bold text-gray-900">{check.score}%</div>
                            <div className="text-sm text-gray-600">Compliance Score</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-lg font-bold text-gray-900">
                              {check.results.filter(r => r.status === 'compliant').length}
                            </div>
                            <div className="text-sm text-gray-600">Passed Requirements</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-lg font-bold text-gray-900">
                              {check.results.filter(r => r.status !== 'compliant').length}
                            </div>
                            <div className="text-sm text-gray-600">Issues Found</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-2">Check Results</div>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {check.results.map((result, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                <span className="flex-1">{result.requirement}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    result.status === 'compliant' ? 'bg-green-100 text-green-800' :
                                    result.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {result.status}
                                  </span>
                                  {result.severity !== 'low' && (
                                    <span className={`px-2 py-1 text-xs rounded ${
                                      result.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                      result.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {result.severity}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Compliance Reports</h2>
                <button
                  onClick={generateComplianceReport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Generate New Report
                </button>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">📄</div>
                  <div>No compliance reports generated yet</div>
                  <div className="text-sm">Generate a report to track compliance status</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">Compliance Report</h3>
                          <p className="text-sm text-gray-600">
                            {report.period.start.toLocaleDateString()} - {report.period.end.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-sm rounded-full text-white ${
                            report.riskAssessment.level === 'low' ? 'bg-green-600' :
                            report.riskAssessment.level === 'medium' ? 'bg-yellow-600' :
                            report.riskAssessment.level === 'high' ? 'bg-orange-600' :
                            'bg-red-600'
                          }`}>
                            {report.riskAssessment.level} risk
                          </span>
                          <span className="text-sm font-medium">{report.overallScore}% compliance</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-gray-900">{report.regulations.length}</div>
                          <div className="text-sm text-gray-600">Regulations Checked</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-gray-900">{report.riskAssessment.issues}</div>
                          <div className="text-sm text-gray-600">Critical Issues</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-gray-900">
                            {report.generatedAt.toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">Generated</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">Recommendations</div>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {report.riskAssessment.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                          Download PDF
                        </button>
                        <button className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                          Send to Regulator
                        </button>
                        <button className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
                          Archive
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Compliance Alerts</h2>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <div className="text-yellow-600 text-xl">⚠️</div>
                  <div>
                    <h3 className="font-medium text-yellow-800">Compliance Monitoring Active</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Real-time monitoring is enabled. Critical compliance issues will be displayed here with automated alerts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Mock alerts - in real implementation, these would come from the compliance checks */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-red-600">🚨</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800">GDPR Compliance Gap</h4>
                      <p className="text-sm text-red-700">Data breach notification not implemented within 72-hour requirement</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-red-600">
                        <span>Critical</span>
                        <span>Requires immediate attention</span>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                      Remediate
                    </button>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-orange-600">⚠️</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-orange-800">CCPA Data Mapping Incomplete</h4>
                      <p className="text-sm text-orange-700">Personal information inventory not fully documented</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-orange-600">
                        <span>High Priority</span>
                        <span>Due in 30 days</span>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Regulation Details Modal */}
      {selectedRegulation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedRegulation.name}</h2>
                <button
                  onClick={() => setSelectedRegulation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{selectedRegulation.code}</div>
                    <div className="text-sm text-gray-600">Code</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{selectedRegulation.region}</div>
                    <div className="text-sm text-gray-600">Region</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">
                      {selectedRegulation.effectiveDate.getFullYear()}
                    </div>
                    <div className="text-sm text-gray-600">Effective</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900 capitalize">{selectedRegulation.status}</div>
                    <div className="text-sm text-gray-600">Status</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Key Requirements</h3>
                  <div className="space-y-2">
                    {selectedRegulation.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-sm">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Penalties & Fines</h3>
                  <div className="space-y-2">
                    {selectedRegulation.penalties.map((penalty, idx) => (
                      <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-red-600">⚠️</span>
                          <span className="font-medium text-red-800 capitalize">{penalty.type}</span>
                        </div>
                        <p className="text-sm text-red-700">{penalty.description}</p>
                        {penalty.maxAmount && (
                          <p className="text-sm text-red-600 mt-1">
                            Maximum: {penalty.maxAmount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => runComplianceCheck(selectedRegulation.id)}
                    disabled={isRunningCheck}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isRunningCheck ? 'Running Check...' : 'Run Compliance Check'}
                  </button>
                  <button
                    onClick={() => setSelectedRegulation(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}