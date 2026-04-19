'use client';

import { useState, useEffect } from 'react';

interface MLAggregates {
  totalModels: number;
  modelsInProduction: number;
  activeExperiments: number;
  totalDatasets: number;
  activeDeployments: number;
  avgModelAccuracy: number;
  recentRuns: number;
}

export default function MLDashboard() {
  const [analytics, setAnalytics] = useState<MLAggregates | null>(null);
  const [models, setModels] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, modelsRes, expRes] = await Promise.all([
        fetch('/api/ml?action=ml_analytics&tenantId=default'),
        fetch('/api/ml?action=models&tenantId=default'),
        fetch('/api/ml?action=experiments&tenantId=default')
      ]);

      const analyticsData = await analyticsRes.json();
      const modelsData = await modelsRes.json();
      const expData = await expRes.json();

      if (analyticsData.success) setAnalytics(analyticsData.data);
      if (modelsData.success) setModels(modelsData.data);
      if (expData.success) setExperiments(expData.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = async () => {
    const response = await fetch('/api/ml?action=create_model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Customer Churn Prediction',
        description: 'Predicts customer churn using historical data',
        tenantId: 'default',
        modelType: 'classification',
        framework: 'tensorflow',
        accuracy: 0.85
      })
    });
    if (response.ok) {
      fetchData();
      alert('Model created successfully!');
    }
  };

  const handleCreateExperiment = async () => {
    const response = await fetch('/api/ml?action=create_experiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hyperparameter Tuning',
        description: 'Tune model hyperparameters',
        tenantId: 'default',
        modelId: models[0]?.id,
        status: 'running'
      })
    });
    if (response.ok) {
      fetchData();
      alert('Experiment started!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ML Operations Platform</h1>
          <div className="flex space-x-4">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleCreateModel}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              New Model
            </button>
            <button
              onClick={handleCreateExperiment}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Start Experiment
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Total Models</p>
            <p className="text-2xl font-bold text-blue-600">{analytics?.totalModels || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-600">In Production</p>
            <p className="text-2xl font-bold text-green-600">{analytics?.modelsInProduction || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Experiments</p>
            <p className="text-2xl font-bold text-purple-600">{analytics?.activeExperiments || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Datasets</p>
            <p className="text-2xl font-bold text-yellow-600">{analytics?.totalDatasets || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Deployments</p>
            <p className="text-2xl font-bold text-orange-600">{analytics?.activeDeployments || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
            <p className="text-2xl font-bold text-indigo-600">
              {((analytics?.avgModelAccuracy || 0) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Models & Experiments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">ML Models</h2>
              <button onClick={handleCreateModel} className="text-blue-600 hover:text-blue-700 text-sm">
                + New Model
              </button>
            </div>
            <div className="space-y-4">
              {models.length > 0 ? models.map((model) => (
                <div key={model.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{model.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      model.status === 'production' ? 'bg-green-100 text-green-800' :
                      model.status === 'staging' ? 'bg-yellow-100 text-yellow-800' :
                      model.status === 'experimenting' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {model.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 font-medium">{model.modelType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Framework:</span>
                      <span className="ml-2 font-medium">{model.framework || 'N/A'}</span>
                    </div>
                    {model.accuracy && (
                      <div>
                        <span className="text-gray-600">Accuracy:</span>
                        <span className="ml-2 font-medium">{(model.accuracy * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Version:</span>
                      <span className="ml-2 font-medium">{model.version}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No models yet</p>
                  <button onClick={handleCreateModel} className="mt-2 text-blue-600 hover:text-blue-700 text-sm">
                    Create your first model
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Experiments</h2>
              <button onClick={handleCreateExperiment} className="text-green-600 hover:text-green-700 text-sm">
                + New Experiment
              </button>
            </div>
            <div className="space-y-4">
              {experiments.length > 0 ? experiments.map((exp) => (
                <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{exp.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      exp.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                      exp.status === 'completed' ? 'bg-green-100 text-green-800' :
                      exp.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {exp.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{exp.description}</p>
                  <div className="text-xs text-gray-500">
                    Started: {new Date(exp.startTime).toLocaleString()}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No experiments yet</p>
                  <button onClick={handleCreateExperiment} className="mt-2 text-green-600 hover:text-green-700 text-sm">
                    Start an experiment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Store & Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ML Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center px-4 py-3 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <span className="text-sm font-medium text-blue-600">Manage Datasets</span>
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-green-600">Run Pipeline</span>
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors">
              <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-purple-600">View Analytics</span>
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-orange-600">Configure</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}