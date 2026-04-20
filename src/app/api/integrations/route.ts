import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// Mock storage - in production these would be database queries
const apiKeys: any[] = [];
const integrations: any[] = [];
const webhooks: any[] = [];
const syncLogs: any[] = [];
const apiAnalytics: any[] = [];
const connectors: any[] = [];
const syncJobs: any[] = [];
const integrationWorkflows: any[] = [];

// Initialize sample data
if (connectors.length === 0) {
  connectors.push(
    {
      id: 'slack',
      name: 'Slack',
      status: 'disconnected',
      config: {}
    },
    {
      id: 'zapier',
      name: 'Zapier',
      status: 'connected',
      config: { webhookUrl: 'https://hooks.zapier.com/...' }
    }
  );
}

if (syncJobs.length === 0) {
  syncJobs.push(
    {
      id: 'sync1',
      name: 'Customer Data Sync',
      source: 'Salesforce',
      target: 'Garlaws Platform',
      status: 'completed',
      lastRun: '2026-04-19T10:00:00Z',
      recordsProcessed: 1250,
      recordsFailed: 5,
      schedule: 'daily',
      entities: ['Users', 'Contacts', 'Accounts'],
      executions: [
        {
          id: 'exec1',
          startedAt: '2026-04-19T10:00:00Z',
          completedAt: '2026-04-19T10:15:00Z',
          status: 'completed',
          result: { processed: 1250, failed: 5 }
        }
      ]
    }
  );
}

if (integrationWorkflows.length === 0) {
  integrationWorkflows.push(
    {
      id: 'wf1',
      name: 'Order Processing Automation',
      description: 'Automates order processing from receipt to fulfillment',
      status: 'active',
      steps: [
        { id: 'step1', type: 'trigger', name: 'Order Received', position: { x: 100, y: 100 } },
        { id: 'step2', type: 'action', name: 'Validate Payment', position: { x: 300, y: 100 } },
        { id: 'step3', type: 'action', name: 'Update Inventory', position: { x: 500, y: 100 } }
      ],
      createdAt: '2026-04-15T09:00:00Z',
      updatedAt: '2026-04-19T11:00:00Z'
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tenantId = searchParams.get('tenantId');

    switch (action) {
      case 'api_keys':
        return NextResponse.json({
          success: true,
          data: apiKeys.filter(k => !tenantId || k.tenantId === tenantId)
        });

      case 'integrations':
        return NextResponse.json({
          success: true,
          data: integrations.filter(i => !tenantId || i.tenantId === tenantId)
        });

      case 'webhooks':
        return NextResponse.json({
          success: true,
          data: webhooks.filter(w => !tenantId || w.tenantId === tenantId)
        });

      case 'sync_logs':
        const limit = parseInt(searchParams.get('limit') || '50');
        const logs = syncLogs
          .filter(l => !tenantId || l.tenantId === tenantId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
        return NextResponse.json({ success: true, data: logs });

      case 'connectors':
        return NextResponse.json({
          success: true,
          data: connectors.filter(c => !tenantId || c.tenantId === tenantId)
        });

      case 'sync-jobs':
        return NextResponse.json({
          success: true,
          data: syncJobs.filter(j => !tenantId || j.tenantId === tenantId)
        });

      case 'sync-stats':
        const totalJobs = syncJobs.length;
        const activeJobs = syncJobs.filter(j => j.status === 'running').length;
        const completedToday = syncJobs.filter(j =>
          j.lastRun && new Date(j.lastRun).toDateString() === new Date().toDateString()
        ).length;
        const failedToday = syncJobs.filter(j =>
          j.status === 'failed' &&
          j.lastRun && new Date(j.lastRun).toDateString() === new Date().toDateString()
        ).length;
        const totalRecordsSynced = syncJobs.reduce((sum, job) => sum + (job.recordsProcessed || 0), 0);

        return NextResponse.json({
          success: true,
          data: {
            totalJobs,
            activeJobs,
            completedToday,
            failedToday,
            totalRecordsSynced
          }
        });

      case 'integration-workflows':
        return NextResponse.json({
          success: true,
          data: integrationWorkflows.filter(w => !tenantId || w.tenantId === tenantId)
        });

      case 'api_analytics':
        const fromDate = searchParams.get('from');
        const toDate = searchParams.get('to');
        let analytics = apiAnalytics;

        if (fromDate && toDate) {
          analytics = analytics.filter(a =>
            new Date(a.timestamp) >= new Date(fromDate) &&
            new Date(a.timestamp) <= new Date(toDate)
          );
        }

        const summary = {
          totalRequests: analytics.length,
          avgResponseTime: analytics.reduce((sum, a) => sum + a.responseTime, 0) / (analytics.length || 1),
          successRate: analytics.filter(a => a.statusCode >= 200 && a.statusCode < 400).length / (analytics.length || 1) * 100,
          topEndpoints: getTopEndpoints(analytics),
          errorRate: analytics.filter(a => a.statusCode >= 400).length / (analytics.length || 1) * 100
        };

        return NextResponse.json({ success: true, data: summary });

      case 'integration_health':
        const health = {
          totalIntegrations: integrations.length,
          connected: integrations.filter(i => i.status === 'connected').length,
          errors: integrations.filter(i => i.status === 'error').length,
          activeWebhooks: webhooks.filter(w => w.isActive).length,
          last24hSyncs: syncLogs.filter(l =>
            new Date(l.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          ).length
        };
        return NextResponse.json({ success: true, data: health });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Integration API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'create_api_key':
        const apiKey = {
          id: `key-${Date.now()}`,
          name: body.name,
          description: body.description,
          keyHash: hashToken(randomUUID()),
          keyPrefix: `garl-${Math.random().toString(36).substr(2, 6)}`,
          tenantId: body.tenantId || 'default',
          userId: body.userId,
          permissions: body.permissions || ['read'],
          rateLimit: body.rateLimit || 1000,
          createdAt: new Date(),
          isActive: true
        };
        apiKeys.push(apiKey);
        return NextResponse.json({ success: true, data: apiKey }, { status: 201 });

      case 'create_integration':
        const integration = {
          id: `int-${Date.now()}`,
          name: body.name,
          provider: body.provider,
          type: body.type || 'oauth',
          config: body.config || {},
          credentials: encryptCredentials(body.credentials),
          tenantId: body.tenantId || 'default',
          createdBy: body.createdBy || 'system',
          status: 'pending',
          createdAt: new Date(),
          isActive: true
        };
        integrations.push(integration);
        return NextResponse.json({ success: true, data: integration }, { status: 201 });

      case 'create_webhook':
        const webhook = {
          id: `wh-${Date.now()}`,
          name: body.name,
          url: body.url,
          tenantId: body.tenantId || 'default',
          secret: randomUUID(),
          events: body.events || [],
          isActive: true,
          headers: body.headers || {},
          retryPolicy: { attempts: 3, delay: 1000 },
          createdAt: new Date(),
          lastTriggered: null,
          failureCount: 0
        };
        webhooks.push(webhook);
        return NextResponse.json({ success: true, data: webhook }, { status: 201 });

      case 'trigger_webhook':
        const wh = webhooks.find(w => w.id === body.webhookId);
        if (!wh) {
          return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
        }

        // Simulate webhook delivery
        const delivery = {
          id: `del-${Date.now()}`,
          webhookId: wh.id,
          event: body.event,
          payload: body.payload,
          success: true,
          attempt: 1,
          deliveredAt: new Date(),
          createdAt: new Date()
        };

        wh.lastTriggered = new Date();
        return NextResponse.json({ success: true, data: delivery }, { status: 201 });

      case 'sync_integration':
        const integrationId = body.integrationId;
        const int = integrations.find(i => i.id === integrationId);
        if (!int) {
          return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
        }

        const syncLog: any = {
          id: `sync-${Date.now()}`,
          integrationId: int.id,
          scheduleId: body.scheduleId || null,
          status: 'running',
          recordsProcessed: 0,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsFailed: 0,
          startTime: new Date(),
          createdAt: new Date()
        };
        syncLogs.push(syncLog);

        // Simulate sync completion
        setTimeout(() => {
          syncLog.status = 'completed';
          syncLog.endTime = new Date();
          syncLog.recordsProcessed = Math.floor(Math.random() * 1000);
          syncLog.recordsCreated = Math.floor(Math.random() * 100);
          syncLog.recordsUpdated = Math.floor(Math.random() * 500);
          int.lastSync = new Date();
        }, 1000);

        return NextResponse.json({ success: true, data: syncLog }, { status: 201 });

      case 'create_data_transformation':
        const transformation = {
          id: `xform-${Date.now()}`,
          name: body.name,
          description: body.description,
          tenantId: body.tenantId || 'default',
          sourceSchema: body.sourceSchema || {},
          targetSchema: body.targetSchema || {},
          mappingRules: body.mappingRules || [],
          isActive: true,
          createdBy: body.createdBy || 'system',
          createdAt: new Date()
        };
        return NextResponse.json({ success: true, data: transformation }, { status: 201 });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Integration API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'update_integration':
        const integration = integrations.find(i => i.id === body.integrationId);
        if (integration) {
          Object.assign(integration, body.updates, { updatedAt: new Date() });
          return NextResponse.json({ success: true, data: integration });
        }
        return NextResponse.json({ error: 'Integration not found' }, { status: 404 });

      case 'update_webhook':
        const webhook = webhooks.find(w => w.id === body.webhookId);
        if (webhook) {
          Object.assign(webhook, body.updates, { updatedAt: new Date() });
          return NextResponse.json({ success: true, data: webhook });
        }
        return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });

      case 'revoke_api_key':
        const key = apiKeys.find(k => k.id === body.keyId);
        if (key) {
          key.isActive = false;
          return NextResponse.json({ success: true, data: key });
        }
        return NextResponse.json({ error: 'API key not found' }, { status: 404 });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Integration API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function hashToken(token: string): string {
  return `hash_${token.slice(0, 16)}...`;
}

function encryptCredentials(creds: any): string {
  return JSON.stringify(creds ? { ...creds, encrypted: true } : {});
}

function getTopEndpoints(analytics: any[]): any[] {
  const counts: Record<string, number> = {};
  analytics.forEach(a => {
    counts[a.endpoint] = (counts[a.endpoint] || 0) + 1;
  });
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([endpoint, count]) => ({ endpoint, count }));
}