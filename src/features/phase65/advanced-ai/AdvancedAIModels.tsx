'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface MLModel {
  id: string;
  name: string;
  type: 'predictive' | 'classification' | 'regression' | 'clustering';
  accuracy: number;
  status: 'training' | 'ready' | 'failed';
  lastTrained: string;
  features: string[];
  predictions: number;
}

interface CustomModelConfig {
  layers: number;
  neurons: number[];
  learningRate: number;
  epochs: number;
  activation: string;
  optimizer: string;
}

const customModels: MLModel[] = [
  {
    id: 'maintenance-predictor-v2',
    name: 'Advanced Maintenance Predictor',
    type: 'predictive',
    accuracy: 0.967,
    status: 'ready',
    lastTrained: '2026-04-21',
    features: ['vibration', 'temperature', 'pressure', 'usage_hours', 'maintenance_history'],
    predictions: 15420
  },
  {
    id: 'property-value-regression',
    name: 'Property Value Regression',
    type: 'regression',
    accuracy: 0.942,
    status: 'ready',
    lastTrained: '2026-04-20',
    features: ['location', 'size', 'age', 'condition', 'market_trends'],
    predictions: 8920
  },
  {
    id: 'risk-classifier',
    name: 'Risk Classification Engine',
    type: 'classification',
    accuracy: 0.978,
    status: 'ready',
    lastTrained: '2026-04-19',
    features: ['property_age', 'maintenance_cost', 'location_risk', 'occupancy_rate'],
    predictions: 12340
  }
];

export default function AdvancedAIModels() {
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [customConfig, setCustomConfig] = useState<CustomModelConfig>({
    layers: 3,
    neurons: [64, 32, 16],
    learningRate: 0.001,
    epochs: 100,
    activation: 'relu',
    optimizer: 'adam'
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 100) {
            setIsTraining(false);
            return 100;
          }
          return prev + Math.random() * 3;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isTraining]);

  const startTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);
  };

  const renderNeuralNetwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 300;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const layers = customConfig.neurons.length;
    const maxNeurons = Math.max(...customConfig.neurons);

    // Draw connections
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    for (let i = 0; i < layers - 1; i++) {
      const layer1 = customConfig.neurons[i];
      const layer2 = customConfig.neurons[i + 1];

      for (let j = 0; j < layer1; j++) {
        for (let k = 0; k < layer2; k++) {
          const x1 = 50 + (i * 300) / (layers - 1);
          const y1 = 50 + (j * 200) / (layer1 - 1);
          const x2 = 50 + ((i + 1) * 300) / (layers - 1);
          const y2 = 50 + (k * 200) / (layer2 - 1);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }

    // Draw neurons
    for (let i = 0; i < layers; i++) {
      const neuronCount = customConfig.neurons[i];

      for (let j = 0; j < neuronCount; j++) {
        const x = 50 + (i * 300) / (layers - 1);
        const y = 50 + (j * 200) / (neuronCount - 1);

        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  };

  useEffect(() => {
    renderNeuralNetwork();
  }, [customConfig]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Garlaws</span>
            </Link>

            <div className="flex items-center gap-8">
              <Link href="/ai" className="text-gray-600 hover:text-gray-900">AI Models</Link>
              <Link href="/ml" className="text-gray-600 hover:text-gray-900">ML Ops</Link>
              <Link href="/automation" className="text-gray-600 hover:text-gray-900">Automation</Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced AI Models</h1>
          <p className="text-gray-600">Custom machine learning models and advanced automation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Deployed Models</h2>
              <div className="space-y-4">
                {customModels.map((model) => (
                  <div
                    key={model.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer"
                    onClick={() => setSelectedModel(model)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{model.name}</h3>
                        <p className="text-sm text-gray-600">{model.type} • {model.accuracy * 100}% accuracy</p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          model.status === 'ready' ? 'bg-green-100 text-green-800' :
                          model.status === 'training' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {model.status}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{model.predictions.toLocaleString()} predictions</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Model Builder</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Layers</label>
                  <input
                    type="number"
                    value={customConfig.layers}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, layers: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="2"
                    max="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Learning Rate</label>
                  <input
                    type="number"
                    value={customConfig.learningRate}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, learningRate: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    step="0.001"
                    min="0.0001"
                    max="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Epochs</label>
                  <input
                    type="number"
                    value={customConfig.epochs}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="10"
                    max="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activation</label>
                  <select
                    value={customConfig.activation}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, activation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="relu">ReLU</option>
                    <option value="sigmoid">Sigmoid</option>
                    <option value="tanh">Tanh</option>
                    <option value="linear">Linear</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Network Visualization</h3>
                <canvas
                  ref={canvasRef}
                  className="w-full h-48 border border-gray-200 rounded-lg bg-white"
                />
              </div>

              <button
                onClick={startTraining}
                disabled={isTraining}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTraining ? `Training... ${Math.round(trainingProgress)}%` : 'Start Training'}
              </button>

              {isTraining && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${trainingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Model Performance</h2>
              {selectedModel ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Accuracy</span>
                      <span>{(selectedModel.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${selectedModel.accuracy * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Features Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedModel.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Select a model to view performance metrics</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Automation Workflows</h2>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Predictive Maintenance Alert</h3>
                      <p className="text-sm text-gray-600">Automatically triggers when equipment failure probability exceeds 80%</p>
                    </div>
                    <div className="text-green-600">✓ Active</div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Risk Assessment Workflow</h3>
                      <p className="text-sm text-gray-600">Automated property risk scoring and insurance recommendations</p>
                    </div>
                    <div className="text-green-600">✓ Active</div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Value Optimization Engine</h3>
                      <p className="text-sm text-gray-600">AI-driven property value improvement recommendations</p>
                    </div>
                    <div className="text-yellow-600">⚠ Training</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}