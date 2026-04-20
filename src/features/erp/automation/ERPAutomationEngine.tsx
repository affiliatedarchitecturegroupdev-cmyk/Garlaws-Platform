'use client';

import { useState, useEffect, useCallback } from 'react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  status: 'active' | 'inactive' | 'draft' | 'error';
  priority: number;
  executionCount: number;
  lastExecuted?: string;
  averageExecutionTime: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface AutomationTrigger {
  type: 'event' | 'schedule' | 'api' | 'webhook' | 'manual';
  config: {
    eventType?: string;
    cronExpression?: string;
    apiEndpoint?: string;
    webhookUrl?: string;
    manualTrigger?: string;
  };
}

interface AutomationCondition {
  id: string;
  type: 'field_value' | 'date_comparison' | 'user_role' | 'business_rule' | 'custom_logic';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in';
  field?: string;
  value: any;
  logicalOperator?: 'AND' | 'OR';
  groupId?: string; // For grouping conditions
}

interface AutomationAction {
  id: string;
  type: 'update_field' | 'send_notification' | 'create_record' | 'update_record' | 'delete_record' | 'run_workflow' | 'send_email' | 'api_call' | 'custom_action';
  config: {
    targetEntity?: string;
    field?: string;
    value?: any;
    template?: string;
    recipients?: string[];
    workflowId?: string;
    apiEndpoint?: string;
    apiMethod?: string;
    apiPayload?: any;
    customFunction?: string;
  };
  onFailure?: 'stop' | 'continue' | 'retry';
  retryCount?: number;
}

interface AutomationExecution {
  id: string;
  ruleId: string;
  triggerType: string;
  triggerData: any;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startedAt: string;
  completedAt?: string;
  duration: number;
  steps: AutomationExecutionStep[];
  error?: string;
  retryCount: number;
}

interface AutomationExecutionStep {
  actionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  output?: any;
  error?: string;
  retryCount: number;
}

interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  cronExpression: string;
  taskType: 'automation' | 'sync' | 'report' | 'maintenance' | 'custom';
  config: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
  lastRun?: string;
  nextRun?: string;
  executionCount: number;
  averageDuration: number;
  createdAt: string;
}

interface ERPAutomationEngineProps {
  tenantId?: string;
}

export default function ERPAutomationEngine({ tenantId = 'default' }: ERPAutomationEngineProps) {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'executions' | 'scheduled'>('rules');
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [ruleFilters, setRuleFilters] = useState({
    status: 'all' as 'all' | 'active' | 'inactive' | 'draft' | 'error',
    trigger: 'all' as 'all' | 'event' | 'schedule' | 'api' | 'webhook' | 'manual'
  });

  const [newRule, setNewRule] = useState<Partial<AutomationRule>>({
    name: '',
    description: '',
    trigger: { type: 'event', config: {} },
    conditions: [],
    actions: [],
    status: 'draft',
    priority: 1,
    tags: []
  });

  const [newTask, setNewTask] = useState<Partial<ScheduledTask>>({
    name: '',
    description: '',
    cronExpression: '0 0 * * *',
    taskType: 'automation',
    config: {},
    status: 'active'
  });

  const triggerTypes = [
    { value: 'event', label: 'Event Trigger', description: 'Triggered by system events' },
    { value: 'schedule', label: 'Scheduled', description: 'Time-based execution' },
    { value: 'api', label: 'API Call', description: 'REST API endpoint trigger' },
    { value: 'webhook', label: 'Webhook', description: 'External webhook trigger' },
    { value: 'manual', label: 'Manual', description: 'Manual execution only' }
  ];

  const actionTypes = [
    { value: 'update_field', label: 'Update Field', description: 'Update a field value' },
    { value: 'send_notification', label: 'Send Notification', description: 'Send system notification' },
    { value: 'create_record', label: 'Create Record', description: 'Create new record' },
    { value: 'update_record', label: 'Update Record', description: 'Update existing record' },
    { value: 'delete_record', label: 'Delete Record', description: 'Delete record' },
    { value: 'run_workflow', label: 'Run Workflow', description: 'Execute workflow' },
    { value: 'send_email', label: 'Send Email', description: 'Send email notification' },
    { value: 'api_call', label: 'API Call', description: 'Make external API call' },
    { value: 'custom_action', label: 'Custom Action', description: 'Execute custom function' }
  ];

  const taskTypes = [
    { value: 'automation', label: 'Automation Rule', description: 'Execute automation rules' },
    { value: 'sync', label: 'Data Sync', description: 'Synchronize data between systems' },
    { value: 'report', label: 'Generate Report', description: 'Create scheduled reports' },
    { value: 'maintenance', label: 'Maintenance', description: 'System maintenance tasks' },
    { value: 'custom', label: 'Custom Task', description: 'Custom scheduled task' }
  ];

  const fetchRules = useCallback(async () => {
    try {
      const response = await fetch(`/api/erp?action=automation-rules&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setRules(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch automation rules:', error);
    }
  }, [tenantId]);

  const fetchExecutions = useCallback(async () => {
    try {
      const response = await fetch(`/api/erp?action=automation-executions&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setExecutions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch executions:', error);
    }
  }, [tenantId]);

  const fetchScheduledTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/erp?action=scheduled-tasks&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setScheduledTasks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch scheduled tasks:', error);
    }
  }, [tenantId]);

  useEffect(() => {
    Promise.all([fetchRules(), fetchExecutions(), fetchScheduledTasks()]).finally(() => {
      setLoading(false);
    });
  }, [fetchRules, fetchExecutions, fetchScheduledTasks]);

  const createRule = async () => {
    if (!newRule.name || !newRule.trigger) return;

    try {
      const response = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-automation-rule',
          tenantId,
          rule: {
            ...newRule,
            executionCount: 0,
            averageExecutionTime: 0,
            successRate: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setRules([...rules, data.data]);
        setShowCreateRule(false);
        resetRuleForm();
      }
    } catch (error) {
      console.error('Failed to create automation rule:', error);
    }
  };

  const createScheduledTask = async () => {
    if (!newTask.name || !newTask.cronExpression) return;

    try {
      const response = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-scheduled-task',
          tenantId,
          task: {
            ...newTask,
            executionCount: 0,
            averageDuration: 0,
            createdAt: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setScheduledTasks([...scheduledTasks, data.data]);
        setShowCreateTask(false);
        resetTaskForm();
      }
    } catch (error) {
      console.error('Failed to create scheduled task:', error);
    }
  };

  const resetRuleForm = () => {
    setNewRule({
      name: '',
      description: '',
      trigger: { type: 'event', config: {} },
      conditions: [],
      actions: [],
      status: 'draft',
      priority: 1,
      tags: []
    });
  };

  const resetTaskForm = () => {
    setNewTask({
      name: '',
      description: '',
      cronExpression: '0 0 * * *',
      taskType: 'automation',
      config: {},
      status: 'active'
    });
  };

  const executeRule = async (ruleId: string, testData?: any) => {
    try {
      const response = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute-automation-rule',
          tenantId,
          ruleId,
          testData
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchExecutions(); // Refresh executions
      }
    } catch (error) {
      console.error('Failed to execute rule:', error);
    }
  };

  const toggleRuleStatus = async (ruleId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const response = await fetch('/api/erp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-automation-rule-status',
          tenantId,
          ruleId,
          status: newStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        setRules(rules.map(rule =>
          rule.id === ruleId ? { ...rule, status: newStatus, updatedAt: new Date().toISOString() } : rule
        ));
      }
    } catch (error) {
      console.error('Failed to update rule status:', error);
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return;

    try {
      const response = await fetch('/api/erp', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-automation-rule',
          tenantId,
          ruleId
        })
      });

      const data = await response.json();
      if (data.success) {
        setRules(rules.filter(rule => rule.id !== ruleId));
        if (selectedRule?.id === ruleId) {
          setSelectedRule(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const getFilteredRules = () => {
    return rules.filter(rule => {
      const statusMatch = ruleFilters.status === 'all' || rule.status === ruleFilters.status;
      const triggerMatch = ruleFilters.trigger === 'all' || rule.trigger.type === ruleFilters.trigger;
      return statusMatch && triggerMatch;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'event': return '⚡';
      case 'schedule': return '⏰';
      case 'api': return '🔗';
      case 'webhook': return '🪝';
      case 'manual': return '👤';
      default: return '❓';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'update_field': return '✏️';
      case 'send_notification': return '📢';
      case 'create_record': return '➕';
      case 'update_record': return '🔄';
      case 'delete_record': return '🗑️';
      case 'run_workflow': return '⚙️';
      case 'send_email': return '📧';
      case 'api_call': return '🌐';
      case 'custom_action': return '🛠️';
      default: return '❓';
    }
  };

  const calculateRuleStats = () => {
    const total = rules.length;
    const active = rules.filter(r => r.status === 'active').length;
    const executions = rules.reduce((sum, rule) => sum + rule.executionCount, 0);
    const avgSuccessRate = rules.length > 0
      ? rules.reduce((sum, rule) => sum + rule.successRate, 0) / rules.length
      : 0;

    return { total, active, executions, avgSuccessRate };
  };

  const stats = calculateRuleStats();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">ERP Automation Engine</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateTask(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            New Scheduled Task
          </button>
          <button
            onClick={() => setShowCreateRule(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            New Automation Rule
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Automation Rules</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active Rules</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{stats.executions}</div>
          <div className="text-sm text-gray-600">Total Executions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{stats.avgSuccessRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Avg Success Rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Automation Rules ({rules.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('executions');
              fetchExecutions();
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'executions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Executions ({executions.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('scheduled');
              fetchScheduledTasks();
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'scheduled'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Scheduled Tasks ({scheduledTasks.length})
          </button>
        </nav>
      </div>

      {/* Create Rule Form */}
      {showCreateRule && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create Automation Rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
              <input
                type="text"
                value={newRule.name || ''}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auto-approve low-value purchase orders"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newRule.description || ''}
                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Automatically approve purchase orders under $500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
              <select
                value={newRule.trigger?.type || 'event'}
                onChange={(e) => setNewRule(prev => ({
                  ...prev,
                  trigger: { ...prev.trigger!, type: e.target.value as any }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {triggerTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={newRule.priority || 1}
                onChange={(e) => setNewRule(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
                <option value="4">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newRule.status || 'draft'}
                onChange={(e) => setNewRule(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={createRule}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Create Rule
            </button>
            <button
              onClick={() => {
                setShowCreateRule(false);
                resetRuleForm();
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Create Task Form */}
      {showCreateTask && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create Scheduled Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
              <input
                type="text"
                value={newTask.name || ''}
                onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Daily data sync"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newTask.description || ''}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Synchronize customer data daily"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
              <select
                value={newTask.taskType || 'automation'}
                onChange={(e) => setNewTask(prev => ({ ...prev, taskType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {taskTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cron Expression</label>
              <input
                type="text"
                value={newTask.cronExpression || ''}
                onChange={(e) => setNewTask(prev => ({ ...prev, cronExpression: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0 0 * * *"
              />
              <p className="text-xs text-gray-500 mt-1">Minute Hour Day Month DayOfWeek</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newTask.status || 'active'}
                onChange={(e) => setNewTask(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={createScheduledTask}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Create Task
            </button>
            <button
              onClick={() => {
                setShowCreateTask(false);
                resetTaskForm();
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={ruleFilters.status}
                  onChange={(e) => setRuleFilters(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
                <select
                  value={ruleFilters.trigger}
                  onChange={(e) => setRuleFilters(prev => ({ ...prev, trigger: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Triggers</option>
                  <option value="event">Event</option>
                  <option value="schedule">Schedule</option>
                  <option value="api">API</option>
                  <option value="webhook">Webhook</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rules List */}
          <div className="grid grid-cols-1 gap-4">
            {getFilteredRules().map((rule) => (
              <div
                key={rule.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getTriggerIcon(rule.trigger.type)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(rule.status)}`}>
                        {rule.status}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        Priority {rule.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Conditions: {rule.conditions.length}</span>
                      <span>Actions: {rule.actions.length}</span>
                      <span>Executions: {rule.executionCount}</span>
                      <span>Success Rate: {rule.successRate.toFixed(1)}%</span>
                      {rule.lastExecuted && (
                        <span>Last run: {new Date(rule.lastExecuted).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {rule.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rule.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => executeRule(rule.id)}
                    disabled={rule.status !== 'active'}
                    className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    Execute
                  </button>
                  <button
                    onClick={() => toggleRuleStatus(rule.id, rule.status)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      rule.status === 'active'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {rule.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => setSelectedRule(rule)}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {getFilteredRules().length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-6xl mb-4">⚙️</div>
                <p className="text-lg">No automation rules found</p>
                <p className="text-sm">Create rules to automate business processes and workflows.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Executions Tab */}
      {activeTab === 'executions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Automation Executions</h3>
            <button
              onClick={() => fetchExecutions()}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            {executions.map((execution) => (
              <div key={execution.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(execution.status)}`}>
                        {execution.status}
                      </span>
                      <span className="text-sm font-medium">
                        {rules.find(r => r.id === execution.ruleId)?.name || 'Unknown Rule'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Trigger: {execution.triggerType} • Started: {new Date(execution.startedAt).toLocaleString()}
                      {execution.completedAt && ` • Completed: ${new Date(execution.completedAt).toLocaleString()}`}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    Duration: {execution.duration.toFixed(1)}ms
                    {execution.retryCount > 0 && ` • Retries: ${execution.retryCount}`}
                  </div>
                </div>

                {/* Execution Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {execution.steps.map((step, index) => {
                    const action = rules.find(r => r.id === execution.ruleId)?.actions.find(a => a.id === step.actionId);
                    return (
                      <div key={index} className="border border-gray-200 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getActionIcon(action?.type || 'custom_action')}</span>
                            <span className="text-sm font-medium">
                              {action?.type.replace('_', ' ').toUpperCase() || 'Unknown Action'}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(step.status)}`}>
                            {step.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {step.startedAt && `Started: ${new Date(step.startedAt).toLocaleString()}`}
                          {step.completedAt && ` • Completed: ${new Date(step.completedAt).toLocaleString()}`}
                        </div>
                        {step.error && (
                          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                            {step.error}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {execution.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="text-sm font-medium text-red-800 mb-1">Execution Error:</div>
                    <div className="text-sm text-red-700">{execution.error}</div>
                  </div>
                )}
              </div>
            ))}

            {executions.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">▶️</div>
                <p>No automation executions found</p>
                <p className="text-sm">Execute automation rules to see execution history and results.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scheduled Tasks Tab */}
      {activeTab === 'scheduled' && (
        <div className="grid grid-cols-1 gap-4">
          {scheduledTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className="text-xs text-gray-600">{task.taskType}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Schedule:</span>
                      <code className="ml-1 text-gray-900">{task.cronExpression}</code>
                    </div>
                    <div>
                      <span className="text-gray-600">Executions:</span>
                      <span className="ml-1 font-medium">{task.executionCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Duration:</span>
                      <span className="ml-1 font-medium">{task.averageDuration.toFixed(1)}ms</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Next Run:</span>
                      <span className="ml-1 font-medium">
                        {task.nextRun ? new Date(task.nextRun).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  {task.lastRun && (
                    <div className="text-xs text-gray-500 mt-2">
                      Last run: {new Date(task.lastRun).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {/* Run task manually */}}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                  Run Now
                </button>
                <button
                  onClick={() => {/* Edit task */}}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {/* Delete task */}}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {scheduledTasks.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">⏰</div>
              <p className="text-lg">No scheduled tasks configured</p>
              <p className="text-sm">Create scheduled tasks to automate recurring business processes.</p>
            </div>
          )}
        </div>
      )}

      {/* Rule Detail Modal */}
      {selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{selectedRule.name} - Rule Details</h3>
              <button
                onClick={() => setSelectedRule(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Rule Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Status</h4>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedRule.status)}`}>
                    {selectedRule.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Trigger</h4>
                  <div className="flex items-center space-x-2">
                    <span>{getTriggerIcon(selectedRule.trigger.type)}</span>
                    <span className="text-sm">{selectedRule.trigger.type}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Executions</h4>
                  <p className="text-lg font-bold text-gray-900">{selectedRule.executionCount}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Success Rate</h4>
                  <p className="text-lg font-bold text-gray-900">{selectedRule.successRate.toFixed(1)}%</p>
                </div>
              </div>

              {/* Conditions */}
              {selectedRule.conditions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Conditions ({selectedRule.conditions.length})</h4>
                  <div className="space-y-2">
                    {selectedRule.conditions.map((condition, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-3 rounded-lg">
                        <code className="text-gray-900">
                          {condition.field || 'field'} {condition.operator.replace('_', ' ')} {condition.value}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Actions ({selectedRule.actions.length})</h4>
                <div className="space-y-3">
                  {selectedRule.actions.map((action, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg mt-1">{getActionIcon(action.type)}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{action.type.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {action.config.field && `Field: ${action.config.field}`}
                          {action.config.value && ` • Value: ${action.config.value}`}
                          {action.config.template && ` • Template: ${action.config.template}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {selectedRule.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRule.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}