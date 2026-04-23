"use client";

import { useState } from 'react';
import { AdvancedAIModels } from '@/features/advanced-ai-models';
import { AITrainingInfrastructure } from '@/features/ai-training-infrastructure';
import { MLModelServing } from '@/features/ml-model-serving';
import { IntelligentAutomation } from '@/features/intelligent-automation';
import { AIGovernance } from '@/features/ai-governance';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Brain, Cpu, Globe, Bot, Shield, Eye, Zap, TrendingUp, Activity, Target } from 'lucide-react';

const aiModules = [
  {
    id: 'models',
    name: 'AI Models',
    description: 'Advanced model management, deployment, and versioning capabilities',
    icon: Brain,
    component: AdvancedAIModels,
    features: ['Model Management', 'Version Control', 'Performance Monitoring', 'Auto-scaling']
  },
  {
    id: 'training',
    name: 'Training Infrastructure',
    description: 'Distributed training pipelines with optimization and scaling',
    icon: Cpu,
    component: AITrainingInfrastructure,
    features: ['Distributed Training', 'Pipeline Orchestration', 'Resource Optimization', 'Model Optimization']
  },
  {
    id: 'serving',
    name: 'Model Serving',
    description: 'High-performance inference APIs with monitoring and scaling',
    icon: Globe,
    component: MLModelServing,
    features: ['Inference APIs', 'Auto-scaling', 'Performance Monitoring', 'A/B Testing']
  },
  {
    id: 'automation',
    name: 'Intelligent Automation',
    description: 'AI-driven workflows with automated decision-making',
    icon: Bot,
    component: IntelligentAutomation,
    features: ['AI Workflows', 'Decision Automation', 'Process Mining', 'Learning Models']
  },
  {
    id: 'governance',
    name: 'AI Governance',
    description: 'Ethics, compliance, bias detection, and audit trails',
    icon: Shield,
    component: AIGovernance,
    features: ['Bias Detection', 'Ethics Reviews', 'Compliance Monitoring', 'Audit Trails']
  }
];

export default function AIMLDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'training' | 'serving' | 'automation' | 'governance'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Brain className="h-8 w-8 text-purple-600" />
                AI/ML Platform
              </h1>
              <p className="text-gray-600 mt-1">Comprehensive artificial intelligence and machine learning infrastructure</p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Model Monitor
              </Button>
              <Button size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Train Model
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Models
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Training
            </TabsTrigger>
            <TabsTrigger value="serving" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Serving
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Governance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* AI Platform Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Models</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-xs text-muted-foreground">+5 from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Training Jobs</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">12 running, 11 completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inference APIs</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">98.7% uptime</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Decisions</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">892K</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Module Overview */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">AI/ML Platform Modules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiModules.map(module => {
                  const IconComponent = module.icon;
                  return (
                    <Card key={module.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab(module.id as any)}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <IconComponent className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{module.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {module.features.map(feature => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <Button className="w-full" variant="outline">
                          Access Module
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Recent AI Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent AI/ML Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New fraud detection model deployed with 96.1% accuracy</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    <Badge variant="secondary">Model Deployment</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Training pipeline completed for customer churn predictor</p>
                      <p className="text-xs text-muted-foreground">4 hours ago</p>
                    </div>
                    <Badge variant="secondary">Training</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">AI governance review completed for new recommendation system</p>
                      <p className="text-xs text-muted-foreground">6 hours ago</p>
                    </div>
                    <Badge variant="secondary">Governance</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Automated workflow executed 1,247 customer support interactions</p>
                      <p className="text-xs text-muted-foreground">8 hours ago</p>
                    </div>
                    <Badge variant="secondary">Automation</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Module Tabs */}
          <TabsContent value="models" className="space-y-6">
            <AdvancedAIModels />
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <AITrainingInfrastructure />
          </TabsContent>

          <TabsContent value="serving" className="space-y-6">
            <MLModelServing />
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <IntelligentAutomation />
          </TabsContent>

          <TabsContent value="governance" className="space-y-6">
            <AIGovernance />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}