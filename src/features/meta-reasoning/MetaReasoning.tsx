"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Brain, Cog, TrendingUp, Zap, Target, Activity, Settings, Lightbulb } from 'lucide-react';

interface MetaCognitiveProcess {
  id: string;
  name: string;
  type: 'reasoning' | 'learning' | 'optimization' | 'reflection' | 'planning';
  capabilities: string[];
  confidence: number;
  accuracy: number;
  processingSpeed: number;
  lastExecution: Date;
  improvementRate: number;
}

interface ReasoningPattern {
  id: string;
  pattern: string;
  confidence: number;
  applications: number;
  successRate: number;
  lastUsed: Date;
  metaInsights: string[];
}

interface SelfImprovementEvent {
  id: string;
  timestamp: Date;
  processId: string;
  improvementType: 'efficiency' | 'accuracy' | 'adaptability' | 'creativity';
  impact: number;
  description: string;
  newCapability?: string;
}

interface CognitiveArchitecture {
  id: string;
  name: string;
  layers: string[];
  connections: number;
  performance: {
    processingPower: number;
    memoryEfficiency: number;
    adaptability: number;
    scalability: number;
  };
  optimizationLevel: number;
  lastOptimized: Date;
}

interface MetaReasoningProps {
  tenantId?: string;
  onSelfImprovement?: (event: SelfImprovementEvent) => void;
  onArchitectureOptimization?: (architecture: CognitiveArchitecture) => void;
}

const MetaReasoning: React.FC<MetaReasoningProps> = ({
  tenantId = 'default',
  onSelfImprovement,
  onArchitectureOptimization
}) => {
  const [processes, setProcesses] = useState<MetaCognitiveProcess[]>([]);
  const [patterns, setPatterns] = useState<ReasoningPattern[]>([]);
  const [improvementEvents, setImprovementEvents] = useState<SelfImprovementEvent[]>([]);
  const [architectures, setArchitectures] = useState<CognitiveArchitecture[]>([]);
  const [activeTab, setActiveTab] = useState<'processes' | 'patterns' | 'architecture' | 'improvement'>('processes');
  const [selectedProcess, setSelectedProcess] = useState<MetaCognitiveProcess | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    initializeMetaProcesses();
    loadReasoningPatterns();
    initializeArchitectures();
  }, []);

  const initializeMetaProcesses = () => {
    const initialProcesses: MetaCognitiveProcess[] = [
      {
        id: '1',
        name: 'Meta-Reasoning Engine',
        type: 'reasoning',
        capabilities: ['self-analysis', 'reasoning-about-reasoning', 'cognitive-monitoring', 'strategy-optimization'],
        confidence: 0.94,
        accuracy: 0.91,
        processingSpeed: 0.87,
        lastExecution: new Date(Date.now() - 300000),
        improvementRate: 0.023
      },
      {
        id: '2',
        name: 'Cognitive Learning Optimizer',
        type: 'learning',
        capabilities: ['meta-learning', 'skill-acquisition', 'knowledge-integration', 'learning-strategy-adaptation'],
        confidence: 0.89,
        accuracy: 0.95,
        processingSpeed: 0.92,
        lastExecution: new Date(Date.now() - 600000),
        improvementRate: 0.028
      },
      {
        id: '3',
        name: 'Self-Improvement Controller',
        type: 'optimization',
        capabilities: ['performance-analysis', 'bottleneck-identification', 'resource-optimization', 'adaptive-improvement'],
        confidence: 0.96,
        accuracy: 0.88,
        processingSpeed: 0.94,
        lastExecution: new Date(Date.now() - 120000),
        improvementRate: 0.031
      },
      {
        id: '4',
        name: 'Cognitive Reflection System',
        type: 'reflection',
        capabilities: ['experience-analysis', 'pattern-recognition', 'insight-generation', 'decision-review'],
        confidence: 0.92,
        accuracy: 0.89,
        processingSpeed: 0.85,
        lastExecution: new Date(Date.now() - 1800000),
        improvementRate: 0.019
      },
      {
        id: '5',
        name: 'Strategic Planning Intelligence',
        type: 'planning',
        capabilities: ['goal-hierarchy-planning', 'resource-planning', 'risk-assessment-planning', 'adaptive-planning'],
        confidence: 0.91,
        accuracy: 0.93,
        processingSpeed: 0.89,
        lastExecution: new Date(Date.now() - 900000),
        improvementRate: 0.025
      }
    ];

    setProcesses(initialProcesses);
  };

  const loadReasoningPatterns = () => {
    const initialPatterns: ReasoningPattern[] = [
      {
        id: '1',
        pattern: 'Abductive Reasoning with Meta-Analysis',
        confidence: 0.87,
        applications: 245,
        successRate: 0.92,
        lastUsed: new Date(Date.now() - 450000),
        metaInsights: ['Combines pattern recognition with uncertainty quantification', 'Self-monitors reasoning confidence levels']
      },
      {
        id: '2',
        pattern: 'Recursive Self-Improvement Loop',
        confidence: 0.91,
        applications: 189,
        successRate: 0.89,
        lastUsed: new Date(Date.now() - 780000),
        metaInsights: ['Implements continuous learning cycles', 'Adapts improvement strategies based on performance feedback']
      },
      {
        id: '3',
        pattern: 'Multi-Layer Cognitive Architecture Optimization',
        confidence: 0.94,
        applications: 156,
        successRate: 0.95,
        lastUsed: new Date(Date.now() - 1200000),
        metaInsights: ['Optimizes cognitive layer interactions', 'Dynamically adjusts processing priorities']
      },
      {
        id: '4',
        pattern: 'Meta-Cognitive Decision Making Framework',
        confidence: 0.88,
        applications: 312,
        successRate: 0.87,
        lastUsed: new Date(Date.now() - 360000),
        metaInsights: ['Evaluates decision-making processes', 'Learns from decision outcomes for future optimization']
      }
    ];

    setPatterns(initialPatterns);
  };

  const initializeArchitectures = () => {
    const initialArchitectures: CognitiveArchitecture[] = [
      {
        id: '1',
        name: 'Primary Cognitive Architecture',
        layers: ['perception', 'reasoning', 'learning', 'planning', 'execution'],
        connections: 1247,
        performance: {
          processingPower: 0.94,
          memoryEfficiency: 0.89,
          adaptability: 0.92,
          scalability: 0.87
        },
        optimizationLevel: 0.91,
        lastOptimized: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        name: 'Meta-Cognitive Control System',
        layers: ['monitoring', 'analysis', 'optimization', 'reflection'],
        connections: 892,
        performance: {
          processingPower: 0.96,
          memoryEfficiency: 0.94,
          adaptability: 0.98,
          scalability: 0.91
        },
        optimizationLevel: 0.94,
        lastOptimized: new Date(Date.now() - 1800000)
      }
    ];

    setArchitectures(initialArchitectures);
  };

  const triggerSelfImprovement = async (processId: string) => {
    try {
      setIsOptimizing(true);
      await new Promise(resolve => setTimeout(resolve, 4000));

      const improvementTypes: ('efficiency' | 'accuracy' | 'adaptability' | 'creativity')[] =
        ['efficiency', 'accuracy', 'adaptability', 'creativity'];
      const improvementType = improvementTypes[Math.floor(Math.random() * improvementTypes.length)];

      const newCapability = [
        'advanced-meta-analysis', 'recursive-optimization', 'cognitive-load-balancing',
        'predictive-self-improvement', 'multi-modal-reasoning'
      ][Math.floor(Math.random() * 5)];

      const improvementEvent: SelfImprovementEvent = {
        id: Date.now().toString(),
        timestamp: new Date(),
        processId,
        improvementType,
        impact: Math.random() * 0.25 + 0.1,
        description: `Achieved ${improvementType} improvement through meta-cognitive optimization`,
        newCapability
      };

      setImprovementEvents(prev => [improvementEvent, ...prev]);

      // Update process capabilities
      setProcesses(prev => prev.map(process =>
        process.id === processId ? {
          ...process,
          capabilities: [...process.capabilities, newCapability],
          improvementRate: process.improvementRate + (improvementEvent.impact * 0.1),
          lastExecution: new Date()
        } : process
      ));

      if (onSelfImprovement) {
        onSelfImprovement(improvementEvent);
      }

    } catch (error) {
      console.error('Self-improvement failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const optimizeArchitecture = async (architectureId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 5000));

      setArchitectures(prev => prev.map(arch =>
        arch.id === architectureId ? {
          ...arch,
          connections: arch.connections + Math.floor(Math.random() * 50) + 10,
          performance: {
            processingPower: Math.min(1, arch.performance.processingPower + 0.02),
            memoryEfficiency: Math.min(1, arch.performance.memoryEfficiency + 0.015),
            adaptability: Math.min(1, arch.performance.adaptability + 0.025),
            scalability: Math.min(1, arch.performance.scalability + 0.018)
          },
          optimizationLevel: Math.min(1, arch.optimizationLevel + 0.03),
          lastOptimized: new Date()
        } : arch
      ));

      const optimizedArch = architectures.find(a => a.id === architectureId);
      if (optimizedArch && onArchitectureOptimization) {
        onArchitectureOptimization(optimizedArch);
      }

    } catch (error) {
      console.error('Architecture optimization failed:', error);
    }
  };

  const getProcessTypeColor = (type: string) => {
    switch (type) {
      case 'reasoning': return 'bg-blue-100 text-blue-800';
      case 'learning': return 'bg-green-100 text-green-800';
      case 'optimization': return 'bg-purple-100 text-purple-800';
      case 'reflection': return 'bg-orange-100 text-orange-800';
      case 'planning': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Meta-Reasoning Intelligence
          </h2>
          <p className="text-gray-600 mt-1">Self-aware cognitive systems with continuous self-improvement capabilities</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Meta-Cognitive Status: Active
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {processes.length} Meta Processes
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="processes" className="flex items-center gap-2">
            <Cog className="h-4 w-4" />
            Processes
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="architecture" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Architecture
          </TabsTrigger>
          <TabsTrigger value="improvement" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Improvement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="processes" className="space-y-6">
          {/* Meta-Cognitive Processes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {processes.map((process) => (
              <Card key={process.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{process.name}</CardTitle>
                      <Badge className={getProcessTypeColor(process.type)} className="mt-2">
                        {process.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${getConfidenceColor(process.confidence)}`}>
                        {(process.confidence * 100).toFixed(1)}% Confidence
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Capabilities</p>
                      <div className="flex flex-wrap gap-1">
                        {process.capabilities.slice(0, 3).map((cap, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cap.replace('-', ' ')}
                          </Badge>
                        ))}
                        {process.capabilities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{process.capabilities.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Accuracy</p>
                        <p className="font-semibold">{(process.accuracy * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Processing Speed</p>
                        <p className="font-semibold">{(process.processingSpeed * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Improvement Rate</p>
                        <p className="font-semibold">{process.improvementRate.toFixed(3)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedProcess(process)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Analyze
                      </Button>
                      <Button
                        onClick={() => triggerSelfImprovement(process.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={isOptimizing}
                      >
                        {isOptimizing ? 'Optimizing...' : 'Self-Improve'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          {/* Reasoning Patterns */}
          <div className="space-y-4">
            {patterns.map((pattern) => (
              <Card key={pattern.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold">{pattern.pattern}</h4>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getConfidenceColor(pattern.confidence)}>
                          {(pattern.confidence * 100).toFixed(1)}% Confidence
                        </Badge>
                        <Badge variant="outline">
                          {pattern.applications} Applications
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        {(pattern.successRate * 100).toFixed(1)}% Success Rate
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Meta-Insights</p>
                    <div className="space-y-1">
                      {pattern.metaInsights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          {/* Cognitive Architectures */}
          <div className="space-y-4">
            {architectures.map((arch) => (
              <Card key={arch.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{arch.name}</CardTitle>
                    <Badge variant="outline">
                      {arch.layers.length} Layers, {arch.connections} Connections
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Cognitive Layers</p>
                      <div className="flex flex-wrap gap-2">
                        {arch.layers.map((layer, index) => (
                          <Badge key={index} variant="secondary" className="capitalize">
                            {layer}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(arch.performance).map(([metric, value]) => (
                        <div key={metric} className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-lg font-bold text-blue-600">{(value * 100).toFixed(1)}%</p>
                          <p className="text-xs text-gray-600 capitalize">{metric.replace(/([A-Z])/g, ' $1')}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Optimization Level</p>
                        <Progress value={arch.optimizationLevel * 100} className="w-32 mt-1" />
                        <p className="text-xs text-gray-500 mt-1">{(arch.optimizationLevel * 100).toFixed(1)}%</p>
                      </div>
                      <Button
                        onClick={() => optimizeArchitecture(arch.id)}
                        variant="outline"
                        size="sm"
                      >
                        Optimize Architecture
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="improvement" className="space-y-6">
          {/* Self-Improvement Events */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Self-Improvement Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">{improvementEvents.length}</p>
                    <p className="text-sm text-gray-600">Improvement Events</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {improvementEvents.filter(e => e.improvementType === 'accuracy').length}
                    </p>
                    <p className="text-sm text-gray-600">Accuracy Improvements</p>
                  </div>

                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      {improvementEvents.filter(e => e.improvementType === 'efficiency').length}
                    </p>
                    <p className="text-sm text-gray-600">Efficiency Gains</p>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600">
                      {(improvementEvents.reduce((sum, e) => sum + e.impact, 0) / Math.max(improvementEvents.length, 1) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Avg Impact</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Improvement Events Timeline */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Improvement Events Timeline</h3>
              {improvementEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium capitalize">{event.improvementType} Improvement</p>
                        <p className="text-sm text-gray-600">
                          Process: {processes.find(p => p.id === event.processId)?.name || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="capitalize">
                          {event.improvementType}
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
                          New: {event.newCapability.replace('-', ' ')}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Process Analysis Modal */}
      {selectedProcess && (
        <Card className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{selectedProcess.name}</CardTitle>
                  <Badge className={getProcessTypeColor(selectedProcess.type)} className="mt-2">
                    {selectedProcess.type}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProcess(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{(selectedProcess.confidence * 100).toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Confidence</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{(selectedProcess.accuracy * 100).toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Accuracy</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{(selectedProcess.processingSpeed * 100).toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Processing Speed</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{selectedProcess.improvementRate.toFixed(3)}</p>
                  <p className="text-sm text-gray-600">Improvement Rate</p>
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <h4 className="font-semibold mb-3">Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProcess.capabilities.map((capability, index) => (
                    <Badge key={index} variant="outline">
                      {capability.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Meta-Analysis */}
              <div>
                <h4 className="font-semibold mb-3">Meta-Analysis</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Self-Monitoring:</strong> Continuous evaluation of reasoning processes</p>
                  <p><strong>Adaptive Learning:</strong> Dynamic adjustment of cognitive strategies</p>
                  <p><strong>Performance Optimization:</strong> Automated improvement of processing efficiency</p>
                  <p><strong>Knowledge Integration:</strong> Synthesis of insights across domains</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1">Run Meta-Analysis</Button>
                <Button variant="outline" className="flex-1">View Cognitive Logs</Button>
                <Button variant="outline" className="flex-1">Optimize Process</Button>
              </div>
            </CardContent>
          </Card>
        </Card>
      )}
    </div>
  );
};

export default MetaReasoning;