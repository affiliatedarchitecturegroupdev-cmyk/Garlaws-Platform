'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface LearningPattern {
  id: string;
  name: string;
  type: 'supervised' | 'unsupervised' | 'reinforcement' | 'transfer';
  description: string;
  accuracy: number;
  adaptationRate: number;
  patternsLearned: number;
  lastUpdated: Date;
}

interface LearningSession {
  id: string;
  algorithm: string;
  startTime: Date;
  endTime?: Date;
  performance: {
    initialAccuracy: number;
    finalAccuracy: number;
    improvement: number;
    patternsLearned: number;
  };
  status: 'running' | 'completed' | 'paused';
}

interface AdaptationMetrics {
  adaptability: number;
  learningRate: number;
  convergenceSpeed: number;
  generalization: number;
  robustness: number;
}

interface SelfLearningProps {
  tenantId?: string;
  domain?: 'maintenance' | 'financial' | 'supply-chain' | 'general';
  onLearningComplete?: (session: LearningSession) => void;
}

const LEARNING_ALGORITHMS: LearningPattern[] = [
  {
    id: 'online_learning',
    name: 'Online Learning',
    type: 'supervised',
    description: 'Continuous learning from streaming data with incremental updates',
    accuracy: 0.85,
    adaptationRate: 0.92,
    patternsLearned: 1247,
    lastUpdated: new Date()
  },
  {
    id: 'reinforcement_learning',
    name: 'Reinforcement Learning',
    type: 'reinforcement',
    description: 'Learning through interaction and reward-based feedback',
    accuracy: 0.78,
    adaptationRate: 0.88,
    patternsLearned: 892,
    lastUpdated: new Date()
  },
  {
    id: 'transfer_learning',
    name: 'Transfer Learning',
    type: 'transfer',
    description: 'Applying knowledge from one domain to another related domain',
    accuracy: 0.91,
    adaptationRate: 0.95,
    patternsLearned: 2156,
    lastUpdated: new Date()
  },
  {
    id: 'meta_learning',
    name: 'Meta Learning',
    type: 'unsupervised',
    description: 'Learning to learn - algorithms that improve their learning process',
    accuracy: 0.87,
    adaptationRate: 0.89,
    patternsLearned: 734,
    lastUpdated: new Date()
  },
  {
    id: 'federated_learning',
    name: 'Federated Learning',
    type: 'supervised',
    description: 'Distributed learning across multiple devices while preserving privacy',
    accuracy: 0.83,
    adaptationRate: 0.91,
    patternsLearned: 1567,
    lastUpdated: new Date()
  }
];

const SAMPLE_DATA_STREAMS = {
  maintenance: [
    'Equipment failure prediction',
    'Maintenance schedule optimization',
    'Parts inventory forecasting',
    'Technician workload balancing'
  ],
  financial: [
    'Fraud detection patterns',
    'Market trend analysis',
    'Risk assessment models',
    'Investment optimization'
  ],
  'supply-chain': [
    'Demand forecasting',
    'Supplier performance analysis',
    'Logistics route optimization',
    'Inventory level prediction'
  ],
  general: [
    'User behavior patterns',
    'System performance monitoring',
    'Anomaly detection',
    'Recommendation systems'
  ]
};

export default function SelfLearning({
  tenantId = 'default',
  domain = 'general',
  onLearningComplete
}: SelfLearningProps) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(LEARNING_ALGORITHMS[0].id);
  const [isLearning, setIsLearning] = useState(false);
  const [learningSession, setLearningSession] = useState<LearningSession | null>(null);
  const [adaptationMetrics, setAdaptationMetrics] = useState<AdaptationMetrics>({
    adaptability: 0.85,
    learningRate: 0.12,
    convergenceSpeed: 0.78,
    generalization: 0.82,
    robustness: 0.89
  });
  const [learningHistory, setLearningHistory] = useState<LearningSession[]>([]);
  const [dataStream, setDataStream] = useState<string[]>(SAMPLE_DATA_STREAMS[domain]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startLearningSession = useCallback(async (algorithmId: string) => {
    if (isLearning) return;

    const algorithm = LEARNING_ALGORITHMS.find(a => a.id === algorithmId);
    if (!algorithm) return;

    const session: LearningSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      algorithm: algorithm.name,
      startTime: new Date(),
      performance: {
        initialAccuracy: algorithm.accuracy,
        finalAccuracy: algorithm.accuracy,
        improvement: 0,
        patternsLearned: 0
      },
      status: 'running'
    };

    setLearningSession(session);
    setIsLearning(true);

    // Simulate learning process
    let progress = 0;
    const totalSteps = 100;
    const learningInterval = setInterval(() => {
      progress += Math.random() * 5 + 1; // 1-6 progress per step

      if (progress >= totalSteps) {
        clearInterval(learningInterval);
        const finalAccuracy = Math.min(0.98, algorithm.accuracy + Math.random() * 0.1);
        const improvement = finalAccuracy - algorithm.accuracy;
        const patternsLearned = Math.floor(Math.random() * 50 + 10);

        const completedSession: LearningSession = {
          ...session,
          endTime: new Date(),
          performance: {
            ...session.performance,
            finalAccuracy,
            improvement,
            patternsLearned
          },
          status: 'completed'
        };

        setLearningSession(completedSession);
        setLearningHistory(prev => [completedSession, ...prev.slice(0, 9)]);
        setIsLearning(false);
        onLearningComplete?.(completedSession);

        // Update adaptation metrics
        setAdaptationMetrics(prev => ({
          adaptability: Math.min(1, prev.adaptability + improvement * 0.5),
          learningRate: Math.min(1, prev.learningRate + Math.random() * 0.1),
          convergenceSpeed: Math.min(1, prev.convergenceSpeed + Math.random() * 0.05),
          generalization: Math.min(1, prev.generalization + Math.random() * 0.03),
          robustness: Math.min(1, prev.robustness + Math.random() * 0.02)
        }));
      } else {
        // Update metrics during learning
        setLearningSession(prev => prev ? {
          ...prev,
          performance: {
            ...prev.performance,
            patternsLearned: Math.floor(progress * 2)
          }
        } : null);
      }
    }, 200);

    intervalRef.current = learningInterval;
  }, [isLearning, onLearningComplete]);

  const pauseLearning = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsLearning(false);
      setLearningSession(prev => prev ? { ...prev, status: 'paused' } : null);
    }
  }, []);

  const resumeLearning = useCallback(() => {
    if (learningSession && learningSession.status === 'paused') {
      setLearningSession(prev => prev ? { ...prev, status: 'running' } : null);
      startLearningSession(LEARNING_ALGORITHMS.find(a => a.name === learningSession.algorithm)?.id || LEARNING_ALGORITHMS[0].id);
    }
  }, [learningSession, startLearningSession]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setDataStream(SAMPLE_DATA_STREAMS[domain]);
  }, [domain]);

  const getAlgorithmColor = (type: string) => {
    switch (type) {
      case 'supervised': return '#22c55e';
      case 'unsupervised': return '#3b82f6';
      case 'reinforcement': return '#f59e0b';
      case 'transfer': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Self-Learning AI Systems</h1>
            <p className="text-gray-600">Adaptive algorithms with continuous learning and pattern recognition</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Domain</div>
              <div className="font-medium capitalize">{domain.replace('-', ' ')}</div>
            </div>
            <div className={`w-3 h-3 rounded-full ${isLearning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          </div>
        </div>

        {/* Adaptation Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{(adaptationMetrics.adaptability * 100).toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Adaptability</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{(adaptationMetrics.learningRate * 100).toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Learning Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{(adaptationMetrics.convergenceSpeed * 100).toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Convergence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{(adaptationMetrics.generalization * 100).toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Generalization</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{(adaptationMetrics.robustness * 100).toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Robustness</div>
          </div>
        </div>
      </div>

      {/* Learning Algorithms */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Learning Algorithms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {LEARNING_ALGORITHMS.map((algorithm) => (
            <div
              key={algorithm.id}
              className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                selectedAlgorithm === algorithm.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{algorithm.name}</h3>
                <span
                  className="px-2 py-1 text-xs rounded-full text-white"
                  style={{ backgroundColor: getAlgorithmColor(algorithm.type) }}
                >
                  {algorithm.type}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{algorithm.description}</p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>Accuracy: {(algorithm.accuracy * 100).toFixed(1)}%</div>
                <div>Adaptation: {(algorithm.adaptationRate * 100).toFixed(1)}%</div>
                <div>Patterns: {algorithm.patternsLearned.toLocaleString()}</div>
              </div>
              <button
                onClick={() => setSelectedAlgorithm(algorithm.id)}
                className={`w-full mt-3 px-3 py-2 text-sm rounded-lg ${
                  selectedAlgorithm === algorithm.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Select
              </button>
            </div>
          ))}
        </div>

        {/* Learning Controls */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <div className="text-sm font-medium mb-1">Selected Algorithm</div>
            <div className="text-lg font-semibold">
              {LEARNING_ALGORITHMS.find(a => a.id === selectedAlgorithm)?.name}
            </div>
          </div>
          <div className="flex gap-2">
            {!isLearning ? (
              <button
                onClick={() => startLearningSession(selectedAlgorithm)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Start Learning
              </button>
            ) : (
              <>
                <button
                  onClick={pauseLearning}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Pause
                </button>
                <button
                  onClick={resumeLearning}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Resume
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Current Learning Session */}
      {learningSession && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Learning Session</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Algorithm</div>
                <div className="font-medium">{learningSession.algorithm}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    learningSession.status === 'running' ? 'bg-green-500 animate-pulse' :
                    learningSession.status === 'completed' ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}></div>
                  <span className="capitalize">{learningSession.status}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Start Time</div>
                <div className="font-medium">{learningSession.startTime.toLocaleTimeString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Patterns Learned</div>
                <div className="font-medium">{learningSession.performance.patternsLearned}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Initial Accuracy</div>
                <div className="font-medium">{(learningSession.performance.initialAccuracy * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Current/Final Accuracy</div>
                <div className="font-medium">{(learningSession.performance.finalAccuracy * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {learningSession.status === 'running' && (
            <div className="mt-6">
              <div className="text-sm text-gray-500 mb-2">Learning Progress</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (learningSession.performance.patternsLearned / 200) * 100)}%`
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data Streams */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Learning Data Streams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataStream.map((stream, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <div className="font-medium text-gray-900">{stream}</div>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Active learning stream with real-time data ingestion
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning History */}
      {learningHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Learning History</h2>
          <div className="space-y-3">
            {learningHistory.map((session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{session.algorithm}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      session.status === 'completed' ? 'bg-green-100 text-green-800' :
                      session.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.status}
                    </span>
                    <span className="text-gray-500">
                      {session.endTime ? session.endTime.toLocaleTimeString() : 'In Progress'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Accuracy Improvement</div>
                    <div className="font-medium text-green-600">
                      +{(session.performance.improvement * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Patterns Learned</div>
                    <div className="font-medium">{session.performance.patternsLearned}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Final Accuracy</div>
                    <div className="font-medium">{(session.performance.finalAccuracy * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Duration</div>
                    <div className="font-medium">
                      {session.endTime
                        ? `${Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000)}s`
                        : 'Ongoing'
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pattern Recognition Visualization */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Pattern Recognition</h2>
        <div className="aspect-[16/9] bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">🧠</div>
            <div>Neural Pattern Recognition</div>
            <div className="text-sm">Real-time pattern detection and classification</div>
            <div className="text-sm mt-2 grid grid-cols-3 gap-4">
              <div>Patterns: 1,247</div>
              <div>Accuracy: 94.2%</div>
              <div>Confidence: 87.3%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}