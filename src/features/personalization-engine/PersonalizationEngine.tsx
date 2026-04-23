'use client'

import { useState, useEffect, useMemo } from 'react'
import { User, Brain, Target, TrendingUp, Eye, Heart, Clock, Settings, BarChart3, Zap } from 'lucide-react'

// Types for Personalization Engine
interface UserProfile {
  id: string
  userId: string
  demographics: {
    age: number
    gender: string
    location: string
    occupation: string
    income: string
  }
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    notifications: boolean
    privacy: 'public' | 'friends' | 'private'
  }
  behavior: {
    sessionDuration: number
    pageViews: number
    interactions: number
    lastActive: Date
  }
  interests: string[]
  skills: string[]
  goals: string[]
  createdAt: Date
  updatedAt: Date
}

interface PersonalizationRule {
  id: string
  name: string
  description: string
  conditions: PersonalizationCondition[]
  actions: PersonalizationAction[]
  priority: number
  active: boolean
  performance: {
    triggered: number
    successful: number
    engagement: number
    conversion: number
  }
}

interface PersonalizationCondition {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range'
  value: any
  weight: number
}

interface PersonalizationAction {
  type: 'show_content' | 'hide_content' | 'reorder_items' | 'customize_layout' | 'send_notification' | 'adjust_theme'
  target: string
  parameters: Record<string, any>
}

interface ContentRecommendation {
  id: string
  userId: string
  contentId: string
  contentType: 'article' | 'video' | 'product' | 'feature' | 'course'
  title: string
  relevance: number
  reason: string
  position: number
  impressions: number
  clicks: number
  conversions: number
  timestamp: Date
}

interface AdaptiveInterface {
  id: string
  userId: string
  component: string
  adaptations: InterfaceAdaptation[]
  performance: {
    satisfaction: number
    usability: number
    efficiency: number
  }
  lastAdapted: Date
}

interface InterfaceAdaptation {
  type: 'layout' | 'content' | 'navigation' | 'styling' | 'functionality'
  element: string
  change: any
  reason: string
  confidence: number
}

interface PersonalizationMetrics {
  totalUsers: number
  activeProfiles: number
  avgEngagement: number
  personalizationAccuracy: number
  recommendationCTR: number
  adaptationSuccess: number
  userSatisfaction: number
}

interface AILearningModel {
  id: string
  name: string
  type: 'collaborative_filtering' | 'content_based' | 'hybrid' | 'reinforcement'
  accuracy: number
  features: string[]
  lastTrained: Date
  performance: {
    precision: number
    recall: number
    f1Score: number
  }
}

export default function PersonalizationEngine() {
  // Sample user profiles
  const [userProfiles] = useState<UserProfile[]>([
    {
      id: 'profile-001',
      userId: 'user-001',
      demographics: {
        age: 32,
        gender: 'male',
        location: 'San Francisco, CA',
        occupation: 'Software Engineer',
        income: '$150k+'
      },
      preferences: {
        theme: 'dark',
        language: 'en',
        notifications: true,
        privacy: 'friends'
      },
      behavior: {
        sessionDuration: 45,
        pageViews: 120,
        interactions: 89,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      interests: ['AI/ML', 'Web Development', 'Data Science', 'Startups'],
      skills: ['React', 'Python', 'Machine Learning', 'Cloud Computing'],
      goals: ['Career Advancement', 'Learning New Technologies', 'Network Building'],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'profile-002',
      userId: 'user-002',
      demographics: {
        age: 28,
        gender: 'female',
        location: 'New York, NY',
        occupation: 'Product Manager',
        income: '$120k+'
      },
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: false,
        privacy: 'private'
      },
      behavior: {
        sessionDuration: 30,
        pageViews: 85,
        interactions: 67,
        lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      interests: ['Product Strategy', 'User Research', 'Agile', 'Design Thinking'],
      skills: ['Product Management', 'User Research', 'Data Analysis', 'Leadership'],
      goals: ['Product Leadership', 'Industry Networking', 'Continuous Learning'],
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ])

  // Sample personalization rules
  const [personalizationRules] = useState<PersonalizationRule[]>([
    {
      id: 'rule-001',
      name: 'Developer Content Priority',
      description: 'Prioritize technical content for users with developer skills',
      conditions: [
        { field: 'skills', operator: 'contains', value: ['React', 'Python', 'JavaScript'], weight: 0.8 },
        { field: 'interests', operator: 'contains', value: ['Web Development'], weight: 0.6 }
      ],
      actions: [
        {
          type: 'show_content',
          target: 'content_feed',
          parameters: { priority: 'technical', boost: 2.0 }
        },
        {
          type: 'reorder_items',
          target: 'navigation',
          parameters: { move_to_top: ['Developer Resources', 'API Documentation'] }
        }
      ],
      priority: 1,
      active: true,
      performance: {
        triggered: 245,
        successful: 198,
        engagement: 0.81,
        conversion: 0.23
      }
    },
    {
      id: 'rule-002',
      name: 'Dark Mode Preference',
      description: 'Apply dark theme for users who prefer it',
      conditions: [
        { field: 'preferences.theme', operator: 'equals', value: 'dark', weight: 1.0 }
      ],
      actions: [
        {
          type: 'adjust_theme',
          target: 'global',
          parameters: { theme: 'dark', apply_immediately: true }
        }
      ],
      priority: 2,
      active: true,
      performance: {
        triggered: 156,
        successful: 156,
        engagement: 0.94,
        conversion: 0.15
      }
    },
    {
      id: 'rule-003',
      name: 'Location-Based Content',
      description: 'Show location-relevant content and events',
      conditions: [
        { field: 'demographics.location', operator: 'contains', value: 'San Francisco', weight: 0.9 }
      ],
      actions: [
        {
          type: 'show_content',
          target: 'sidebar',
          parameters: { content_type: 'local_events', location: 'San Francisco' }
        }
      ],
      priority: 3,
      active: true,
      performance: {
        triggered: 89,
        successful: 76,
        engagement: 0.85,
        conversion: 0.31
      }
    }
  ])

  // Sample content recommendations
  const [contentRecommendations] = useState<ContentRecommendation[]>([
    {
      id: 'rec-001',
      userId: 'user-001',
      contentId: 'content-001',
      contentType: 'article',
      title: 'Advanced React Patterns for Enterprise Applications',
      relevance: 0.95,
      reason: 'High match with React skills and web development interests',
      position: 1,
      impressions: 450,
      clicks: 89,
      conversions: 12,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'rec-002',
      userId: 'user-001',
      contentId: 'content-002',
      contentType: 'course',
      title: 'Machine Learning Fundamentals',
      relevance: 0.87,
      reason: 'Strong interest in AI/ML with relevant skills',
      position: 2,
      impressions: 320,
      clicks: 67,
      conversions: 8,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: 'rec-003',
      userId: 'user-002',
      contentId: 'content-003',
      contentType: 'article',
      title: 'Product Strategy in Tech Startups',
      relevance: 0.92,
      reason: 'Direct match with product management interests and career goals',
      position: 1,
      impressions: 280,
      clicks: 78,
      conversions: 15,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
    }
  ])

  // Sample AI learning models
  const [aiModels] = useState<AILearningModel[]>([
    {
      id: 'model-001',
      name: 'Content Recommendation Engine',
      type: 'hybrid',
      accuracy: 0.89,
      features: ['user_behavior', 'content_similarity', 'temporal_patterns', 'social_signals'],
      lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      performance: {
        precision: 0.91,
        recall: 0.87,
        f1Score: 0.89
      }
    },
    {
      id: 'model-002',
      name: 'User Clustering Model',
      type: 'collaborative_filtering',
      accuracy: 0.94,
      features: ['demographics', 'behavior_patterns', 'content_interactions', 'social_graph'],
      lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      performance: {
        precision: 0.96,
        recall: 0.92,
        f1Score: 0.94
      }
    },
    {
      id: 'model-003',
      name: 'Interface Adaptation Model',
      type: 'reinforcement',
      accuracy: 0.82,
      features: ['user_interactions', 'task_completion', 'time_spent', 'error_rates'],
      lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      performance: {
        precision: 0.85,
        recall: 0.79,
        f1Score: 0.82
      }
    }
  ])

  const [personalizationMetrics] = useState<PersonalizationMetrics>({
    totalUsers: 15420,
    activeProfiles: 12850,
    avgEngagement: 0.76,
    personalizationAccuracy: 0.88,
    recommendationCTR: 0.23,
    adaptationSuccess: 0.91,
    userSatisfaction: 4.3
  })

  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<'profiles' | 'rules' | 'recommendations' | 'models'>('profiles')

  // Calculate derived metrics
  const profileStats = useMemo(() => {
    const totalInterests = userProfiles.flatMap(p => p.interests).length
    const uniqueInterests = new Set(userProfiles.flatMap(p => p.interests)).size
    const avgSessionDuration = userProfiles.reduce((sum, p) => sum + p.behavior.sessionDuration, 0) / userProfiles.length
    const avgPageViews = userProfiles.reduce((sum, p) => sum + p.behavior.pageViews, 0) / userProfiles.length

    const themePreferences = userProfiles.reduce((acc, p) => {
      acc[p.preferences.theme] = (acc[p.preferences.theme] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalInterests,
      uniqueInterests,
      avgSessionDuration,
      avgPageViews,
      themePreferences
    }
  }, [userProfiles])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Personalization Engine</h1>
            <p className="text-lg opacity-90">
              Advanced user profiling with adaptive interfaces and personalized content delivery
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Active Profiles</p>
              <p className="text-2xl font-bold text-gray-900">{personalizationMetrics.activeProfiles.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-sm text-blue-600 font-medium">
            {((personalizationMetrics.activeProfiles / personalizationMetrics.totalUsers) * 100).toFixed(1)}% of total users
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Personalization Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">{(personalizationMetrics.personalizationAccuracy * 100).toFixed(1)}%</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">Highly accurate</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Recommendation CTR</p>
              <p className="text-2xl font-bold text-gray-900">{(personalizationMetrics.recommendationCTR * 100).toFixed(1)}%</p>
            </div>
          </div>
          <div className="text-sm text-purple-600 font-medium">Above industry average</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">User Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900">{personalizationMetrics.userSatisfaction}/5</p>
            </div>
          </div>
          <div className="text-sm text-orange-600 font-medium">Very satisfied</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'profiles'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            User Profiles
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'rules'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Personalization Rules
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'recommendations'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Content Recommendations
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'models'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            AI Models
          </button>
        </div>

        {/* User Profiles Tab */}
        {activeTab === 'profiles' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Profiles</h3>
              <div className="space-y-3">
                {userProfiles.map(profile => (
                  <div
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedProfile?.id === profile.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">User {profile.userId.split('-')[1]}</div>
                          <div className="text-sm text-gray-600">{profile.demographics.occupation}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{profile.demographics.age} years old</div>
                        <div className="text-sm text-gray-500">{profile.demographics.location}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Session:</span>
                        <span className="font-medium ml-1">{profile.behavior.sessionDuration}m</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Page Views:</span>
                        <span className="font-medium ml-1">{profile.behavior.pageViews}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Interactions:</span>
                        <span className="font-medium ml-1">{profile.behavior.interactions}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Theme:</span>
                        <span className="font-medium ml-1 capitalize">{profile.preferences.theme}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {profile.interests.slice(0, 3).map(interest => (
                        <span key={interest} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {interest}
                        </span>
                      ))}
                      {profile.interests.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          +{profile.interests.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Details</h3>
              {selectedProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                      <div className="text-gray-900">{selectedProfile.demographics.age}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <div className="text-gray-900 capitalize">{selectedProfile.demographics.gender}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                      <div className="text-gray-900">{selectedProfile.demographics.occupation}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Income</label>
                      <div className="text-gray-900">{selectedProfile.demographics.income}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                    <div className="flex flex-wrap gap-1">
                      {selectedProfile.interests.map(interest => (
                        <span key={interest} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                    <div className="flex flex-wrap gap-1">
                      {selectedProfile.skills.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                    <div className="flex flex-wrap gap-1">
                      {selectedProfile.goals.map(goal => (
                        <span key={goal} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">
                      Update Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a user profile to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Personalization Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Personalization Rules</h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Settings className="w-4 h-4" />
                New Rule
              </button>
            </div>

            <div className="space-y-4">
              {personalizationRules.map(rule => (
                <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${rule.active ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <p className="text-sm text-gray-600">{rule.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Priority: {rule.priority}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Conditions</div>
                      <div className="font-medium">{rule.conditions.length} conditions</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Actions</div>
                      <div className="font-medium">{rule.actions.length} actions</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Triggered</div>
                      <div className="font-medium">{rule.performance.triggered}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Success Rate</div>
                      <div className="font-medium text-green-600">{(rule.performance.successful / rule.performance.triggered * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span>Engagement: {(rule.performance.engagement * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-green-500" />
                      <span>Conversion: {(rule.performance.conversion * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Content Recommendations</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Content</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Relevance</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">CTR</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Conversions</th>
                  </tr>
                </thead>
                <tbody>
                  {contentRecommendations.map(rec => (
                    <tr key={rec.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{rec.title}</div>
                        <div className="text-sm text-gray-600">Position: {rec.position}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">User {rec.userId.split('-')[1]}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rec.contentType === 'article' ? 'bg-blue-100 text-blue-800' :
                          rec.contentType === 'course' ? 'bg-green-100 text-green-800' :
                          rec.contentType === 'video' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {rec.contentType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-medium">{(rec.relevance * 100).toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">{rec.reason.substring(0, 30)}...</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-medium">{((rec.clicks / rec.impressions) * 100).toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">{rec.clicks}/{rec.impressions}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-medium text-green-600">{rec.conversions}</div>
                        <div className="text-sm text-gray-600">conversions</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Models Tab */}
        {activeTab === 'models' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">AI Learning Models</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aiModels.map(model => (
                <div key={model.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Brain className="w-6 h-6 text-purple-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{model.name}</h4>
                        <p className="text-sm text-gray-600">{model.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{(model.accuracy * 100).toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">accuracy</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Precision:</span>
                      <span className="font-medium">{(model.performance.precision * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Recall:</span>
                      <span className="font-medium">{(model.performance.recall * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">F1 Score:</span>
                      <span className="font-medium">{(model.performance.f1Score * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Features:</div>
                    <div className="flex flex-wrap gap-1">
                      {model.features.map(feature => (
                        <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {feature.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-3">
                    Last trained: {model.lastTrained.toLocaleDateString()}
                  </div>

                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm">
                    Retrain Model
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}