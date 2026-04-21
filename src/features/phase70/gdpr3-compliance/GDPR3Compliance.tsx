'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, UserCheck, FileText, AlertTriangle, CheckCircle, Clock, Eye, Trash2, Download, Settings, Lock, Globe, Users } from 'lucide-react';

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'marketing' | 'analytics' | 'third-party' | 'profiling' | 'data-sharing';
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legitimate-interest' | 'legal-obligation' | 'public-interest' | 'vital-interest';
  grantedAt: Date;
  expiresAt?: Date;
  withdrawnAt?: Date;
  status: 'active' | 'withdrawn' | 'expired';
  version: string;
  ipAddress: string;
  userAgent: string;
  source: string;
}

export interface DataSubjectRequest {
  id: string;
  userId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  submittedAt: Date;
  completedAt?: Date;
  deadline: Date;
  description: string;
  attachments?: string[];
  response?: string;
  reviewer?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ComplianceViolation {
  id: string;
  type: 'consent-violation' | 'retention-violation' | 'processing-violation' | 'security-breach' | 'data-leak';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUsers: number;
  detectedAt: Date;
  resolvedAt?: Date;
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  assignedTo?: string;
  resolution?: string;
  preventiveActions?: string[];
  regulatoryImpact: 'none' | 'minor' | 'major' | 'critical';
}

export interface DataProcessingActivity {
  id: string;
  name: string;
  purpose: string;
  categories: string[];
  legalBasis: string;
  dataSubjects: string[];
  retentionPeriod: number; // in days
  securityMeasures: string[];
  dpoApproval: boolean;
  lastAudit: Date;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'deprecated' | 'suspended';
}

const SAMPLE_CONSENTS: ConsentRecord[] = [
  {
    id: 'consent-001',
    userId: 'user-123',
    consentType: 'marketing',
    purpose: 'Email marketing for product updates',
    legalBasis: 'consent',
    grantedAt: new Date('2024-01-15'),
    expiresAt: new Date('2025-01-15'),
    status: 'active',
    version: '2.1',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    source: 'website'
  },
  {
    id: 'consent-002',
    userId: 'user-456',
    consentType: 'analytics',
    purpose: 'Website usage analytics',
    legalBasis: 'legitimate-interest',
    grantedAt: new Date('2024-02-20'),
    status: 'active',
    version: '1.8',
    ipAddress: '10.0.0.50',
    userAgent: 'Chrome/120.0...',
    source: 'cookie-banner'
  },
  {
    id: 'consent-003',
    userId: 'user-789',
    consentType: 'third-party',
    purpose: 'Data sharing with partners',
    legalBasis: 'consent',
    grantedAt: new Date('2024-03-10'),
    withdrawnAt: new Date('2024-04-15'),
    status: 'withdrawn',
    version: '3.0',
    ipAddress: '172.16.0.25',
    userAgent: 'Safari/17.0...',
    source: 'privacy-settings'
  }
];

const SAMPLE_REQUESTS: DataSubjectRequest[] = [
  {
    id: 'request-001',
    userId: 'user-123',
    requestType: 'access',
    status: 'completed',
    submittedAt: new Date('2024-04-10'),
    completedAt: new Date('2024-04-12'),
    deadline: new Date('2024-05-10'),
    description: 'Request for copy of all personal data',
    response: 'Data export provided via secure download link',
    reviewer: 'privacy-officer',
    priority: 'medium'
  },
  {
    id: 'request-002',
    userId: 'user-456',
    requestType: 'erasure',
    status: 'processing',
    submittedAt: new Date('2024-04-18'),
    deadline: new Date('2024-05-18'),
    description: 'Right to be forgotten - delete all personal data',
    reviewer: 'compliance-team',
    priority: 'high'
  },
  {
    id: 'request-003',
    userId: 'user-789',
    requestType: 'rectification',
    status: 'pending',
    submittedAt: new Date('2024-04-20'),
    deadline: new Date('2024-05-20'),
    description: 'Correct outdated contact information',
    priority: 'low'
  }
];

const SAMPLE_VIOLATIONS: ComplianceViolation[] = [
  {
    id: 'violation-001',
    type: 'retention-violation',
    severity: 'medium',
    description: 'Data retention exceeded configured period for 150 users',
    affectedUsers: 150,
    detectedAt: new Date('2024-04-15'),
    status: 'resolved',
    assignedTo: 'data-team',
    resolution: 'Implemented automated data cleanup process',
    preventiveActions: ['Enhanced retention policy monitoring', 'Automated cleanup scheduling'],
    regulatoryImpact: 'minor'
  },
  {
    id: 'violation-002',
    type: 'consent-violation',
    severity: 'high',
    description: 'Marketing emails sent without valid consent to 25 users',
    affectedUsers: 25,
    detectedAt: new Date('2024-04-18'),
    status: 'investigating',
    assignedTo: 'privacy-team',
    regulatoryImpact: 'major'
  }
];

export const GDPR3Compliance: React.FC = () => {
  const [consents, setConsents] = useState<ConsentRecord[]>(SAMPLE_CONSENTS);
  const [requests, setRequests] = useState<DataSubjectRequest[]>(SAMPLE_REQUESTS);
  const [violations, setViolations] = useState<ComplianceViolation[]>(SAMPLE_VIOLATIONS);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'consents' | 'requests' | 'violations'>('overview');

  // Simulate real-time compliance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new consent records
      if (Math.random() < 0.3) {
        const newConsent: ConsentRecord = {
          id: `consent-${Date.now()}`,
          userId: `user-${Math.floor(Math.random() * 1000)}`,
          consentType: ['marketing', 'analytics', 'third-party'][Math.floor(Math.random() * 3)] as any,
          purpose: 'Generated consent for compliance testing',
          legalBasis: 'consent',
          grantedAt: new Date(),
          status: 'active',
          version: '2.1',
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Chrome/121.0...',
          source: 'website'
        };
        setConsents(prev => [newConsent, ...prev.slice(0, 49)]); // Keep last 50
      }

      // Simulate new data subject requests
      if (Math.random() < 0.1) {
        const newRequest: DataSubjectRequest = {
          id: `request-${Date.now()}`,
          userId: `user-${Math.floor(Math.random() * 1000)}`,
          requestType: ['access', 'rectification', 'erasure'][Math.floor(Math.random() * 3)] as any,
          status: 'pending',
          submittedAt: new Date(),
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          description: 'Automated data subject request',
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any
        };
        setRequests(prev => [newRequest, ...prev.slice(0, 19)]); // Keep last 20
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const processDataSubjectRequest = useCallback(async (requestId: string, action: 'approve' | 'reject', response?: string) => {
    setRequests(prev => prev.map(req =>
      req.id === requestId
        ? {
            ...req,
            status: action === 'approve' ? 'processing' : 'rejected',
            response: response || req.response,
            reviewer: 'compliance-officer'
          }
        : req
    ));

    // Simulate processing delay
    if (action === 'approve') {
      setTimeout(() => {
        setRequests(prev => prev.map(req =>
          req.id === requestId
            ? {
                ...req,
                status: 'completed',
                completedAt: new Date(),
                response: response || 'Request processed successfully'
              }
            : req
        ));
      }, 3000);
    }
  }, []);

  const withdrawConsent = useCallback((consentId: string) => {
    setConsents(prev => prev.map(consent =>
      consent.id === consentId
        ? { ...consent, status: 'withdrawn', withdrawnAt: new Date() }
        : consent
    ));
  }, []);

  const resolveViolation = useCallback((violationId: string, resolution: string) => {
    setViolations(prev => prev.map(violation =>
      violation.id === violationId
        ? {
            ...violation,
            status: 'resolved',
            resolvedAt: new Date(),
            resolution
          }
        : violation
    ));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'resolved':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'processing':
      case 'investigating':
        return 'text-yellow-600 bg-yellow-100';
      case 'withdrawn':
      case 'rejected':
      case 'escalated':
        return 'text-red-600 bg-red-100';
      case 'expired':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

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

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'access':
        return <Eye className="w-4 h-4" />;
      case 'erasure':
        return <Trash2 className="w-4 h-4" />;
      case 'rectification':
        return <Settings className="w-4 h-4" />;
      case 'portability':
        return <Download className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const activeConsents = consents.filter(c => c.status === 'active').length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const openViolations = violations.filter(v => v.status === 'open' || v.status === 'investigating').length;
  const complianceScore = Math.max(0, 100 - (openViolations * 5) - (pendingRequests * 2));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GDPR 3.0 Compliance</h1>
              <p className="text-gray-600">Advanced data subject rights and consent management automation</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{complianceScore}%</div>
              <div className="text-sm text-gray-600">Compliance Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Consents</p>
              <p className="text-2xl font-bold text-gray-900">{activeConsents}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Violations</p>
              <p className="text-2xl font-bold text-gray-900">{openViolations}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Subjects</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab('consents')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'consents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Consent Management
            </button>
            <button
              onClick={() => setSelectedTab('requests')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Data Subject Requests
            </button>
            <button
              onClick={() => setSelectedTab('violations')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'violations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Compliance Violations
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Health</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overall Compliance</span>
                      <span className="text-sm font-medium text-green-600">98.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Data Processing Activities</span>
                      <span className="text-sm font-medium text-blue-600">47 active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last DPIA Review</span>
                      <span className="text-sm font-medium text-gray-900">2024-03-15</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Next Audit Due</span>
                      <span className="text-sm font-medium text-orange-600">2024-06-30</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Consent audit completed</p>
                        <p className="text-xs text-gray-600">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Data retention policy review due</p>
                        <p className="text-xs text-gray-600">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">New data subject request received</p>
                        <p className="text-xs text-gray-600">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">GDPR 3.0 Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <Lock className="w-8 h-8 text-blue-600 mb-2" />
                    <h4 className="font-medium text-gray-900 mb-1">Enhanced Consent Management</h4>
                    <p className="text-sm text-gray-600">Granular consent with versioning and withdrawal tracking</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <Eye className="w-8 h-8 text-green-600 mb-2" />
                    <h4 className="font-medium text-gray-900 mb-1">Data Subject Rights</h4>
                    <p className="text-sm text-gray-600">Automated processing of access, rectification, and erasure requests</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <Globe className="w-8 h-8 text-purple-600 mb-2" />
                    <h4 className="font-medium text-gray-900 mb-1">Cross-Border Compliance</h4>
                    <p className="text-sm text-gray-600">International data transfer safeguards and adequacy decisions</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'consents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Consent Management</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Create Consent Template
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Granted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consents.map((consent) => (
                      <tr key={consent.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {consent.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                            {consent.consentType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                          {consent.purpose}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(consent.status)}`}>
                            {consent.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {consent.grantedAt.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {consent.status === 'active' && (
                            <button
                              onClick={() => withdrawConsent(consent.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Withdraw
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Data Subject Requests</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Process All Pending
                </button>
              </div>

              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getRequestTypeIcon(request.requestType)}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 capitalize">
                            {request.requestType} Request
                          </h4>
                          <p className="text-sm text-gray-600">User: {request.userId}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-4">{request.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">Submitted:</span>
                        <span className="ml-2 font-medium">{request.submittedAt.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Deadline:</span>
                        <span className="ml-2 font-medium">{request.deadline.toLocaleString()}</span>
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => processDataSubjectRequest(request.id, 'approve')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => processDataSubjectRequest(request.id, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {request.response && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <strong>Response:</strong> {request.response}
                        </p>
                        {request.completedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Completed on {request.completedAt.toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'violations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Compliance Violations</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Report Violation
                </button>
              </div>

              <div className="space-y-4">
                {violations.map((violation) => (
                  <div key={violation.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          violation.severity === 'critical' ? 'text-red-500' :
                          violation.severity === 'high' ? 'text-orange-500' :
                          violation.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                        }`} />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{violation.description}</h4>
                          <p className="text-sm text-gray-600">
                            Type: {violation.type} • Affected: {violation.affectedUsers} users
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(violation.severity)}`}>
                          {violation.severity}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(violation.status)}`}>
                          {violation.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">Detected:</span>
                        <span className="ml-2 font-medium">{violation.detectedAt.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Regulatory Impact:</span>
                        <span className="ml-2 font-medium capitalize">{violation.regulatoryImpact}</span>
                      </div>
                    </div>

                    {violation.assignedTo && (
                      <div className="mb-4">
                        <span className="text-sm text-gray-600">Assigned to:</span>
                        <span className="ml-2 font-medium">{violation.assignedTo}</span>
                      </div>
                    )}

                    {violation.status === 'open' || violation.status === 'investigating' ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Enter resolution..."
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                        />
                        <button
                          onClick={() => resolveViolation(violation.id, 'Violation resolved with corrective actions')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                        >
                          Resolve
                        </button>
                      </div>
                    ) : (
                      violation.resolution && (
                        <div className="p-3 bg-green-50 rounded-md">
                          <p className="text-sm text-green-800">
                            <strong>Resolution:</strong> {violation.resolution}
                          </p>
                          {violation.resolvedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Resolved on {violation.resolvedAt.toLocaleString()}
                            </p>
                          )}
                        </div>
                      )
                    )}

                    {violation.preventiveActions && violation.preventiveActions.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Preventive Actions:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {violation.preventiveActions.map((action, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span>•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GDPR3Compliance;