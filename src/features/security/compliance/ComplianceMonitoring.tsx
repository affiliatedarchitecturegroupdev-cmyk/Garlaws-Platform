'use client';

import { useState, useEffect, useCallback } from 'react';

interface ComplianceFramework {
  id: string;
  name: string;
  acronym: string;
  description: string;
  country: string;
  category: 'data_protection' | 'financial' | 'healthcare' | 'industry_specific' | 'general';
  requirements: ComplianceRequirement[];
  lastAssessment: string;
  complianceScore: number;
  status: 'compliant' | 'non_compliant' | 'partial' | 'under_review';
  nextReviewDate: string;
}

interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'organizational' | 'legal';
  priority: 'high' | 'medium' | 'low';
  status: 'compliant' | 'non_compliant' | 'not_applicable' | 'under_review';
  evidence?: string[];
  lastVerified: string;
  assignedTo?: string;
  dueDate?: string;
}

interface ComplianceAssessment {
  id: string;
  frameworkId: string;
  frameworkName: string;
  assessmentDate: string;
  assessor: string;
  overallScore: number;
  findings: ComplianceFinding[];
  recommendations: string[];
  nextAssessmentDate: string;
  status: 'draft' | 'completed' | 'approved';
}

interface ComplianceFinding {
  id: string;
  requirementId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  assignedTo?: string;
  dueDate?: string;
}

interface ComplianceMonitoringProps {
  tenantId?: string;
}

export default function ComplianceMonitoring({ tenantId = 'default' }: ComplianceMonitoringProps) {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<ComplianceAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchComplianceData();
  }, [tenantId]);

  useEffect(() => {
    applyFilters();
  }, [frameworks, filterCategory, filterStatus]);

  const fetchComplianceData = useCallback(async () => {
    try {
      const response = await fetch(`/api/security?action=compliance_frameworks&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setFrameworks(data.data.frameworks);
        setAssessments(data.data.assessments);
      }
    } catch (error) {
      console.error('Failed to fetch compliance data:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const applyFilters = useCallback(() => {
    // Filters are applied in the UI rendering
  }, [filterCategory, filterStatus]);

  const updateRequirementStatus = async (frameworkId: string, requirementId: string, status: ComplianceRequirement['status']) => {
    try {
      const response = await fetch('/api/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_requirement_status',
          tenantId,
          frameworkId,
          requirementId,
          status
        })
      });

      const data = await response.json();
      if (data.success) {
        setFrameworks(frameworks.map(f =>
          f.id === frameworkId ? data.data : f
        ));
      }
    } catch (error) {
      console.error('Failed to update requirement status:', error);
    }
  };

  const runComplianceAssessment = async (frameworkId: string) => {
    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run_compliance_assessment',
          tenantId,
          frameworkId
        })
      });

      const data = await response.json();
      if (data.success) {
        setAssessments([...assessments, data.data]);
        // Refresh frameworks to get updated scores
        fetchComplianceData();
      }
    } catch (error) {
      console.error('Failed to run compliance assessment:', error);
    }
  };

  const generateComplianceReport = async (frameworkId: string, format: 'pdf' | 'excel') => {
    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_compliance_report',
          tenantId,
          frameworkId,
          format
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-report-${frameworkId}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'resolved':
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'non_compliant':
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'partial':
      case 'in_progress':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
      case 'accepted_risk':
        return 'bg-blue-100 text-blue-800';
      case 'not_applicable':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'data_protection':
        return 'bg-blue-100 text-blue-800';
      case 'financial':
        return 'bg-green-100 text-green-800';
      case 'healthcare':
        return 'bg-red-100 text-red-800';
      case 'industry_specific':
        return 'bg-purple-100 text-purple-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateOverallCompliance = () => {
    if (frameworks.length === 0) return 0;
    const totalScore = frameworks.reduce((sum, f) => sum + f.complianceScore, 0);
    return Math.round(totalScore / frameworks.length);
  };

  const filteredFrameworks = frameworks.filter(framework => {
    const matchesCategory = filterCategory === 'all' || framework.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || framework.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Compliance Monitoring & Assessment</h2>
        <div className="flex space-x-3">
          <button
            onClick={fetchComplianceData}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Compliance</p>
              <p className="text-2xl font-bold text-blue-600">{calculateOverallCompliance()}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Frameworks Monitored</p>
              <p className="text-2xl font-bold text-green-600">{frameworks.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assessments Completed</p>
              <p className="text-2xl font-bold text-purple-600">{assessments.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Findings</p>
              <p className="text-2xl font-bold text-red-600">
                {assessments.reduce((sum, a) => sum + a.findings.filter(f => f.severity === 'critical').length, 0)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="data_protection">Data Protection</option>
            <option value="financial">Financial</option>
            <option value="healthcare">Healthcare</option>
            <option value="industry_specific">Industry Specific</option>
            <option value="general">General</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="compliant">Compliant</option>
            <option value="non_compliant">Non-Compliant</option>
            <option value="partial">Partial</option>
            <option value="under_review">Under Review</option>
          </select>

          <button
            onClick={() => {
              setFilterCategory('all');
              setFilterStatus('all');
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Compliance Frameworks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFrameworks.map((framework) => (
          <div
            key={framework.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md cursor-pointer transition-all"
            onClick={() => setSelectedFramework(framework)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{framework.name}</h3>
                <p className="text-sm text-gray-600">{framework.acronym}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(framework.status)}`}>
                {framework.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Compliance Score:</span>
                <span className={`font-medium ${framework.complianceScore >= 80 ? 'text-green-600' : framework.complianceScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {framework.complianceScore}%
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Requirements:</span>
                <span className="font-medium">{framework.requirements.length}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Category:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(framework.category)}`}>
                  {framework.category.replace('_', ' ')}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Assessment:</span>
                <span className="font-medium">
                  {new Date(framework.lastAssessment).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next Review:</span>
                <span className="font-medium">
                  {new Date(framework.nextReviewDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  runComplianceAssessment(framework.id);
                }}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Run Assessment
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  generateComplianceReport(framework.id, 'pdf');
                }}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Framework Detail Modal */}
      {selectedFramework && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-5/6 shadow-lg rounded-md bg-white max-h-screen overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold">{selectedFramework.name} ({selectedFramework.acronym})</h3>
                <p className="text-sm text-gray-600">{selectedFramework.description}</p>
              </div>
              <button
                onClick={() => setSelectedFramework(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{selectedFramework.complianceScore}%</div>
                <div className="text-sm text-gray-600">Compliance Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {selectedFramework.requirements.filter(r => r.status === 'compliant').length}
                </div>
                <div className="text-sm text-gray-600">Compliant Requirements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {selectedFramework.requirements.filter(r => r.status === 'non_compliant').length}
                </div>
                <div className="text-sm text-gray-600">Non-Compliant</div>
              </div>
            </div>

            {/* Requirements Table */}
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requirement</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Verified</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedFramework.requirements.map((requirement) => (
                    <tr key={requirement.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{requirement.title}</div>
                          <div className="text-xs text-gray-600 mt-1">{requirement.description}</div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                        {requirement.category}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(requirement.priority)}`}>
                          {requirement.priority}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={requirement.status}
                          onChange={(e) => updateRequirementStatus(selectedFramework.id, requirement.id, e.target.value as ComplianceRequirement['status'])}
                          className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(requirement.status)}`}
                        >
                          <option value="compliant">Compliant</option>
                          <option value="non_compliant">Non-Compliant</option>
                          <option value="not_applicable">Not Applicable</option>
                          <option value="under_review">Under Review</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {new Date(requirement.lastVerified).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          View Evidence
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => generateComplianceReport(selectedFramework.id, 'pdf')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Generate PDF Report
              </button>
              <button
                onClick={() => setSelectedFramework(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assessment History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Assessments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Framework</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Findings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assessments.slice(0, 10).map((assessment) => (
                <tr key={assessment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {assessment.frameworkName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(assessment.assessmentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`font-medium ${assessment.overallScore >= 80 ? 'text-green-600' : assessment.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {assessment.overallScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assessment.findings.length} findings
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assessment.status)}`}>
                      {assessment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedAssessment(assessment)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assessment Detail Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                Assessment: {selectedAssessment.frameworkName}
              </h3>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">Assessment Summary</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                      <div className={`text-2xl font-bold ${selectedAssessment.overallScore >= 80 ? 'text-green-600' : selectedAssessment.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {selectedAssessment.overallScore}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAssessment.status)}`}>
                        {selectedAssessment.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Assessor</div>
                    <div className="text-sm text-gray-900">{selectedAssessment.assessor}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Assessment Date</div>
                    <div className="text-sm text-gray-900">{new Date(selectedAssessment.assessmentDate).toLocaleString()}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Next Assessment</div>
                    <div className="text-sm text-gray-900">{new Date(selectedAssessment.nextAssessmentDate).toLocaleDateString()}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Total Findings</div>
                    <div className="text-sm text-gray-900">{selectedAssessment.findings.length}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">Findings by Severity</h4>
                <div className="space-y-3">
                  {['critical', 'high', 'medium', 'low'].map(severity => {
                    const count = selectedAssessment.findings.filter(f => f.severity === severity).length;
                    return (
                      <div key={severity} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{severity}:</span>
                        <span className={`font-medium ${getSeverityColor(severity)}`}>{count}</span>
                      </div>
                    );
                  })}
                </div>

                <h4 className="text-lg font-semibold mb-3 mt-6">Recommendations</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedAssessment.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Findings */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Detailed Findings</h4>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {selectedAssessment.findings.map((finding) => (
                  <div key={finding.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h5 className="text-sm font-medium text-gray-900">{finding.description}</h5>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(finding.severity)}`}>
                            {finding.severity}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(finding.status)}`}>
                            {finding.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2"><strong>Impact:</strong> {finding.impact}</p>
                        <p className="text-sm text-gray-600"><strong>Remediation:</strong> {finding.remediation}</p>
                      </div>
                    </div>

                    {finding.assignedTo && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Assigned to: {finding.assignedTo}</span>
                          {finding.dueDate && <span>Due: {new Date(finding.dueDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAssessment(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}