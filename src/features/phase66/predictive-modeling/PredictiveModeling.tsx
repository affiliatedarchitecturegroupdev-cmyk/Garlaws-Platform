'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PredictionModel {
  id: string;
  name: string;
  type: 'regression' | 'classification' | 'time_series';
  accuracy: number;
  uncertainty: number;
  confidence: number;
  lastUpdated: string;
  features: number;
  predictions: number;
}

interface UncertaintyQuantification {
  mean: number;
  std: number;
  confidence_interval: [number, number];
  p10: number;
  p50: number;
  p90: number;
}

interface PredictionResult {
  timestamp: string;
  predicted_value: number;
  actual_value?: number;
  uncertainty: UncertaintyQuantification;
  confidence: number;
}

const predictionModels: PredictionModel[] = [
  {
    id: 'prop_value_pred',
    name: 'Property Value Predictor',
    type: 'regression',
    accuracy: 0.92,
    uncertainty: 0.08,
    confidence: 0.94,
    lastUpdated: '2026-04-21',
    features: 15,
    predictions: 1247
  },
  {
    id: 'maintenance_forecast',
    name: 'Maintenance Cost Forecaster',
    type: 'time_series',
    accuracy: 0.88,
    uncertainty: 0.12,
    confidence: 0.89,
    lastUpdated: '2026-04-20',
    features: 8,
    predictions: 892
  },
  {
    id: 'occupancy_classifier',
    name: 'Occupancy Rate Classifier',
    type: 'classification',
    accuracy: 0.95,
    uncertainty: 0.05,
    confidence: 0.96,
    lastUpdated: '2026-04-19',
    features: 12,
    predictions: 2156
  }
];

const predictionResults: PredictionResult[] = [
  {
    timestamp: '2026-04-21T15:00:00Z',
    predicted_value: 450000,
    actual_value: 447500,
    uncertainty: {
      mean: 450000,
      std: 12500,
      confidence_interval: [425000, 475000],
      p10: 433750,
      p50: 450000,
      p90: 466250
    },
    confidence: 0.94
  },
  {
    timestamp: '2026-04-21T14:30:00Z',
    predicted_value: 3200,
    actual_value: 3150,
    uncertainty: {
      mean: 3200,
      std: 180,
      confidence_interval: [3040, 3360],
      p10: 3106,
      p50: 3200,
      p90: 3294
    },
    confidence: 0.91
  },
  {
    timestamp: '2026-04-21T14:00:00Z',
    predicted_value: 94.2,
    uncertainty: {
      mean: 94.2,
      std: 2.1,
      confidence_interval: [90.0, 98.4],
      p10: 91.5,
      p50: 94.2,
      p90: 96.9
    },
    confidence: 0.96
  }
];

export default function PredictiveModeling() {
  const [selectedModel, setSelectedModel] = useState<PredictionModel | null>(null);
  const [selectedResult, setSelectedResult] = useState<PredictionResult | null>(null);
  const [isRunningPrediction, setIsRunningPrediction] = useState(false);
  const [predictionInput, setPredictionInput] = useState<Record<string, any>>({});

  const runPrediction = async (model: PredictionModel) => {
    setIsRunningPrediction(true);
    // Simulate prediction process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRunningPrediction(false);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy > 0.9) return 'bg-green-500';
    if (accuracy > 0.8) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getUncertaintyColor = (uncertainty: number) => {
    if (uncertainty < 0.1) return 'bg-green-500';
    if (uncertainty < 0.2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🔮</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Predictive Modeling</span>
            </Link>

            <div className="flex items-center gap-8">
              <Link href="/predictive" className="text-gray-600 hover:text-gray-900">Models</Link>
              <Link href="/uncertainty" className="text-gray-600 hover:text-gray-900">Uncertainty</Link>
              <Link href="/forecasting" className="text-gray-600 hover:text-gray-900">Forecasting</Link>
              <Link href="/validation" className="text-gray-600 hover:text-gray-900">Validation</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Predictive Modeling with Uncertainty</h1>
          <p className="text-gray-600">Advanced forecasting with uncertainty quantification and confidence intervals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Models</p>
                <p className="text-2xl font-bold text-gray-900">{predictionModels.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">🤖</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(predictionModels.reduce((sum, m) => sum + m.accuracy, 0) / predictionModels.length * 100).toFixed(1)}%
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Uncertainty</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(predictionModels.reduce((sum, m) => sum + m.uncertainty, 0) / predictionModels.length * 100).toFixed(1)}%
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-sm">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Predictions Made</p>
                <p className="text-2xl font-bold text-gray-900">
                  {predictionModels.reduce((sum, m) => sum + m.predictions, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm">📈</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Prediction Models</h2>

            <div className="space-y-4">
              {predictionModels.map((model) => (
                <div
                  key={model.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer"
                  onClick={() => setSelectedModel(model)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{model.name}</h3>
                      <p className="text-sm text-gray-600">{model.type} • {model.features} features</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      model.type === 'regression' ? 'bg-blue-100 text-blue-800' :
                      model.type === 'classification' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {model.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Accuracy</p>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getAccuracyColor(model.accuracy)}`}
                            style={{ width: `${model.accuracy * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-900">{(model.accuracy * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-600">Uncertainty</p>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getUncertaintyColor(model.uncertainty)}`}
                            style={{ width: `${model.uncertainty * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-900">{(model.uncertainty * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-600">Confidence</p>
                      <span className="text-gray-900">{(model.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>{model.predictions.toLocaleString()} predictions</span>
                    <span>Updated {model.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Predictions</h2>

            <div className="space-y-4">
              {predictionResults.map((result, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer"
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      ${result.predicted_value.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {result.actual_value && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-600">Actual:</span>
                      <span className="text-xs text-gray-900">${result.actual_value.toLocaleString()}</span>
                      <span className={`text-xs ${
                        Math.abs(result.predicted_value - result.actual_value) / result.predicted_value < 0.05
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ({((result.predicted_value - result.actual_value) / result.predicted_value * 100).toFixed(1)}%)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      Confidence: {(result.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="text-gray-600">
                      ±${result.uncertainty.std.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">Confidence Interval</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        ${result.uncertainty.confidence_interval[0].toLocaleString()}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1 relative">
                        <div
                          className="bg-blue-500 h-1 rounded-full absolute"
                          style={{
                            left: `${((result.uncertainty.p10 - result.uncertainty.confidence_interval[0]) /
                                   (result.uncertainty.confidence_interval[1] - result.uncertainty.confidence_interval[0])) * 100}%`,
                            width: `${((result.uncertainty.p90 - result.uncertainty.p10) /
                                     (result.uncertainty.confidence_interval[1] - result.uncertainty.confidence_interval[0])) * 100}%`
                          }}
                        />
                        <div
                          className="w-2 h-2 bg-blue-600 rounded-full absolute -top-0.5"
                          style={{
                            left: `${((result.uncertainty.p50 - result.uncertainty.confidence_interval[0]) /
                                   (result.uncertainty.confidence_interval[1] - result.uncertainty.confidence_interval[0])) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        ${result.uncertainty.confidence_interval[1].toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Model Performance Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Accuracy vs Uncertainty Trade-off</h3>
              <div className="space-y-2">
                {predictionModels.map((model) => (
                  <div key={model.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate" style={{ maxWidth: '120px' }}>
                      {model.name.split(' ')[0]}
                    </span>
                    <div className="flex gap-1">
                      <div className="w-8 bg-green-200 rounded h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded"
                          style={{ width: `${model.accuracy * 100}%` }}
                        />
                      </div>
                      <div className="w-8 bg-red-200 rounded h-1.5">
                        <div
                          className="bg-red-500 h-1.5 rounded"
                          style={{ width: `${model.uncertainty * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Prediction Error Distribution</h3>
              <div className="space-y-2">
                <div className="text-xs text-gray-600">Within 5%: 87.3%</div>
                <div className="text-xs text-gray-600">Within 10%: 94.1%</div>
                <div className="text-xs text-gray-600">Within 20%: 98.7%</div>
                <div className="text-xs text-gray-600">Outliers: 1.3%</div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '87.3%' }} />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Confidence Calibration</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Expected</span>
                  <span className="text-gray-600">Actual</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>80% confidence</span>
                    <span className="text-green-600">78.5%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>90% confidence</span>
                    <span className="text-green-600">88.2%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>95% confidence</span>
                    <span className="text-yellow-600">93.1%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Prediction Details</h3>
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Predicted Value</p>
                      <p className="text-lg font-medium text-gray-900">
                        ${selectedResult.predicted_value.toLocaleString()}
                      </p>
                    </div>
                    {selectedResult.actual_value && (
                      <div>
                        <p className="text-sm text-gray-600">Actual Value</p>
                        <p className="text-lg font-medium text-gray-900">
                          ${selectedResult.actual_value.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Uncertainty Quantification</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Mean:</span>
                        <span className="font-medium">${selectedResult.uncertainty.mean.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Standard Deviation:</span>
                        <span className="font-medium">${selectedResult.uncertainty.std.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>95% Confidence Interval:</span>
                        <span className="font-medium">
                          ${selectedResult.uncertainty.confidence_interval[0].toLocaleString()} - ${selectedResult.uncertainty.confidence_interval[1].toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>P50 (Median):</span>
                        <span className="font-medium">${selectedResult.uncertainty.p50.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Confidence Level</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full"
                        style={{ width: `${selectedResult.confidence * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {(selectedResult.confidence * 100).toFixed(1)}% confidence in prediction
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}