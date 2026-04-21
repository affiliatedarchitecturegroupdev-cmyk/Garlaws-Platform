'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Webhook, Code, Send, CheckCircle, AlertTriangle, Clock, RefreshCw, Settings, Play, Square } from 'lucide-react';

export interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  protocol: 'rest' | 'graphql' | 'webhook';
  headers: Record<string, string>;
  authentication: {
    type: 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth';
    credentials?: Record<string, string>;
  };
  timeout: number;
  retryConfig: {
    maxRetries: number;
    backoffStrategy: 'fixed' | 'exponential' | 'linear';
    baseDelay: number;
  };
  rateLimit: {
    requests: number;
    period: number; // in seconds
  };
  lastExecuted?: Date;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
}

export interface APIWorkflow {
  id: string;
  name: string;
  description: string;
  steps: APIWorkflowStep[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
  variables: Record<string, any>;
}

export interface APIWorkflowStep {
  id: string;
  name: string;
  type: 'api-call' | 'transform' | 'condition' | 'delay' | 'webhook-trigger';
  config: Record<string, any>;
  dependsOn?: string[]; // IDs of steps this depends on
  timeout?: number;
  retryOnFailure: boolean;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
  executionTime?: number;
}

export interface WebhookSubscription {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  status: 'active' | 'inactive' | 'failed';
  lastTriggered?: Date;
  successCount: number;
  failureCount: number;
  headers: Record<string, string>;
}

export interface APIExecution {
  id: string;
  workflowId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed';
  steps: APIExecutionStep[];
  variables: Record<string, any>;
  result?: any;
  error?: string;
}

export interface APIExecutionStep {
  stepId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'skipped';
  request?: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
  };
  response?: {
    status: number;
    headers: Record<string, string>;
    body: any;
    duration: number;
  };
  error?: string;
}

const SAMPLE_ENDPOINTS: APIEndpoint[] = [
  {
    id: 'user-api',
    name: 'User Management API',
    url: 'https://api.garlaws.com/users',
    method: 'GET',
    protocol: 'rest',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    authentication: {
      type: 'bearer',
      credentials: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
    },
    timeout: 10000,
    retryConfig: {
      maxRetries: 3,
      backoffStrategy: 'exponential',
      baseDelay: 1000
    },
    rateLimit: {
      requests: 100,
      period: 60
    },
    successCount: 1250,
    errorCount: 12,
    averageResponseTime: 245
  },
  {
    id: 'graphql-api',
    name: 'GraphQL Data Service',
    url: 'https://api.garlaws.com/graphql',
    method: 'POST',
    protocol: 'graphql',
    headers: {
      'Content-Type': 'application/json'
    },
    authentication: {
      type: 'bearer',
      credentials: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
    },
    timeout: 15000,
    retryConfig: {
      maxRetries: 2,
      backoffStrategy: 'linear',
      baseDelay: 2000
    },
    rateLimit: {
      requests: 50,
      period: 60
    },
    successCount: 890,
    errorCount: 8,
    averageResponseTime: 320
  },
  {
    id: 'webhook-endpoint',
    name: 'Payment Webhook',
    url: 'https://api.garlaws.com/webhooks/payments',
    method: 'POST',
    protocol: 'webhook',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': 'whsec_webhook_secret_here'
    },
    authentication: {
      type: 'none'
    },
    timeout: 5000,
    retryConfig: {
      maxRetries: 0,
      backoffStrategy: 'fixed',
      baseDelay: 0
    },
    rateLimit: {
      requests: 1000,
      period: 60
    },
    successCount: 2340,
    errorCount: 5,
    averageResponseTime: 45
  }
];

const SAMPLE_WEBHOOKS: WebhookSubscription[] = [
  {
    id: 'payment-events',
    name: 'Payment Events',
    url: 'https://webhook.site/payment-callback',
    events: ['payment.succeeded', 'payment.failed', 'payment.refunded'],
    secret: 'whsec_payment_secret',
    status: 'active',
    lastTriggered: new Date(Date.now() - 3600000),
    successCount: 1250,
    failureCount: 3,
    headers: {
      'Content-Type': 'application/json'
    }
  },
  {
    id: 'user-events',
    name: 'User Activity Events',
    url: 'https://webhook.site/user-callback',
    events: ['user.created', 'user.updated', 'user.deleted'],
    secret: 'whsec_user_secret',
    status: 'active',
    lastTriggered: new Date(Date.now() - 1800000),
    successCount: 890,
    failureCount: 1,
    headers: {
      'Content-Type': 'application/json'
    }
  }
];

export const APIAutomation: React.FC = () => {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>(SAMPLE_ENDPOINTS);
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>(SAMPLE_WEBHOOKS);
  const [executions, setExecutions] = useState<APIExecution[]>([]);
  const [selectedTab, setSelectedTab] = useState<'endpoints' | 'webhooks' | 'executions' | 'workflows'>('endpoints');
  const [isExecuting, setIsExecuting] = useState(false);

  // Simulate API call execution
  const executeEndpoint = useCallback(async (endpointId: string, params: Record<string, any> = {}) => {
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (!endpoint) return;

    setIsExecuting(true);

    // Simulate API call
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

    const success = Math.random() > 0.1; // 90% success rate
    const responseTime = Date.now() - startTime;

    // Update endpoint statistics
    setEndpoints(prev => prev.map(ep =>
      ep.id === endpointId
        ? {
            ...ep,
            lastExecuted: new Date(),
            successCount: ep.successCount + (success ? 1 : 0),
            errorCount: ep.errorCount + (success ? 0 : 1),
            averageResponseTime: Math.round((ep.averageResponseTime * (ep.successCount + ep.errorCount) + responseTime) / (ep.successCount + ep.errorCount + 1))
          }
        : ep
    ));

    setIsExecuting(false);

    return {
      success,
      responseTime,
      status: success ? 200 : 500,
      data: success ? { message: 'API call successful', ...params } : { error: 'API call failed' }
    };
  }, [endpoints]);

  // Execute API workflow
  const executeWorkflow = useCallback(async (workflow: APIWorkflow) => {
    const execution: APIExecution = {
      id: `exec-${Date.now()}`,
      workflowId: workflow.id,
      startTime: new Date(),
      status: 'running',
      steps: [],
      variables: workflow.variables
    };

    setExecutions(prev => [execution, ...prev]);

    // Simulate step-by-step execution
    for (const step of workflow.steps) {
      const stepStartTime = new Date();

      setExecutions(prev => prev.map(exec =>
        exec.id === execution.id
          ? {
              ...exec,
              steps: [
                ...exec.steps,
                {
                  stepId: step.id,
                  startTime: stepStartTime,
                  status: 'running'
                }
              ]
            }
          : exec
      ));

      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 500));

      const stepSuccess = Math.random() > 0.15; // 85% success rate

      setExecutions(prev => prev.map(exec =>
        exec.id === execution.id
          ? {
              ...exec,
              steps: exec.steps.map(s =>
                s.stepId === step.id
                  ? {
                      ...s,
                      endTime: new Date(),
                      status: stepSuccess ? 'completed' : 'failed',
                      executionTime: Date.now() - stepStartTime.getTime(),
                      error: stepSuccess ? undefined : 'Step execution failed'
                    }
                  : s
              )
            }
          : exec
      ));

      if (!stepSuccess && !step.retryOnFailure) {
        // Stop execution on critical failure
        setExecutions(prev => prev.map(exec =>
          exec.id === execution.id
            ? {
                ...exec,
                status: 'failed',
                endTime: new Date(),
                error: `Workflow failed at step: ${step.name}`
              }
            : exec
        ));
        break;
      }
    }

    // Complete execution
    setExecutions(prev => prev.map(exec =>
      exec.id === execution.id && exec.status === 'running'
        ? {
            ...exec,
            status: 'completed',
            endTime: new Date()
          }
        : exec
    ));
  }, []);

  // Test webhook
  const testWebhook = useCallback(async (webhookId: string) => {
    const webhook = webhooks.find(w => w.id === webhookId);
    if (!webhook) return;

    // Simulate webhook trigger
    const success = Math.random() > 0.1;

    setWebhooks(prev => prev.map(wh =>
      wh.id === webhookId
        ? {
            ...wh,
            lastTriggered: new Date(),
            successCount: wh.successCount + (success ? 1 : 0),
            failureCount: wh.failureCount + (success ? 0 : 1),
            status: success ? 'active' : 'failed'
          }
        : wh
    ));

    return success;
  }, [webhooks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'running':
        return 'text-blue-600 bg-blue-100';
      case 'inactive':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getProtocolIcon = (protocol: string) => {
    switch (protocol) {
      case 'rest':
        return <Code className="w-4 h-4" />;
      case 'graphql':
        return <Zap className="w-4 h-4" />;
      case 'webhook':
        return <Webhook className="w-4 h-4" />;
      default:
        return <Send className="w-4 h-4" />;
    }
  };

  const totalEndpoints = endpoints.length;
  const activeEndpoints = endpoints.filter(e => e.successCount > 0).length;
  const totalCalls = endpoints.reduce((sum, e) => sum + e.successCount + e.errorCount, 0);
  const avgResponseTime = endpoints.reduce((sum, e) => sum + e.averageResponseTime, 0) / endpoints.length;
  const successRate = (endpoints.reduce((sum, e) => sum + e.successCount, 0) /
                      endpoints.reduce((sum, e) => sum + e.successCount + e.errorCount, 0)) * 100 || 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Automation</h1>
              <p className="text-gray-600">REST, GraphQL, and webhook integrations for automated API interactions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => executeEndpoint(endpoints[0].id)}
              disabled={isExecuting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>{isExecuting ? 'Executing...' : 'Test API'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Endpoints</p>
              <p className="text-2xl font-bold text-gray-900">{totalEndpoints}</p>
            </div>
            <Code className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Endpoints</p>
              <p className="text-2xl font-bold text-gray-900">{activeEndpoints}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total API Calls</p>
              <p className="text-2xl font-bold text-gray-900">{totalCalls.toLocaleString()}</p>
            </div>
            <Send className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{successRate.toFixed(1)}%</p>
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
              onClick={() => setSelectedTab('endpoints')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'endpoints'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              API Endpoints
            </button>
            <button
              onClick={() => setSelectedTab('webhooks')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'webhooks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Webhooks
            </button>
            <button
              onClick={() => setSelectedTab('executions')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'executions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Executions
            </button>
            <button
              onClick={() => setSelectedTab('workflows')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'workflows'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Workflows
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'endpoints' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">API Endpoints</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Endpoint
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getProtocolIcon(endpoint.protocol)}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{endpoint.name}</h4>
                          <p className="text-sm text-gray-600">{endpoint.method} {endpoint.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          endpoint.protocol === 'rest' ? 'bg-blue-100 text-blue-800' :
                          endpoint.protocol === 'graphql' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {endpoint.protocol}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="ml-2 font-medium">
                          {endpoint.successCount + endpoint.errorCount > 0
                            ? ((endpoint.successCount / (endpoint.successCount + endpoint.errorCount)) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Response:</span>
                        <span className="ml-2 font-medium">{endpoint.averageResponseTime}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Rate Limit:</span>
                        <span className="ml-2 font-medium">{endpoint.rateLimit.requests}/{endpoint.rateLimit.period}s</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Retries:</span>
                        <span className="ml-2 font-medium">{endpoint.retryConfig.maxRetries}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Authentication:</h5>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                        {endpoint.authentication.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => executeEndpoint(endpoint.id)}
                        disabled={isExecuting}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        <Play className="w-4 h-4 inline mr-1" />
                        Test
                      </button>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                          <Settings className="w-4 h-4 inline mr-1" />
                          Configure
                        </button>
                        <span className="text-xs text-gray-500">
                          {endpoint.lastExecuted ? `Last: ${endpoint.lastExecuted.toLocaleTimeString()}` : 'Never executed'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'webhooks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Webhook Subscriptions</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Webhook
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Webhook
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Events
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Success Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Triggered
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {webhooks.map((webhook) => (
                      <tr key={webhook.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{webhook.name}</div>
                            <div className="text-sm text-gray-500">ID: {webhook.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                          {webhook.url}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {webhook.events.length} events
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(webhook.status)}`}>
                            {webhook.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {webhook.successCount + webhook.failureCount > 0
                            ? ((webhook.successCount / (webhook.successCount + webhook.failureCount)) * 100).toFixed(1)
                            : 0}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {webhook.lastTriggered ? webhook.lastTriggered.toLocaleTimeString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => testWebhook(webhook.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Test
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              {webhook.status === 'active' ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'executions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">API Executions</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Export Logs
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Execution
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Endpoint
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Response Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {executions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No executions yet. Test an endpoint or run a workflow to see executions here.
                        </td>
                      </tr>
                    ) : (
                      executions.map((execution) => (
                        <tr key={execution.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {execution.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {execution.workflowId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(execution.status)}`}>
                              {execution.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {execution.endTime
                              ? `${((execution.endTime.getTime() - execution.startTime.getTime()))}ms`
                              : 'Running...'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {execution.startTime.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'workflows' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">API Workflows</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Create Workflow
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">API Workflow Builder</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Create automated API workflows with conditional logic, data transformation, and webhook triggers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">API Call Step</h5>
                    <p className="text-sm text-gray-600">Execute REST or GraphQL API calls with authentication</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">Data Transform</h5>
                    <p className="text-sm text-gray-600">Transform and manipulate API response data</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">Conditional Logic</h5>
                    <p className="text-sm text-gray-600">Add conditional branching based on API responses</p>
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

export default APIAutomation;