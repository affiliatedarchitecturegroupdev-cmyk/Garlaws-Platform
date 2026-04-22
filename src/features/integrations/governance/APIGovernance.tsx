'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// API Governance Types
export type GovernanceStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'published'
  | 'deprecated'
  | 'retired';

export type PolicyType =
  | 'rate-limit'
  | 'auth'
  | 'validation'
  | 'transformation'
  | 'logging'
  | 'security'
  | 'compliance';

export type EnforcementLevel =
  | 'warn'
  | 'block'
  | 'audit';

export interface APIPolicy {
  id: string;
  name: string;
  description: string;
  type: PolicyType;
  enforcementLevel: EnforcementLevel;
  config: PolicyConfig;
  scope: {
    apis: string[]; // API IDs
    endpoints: string[]; // Endpoint patterns
    users: string[]; // User IDs or roles
    ipRanges: string[];
  };
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyConfig {
  // Rate limiting
  requestsPerMinute?: number;
  requestsPerHour?: number;
  burstLimit?: number;

  // Authentication
  requiredAuth?: boolean;
  allowedMethods?: string[];

  // Validation
  schema?: any;
  customValidation?: string;

  // Security
  corsEnabled?: boolean;
  allowedOrigins?: string[];
  requiredHeaders?: string[];

  // Compliance
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
  retentionPeriod?: number;
  auditRequired?: boolean;
}

export interface PolicyCondition {
  id: string;
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'regex';
  value: any;
  negate?: boolean;
}

export interface PolicyAction {
  id: string;
  type: 'allow' | 'deny' | 'transform' | 'log' | 'notify' | 'rate-limit';
  config: {
    message?: string;
    transformation?: any;
    notificationTarget?: string;
    rateLimitResponse?: any;
  };
}

export interface APILifecycle {
  id: string;
  apiId: string;
  version: string;
  status: GovernanceStatus;
  changelog: LifecycleChange[];
  reviewers: string[];
  approvals: LifecycleApproval[];
  deprecationNotice?: {
    message: string;
    deprecatedAt: string;
    sunsetAt: string;
  };
  retirementNotice?: {
    message: string;
    retiredAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LifecycleChange {
  id: string;
  type: 'breaking' | 'feature' | 'bugfix' | 'security' | 'documentation';
  description: string;
  impact: 'low' | 'medium' | 'high';
  backwardsCompatible: boolean;
  timestamp: string;
}

export interface LifecycleApproval {
  id: string;
  reviewerId: string;
  reviewerName: string;
  decision: 'approved' | 'rejected' | 'changes-requested';
  comments?: string;
  timestamp: string;
}

export interface APIDocumentation {
  id: string;
  apiId: string;
  version: string;
  content: {
    overview: string;
    gettingStarted: string;
    authentication: string;
    endpoints: EndpointDocumentation[];
    examples: CodeExample[];
    changelog: string;
    support: SupportInfo;
  };
  status: 'draft' | 'published' | 'outdated';
  lastUpdated: string;
  reviewers: string[];
}

export interface EndpointDocumentation {
  path: string;
  method: string;
  summary: string;
  description: string;
  parameters: ParameterDoc[];
  requestBody?: RequestBodyDoc;
  responses: ResponseDoc[];
  examples: CodeExample[];
}

export interface ParameterDoc {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: any;
}

export interface RequestBodyDoc {
  description: string;
  contentType: string;
  schema: any;
  examples: CodeExample[];
}

export interface ResponseDoc {
  statusCode: number;
  description: string;
  contentType?: string;
  schema?: any;
  examples?: CodeExample[];
}

export interface CodeExample {
  title: string;
  language: 'curl' | 'javascript' | 'python' | 'java' | 'csharp' | 'go';
  code: string;
}

export interface SupportInfo {
  documentationUrl: string;
  supportEmail: string;
  communityUrl?: string;
  slackChannel?: string;
}

export interface GovernanceMetrics {
  totalAPIs: number;
  activePolicies: number;
  complianceScore: number;
  averageResponseTime: number;
  errorRate: number;
  policyViolations: number;
  uptimePercentage: number;
}

// API Governance Hook
export function useAPIGovernance() {
  const [policies, setPolicies] = useState<APIPolicy[]>([]);
  const [lifecycles, setLifecycles] = useState<APILifecycle[]>([]);
  const [documentation, setDocumentation] = useState<APIDocumentation[]>([]);
  const [metrics, setMetrics] = useState<GovernanceMetrics>({
    totalAPIs: 0,
    activePolicies: 0,
    complianceScore: 0,
    averageResponseTime: 0,
    errorRate: 0,
    policyViolations: 0,
    uptimePercentage: 0
  });
  const [loading, setLoading] = useState(false);

  // Mock data
  const mockPolicies: APIPolicy[] = [
    {
      id: 'rate-limit-policy',
      name: 'API Rate Limiting',
      description: 'Enforce rate limits on API endpoints to prevent abuse',
      type: 'rate-limit',
      enforcementLevel: 'block',
      config: {
        requestsPerMinute: 1000,
        requestsPerHour: 10000,
        burstLimit: 100
      },
      scope: {
        apis: ['*'],
        endpoints: ['*'],
        users: [],
        ipRanges: []
      },
      conditions: [
        {
          id: 'user-type',
          field: 'user.role',
          operator: 'ne',
          value: 'admin'
        }
      ],
      actions: [
        {
          id: 'rate-limit-action',
          type: 'rate-limit',
          config: {
            message: 'Rate limit exceeded. Please try again later.'
          }
        }
      ],
      status: 'active',
      priority: 10,
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    },
    {
      id: 'auth-policy',
      name: 'Authentication Required',
      description: 'Require authentication for all API endpoints',
      type: 'auth',
      enforcementLevel: 'block',
      config: {
        requiredAuth: true,
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE']
      },
      scope: {
        apis: ['*'],
        endpoints: ['*'],
        users: [],
        ipRanges: []
      },
      conditions: [],
      actions: [
        {
          id: 'auth-action',
          type: 'deny',
          config: {
            message: 'Authentication required'
          }
        }
      ],
      status: 'active',
      priority: 100,
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    }
  ];

  const loadPolicies = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setPolicies(mockPolicies);
    } catch (error) {
      console.error('Failed to load policies:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMetrics = useCallback(async () => {
    try {
      // Mock metrics
      setMetrics({
        totalAPIs: 25,
        activePolicies: mockPolicies.filter(p => p.status === 'active').length,
        complianceScore: 98.5,
        averageResponseTime: 45,
        errorRate: 0.02,
        policyViolations: 12,
        uptimePercentage: 99.98
      });
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }, []);

  const createPolicy = useCallback(async (policy: Omit<APIPolicy, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPolicy: APIPolicy = {
      ...policy,
      id: `policy_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPolicies(prev => [...prev, newPolicy]);
    return newPolicy.id;
  }, []);

  const updatePolicy = useCallback(async (policyId: string, updates: Partial<APIPolicy>) => {
    setPolicies(prev =>
      prev.map(policy =>
        policy.id === policyId
          ? { ...policy, ...updates, updatedAt: new Date().toISOString() }
          : policy
      )
    );
  }, []);

  const deletePolicy = useCallback(async (policyId: string) => {
    setPolicies(prev => prev.filter(policy => policy.id !== policyId));
  }, []);

  const enforcePolicy = useCallback(async (request: any, policy: APIPolicy): Promise<{ allowed: boolean; actions: PolicyAction[]; message?: string }> => {
    // Check conditions
    const conditionsMet = policy.conditions.every(condition => {
      // Simple condition evaluation (in real implementation, use proper expression evaluator)
      return true; // Mock: all conditions pass
    });

    if (!conditionsMet) {
      return { allowed: true, actions: [] };
    }

    // Apply actions based on enforcement level
    const applicableActions = policy.actions.filter(action => {
      // Check if action should be applied
      return true; // Mock: all actions apply
    });

    const allowed = policy.enforcementLevel !== 'block' || applicableActions.length === 0;

    return {
      allowed,
      actions: applicableActions,
      message: applicableActions.find(a => a.config.message)?.config.message
    };
  }, []);

  const validateAPICompliance = useCallback(async (apiId: string): Promise<{
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  }> => {
    // Mock compliance validation
    const violations: string[] = [];
    const recommendations = [
      'Add rate limiting policy',
      'Implement proper authentication',
      'Add input validation schemas'
    ];

    return {
      compliant: violations.length === 0,
      violations,
      recommendations
    };
  }, []);

  const generateDocumentation = useCallback(async (apiId: string): Promise<APIDocumentation> => {
    // Mock documentation generation
    return {
      id: `doc_${apiId}`,
      apiId,
      version: '1.0.0',
      content: {
        overview: 'API Overview',
        gettingStarted: 'Getting Started Guide',
        authentication: 'Authentication Guide',
        endpoints: [],
        examples: [],
        changelog: 'Changelog',
        support: {
          documentationUrl: `https://docs.garlaws.com/apis/${apiId}`,
          supportEmail: 'api-support@garlaws.com'
        }
      },
      status: 'published',
      lastUpdated: new Date().toISOString(),
      reviewers: []
    };
  }, []);

  useEffect(() => {
    loadPolicies();
    loadMetrics();
  }, [loadPolicies, loadMetrics]);

  return {
    policies,
    lifecycles,
    documentation,
    metrics,
    loading,
    createPolicy,
    updatePolicy,
    deletePolicy,
    enforcePolicy,
    validateAPICompliance,
    generateDocumentation,
  };
}

// API Governance Dashboard Component
interface APIGovernanceDashboardProps {
  className?: string;
}

export const APIGovernanceDashboard: React.FC<APIGovernanceDashboardProps> = ({
  className
}) => {
  const {
    policies,
    metrics,
    loading,
    createPolicy,
    updatePolicy,
    deletePolicy,
    validateAPICompliance,
    generateDocumentation
  } = useAPIGovernance();

  const [activeTab, setActiveTab] = useState<'policies' | 'compliance' | 'lifecycle' | 'documentation'>('policies');
  const [selectedPolicy, setSelectedPolicy] = useState<APIPolicy | null>(null);

  const getPolicyTypeIcon = (type: PolicyType) => {
    const icons: Record<PolicyType, string> = {
      'rate-limit': '⏱️',
      'auth': '🔐',
      'validation': '✅',
      'transformation': '🔄',
      'logging': '📝',
      'security': '🛡️',
      'compliance': '⚖️'
    };
    return icons[type] || '📋';
  };

  const getEnforcementLevelColor = (level: EnforcementLevel) => {
    const colors = {
      warn: 'bg-yellow-100 text-yellow-800',
      block: 'bg-red-100 text-red-800',
      audit: 'bg-blue-100 text-blue-800'
    };
    return colors[level];
  };

  const createRateLimitPolicy = () => {
    createPolicy({
      name: 'New Rate Limit Policy',
      description: 'Rate limiting policy for API protection',
      type: 'rate-limit',
      enforcementLevel: 'block',
      config: {
        requestsPerMinute: 100,
        requestsPerHour: 1000
      },
      scope: {
        apis: [],
        endpoints: [],
        users: [],
        ipRanges: []
      },
      conditions: [],
      actions: [{
        id: 'rate-limit',
        type: 'rate-limit',
        config: {
          message: 'Rate limit exceeded'
        }
      }],
      status: 'draft',
      priority: 50
    });
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold">Loading API Governance</h3>
          <p className="text-sm text-muted-foreground mt-2">Setting up governance policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API Governance</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Lifecycle management and automated policy enforcement
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {policies.length} policies active
          </div>
          <button
            onClick={createRateLimitPolicy}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Create Policy
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{metrics.totalAPIs}</div>
          <div className="text-sm text-gray-600">Total APIs</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{metrics.complianceScore.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Compliance Score</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">{metrics.policyViolations}</div>
          <div className="text-sm text-gray-600">Policy Violations</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{metrics.uptimePercentage.toFixed(2)}%</div>
          <div className="text-sm text-gray-600">Uptime</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {[
            { id: 'policies', name: 'Policies', icon: '📋' },
            { id: 'compliance', name: 'Compliance', icon: '✅' },
            { id: 'lifecycle', name: 'Lifecycle', icon: '🔄' },
            { id: 'documentation', name: 'Documentation', icon: '📚' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'policies' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">API Policies</h3>
              <div className="flex space-x-2">
                <select className="px-3 py-2 border border-border rounded text-sm">
                  <option>All Types</option>
                  <option>Rate Limit</option>
                  <option>Auth</option>
                  <option>Security</option>
                </select>
                <select className="px-3 py-2 border border-border rounded text-sm">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Draft</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {policies.map(policy => (
                <div
                  key={policy.id}
                  className={cn(
                    'bg-white p-6 rounded-lg border cursor-pointer hover:shadow-md transition-all',
                    selectedPolicy?.id === policy.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  )}
                  onClick={() => setSelectedPolicy(policy)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{getPolicyTypeIcon(policy.type)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', getEnforcementLevelColor(policy.enforcementLevel))}>
                        {policy.enforcementLevel}
                      </span>
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        policy.status === 'active' ? 'bg-green-100 text-green-800' :
                        policy.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      )}>
                        {policy.status}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-lg mb-2">{policy.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{policy.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="capitalize">{policy.type.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Priority:</span>
                      <span>{policy.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>APIs:</span>
                      <span>{policy.scope.apis.includes('*') ? 'All' : policy.scope.apis.length}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-muted-foreground">
                      Updated {new Date(policy.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updatePolicy(policy.id, {
                            status: policy.status === 'active' ? 'inactive' : 'active'
                          });
                        }}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        {policy.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePolicy(policy.id);
                        }}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Policy Details Panel */}
            {selectedPolicy && (
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Policy Details: {selectedPolicy.name}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Configuration</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(selectedPolicy.config).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Scope</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>APIs:</span>
                        <span>{selectedPolicy.scope.apis.includes('*') ? 'All' : selectedPolicy.scope.apis.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Endpoints:</span>
                        <span>{selectedPolicy.scope.endpoints.includes('*') ? 'All' : selectedPolicy.scope.endpoints.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Users:</span>
                        <span>{selectedPolicy.scope.users.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Actions ({selectedPolicy.actions.length})</h4>
                  <div className="space-y-2">
                    {selectedPolicy.actions.map(action => (
                      <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium capitalize">{action.type}</span>
                          {action.config.message && (
                            <span className="text-sm text-muted-foreground ml-2">
                              - {action.config.message}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">API Compliance Dashboard</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {metrics.complianceScore.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Compliance</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {metrics.averageResponseTime}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {(metrics.errorRate * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Error Rate</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Compliance Check</h4>
                <div className="flex space-x-4">
                  <button
                    onClick={() => validateAPICompliance('sample-api')}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  >
                    Run Compliance Check
                  </button>
                  <button
                    onClick={() => generateDocumentation('sample-api')}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
                  >
                    Generate Documentation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lifecycle' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔄</div>
            <h3 className="text-lg font-semibold">API Lifecycle Management</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Version control, deprecation notices, and retirement planning
            </p>
          </div>
        )}

        {activeTab === 'documentation' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold">API Documentation</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Automated documentation generation and management
            </p>
          </div>
        )}
      </div>
    </div>
  );
};