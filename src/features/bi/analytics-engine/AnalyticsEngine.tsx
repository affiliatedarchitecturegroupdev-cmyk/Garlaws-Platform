'use client';

import { useState, useEffect, useCallback } from 'react';
import InteractiveChart from '../visualization/InteractiveChart';

interface AnalyticsModel {
  id: string;
  name: string;
  description: string;
  type: 'predictive' | 'trend' | 'correlation' | 'anomaly' | 'forecasting';
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun: string;
  accuracy?: number;
  parameters: Record<string, any>;
  dataSource: string;
  results?: any;
}

interface AnalyticsEngineProps {
  tenantId?: string;
}

export default function AnalyticsEngine({ tenantId = 'default' }: AnalyticsEngineProps) {
  const [models, setModels] = useState<AnalyticsModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AnalyticsModel | null>(null);
  const [runningModels, setRunningModels] = useState<Set<string>>(new Set());
  const [showModelCreator, setShowModelCreator] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newModel, setNewModel] = useState({
    name: '',
    description: '',
    type: 'predictive' as AnalyticsModel['type'],
    dataSource: '',
    parameters: {} as Record<string, any>
  });

  useEffect(() => {
    fetchModels();
  }, [tenantId]);

  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch(`/api/bi?action=analytics_models&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setModels(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics models:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const createModel = async () => {
    if (!newModel.name || !newModel.dataSource) return;

    try {
      const response = await fetch('/api/bi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_analytics_model',
          tenantId,
          ...newModel
        })
      });

      const data = await response.json();
      if (data.success) {
        setModels([...models, data.data]);
        setShowModelCreator(false);
        setNewModel({
          name: '',
          description: '',
          type: 'predictive',
          dataSource: '',
          parameters: {}
        });
      }
    } catch (error) {
      console.error('Failed to create analytics model:', error);
    }
  };

  const runModel = async (modelId: string) => {
    setRunningModels(prev => new Set(prev).add(modelId));

    try {
      // Update model status to running
      setModels(models.map(m =>
        m.id === modelId ? { ...m, status: 'running' as const } : m
      ));

      const response = await fetch('/api/bi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run_analytics_model',
          tenantId,
          modelId
        })
      });

      const data = await response.json();
      if (data.success) {
        setModels(models.map(m =>
          m.id === modelId ? {
            ...m,
            status: 'completed' as const,
            lastRun: new Date().toISOString(),
            results: data.data.results,
            accuracy: data.data.accuracy
          } : m
        ));

        if (selectedModel?.id === modelId) {
          setSelectedModel(prev => prev ? {
            ...prev,
            status: 'completed',
            lastRun: new Date().toISOString(),
            results: data.data.results,
            accuracy: data.data.accuracy
          } : null);
        }
      } else {
        // Update status to failed
        setModels(models.map(m =>
          m.id === modelId ? { ...m, status: 'failed' as const } : m
        ));
      }
    } catch (error) {
      console.error('Failed to run analytics model:', error);
      setModels(models.map(m =>
        m.id === modelId ? { ...m, status: 'failed' as const } : m
      ));
    } finally {
      setRunningModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
    }
  };

  const deleteModel = async (modelId: string) => {
    try {
      const response = await fetch('/api/bi', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_analytics_model',
          tenantId,
          modelId
        })
      });

      if (response.ok) {
        setModels(models.filter(m => m.id !== modelId));
        if (selectedModel?.id === modelId) {
          setSelectedModel(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete analytics model:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-100 text-gray-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'predictive': return 'bg-purple-100 text-purple-800';
      case 'trend': return 'bg-blue-100 text-blue-800';
      case 'correlation': return 'bg-green-100 text-green-800';
      case 'anomaly': return 'bg-yellow-100 text-yellow-800';
      case 'forecasting': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderModelResults = (model: AnalyticsModel) => {
    if (!model.results) return null;

    switch (model.type) {
      case 'predictive':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{model.results.prediction}</div>
                <div className="text-sm text-gray-600">Prediction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{model.accuracy?.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{model.results.confidence.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Confidence</div>
              </div>
            </div>

            {model.results.chartData && (
              <InteractiveChart
                title="Prediction Analysis"
                data={model.results.chartData}
                chartType="line"
                height={300}
              />
            )}
          </div>
        );

      case 'trend':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Trend Direction</div>
                <div className="text-lg font-semibold">
                  {model.results.direction === 'up' ? '↗️ Increasing' :
                   model.results.direction === 'down' ? '↘️ Decreasing' : '→ Stable'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Trend Strength</div>
                <div className="text-lg font-semibold">{model.results.strength.toFixed(1)}%</div>
              </div>
            </div>

            {model.results.chartData && (
              <InteractiveChart
                title="Trend Analysis"
                data={model.results.chartData}
                chartType="area"
                height={300}
              />
            )}
          </div>
        );

      case 'correlation':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-600">{model.results.correlation.toFixed(3)}</div>
              <div className="text-sm text-gray-600">Correlation Coefficient</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Variable 1</div>
                <div className="text-lg font-semibold">{model.results.variable1}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Variable 2</div>
                <div className="text-lg font-semibold">{model.results.variable2}</div>
              </div>
            </div>

            {model.results.chartData && (
              <InteractiveChart
                title="Correlation Scatter Plot"
                data={model.results.chartData}
                chartType="line"
                height={300}
              />
            )}
          </div>
        );

      case 'anomaly':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{model.results.anomalyCount}</div>
                <div className="text-sm text-gray-600">Anomalies Detected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{model.results.threshold}</div>
                <div className="text-sm text-gray-600">Threshold</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{model.accuracy?.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Detection Accuracy</div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Anomaly Details</h5>
              <div className="max-h-40 overflow-y-auto">
                {model.results.anomalies?.map((anomaly: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-sm">{anomaly.timestamp}</span>
                    <span className="text-sm text-red-600">Value: {anomaly.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {model.results.chartData && (
              <InteractiveChart
                title="Anomaly Detection"
                data={model.results.chartData}
                chartType="line"
                height={300}
              />
            )}
          </div>
        );

      case 'forecasting':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{model.results.forecastPeriod}</div>
                <div className="text-sm text-gray-600">Forecast Period</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{model.results.forecastValue}</div>
                <div className="text-sm text-gray-600">Forecast Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{model.results.confidenceInterval}%</div>
                <div className="text-sm text-gray-600">Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{model.accuracy?.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Model Accuracy</div>
              </div>
            </div>

            {model.results.chartData && (
              <InteractiveChart
                title="Forecast Analysis"
                data={model.results.chartData}
                chartType="line"
                height={300}
              />
            )}
          </div>
        );

      default:
        return <div>Results visualization not available for this model type</div>;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Engine</h2>
        <button
          onClick={() => setShowModelCreator(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Model
        </button>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <div
            key={model.id}
            className={`bg-white p-6 rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${
              selectedModel?.id === model.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
            }`}
            onClick={() => setSelectedModel(model)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(model.type)}`}>
                  {model.type}
                </span>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(model.status)}`}>
                {model.status}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4">{model.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Data Source:</span>
                <span className="text-gray-900 font-mono text-xs">{model.dataSource}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Run:</span>
                <span className="text-gray-900">
                  {model.lastRun ? new Date(model.lastRun).toLocaleDateString() : 'Never'}
                </span>
              </div>
              {model.accuracy && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="text-green-600 font-semibold">{model.accuracy.toFixed(1)}%</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  runModel(model.id);
                }}
                disabled={runningModels.has(model.id) || model.status === 'running'}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  runningModels.has(model.id) || model.status === 'running'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {runningModels.has(model.id) ? 'Running...' : 'Run Model'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteModel(model.id);
                }}
                className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Model Detail Modal */}
      {selectedModel && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{selectedModel.name}</h3>
              <button
                onClick={() => setSelectedModel(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">Model Configuration</h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Type</div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedModel.type)}`}>
                      {selectedModel.type}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedModel.status)}`}>
                      {selectedModel.status}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Data Source</div>
                    <div className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded mt-1">
                      {selectedModel.dataSource}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Description</div>
                    <div className="text-sm text-gray-900 mt-1">{selectedModel.description}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Parameters</div>
                    <pre className="text-xs text-gray-900 bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(selectedModel.parameters, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">Execution Details</h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Last Run</div>
                    <div className="text-sm text-gray-900">
                      {selectedModel.lastRun ? new Date(selectedModel.lastRun).toLocaleString() : 'Never executed'}
                    </div>
                  </div>

                  {selectedModel.accuracy && (
                    <div>
                      <div className="text-sm text-gray-600">Model Accuracy</div>
                      <div className="text-lg font-semibold text-green-600">{selectedModel.accuracy.toFixed(1)}%</div>
                    </div>
                  )}

                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => runModel(selectedModel.id)}
                      disabled={runningModels.has(selectedModel.id) || selectedModel.status === 'running'}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        runningModels.has(selectedModel.id) || selectedModel.status === 'running'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {runningModels.has(selectedModel.id) ? 'Running...' : 'Run Analysis'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Results */}
            {selectedModel.results && (
              <div>
                <h4 className="text-lg font-semibold mb-3">Analysis Results</h4>
                {renderModelResults(selectedModel)}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedModel(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Model Form */}
      {showModelCreator && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New Analytics Model</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Name *</label>
              <input
                type="text"
                value={newModel.name}
                onChange={(e) => setNewModel({...newModel, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Type</label>
              <select
                value={newModel.type}
                onChange={(e) => setNewModel({...newModel, type: e.target.value as AnalyticsModel['type']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="predictive">Predictive Analytics</option>
                <option value="trend">Trend Analysis</option>
                <option value="correlation">Correlation Analysis</option>
                <option value="anomaly">Anomaly Detection</option>
                <option value="forecasting">Forecasting</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newModel.description}
                onChange={(e) => setNewModel({...newModel, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Source *</label>
              <input
                type="text"
                value={newModel.dataSource}
                onChange={(e) => setNewModel({...newModel, dataSource: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="API endpoint or data query"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-md font-semibold mb-3">Model Parameters</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Window</label>
                <select
                  value={newModel.parameters.timeWindow || '30d'}
                  onChange={(e) => setNewModel({
                    ...newModel,
                    parameters: {...newModel.parameters, timeWindow: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="90d">90 Days</option>
                  <option value="1y">1 Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confidence Level</label>
                <select
                  value={newModel.parameters.confidence || '95'}
                  onChange={(e) => setNewModel({
                    ...newModel,
                    parameters: {...newModel.parameters, confidence: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="90">90%</option>
                  <option value="95">95%</option>
                  <option value="99">99%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Algorithm</label>
                <select
                  value={newModel.parameters.algorithm || 'auto'}
                  onChange={(e) => setNewModel({
                    ...newModel,
                    parameters: {...newModel.parameters, algorithm: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="auto">Auto-select</option>
                  <option value="linear">Linear Regression</option>
                  <option value="polynomial">Polynomial</option>
                  <option value="arima">ARIMA</option>
                  <option value="neural">Neural Network</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex space-x-3">
            <button
              onClick={createModel}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Create Model
            </button>
            <button
              onClick={() => setShowModelCreator(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}