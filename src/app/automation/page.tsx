"use client";

import { useState } from 'react';
import { EnterpriseAutomationEngine } from '@/features/enterprise-automation-engine';
import { AdvancedWorkflowOrchestration } from '@/features/advanced-workflow-orchestration';
import { IntelligentDecisionEngine } from '@/features/intelligent-decision-engine';
import { ProcessMining } from '@/features/process-mining';
import { AutomatedReporting } from '@/features/automated-reporting';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Bot, GitBranch, Brain, Search, FileText, Settings, Activity, Zap } from 'lucide-react';

const automationModules = [
  {
    id: 'engine',
    name: 'Automation Engine',
    description: 'Comprehensive workflow management and intelligent process automation',
    icon: Bot,
    component: EnterpriseAutomationEngine,
    features: ['Workflow Management', 'Process Automation', 'Rule Engine', 'System Monitoring']
  },
  {
    id: 'orchestration',
    name: 'Workflow Orchestration',
    description: 'Visual workflow designer with cross-system integration',
    icon: GitBranch,
    component: AdvancedWorkflowOrchestration,
    features: ['Visual Designer', 'Cross-System Integration', 'Workflow Templates', 'Real-time Monitoring']
  },
  {
    id: 'decisions',
    name: 'Intelligent Decisions',
    description: 'AI-powered decision systems with automated recommendations',
    icon: Brain,
    component: IntelligentDecisionEngine,
    features: ['Decision Rules', 'AI Recommendations', 'Risk Assessment', 'Automated Actions']
  },
  {
    id: 'mining',
    name: 'Process Mining',
    description: 'Discover, analyze, and optimize business processes',
    icon: Search,
    component: ProcessMining,
    features: ['Process Discovery', 'Performance Analysis', 'Bottleneck Detection', 'Optimization Insights']
  },
  {
    id: 'reporting',
    name: 'Automated Reporting',
    description: 'Intelligent report generation and automated distribution',
    icon: FileText,
    component: AutomatedReporting,
    features: ['Report Templates', 'Automated Scheduling', 'Multi-format Support', 'Smart Distribution']
  }
];

export default function AutomationDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'engine' | 'orchestration' | 'decisions' | 'mining' | 'reporting'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="h-8 w-8 text-blue-600" />
                Enterprise Automation & Orchestration
              </h1>
              <p className="text-gray-600 mt-1">Advanced automation platform with intelligent workflow management</p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button size="sm">
                <Zap className="h-4 w-4 mr-2" />
                New Workflow
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="engine" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Engine
            </TabsTrigger>
            <TabsTrigger value="orchestration" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Orchestration
            </TabsTrigger>
            <TabsTrigger value="decisions" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Decisions
            </TabsTrigger>
            <TabsTrigger value="mining" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Process Mining
            </TabsTrigger>
            <TabsTrigger value="reporting" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reporting
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-xs text-muted-foreground">+12% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Decision Rules</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">98.7% success rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Process Efficiency</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89.2%</div>
                  <p className="text-xs text-muted-foreground">+5.3% this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Automation Coverage</CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">73.5%</div>
                  <p className="text-xs text-muted-foreground">Target: 80%</p>
                </CardContent>
              </Card>
            </div>

            {/* Module Overview */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Automation Modules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {automationModules.map(module => {
                  const IconComponent = module.icon;
                  return (
                    <Card key={module.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab(module.id as any)}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <IconComponent className="h-6 w-6 text-blue-600" />
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

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Automation Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Customer onboarding workflow completed</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                    <Badge variant="secondary">Success</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Decision rule triggered for high-value order</p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                    <Badge variant="secondary">Action Taken</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Process bottleneck detected in order fulfillment</p>
                      <p className="text-xs text-muted-foreground">12 minutes ago</p>
                    </div>
                    <Badge variant="secondary">Alert</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Automated report generated and distributed</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Module Tabs */}
          <TabsContent value="engine" className="space-y-6">
            <EnterpriseAutomationEngine />
          </TabsContent>

          <TabsContent value="orchestration" className="space-y-6">
            <AdvancedWorkflowOrchestration />
          </TabsContent>

          <TabsContent value="decisions" className="space-y-6">
            <IntelligentDecisionEngine />
          </TabsContent>

          <TabsContent value="mining" className="space-y-6">
            <ProcessMining />
          </TabsContent>

          <TabsContent value="reporting" className="space-y-6">
            <AutomatedReporting />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}