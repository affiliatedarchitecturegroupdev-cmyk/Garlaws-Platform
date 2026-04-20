import { NextRequest, NextResponse } from 'next/server';

// In-memory mock storage for ERP entities
const erpConnectors: any[] = [];
const erpWorkflows: any[] = [];
const erpSyncLogs: any[] = [];
const erpTransformations: any[] = [];
const erpTransactions: any[] = [];
const erpReports: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tenantId = searchParams.get('tenantId');

    switch (action) {
      case 'connectors':
        return NextResponse.json({
          success: true,
          data: erpConnectors.filter(c => !tenantId || c.tenantId === tenantId)
        });

      case 'workflows':
        return NextResponse.json({
          success: true,
          data: erpWorkflows.filter(w => !tenantId || w.tenantId === tenantId)
        });

      case 'sync_logs':
        const limit = parseInt(searchParams.get('limit') || '50');
        const logs = erpSyncLogs
          .filter(l => !tenantId || l.tenantId === tenantId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
        return NextResponse.json({ success: true, data: logs });

      case 'transformations':
        return NextResponse.json({
          success: true,
          data: erpTransformations.filter(t => !tenantId || t.tenantId === tenantId)
        });

      case 'transactions':
        return NextResponse.json({
          success: true,
          data: erpTransactions.filter(t => !tenantId || t.tenantId === tenantId)
        });

      case 'reports':
        return NextResponse.json({
          success: true,
          data: erpReports.filter(r => !tenantId || r.tenantId === tenantId)
        });

      case 'erp_dashboard':
        const dashboard = {
          totalConnectors: erpConnectors.length,
          activeConnectors: erpConnectors.filter(c => c.status === 'connected').length,
          runningWorkflows: erpWorkflows.filter(w => w.isActive).length,
          recentSyncs: erpSyncLogs.slice(0, 5),
          pendingTransactions: erpTransactions.filter(t => t.status === 'pending').length,
          syncSuccessRate: erpSyncLogs.length > 0 ?
            (erpSyncLogs.filter(l => l.status === 'completed').length / erpSyncLogs.length) * 100 : 100,
          dataQuality: 92.5, // Mock percentage
          integrationUptime: 99.7 // Mock percentage
        };
        return NextResponse.json({ success: true, data: dashboard });

      case 'connector_health':
        const connectorId = searchParams.get('connectorId');
        if (!connectorId) {
          return NextResponse.json({ error: 'connectorId required' }, { status: 400 });
        }

        const connector = erpConnectors.find(c => c.id === connectorId);
        if (!connector) {
          return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
        }

        const connectorSyncs = erpSyncLogs.filter(l => l.connectorId === connectorId);
        const health = {
          connector: connector,
          lastSync: connector.lastSync,
          syncCount: connectorSyncs.length,
          successRate: connectorSyncs.length > 0 ?
            (connectorSyncs.filter(s => s.status === 'completed').length / connectorSyncs.length) * 100 : 0,
          avgSyncTime: connectorSyncs.length > 0 ?
            connectorSyncs.reduce((sum, s) => sum + (s.duration || 0), 0) / connectorSyncs.length : 0,
          recentErrors: connectorSyncs.filter(s => s.status === 'failed').slice(0, 3)
        };
        return NextResponse.json({ success: true, data: health });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('ERP API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'create_connector':
        const connector = {
          id: `erp-conn-${Date.now()}`,
          name: body.name,
          provider: body.provider,
          connectionType: body.connectionType || 'api',
          endpoint: body.endpoint,
          authentication: body.authentication || {},
          credentials: encryptCredentials(body.credentials),
          status: 'configuring',
          syncFrequency: body.syncFrequency || 'daily',
          tenantId: body.tenantId || 'default',
          createdBy: body.createdBy || 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        erpConnectors.push(connector);
        return NextResponse.json({ success: true, data: connector }, { status: 201 });

      case 'create_workflow':
        const workflow = {
          id: `erp-wf-${Date.now()}`,
          name: body.name,
          description: body.description,
          workflowType: body.workflowType,
          trigger: body.trigger || 'manual',
          triggerConfig: body.triggerConfig || {},
          steps: body.steps || [],
          conditions: body.conditions || {},
          approvals: body.approvals || {},
          notifications: body.notifications || {},
          isActive: true,
          tenantId: body.tenantId || 'default',
          createdBy: body.createdBy || 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        erpWorkflows.push(workflow);
        return NextResponse.json({ success: true, data: workflow }, { status: 201 });

      case 'sync_connector':
        const connectorId = body.connectorId;
        const erpConnector = erpConnectors.find(c => c.id === connectorId);
        if (!erpConnector) {
          return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
        }

        const syncLog: any = {
          id: `sync-${Date.now()}`,
          connectorId: erpConnector.id,
          syncType: body.syncType || 'incremental',
          direction: body.direction || 'bidirectional',
          status: 'running',
          recordsProcessed: 0,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsFailed: 0,
          endTime: null,
          duration: 0,
          errorMessage: null,
          startTime: new Date(),
          createdAt: new Date()
        };
        erpSyncLogs.push(syncLog);

        // Simulate sync process
        setTimeout(() => {
          syncLog.status = Math.random() > 0.1 ? 'completed' : 'failed'; // 90% success rate
          syncLog.endTime = new Date();
          syncLog.duration = Math.floor(Math.random() * 300) + 30; // 30-330 seconds
          syncLog.recordsProcessed = Math.floor(Math.random() * 10000) + 100;
          syncLog.recordsCreated = Math.floor(syncLog.recordsProcessed * 0.1);
          syncLog.recordsUpdated = Math.floor(syncLog.recordsProcessed * 0.8);
          syncLog.recordsFailed = Math.floor(syncLog.recordsProcessed * 0.02);

          if (syncLog.status === 'completed') {
            erpConnector.lastSync = new Date();
            erpConnector.status = 'connected';
          } else {
            erpConnector.status = 'error';
            syncLog.errorMessage = 'Connection timeout or authentication failure';
          }
        }, 2000);

        return NextResponse.json({ success: true, data: syncLog }, { status: 201 });

      case 'create_transformation':
        const transformation = {
          id: `erp-trans-${Date.now()}`,
          name: body.name,
          description: body.description,
          sourceSystem: body.sourceSystem,
          targetSystem: body.targetSystem,
          entityType: body.entityType,
          mappingRules: body.mappingRules || {},
          transformationLogic: body.transformationLogic || '',
          validationRules: body.validationRules || {},
          isActive: true,
          tenantId: body.tenantId || 'default',
          createdBy: body.createdBy || 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        erpTransformations.push(transformation);
        return NextResponse.json({ success: true, data: transformation }, { status: 201 });

      case 'create_transaction':
        const transaction: any = {
          id: `erp-tx-${Date.now()}`,
          transactionId: body.transactionId || `TXN-${Date.now()}`,
          transactionType: body.transactionType,
          sourceModule: body.sourceModule,
          targetModule: body.targetModule,
          status: 'pending',
          priority: body.priority || 'medium',
          data: body.data || {},
          metadata: body.metadata || {},
          companyId: body.companyId,
          processedAt: null,
          createdBy: body.createdBy || 'system',
          createdAt: new Date()
        };
        erpTransactions.push(transaction);

        // Simulate transaction processing
        setTimeout(() => {
          transaction.status = Math.random() > 0.05 ? 'completed' : 'failed'; // 95% success rate
          transaction.processedAt = new Date();
        }, Math.random() * 5000 + 1000); // 1-6 seconds

        return NextResponse.json({ success: true, data: transaction }, { status: 201 });

      case 'create_report':
        const report = {
          id: `erp-rpt-${Date.now()}`,
          name: body.name,
          description: body.description,
          reportType: body.reportType,
          category: body.category,
          parameters: body.parameters || {},
          queryDefinition: body.queryDefinition || {},
          visualizationConfig: body.visualizationConfig || {},
          schedule: body.schedule,
          recipients: body.recipients || [],
          isPublic: body.isPublic || false,
          tenantId: body.tenantId || 'default',
          createdBy: body.createdBy || 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        erpReports.push(report);
        return NextResponse.json({ success: true, data: report }, { status: 201 });

      case 'test_connection':
        const testConnector = erpConnectors.find(c => c.id === body.connectorId);
        if (!testConnector) {
          return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
        }

        // Simulate connection test
        const testResult = {
          connectorId: testConnector.id,
          success: Math.random() > 0.2, // 80% success rate
          responseTime: Math.floor(Math.random() * 2000) + 200,
          message: Math.random() > 0.2 ? 'Connection successful' : 'Connection failed: Authentication error',
          timestamp: new Date()
        };

        if (testResult.success) {
          testConnector.status = 'connected';
        } else {
          testConnector.status = 'error';
        }

        return NextResponse.json({ success: true, data: testResult });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('ERP API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'update_connector':
        const connector = erpConnectors.find(c => c.id === body.connectorId);
        if (connector) {
          Object.assign(connector, body.updates, { updatedAt: new Date() });
          return NextResponse.json({ success: true, data: connector });
        }
        return NextResponse.json({ error: 'Connector not found' }, { status: 404 });

      case 'update_workflow':
        const workflow = erpWorkflows.find(w => w.id === body.workflowId);
        if (workflow) {
          Object.assign(workflow, body.updates, { updatedAt: new Date() });
          return NextResponse.json({ success: true, data: workflow });
        }
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });

      case 'update_transaction_status':
        const transaction = erpTransactions.find(t => t.id === body.transactionId);
        if (transaction) {
          transaction.status = body.status;
          transaction.processedAt = new Date();
          return NextResponse.json({ success: true, data: transaction });
        }
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('ERP API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function encryptCredentials(creds: any): string {
  return JSON.stringify(creds ? { ...creds, encrypted: true } : {});
}