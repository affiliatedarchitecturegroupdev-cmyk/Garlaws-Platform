'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Architecture {
  id: string;
  name: string;
  layers: number[];
  accuracy: number;
  complexity: number;
  trainingTime: number;
  parameters: number;
  generation: number;
  fitness: number;
}

interface OptimizationRun {
  id: string;
  dataset: string;
  status: 'running' | 'completed' | 'failed';
  generations: number;
  bestAccuracy: number;
  startTime: string;
  duration?: number;
}

interface SearchSpace {
  minLayers: number;
  maxLayers: number;
  minNeurons: number;
  maxNeurons: number;
  activations: string[];
  optimizers: string[];
}

const architectures: Architecture[] = [
  {
    id: 'arch_001',
    name: 'Elite Architecture A',
    layers: [512, 256, 128, 64],
    accuracy: 0.967,
    complexity: 0.78,
    trainingTime: 45.2,
    parameters: 245680,
    generation: 15,
    fitness: 0.94
  },
  {
    id: 'arch_002',
    name: 'Elite Architecture B',
    layers: [768, 384, 192, 96, 48],
    accuracy: 0.973,
    complexity: 0.85,
    trainingTime: 62.8,
    parameters: 387920,
    generation: 18,
    fitness: 0.96
  },
  {
    id: 'arch_003',
    name: 'Candidate Architecture C',
    layers: [640, 320, 160, 80],
    accuracy: 0.958,
    complexity: 0.72,
    trainingTime: 38.9,
    parameters: 198450,
    generation: 12,
    fitness: 0.89
  }
];

const optimizationRuns: OptimizationRun[] = [
  {
    id: 'run_001',
    dataset: 'Property Valuation Dataset',
    status: 'running',
    generations: 23,
    bestAccuracy: 0.967,
    startTime: '2026-04-21T14:00:00Z'
  },
  {
    id: 'run_002',
    dataset: 'Maintenance Prediction Data',
    status: 'completed',
    generations: 31,
    bestAccuracy: 0.942,
    startTime: '2026-04-21T12:30:00Z',
    duration: 1247
  },
  {
    id: 'run_003',
    dataset: 'Risk Assessment Dataset',
    status: 'completed',
    generations: 28,
    bestAccuracy: 0.978,
    startTime: '2026-04-21T10:15:00Z',
    duration: 987
  }
];

const searchSpace: SearchSpace = {
  minLayers: 3,
  maxLayers: 8,
  minNeurons: 32,
  maxNeurons: 1024,
  activations: ['relu', 'tanh', 'sigmoid', 'elu', 'selu'],
  optimizers: ['adam', 'rmsprop', 'adagrad', 'adamax']
};

export default function NeuralArchitectureSearch() {
  const [selectedArchitecture, setSelectedArchitecture] = useState<Architecture | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [currentGeneration, setCurrentGeneration] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isSearching) {
      const interval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 100) {
            setIsSearching(false);
            return 100;
          }
          return prev + Math.random() * 1.5;
        });
        setCurrentGeneration(prev => prev + 1);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isSearching]);

  const startSearch = () => {
    setIsSearching(true);
    setSearchProgress(0);
    setCurrentGeneration(0);
  };

  const renderArchitectureEvolution = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 300;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Pareto front (accuracy vs complexity)
    const architectures = [
      { accuracy: 0.85, complexity: 0.3, generation: 1 },
      { accuracy: 0.88, complexity: 0.4, generation: 3 },
      { accuracy: 0.91, complexity: 0.5, generation: 5 },
      { accuracy: 0.93, complexity: 0.6, generation: 8 },
      { accuracy: 0.95, complexity: 0.7, generation: 12 },
      { accuracy: 0.96, complexity: 0.75, generation: 15 },
      { accuracy: 0.97, complexity: 0.8, generation: 18 },
      { accuracy: 0.973, complexity: 0.85, generation: 20 }
    ];

    // Draw background grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = 50 + (i * 50);
      const y = 50 + (i * 20);
      ctx.beginPath();
      ctx.moveTo(x, 50);
      ctx.lineTo(x, 250);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(550, y);
      ctx.stroke();
    }

    // Draw Pareto front
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();

    architectures.forEach((arch, index) => {
      const x = 50 + (arch.complexity * 400);
      const y = 250 - (arch.accuracy * 200);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
    });

    ctx.stroke();

    // Labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.fillText('Complexity', 275, 280);
    ctx.save();
    ctx.translate(20, 150);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Accuracy', 0, 0);
    ctx.restore();
  };

  useEffect(() => {
    renderArchitectureEvolution();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🔍</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Neural Architecture Search</span>
            </Link>

            <div className="flex items-center gap-8">
              <Link href="/neural-search" className="text-gray-600 hover:text-gray-900">Architecture Search</Link>
              <Link href="/optimization" className="text-gray-600 hover:text-gray-900">Auto Optimization</Link>
              <Link href="/evolution" className="text-gray-600 hover:text-gray-900">Evolution</Link>
              <Link href="/pareto" className="text-gray-600 hover:text-gray-900">Pareto Front</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Neural Architecture Search</h1>
          <p className="text-gray-600">Automated model optimization and architecture evolution</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Elite Architectures</p>
                <p className="text-2xl font-bold text-gray-900">{architectures.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">🏆</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Best Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(Math.max(...architectures.map(a => a.accuracy)) * 100).toFixed(1)}%
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
                <p className="text-sm text-gray-600">Search Generations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...architectures.map(a => a.generation))}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm">🔄</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Searches</p>
                <p className="text-2xl font-bold text-gray-900">
                  {optimizationRuns.filter(r => r.status === 'running').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-sm">⚡</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Elite Architectures</h2>

            <div className="space-y-4">
              {architectures.map((arch) => (
                <div
                  key={arch.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer"
                  onClick={() => setSelectedArchitecture(arch)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{arch.name}</h3>
                      <p className="text-sm text-gray-600">Generation {arch.generation}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Fitness: {(arch.fitness * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-600">Layers</p>
                      <p className="text-gray-900">{arch.layers.join(' → ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Parameters</p>
                      <p className="text-gray-900">{arch.parameters.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Accuracy</p>
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${arch.accuracy * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-900">{(arch.accuracy * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Complexity</p>
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-yellow-500 h-1.5 rounded-full"
                            style={{ width: `${arch.complexity * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-900">{(arch.complexity * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Training Time</p>
                      <span className="text-gray-900">{arch.trainingTime.toFixed(1)}s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Architecture Evolution</h2>
            <canvas
              ref={canvasRef}
              className="w-full h-64 border border-gray-200 rounded-lg bg-white mb-4"
            />
            <p className="text-sm text-gray-600">
              Pareto front showing the trade-off between accuracy and model complexity over generations.
            </p>

            <div className="mt-4">
              <button
                onClick={startSearch}
                disabled={isSearching}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? `Searching... Gen ${currentGeneration}` : 'Start Architecture Search'}
              </button>

              {isSearching && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${searchProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Evolution in progress... {Math.round(searchProgress)}% complete
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Space Configuration</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Layers</label>
                  <input
                    type="number"
                    value={searchSpace.minLayers}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Layers</label>
                  <input
                    type="number"
                    value={searchSpace.maxLayers}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Neurons</label>
                  <input
                    type="number"
                    value={searchSpace.minNeurons}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Neurons</label>
                  <input
                    type="number"
                    value={searchSpace.maxNeurons}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activations</label>
                <div className="flex flex-wrap gap-2">
                  {searchSpace.activations.map((activation) => (
                    <span
                      key={activation}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {activation}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Optimizers</label>
                <div className="flex flex-wrap gap-2">
                  {searchSpace.optimizers.map((optimizer) => (
                    <span
                      key={optimizer}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {optimizer}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Optimization Runs</h2>

            <div className="space-y-4">
              {optimizationRuns.map((run) => (
                <div key={run.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{run.dataset}</h3>
                      <p className="text-sm text-gray-600">
                        Started: {new Date(run.startTime).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      run.status === 'completed' ? 'bg-green-100 text-green-800' :
                      run.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {run.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Generations:</span>
                      <span className="ml-2 text-gray-900">{run.generations}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Best Accuracy:</span>
                      <span className="ml-2 text-gray-900">{(run.bestAccuracy * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  {run.duration && (
                    <p className="text-xs text-gray-500 mt-2">
                      Duration: {Math.floor(run.duration / 60)}m {run.duration % 60}s
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedArchitecture && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedArchitecture.name}</h3>
                  <button
                    onClick={() => setSelectedArchitecture(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Architecture</p>
                    <p className="font-mono text-gray-900">{selectedArchitecture.layers.join(' → ')}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                      <p className="text-lg font-medium text-gray-900">{(selectedArchitecture.accuracy * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Parameters</p>
                      <p className="text-lg font-medium text-gray-900">{selectedArchitecture.parameters.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Complexity</p>
                      <p className="text-lg font-medium text-gray-900">{(selectedArchitecture.complexity * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Training Time</p>
                      <p className="text-lg font-medium text-gray-900">{selectedArchitecture.trainingTime.toFixed(1)}s</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Fitness Score</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${selectedArchitecture.fitness * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {(selectedArchitecture.fitness * 100).toFixed(1)}% overall fitness
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700">
                    Deploy Model
                  </button>
                  <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}