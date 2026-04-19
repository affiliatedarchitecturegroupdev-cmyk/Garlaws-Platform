import { NextRequest, NextResponse } from 'next/server';
import { subscriptionManagementEngine } from '@/lib/subscription-management-engine';
import { Tenant, UsageSnapshot, UsageAlert } from '@/lib/subscription-management-engine';

// In-memory storage for usage data
const usageData: Map<string, any[]> = new Map();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tenantId = searchParams.get('tenantId');

    switch (action) {
      case 'usage_stats':
        if (!tenantId) {
          return NextResponse.json(
            { error: 'tenantId parameter required' },
            { status: 400 }
          );
        }
        const stats = await getTenantUsageStats(tenantId);
        return NextResponse.json({
          success: true,
          data: stats
        });

      case 'usage_history':
        if (!tenantId) {
          return NextResponse.json(
            { error: 'tenantId parameter required' },
            { status: 400 }
          );
        }
        const history = await getTenantUsageHistory(tenantId);
        return NextResponse.json({
          success: true,
          data: history
        });

      case 'usage_alerts':
        if (!tenantId) {
          return NextResponse.json(
            { error: 'tenantId parameter required' },
            { status: 400 }
          );
        }
        const alerts = await getTenantUsageAlerts(tenantId);
        return NextResponse.json({
          success: true,
          data: alerts
        });

      case 'analytics':
        const timeframe = searchParams.get('timeframe') || 'month';
        const analytics = subscriptionManagementEngine.getSubscriptionAnalytics(timeframe as any);
        return NextResponse.json({
          success: true,
          data: analytics
        });

      case 'resource_usage':
        const resource = searchParams.get('resource');
        if (!resource) {
          return NextResponse.json(
            { error: 'resource parameter required' },
            { status: 400 }
          );
        }
        const resourceUsage = await getResourceUsage(resource);
        return NextResponse.json({
          success: true,
          data: resourceUsage
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: usage_stats, usage_history, usage_alerts, analytics, or resource_usage' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'record_usage':
        if (!body.tenantId || !body.metric || body.value === undefined) {
          return NextResponse.json(
            { error: 'tenantId, metric, and value are required' },
            { status: 400 }
          );
        }

        await subscriptionManagementEngine.recordUsage(body.tenantId, body.metric, body.value);
        return NextResponse.json({
          success: true,
          message: 'Usage recorded successfully'
        });

      case 'bulk_record_usage':
        if (!body.tenantId || !Array.isArray(body.usage)) {
          return NextResponse.json(
            { error: 'tenantId and usage array are required' },
            { status: 400 }
          );
        }

        for (const usage of body.usage) {
          await subscriptionManagementEngine.recordUsage(body.tenantId, usage.metric, usage.value);
        }
        return NextResponse.json({
          success: true,
          message: `Recorded ${body.usage.length} usage metrics`
        });

      case 'acknowledge_alert':
        if (!body.tenantId || !body.alertId) {
          return NextResponse.json(
            { error: 'tenantId and alertId are required' },
            { status: 400 }
          );
        }

        const acknowledged = await acknowledgeUsageAlert(body.tenantId, body.alertId);
        return NextResponse.json({
          success: acknowledged,
          message: acknowledged ? 'Alert acknowledged' : 'Alert not found'
        });

      case 'generate_report':
        if (!body.tenantId || !body.reportType) {
          return NextResponse.json(
            { error: 'tenantId and reportType are required' },
            { status: 400 }
          );
        }

        const report = await generateUsageReport(body.tenantId, body.reportType, body.timeframe);
        return NextResponse.json({
          success: true,
          data: report
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: record_usage, bulk_record_usage, acknowledge_alert, or generate_report' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing usage operation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to perform usage operation' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getTenantUsageStats(tenantId: string): Promise<any> {
  const tenant = subscriptionManagementEngine.getTenant(tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const subscription = tenant.subscriptionId ? subscriptionManagementEngine.getSubscription(tenant.subscriptionId) : null;
  const plan = subscription ? subscriptionManagementEngine.getPlan(subscription.planId) : null;

  return {
    tenantId,
    currentUsage: tenant.usage.current,
    limits: plan?.limits || {},
    utilization: calculateUtilization(tenant.usage.current, plan?.limits || {}),
    alerts: tenant.usage.alerts.length,
    lastUpdated: tenant.usage.current.lastUpdated
  };
}

async function getTenantUsageHistory(tenantId: string): Promise<UsageSnapshot[]> {
  const tenant = subscriptionManagementEngine.getTenant(tenantId);
  if (!tenant) {
    return [];
  }

  return tenant.usage.history;
}

async function getTenantUsageAlerts(tenantId: string): Promise<UsageAlert[]> {
  const tenant = subscriptionManagementEngine.getTenant(tenantId);
  if (!tenant) {
    return [];
  }

  return tenant.usage.alerts;
}

async function getResourceUsage(resource: string): Promise<any> {
  const tenants = subscriptionManagementEngine.getTenants();
  const resourceUsage: any[] = [];

  tenants.forEach(tenant => {
    const usage = (tenant.usage.current as any)[resource];
    if (usage !== undefined) {
      resourceUsage.push({
        tenantId: tenant.id,
        tenantName: tenant.name,
        usage,
        lastUpdated: tenant.usage.current.lastUpdated
      });
    }
  });

  // Sort by usage (highest first)
  resourceUsage.sort((a, b) => b.usage - a.usage);

  return {
    resource,
    totalTenants: resourceUsage.length,
    topConsumers: resourceUsage.slice(0, 10),
    averageUsage: resourceUsage.length > 0 ?
      resourceUsage.reduce((sum, item) => sum + item.usage, 0) / resourceUsage.length : 0,
    totalUsage: resourceUsage.reduce((sum, item) => sum + item.usage, 0)
  };
}

function calculateUtilization(current: any, limits: any): Record<string, number> {
  const utilization: Record<string, number> = {};

  Object.keys(limits).forEach(key => {
    const limit = limits[key];
    const usage = current[key] || 0;

    if (limit > 0) {
      utilization[key] = (usage / limit) * 100;
    } else if (limit === -1) {
      // Unlimited
      utilization[key] = 0;
    } else {
      utilization[key] = usage > 0 ? 100 : 0;
    }
  });

  return utilization;
}

async function acknowledgeUsageAlert(tenantId: string, alertId: string): Promise<boolean> {
  const tenant = subscriptionManagementEngine.getTenant(tenantId);
  if (!tenant) return false;

  const alert = tenant.usage.alerts.find(a => a.id === alertId);
  if (!alert) return false;

  alert.acknowledged = true;
  tenant.updatedAt = new Date();

  return true;
}

async function generateUsageReport(tenantId: string, reportType: string, timeframe: string = 'month'): Promise<any> {
  const tenant = subscriptionManagementEngine.getTenant(tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const subscription = tenant.subscriptionId ? subscriptionManagementEngine.getSubscription(tenant.subscriptionId) : null;
  const plan = subscription ? subscriptionManagementEngine.getPlan(subscription.planId) : null;

  // Filter history based on timeframe
  const now = new Date();
  const startDate = new Date(now);

  switch (timeframe) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  const relevantHistory = tenant.usage.history.filter(snapshot => snapshot.date >= startDate);

  const report = {
    tenantId,
    tenantName: tenant.name,
    reportType,
    timeframe,
    period: {
      start: startDate,
      end: now
    },
    plan: plan ? {
      name: plan.name,
      tier: plan.tier,
      limits: plan.limits
    } : null,
    currentUsage: tenant.usage.current,
    usageHistory: relevantHistory,
    trends: calculateUsageTrends(relevantHistory),
    alerts: tenant.usage.alerts,
    recommendations: generateUsageRecommendations(tenant.usage.current, plan?.limits || {}, relevantHistory),
    generatedAt: new Date()
  };

  return report;
}

function calculateUsageTrends(history: UsageSnapshot[]): any {
  if (history.length < 2) {
    return { trends: 'insufficient_data' };
  }

  const trends: Record<string, any> = {};
  const metrics = ['properties', 'users', 'storage', 'apiCalls', 'aiQueries', 'iotSensors'];

  metrics.forEach(metric => {
    const values = history.map(h => (h.usage as any)[metric]).filter(v => v !== undefined);

    if (values.length >= 2) {
      const first = values[0];
      const last = values[values.length - 1];
      const change = ((last - first) / Math.max(first, 1)) * 100;

      let direction = 'stable';
      if (change > 10) direction = 'increasing';
      else if (change < -10) direction = 'decreasing';

      trends[metric] = {
        direction,
        changePercent: Math.round(change * 100) / 100,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        volatility: calculateVolatility(values)
      };
    }
  });

  return { trends };
}

function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;

  return Math.sqrt(variance) / Math.max(mean, 1); // Coefficient of variation
}

function generateUsageRecommendations(current: any, limits: any, history: UsageSnapshot[]): string[] {
  const recommendations: string[] = [];

  // Check current utilization
  Object.keys(limits).forEach(metric => {
    const limit = limits[metric];
    const usage = current[metric] || 0;
    const utilization = limit > 0 ? (usage / limit) * 100 : 0;

    if (utilization > 90) {
      recommendations.push(`High ${metric} utilization (${utilization.toFixed(1)}%). Consider upgrading your plan.`);
    } else if (utilization < 30 && history.length > 7) {
      recommendations.push(`Low ${metric} utilization (${utilization.toFixed(1)}%). Consider downgrading to a more cost-effective plan.`);
    }
  });

  // Check trends
  if (history.length > 7) {
    const recent = history.slice(-7);
    const earlier = history.slice(-14, -7);

    if (recent.length === 7 && earlier.length === 7) {
      Object.keys(limits).forEach(metric => {
        const recentAvg = recent.reduce((sum, h) => sum + ((h.usage as any)[metric] || 0), 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, h) => sum + ((h.usage as any)[metric] || 0), 0) / earlier.length;

        const growth = ((recentAvg - earlierAvg) / Math.max(earlierAvg, 1)) * 100;

        if (growth > 50) {
          recommendations.push(`Rapid growth in ${metric} usage (${growth.toFixed(1)}%). Monitor closely and plan for scaling.`);
        }
      });
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Usage patterns are optimal. Continue monitoring regularly.');
  }

  return recommendations;
}

// Real-time usage monitoring endpoint
export async function POST_MONITOR(request: NextRequest) {
  try {
    const body = await request.json();

    // Record usage from external systems (IoT sensors, API calls, etc.)
    if (body.tenantId && body.metric && body.value !== undefined) {
      await subscriptionManagementEngine.recordUsage(body.tenantId, body.metric, body.value);

      return NextResponse.json({
        success: true,
        message: 'Usage recorded'
      });
    }

    return NextResponse.json(
      { error: 'Invalid monitoring data format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Monitoring error:', error);
    return NextResponse.json(
      { error: 'Monitoring failed' },
      { status: 500 }
    );
  }
}