import { NextRequest, NextResponse } from 'next/server';

// In-memory mock storage
const mlModels: any[] = [];
const datasets: any[] = [];
const experiments: any[] = [];
const pipelines: any[] = [];
const deployments: any[] = [];
const abTests: any[] = [];
const features: any[] = [];
const chatConversations: any[] = [];
const equipment: any[] = [];
const predictions: any[] = [];
const recommendations: any[] = [];
const workflows: any[] = [];

// Initialize sample data
if (equipment.length === 0) {
  equipment.push(
    {
      id: '1',
      name: 'HVAC Unit A1',
      type: 'Heating System',
      location: 'Building A - Floor 1',
      status: 'healthy',
      lastMaintenance: '2026-03-15',
      nextMaintenance: '2026-06-15',
      healthScore: 85,
      sensors: [
        { id: 'temp1', name: 'Temperature Sensor', value: 22.5, unit: '°C', threshold: { warning: 25, critical: 30 }, trend: 'stable' },
        { id: 'vib1', name: 'Vibration Sensor', value: 0.8, unit: 'mm/s', threshold: { warning: 2.0, critical: 3.0 }, trend: 'stable' }
      ]
    },
    {
      id: '2',
      name: 'Elevator Motor B2',
      type: 'Elevator System',
      location: 'Building B - Floor 2',
      status: 'warning',
      lastMaintenance: '2026-02-20',
      nextMaintenance: '2026-05-20',
      healthScore: 65,
      sensors: [
        { id: 'current1', name: 'Current Draw', value: 18.5, unit: 'A', threshold: { warning: 20, critical: 25 }, trend: 'increasing' }
      ]
    }
  );
}

if (predictions.length === 0) {
  predictions.push(
    {
      equipmentId: '2',
      predictedFailureDate: '2026-05-10',
      confidence: 78,
      riskFactors: ['High current draw', 'Age > 5 years'],
      recommendedActions: ['Schedule maintenance inspection', 'Replace motor bearings'],
      estimatedCost: 2500
    }
  );
}

if (recommendations.length === 0) {
  recommendations.push(
    {
      id: '1',
      type: 'optimization',
      title: 'Optimize Inventory Management',
      description: 'Based on usage patterns, you can reduce inventory holding costs by 15% through better forecasting.',
      confidence: 85,
      impact: 'high',
      category: 'operations',
      data: { potentialSavings: 50000, implementationTime: '3 months' },
      actions: [
        { label: 'Implement AI Forecasting', type: 'primary', action: 'start_forecasting' },
        { label: 'Review Current Stock', type: 'secondary', action: 'audit_inventory' }
      ],
      createdAt: '2026-04-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'product',
      title: 'New Service Opportunity',
      description: 'Customer data analysis shows high demand for premium landscaping services in suburban areas.',
      confidence: 72,
      impact: 'medium',
      category: 'products',
      data: { targetMarket: 'suburban', projectedRevenue: 75000 },
      actions: [
        { label: 'Develop Service Package', type: 'primary', action: 'create_service' },
        { label: 'Market Research', type: 'secondary', action: 'research_market' }
      ],
      createdAt: '2026-04-18T14:20:00Z'
    }
  );
}

if (workflows.length === 0) {
  workflows.push(
    {
      id: '1',
      name: 'Maintenance Request Processing',
      description: 'Automated workflow for processing maintenance requests from submission to completion.',
      status: 'active',
      trigger: { type: 'event', config: { eventType: 'maintenance_request_submitted' } },
      actions: [
        { id: '1', type: 'notification', config: { recipient: 'technician', message: 'New maintenance request assigned' }, order: 1 },
        { id: '2', type: 'database_update', config: { table: 'maintenance_requests', action: 'update_status', status: 'assigned' }, order: 2 },
        { id: '3', type: 'email', config: { template: 'maintenance_assigned', recipient: 'customer' }, order: 3 }
      ],
      executions: [
        { id: 'exec1', startedAt: '2026-04-19T09:00:00Z', completedAt: '2026-04-19T09:05:00Z', status: 'completed' },
        { id: 'exec2', startedAt: '2026-04-18T14:30:00Z', completedAt: '2026-04-18T14:35:00Z', status: 'completed' }
      ],
      createdAt: '2026-04-01T10:00:00Z',
      successRate: 95
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tenantId = searchParams.get('tenantId');

    switch (action) {
      case 'models':
        return NextResponse.json({
          success: true,
          data: mlModels.filter(m => !tenantId || m.tenantId === tenantId)
        });

      case 'datasets':
        return NextResponse.json({
          success: true,
          data: datasets.filter(d => !tenantId || d.tenantId === tenantId)
        });

      case 'experiments':
        return NextResponse.json({
          success: true,
          data: experiments.filter(e => !tenantId || e.tenantId === tenantId)
        });

      case 'pipelines':
        return NextResponse.json({
          success: true,
          data: pipelines.filter(p => !tenantId || p.tenantId === tenantId)
        });

      case 'deployments':
        return NextResponse.json({
          success: true,
          data: deployments.filter(d => !tenantId || d.tenantId === tenantId)
        });

      case 'ab_tests':
        return NextResponse.json({
          success: true,
          data: abTests.filter(t => !tenantId || t.tenantId === tenantId)
        });

      case 'feature_store':
        return NextResponse.json({
          success: true,
          data: features.filter(f => !tenantId || f.tenantId === tenantId)
        });

      case 'equipment':
        return NextResponse.json({
          success: true,
          data: equipment.filter(e => !tenantId || e.tenantId === tenantId)
        });

      case 'predictions':
        return NextResponse.json({
          success: true,
          data: predictions.filter(p => !tenantId || p.tenantId === tenantId)
        });

      case 'recommendations':
        const sortBy = searchParams.get('sort') || 'confidence';
        const impactFilter = searchParams.get('impact') || 'all';
        const categoryFilter = searchParams.get('category') || 'all';

        let filteredRecs = recommendations.filter(r => !tenantId || r.tenantId === tenantId);

        if (categoryFilter !== 'all') {
          filteredRecs = filteredRecs.filter(r => r.category === categoryFilter);
        }

        if (impactFilter !== 'all') {
          filteredRecs = filteredRecs.filter(r => r.impact === impactFilter);
        }

        // Sort recommendations
        filteredRecs.sort((a, b) => {
          if (sortBy === 'impact') {
            const impactOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
            return impactOrder[b.impact as keyof typeof impactOrder] - impactOrder[a.impact as keyof typeof impactOrder];
          }
          return b.confidence - a.confidence;
        });

        return NextResponse.json({ success: true, data: filteredRecs });

      case 'workflows':
        return NextResponse.json({
          success: true,
          data: workflows.filter(w => !tenantId || w.tenantId === tenantId)
        });

      case 'ml_analytics':
        const analytics = {
          totalModels: mlModels.length,
          modelsInProduction: mlModels.filter(m => m.status === 'production').length,
          activeExperiments: experiments.filter(e => e.status === 'running').length,
          totalDatasets: datasets.length,
          activeDeployments: deployments.filter(d => d.status === 'active').length,
          avgModelAccuracy: mlModels.length > 0 ? mlModels.reduce((sum, m) => sum + (m.accuracy || 0), 0) / mlModels.length : 0,
          recentRuns: experiments.length
        };
        return NextResponse.json({ success: true, data: analytics });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('ML API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'create_model':
        const model = {
          id: `model-${Date.now()}`,
          name: body.name,
          description: body.description,
          tenantId: body.tenantId || 'default',
          version: '1.0.0',
          modelType: body.modelType || 'classification',
          framework: body.framework,
          algorithm: body.algorithm,
          hyperparameters: body.hyperparameters || {},
          modelArtifactUrl: body.modelArtifactUrl || '',
          modelSize: body.modelSize || 0,
          status: 'experimenting',
          accuracy: body.accuracy || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mlModels.push(model);
        return NextResponse.json({ success: true, data: model }, { status: 201 });

      case 'create_dataset':
        const dataset = {
          id: `ds-${Date.now()}`,
          name: body.name,
          description: body.description,
          tenantId: body.tenantId || 'default',
          version: body.version || '1.0',
          datasetType: body.datasetType || 'training',
          format: body.format || 'csv',
          storageLocation: body.storageLocation,
          size: body.size || 0,
          rowCount: body.rowCount || 0,
          columnCount: body.columnCount || 0,
          schema: body.schema || {},
          statistics: body.statistics || {},
          createdBy: body.createdBy || 'system',
          createdAt: new Date()
        };
        datasets.push(dataset);
        return NextResponse.json({ success: true, data: dataset }, { status: 201 });

      case 'create_experiment':
        const experiment = {
          id: `exp-${Date.now()}`,
          name: body.name,
          description: body.description,
          tenantId: body.tenantId || 'default',
          modelId: body.modelId,
          datasetId: body.datasetId,
          status: 'running',
          hyperparameters: body.hyperparameters || {},
          configuration: body.configuration || {},
          startTime: new Date(),
          createdBy: body.createdBy || 'system',
          createdAt: new Date()
        };
        experiments.push(experiment);
        return NextResponse.json({ success: true, data: experiment }, { status: 201 });

      case 'create_pipeline':
        const pipeline = {
          id: `pipe-${Date.now()}`,
          name: body.name,
          description: body.description,
          tenantId: body.tenantId || 'default',
          version: body.version || '1.0',
          pipelineType: body.pipelineType || 'training',
          definition: body.definition || {},
          schedule: body.schedule || '0 0 * * *',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        pipelines.push(pipeline);
        return NextResponse.json({ success: true, data: pipeline }, { status: 201 });

      case 'deploy_model':
        const deployment = {
          id: `dep-${Date.now()}`,
          name: body.name,
          modelId: body.modelId,
          environment: body.environment || 'staging',
          deploymentType: body.deploymentType || 'rest',
          endpointUrl: body.endpointUrl || `https://api.garlaws.com/models/${body.modelId}`,
          status: 'deploying',
          replicas: body.replicas || 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        deployments.push(deployment);
        // Simulate deployment ready after a few seconds
        setTimeout(() => {
          deployment.status = 'active';
        }, 2000);
        return NextResponse.json({ success: true, data: deployment }, { status: 201 });

      case 'create_ab_test':
        const test = {
          id: `ab-${Date.now()}`,
          name: body.name,
          description: body.description,
          tenantId: body.tenantId || 'default',
          modelAId: body.modelAId,
          modelBId: body.modelBId,
          trafficSplit: body.trafficSplit || 0.5,
          status: 'draft',
          hypothesis: body.hypothesis || '',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        abTests.push(test);
        return NextResponse.json({ success: true, data: test }, { status: 201 });

      case 'create_feature':
        const feature = {
          id: `feat-${Date.now()}`,
          name: body.name,
          description: body.description,
          tenantId: body.tenantId || 'default',
          featureType: body.featureType || 'numerical',
          dataType: body.dataType || 'float',
          defaultValue: body.defaultValue,
          validationRules: body.validationRules || {},
          version: body.version || '1.0',
          isActive: true,
          createdBy: body.createdBy || 'system',
          createdAt: new Date()
        };
        features.push(feature);
        return NextResponse.json({ success: true, data: feature }, { status: 201 });

      case 'chat':
        // Mock AI response based on context
        const responses = {
          general: "I've analyzed your request. Based on current data patterns, I recommend optimizing your resource allocation by 15% through predictive scheduling. Would you like me to show you the detailed analysis?",
          maintenance: "For maintenance optimization, I suggest implementing condition-based monitoring for your HVAC systems. This could reduce downtime by 30% and extend equipment life by 2 years.",
          financial: "Financial analysis shows opportunities for cost reduction in procurement processes. I recommend implementing automated approval workflows, which could save approximately R50,000 monthly.",
          crm: "Customer data analysis reveals that implementing personalized communication strategies could increase customer retention by 25%. I recommend setting up automated segmentation and targeted campaigns.",
          supply: "Supply chain analysis indicates inventory optimization could reduce carrying costs by 18%. I suggest implementing demand forecasting and just-in-time replenishment strategies."
        };

        const aiResponse = {
          content: responses[body.context as keyof typeof responses] || responses.general,
          type: 'text',
          metadata: {
            confidence: Math.floor(Math.random() * 20) + 80,
            intent: 'recommendation',
            entities: ['optimization', 'cost_savings'],
            suggestions: [
              'View detailed analytics',
              'Implement recommended changes',
              'Schedule follow-up review'
            ]
          }
        };
        return NextResponse.json({ success: true, response: aiResponse });

      case 'schedule-maintenance':
        // Mock maintenance scheduling
        return NextResponse.json({ success: true, message: 'Maintenance scheduled successfully' });

      case 'execute-recommendation':
        // Mock recommendation execution
        return NextResponse.json({ success: true, message: 'Recommendation action executed' });

      case 'dismiss-recommendation':
        // Mock recommendation dismissal
        return NextResponse.json({ success: true, message: 'Recommendation dismissed' });

      case 'create-workflow':
        const newWorkflow = {
          id: `wf-${Date.now()}`,
          name: body.name,
          description: body.description,
          tenantId: body.tenantId || 'default',
          status: 'active',
          trigger: body.trigger,
          actions: body.actions || [],
          conditions: body.conditions || [],
          executions: [],
          createdAt: new Date().toISOString(),
          successRate: 100
        };
        workflows.push(newWorkflow);
        return NextResponse.json({ success: true, data: newWorkflow }, { status: 201 });

      case 'create-gantt-task':
        const ganttTask = {
          id: `task-${Date.now()}`,
          title: body.title,
          description: body.description,
          startDate: body.startDate,
          endDate: body.endDate,
          progress: body.progress || 0,
          status: 'todo',
          tenantId: body.tenantId || 'default',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        // Add to equipment or tasks array as needed
        return NextResponse.json({ success: true, data: ganttTask }, { status: 201 });

      case 'create-project-from-template':
        // Mock project creation
        const project = {
          id: `proj-${Date.now()}`,
          name: body.name,
          description: body.description,
          templateId: body.templateId,
          startDate: body.startDate,
          status: 'planning',
          tenantId: body.tenantId || 'default',
          createdAt: new Date().toISOString()
        };
        return NextResponse.json({ success: true, data: project }, { status: 201 });

      case 'record_metric':
        const metric = {
          id: `metric-${Date.now()}`,
          modelId: body.modelId,
          deploymentId: body.deploymentId || null,
          metricName: body.metricName,
          metricValue: body.metricValue,
          timestamp: new Date(),
          labels: body.labels || {},
          createdAt: new Date()
        };
        // In real implementation, store in model_metrics table
        return NextResponse.json({ success: true, data: metric }, { status: 201 });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('ML API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'update_model':
        const model = mlModels.find(m => m.id === body.modelId);
        if (model) {
          Object.assign(model, body.updates, { updatedAt: new Date() });
          return NextResponse.json({ success: true, data: model });
        }
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });

      case 'start_experiment':
        const exp = experiments.find(e => e.id === body.experimentId);
        if (exp) {
          exp.status = 'running';
          exp.startTime = new Date();
          return NextResponse.json({ success: true, data: exp });
        }
        return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });

      case 'complete_experiment':
        const completedExp = experiments.find(e => e.id === body.experimentId);
        if (completedExp) {
          completedExp.status = 'completed';
          completedExp.endTime = new Date();
          return NextResponse.json({ success: true, data: completedExp });
        }
        return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });

      case 'update-task-status':
        // Mock task status update
        return NextResponse.json({ success: true, message: 'Task status updated' });

      case 'update-task-progress':
        // Mock task progress update
        return NextResponse.json({ success: true, message: 'Task progress updated' });

      case 'assign-resource':
        // Mock resource assignment
        return NextResponse.json({
          success: true,
          data: {
            task: { id: body.taskId, assignee: 'assigned_user' },
            resource: { id: body.resourceId, allocatedHours: 8 }
          }
        });

      case 'update-workflow-status':
        const workflow = workflows.find(w => w.id === body.workflowId);
        if (workflow) {
          workflow.status = body.status;
          return NextResponse.json({ success: true, data: workflow });
        }
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });

      case 'execute-workflow':
        const workflowToExecute = workflows.find(w => w.id === body.workflowId);
        if (workflowToExecute) {
          const execution: any = {
            id: `exec-${Date.now()}`,
            startedAt: new Date().toISOString(),
            status: 'running'
          };
          workflowToExecute.executions.push(execution);

          // Simulate completion after a delay (in real app, this would be async)
          setTimeout(() => {
            execution.status = 'completed';
            execution.completedAt = new Date().toISOString();
          }, 1000);

          return NextResponse.json({ success: true, message: 'Workflow execution started' });
        }
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('ML API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}