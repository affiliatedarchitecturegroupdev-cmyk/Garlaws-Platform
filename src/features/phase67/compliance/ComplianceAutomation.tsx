'use client';

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, FileText, Globe } from 'lucide-react';

export interface ComplianceRule {
  id: string;
  name: string;
  region: string;
  category: 'privacy' | 'data' | 'security' | 'financial';
  description: string;
  requirements: string[];
  automatedChecks: string[];
  lastChecked?: Date;
  status: 'compliant' | 'non-compliant' | 'pending' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceReport {
  id: string;
  region: string;
  generatedAt: Date;
  overallStatus: 'compliant' | 'non-compliant' | 'warning';
  rules: ComplianceRule[];
  recommendations: string[];
  nextReviewDate: Date;
}

const COMPLIANCE_RULES: ComplianceRule[] = [
  // GDPR (European Union)
  {
    id: 'gdpr-data-protection',
    name: 'Data Protection Principles',
    region: 'EU',
    category: 'privacy',
    description: 'GDPR data protection principles and lawful processing',
    requirements: [
      'Lawful, fair, and transparent processing',
      'Purpose limitation',
      'Data minimization',
      'Accuracy',
      'Storage limitation',
      'Integrity and confidentiality',
      'Accountability'
    ],
    automatedChecks: [
      'Check data processing consents',
      'Verify data retention policies',
      'Audit data minimization practices',
      'Review data subject rights implementation'
    ],
    status: 'compliant',
    severity: 'high'
  },
  {
    id: 'gdpr-data-subject-rights',
    name: 'Data Subject Rights',
    region: 'EU',
    category: 'privacy',
    description: 'Implementation of GDPR data subject rights',
    requirements: [
      'Right to information',
      'Right of access',
      'Right to rectification',
      'Right to erasure',
      'Right to restrict processing',
      'Right to data portability',
      'Right to object'
    ],
    automatedChecks: [
      'Verify access request handling',
      'Check erasure request procedures',
      'Audit rectification processes',
      'Review objection handling'
    ],
    status: 'compliant',
    severity: 'high'
  },

  // CCPA (California, USA)
  {
    id: 'ccpa-privacy-rights',
    name: 'California Privacy Rights',
    region: 'US-CA',
    category: 'privacy',
    description: 'CCPA consumer privacy rights implementation',
    requirements: [
      'Right to know about personal information collection',
      'Right to delete personal information',
      'Right to opt-out of sale of personal information',
      'Right to non-discrimination for exercising rights'
    ],
    automatedChecks: [
      'Check privacy notice accuracy',
      'Verify opt-out mechanisms',
      'Audit deletion request handling',
      'Review data sale disclosures'
    ],
    status: 'compliant',
    severity: 'medium'
  },

  // PIPL (China)
  {
    id: 'pipl-data-localization',
    name: 'Data Localization Requirements',
    region: 'CN',
    category: 'data',
    description: 'PIPL data localization and cross-border transfer rules',
    requirements: [
      'Critical information systems must store data in China',
      'Cross-border data transfers require security assessment',
      'Personal information processors must conduct security assessments'
    ],
    automatedChecks: [
      'Check data storage locations',
      'Verify cross-border transfer approvals',
      'Audit security assessment completion'
    ],
    status: 'warning',
    severity: 'high'
  },

  // LGPD (Brazil)
  {
    id: 'lgpd-data-protection',
    name: 'Brazil Data Protection Law',
    region: 'BR',
    category: 'privacy',
    description: 'LGPD personal data protection requirements',
    requirements: [
      'Lawful processing with consent or legitimate interest',
      'Data subject rights implementation',
      'Data protection officer appointment',
      'Data breach notification within 72 hours'
    ],
    automatedChecks: [
      'Verify consent mechanisms',
      'Check data protection officer role',
      'Audit breach notification procedures',
      'Review data processing records'
    ],
    status: 'compliant',
    severity: 'medium'
  },

  // General Security Requirements
  {
    id: 'security-encryption',
    name: 'Data Encryption Standards',
    region: 'Global',
    category: 'security',
    description: 'Encryption requirements for data at rest and in transit',
    requirements: [
      'AES-256 encryption for data at rest',
      'TLS 1.3 for data in transit',
      'Key management and rotation policies',
      'Encryption of sensitive data fields'
    ],
    automatedChecks: [
      'Check encryption implementation',
      'Verify TLS configuration',
      'Audit key rotation schedules',
      'Review encrypted data fields'
    ],
    status: 'compliant',
    severity: 'critical'
  }
];

export const ComplianceAutomation: React.FC = () => {
  const [rules, setRules] = useState<ComplianceRule[]>(COMPLIANCE_RULES);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const regions = ['all', 'EU', 'US-CA', 'CN', 'BR', 'Global'];

  const filteredRules = selectedRegion === 'all'
    ? rules
    : rules.filter(rule => rule.region === selectedRegion);

  const getStatusIcon = (status: ComplianceRule['status']) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'non-compliant':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'pending':
        return <div className="w-5 h-5 rounded-full bg-gray-300 animate-pulse" />;
    }
  };

  const getStatusColor = (status: ComplianceRule['status']) => {
    switch (status) {
      case 'compliant':
        return 'text-green-700 bg-green-100';
      case 'non-compliant':
        return 'text-red-700 bg-red-100';
      case 'warning':
        return 'text-yellow-700 bg-yellow-100';
      case 'pending':
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: ComplianceRule['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
    }
  };

  const runComplianceCheck = async (ruleId: string) => {
    // Simulate automated compliance check
    setRules(prev => prev.map(rule =>
      rule.id === ruleId
        ? { ...rule, status: 'pending' as const }
        : rule
    ));

    // Simulate API call
    setTimeout(() => {
      setRules(prev => prev.map(rule =>
        rule.id === ruleId
          ? {
              ...rule,
              status: Math.random() > 0.2 ? 'compliant' : 'warning',
              lastChecked: new Date()
            }
          : rule
      ));
    }, 2000);
  };

  const generateComplianceReport = async (region: string) => {
    setIsGeneratingReport(true);

    // Simulate report generation
    setTimeout(() => {
      const regionRules = region === 'all'
        ? rules
        : rules.filter(rule => rule.region === region);

      const overallStatus = regionRules.some(r => r.status === 'non-compliant')
        ? 'non-compliant'
        : regionRules.some(r => r.status === 'warning')
        ? 'warning'
        : 'compliant';

      const report: ComplianceReport = {
        id: `report-${Date.now()}`,
        region,
        generatedAt: new Date(),
        overallStatus,
        rules: regionRules,
        recommendations: [
          'Implement automated consent management',
          'Enhance data subject access procedures',
          'Strengthen cross-border data transfer controls',
          'Regular security assessments and audits'
        ],
        nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      };

      setReports(prev => [report, ...prev]);
      setIsGeneratingReport(false);
    }, 3000);
  };

  const complianceStats = {
    total: rules.length,
    compliant: rules.filter(r => r.status === 'compliant').length,
    warning: rules.filter(r => r.status === 'warning').length,
    nonCompliant: rules.filter(r => r.status === 'non-compliant').length,
    pending: rules.filter(r => r.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Compliance Automation</h1>
              <p className="text-gray-600">Automated compliance monitoring and reporting</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {regions.map(region => (
                <option key={region} value={region}>
                  {region === 'all' ? 'All Regions' : region}
                </option>
              ))}
            </select>
            <button
              onClick={() => generateComplianceReport(selectedRegion)}
              disabled={isGeneratingReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>{isGeneratingReport ? 'Generating...' : 'Generate Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rules</p>
              <p className="text-2xl font-bold text-gray-900">{complianceStats.total}</p>
            </div>
            <Globe className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compliant</p>
              <p className="text-2xl font-bold text-green-600">{complianceStats.compliant}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Warnings</p>
              <p className="text-2xl font-bold text-yellow-600">{complianceStats.warning}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Non-Compliant</p>
              <p className="text-2xl font-bold text-red-600">{complianceStats.nonCompliant}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Compliance Rules Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Compliance Rules</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Checked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                      <div className="text-sm text-gray-500">{rule.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {rule.region}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {rule.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rule.status)}`}>
                      {getStatusIcon(rule.status)}
                      <span className="ml-1 capitalize">{rule.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(rule.severity)}`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.lastChecked ? rule.lastChecked.toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => runComplianceCheck(rule.id)}
                      disabled={rule.status === 'pending'}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                    >
                      {rule.status === 'pending' ? 'Checking...' : 'Run Check'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Reports */}
      {reports.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Compliance Reports</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Compliance Report - {report.region}
                      </p>
                      <p className="text-sm text-gray-500">
                        Generated on {report.generatedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.overallStatus)}`}>
                    {report.overallStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceAutomation;