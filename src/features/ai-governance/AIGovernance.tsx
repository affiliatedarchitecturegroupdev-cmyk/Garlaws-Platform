'use client'

import { useState, useEffect, useMemo } from 'react'
import { Shield, Scale, Eye, AlertTriangle, CheckCircle, XCircle, FileText, Lock, Users, TrendingUp, Activity, Target } from 'lucide-react'

// Types for AI Governance
interface GovernancePolicy {
  id: string
  name: string
  description: string
  category: 'ethics' | 'privacy' | 'fairness' | 'transparency' | 'accountability' | 'security'
  type: 'mandatory' | 'recommended' | 'custom'
  scope: 'global' | 'regional' | 'local'
  status: 'active' | 'draft' | 'deprecated'
  requirements: PolicyRequirement[]
  compliance: ComplianceStatus
  createdAt: Date
  lastUpdated: Date
}

interface PolicyRequirement {
  id: string
  title: string
  description: string
  type: 'technical' | 'procedural' | 'documentation'
  severity: 'critical' | 'high' | 'medium' | 'low'
  evidence: string[]
  automated: boolean
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly'
}

interface ComplianceStatus {
  overall: 'compliant' | 'non_compliant' | 'partial' | 'unknown'
  score: number
  lastAssessed: Date
  nextAssessment: Date
  violations: ComplianceViolation[]
  remediation: RemediationAction[]
}

interface ComplianceViolation {
  id: string
  policyId: string
  requirementId: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  detectedAt: Date
  status: 'open' | 'investigating' | 'remediated' | 'accepted'
  evidence: string[]
  assignedTo?: string
  dueDate?: Date
}

interface RemediationAction {
  id: string
  violationId: string
  title: string
  description: string
  type: 'technical' | 'procedural' | 'training'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assignedTo: string
  dueDate: Date
  progress: number
}

interface BiasAssessment {
  id: string
  modelId: string
  dataset: string
  assessmentDate: Date
  methodology: 'statistical' | 'fairness_metrics' | 'adversarial_testing'
  results: BiasResult[]
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
  status: 'completed' | 'in_progress' | 'failed'
}

interface BiasResult {
  attribute: string
  privileged: string
  unprivileged: string
  metric: string
  value: number
  threshold: number
  violated: boolean
  impact: 'low' | 'medium' | 'high'
}

interface AuditTrail {
  id: string
  timestamp: Date
  action: string
  actor: string
  resource: string
  resourceType: 'model' | 'dataset' | 'policy' | 'decision' | 'deployment'
  details: Record<string, any>
  compliance: boolean
  risk: 'low' | 'medium' | 'high' | 'critical'
  ipAddress: string
  userAgent: string
}

interface EthicsReview {
  id: string
  projectId: string
  projectName: string
  reviewType: 'initial' | 'ongoing' | 'incident' | 'decommission'
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'requires_changes'
  reviewer: string
  submittedAt: Date
  reviewedAt?: Date
  findings: EthicsFinding[]
  recommendations: string[]
  approval: EthicsApproval
}

interface EthicsFinding {
  id: string
  category: 'privacy' | 'fairness' | 'transparency' | 'accountability' | 'safety' | 'societal_impact'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  evidence: string[]
  recommendation: string
  status: 'open' | 'addressed' | 'accepted' | 'mitigated'
}

interface EthicsApproval {
  approved: boolean
  conditions: string[]
  expirationDate?: Date
  approver: string
  approvalDate: Date
  notes?: string
}

interface GovernanceMetrics {
  totalPolicies: number
  compliantPolicies: number
  activeViolations: number
  criticalViolations: number
  avgComplianceScore: number
  biasAssessmentsCompleted: number
  ethicsReviewsCompleted: number
  auditEventsLogged: number
  riskReduction: number
}

export default function AIGovernance() {
  // Sample governance policies
  const [policies] = useState<GovernancePolicy[]>([
    {
      id: 'policy-001',
      name: 'Fairness and Bias Prevention',
      description: 'Ensure AI systems are free from discriminatory bias and unfair treatment',
      category: 'fairness',
      type: 'mandatory',
      scope: 'global',
      status: 'active',
      requirements: [
        {
          id: 'req-001',
          title: 'Bias Assessment',
          description: 'Regular assessment of models for bias using established methodologies',
          type: 'technical',
          severity: 'high',
          evidence: ['bias_report.pdf', 'assessment_log.json'],
          automated: true,
          frequency: 'monthly'
        },
        {
          id: 'req-002',
          title: 'Diverse Training Data',
          description: 'Ensure training datasets represent diverse populations',
          type: 'procedural',
          severity: 'medium',
          evidence: ['dataset_audit.pdf'],
          automated: false,
          frequency: 'quarterly'
        }
      ],
      compliance: {
        overall: 'compliant',
        score: 95,
        lastAssessed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextAssessment: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
        violations: [],
        remediation: []
      },
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'policy-002',
      name: 'Data Privacy and Protection',
      description: 'Protect user data privacy and comply with data protection regulations',
      category: 'privacy',
      type: 'mandatory',
      scope: 'global',
      status: 'active',
      requirements: [
        {
          id: 'req-003',
          title: 'Data Encryption',
          description: 'All sensitive data must be encrypted at rest and in transit',
          type: 'technical',
          severity: 'critical',
          evidence: ['encryption_cert.pdf', 'security_audit.pdf'],
          automated: true,
          frequency: 'continuous'
        },
        {
          id: 'req-004',
          title: 'Consent Management',
          description: 'Obtain and manage user consent for data processing',
          type: 'procedural',
          severity: 'high',
          evidence: ['consent_logs.json'],
          automated: false,
          frequency: 'continuous'
        }
      ],
      compliance: {
        overall: 'partial',
        score: 78,
        lastAssessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        nextAssessment: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
        violations: [
          {
            id: 'violation-001',
            policyId: 'policy-002',
            requirementId: 'req-004',
            severity: 'medium',
            description: 'Consent logs incomplete for 15% of users',
            detectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            status: 'investigating',
            evidence: ['consent_audit.pdf'],
            assignedTo: 'privacy_team',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          }
        ],
        remediation: [
          {
            id: 'remediation-001',
            violationId: 'violation-001',
            title: 'Implement Enhanced Consent Tracking',
            description: 'Develop automated system to track user consents comprehensively',
            type: 'technical',
            priority: 'high',
            status: 'in_progress',
            assignedTo: 'development_team',
            dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            progress: 65
          }
        ]
      },
      createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'policy-003',
      name: 'AI Transparency and Explainability',
      description: 'Ensure AI decisions are transparent and explainable to stakeholders',
      category: 'transparency',
      type: 'mandatory',
      scope: 'global',
      status: 'active',
      requirements: [
        {
          id: 'req-005',
          title: 'Model Explainability',
          description: 'All models must provide explanations for their decisions',
          type: 'technical',
          severity: 'high',
          evidence: ['explainability_report.pdf'],
          automated: true,
          frequency: 'continuous'
        },
        {
          id: 'req-006',
          title: 'Decision Logging',
          description: 'All AI decisions must be logged with reasoning',
          type: 'technical',
          severity: 'medium',
          evidence: ['decision_logs.json'],
          automated: true,
          frequency: 'continuous'
        }
      ],
      compliance: {
        overall: 'compliant',
        score: 92,
        lastAssessed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        nextAssessment: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        violations: [],
        remediation: []
      },
      createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
    }
  ])

  // Sample bias assessments
  const [biasAssessments] = useState<BiasAssessment[]>([
    {
      id: 'assessment-001',
      modelId: 'model-001',
      dataset: 'customer_data_v2',
      assessmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      methodology: 'fairness_metrics',
      results: [
        {
          attribute: 'gender',
          privileged: 'male',
          unprivileged: 'female',
          metric: 'demographic_parity',
          value: 0.08,
          threshold: 0.05,
          violated: true,
          impact: 'medium'
        },
        {
          attribute: 'age',
          privileged: '25-45',
          unprivileged: '18-24',
          metric: 'equal_opportunity',
          value: 0.03,
          threshold: 0.05,
          violated: false,
          impact: 'low'
        }
      ],
      overallRisk: 'medium',
      recommendations: [
        'Implement bias mitigation techniques',
        'Increase representation of underrepresented groups in training data',
        'Add fairness constraints to model training'
      ],
      status: 'completed'
    },
    {
      id: 'assessment-002',
      modelId: 'model-002',
      dataset: 'transaction_data',
      assessmentDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      methodology: 'statistical',
      results: [
        {
          attribute: 'income_level',
          privileged: 'high',
          unprivileged: 'low',
          metric: 'disparate_impact',
          value: 0.15,
          threshold: 0.10,
          violated: true,
          impact: 'high'
        }
      ],
      overallRisk: 'high',
      recommendations: [
        'Rebalance training dataset to reduce income bias',
        'Implement algorithmic fairness techniques',
        'Conduct regular bias audits'
      ],
      status: 'completed'
    }
  ])

  // Sample ethics reviews
  const [ethicsReviews] = useState<EthicsReview[]>([
    {
      id: 'review-001',
      projectId: 'project-001',
      projectName: 'Customer Behavior Analysis',
      reviewType: 'initial',
      status: 'approved',
      reviewer: 'Ethics Committee',
      submittedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      findings: [
        {
          id: 'finding-001',
          category: 'privacy',
          severity: 'medium',
          title: 'Data Retention Concerns',
          description: 'Proposed data retention period may exceed necessary limits',
          evidence: ['data_retention_policy.pdf'],
          recommendation: 'Reduce retention period to 24 months',
          status: 'addressed'
        }
      ],
      recommendations: [
        'Implement data minimization principles',
        'Add user consent verification',
        'Conduct privacy impact assessment annually'
      ],
      approval: {
        approved: true,
        conditions: ['Annual privacy audit required', 'Data retention limited to 24 months'],
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        approver: 'Dr. Ethics Reviewer',
        approvalDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        notes: 'Approved with conditions for enhanced privacy measures'
      }
    }
  ])

  const [selectedPolicy, setSelectedPolicy] = useState<GovernancePolicy | null>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<BiasAssessment | null>(null)

  // Calculate governance metrics
  const governanceMetrics = useMemo(() => {
    const totalPolicies = policies.length
    const compliantPolicies = policies.filter(p => p.compliance.overall === 'compliant').length
    const allViolations = policies.flatMap(p => p.compliance.violations)
    const activeViolations = allViolations.filter(v => v.status === 'open' || v.status === 'investigating').length
    const criticalViolations = allViolations.filter(v => v.severity === 'critical' && (v.status === 'open' || v.status === 'investigating')).length
    const avgComplianceScore = policies.reduce((sum, p) => sum + p.compliance.score, 0) / totalPolicies

    return {
      totalPolicies,
      compliantPolicies,
      activeViolations,
      criticalViolations,
      avgComplianceScore,
      biasAssessmentsCompleted: biasAssessments.filter(a => a.status === 'completed').length,
      ethicsReviewsCompleted: ethicsReviews.filter(r => r.status === 'approved' || r.status === 'rejected').length,
      auditEventsLogged: 0, // Would be calculated from audit trails
      riskReduction: 0.85 // Would be calculated from before/after metrics
    }
  }, [policies, biasAssessments, ethicsReviews])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': case 'approved': case 'active': case 'completed': return 'bg-green-100 text-green-800'
      case 'partial': case 'investigating': case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'non_compliant': case 'rejected': case 'failed': case 'deprecated': return 'bg-red-100 text-red-800'
      case 'draft': case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: GovernancePolicy['category']) => {
    switch (category) {
      case 'ethics': return 'bg-purple-100 text-purple-800'
      case 'privacy': return 'bg-blue-100 text-blue-800'
      case 'fairness': return 'bg-green-100 text-green-800'
      case 'transparency': return 'bg-orange-100 text-orange-800'
      case 'accountability': return 'bg-red-100 text-red-800'
      case 'security': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">AI Governance Framework</h1>
            <p className="text-lg opacity-90">
              Ethics, compliance, bias detection, and comprehensive audit trails for responsible AI
            </p>
          </div>
        </div>
      </div>

      {/* Governance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Policy Compliance</p>
              <p className="text-2xl font-bold text-gray-900">{governanceMetrics.avgComplianceScore.toFixed(1)}%</p>
            </div>
          </div>
          <div className="text-sm text-blue-600 font-medium">Average compliance score</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Active Violations</p>
              <p className="text-2xl font-bold text-gray-900">{governanceMetrics.activeViolations}</p>
            </div>
          </div>
          <div className="text-sm text-red-600 font-medium">{governanceMetrics.criticalViolations} critical</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Bias Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{governanceMetrics.biasAssessmentsCompleted}</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">Completed this quarter</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Ethics Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{governanceMetrics.ethicsReviewsCompleted}</p>
            </div>
          </div>
          <div className="text-sm text-purple-600 font-medium">Approved projects</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Governance Policies */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Governance Policies</h3>

          <div className="space-y-3">
            {policies.map(policy => (
              <div
                key={policy.id}
                onClick={() => setSelectedPolicy(policy)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedPolicy?.id === policy.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">{policy.name}</div>
                      <div className="text-sm text-gray-600">{policy.category}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.compliance.overall)}`}>
                    {policy.compliance.overall}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Score:</span>
                    <span className="font-medium ml-1">{policy.compliance.score}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium ml-1 capitalize">{policy.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Scope:</span>
                    <span className="font-medium ml-1 capitalize">{policy.scope}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Requirements:</span>
                    <span className="font-medium ml-1">{policy.requirements.length}</span>
                  </div>
                </div>

                {policy.compliance.violations.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-red-600 font-medium">
                      {policy.compliance.violations.length} violation{policy.compliance.violations.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Policy Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedPolicy ? 'Policy Details' : 'Policy Information'}
          </h3>

          {selectedPolicy ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedPolicy.category)}`}>
                    {selectedPolicy.category}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <div className="font-medium capitalize text-gray-900">{selectedPolicy.type}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                  <div className="font-medium capitalize text-gray-900">{selectedPolicy.scope}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPolicy.status)}`}>
                    {selectedPolicy.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                <div className="space-y-2">
                  {selectedPolicy.requirements.map(requirement => (
                    <div key={requirement.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{requirement.title}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(requirement.severity)}`}>
                          {requirement.severity}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{requirement.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Type: {requirement.type}</span>
                        <span>Frequency: {requirement.frequency}</span>
                        <span>Automated: {requirement.automated ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Status</label>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Overall:</span>
                    <span className={`font-medium ml-1 ${selectedPolicy.compliance.overall === 'compliant' ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedPolicy.compliance.overall.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Score:</span>
                    <span className="font-medium ml-1">{selectedPolicy.compliance.score}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Assessed:</span>
                    <span className="font-medium ml-1">{selectedPolicy.compliance.lastAssessed.toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Violations:</span>
                    <span className="font-medium ml-1">{selectedPolicy.compliance.violations.length}</span>
                  </div>
                </div>
              </div>

              {selectedPolicy.compliance.violations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Active Violations</label>
                  <div className="space-y-2">
                    {selectedPolicy.compliance.violations.map(violation => (
                      <div key={violation.id} className="p-2 bg-red-50 rounded text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-red-900">{violation.description}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                            {violation.severity}
                          </span>
                        </div>
                        <div className="text-xs text-red-600">
                          Detected: {violation.detectedAt.toLocaleDateString()} •
                          Status: {violation.status} •
                          Assigned: {violation.assignedTo || 'Unassigned'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a policy to view details</p>
            </div>
          )}
        </div>

        {/* Bias Assessments & Ethics */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bias & Ethics Assessments</h3>

          <div className="space-y-4">
            {/* Bias Assessments */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recent Bias Assessments</h4>
              <div className="space-y-2">
                {biasAssessments.map(assessment => (
                  <div
                    key={assessment.id}
                    onClick={() => setSelectedAssessment(assessment)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAssessment?.id === assessment.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{assessment.modelId}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assessment.overallRisk === 'low' ? 'bg-green-100 text-green-800' :
                        assessment.overallRisk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        assessment.overallRisk === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {assessment.overallRisk} risk
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {assessment.dataset} • {assessment.methodology.replace('_', ' ')} •
                      {assessment.assessmentDate.toLocaleDateString()}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {assessment.results.filter(r => r.violated).length} violations detected
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ethics Reviews */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Ethics Reviews</h4>
              <div className="space-y-2">
                {ethicsReviews.map(review => (
                  <div key={review.id} className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-purple-900">{review.projectName}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                        {review.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-purple-700">
                      {review.reviewType} review • Submitted {review.submittedAt.toLocaleDateString()}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-purple-600">
                      <span>{review.findings.length} findings</span>
                      <span>{review.recommendations.length} recommendations</span>
                      <span>Reviewer: {review.reviewer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bias Assessment Details */}
          {selectedAssessment && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Assessment Details</h4>
              <div className="space-y-2">
                {selectedAssessment.results.map(result => (
                  <div key={result.attribute} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{result.attribute}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.violated ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {result.violated ? 'Violated' : 'Passed'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {result.metric}: {result.value.toFixed(3)} (threshold: {result.threshold})
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  {selectedAssessment.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-gray-400">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}