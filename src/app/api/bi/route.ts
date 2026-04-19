import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo - in production would use database
const dashboards: any[] = [];
const widgets: any[] = [];
const reports: any[] = [];
const kpis: any[] = [];
const analyticsData: any[] = [];
const alerts: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tenantId = searchParams.get('tenantId');

    switch (action) {
      case 'dashboards':
        return NextResponse.json({
          success: true,
          data: dashboards.filter(d => !tenantId || d.tenantId === tenantId)
        });

      case 'widgets':
        const dashboardId = searchParams.get('dashboardId');
        let filteredWidgets = widgets.filter(w => !tenantId || w.tenantId === tenantId);
        if (dashboardId) {
          filteredWidgets = filteredWidgets.filter(w => w.dashboardId === dashboardId);
        }
        return NextResponse.json({
          success: true,
          data: filteredWidgets
        });

      case 'reports':
        return NextResponse.json({
          success: true,
          data: reports.filter(r => !tenantId || r.tenantId === tenantId)
        });

      case 'kpis':
        return NextResponse.json({
          success: true,
          data: kpis.filter(k => !tenantId || k.tenantId === tenantId)
        });

      case 'analytics':
        const category = searchParams.get('category');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        let filteredData = analyticsData.filter(a => !tenantId || a.tenantId === tenantId);
        if (category) {
          filteredData = filteredData.filter(a => a.category === category);
        }
        if (startDate && endDate) {
          filteredData = filteredData.filter(a =>
            new Date(a.timestamp) >= new Date(startDate) &&
            new Date(a.timestamp) <= new Date(endDate)
          );
        }

        return NextResponse.json({
          success: true,
          data: filteredData
        });

      case 'alerts':
        return NextResponse.json({
          success: true,
          data: alerts.filter(a => !tenantId || a.tenantId === tenantId)
        });

      case 'dashboard_data':
        const dashId = searchParams.get('dashboardId');
        if (!dashId) {
          return NextResponse.json({ error: 'dashboardId required' }, { status: 400 });
        }

        const dashboard = dashboards.find(d => d.id === dashId);
        if (!dashboard) {
          return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
        }

        const dashboardWidgets = widgets.filter(w => w.dashboardId === dashId);
        const widgetData = await Promise.all(
          dashboardWidgets.map(async (widget: any) => {
            // Simulate data fetching based on widget config
            const data = await fetchWidgetData(widget);
            return { ...widget, data };
          })
        );

        return NextResponse.json({
          success: true,
          data: { dashboard, widgets: widgetData }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('BI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
      case 'create_dashboard':
        const newDashboard = {
          id: `dash-${Date.now()}`,
          ...body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        dashboards.push(newDashboard);
        return NextResponse.json({
          success: true,
          data: newDashboard
        }, { status: 201 });

      case 'create_widget':
        const newWidget = {
          id: `widget-${Date.now()}`,
          ...body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        widgets.push(newWidget);
        return NextResponse.json({
          success: true,
          data: newWidget
        }, { status: 201 });

      case 'create_report':
        const newReport = {
          id: `report-${Date.now()}`,
          ...body,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        reports.push(newReport);
        return NextResponse.json({
          success: true,
          data: newReport
        }, { status: 201 });

      case 'create_kpi':
        const newKpi = {
          id: `kpi-${Date.now()}`,
          ...body,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        kpis.push(newKpi);
        return NextResponse.json({
          success: true,
          data: newKpi
        }, { status: 201 });

      case 'generate_report':
        const { reportId, parameters, format } = body;
        const report = reports.find(r => r.id === reportId);
        if (!report) {
          return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        // Simulate report generation
        const generatedReport = {
          id: `gen-${Date.now()}`,
          reportId,
          parameters,
          format: format || 'pdf',
          data: await generateReportData(report, parameters),
          generatedAt: new Date()
        };

        return NextResponse.json({
          success: true,
          data: generatedReport
        });

      case 'run_predictive_model':
        const { modelId, inputData } = body;
        // Simulate predictive model execution
        const prediction = {
          modelId,
          inputData,
          prediction: Math.random() * 100, // Mock prediction
          confidence: 0.85,
          timestamp: new Date()
        };

        return NextResponse.json({
          success: true,
          data: prediction
        });

      case 'create_alert':
        const newAlert = {
          id: `alert-${Date.now()}`,
          ...body,
          status: 'active',
          createdAt: new Date()
        };
        alerts.push(newAlert);
        return NextResponse.json({
          success: true,
          data: newAlert
        }, { status: 201 });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('BI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'update_dashboard':
        const dashboard = dashboards.find(d => d.id === body.dashboardId);
        if (!dashboard) {
          return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
        }

        Object.assign(dashboard, body.updates, { updatedAt: new Date() });
        return NextResponse.json({
          success: true,
          data: dashboard
        });

      case 'acknowledge_alert':
        const alert = alerts.find(a => a.id === body.alertId);
        if (!alert) {
          return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
        }

        alert.status = 'acknowledged';
        alert.acknowledgedAt = new Date();
        return NextResponse.json({
          success: true,
          data: alert
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('BI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
async function fetchWidgetData(widget: any) {
  // Simulate data fetching based on widget configuration
  switch (widget.widgetType) {
    case 'metric':
      return { value: Math.floor(Math.random() * 1000), trend: Math.random() > 0.5 ? 'up' : 'down' };
    case 'chart':
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100))
      };
    case 'table':
      return {
        headers: ['Name', 'Value', 'Status'],
        rows: Array.from({ length: 5 }, (_, i) => [
          `Item ${i + 1}`,
          Math.floor(Math.random() * 1000),
          Math.random() > 0.5 ? 'Active' : 'Inactive'
        ])
      };
    default:
      return {};
  }
}

async function generateReportData(report: any, parameters: any) {
  // Simulate report data generation
  return {
    title: report.name,
    generatedAt: new Date(),
    parameters,
    summary: {
      totalRecords: Math.floor(Math.random() * 1000),
      totalValue: Math.floor(Math.random() * 100000),
      averageValue: Math.floor(Math.random() * 1000)
    },
    data: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Record ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
      status: Math.random() > 0.5 ? 'Active' : 'Inactive'
    }))
  };
}