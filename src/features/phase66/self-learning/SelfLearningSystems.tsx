'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface LearningAgent {
  id: string;
  name: string;
  type: 'reinforcement' | 'supervised' | 'unsupervised';
  status: 'learning' | 'adapting' | 'optimizing' | 'ready';
  performance: number;
  learningRate: number;
  episodes: number;
  lastImproved: string;
  adaptationHistory: AdaptationEvent[];
}

interface AdaptationEvent {
  timestamp: string;
  event: string;
  improvement: number;
  confidence: number;
}

interface LearningMetrics {
  accuracy: number;
  adaptationSpeed: number;
  generalization: number;
  robustness: number;
  efficiency: number;
}

const learningAgents: LearningAgent[] = [
  {
    id: 'agent_001',
    name: 'Property Valuation Agent',
    type: 'reinforcement',
    status: 'adapting',
    performance: 0.94,
    learningRate: 0.001,
    episodes: 15420,
    lastImproved: '2026-04-21T15:00:00Z',
    adaptationHistory: [
      { timestamp: '2026-04-21T15:00:00Z', event: 'Market trend adaptation', improvement: 0.03, confidence: 0.92 },
      { timestamp: '2026-04-21T14:30:00Z', event: 'Location preference learning', improvement: 0.02, confidence: 0.89 },
      { timestamp: '2026-04-21T14:00:00Z', event: 'Economic indicator integration', improvement: 0.04, confidence: 0.95 }
    ]
  },
  {
    id: 'agent_002',
    name: 'Maintenance Prediction Agent',
    type: 'supervised',
    status: 'learning',
    performance: 0.91,
    learningRate: 0.0005,
    episodes: 8920,
    lastImproved: '2026-04-21T14:45:00Z',
    adaptationHistory: [
      { timestamp: '2026-04-21T14:45:00Z', event: 'Equipment failure pattern recognition', improvement: 0.025, confidence: 0.88 },
      { timestamp: '2026-04-21T14:15:00Z', event: 'Seasonal maintenance optimization', improvement: 0.018, confidence: 0.91 }
    ]
  },
  {
    id: 'agent_003',
    name: 'Customer Behavior Agent',
    type: 'unsupervised',
    status: 'ready',
    performance: 0.87,
    learningRate: 0.002,
    episodes: 21560,
    lastImproved: '2026-04-21T13:30:00Z',
    adaptationHistory: [
      { timestamp: '2026-04-21T13:30:00Z', event: 'User preference clustering', improvement: 0.031, confidence: 0.86 },
      { timestamp: '2026-04-21T13:00:00Z', event: 'Communication pattern analysis', improvement: 0.022, confidence: 0.82 }
    ]
  }
];

export default function SelfLearningSystems() {
  const [selectedAgent, setSelectedAgent] = useState<LearningAgent | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [learningMetrics, setLearningMetrics] = useState<LearningMetrics>({
    accuracy: 0.91,
    adaptationSpeed: 0.78,
    generalization: 0.85,
    robustness: 0.92,
    efficiency: 0.88
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 100) {
            setIsTraining(false);
            // Update learning metrics after training
            setLearningMetrics(prev => ({
              accuracy: Math.min(0.98, prev.accuracy + Math.random() * 0.03),
              adaptationSpeed: Math.min(0.95, prev.adaptationSpeed + Math.random() * 0.02),
              generalization: Math.min(0.92, prev.generalization + Math.random() * 0.02),
              robustness: Math.min(0.96, prev.robustness + Math.random() * 0.02),
              efficiency: Math.min(0.94, prev.efficiency + Math.random() * 0.02)
            }));
            return 100;
          }
          return prev + Math.random() * 2;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isTraining]);

  const startTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);
  };

  const renderNeuralEvolution = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw neural network evolution over time
    const timeSteps = 10;
    const maxNeurons = 20;

    for (let t = 0; t < timeSteps; t++) {
      const x = 50 + (t * 50);
      const neurons = Math.floor(5 + (t / timeSteps) * 15);
      const alpha = 0.3 + (t / timeSteps) * 0.7;

      for (let n = 0; n < neurons; n++) {
        const y = 50 + (n * 15);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
        ctx.fill();

        if (t < timeSteps - 1) {
          const nextNeurons = Math.floor(5 + ((t + 1) / timeSteps) * 15);
          for (let nn = 0; nn < nextNeurons; nn++) {
            const nextY = 50 + (nn * 15);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 50, nextY);
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha * 0.5})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    // Draw performance curve
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let t = 0; t < timeSteps; t++) {
      const x = 50 + (t * 50);
      const performance = 0.7 + (t / timeSteps) * 0.25;
      const y = 350 - (performance * 200);
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  useEffect(() => {
    renderNeuralEvolution();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🧠</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Self-Learning Systems</span>
            </Link>

            <div className="flex items-center gap-8">
              <Link href="/self-learning" className="text-gray-600 hover:text-gray-900">Learning Agents</Link>
              <Link href="/adaptation" className="text-gray-600 hover:text-gray-900">Adaptation</Link>
              <Link href="/neural-evolution" className="text-gray-600 hover:text-gray-900">Evolution</Link>
              <Link href="/optimization" className="text-gray-600 hover:text-gray-900">Optimization</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Self-Learning Systems & Adaptive AI</h1>
          <p className="text-gray-600">AI systems that learn from interactions and continuously adapt</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold text-gray-900">{learningAgents.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">🤖</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(learningAgents.reduce((sum, a) => sum + a.performance, 0) / learningAgents.length * 100).toFixed(1)}%
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Learning Episodes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {learningAgents.reduce((sum, a) => sum + a.episodes, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm">🎓</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Adaptation Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {learningAgents.reduce((sum, a) => sum + a.adaptationHistory.length, 0)}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-sm">🔄</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Agents</h2>

            <div className="space-y-4">
              {learningAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-600">{agent.type} learning • {agent.episodes.toLocaleString()} episodes</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        agent.status === 'ready' ? 'bg-green-100 text-green-800' :
                        agent.status === 'learning' ? 'bg-blue-100 text-blue-800' :
                        agent.status === 'adapting' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Performance</p>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${agent.performance * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-900">{(agent.performance * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Learning Rate</p>
                      <span className="text-gray-900">{agent.learningRate}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Last improved: {new Date(agent.lastImproved).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Neural Network Evolution</h2>
            <canvas
              ref={canvasRef}
              className="w-full h-64 border border-gray-200 rounded-lg bg-white mb-4"
            />
            <p className="text-sm text-gray-600">
              Real-time visualization of neural network architecture evolution and performance improvement over time.
            </p>

            <div className="mt-4">
              <button
                onClick={startTraining}
                disabled={isTraining}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTraining ? `Training... ${Math.round(trainingProgress)}%` : 'Start Neural Evolution'}
              </button>

              {isTraining && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${trainingProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Neural architecture optimization in progress...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Metrics</h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Overall Accuracy</span>
                  <span className="text-sm text-gray-900">{(learningMetrics.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${learningMetrics.accuracy * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Adaptation Speed</span>
                  <span className="text-sm text-gray-900">{(learningMetrics.adaptationSpeed * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${learningMetrics.adaptationSpeed * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Generalization</span>
                  <span className="text-sm text-gray-900">{(learningMetrics.generalization * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${learningMetrics.generalization * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Robustness</span>
                  <span className="text-sm text-gray-900">{(learningMetrics.robustness * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${learningMetrics.robustness * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Computational Efficiency</span>
                  <span className="text-sm text-gray-900">{(learningMetrics.efficiency * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${learningMetrics.efficiency * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Adaptations</h2>

            <div className="space-y-4 max-h-80 overflow-y-auto">
              {learningAgents.flatMap(agent =>
                agent.adaptationHistory.map((event, index) => ({
                  ...event,
                  agentName: agent.name,
                  agentId: agent.id
                }))
              ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 8)
              .map((event, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{event.agentName}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{event.event}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-600">+{(event.improvement * 100).toFixed(1)}% improvement</span>
                    <span className="text-blue-600">{(event.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedAgent.name}</h3>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Learning Type</p>
                      <p className="font-medium text-gray-900 capitalize">{selectedAgent.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current Status</p>
                      <p className="font-medium text-gray-900 capitalize">{selectedAgent.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Performance</p>
                      <p className="font-medium text-gray-900">{(selectedAgent.performance * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Learning Rate</p>
                      <p className="font-medium text-gray-900">{selectedAgent.learningRate}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Adaptation History</h4>
                    <div className="space-y-3">
                      {selectedAgent.adaptationHistory.map((event, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{event.event}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-600">+{(event.improvement * 100).toFixed(1)}%</p>
                            <p className="text-xs text-gray-600">{(event.confidence * 100).toFixed(0)}% confidence</p>
                          </div>
                        </div>
                      ))}
                    </div>
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