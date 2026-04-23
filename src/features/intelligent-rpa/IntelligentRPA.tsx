'use client';

import { useState, useEffect, useCallback } from 'react';

interface Bot {
  id: string;
  name: string;
  description: string;
  type: 'web' | 'desktop' | 'api' | 'database' | 'document';
  status: 'idle' | 'running' | 'paused' | 'error' | 'completed';
  progress: number;
  tasks: number;
  completedTasks: number;
  lastRun?: Date;
  nextRun?: Date;
  schedule: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  intelligence: {
    learningEnabled: boolean;
    adaptationRate: number;
    errorRecovery: boolean;
    optimizationLevel: 'basic' | 'intermediate' | 'advanced';
  };
  metrics: {
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    costSavings: number;
  };
}

interface Task {
  id: string;
  name: string;
  description: string;
  type: 'data_entry' | 'web_scraping' | 'api_call' | 'file_processing' | 'email_processing' | 'form_filling';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed';
  botId: string;
  config: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
  executionTime?: number;
  result?: any;
  error?: string;
}

interface ProcessTemplate {
  id: string;
  name: string;
  description: string;
  category: 'finance' | 'hr' | 'operations' | 'customer_service' | 'compliance';
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedTime: number; // minutes
  tasks: string[];
  template: any; // Workflow definition
}

interface IntelligentRPAProps {
  tenantId?: string;
  onBotExecution?: (bot: Bot, result: any) => void;
  onTaskCompleted?: (task: Task) => void;
}

const PROCESS_TEMPLATES: ProcessTemplate[] = [
  {
    id: 'invoice_processing',
    name: 'Invoice Processing Automation',
    description: 'Automatically process incoming invoices, extract data, and route for approval',
    category: 'finance',
    complexity: 'moderate',
    estimatedTime: 15,
    tasks: ['Email monitoring', 'Document OCR', 'Data extraction', 'Approval routing', 'Payment processing'],
    template: {
      steps: [
        { type: 'email_monitor', config: { folder: 'inbox', keywords: ['invoice'] } },
        { type: 'ocr_processing', config: { language: 'en', confidence: 0.9 } },
        { type: 'data_extraction', config: { fields: ['amount', 'vendor', 'date', 'due_date'] } },
        { type: 'approval_workflow', config: { threshold: 5000, approvers: ['manager', 'finance'] } },
        { type: 'payment_processing', config: { method: 'ach', schedule: 'weekly' } }
      ]
    }
  },
  {
    id: 'employee_onboarding',
    name: 'Employee Onboarding Automation',
    description: 'Streamline new employee setup with document collection and system access',
    category: 'hr',
    complexity: 'complex',
    estimatedTime: 45,
    tasks: ['Document collection', 'System account creation', 'Access provisioning', 'Training assignment', 'Compliance verification'],
    template: {
      steps: [
        { type: 'form_collection', config: { forms: ['w4', 'i9', 'direct_deposit'] } },
        { type: 'account_creation', config: { systems: ['email', 'hr_system', 'payroll'] } },
        { type: 'access_provisioning', config: { roles: ['employee'], applications: ['office365', 'slack'] } },
        { type: 'training_assignment', config: { courses: ['compliance', 'company_policies'] } },
        { type: 'compliance_check', config: { checks: ['background', 'drug_test'] } }
      ]
    }
  },
  {
    id: 'customer_support',
    name: 'Customer Support Ticket Processing',
    description: 'Automatically categorize and route customer support tickets',
    category: 'customer_service',
    complexity: 'simple',
    estimatedTime: 5,
    tasks: ['Ticket categorization', 'Priority assessment', 'Auto-response', 'Agent routing'],
    template: {
      steps: [
        { type: 'ticket_analysis', config: { use_nlp: true, categories: ['billing', 'technical', 'general'] } },
        { type: 'priority_scoring', config: { keywords: { urgent: ['emergency', 'down'], high: ['error', 'bug'] } } },
        { type: 'auto_response', config: { templates: ['acknowledgment', 'estimated_resolution'] } },
        { type: 'agent_routing', config: { routing_rules: { technical: 'tech_team', billing: 'finance_team' } } }
      ]
    }
  },
  {
    id: 'compliance_reporting',
    name: 'Regulatory Compliance Reporting',
    description: 'Automatically generate and submit regulatory compliance reports',
    category: 'compliance',
    complexity: 'complex',
    estimatedTime: 120,
    tasks: ['Data collection', 'Report generation', 'Validation checks', 'Submission', 'Audit trail'],
    template: {
      steps: [
        { type: 'data_collection', config: { sources: ['database', 'api', 'files'], regulations: ['gdpr', 'ccpa'] } },
        { type: 'report_generation', config: { format: 'pdf', templates: ['monthly_compliance'] } },
        { type: 'validation_checks', config: { rules: ['completeness', 'accuracy', 'timeliness'] } },
        { type: 'secure_submission', config: { method: 'encrypted_api', recipients: ['regulator'] } },
        { type: 'audit_logging', config: { retention: '7_years', immutable: true } }
      ]
    }
  },
  {
    id: 'inventory_management',
    name: 'Inventory Level Optimization',
    description: 'Monitor inventory levels and automatically reorder when thresholds are met',
    category: 'operations',
    complexity: 'moderate',
    estimatedTime: 30,
    tasks: ['Inventory monitoring', 'Demand forecasting', 'Reorder calculation', 'Supplier notification', 'Order tracking'],
    template: {
      steps: [
        { type: 'inventory_monitoring', config: { frequency: 'hourly', thresholds: { low: 10, critical: 5 } } },
        { type: 'demand_forecasting', config: { algorithm: 'exponential_smoothing', horizon: 30 } },
        { type: 'reorder_calculation', config: { formula: 'safety_stock + lead_time_demand' } },
        { type: 'supplier_notification', config: { method: 'api', priority: 'auto' } },
        { type: 'order_tracking', config: { update_frequency: 'daily', notifications: true } }
      ]
    }
  }
];

const SAMPLE_BOTS: Bot[] = [
  {
    id: 'bot_invoice_processor',
    name: 'Invoice Processing Bot',
    description: 'Automates invoice receipt, processing, and payment workflows',
    type: 'document',
    status: 'idle',
    progress: 0,
    tasks: 150,
    completedTasks: 147,
    lastRun: new Date('2024-04-22'),
    nextRun: new Date('2024-04-23'),
    schedule: 'daily',
    intelligence: {
      learningEnabled: true,
      adaptationRate: 0.85,
      errorRecovery: true,
      optimizationLevel: 'advanced'
    },
    metrics: {
      totalExecutions: 234,
      successRate: 0.96,
      averageExecutionTime: 8.5,
      costSavings: 12500
    }
  },
  {
    id: 'bot_customer_service',
    name: 'Customer Service Bot',
    description: 'Handles customer inquiries and support ticket routing',
    type: 'web',
    status: 'running',
    progress: 65,
    tasks: 89,
    completedTasks: 58,
    lastRun: new Date('2024-04-23'),
    schedule: 'manual',
    intelligence: {
      learningEnabled: true,
      adaptationRate: 0.92,
      errorRecovery: true,
      optimizationLevel: 'intermediate'
    },
    metrics: {
      totalExecutions: 1567,
      successRate: 0.89,
      averageExecutionTime: 3.2,
      costSavings: 8750
    }
  },
  {
    id: 'bot_data_sync',
    name: 'Data Synchronization Bot',
    description: 'Synchronizes data between multiple systems and databases',
    type: 'api',
    status: 'completed',
    progress: 100,
    tasks: 25,
    completedTasks: 25,
    lastRun: new Date('2024-04-23'),
    nextRun: new Date('2024-04-24'),
    schedule: 'hourly',
    intelligence: {
      learningEnabled: false,
      adaptationRate: 0.75,
      errorRecovery: true,
      optimizationLevel: 'basic'
    },
    metrics: {
      totalExecutions: 892,
      successRate: 0.98,
      averageExecutionTime: 12.8,
      costSavings: 15200
    }
  }
];

export default function IntelligentRPA({
  tenantId = 'default',
  onBotExecution,
  onTaskCompleted
}: IntelligentRPAProps) {
  const [activeTab, setActiveTab] = useState<'bots' | 'templates' | 'tasks' | 'analytics'>('bots');
  const [bots, setBots] = useState<Bot[]>(SAMPLE_BOTS);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreatingBot, setIsCreatingBot] = useState(false);

  const [createBotForm, setCreateBotForm] = useState({
    name: '',
    description: '',
    type: 'web' as Bot['type'],
    schedule: 'manual' as Bot['schedule'],
    learningEnabled: true,
    optimizationLevel: 'intermediate' as Bot['intelligence']['optimizationLevel']
  });

  const executeBot = useCallback(async (bot: Bot) => {
    setBots(prev => prev.map(b =>
      b.id === bot.id
        ? { ...b, status: 'running' as const, progress: 0 }
        : b
    ));

    // Simulate bot execution
    const totalSteps = 100;
    for (let i = 0; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

      setBots(prev => prev.map(b =>
        b.id === bot.id
          ? { ...b, progress: i, completedTasks: Math.floor((i / 100) * b.tasks) }
          : b
      ));
    }

    const success = Math.random() > 0.1; // 90% success rate
    const finalStatus = success ? 'completed' : 'error';

    setBots(prev => prev.map(b =>
      b.id === bot.id
        ? {
            ...b,
            status: finalStatus as any,
            progress: 100,
            completedTasks: b.tasks,
            lastRun: new Date(),
            metrics: {
              ...b.metrics,
              totalExecutions: b.metrics.totalExecutions + 1,
              successRate: success ? (b.metrics.successRate * b.metrics.totalExecutions + 1) / (b.metrics.totalExecutions + 1)
                           : (b.metrics.successRate * b.metrics.totalExecutions) / (b.metrics.totalExecutions + 1)
            }
          }
        : b
    ));

    onBotExecution?.(bot, { success, executionTime: Math.random() * 60 + 30 });
  }, [onBotExecution]);

  const createBotFromTemplate = useCallback(async (template: ProcessTemplate) => {
    const newBot: Bot = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${template.name} Bot`,
      description: template.description,
      type: 'web',
      status: 'idle',
      progress: 0,
      tasks: template.tasks.length,
      completedTasks: 0,
      schedule: 'manual',
      intelligence: {
        learningEnabled: true,
        adaptationRate: 0.8 + Math.random() * 0.2,
        errorRecovery: true,
        optimizationLevel: template.complexity === 'simple' ? 'basic' :
                          template.complexity === 'moderate' ? 'intermediate' : 'advanced'
      },
      metrics: {
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: template.estimatedTime,
        costSavings: Math.floor(Math.random() * 10000 + 5000)
      }
    };

    setBots(prev => [newBot, ...prev]);
    setActiveTab('bots');
  }, []);

  const createCustomBot = useCallback(async () => {
    if (!createBotForm.name || !createBotForm.description) return;

    const newBot: Bot = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: createBotForm.name,
      description: createBotForm.description,
      type: createBotForm.type,
      status: 'idle',
      progress: 0,
      tasks: 0,
      completedTasks: 0,
      schedule: createBotForm.schedule,
      intelligence: {
        learningEnabled: createBotForm.learningEnabled,
        adaptationRate: 0.7 + Math.random() * 0.3,
        errorRecovery: true,
        optimizationLevel: createBotForm.optimizationLevel
      },
      metrics: {
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 10,
        costSavings: 0
      }
    };

    setBots(prev => [newBot, ...prev]);
    setCreateBotForm({
      name: '',
      description: '',
      type: 'web',
      schedule: 'manual',
      learningEnabled: true,
      optimizationLevel: 'intermediate'
    });
    setIsCreatingBot(false);
    setActiveTab('bots');
  }, [createBotForm]);

  const getStatusColor = (status: Bot['status']) => {
    switch (status) {
      case 'idle': return '#6B7280';
      case 'running': return '#3B82F6';
      case 'paused': return '#F59E0B';
      case 'error': return '#EF4444';
      case 'completed': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getComplexityColor = (level: Bot['intelligence']['optimizationLevel']) => {
    switch (level) {
      case 'basic': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: Bot['type']) => {
    switch (type) {
      case 'web': return '🌐';
      case 'desktop': return '🖥️';
      case 'api': return '🔗';
      case 'database': return '🗄️';
      case 'document': return '📄';
      default: return '🤖';
    }
  };

  const totalBots = bots.length;
  const activeBots = bots.filter(b => b.status === 'running').length;
  const totalExecutions = bots.reduce((sum, b) => sum + b.metrics.totalExecutions, 0);
  const totalSavings = bots.reduce((sum, b) => sum + b.metrics.costSavings, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Intelligent RPA Platform</h1>
            <p className="text-gray-600">AI-powered robotic process automation for enterprise workflows</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Tenant</div>
              <div className="font-mono text-sm">{tenantId}</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalBots}</div>
            <div className="text-sm text-gray-600">Total Bots</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeBots}</div>
            <div className="text-sm text-gray-600">Active Bots</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalExecutions.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Executions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">${totalSavings.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Cost Savings</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'bots', label: 'Bots', icon: '🤖' },
              { id: 'templates', label: 'Templates', icon: '📋' },
              { id: 'tasks', label: 'Tasks', icon: '📝' },
              { id: 'analytics', label: 'Analytics', icon: '📊' }
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
          {/* Bots Tab */}
          {activeTab === 'bots' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">RPA Bots</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsCreatingBot(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Bot
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bots.map((bot) => (
                  <div
                    key={bot.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTypeIcon(bot.type)}</span>
                        <div>
                          <h3 className="font-medium text-gray-900">{bot.name}</h3>
                          <p className="text-sm text-gray-600">{bot.description}</p>
                        </div>
                      </div>
                      <span
                        className="px-2 py-1 text-xs rounded-full text-white"
                        style={{ backgroundColor: getStatusColor(bot.status) }}
                      >
                        {bot.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{bot.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${bot.progress}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Tasks</div>
                          <div>{bot.completedTasks}/{bot.tasks}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Success Rate</div>
                          <div>{(bot.metrics.successRate * 100).toFixed(1)}%</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">AI Level</span>
                        <span
                          className="px-2 py-1 text-xs rounded text-white"
                          style={{ backgroundColor: getComplexityColor(bot.intelligence.optimizationLevel) }}
                        >
                          {bot.intelligence.optimizationLevel}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => executeBot(bot)}
                        disabled={bot.status === 'running'}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {bot.status === 'running' ? 'Running...' : 'Execute'}
                      </button>
                      <button
                        onClick={() => setSelectedBot(bot)}
                        className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Process Templates</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PROCESS_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                        {template.category}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-2">Tasks:</div>
                      <div className="flex flex-wrap gap-1">
                        {template.tasks.slice(0, 3).map((task, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {task}
                          </span>
                        ))}
                        {template.tasks.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{template.tasks.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>Complexity: <span className="capitalize">{template.complexity}</span></span>
                      <span>~{template.estimatedTime}min</span>
                    </div>

                    <button
                      onClick={() => createBotFromTemplate(template)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create Bot
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Task Queue</h2>

              {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">📝</div>
                  <div>No tasks in queue</div>
                  <div className="text-sm">Execute a bot to see tasks here</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{task.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            task.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'running' ? 'bg-blue-100 text-blue-800' :
                            task.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created: {task.createdAt.toLocaleString()}</span>
                        {task.executionTime && (
                          <span>Execution time: {task.executionTime.toFixed(1)}s</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">RPA Analytics</h2>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-medium mb-2">Average Success Rate</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {(bots.reduce((sum, b) => sum + b.metrics.successRate, 0) / bots.length * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Across all bots</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-medium mb-2">Time Saved</h3>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.floor(bots.reduce((sum, b) => sum + b.metrics.totalExecutions * b.metrics.averageExecutionTime, 0) / 60)}h
                  </div>
                  <div className="text-sm text-gray-600">Automated work time</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="font-medium mb-2">Process Efficiency</h3>
                  <div className="text-2xl font-bold text-purple-600">87.3%</div>
                  <div className="text-sm text-gray-600">Error reduction</div>
                </div>
              </div>

              {/* Bot Performance Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Bot Performance Overview</h3>
                <div className="space-y-4">
                  {bots.map((bot) => (
                    <div key={bot.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-lg">{getTypeIcon(bot.type)}</span>
                          <span className="font-medium">{bot.name}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${bot.metrics.successRate * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-bold">{(bot.metrics.successRate * 100).toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">{bot.metrics.totalExecutions} runs</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Savings Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Cost Savings by Category</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">$12,500</div>
                    <div className="text-sm text-gray-600">Invoice Processing</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">$8,750</div>
                    <div className="text-sm text-gray-600">Customer Service</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <div className="text-lg font-bold text-purple-600">$15,200</div>
                    <div className="text-sm text-gray-600">Data Sync</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded">
                    <div className="text-lg font-bold text-orange-600">$22,300</div>
                    <div className="text-sm text-gray-600">Other Processes</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Bot Modal */}
      {isCreatingBot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Create New Bot</h2>
                <button
                  onClick={() => setIsCreatingBot(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bot Name</label>
                  <input
                    type="text"
                    value={createBotForm.name}
                    onChange={(e) => setCreateBotForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter bot name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={createBotForm.description}
                    onChange={(e) => setCreateBotForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what this bot will do"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={createBotForm.type}
                      onChange={(e) => setCreateBotForm(prev => ({ ...prev, type: e.target.value as Bot['type'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="web">Web Automation</option>
                      <option value="desktop">Desktop Automation</option>
                      <option value="api">API Integration</option>
                      <option value="database">Database Operations</option>
                      <option value="document">Document Processing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                    <select
                      value={createBotForm.schedule}
                      onChange={(e) => setCreateBotForm(prev => ({ ...prev, schedule: e.target.value as Bot['schedule'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="manual">Manual</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="learningEnabled"
                    checked={createBotForm.learningEnabled}
                    onChange={(e) => setCreateBotForm(prev => ({ ...prev, learningEnabled: e.target.checked }))}
                  />
                  <label htmlFor="learningEnabled" className="text-sm">Enable AI Learning</label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={createCustomBot}
                    disabled={!createBotForm.name || !createBotForm.description}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Bot
                  </button>
                  <button
                    onClick={() => setIsCreatingBot(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bot Details Modal */}
      {selectedBot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedBot.name}</h2>
                <button
                  onClick={() => setSelectedBot(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-600">{selectedBot.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{selectedBot.tasks}</div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">{(selectedBot.metrics.successRate * 100).toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{selectedBot.metrics.averageExecutionTime.toFixed(1)}m</div>
                    <div className="text-sm text-gray-600">Avg Time</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded">
                    <div className="text-lg font-bold text-orange-600">${selectedBot.metrics.costSavings.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Savings</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">AI Intelligence Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Learning Enabled</span>
                      <span className={`px-2 py-1 text-xs rounded ${selectedBot.intelligence.learningEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedBot.intelligence.learningEnabled ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Adaptation Rate</span>
                      <span className="text-sm font-medium">{(selectedBot.intelligence.adaptationRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Error Recovery</span>
                      <span className={`px-2 py-1 text-xs rounded ${selectedBot.intelligence.errorRecovery ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedBot.intelligence.errorRecovery ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Optimization Level</span>
                      <span className="text-sm font-medium capitalize">{selectedBot.intelligence.optimizationLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => executeBot(selectedBot)}
                    disabled={selectedBot.status === 'running'}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedBot.status === 'running' ? 'Running...' : 'Execute Bot'}
                  </button>
                  <button
                    onClick={() => setSelectedBot(null)}
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