"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Brain, Eye, MessageSquare, Zap, Target, Lightbulb, Network, Cpu } from 'lucide-react';

interface ReasoningContext {
  domain: string;
  context: any;
  constraints: any[];
  goals: string[];
  previousDecisions: Decision[];
}

interface Decision {
  id: string;
  timestamp: Date;
  context: ReasoningContext;
  reasoning: string;
  confidence: number;
  alternatives: AlternativeDecision[];
  outcome?: any;
  feedback?: number;
}

interface AlternativeDecision {
  id: string;
  description: string;
  reasoning: string;
  probability: number;
  expectedUtility: number;
}

interface Perception {
  modality: 'vision' | 'text' | 'audio' | 'data' | 'environmental';
  data: any;
  confidence: number;
  timestamp: Date;
  metadata: any;
}

interface ReasoningEngine {
  id: string;
  name: string;
  capabilities: string[];
  performance: {
    accuracy: number;
    speed: number;
    adaptability: number;
  };
  status: 'active' | 'training' | 'error';
  lastUpdated: Date;
}

interface AGICoreProps {
  tenantId?: string;
  onDecision?: (decision: Decision) => void;
  onPerception?: (perception: Perception) => void;
  onReasoningUpdate?: (reasoning: any) => void;
}

const AGICore: React.FC<AGICoreProps> = ({
  tenantId = 'default',
  onDecision,
  onPerception,
  onReasoningUpdate
}) => {
  const [reasoningEngines, setReasoningEngines] = useState<ReasoningEngine[]>([]);
  const [activeReasoning, setActiveReasoning] = useState<string | null>(null);
  const [currentContext, setCurrentContext] = useState<ReasoningContext | null>(null);
  const [perceptions, setPerceptions] = useState<Perception[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [activeTab, setActiveTab] = useState<'reasoning' | 'perception' | 'decisions' | 'learning'>('reasoning');
  const [isReasoning, setIsReasoning] = useState(false);

  useEffect(() => {
    initializeAGI();
  }, []);

  const initializeAGI = () => {
    const engines: ReasoningEngine[] = [
      {
        id: '1',
        name: 'Multi-Modal Reasoning Engine',
        capabilities: ['vision', 'text', 'cross-modal', 'context-awareness'],
        performance: { accuracy: 0.94, speed: 0.8, adaptability: 0.91 },
        status: 'active',
        lastUpdated: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        name: 'Strategic Decision Engine',
        capabilities: ['planning', 'optimization', 'risk-assessment', 'long-term-planning'],
        performance: { accuracy: 0.89, speed: 0.6, adaptability: 0.95 },
        status: 'active',
        lastUpdated: new Date(Date.now() - 7200000)
      },
      {
        id: '3',
        name: 'Ethical Reasoning Engine',
        capabilities: ['moral-reasoning', 'value-alignment', 'impact-assessment', 'bias-detection'],
        performance: { accuracy: 0.96, speed: 0.7, adaptability: 0.88 },
        status: 'training',
        lastUpdated: new Date(Date.now() - 1800000)
      },
      {
        id: '4',
        name: 'Quantum-Enhanced Reasoning',
        capabilities: ['quantum-computation', 'parallel-reasoning', 'complex-optimization'],
        performance: { accuracy: 0.98, speed: 0.9, adaptability: 0.93 },
        status: 'active',
        lastUpdated: new Date(Date.now() - 900000)
      }
    ];

    setReasoningEngines(engines);
  };

  const startReasoning = async (context: ReasoningContext) => {
    setIsReasoning(true);
    setCurrentContext(context);
    setActiveReasoning('1'); // Start with multi-modal engine

    try {
      // Simulate AGI reasoning process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate decision based on context
      const decision: Decision = {
        id: Date.now().toString(),
        timestamp: new Date(),
        context,
        reasoning: `Analyzed ${context.domain} context with ${context.goals.length} goals and ${context.constraints.length} constraints. Determined optimal path considering ${context.previousDecisions.length} historical decisions.`,
        confidence: 0.87,
        alternatives: [
          {
            id: 'alt-1',
            description: 'Conservative approach with minimal risk',
            reasoning: 'Prioritizes stability and proven methods',
            probability: 0.3,
            expectedUtility: 0.7
          },
          {
            id: 'alt-2',
            description: 'Balanced approach with moderate innovation',
            reasoning: 'Combines proven methods with calculated risks',
            probability: 0.5,
            expectedUtility: 0.85
          },
          {
            id: 'alt-3',
            description: 'Aggressive innovation approach',
            reasoning: 'Maximizes potential gains with higher risk tolerance',
            probability: 0.2,
            expectedUtility: 0.95
          }
        ],
        outcome: { decision: 'balanced-approach', reasoning: 'Optimal balance of risk and reward' }
      };

      setDecisions(prev => [decision, ...prev]);
      setActiveReasoning(null);

      if (onDecision) {
        onDecision(decision);
      }

      if (onReasoningUpdate) {
        onReasoningUpdate({
          context,
          decision,
          engines: reasoningEngines.filter(e => e.status === 'active')
        });
      }

    } catch (error) {
      console.error('AGI reasoning failed:', error);
      setActiveReasoning(null);
    } finally {
      setIsReasoning(false);
    }
  };

  const processPerception = async (perception: Omit<Perception, 'timestamp'>) => {
    const fullPerception: Perception = {
      ...perception,
      timestamp: new Date()
    };

    setPerceptions(prev => [fullPerception, ...prev.slice(0, 49)]); // Keep last 50 perceptions

    if (onPerception) {
      onPerception(fullPerception);
    }

    // Trigger reasoning if perception indicates need for decision
    if (perception.confidence > 0.8 && currentContext) {
      await startReasoning({
        ...currentContext,
        context: { ...currentContext.context, latestPerception: perception }
      });
    }
  };

  const learnFromFeedback = async (decisionId: string, feedback: number) => {
    const decision = decisions.find(d => d.id === decisionId);
    if (!decision) return;

    // Update decision with feedback
    setDecisions(prev => prev.map(d =>
      d.id === decisionId ? { ...d, feedback } : d
    ));

    // Update engine performance based on feedback
    setReasoningEngines(prev => prev.map(engine => {
      if (engine.status === 'active') {
        return {
          ...engine,
          performance: {
            ...engine.performance,
            accuracy: Math.min(1, engine.performance.accuracy + (feedback > 0.8 ? 0.01 : feedback < 0.2 ? -0.01 : 0))
          },
          lastUpdated: new Date()
        };
      }
      return engine;
    }));
  };

  const getEngineStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'training': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AGI Core Reasoning Engine
          </h2>
          <p className="text-gray-600 mt-1">Artificial General Intelligence with autonomous reasoning and decision making</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            AGI Status: Active
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {reasoningEngines.filter(e => e.status === 'active').length} Active Engines
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reasoning" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Reasoning
          </TabsTrigger>
          <TabsTrigger value="perception" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Perception
          </TabsTrigger>
          <TabsTrigger value="decisions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Decisions
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Learning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reasoning" className="space-y-6">
          {/* Reasoning Engines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reasoningEngines.map((engine) => (
              <Card key={engine.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{engine.name}</CardTitle>
                      <Badge className={`${getEngineStatusColor(engine.status)} text-white mt-2`}>
                        {engine.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Capabilities</p>
                      <div className="flex flex-wrap gap-1">
                        {engine.capabilities.map((cap, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Accuracy</p>
                        <p className="font-semibold">{(engine.performance.accuracy * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Speed</p>
                        <p className="font-semibold">{engine.performance.speed.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Adaptability</p>
                        <p className="font-semibold">{(engine.performance.adaptability * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={engine.status !== 'active'}
                      >
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={engine.status === 'training'}
                      >
                        {engine.status === 'training' ? 'Training...' : 'Retrain'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reasoning Control */}
          <Card>
            <CardHeader>
              <CardTitle>Start AGI Reasoning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={() => startReasoning({
                    domain: 'enterprise-optimization',
                    context: { currentMetrics: {}, marketConditions: {} },
                    constraints: ['budget-limits', 'regulatory-compliance'],
                    goals: ['maximize-efficiency', 'minimize-risk', 'optimize-resources'],
                    previousDecisions: decisions.slice(0, 5)
                  })}
                  disabled={isReasoning}
                  className="w-full flex items-center gap-2"
                >
                  {isReasoning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Reasoning in Progress...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Initiate AGI Reasoning
                    </>
                  )}
                </Button>

                {isReasoning && (
                  <div className="space-y-2">
                    <Progress value={75} className="w-full" />
                    <p className="text-sm text-gray-600 text-center">
                      AGI is analyzing context, evaluating options, and making autonomous decisions...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perception" className="space-y-6">
          {/* Perception Processing */}
          <Card>
            <CardHeader>
              <CardTitle>Multi-Modal Perception</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Button
                  onClick={() => processPerception({
                    modality: 'vision',
                    data: 'image-analysis-result',
                    confidence: 0.92,
                    metadata: { resolution: '4K', objects: 15 }
                  })}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Process Vision
                </Button>
                <Button
                  onClick={() => processPerception({
                    modality: 'text',
                    data: 'text-analysis-result',
                    confidence: 0.88,
                    metadata: { language: 'en', sentiment: 'positive' }
                  })}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Process Text
                </Button>
                <Button
                  onClick={() => processPerception({
                    modality: 'data',
                    data: 'metrics-analysis',
                    confidence: 0.95,
                    metadata: { dataPoints: 1000, anomalies: 3 }
                  })}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  Process Data
                </Button>
                <Button
                  onClick={() => processPerception({
                    modality: 'environmental',
                    data: 'system-status',
                    confidence: 0.91,
                    metadata: { sensors: 25, alerts: 2 }
                  })}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Network className="h-4 w-4" />
                  Process Environment
                </Button>
              </div>

              {/* Recent Perceptions */}
              <div className="space-y-3">
                <h4 className="font-semibold">Recent Perceptions</h4>
                {perceptions.slice(0, 5).map((perception) => (
                  <div key={perception.timestamp.getTime()} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium capitalize">{perception.modality}</p>
                      <p className="text-sm text-gray-600">
                        {perception.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={perception.confidence > 0.8 ? 'success' : 'secondary'}>
                        {(perception.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-6">
          {/* Decision History */}
          <div className="space-y-4">
            {decisions.map((decision) => (
              <Card key={decision.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold">{decision.context.domain}</h4>
                      <p className="text-sm text-gray-600">
                        {decision.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getConfidenceColor(decision.confidence)}>
                        {(decision.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                      {decision.feedback !== undefined && (
                        <Badge variant={decision.feedback > 0.8 ? 'success' : 'secondary'}>
                          Feedback: {(decision.feedback * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Reasoning</p>
                    <p className="text-sm">{decision.reasoning}</p>
                  </div>

                  {decision.outcome && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Outcome</p>
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <p className="text-sm text-green-800">{decision.outcome.reasoning}</p>
                        <p className="text-sm font-semibold text-green-900 mt-1">
                          Decision: {decision.outcome.decision}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {decision.alternatives.slice(0, 3).map((alt) => (
                      <div key={alt.id} className="p-3 border rounded text-xs">
                        <p className="font-medium">{alt.description}</p>
                        <p className="text-gray-600 mt-1">Probability: {(alt.probability * 100).toFixed(0)}%</p>
                        <p className="text-gray-600">Utility: {alt.expectedUtility.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {decision.feedback === undefined && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => learnFromFeedback(decision.id, 0.9)}
                        size="sm"
                        variant="outline"
                        className="text-green-600"
                      >
                        👍 Good Decision
                      </Button>
                      <Button
                        onClick={() => learnFromFeedback(decision.id, 0.3)}
                        size="sm"
                        variant="outline"
                        className="text-yellow-600"
                      >
                        🤔 Needs Improvement
                      </Button>
                      <Button
                        onClick={() => learnFromFeedback(decision.id, 0.1)}
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                      >
                        👎 Poor Decision
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AGI Learning & Adaptation</h3>
              <p className="text-gray-600 mb-4">
                Continuous learning from feedback, experience, and environmental changes.
                The AGI system adapts its reasoning patterns and decision-making strategies over time.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{decisions.length}</p>
                  <p className="text-sm text-gray-600">Decisions Made</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {decisions.filter(d => d.feedback && d.feedback > 0.8).length}
                  </p>
                  <p className="text-sm text-gray-600">Positive Feedback</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {((decisions.filter(d => d.feedback && d.feedback > 0.8).length / Math.max(decisions.length, 1)) * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AGICore;