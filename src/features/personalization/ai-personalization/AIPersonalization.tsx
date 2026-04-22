'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

// Personalization Types
export type UserSegment =
  | 'new-user'
  | 'power-user'
  | 'casual-user'
  | 'enterprise-user'
  | 'developer'
  | 'administrator'
  | 'mobile-user'
  | 'desktop-user';

export type ContentType =
  | 'dashboard'
  | 'navigation'
  | 'forms'
  | 'charts'
  | 'notifications'
  | 'help'
  | 'onboarding'
  | 'tutorials';

export type PersonalizationRule = {
  id: string;
  name: string;
  description: string;
  conditions: PersonalizationCondition[];
  actions: PersonalizationAction[];
  priority: number;
  isActive: boolean;
  targetSegments: UserSegment[];
  contentTypes: ContentType[];
  effectiveness: {
    engagementIncrease: number;
    conversionRate: number;
    satisfactionScore: number;
  };
  createdAt: string;
  updatedAt: string;
};

export interface PersonalizationCondition {
  id: string;
  type: 'user-behavior' | 'user-profile' | 'context' | 'time-based' | 'device' | 'location';
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'regex';
  value: any;
  weight: number;
}

export interface PersonalizationAction {
  id: string;
  type: 'content-reorder' | 'content-hide' | 'content-show' | 'style-change' | 'layout-modify' | 'notification-send' | 'tutorial-trigger';
  target: string;
  parameters: Record<string, any>;
  priority: number;
}

export interface UserProfile {
  id: string;
  userId: string;
  segments: UserSegment[];
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
    accessibility: {
      fontSize: 'small' | 'medium' | 'large';
      highContrast: boolean;
      reducedMotion: boolean;
      screenReader: boolean;
    };
  };
  behavior: {
    sessionCount: number;
    avgSessionDuration: number;
    lastLogin: string;
    preferredFeatures: string[];
    painPoints: string[];
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  };
  context: {
    deviceType: 'mobile' | 'tablet' | 'desktop';
    browser: string;
    location: {
      country: string;
      timezone: string;
    };
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  personalizationScore: number;
  lastUpdated: string;
}

export interface PersonalizationEngine {
  userProfiles: Map<string, UserProfile>;
  rules: PersonalizationRule[];
  activePersonalizations: Map<string, PersonalizationAction[]>;
  performanceMetrics: {
    averagePersonalizationTime: number;
    cacheHitRate: number;
    userSatisfactionScore: number;
    engagementImprovement: number;
  };
}

// AI-Powered Personalization Hook
export function useAIPersonalization(userId?: string) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [personalizations, setPersonalizations] = useState<PersonalizationAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPersonalizationTime, setLastPersonalizationTime] = useState<number>(0);

  // Mock personalization rules
  const mockRules: PersonalizationRule[] = [
    {
      id: 'new-user-onboarding',
      name: 'New User Onboarding Flow',
      description: 'Personalized onboarding for new users based on their initial interactions',
      conditions: [
        {
          id: 'session-count',
          type: 'user-behavior',
          field: 'sessionCount',
          operator: 'lt',
          value: 5,
          weight: 0.8
        },
        {
          id: 'time-spent',
          type: 'user-behavior',
          field: 'avgSessionDuration',
          operator: 'lt',
          value: 300, // 5 minutes
          weight: 0.6
        }
      ],
      actions: [
        {
          id: 'show-tutorial',
          type: 'tutorial-trigger',
          target: 'dashboard',
          parameters: { tutorial: 'getting-started', priority: 'high' },
          priority: 10
        },
        {
          id: 'highlight-features',
          type: 'content-show',
          target: 'navigation',
          parameters: { features: ['quick-start', 'help-center'], style: 'highlighted' },
          priority: 8
        }
      ],
      priority: 10,
      isActive: true,
      targetSegments: ['new-user'],
      contentTypes: ['dashboard', 'navigation', 'onboarding'],
      effectiveness: {
        engagementIncrease: 35,
        conversionRate: 25,
        satisfactionScore: 4.2
      },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    },
    {
      id: 'power-user-advanced-features',
      name: 'Advanced Features for Power Users',
      description: 'Show advanced features and shortcuts for experienced users',
      conditions: [
        {
          id: 'high-engagement',
          type: 'user-behavior',
          field: 'sessionCount',
          operator: 'gt',
          value: 50,
          weight: 0.9
        },
        {
          id: 'long-sessions',
          type: 'user-behavior',
          field: 'avgSessionDuration',
          operator: 'gt',
          value: 1800, // 30 minutes
          weight: 0.7
        }
      ],
      actions: [
        {
          id: 'show-advanced-menu',
          type: 'content-show',
          target: 'navigation',
          parameters: { menu: 'advanced', shortcuts: true },
          priority: 9
        },
        {
          id: 'api-access-shortcut',
          type: 'content-show',
          target: 'dashboard',
          parameters: { widget: 'api-access', position: 'top-right' },
          priority: 7
        }
      ],
      priority: 8,
      isActive: true,
      targetSegments: ['power-user', 'developer'],
      contentTypes: ['dashboard', 'navigation'],
      effectiveness: {
        engagementIncrease: 45,
        conversionRate: 15,
        satisfactionScore: 4.8
      },
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    },
    {
      id: 'mobile-optimization',
      name: 'Mobile Interface Optimization',
      description: 'Optimize interface for mobile users with touch-friendly controls',
      conditions: [
        {
          id: 'mobile-device',
          type: 'device',
          field: 'deviceType',
          operator: 'eq',
          value: 'mobile',
          weight: 1.0
        },
        {
          id: 'touch-interactions',
          type: 'user-behavior',
          field: 'touchInteractions',
          operator: 'gt',
          value: 10,
          weight: 0.8
        }
      ],
      actions: [
        {
          id: 'enlarge-buttons',
          type: 'style-change',
          target: 'global',
          parameters: { 'button-size': 'large', 'touch-targets': 'expanded' },
          priority: 10
        },
        {
          id: 'gesture-navigation',
          type: 'content-show',
          target: 'navigation',
          parameters: { gestures: true, swipeIndicators: true },
          priority: 8
        }
      ],
      priority: 9,
      isActive: true,
      targetSegments: ['mobile-user'],
      contentTypes: ['navigation', 'forms', 'dashboard'],
      effectiveness: {
        engagementIncrease: 28,
        conversionRate: 20,
        satisfactionScore: 4.3
      },
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    }
  ];

  const loadUserProfile = useCallback(async (uid: string) => {
    // Mock user profile loading
    const mockProfile: UserProfile = {
      id: `profile_${uid}`,
      userId: uid,
      segments: ['new-user', 'mobile-user'],
      preferences: {
        theme: 'auto',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          inApp: true
        },
        accessibility: {
          fontSize: 'medium',
          highContrast: false,
          reducedMotion: false,
          screenReader: false
        }
      },
      behavior: {
        sessionCount: 12,
        avgSessionDuration: 420, // 7 minutes
        lastLogin: '2026-04-22T10:30:00Z',
        preferredFeatures: ['dashboard', 'analytics', 'reports'],
        painPoints: ['complex-navigation'],
        learningStyle: 'visual'
      },
      context: {
        deviceType: 'mobile',
        browser: 'Chrome Mobile',
        location: {
          country: 'US',
          timezone: 'America/New_York'
        },
        timeOfDay: 'morning'
      },
      personalizationScore: 78,
      lastUpdated: '2026-04-22T10:30:00Z'
    };

    setUserProfile(mockProfile);
    return mockProfile;
  }, []);

  const applyPersonalization = useCallback(async (profile: UserProfile, context: ContentType) => {
    const startTime = Date.now();
    setIsLoading(true);

    try {
      const applicableRules = mockRules.filter(rule =>
        rule.isActive &&
        rule.targetSegments.some(segment => profile.segments.includes(segment)) &&
        rule.contentTypes.includes(context)
      );

      const actions: PersonalizationAction[] = [];

      for (const rule of applicableRules) {
        const conditionsMet = rule.conditions.every(condition =>
          evaluateCondition(condition, profile)
        );

        if (conditionsMet) {
          actions.push(...rule.actions);
        }
      }

      // Sort by priority and remove duplicates
      const uniqueActions = actions
        .sort((a, b) => b.priority - a.priority)
        .filter((action, index, self) =>
          index === self.findIndex(a => a.id === action.id)
        );

      setPersonalizations(uniqueActions);
      setLastPersonalizationTime(Date.now() - startTime);

      return uniqueActions;
    } catch (error) {
      console.error('Personalization application failed:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const evaluateCondition = (condition: PersonalizationCondition, profile: UserProfile): boolean => {
    // Mock condition evaluation
    switch (condition.field) {
      case 'sessionCount':
        return profile.behavior.sessionCount > condition.value;
      case 'avgSessionDuration':
        return profile.behavior.avgSessionDuration > condition.value;
      case 'deviceType':
        return profile.context.deviceType === condition.value;
      default:
        return Math.random() > 0.5; // Mock evaluation
    }
  };

  const updateUserBehavior = useCallback(async (behavior: Partial<UserProfile['behavior']>) => {
    if (!userProfile) return;

    const updatedProfile = {
      ...userProfile,
      behavior: { ...userProfile.behavior, ...behavior },
      lastUpdated: new Date().toISOString()
    };

    setUserProfile(updatedProfile);
  }, [userProfile]);

  useEffect(() => {
    if (userId) {
      loadUserProfile(userId);
    }
  }, [userId, loadUserProfile]);

  useEffect(() => {
    if (userProfile) {
      applyPersonalization(userProfile, 'dashboard');
    }
  }, [userProfile, applyPersonalization]);

  return {
    userProfile,
    personalizations,
    isLoading,
    lastPersonalizationTime,
    loadUserProfile,
    applyPersonalization,
    updateUserBehavior,
  };
}

// Personalization Dashboard Component
interface PersonalizationDashboardProps {
  className?: string;
  userId?: string;
}

export const PersonalizationDashboard: React.FC<PersonalizationDashboardProps> = ({
  className,
  userId = 'demo-user'
}) => {
  const {
    userProfile,
    personalizations,
    isLoading,
    lastPersonalizationTime,
    applyPersonalization
  } = useAIPersonalization(userId);

  const [selectedRule, setSelectedRule] = useState<string>('');
  const [testContext, setTestContext] = useState<ContentType>('dashboard');

  const handleTestPersonalization = async () => {
    if (userProfile) {
      await applyPersonalization(userProfile, testContext);
    }
  };

  if (isLoading || !userProfile) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold">Loading Personalization</h3>
          <p className="text-sm text-muted-foreground mt-2">Analyzing user behavior and preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI-Powered Personalization</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Dynamic content and interface adaptation using machine learning
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Personalization Score: {userProfile.personalizationScore}%
          </div>
          <div className="text-sm text-muted-foreground">
            Last Update: {lastPersonalizationTime}ms
          </div>
        </div>
      </div>

      {/* User Profile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">User Segments</h3>
          <div className="flex flex-wrap gap-2">
            {userProfile.segments.map(segment => (
              <span key={segment} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {segment.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Behavior Metrics</h3>
          <div className="space-y-1 text-sm">
            <div>Sessions: {userProfile.behavior.sessionCount}</div>
            <div>Avg Duration: {Math.round(userProfile.behavior.avgSessionDuration / 60)}m</div>
            <div>Learning Style: {userProfile.behavior.learningStyle}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Context</h3>
          <div className="space-y-1 text-sm">
            <div>Device: {userProfile.context.deviceType}</div>
            <div>Time: {userProfile.context.timeOfDay}</div>
            <div>Location: {userProfile.context.location.country}</div>
          </div>
        </div>
      </div>

      {/* Test Personalization */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Test Personalization</h3>
        <div className="flex items-center space-x-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Content Context</label>
            <select
              value={testContext}
              onChange={(e) => setTestContext(e.target.value as ContentType)}
              className="px-3 py-2 border border-border rounded"
            >
              <option value="dashboard">Dashboard</option>
              <option value="navigation">Navigation</option>
              <option value="forms">Forms</option>
              <option value="charts">Charts</option>
              <option value="notifications">Notifications</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleTestPersonalization}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Apply Personalization
            </button>
          </div>
        </div>

        {/* Current Personalizations */}
        <div>
          <h4 className="font-medium mb-3">Active Personalizations ({personalizations.length})</h4>
          <div className="space-y-2">
            {personalizations.map(action => (
              <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium capitalize">{action.type.replace('-', ' ')}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    → {action.target}
                  </span>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Priority {action.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">User Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Interface</h4>
            <div className="space-y-2 text-sm">
              <div>Theme: {userProfile.preferences.theme}</div>
              <div>Language: {userProfile.preferences.language}</div>
              <div>Font Size: {userProfile.preferences.accessibility.fontSize}</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Notifications</h4>
            <div className="space-y-2 text-sm">
              <div>Email: {userProfile.preferences.notifications.email ? 'Enabled' : 'Disabled'}</div>
              <div>Push: {userProfile.preferences.notifications.push ? 'Enabled' : 'Disabled'}</div>
              <div>In-App: {userProfile.preferences.notifications.inApp ? 'Enabled' : 'Disabled'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">35%</div>
            <div className="text-sm text-muted-foreground">Engagement Increase</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">25%</div>
            <div className="text-sm text-muted-foreground">Conversion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">4.2</div>
            <div className="text-sm text-muted-foreground">Satisfaction Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{lastPersonalizationTime}ms</div>
            <div className="text-sm text-muted-foreground">Response Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};