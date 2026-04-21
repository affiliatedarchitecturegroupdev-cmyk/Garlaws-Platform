"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Bot, Workflow, Zap, Target, Brain, Activity, Settings, Play } from 'lucide-react';

interface AutonomousAgent {
  id: string;
  name: string;
  type: 'workflow' | 'decision' | 'monitoring' | 'optimization' | 'security';
  capabilities: string[];
  status: 'active' | 'idle' | 'learning' | 'error';
  autonomy: 'supervised' | 'semi-autonomous' | 'fully-autonomous';
  performance: {
    efficiency: number;
    accuracy: number;
    adaptability: number;
    uptime: number;
  };
  tasksCompleted: number;
  lastActive: Date;
  learningRate: number;
}

interface WorkflowOrchestration {
  id: string;
  name: string;
  description: string;
  agents: string[]; // Agent IDs
  status: 'running' | 'paused' | 'completed' | 'error';
  progress: number;
  startTime: Date;
  estimatedCompletion?: Date;
  currentStep: string;
  steps: WorkflowStep[];
}

interface WorkflowStep {
  id: string;
  name: string;
  agent: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  duration?: number;
  result?: any;
}

interface SelfLearningEvent {
  id: string;
  agentId: string;
  timestamp: Date;
  eventType: 'success' | 'failure' | 'adaptation' | 'discovery';
  description: string;
  impact: number;
  newCapability?: string;
}

interface AutonomousSystemsProps {
  tenantId?: string;
  onWorkflowComplete?: (workflow: WorkflowOrchestration) => void;
  onAgentLearning?: (event: SelfLearningEvent) => void;
}

const AutonomousSystems: React.FC<AutonomousSystemsProps> = ({
  tenantId = 'default',
  onWorkflowComplete,
  onAgentLearning
}) => {
  const [agents, setAgents] = useState<AutonomousAgent[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowOrchestration[]>([]);
  const [learningEvents, setLearningEvents] = useState<SelfLearningEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'agents' | 'workflows' | 'learning' | 'orchestration'>('agents');
  const [selectedAgent, setSelectedAgent] = useState<AutonomousAgent | null>(null);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);

  useEffect(() => {
    initializeAgents();
    loadWorkflows();
  }, []);

  const initializeAgents = () => {
    const initialAgents: AutonomousAgent[] = [
      {
        id: '1',
        name: 'Workflow Orchestrator Agent',
        type: 'workflow',
        capabilities: ['task-scheduling', 'resource-allocation', 'dependency-management', 'error-handling'],
        status: 'active',
        autonomy: 'fully-autonomous',
        performance: { efficiency: 0.94, accuracy: 0.91, adaptability: 0.88, uptime: 0.997 },
        tasksCompleted: 1247,
        lastActive: new Date(Date.now() - 300000),
        learningRate: 0.02
      },
      {
        id: '2',
        name: 'Decision Support Agent',
        type: 'decision',
        capabilities: ['data-analysis', 'risk-assessment', 'recommendation-generation', 'scenario-planning'],
        status: 'active',
        autonomy: 'semi-autonomous',
        performance: { efficiency: 0.89, accuracy: 0.93, adaptability: 0.95, uptime: 0.994 },
        tasksCompleted: 892,
        lastActive: new Date(Date.now() - 600000),
        learningRate: 0.015
      },
      {
        id: '3',
        name: 'Security Monitoring Agent',
        type: 'security',
        capabilities: ['threat-detection', 'anomaly-analysis', 'incident-response', 'compliance-monitoring'],
        status: 'active',
        autonomy: 'fully-autonomous',
        performance: { efficiency: 0.96, accuracy: 0.98, adaptability: 0.92, uptime: 0.999 },
        tasksCompleted: 2156,
        lastActive: new Date(Date.now() - 120000),
        learningRate: 0.01
      },
      {
        id: '4',
        name: 'Optimization Agent',
        type: 'optimization',
        capabilities: ['resource-optimization', 'process-improvement', 'cost-reduction', 'performance-tuning'],
        status: 'learning',
        autonomy: 'semi-autonomous',
        performance: { efficiency: 0.87, accuracy: 0.85, adaptability: 0.96, uptime: 0.989 },
        tasksCompleted: 634,
        lastActive: new Date(Date.now() - 1800000),
        learningRate: 0.025
      },
      {
        id: '5',
        name: 'Learning Adaptation Agent',
        type: 'monitoring',
        capabilities: ['performance-monitoring', 'self-improvement', 'capability-expansion', 'knowledge-acquisition'],
        status: 'active',
        autonomy: 'fully-autonomous',
        performance: { efficiency: 0.91, accuracy: 0.89, adaptability: 0.99, uptime: 0.995 },
        tasksCompleted: 445,
        lastActive: new Date(Date.now() - 900000),
        learningRate: 0.03
      }
    ];

    setAgents(initialAgents);
  };

  const loadWorkflows = () => {
    const initialWorkflows: WorkflowOrchestration[] = [
      {
        id: '1',
        name: 'Monthly Financial Report Generation',
        description: 'Automated end-to-end financial reporting workflow',
        agents: ['1', '2', '4'],
        status: 'running',
        progress: 65,
        startTime: new Date(Date.now() - 3600000),
        estimatedCompletion: new Date(Date.now() + 1800000),
        currentStep: 'Data Aggregation',
        steps: [
          { id: 'step-1', name: 'Data Collection', agent: '2', status: 'completed', duration: 450000 },
          { id: 'step-2', name: 'Data Validation', agent: '3', status: 'completed', duration: 180000 },
          { id: 'step-3', name: 'Data Aggregation', agent: '1', status: 'running' },
          { id: 'step-4', name: 'Report Generation', agent: '4', status: 'pending' },
          { id: 'step-5', name: 'Quality Assurance', agent: '2', status: 'pending' }
        ]
      },
      {
        id: '2',
        name: 'Real-time Security Monitoring',
        description: 'Continuous security threat detection and response',
        agents: ['3', '5'],
        status: 'running',
        progress: 100,
        startTime: new Date(Date.now() - 86400000),
        currentStep: 'Continuous Monitoring',
        steps: [
          { id: 'sec-1', name: 'Threat Detection', agent: '3', status: 'completed', duration: 30000 },
          { id: 'sec-2', name: 'Risk Assessment', agent: '5', status: 'completed', duration: 45000 },
          { id: 'sec-3', name: 'Continuous Monitoring', agent: '3', status: 'running' }
        ]
      }
    ];

    setWorkflows(initialWorkflows);
  };

  const createWorkflow = async (name: string, description: string, agents: string[]) => {
    setIsCreatingWorkflow(true);
    try {
      // Simulate workflow creation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newWorkflow: WorkflowOrchestration = {
        id: Date.now().toString(),
        name,
        description,
        agents,
        status: 'running',
        progress: 0,
        startTime: new Date(),
        currentStep: 'Initialization',
        steps: agents.map((agentId, index) => ({
          id: `step-${index + 1}`,
          name: `Task ${index + 1}`,
          agent: agentId,
          status: index === 0 ? 'running' : 'pending'
        }))
      };

      setWorkflows(prev => [newWorkflow, ...prev]);

      // Simulate workflow progression
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          setWorkflows(prev => prev.map(w =>
            w.id === newWorkflow.id ? {
              ...w,
              status: 'completed',
              progress: 100,
              estimatedCompletion: new Date()
            } : w
          ));

          if (onWorkflowComplete) {
            onWorkflowComplete(newWorkflow);
          }
        } else {
          setWorkflows(prev => prev.map(w =>
            w.id === newWorkflow.id ? { ...w, progress: Math.round(progress) } : w
          ));
        }
      }, 2000);

    } catch (error) {
      console.error('Workflow creation failed:', error);
    } finally {
      setIsCreatingWorkflow(false);
    }
  };

  const triggerAgentLearning = async (agentId: string) => {
    try {
      // Simulate agent learning
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newCapability = ['predictive-analytics', 'advanced-optimization', 'real-time-adaptation', 'collaborative-learning'][Math.floor(Math.random() * 4)];

      const learningEvent: SelfLearningEvent = {
        id: Date.now().toString(),
        agentId,
        timestamp: new Date(),
        eventType: 'discovery',
        description: `Agent discovered new capability: ${newCapability}`,
        impact: Math.random() * 0.3 + 0.1,
        newCapability
      };

      setLearningEvents(prev => [learningEvent, ...prev]);

      // Update agent capabilities
      setAgents(prev => prev.map(agent =>
        agent.id === agentId ? {
          ...agent,
          capabilities: [...agent.capabilities, newCapability],
          performance: {
            ...agent.performance,
            adaptability: Math.min(1, agent.performance.adaptability + learningEvent.impact)
          },
          lastActive: new Date()
        } : agent
      ));

      if (onAgentLearning) {
        onAgentLearning(learningEvent);
      }

    } catch (error) {
      console.error('Agent learning failed:', error);
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-blue-500';
      case 'learning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAutonomyColor = (autonomy: string) => {
    switch (autonomy) {
      case 'supervised': return 'bg-red-100 text-red-800';
      case 'semi-autonomous': return 'bg-yellow-100 text-yellow-800';
      case 'fully-autonomous': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" />
            Autonomous Systems Platform
          </h2>
          <p className="text-gray-600 mt-1">Self-learning autonomous agents for enterprise workflow orchestration</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Systems Status: Operational
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {agents.filter(a => a.status === 'active').length} Active Agents
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Learning
          </TabsTrigger>
          <TabsTrigger value="orchestration" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Orchestration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          {/* Agent Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getAgentStatusColor(agent.status)}>
                          {agent.status}
                        </Badge>
                        <Badge className={getAutonomyColor(agent.autonomy)}>
                          {agent.autonomy}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Capabilities</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 3).map((cap, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                        {agent.capabilities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.capabilities.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Efficiency</p>
                        <p className="font-semibold">{(agent.performance.efficiency * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Accuracy</p>
                        <p className="font-semibold">{(agent.performance.accuracy * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tasks Done</p>
                        <p className="font-semibold">{agent.tasksCompleted}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Learning Rate</p>
                        <p className="font-semibold">{agent.learningRate.toFixed(3)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedAgent(agent)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Configure
                      </Button>
                      <Button
                        onClick={() => triggerAgentLearning(agent.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={agent.status === 'learning'}
                      >
                        {agent.status === 'learning' ? 'Learning...' : 'Trigger Learning'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          {/* Workflow Creation */}
          <Card>
            <CardHeader>
              <CardTitle>Create Autonomous Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Monthly Report Generation"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      placeholder="Brief description of the workflow"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Agents</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {agents.map((agent) => (
                      <label key={agent.id} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{agent.name.split(' ')[0]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => createWorkflow('Custom Workflow', 'User-defined autonomous workflow', ['1', '2'])}
                  disabled={isCreatingWorkflow}
                  className="w-full flex items-center gap-2"
                >
                  {isCreatingWorkflow ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Workflow...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Create Workflow
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Workflows */}
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold">{workflow.name}</h4>
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                    </div>
                    <Badge className={getWorkflowStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-600">{workflow.progress}%</span>
                    </div>
                    <Progress value={workflow.progress} className="w-full" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-600">Agents</p>
                      <p className="font-semibold">{workflow.agents.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Steps</p>
                      <p className="font-semibold">{workflow.steps.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Current Step</p>
                      <p className="font-semibold">{workflow.currentStep}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Started</p>
                      <p className="font-semibold">{workflow.startTime.toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Workflow Steps</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {workflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-2 p-2 border rounded text-xs">
                          <div className={`w-2 h-2 rounded-full ${
                            step.status === 'completed' ? 'bg-green-500' :
                            step.status === 'running' ? 'bg-blue-500' :
                            step.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
                          }`} />
                          <span className="truncate">{step.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          {/* Agent Learning Events */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Learning Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{learningEvents.length}</p>
                    <p className="text-sm text-gray-600">Learning Events</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {learningEvents.filter(e => e.eventType === 'success').length}
                    </p>
                    <p className="text-sm text-gray-600">Success Events</p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">
                      {learningEvents.filter(e => e.newCapability).length}
                    </p>
                    <p className="text-sm text-gray-600">New Capabilities</p>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600">
                      {(learningEvents.reduce((sum, e) => sum + e.impact, 0) / Math.max(learningEvents.length, 1) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Avg Impact</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Events Timeline */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Learning Events Timeline</h3>
              {learningEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium capitalize">{event.eventType}</p>
                        <p className="text-sm text-gray-600">
                          Agent: {agents.find(a => a.id === event.agentId)?.name || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          event.eventType === 'success' ? 'success' :
                          event.eventType === 'discovery' ? 'default' :
                          event.eventType === 'adaptation' ? 'secondary' : 'destructive'
                        }>
                          {event.eventType}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">{event.description}</p>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Impact: {(event.impact * 100).toFixed(1)}%</span>
                      {event.newCapability && (
                        <Badge variant="outline">
                          New: {event.newCapability}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orchestration" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Orchestration Center</h3>
              <p className="text-gray-600 mb-4">
                Centralized control and monitoring of all autonomous systems and workflows.
                Real-time orchestration of complex enterprise processes.
              </p>
              <Button>Access Orchestration Dashboard</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Agent Configuration Modal */}
      {selectedAgent && (
        <Card className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{selectedAgent.name}</CardTitle>
                        <Badge className={`${getAutonomyColor(selectedAgent.autonomy)} mt-2`}>
                    {selectedAgent.autonomy}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAgent(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selectedAgent.performance).map(([metric, value]) => (
                  <div key={metric} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{(value * 100).toFixed(1)}%</p>
                    <p className="text-sm text-gray-600 capitalize">{metric.replace('-', ' ')}</p>
                  </div>
                ))}
              </div>

              {/* Capabilities */}
              <div>
                <h4 className="font-semibold mb-3">Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.capabilities.map((capability, index) => (
                    <Badge key={index} variant="outline">
                      {capability.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Configuration Options */}
              <div>
                <h4 className="font-semibold mb-3">Configuration</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Autonomy Level</span>
                    <select
                      value={selectedAgent.autonomy}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="supervised">Supervised</option>
                      <option value="semi-autonomous">Semi-Autonomous</option>
                      <option value="fully-autonomous">Fully Autonomous</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Learning Rate</span>
                    <input
                      type="range"
                      min="0.001"
                      max="0.1"
                      step="0.001"
                      value={selectedAgent.learningRate}
                      className="w-24"
                    />
                    <span className="text-sm ml-2">{selectedAgent.learningRate.toFixed(3)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1">Save Configuration</Button>
                <Button variant="outline" className="flex-1">Reset to Default</Button>
                <Button variant="outline" className="flex-1">View Logs</Button>
              </div>
            </CardContent>
          </Card>
        </Card>
      )}
    </div>
  );
};

export default AutonomousSystems;