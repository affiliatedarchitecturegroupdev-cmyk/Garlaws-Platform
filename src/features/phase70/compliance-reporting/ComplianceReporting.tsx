'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Calendar, AlertTriangle, CheckCircle, Download, Send, Clock, TrendingUp, Settings } from 'lucide-react';

export interface ComplianceReport {
  id: string;
  title: string;
  type: 'quarterly' | 'annual' | 'ad-hoc' | 'breach' | 'audit';
  jurisdiction: string;
  status: 'draft' | 'review' | 'approved' | 'submitted' | 'rejected';
  dueDate: Date;
  submittedDate?: Date;
  approvedBy?: string;
  sections: ComplianceReportSection[];
  attachments: string[];
  generatedAt: Date;
  lastModified: Date;
  compliance: {
    overallScore: number;
    criticalIssues: number;
    resolvedIssues: number;
    pendingActions: number;
  };
}

export interface ComplianceReportSection {
  id: string;
  title: string;
  content: string;
  status: 'complete' | 'incomplete' | 'pending';
  required: boolean;
  wordCount?: number;
  lastUpdated: Date;
}

export interface RegulatoryDeadline {
  id: string;
  title: string;
  description: string;
  jurisdiction: string;
  category: 'reporting' | 'audit' | 'certification' | 'notification';
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'upcoming' | 'due-soon' | 'overdue' | 'completed';
  assignedTo?: string;
  dependencies: string[];
  reminders: {
    days: number;
    sent: boolean;
    sentAt?: Date;
  }[];
  completionNotes?: string;
}

const SAMPLE_REPORTS: ComplianceReport[] = [
  {
    id: 'q4-2024-gdpr',
    title: 'Q4 2024 GDPR Compliance Report',
    type: 'quarterly',
    jurisdiction: 'EU',
    status: 'approved',
    dueDate: new Date('2025-01-31'),
    submittedDate: new Date('2025-01-28'),
    approvedBy: 'compliance-officer',
    sections: [
      {
        id: 'data-processing',
        title: 'Data Processing Activities',
        content: 'Comprehensive overview of all data processing activities conducted in Q4 2024...',
        status: 'complete',
        required: true,
        wordCount: 1250,
        lastUpdated: new Date('2025-01-25')
      },
      {
        id: 'data-breaches',
        title: 'Data Breach Incidents',
        content: 'Report of any data breaches or security incidents...',
        status: 'complete',
        required: true,
        wordCount: 450,
        lastUpdated: new Date('2025-01-26')
      },
      {
        id: 'subject-rights',
        title: 'Data Subject Rights Requests',
        content: 'Summary of all data subject rights requests processed...',
        status: 'complete',
        required: true,
        wordCount: 780,
        lastUpdated: new Date('2025-01-27')
      }
    ],
    attachments: ['gdpr-report-q4-2024.pdf', 'data-processing-log.xlsx'],
    generatedAt: new Date('2025-01-20'),
    lastModified: new Date('2025-01-28'),
    compliance: {
      overallScore: 96.7,
      criticalIssues: 0,
      resolvedIssues: 12,
      pendingActions: 2
    }
  },
  {
    id: 'ccpa-annual-2024',
    title: '2024 CCPA Annual Report',
    type: 'annual',
    jurisdiction: 'US-CA',
    status: 'draft',
    dueDate: new Date('2025-03-01'),
    sections: [
      {
        id: 'privacy-program',
        title: 'Privacy Program Overview',
        content: 'Description of our privacy program and practices...',
        status: 'incomplete',
        required: true,
        lastUpdated: new Date('2024-12-15')
      }
    ],
    attachments: [],
    generatedAt: new Date('2024-11-01'),
    lastModified: new Date('2024-12-15'),
    compliance: {
      overallScore: 0,
      criticalIssues: 0,
      resolvedIssues: 0,
      pendingActions: 8
    }
  }
];

const SAMPLE_DEADLINES: RegulatoryDeadline[] = [
  {
    id: 'gdpr-annual-report',
    title: 'GDPR Annual Report',
    description: 'Annual report on data processing activities and compliance measures',
    jurisdiction: 'EU',
    category: 'reporting',
    dueDate: new Date('2025-05-25'),
    priority: 'high',
    status: 'upcoming',
    assignedTo: 'compliance-team',
    dependencies: ['data-processing-inventory', 'dpo-review'],
    reminders: [
      { days: 30, sent: false },
      { days: 7, sent: false },
      { days: 1, sent: false }
    ]
  },
  {
    id: 'ccpa-privacy-assessment',
    title: 'CCPA Privacy Assessment',
    description: 'Annual privacy assessment and program review',
    jurisdiction: 'US-CA',
    category: 'audit',
    dueDate: new Date('2025-02-15'),
    priority: 'medium',
    status: 'due-soon',
    assignedTo: 'privacy-officer',
    dependencies: ['ccpa-inventory'],
    reminders: [
      { days: 14, sent: true, sentAt: new Date('2025-01-25') },
      { days: 7, sent: false },
      { days: 1, sent: false }
    ]
  },
  {
    id: 'breach-notification',
    title: 'Data Breach Notification Deadline',
    description: '72-hour notification requirement for data breaches',
    jurisdiction: 'GDPR',
    category: 'notification',
    dueDate: new Date('2024-12-20'),
    priority: 'critical',
    status: 'overdue',
    dependencies: ['incident-response'],
    reminders: [
      { days: 3, sent: true, sentAt: new Date('2024-12-17') },
      { days: 1, sent: true, sentAt: new Date('2024-12-19') }
    ]
  }
];

export const ComplianceReporting: React.FC = () => {
  const [reports, setReports] = useState<ComplianceReport[]>(SAMPLE_REPORTS);
  const [deadlines, setDeadlines] = useState<RegulatoryDeadline[]>(SAMPLE_DEADLINES);
  const [selectedTab, setSelectedTab] = useState<'reports' | 'deadlines' | 'analytics'>('reports');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update deadline statuses based on current time
      setDeadlines(prev => prev.map(deadline => {
        const now = new Date();
        const daysUntilDue = Math.ceil((deadline.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        let status: RegulatoryDeadline['status'] = 'upcoming';
        if (daysUntilDue < 0) status = 'overdue';
        else if (daysUntilDue <= 7) status = 'due-soon';
        else status = 'upcoming';

        return { ...deadline, status };
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const generateReport = useCallback((type: ComplianceReport['type'], jurisdiction: string) => {
    const newReport: ComplianceReport = {
      id: `${type}-${Date.now()}`,
      title: `${jurisdiction} ${type.charAt(0).toUpperCase() + type.slice(1)} Compliance Report`,
      type,
      jurisdiction,
      status: 'draft',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      sections: [
        {
          id: 'executive-summary',
          title: 'Executive Summary',
          content: '',
          status: 'pending',
          required: true,
          lastUpdated: new Date()
        },
        {
          id: 'compliance-overview',
          title: 'Compliance Overview',
          content: '',
          status: 'pending',
          required: true,
          lastUpdated: new Date()
        },
        {
          id: 'issues-resolution',
          title: 'Issues and Resolution',
          content: '',
          status: 'pending',
          required: true,
          lastUpdated: new Date()
        }
      ],
      attachments: [],
      generatedAt: new Date(),
      lastModified: new Date(),
      compliance: {
        overallScore: 0,
        criticalIssues: 0,
        resolvedIssues: 0,
        pendingActions: 0
      }
    };

    setReports(prev => [newReport, ...prev]);
  }, []);

  const submitReport = useCallback((reportId: string) => {
    setReports(prev => prev.map(report =>
      report.id === reportId
        ? {
            ...report,
            status: 'submitted',
            submittedDate: new Date(),
            lastModified: new Date()
          }
        : report
    ));
  }, []);

  const updateDeadlineStatus = useCallback((deadlineId: string, status: RegulatoryDeadline['status']) => {
    setDeadlines(prev => prev.map(deadline =>
      deadline.id === deadlineId
        ? { ...deadline }
        : deadline
    ));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'submitted':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'draft':
      case 'upcoming':
        return 'text-yellow-600 bg-yellow-100';
      case 'review':
      case 'due-soon':
        return 'text-blue-600 bg-blue-100';
      case 'rejected':
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const upcomingDeadlines = deadlines.filter(d => d.status === 'upcoming' || d.status === 'due-soon').length;
  const overdueDeadlines = deadlines.filter(d => d.status === 'overdue').length;
  const submittedReports = reports.filter(r => r.status === 'submitted' || r.status === 'approved').length;
  const draftReports = reports.filter(r => r.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Compliance Reporting</h1>
              <p className="text-gray-600">Automated compliance reporting and regulatory deadline tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Submitted Reports</p>
              <p className="text-2xl font-bold text-gray-900">{submittedReports}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingDeadlines}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Items</p>
              <p className="text-2xl font-bold text-gray-900">{overdueDeadlines}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('reports')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Compliance Reports
            </button>
            <button
              onClick={() => setSelectedTab('deadlines')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'deadlines'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Regulatory Deadlines
            </button>
            <button
              onClick={() => setSelectedTab('analytics')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Compliance Reports</h3>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">All Jurisdictions</option>
                    <option value="EU">EU</option>
                    <option value="US-CA">US-CA</option>
                    <option value="CN">CN</option>
                  </select>
                  <button
                    onClick={() => generateReport('quarterly', 'EU')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Generate Report
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{report.title}</h4>
                          <p className="text-sm text-gray-600">
                            {report.jurisdiction} • {report.type} • Due: {report.dueDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className="text-sm font-medium">{report.compliance.overallScore}% compliance</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">Critical Issues:</span>
                        <span className="ml-2 font-medium text-red-600">{report.compliance.criticalIssues}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Resolved:</span>
                        <span className="ml-2 font-medium text-green-600">{report.compliance.resolvedIssues}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Pending:</span>
                        <span className="ml-2 font-medium text-yellow-600">{report.compliance.pendingActions}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Sections:</span>
                        <span className="ml-2 font-medium">{report.sections.length}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Report Sections:</h5>
                      <div className="space-y-2">
                        {report.sections.map((section) => (
                          <div key={section.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                section.status === 'complete' ? 'bg-green-500' :
                                section.status === 'incomplete' ? 'bg-yellow-500' : 'bg-gray-500'
                              }`}></div>
                              <span className="text-sm font-medium">{section.title}</span>
                              {section.required && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>}
                            </div>
                            <div className="text-sm text-gray-600">
                              {section.wordCount ? `${section.wordCount} words` : 'Not started'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Generated: {report.generatedAt.toLocaleDateString()}</span>
                        <span>Last Modified: {report.lastModified.toLocaleDateString()}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700">
                          <FileText className="w-4 h-4 inline mr-1" />
                          Edit
                        </button>
                        {report.status === 'draft' && (
                          <button
                            onClick={() => submitReport(report.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                          >
                            <Send className="w-4 h-4 inline mr-1" />
                            Submit
                          </button>
                        )}
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                          <Download className="w-4 h-4 inline mr-1" />
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'deadlines' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Regulatory Deadlines</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Deadline
                </button>
              </div>

              <div className="space-y-4">
                {deadlines.map((deadline) => {
                  const daysUntilDue = Math.ceil((deadline.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isOverdue = daysUntilDue < 0;
                  const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;

                  return (
                    <div key={deadline.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Calendar className={`w-5 h-5 ${
                              isOverdue ? 'text-red-500' :
                              isDueSoon ? 'text-yellow-500' : 'text-blue-500'
                            }`} />
                            <h4 className="text-lg font-semibold text-gray-900">{deadline.title}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(deadline.priority)}`}>
                              {deadline.priority}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(deadline.status)}`}>
                              {deadline.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{deadline.description}</p>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Jurisdiction:</span>
                              <span className="ml-2 font-medium">{deadline.jurisdiction}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Category:</span>
                              <span className="ml-2 font-medium capitalize">{deadline.category}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Due Date:</span>
                              <span className={`ml-2 font-medium ${
                                isOverdue ? 'text-red-600' :
                                isDueSoon ? 'text-yellow-600' : 'text-gray-900'
                              }`}>
                                {deadline.dueDate.toLocaleDateString()}
                                {isOverdue && ` (${Math.abs(daysUntilDue)} days overdue)`}
                                {isDueSoon && ` (${daysUntilDue} days remaining)`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {deadline.assignedTo && (
                        <div className="mb-4">
                          <span className="text-sm text-gray-600">Assigned to:</span>
                          <span className="ml-2 font-medium">{deadline.assignedTo}</span>
                        </div>
                      )}

                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Reminder Schedule:</h5>
                        <div className="flex flex-wrap gap-1">
                          {deadline.reminders.map((reminder, index) => (
                            <span key={index} className={`inline-flex items-center px-2 py-1 text-xs rounded ${
                              reminder.sent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {reminder.days} days {reminder.sent ? '(Sent)' : '(Pending)'}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Dependencies: {deadline.dependencies.length}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700">
                            <Settings className="w-4 h-4 inline mr-1" />
                            Configure
                          </button>
                          {deadline.status !== 'completed' && (
                            <button
                              onClick={() => updateDeadlineStatus(deadline.id, 'completed')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Compliance Analytics</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Compliance Trends</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Reports Generated (30 days)</span>
                      <span className="text-sm font-medium text-blue-600">{reports.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">On-time Submissions</span>
                      <span className="text-sm font-medium text-green-600">94.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Review Time</span>
                      <span className="text-sm font-medium text-purple-600">3.2 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Compliance Score Trend</span>
                      <span className="text-sm font-medium text-green-600">↑ 2.1%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Deadline Performance</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Upcoming Deadlines</span>
                      <span className="text-sm font-medium text-yellow-600">{upcomingDeadlines}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overdue Items</span>
                      <span className="text-sm font-medium text-red-600">{overdueDeadlines}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Reminder Effectiveness</span>
                      <span className="text-sm font-medium text-green-600">87.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Completion Time</span>
                      <span className="text-sm font-medium text-blue-600">5.7 days</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Jurisdiction Overview</h4>
                  <div className="space-y-3">
                    {['EU', 'US-CA', 'CN', 'BR'].map(jurisdiction => {
                      const jurisdictionDeadlines = deadlines.filter(d => d.jurisdiction === jurisdiction);
                      const completed = jurisdictionDeadlines.filter(d => d.status === 'completed').length;
                      const total = jurisdictionDeadlines.length;
                      const complianceRate = total > 0 ? (completed / total) * 100 : 100;

                      return (
                        <div key={jurisdiction} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{jurisdiction}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{complianceRate.toFixed(1)}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  complianceRate >= 90 ? 'bg-green-600' :
                                  complianceRate >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${complianceRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Report Quality Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Word Count</span>
                      <span className="text-sm font-medium">1,827</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completeness Score</span>
                      <span className="text-sm font-medium text-green-600">96.4%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Review Cycle Time</span>
                      <span className="text-sm font-medium text-blue-600">2.8 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approval Rate</span>
                      <span className="text-sm font-medium text-green-600">98.1%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceReporting;