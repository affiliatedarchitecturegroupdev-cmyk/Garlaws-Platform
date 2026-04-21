"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Shield, Crown, TrendingUp, Target, Activity, Settings, Zap, Eye } from 'lucide-react';

interface AutonomousOperation {
  id: string;
  name: string;
  domain: 'financial' | 'operational' | 'strategic' | 'compliance' | 'risk';
  autonomy: 'supervised' | 'semi-autonomous' | 'fully-autonomous';
  status: 'active' | 'monitoring' | 'intervention' | 'paused';
  performance: {
    efficiency: number;
    accuracy: number;
    compliance: number;
    riskLevel: number;
  };
  decisionCount: number;
  interventionRate: number;
  lastDecision: Date;
}

interface GovernanceProtocol {
  id: string;
  name: string;
  type: 'ethical' | 'regulatory' | 'strategic' | 'operational';
  rules: string[];
  enforcement: 'strict' | 'adaptive' | 'permissive';
  compliance: number;
  violations: number;
  lastAudit: Date;
  active: boolean;
}

interface PredictiveModel {
  id: string;
  name: string;
  domain: string;
  accuracy: number;
  confidence: number;
  predictions: number;
  lastPrediction: Date;
  impact: number;
  active: boolean;
}

interface DecisionEvent {
  id: string;
  timestamp: Date;
  operationId: string;
  type: 'strategic' | 'operational' | 'compliance' | 'risk';
  confidence: number;
  impact: number;
  outcome: 'success' | 'failure' | 'pending';
  description: string;
  autonomous: boolean;
}

interface EnterpriseAutonomyProps {
  tenantId?: string;
  onDecisionMade?: (event: DecisionEvent) => void;
  onGovernanceUpdate?: (protocol: GovernanceProtocol) => void;
}

const EnterpriseAutonomy: React.FC<EnterpriseAutonomyProps> = ({
  tenantId = 'default',
  onDecisionMade,
  onGovernanceUpdate
}) => {
  const [operations, setOperations] = useState<AutonomousOperation[]>([]);
  const [protocols, setProtocols] = useState<GovernanceProtocol[]>([]);
  const [models, setModels] = useState<PredictiveModel[]>([]);
  const [decisionEvents, setDecisionEvents] = useState<DecisionEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'operations' | 'governance' | 'predictions' | 'decisions'>('operations');
  const [selectedOperation, setSelectedOperation] = useState<AutonomousOperation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    initializeAutonomousOperations();
    initializeGovernanceProtocols();
    initializePredictiveModels();
  }, []);

  const initializeAutonomousOperations = () => {
    const initialOperations: AutonomousOperation[] = [
      {
        id: '1',
        name: 'Financial Decision Engine',
        domain: 'financial',
        autonomy: 'fully-autonomous',
        status: 'active',
        performance: { efficiency: 0.96, accuracy: 0.94, compliance: 0.98, riskLevel: 0.02 },
        decisionCount: 1247,
        interventionRate: 0.02,
        lastDecision: new Date(Date.now() - 300000)
      },
      {
        id: '2',
        name: 'Operations Optimizer',
        domain: 'operational',
        autonomy: 'semi-autonomous',
        status: 'active',
        performance: { efficiency: 0.92, accuracy: 0.89, compliance: 0.95, riskLevel: 0.05 },
        decisionCount: 892,
        interventionRate: 0.08,
        lastDecision: new Date(Date.now() - 600000)
      },
      {
        id: '3',
        name: 'Strategic Planning AI',
        domain: 'strategic',
        autonomy: 'fully-autonomous',
        status: 'monitoring',
        performance: { efficiency: 0.94, accuracy: 0.91, compliance: 0.97, riskLevel: 0.03 },
        decisionCount: 456,
        interventionRate: 0.03,
        lastDecision: new Date(Date.now() - 120000)
      },
      {
        id: '4',
        name: 'Compliance Guardian',
        domain: 'compliance',
        autonomy: 'fully-autonomous',
        status: 'active',
        performance: { efficiency: 0.98, accuracy: 0.99, compliance: 1.00, riskLevel: 0.01 },
        decisionCount: 2156,
        interventionRate: 0.005,
        lastDecision: new Date(Date.now() - 1800000)
      },
      {
        id: '5',
        name: 'Risk Assessment System',
        domain: 'risk',
        autonomy: 'semi-autonomous',
        status: 'active',
        performance: { efficiency: 0.91, accuracy: 0.96, compliance: 0.94, riskLevel: 0.04 },
        decisionCount: 734,
        interventionRate: 0.12,
        lastDecision: new Date(Date.now() - 900000)
      }
    ];

    setOperations(initialOperations);
  };

  const initializeGovernanceProtocols = () => {
    const initialProtocols: GovernanceProtocol[] = [
      {
        id: '1',
        name: 'Ethical Decision Framework',
        type: 'ethical',
        rules: ['Maximize stakeholder value', 'Ensure fairness and equity', 'Maintain transparency', 'Respect privacy rights'],
        enforcement: 'strict',
        compliance: 0.98,
        violations: 2,
        lastAudit: new Date(Date.now() - 86400000),
        active: true
      },
      {
        id: '2',
        name: 'Regulatory Compliance Engine',
        type: 'regulatory',
        rules: ['GDPR compliance', 'SOX requirements', 'Industry standards', 'Local regulations'],
        enforcement: 'strict',
        compliance: 0.99,
        violations: 0,
        lastAudit: new Date(Date.now() - 43200000),
        active: true
      },
      {
        id: '3',
        name: 'Strategic Alignment Protocol',
        type: 'strategic',
        rules: ['Align with company vision', 'Optimize resource allocation', 'Maintain competitive advantage', 'Support long-term growth'],
        enforcement: 'adaptive',
        compliance: 0.95,
        violations: 5,
        lastAudit: new Date(Date.now() - 172800000),
        active: true
      },
      {
        id: '4',
        name: 'Operational Excellence Rules',
        type: 'operational',
        rules: ['Optimize processes', 'Minimize waste', 'Ensure quality standards', 'Maintain efficiency targets'],
        enforcement: 'adaptive',
        compliance: 0.92,
        violations: 8,
        lastAudit: new Date(Date.now() - 259200000),
        active: true
      }
    ];

    setProtocols(initialProtocols);
  };

  const initializePredictiveModels = () => {
    const initialModels: PredictiveModel[] = [
      {
        id: '1',
        name: 'Market Trend Predictor',
        domain: 'Financial Markets',
        accuracy: 0.87,
        confidence: 0.82,
        predictions: 1456,
        lastPrediction: new Date(Date.now() - 3600000),
        impact: 0.15,
        active: true
      },
      {
        id: '2',
        name: 'Risk Assessment Model',
        domain: 'Risk Management',
        accuracy: 0.94,
        confidence: 0.91,
        predictions: 892,
        lastPrediction: new Date(Date.now() - 7200000),
        impact: 0.08,
        active: true
      },
      {
        id: '3',
        name: 'Operational Efficiency Forecaster',
        domain: 'Operations',
        accuracy: 0.89,
        confidence: 0.85,
        predictions: 634,
        lastPrediction: new Date(Date.now() - 10800000),
        impact: 0.12,
        active: true
      },
      {
        id: '4',
        name: 'Strategic Opportunity Detector',
        domain: 'Strategy',
        accuracy: 0.76,
        confidence: 0.68,
        predictions: 234,
        lastPrediction: new Date(Date.now() - 21600000),
        impact: 0.22,
        active: true
      }
    ];

    setModels(initialModels);
  };

  const executeAutonomousDecision = async (operationId: string) => {
    try {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 2500));

      const decisionTypes: ('strategic' | 'operational' | 'compliance' | 'risk')[] =
        ['strategic', 'operational', 'compliance', 'risk'];
      const decisionType = decisionTypes[Math.floor(Math.random() * decisionTypes.length)];

      const decisionEvent: DecisionEvent = {
        id: Date.now().toString(),
        timestamp: new Date(),
        operationId,
        type: decisionType,
        confidence: Math.random() * 0.3 + 0.7,
        impact: Math.random() * 0.4 + 0.1,
        outcome: Math.random() > 0.1 ? 'success' : 'failure',
        description: `Autonomous ${decisionType} decision executed`,
        autonomous: true
      };

      setDecisionEvents(prev => [decisionEvent, ...prev]);

      // Update operation stats
      setOperations(prev => prev.map(op =>
        op.id === operationId ? {
          ...op,
          decisionCount: op.decisionCount + 1,
          lastDecision: new Date()
        } : op
      ));

      if (onDecisionMade) {
        onDecisionMade(decisionEvent);
      }

    } catch (error) {
      console.error('Decision execution failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const auditGovernanceProtocol = async (protocolId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      setProtocols(prev => prev.map(protocol =>
        protocol.id === protocolId ? {
          ...protocol,
          compliance: Math.min(1, protocol.compliance + 0.02),
          violations: Math.max(0, protocol.violations - Math.floor(Math.random() * 2)),
          lastAudit: new Date()
        } : protocol
      ));

      const auditedProtocol = protocols.find(p => p.id === protocolId);
      if (auditedProtocol && onGovernanceUpdate) {
        onGovernanceUpdate(auditedProtocol);
      }

    } catch (error) {
      console.error('Protocol audit failed:', error);
    }
  };

  const runPredictiveModel = async (modelId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 4000));

      setModels(prev => prev.map(model =>
        model.id === modelId ? {
          ...model,
          predictions: model.predictions + 1,
          lastPrediction: new Date(),
          accuracy: Math.min(1, model.accuracy + (Math.random() * 0.02 - 0.01))
        } : model
      ));

    } catch (error) {
      console.error('Prediction failed:', error);
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

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'financial': return 'bg-green-100 text-green-800';
      case 'operational': return 'bg-blue-100 text-blue-800';
      case 'strategic': return 'bg-purple-100 text-purple-800';
      case 'compliance': return 'bg-orange-100 text-orange-800';
      case 'risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'monitoring': return 'bg-yellow-500';
      case 'intervention': return 'bg-orange-500';
      case 'paused': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-600" />
            Enterprise Autonomy Platform
          </h2>
          <p className="text-gray-600 mt-1">Fully autonomous enterprise operations with predictive governance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            Autonomy Status: Operational
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {operations.filter(o => o.status === 'active').length} Active Operations
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="governance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Governance
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="decisions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Decisions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-6">
          {/* Autonomous Operations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {operations.map((operation) => (
              <Card key={operation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{operation.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getDomainColor(operation.domain)}>
                          {operation.domain}
                        </Badge>
                        <Badge className={getAutonomyColor(operation.autonomy)}>
                          {operation.autonomy}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(operation.status)}`}></div>
                      <span className="text-sm capitalize">{operation.status}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Efficiency</p>
                        <p className="font-semibold">{(operation.performance.efficiency * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Accuracy</p>
                        <p className="font-semibold">{(operation.performance.accuracy * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Compliance</p>
                        <p className="font-semibold">{(operation.performance.compliance * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Risk Level</p>
                        <p className="font-semibold">{(operation.performance.riskLevel * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Decisions: {operation.decisionCount}</span>
                      <span>Interventions: {(operation.interventionRate * 100).toFixed(1)}%</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedOperation(operation)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Monitor
                      </Button>
                      <Button
                        onClick={() => executeAutonomousDecision(operation.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={isProcessing || operation.status !== 'active'}
                      >
                        {isProcessing ? 'Processing...' : 'Execute Decision'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="governance" className="space-y-6">
          {/* Governance Protocols */}
          <div className="space-y-4">
            {protocols.map((protocol) => (
              <Card key={protocol.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold">{protocol.name}</h4>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="capitalize">
                          {protocol.type}
                        </Badge>
                        <Badge variant={protocol.enforcement === 'strict' ? 'destructive' : 'secondary'}>
                          {protocol.enforcement}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${protocol.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm">{protocol.active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Compliance Score</p>
                    <Progress value={protocol.compliance * 100} className="w-full" />
                    <p className="text-xs text-gray-500 mt-1">
                      {(protocol.compliance * 100).toFixed(1)}% Compliant • {protocol.violations} Violations
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Governance Rules</p>
                    <div className="space-y-1">
                      {protocol.rules.slice(0, 3).map((rule, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                          <span>{rule}</span>
                        </div>
                      ))}
                      {protocol.rules.length > 3 && (
                        <p className="text-sm text-gray-500">+{protocol.rules.length - 3} more rules</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-600">
                      Last Audit: {protocol.lastAudit.toLocaleDateString()}
                    </span>
                    <Button
                      onClick={() => auditGovernanceProtocol(protocol.id)}
                      variant="outline"
                      size="sm"
                    >
                      Run Audit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          {/* Predictive Models */}
          <div className="space-y-4">
            {models.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <Badge variant="outline">
                      {model.domain}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-lg font-bold text-blue-600">{(model.accuracy * 100).toFixed(1)}%</p>
                        <p className="text-xs text-gray-600">Accuracy</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-green-600">{(model.confidence * 100).toFixed(1)}%</p>
                        <p className="text-xs text-gray-600">Confidence</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-lg font-bold text-purple-600">{model.predictions}</p>
                        <p className="text-xs text-gray-600">Predictions</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-lg font-bold text-orange-600">{(model.impact * 100).toFixed(1)}%</p>
                        <p className="text-xs text-gray-600">Impact</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Last Prediction: {model.lastPrediction.toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${model.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm">{model.active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => runPredictiveModel(model.id)}
                      variant="outline"
                      className="w-full"
                      disabled={!model.active}
                    >
                      Generate Prediction
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-6">
          {/* Decision Events */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Autonomous Decision Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <Target className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-amber-600">{decisionEvents.length}</p>
                    <p className="text-sm text-gray-600">Total Decisions</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {decisionEvents.filter(e => e.outcome === 'success').length}
                    </p>
                    <p className="text-sm text-gray-600">Successful</p>
                  </div>

                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      {(decisionEvents.reduce((sum, e) => sum + e.confidence, 0) / Math.max(decisionEvents.length, 1) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Avg Confidence</p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">
                      {decisionEvents.filter(e => e.autonomous).length}
                    </p>
                    <p className="text-sm text-gray-600">Autonomous</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decision Events Timeline */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Decision Events Timeline</h3>
              {decisionEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium capitalize">{event.type} Decision</p>
                        <p className="text-sm text-gray-600">{event.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          event.outcome === 'success' ? 'default' :
                          event.outcome === 'failure' ? 'destructive' : 'secondary'
                        }>
                          {event.outcome}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Confidence: {(event.confidence * 100).toFixed(1)}%</span>
                      <span className="text-gray-600">Impact: {(event.impact * 100).toFixed(1)}%</span>
                      <span className="text-gray-600">{event.autonomous ? 'Autonomous' : 'Supervised'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Operation Monitoring Modal */}
      {selectedOperation && (
        <Card className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{selectedOperation.name}</CardTitle>
                  <Badge className={getDomainColor(selectedOperation.domain)} className="mt-2">
                    {selectedOperation.domain}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOperation(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selectedOperation.performance).map(([metric, value]) => (
                  <div key={metric} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{(value * 100).toFixed(1)}%</p>
                    <p className="text-sm text-gray-600 capitalize">{metric.replace(/([A-Z])/g, ' $1')}</p>
                  </div>
                ))}
              </div>

              {/* Operation Stats */}
              <div>
                <h4 className="font-semibold mb-3">Operation Statistics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Decisions</p>
                    <p className="font-semibold">{selectedOperation.decisionCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Intervention Rate</p>
                    <p className="font-semibold">{(selectedOperation.interventionRate * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Autonomy Level</p>
                    <p className="font-semibold capitalize">{selectedOperation.autonomy.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Decision</p>
                    <p className="font-semibold">{selectedOperation.lastDecision.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div>
                <h4 className="font-semibold mb-3">Current Status</h4>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedOperation.status)}`}></div>
                  <span className="text-sm capitalize">{selectedOperation.status}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1">Adjust Autonomy</Button>
                <Button variant="outline" className="flex-1">Override Decision</Button>
                <Button variant="outline" className="flex-1">View Decision Log</Button>
              </div>
            </CardContent>
          </Card>
        </Card>
      )}
    </div>
  );
};

export default EnterpriseAutonomy;