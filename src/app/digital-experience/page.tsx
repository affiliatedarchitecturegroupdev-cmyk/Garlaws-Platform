"use client";

import { useState } from 'react';
import { UXEnhancement } from '@/features/ux-enhancement';
import { VRIntegration } from '@/features/vr-integration';
import { ARExperiences } from '@/features/ar-experiences';
import { PersonalizationEngine } from '@/features/personalization-engine';
import { InteractiveDashboards } from '@/features/interactive-dashboards';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Wand2, Move3D, Scan, Brain, BarChart3, Eye, Sparkles, Palette, Camera, Target } from 'lucide-react';

const digitalExperienceModules = [
  {
    id: 'ux',
    name: 'UX Enhancement',
    description: 'Advanced user experience features with interactive elements and modern patterns',
    icon: Wand2,
    component: UXEnhancement,
    features: ['Interactive Components', 'Animation Presets', 'Design Patterns', 'Accessibility']
  },
  {
    id: 'vr',
    name: 'VR Integration',
    description: 'Immersive virtual reality experiences with 3D environments',
    icon: Move3D,
    component: VRIntegration,
    features: ['3D Environments', 'Device Tracking', 'Spatial Audio', 'Real-time Rendering']
  },
  {
    id: 'ar',
    name: 'AR Experiences',
    description: 'Augmented reality interactions with object recognition',
    icon: Scan,
    component: ARExperiences,
    features: ['Object Recognition', 'AR Overlays', 'Spatial Tracking', 'Interactive Content']
  },
  {
    id: 'personalization',
    name: 'Personalization Engine',
    description: 'Advanced user profiling with adaptive interfaces',
    icon: Brain,
    component: PersonalizationEngine,
    features: ['User Profiling', 'Adaptive UI', 'Recommendation Engine', 'AI Models']
  },
  {
    id: 'dashboards',
    name: 'Interactive Dashboards',
    description: 'Advanced data visualization with real-time interactions',
    icon: BarChart3,
    component: InteractiveDashboards,
    features: ['Real-time Data', 'Interactive Widgets', 'Custom Layouts', 'Data Streams']
  }
];

export default function DigitalExperienceDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ux' | 'vr' | 'ar' | 'personalization' | 'dashboards'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-purple-600" />
                Digital Experience Platform
              </h1>
              <p className="text-gray-600 mt-1">Immersive digital experiences with advanced UX and personalization</p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview Mode
              </Button>
              <Button size="sm">
                <Palette className="h-4 w-4 mr-2" />
                Create Experience
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
            <TabsTrigger value="ux" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              UX Enhancement
            </TabsTrigger>
            <TabsTrigger value="vr" className="flex items-center gap-2">
              <Move3D className="h-4 w-4" />
              VR Integration
            </TabsTrigger>
            <TabsTrigger value="ar" className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              AR Experiences
            </TabsTrigger>
            <TabsTrigger value="personalization" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Personalization
            </TabsTrigger>
            <TabsTrigger value="dashboards" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboards
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Experience Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Experiences</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+8 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">User Engagement</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87.3%</div>
                  <p className="text-xs text-muted-foreground">+5.2% vs last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">VR Sessions</CardTitle>
                  <Move3D className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AR Interactions</CardTitle>
                  <Scan className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3,421</div>
                  <p className="text-xs text-muted-foreground">+12% from last week</p>
                </CardContent>
              </Card>
            </div>

            {/* Module Overview */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Digital Experience Modules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {digitalExperienceModules.map(module => {
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

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Digital Experience Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New VR environment created for product showcase</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    <Badge variant="secondary">VR</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">AR experience scanned 500+ objects this hour</p>
                      <p className="text-xs text-muted-foreground">4 hours ago</p>
                    </div>
                    <Badge variant="secondary">AR</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Personalization engine improved recommendation accuracy by 8%</p>
                      <p className="text-xs text-muted-foreground">6 hours ago</p>
                    </div>
                    <Badge variant="secondary">AI</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New interactive dashboard deployed with real-time analytics</p>
                      <p className="text-xs text-muted-foreground">8 hours ago</p>
                    </div>
                    <Badge variant="secondary">Dashboard</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Module Tabs */}
          <TabsContent value="ux" className="space-y-6">
            <UXEnhancement />
          </TabsContent>

          <TabsContent value="vr" className="space-y-6">
            <VRIntegration />
          </TabsContent>

          <TabsContent value="ar" className="space-y-6">
            <ARExperiences />
          </TabsContent>

          <TabsContent value="personalization" className="space-y-6">
            <PersonalizationEngine />
          </TabsContent>

          <TabsContent value="dashboards" className="space-y-6">
            <InteractiveDashboards />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}