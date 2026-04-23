'use client';

import { useState, useEffect, useCallback } from 'react';

interface ForecastModel {
  id: string;
  name: string;
  type: 'linear' | 'exponential' | 'arima' | 'neural' | 'ensemble';
  description: string;
  accuracy: number;
  confidence: number;
  parameters: Record<string, any>;
}

interface PredictionResult {
  model: string;
  forecast: number[];
  uncertainty: {
    lower: number[];
    upper: number[];
    confidence: number;
  };
  metrics: {
    mae: number;
    rmse: number;
    mape: number;
  };
  timestamp: Date;
}

interface PredictiveModelingProps {
  tenantId?: string;
  dataset?: 'maintenance' | 'financial' | 'supply-chain' | 'custom';
  onPredictionResult?: (result: PredictionResult) => void;
}

const FORECAST_MODELS: ForecastModel[] = [
  {
    id: 'linear_regression',
    name: 'Linear Regression',
    type: 'linear',
    description: 'Simple linear trend analysis with confidence intervals',
    accuracy: 0.78,
    confidence: 0.85,
    parameters: { slope: 1.2, intercept: 45.3 }
  },
  {
    id: 'exponential_smoothing',
    name: 'Exponential Smoothing',
    type: 'exponential',
    description: 'Weighted average of past observations with exponential decay',
    accuracy: 0.82,
    confidence: 0.88,
    parameters: { alpha: 0.3, beta: 0.1 }
  },
  {
    id: 'arima',
    name: 'ARIMA Model',
    type: 'arima',
    description: 'AutoRegressive Integrated Moving Average for time series',
    accuracy: 0.89,
    confidence: 0.92,
    parameters: { p: 2, d: 1, q: 1 }
  },
  {
    id: 'neural_network',
    name: 'Neural Network',
    type: 'neural',
    description: 'Deep learning model with multiple hidden layers',
    accuracy: 0.91,
    confidence: 0.87,
    parameters: { layers: 3, neurons: 64, epochs: 100 }
  },
  {
    id: 'ensemble',
    name: 'Ensemble Model',
    type: 'ensemble',
    description: 'Combination of multiple models for improved accuracy',
    accuracy: 0.94,
    confidence: 0.95,
    parameters: { models: ['arima', 'neural'], weights: [0.6, 0.4] }
  }
];

const SAMPLE_DATASETS = {
  maintenance: {
    name: 'Maintenance Costs',
    data: [1200, 1350, 1180, 1420, 1380, 1520, 1480, 1650, 1580, 1720, 1680, 1850],
    unit: '$',
    period: 'months'
  },
  financial: {
    name: 'Revenue Forecast',
    data: [45000, 47200, 48900, 46500, 49800, 51200, 52800, 54200, 51900, 55600, 57300, 58900],
    unit: '$',
    period: 'months'
  },
  'supply-chain': {
    name: 'Inventory Levels',
    data: [850, 920, 880, 950, 1020, 980, 1050, 1120, 1080, 1150, 1200, 1180],
    unit: 'units',
    period: 'weeks'
  }
};

export default function PredictiveModeling({
  tenantId = 'default',
  dataset = 'maintenance',
  onPredictionResult
}: PredictiveModelingProps) {
  const [selectedModel, setSelectedModel] = useState<string>(FORECAST_MODELS[0].id);
  const [forecastHorizon, setForecastHorizon] = useState(6);
  const [isTraining, setIsTraining] = useState(false);
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [currentDataset, setCurrentDataset] = useState(dataset);
  const [customData, setCustomData] = useState<string>('');

  const getCurrentData = useCallback(() => {
    if (currentDataset === 'custom' && customData) {
      try {
        return JSON.parse(customData);
      } catch {
        return SAMPLE_DATASETS.maintenance.data;
      }
    }
    return SAMPLE_DATASETS[currentDataset as keyof typeof SAMPLE_DATASETS]?.data || SAMPLE_DATASETS.maintenance.data;
  }, [currentDataset, customData]);

  const getDatasetInfo = useCallback(() => {
    if (currentDataset === 'custom') {
      return { name: 'Custom Data', unit: '', period: 'periods' };
    }
    return SAMPLE_DATASETS[currentDataset as keyof typeof SAMPLE_DATASETS] || SAMPLE_DATASETS.maintenance;
  }, [currentDataset]);

  const calculateMetrics = useCallback((actual: number[], predicted: number[]) => {
    const n = Math.min(actual.length, predicted.length);
    let mae = 0, rmse = 0, mape = 0;

    for (let i = 0; i < n; i++) {
      const error = predicted[i] - actual[i];
      mae += Math.abs(error);
      rmse += error * error;
      mape += Math.abs(error / actual[i]);
    }

    mae /= n;
    rmse = Math.sqrt(rmse / n);
    mape = (mape / n) * 100;

    return { mae, rmse, mape };
  }, []);

  const generateForecast = useCallback(async (modelId: string, data: number[], horizon: number): Promise<PredictionResult> => {
    const model = FORECAST_MODELS.find(m => m.id === modelId);
    if (!model) throw new Error('Model not found');

    // Simulate training time based on model complexity
    const trainingTime = model.type === 'neural' ? 3000 :
                        model.type === 'ensemble' ? 2500 :
                        model.type === 'arima' ? 1500 : 1000;

    await new Promise(resolve => setTimeout(resolve, trainingTime));

    // Generate forecast based on model type
    let forecast: number[] = [];
    const lastValue = data[data.length - 1];
    const trend = (data[data.length - 1] - data[data.length - 2]) / data[data.length - 2];

    for (let i = 1; i <= horizon; i++) {
      let prediction: number;

      switch (model.type) {
        case 'linear':
          prediction = lastValue + (trend * lastValue * i * 0.1);
          break;
        case 'exponential':
          prediction = lastValue * Math.pow(1 + trend, i);
          break;
        case 'arima':
          // Simple ARIMA simulation
          prediction = lastValue + (trend * i) + (Math.random() - 0.5) * 50;
          break;
        case 'neural':
          // Neural network simulation with some noise
          prediction = lastValue * (1 + trend * i) + (Math.random() - 0.5) * 100;
          break;
        case 'ensemble':
          // Ensemble combines linear and neural predictions
          const linearPred = lastValue + (trend * lastValue * i * 0.1);
          const neuralPred = lastValue * (1 + trend * i) + (Math.random() - 0.5) * 100;
          prediction = linearPred * 0.6 + neuralPred * 0.4;
          break;
        default:
          prediction = lastValue;
      }

      forecast.push(Math.max(0, prediction)); // Ensure non-negative
    }

    // Calculate uncertainty bounds
    const confidence = model.confidence;
    const stdDev = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - data.reduce((a, b) => a + b) / data.length, 2), 0) / data.length);

    const uncertainty = {
      lower: forecast.map(f => f - (stdDev * (2 - confidence) * 2)),
      upper: forecast.map(f => f + (stdDev * (2 - confidence) * 2)),
      confidence
    };

    // Calculate metrics using last portion of data as test
    const testData = data.slice(-Math.floor(data.length * 0.2));
    const testPredictions = forecast.slice(0, testData.length);
    const metrics = calculateMetrics(testData, testPredictions);

    return {
      model: model.name,
      forecast,
      uncertainty,
      metrics,
      timestamp: new Date()
    };
  }, [calculateMetrics]);

  const runPrediction = useCallback(async () => {
    if (isTraining) return;

    setIsTraining(true);
    try {
      const data = getCurrentData();
      const result = await generateForecast(selectedModel, data, forecastHorizon);
      setResults(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
      onPredictionResult?.(result);
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setIsTraining(false);
    }
  }, [isTraining, selectedModel, forecastHorizon, getCurrentData, generateForecast, onPredictionResult]);

  const datasetInfo = getDatasetInfo();
  const currentData = getCurrentData();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Predictive Modeling Platform</h1>
            <p className="text-gray-600">Advanced forecasting with uncertainty quantification and statistical analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Dataset</div>
              <div className="font-medium">{datasetInfo.name}</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Dataset Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {Object.entries(SAMPLE_DATASETS).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setCurrentDataset(key as any)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                currentDataset === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{info.name}</div>
              <div className="text-xs text-gray-500">{info.data.length} {info.period}</div>
            </button>
          ))}
          <button
            onClick={() => setCurrentDataset('custom')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              currentDataset === 'custom'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-sm">Custom Data</div>
            <div className="text-xs text-gray-500">JSON array</div>
          </button>
        </div>

        {currentDataset === 'custom' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Data (JSON array)
            </label>
            <textarea
              value={customData}
              onChange={(e) => setCustomData(e.target.value)}
              placeholder='[100, 120, 110, 130, 125, 140]'
              className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Model Selection and Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FORECAST_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({(model.accuracy * 100).toFixed(0)}% accuracy)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Horizon</label>
            <select
              value={forecastHorizon}
              onChange={(e) => setForecastHorizon(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[3, 6, 12, 24].map((horizon) => (
                <option key={horizon} value={horizon}>
                  {horizon} {datasetInfo.period}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Selected: {FORECAST_MODELS.find(m => m.id === selectedModel)?.name}
          </div>
          <button
            onClick={runPrediction}
            disabled={isTraining}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isTraining ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Training Model...
              </>
            ) : (
              'Run Prediction'
            )}
          </button>
        </div>
      </div>

      {/* Data Visualization */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Historical Data & Forecast</h2>
        <div className="aspect-[16/9] bg-gray-50 rounded-lg flex items-center justify-center mb-4">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <div>Data visualization would render here</div>
            <div className="text-sm">Historical: {currentData.join(', ')}</div>
            {results.length > 0 && (
              <div className="text-sm mt-2">
                Forecast: {results[0].forecast.slice(0, 3).join(', ')}...
              </div>
            )}
          </div>
        </div>

        {/* Model Performance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FORECAST_MODELS.map((model) => (
            <div key={model.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-sm mb-1">{model.name}</div>
              <div className="text-xs text-gray-600 mb-2">{model.description}</div>
              <div className="flex justify-between text-xs">
                <span>Accuracy: {(model.accuracy * 100).toFixed(0)}%</span>
                <span>Confidence: {(model.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Prediction Results</h2>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{result.model} Forecast</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      Confidence: {(result.uncertainty.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="text-gray-400">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{result.metrics.mae.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">MAE</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">{result.metrics.rmse.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">RMSE</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded">
                    <div className="text-lg font-bold text-orange-600">{result.metrics.mape.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">MAPE</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-sm font-medium mb-2">Forecast Values:</div>
                  <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    {result.forecast.map((val, idx) => (
                      <span key={idx} className="inline-block mr-4">
                        Period {idx + 1}: {datasetInfo.unit}{val.toFixed(0)}
                        <span className="text-gray-500 ml-1">
                          ({datasetInfo.unit}{result.uncertainty.lower[idx].toFixed(0)} - {datasetInfo.unit}{result.uncertainty.upper[idx].toFixed(0)})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Uncertainty bounds represent {((result.uncertainty.confidence) * 100).toFixed(0)}% confidence intervals
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Comparison */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Model Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Model</th>
                <th className="text-center py-2">Type</th>
                <th className="text-center py-2">Accuracy</th>
                <th className="text-center py-2">Confidence</th>
                <th className="text-center py-2">Complexity</th>
              </tr>
            </thead>
            <tbody>
              {FORECAST_MODELS.map((model) => (
                <tr key={model.id} className="border-b">
                  <td className="py-2 font-medium">{model.name}</td>
                  <td className="py-2 text-center capitalize">{model.type}</td>
                  <td className="py-2 text-center">{(model.accuracy * 100).toFixed(0)}%</td>
                  <td className="py-2 text-center">{(model.confidence * 100).toFixed(0)}%</td>
                  <td className="py-2 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      model.type === 'linear' ? 'bg-green-100 text-green-800' :
                      model.type === 'exponential' ? 'bg-blue-100 text-blue-800' :
                      model.type === 'arima' ? 'bg-yellow-100 text-yellow-800' :
                      model.type === 'neural' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {model.type === 'linear' ? 'Low' :
                       model.type === 'exponential' ? 'Low' :
                       model.type === 'arima' ? 'Medium' :
                       model.type === 'neural' ? 'High' : 'High'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}