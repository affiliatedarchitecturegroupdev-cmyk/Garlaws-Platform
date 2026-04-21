'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Globe, AlertTriangle, Bell, FileText, TrendingUp, Clock, Search, Filter, ExternalLink, BookOpen, Shield } from 'lucide-react';

export interface RegulatoryChange {
  id: string;
  title: string;
  description: string;
  jurisdiction: string;
  category: 'privacy' | 'data-protection' | 'security' | 'finance' | 'healthcare' | 'consumer-protection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'proposed' | 'draft' | 'published' | 'effective' | 'amended' | 'repealed';
  effectiveDate?: Date;
  complianceDeadline?: Date;
  source: string;
  url?: string;
  affectedSystems: string[];
  impactAssessment: {
    businessImpact: 'none' | 'minor' | 'moderate' | 'major' | 'critical';
    implementationEffort: 'low' | 'medium' | 'high';
    costEstimate: number;
    timeline: string;
  };
  detectedAt: Date;
  lastUpdated: Date;
  assignedTo?: string;
  complianceStatus: 'not-started' | 'planning' | 'implementing' | 'testing' | 'completed';
}

export interface RegulatoryAlert {
  id: string;
  changeId: string;
  type: 'new-regulation' | 'deadline-approaching' | 'status-change' | 'compliance-reminder';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipients: string[];
  sentAt: Date;
  acknowledgedBy: string[];
  status: 'sent' | 'acknowledged' | 'escalated';
}

export interface ComplianceTracker {
  jurisdiction: string;
  regulationCount: number;
  complianceScore: number;
  lastAudit: Date;
  nextAuditDue: Date;
  criticalItems: number;
  overdueItems: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

const SAMPLE_CHANGES: RegulatoryChange[] = [
  {
    id: 'gdpr-amendment-2024',
    title: 'GDPR Amendment - AI Data Processing',
    description: 'New requirements for AI systems processing personal data, including explainability and bias detection',
    jurisdiction: 'EU',
    category: 'privacy',
    severity: 'high',
    status: 'published',
    effectiveDate: new Date('2024-08-01'),
    complianceDeadline: new Date('2025-02-01'),
    source: 'European Commission',
    url: 'https://ec.europa.eu/info/law/better-regulation/have-your-say/initiatives/13628-Artificial-intelligence-ethical-and-legal-requirements_en',
    affectedSystems: ['AI Engine', 'Data Processing Pipeline', 'Analytics Platform'],
    impactAssessment: {
      businessImpact: 'moderate',
      implementationEffort: 'high',
      costEstimate: 250000,
      timeline: '6 months'
    },
    detectedAt: new Date('2024-03-15'),
    lastUpdated: new Date('2024-04-20'),
    assignedTo: 'privacy-team',
    complianceStatus: 'planning'
  },
  {
    id: 'ccpa-cpra-amendment',
    title: 'CPRA - Controller-Processor Agreements',
    description: 'Enhanced requirements for written contracts between controllers and processors',
    jurisdiction: 'US-CA',
    category: 'privacy',
    severity: 'medium',
    status: 'effective',
    effectiveDate: new Date('2024-01-01'),
    source: 'California Privacy Protection Agency',
    affectedSystems: ['Data Processing', 'Third-party Integrations'],
    impactAssessment: {
      businessImpact: 'minor',
      implementationEffort: 'medium',
      costEstimate: 50000,
      timeline: '3 months'
    },
    detectedAt: new Date('2024-02-10'),
    lastUpdated: new Date('2024-04-18'),
    complianceStatus: 'implementing'
  },
  {
    id: 'pip-law-amendment',
    title: 'PIPL - Automated Decision Making',
    description: 'New rules for automated decision-making systems and algorithmic transparency',
    jurisdiction: 'CN',
    category: 'data-protection',
    severity: 'high',
    status: 'proposed',
    effectiveDate: new Date('2024-11-01'),
    source: 'Cyberspace Administration of China',
    affectedSystems: ['AI Decision Engine', 'Automated Workflows'],
    impactAssessment: {
      businessImpact: 'major',
      implementationEffort: 'high',
      costEstimate: 400000,
      timeline: '9 months'
    },
    detectedAt: new Date('2024-04-01'),
    lastUpdated: new Date('2024-04-20'),
    assignedTo: 'china-compliance-team',
    complianceStatus: 'not-started'
  },
  {
    id: 'lgpd-ai-regulation',
    title: 'LGPD AI Impact Assessment',
    description: 'Mandatory impact assessments for AI systems processing personal data',
    jurisdiction: 'BR',
    category: 'privacy',
    severity: 'medium',
    status: 'draft',
    source: 'Autoridade Nacional de Proteção de Dados (ANPD)',
    affectedSystems: ['AI Systems', 'Data Analytics'],
    impactAssessment: {
      businessImpact: 'moderate',
      implementationEffort: 'medium',
      costEstimate: 75000,
      timeline: '4 months'
    },
    detectedAt: new Date('2024-03-25'),
    lastUpdated: new Date('2024-04-19'),
    complianceStatus: 'planning'
  }
];

const SAMPLE_TRACKERS: ComplianceTracker[] = [
  {
    jurisdiction: 'EU',
    regulationCount: 45,
    complianceScore: 94.2,
    lastAudit: new Date('2024-03-15'),
    nextAuditDue: new Date('2024-09-15'),
    criticalItems: 2,
    overdueItems: 1,
    riskLevel: 'medium'
  },
  {
    jurisdiction: 'US-CA',
    regulationCount: 12,
    complianceScore: 96.8,
    lastAudit: new Date('2024-02-28'),
    nextAuditDue: new Date('2024-08-28'),
    criticalItems: 0,
    overdueItems: 0,
    riskLevel: 'low'
  },
  {
    jurisdiction: 'CN',
    regulationCount: 18,
    complianceScore: 89.5,
    lastAudit: new Date('2024-01-20'),
    nextAuditDue: new Date('2024-07-20'),
    criticalItems: 3,
    overdueItems: 2,
    riskLevel: 'high'
  },
  {
    jurisdiction: 'BR',
    regulationCount: 8,
    complianceScore: 97.1,
    lastAudit: new Date('2024-04-01'),
    nextAuditDue: new Date('2024-10-01'),
    criticalItems: 1,
    overdueItems: 0,
    riskLevel: 'low'
  }
];

export const RegulatoryMonitor: React.FC = () => {
  const [changes, setChanges] = useState<RegulatoryChange[]>(SAMPLE_CHANGES);
  const [trackers, setTrackers] = useState<ComplianceTracker[]>(SAMPLE_TRACKERS);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<'changes' | 'trackers' | 'alerts'>('changes');

  // Simulate real-time regulatory monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new regulatory change detection
      if (Math.random() < 0.1) {
        const jurisdictions = ['EU', 'US-CA', 'CN', 'BR', 'UK', 'JP'];
        const categories = ['privacy', 'data-protection', 'security', 'finance', 'healthcare'];
        const severities = ['low', 'medium', 'high', 'critical'];

        const newChange: RegulatoryChange = {
          id: `reg-${Date.now()}`,
          title: 'New Regulatory Development Detected',
          description: 'Automated monitoring has detected a new regulatory proposal that may impact data processing operations.',
          jurisdiction: jurisdictions[Math.floor(Math.random() * jurisdictions.length)],
          category: categories[Math.floor(Math.random() * categories.length)] as any,
          severity: severities[Math.floor(Math.random() * severities.length)] as any,
          status: 'proposed',
          source: 'Automated Regulatory Scanner',
          affectedSystems: ['Data Processing', 'Analytics'],
          impactAssessment: {
            businessImpact: 'moderate',
            implementationEffort: 'medium',
            costEstimate: Math.floor(Math.random() * 200000) + 50000,
            timeline: '6 months'
          },
          detectedAt: new Date(),
          lastUpdated: new Date(),
          complianceStatus: 'not-started'
        };

        setChanges(prev => [newChange, ...prev.slice(0, 49)]); // Keep last 50
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const filteredChanges = changes.filter(change => {
    const jurisdictionMatch = selectedJurisdiction === 'all' || change.jurisdiction === selectedJurisdiction;
    const categoryMatch = selectedCategory === 'all' || change.category === selectedCategory;
    return jurisdictionMatch && categoryMatch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-100';
      case 'high':
        return 'text-orange-700 bg-orange-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'low':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'effective':
        return 'text-green-600 bg-green-100';
      case 'published':
        return 'text-blue-600 bg-blue-100';
      case 'draft':
      case 'proposed':
        return 'text-yellow-600 bg-yellow-100';
      case 'amended':
        return 'text-purple-600 bg-purple-100';
      case 'repealed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'text-red-700 bg-red-100';
      case 'high':
        return 'text-orange-700 bg-orange-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'low':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'implementing':
        return 'text-blue-600 bg-blue-100';
      case 'testing':
        return 'text-purple-600 bg-purple-100';
      case 'planning':
        return 'text-yellow-600 bg-yellow-100';
      case 'not-started':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const updateComplianceStatus = useCallback((changeId: string, status: RegulatoryChange['complianceStatus']) => {
    setChanges(prev => prev.map(change =>
      change.id === changeId
        ? { ...change, complianceStatus: status, lastUpdated: new Date() }
        : change
    ));
  }, []);

  const jurisdictions = ['all', 'EU', 'US-CA', 'CN', 'BR', 'UK', 'JP'];
  const categories = ['all', 'privacy', 'data-protection', 'security', 'finance', 'healthcare', 'consumer-protection'];

  const criticalChanges = changes.filter(c => c.severity === 'critical' || c.severity === 'high').length;
  const upcomingDeadlines = changes.filter(c =>
    c.complianceDeadline && c.complianceDeadline > new Date() &&
    c.complianceDeadline < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length;
  const avgComplianceScore = trackers.reduce((sum, t) => sum + t.complianceScore, 0) / trackers.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Regulatory Monitor</h1>
              <p className="text-gray-600">Automated regulatory change detection and compliance monitoring</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{avgComplianceScore.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Avg Compliance Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Changes</p>
              <p className="text-2xl font-bold text-gray-900">{changes.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <p className="text-2xl font-bold text-gray-900">{criticalChanges}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingDeadlines}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jurisdictions</p>
              <p className="text-2xl font-bold text-gray-900">{trackers.length}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={selectedJurisdiction}
            onChange={(e) => setSelectedJurisdiction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {jurisdictions.map(jurisdiction => (
              <option key={jurisdiction} value={jurisdiction}>
                {jurisdiction === 'all' ? 'All Jurisdictions' : jurisdiction}
              </option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('changes')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'changes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Regulatory Changes
            </button>
            <button
              onClick={() => setSelectedTab('trackers')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'trackers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Compliance Trackers
            </button>
            <button
              onClick={() => setSelectedTab('alerts')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'alerts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Alerts & Notifications
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'changes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Regulatory Changes</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Manual Scan
                </button>
              </div>

              <div className="space-y-4">
                {filteredChanges.map((change) => (
                  <div key={change.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{change.title}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(change.severity)}`}>
                            {change.severity}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(change.status)}`}>
                            {change.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{change.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Jurisdiction:</span>
                            <span className="ml-2 font-medium">{change.jurisdiction}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Category:</span>
                            <span className="ml-2 font-medium capitalize">{change.category.replace('-', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Effective:</span>
                            <span className="ml-2 font-medium">
                              {change.effectiveDate?.toLocaleDateString() || 'TBD'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Deadline:</span>
                            <span className="ml-2 font-medium">
                              {change.complianceDeadline?.toLocaleDateString() || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Affected Systems:</h5>
                      <div className="flex flex-wrap gap-1">
                        {change.affectedSystems.map((system, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            {system}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-sm text-gray-600">Business Impact</div>
                        <div className="font-medium capitalize">{change.impactAssessment.businessImpact}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-sm text-gray-600">Implementation Effort</div>
                        <div className="font-medium capitalize">{change.impactAssessment.implementationEffort}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-sm text-gray-600">Estimated Cost</div>
                        <div className="font-medium">${change.impactAssessment.costEstimate.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Compliance Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplianceStatusColor(change.complianceStatus)}`}>
                          {change.complianceStatus.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {change.url && (
                          <a
                            href={change.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <select
                          value={change.complianceStatus}
                          onChange={(e) => updateComplianceStatus(change.id, e.target.value as any)}
                          className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="not-started">Not Started</option>
                          <option value="planning">Planning</option>
                          <option value="implementing">Implementing</option>
                          <option value="testing">Testing</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'trackers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Compliance Trackers</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Jurisdiction
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {trackers.map((tracker) => (
                  <div key={tracker.jurisdiction} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{tracker.jurisdiction}</h4>
                        <p className="text-sm text-gray-600">{tracker.regulationCount} regulations tracked</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(tracker.riskLevel)}`}>
                        {tracker.riskLevel} risk
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Compliance Score</span>
                          <span className="text-sm font-medium">{tracker.complianceScore.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              tracker.complianceScore >= 90 ? 'bg-green-600' :
                              tracker.complianceScore >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${tracker.complianceScore}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Critical Items:</span>
                          <span className="ml-2 font-medium text-red-600">{tracker.criticalItems}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Overdue Items:</span>
                          <span className="ml-2 font-medium text-orange-600">{tracker.overdueItems}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Audit:</span>
                          <span className="ml-2 font-medium">{tracker.lastAudit.toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Next Audit:</span>
                          <span className="ml-2 font-medium">{tracker.nextAuditDue.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'alerts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Configure Alerts
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Alert Configuration</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">New Regulation Alerts</h5>
                      <p className="text-sm text-gray-600">Get notified when new regulations are detected</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">Deadline Reminders</h5>
                      <p className="text-sm text-gray-600">Receive reminders for upcoming compliance deadlines</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">Status Changes</h5>
                      <p className="text-sm text-gray-600">Notifications when regulation status changes</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">High Priority Alerts</h5>
                      <p className="text-sm text-gray-600">Immediate notifications for critical changes</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h4>
                <div className="space-y-3">
                  {changes.slice(0, 5).map((change) => (
                    <div key={change.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                      <Bell className={`w-5 h-5 mt-0.5 ${
                        change.severity === 'critical' ? 'text-red-500' :
                        change.severity === 'high' ? 'text-orange-500' :
                        'text-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{change.title}</p>
                        <p className="text-xs text-gray-600">
                          {change.jurisdiction} • {change.category} • {change.detectedAt.toLocaleString()}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(change.severity)}`}>
                        {change.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegulatoryMonitor;