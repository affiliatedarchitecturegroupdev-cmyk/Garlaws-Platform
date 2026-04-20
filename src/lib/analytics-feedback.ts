'use client';

import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store/app-store';

export interface UserAction {
  id: string;
  userId: string;
  action: string;
  module: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  trackEvent(event: string, properties: Record<string, any> = {}, userId?: string) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date(),
      userId,
      sessionId: this.sessionId
    };

    this.events.push(analyticsEvent);

    // In a real app, this would send to analytics service
    console.log('Analytics Event:', analyticsEvent);

    // Keep only last 100 events in memory
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
  }

  trackPageView(page: string, properties: Record<string, any> = {}) {
    this.trackEvent('page_view', {
      page,
      ...properties
    });
  }

  trackUserAction(action: string, module: string, metadata: Record<string, any> = {}) {
    this.trackEvent('user_action', {
      action,
      module,
      ...metadata
    });
  }

  trackError(error: Error, context: Record<string, any> = {}) {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  trackPerformance(metric: string, value: number, properties: Record<string, any> = {}) {
    this.trackEvent('performance', {
      metric,
      value,
      ...properties
    });
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getSessionEvents(): AnalyticsEvent[] {
    return this.events.filter(event => event.sessionId === this.sessionId);
  }

  clearEvents() {
    this.events = [];
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();

// React hook for analytics
export function useAnalytics(userId?: string) {
  const trackEvent = useCallback((event: string, properties: Record<string, any> = {}) => {
    analyticsService.trackEvent(event, properties, userId);
  }, [userId]);

  const trackPageView = useCallback((page: string, properties: Record<string, any> = {}) => {
    analyticsService.trackPageView(page, properties);
  }, []);

  const trackUserAction = useCallback((action: string, module: string, metadata: Record<string, any> = {}) => {
    analyticsService.trackUserAction(action, module, metadata);
  }, []);

  const trackError = useCallback((error: Error, context: Record<string, any> = {}) => {
    analyticsService.trackError(error, context);
  }, []);

  const trackPerformance = useCallback((metric: string, value: number, properties: Record<string, any> = {}) => {
    analyticsService.trackPerformance(metric, value, properties);
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackError,
    trackPerformance,
    getEvents: analyticsService.getEvents.bind(analyticsService),
    getSessionEvents: analyticsService.getSessionEvents.bind(analyticsService),
    clearEvents: analyticsService.clearEvents.bind(analyticsService)
  };
}

// User feedback system
export interface UserFeedback {
  id: string;
  userId: string;
  type: 'bug_report' | 'feature_request' | 'general_feedback' | 'rating';
  title: string;
  description: string;
  rating?: number;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  metadata?: Record<string, any>;
}

class FeedbackService {
  private feedback: UserFeedback[] = [];

  submitFeedback(feedback: Omit<UserFeedback, 'id' | 'timestamp' | 'status'>) {
    const newFeedback: UserFeedback = {
      ...feedback,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'open'
    };

    this.feedback.push(newFeedback);

    // In a real app, this would be sent to a backend service
    console.log('Feedback submitted:', newFeedback);

    return newFeedback;
  }

  getFeedback(userId?: string): UserFeedback[] {
    if (userId) {
      return this.feedback.filter(f => f.userId === userId);
    }
    return [...this.feedback];
  }

  updateFeedbackStatus(id: string, status: UserFeedback['status']) {
    const feedback = this.feedback.find(f => f.id === id);
    if (feedback) {
      feedback.status = status;
      console.log('Feedback status updated:', { id, status });
    }
  }
}

// Singleton instance
export const feedbackService = new FeedbackService();

// React hook for feedback
export function useFeedback(userId: string) {
  const submitFeedback = useCallback((feedback: Omit<UserFeedback, 'id' | 'timestamp' | 'status' | 'userId'>) => {
    return feedbackService.submitFeedback({
      ...feedback,
      userId
    });
  }, [userId]);

  const getUserFeedback = useCallback(() => {
    return feedbackService.getFeedback(userId);
  }, [userId]);

  const updateStatus = useCallback((id: string, status: UserFeedback['status']) => {
    feedbackService.updateFeedbackStatus(id, status);
  }, []);

  return {
    submitFeedback,
    getUserFeedback,
    updateStatus
  };
}

// Cross-module insights generator
export function useCrossModuleInsights() {
  const {
    financial,
    inventory,
    orders,
    projects,
    systemHealth,
    notifications
  } = useAppStore();

  const generateInsights = useCallback(() => {
    const insights: string[] = [];

    // Financial insights
    if (financial) {
      if (financial.profit > 0) {
        insights.push(`Strong financial performance with R${financial.profit.toLocaleString()} profit this month`);
      } else {
        insights.push(`Financial review needed - currently operating at a loss`);
      }
    }

    // Inventory insights
    if (inventory && inventory.lowStockItems > 5) {
      insights.push(`${inventory.lowStockItems} items are running low on stock - consider restocking`);
    }

    // Order insights
    if (orders && orders.pendingOrders > 10) {
      insights.push(`${orders.pendingOrders} orders pending - focus on order fulfillment`);
    }

    // Project insights
    if (projects && projects.overdueTasks > 0) {
      insights.push(`${projects.overdueTasks} tasks are overdue across active projects`);
    }

    // System health insights
    if (systemHealth && systemHealth.status !== 'healthy') {
      insights.push(`System health is ${systemHealth.status} - monitor performance`);
    }

    // Notification insights
    const unreadNotifications = notifications.filter(n => !n.read).length;
    if (unreadNotifications > 0) {
      insights.push(`${unreadNotifications} unread notifications require attention`);
    }

    return insights;
  }, [financial, inventory, orders, projects, systemHealth, notifications]);

  return { generateInsights };
}

// Auto-track page views and user actions
export function useAutoAnalytics(userId?: string) {
  const analytics = useAnalytics(userId);

  useEffect(() => {
    // Track page view on mount
    analytics.trackPageView(window.location.pathname);

    // Track user engagement
    let lastActivity = Date.now();
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    // Track various user interactions
    const events = ['mousedown', 'keydown', 'scroll', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Track session duration
    const sessionTimer = setInterval(() => {
      const sessionDuration = (Date.now() - lastActivity) / 1000 / 60; // minutes
      if (sessionDuration > 30) { // inactive for 30 minutes
        analytics.trackEvent('session_end', { duration: sessionDuration });
      }
    }, 60000); // check every minute

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(sessionTimer);
    };
  }, [analytics]);

  return analytics;
}