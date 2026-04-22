'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Enhanced offline architecture with mobile AI integration
export function useAdvancedOfflineAI() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [aiCapabilities, setAiCapabilities] = useState({
    edgeAI: false,
    offlineML: false,
    federatedLearning: false,
    onDeviceInference: false
  });
  const [offlineAIModels, setOfflineAIModels] = useState<Map<string, any>>(new Map());
  const [aiProcessingQueue, setAiProcessingQueue] = useState<any[]>([]);
  const [edgeAIResults, setEdgeAIResults] = useState<Map<string, any>>(new Map());

  // Check for AI capabilities
  useEffect(() => {
    const checkAICapabilities = async () => {
      const capabilities = {
        edgeAI: 'ml' in navigator || 'webnn' in navigator,
        offlineML: 'serviceWorker' in navigator && 'caches' in window,
        federatedLearning: 'federatedLearning' in navigator,
        onDeviceInference: 'ml' in navigator
      };
      setAiCapabilities(capabilities);
    };

    checkAICapabilities();
  }, []);

  // Network monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineAIModel = useCallback(async (modelId: string, modelData: any) => {
    try {
      // Store model in IndexedDB for offline use
      const db = await openAIModelsDB();
      const transaction = db.transaction(['models'], 'readwrite');
      const store = transaction.objectStore('models');

      await new Promise<void>((resolve, reject) => {
        const request = store.put({
          id: modelId,
          data: modelData,
          loadedAt: new Date().toISOString(),
          version: modelData.version || 1
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      setOfflineAIModels(prev => new Map(prev.set(modelId, modelData)));
      db.close();
    } catch (error) {
      console.error('Failed to load offline AI model:', error);
    }
  }, []);

  const performOfflineInference = useCallback(async (
    modelId: string,
    input: any,
    options: {
      fallbackToCloud?: boolean;
      confidence?: number;
      timeout?: number;
    } = {}
  ) => {
    const {
      fallbackToCloud = true,
      confidence = 0.8,
      timeout = 5000
    } = options;

    try {
      const model = offlineAIModels.get(modelId);
      if (!model) {
        throw new Error(`Model ${modelId} not found`);
      }

      // Simulate edge AI inference (in real implementation, this would use WebNN or similar)
      const startTime = Date.now();
      const result = await simulateEdgeInference(model, input);
      const processingTime = Date.now() - startTime;

      if (result.confidence >= confidence) {
        return {
          success: true,
          result,
          processingTime,
          source: 'edge',
          cached: true
        };
      }

      // Fallback to cloud if enabled and confidence is low
      if (fallbackToCloud && isOnline) {
        console.log('Low confidence from edge AI, falling back to cloud');
        return performCloudInference(modelId, input, { timeout: timeout - processingTime });
      }

      return {
        success: true,
        result,
        processingTime,
        source: 'edge',
        cached: true,
        lowConfidence: true
      };
    } catch (error) {
      console.error('Edge AI inference failed:', error);

      if (fallbackToCloud && isOnline) {
        return performCloudInference(modelId, input, { timeout });
      }

      throw error;
    }
  }, [offlineAIModels, isOnline]);

  const performCloudInference = useCallback(async (
    modelId: string,
    input: any,
    options: { timeout?: number } = {}
  ) => {
    const { timeout = 10000 } = options;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch('/api/ai/inference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, input }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Cloud inference failed: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        result,
        processingTime: result.processingTime,
        source: 'cloud',
        cached: false
      };
    } catch (error) {
      console.error('Cloud AI inference failed:', error);
      throw error;
    }
  }, []);

  const queueAIProcessing = useCallback((task: {
    id: string;
    modelId: string;
    input: any;
    priority: 'low' | 'medium' | 'high';
    callback?: (result: any) => void;
  }) => {
    const aiTask = {
      ...task,
      queuedAt: new Date().toISOString(),
      status: 'queued' as const,
      retryCount: 0,
      maxRetries: 3
    };

    setAiProcessingQueue(prev => [...prev, aiTask]);

    // Process immediately if online and high priority
    if (isOnline && task.priority === 'high') {
      processAIQueue();
    }
  }, [isOnline]);

  const processAIQueue = useCallback(async () => {
    const pendingTasks = aiProcessingQueue.filter(task => task.status === 'queued');
    if (pendingTasks.length === 0) return;

    for (const task of pendingTasks) {
      try {
        setAiProcessingQueue(prev =>
          prev.map(t => t.id === task.id ? { ...t, status: 'processing' } : t)
        );

        const result = await performOfflineInference(task.modelId, task.input);

        setAiProcessingQueue(prev =>
          prev.map(t => t.id === task.id ? { ...t, status: 'completed', result } : t)
        );

        setEdgeAIResults(prev => new Map(prev.set(task.id, result)));

        task.callback?.(result);
      } catch (error) {
        console.error(`AI task ${task.id} failed:`, error);

        setAiProcessingQueue(prev =>
          prev.map(t =>
            t.id === task.id
              ? {
                  ...t,
                  status: 'failed',
                  error: error.message,
                  retryCount: t.retryCount + 1
                }
              : t
          )
        );
      }
    }
  }, [aiProcessingQueue, performOfflineInference]);

  // Process queue when coming online
  useEffect(() => {
    if (isOnline && aiProcessingQueue.length > 0) {
      processAIQueue();
    }
  }, [isOnline, aiProcessingQueue.length, processAIQueue]);

  const getAIProcessingStats = useCallback(() => {
    const total = aiProcessingQueue.length;
    const completed = aiProcessingQueue.filter(t => t.status === 'completed').length;
    const failed = aiProcessingQueue.filter(t => t.status === 'failed').length;
    const processing = aiProcessingQueue.filter(t => t.status === 'processing').length;

    return {
      total,
      completed,
      failed,
      processing,
      queued: total - completed - failed - processing,
      successRate: total > 0 ? (completed / total) * 100 : 0
    };
  }, [aiProcessingQueue]);

  return {
    isOnline,
    aiCapabilities,
    offlineAIModels: Array.from(offlineAIModels.entries()),
    aiProcessingQueue,
    edgeAIResults: Array.from(edgeAIResults.entries()),
    loadOfflineAIModel,
    performOfflineInference,
    queueAIProcessing,
    getAIProcessingStats,
  };
}

// Helper functions
async function openAIModelsDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('garlaws-ai-models', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('models')) {
        const store = db.createObjectStore('models', { keyPath: 'id' });
        store.createIndex('version', 'version', { unique: false });
      }
    };
  });
}

async function simulateEdgeInference(model: any, input: any) {
  // Simulate AI inference with mock results
  // In real implementation, this would use TensorFlow.js or WebNN
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

  return {
    prediction: Math.random() > 0.5 ? 'positive' : 'negative',
    confidence: Math.random() * 0.4 + 0.6, // 0.6-1.0
    features: Object.keys(input),
    processingTime: Math.random() * 500 + 200,
    modelVersion: model.version || '1.0.0'
  };
}

// Enhanced Offline AI Dashboard Component
interface AdvancedOfflineAIDashboardProps {
  className?: string;
}

export const AdvancedOfflineAIDashboard: React.FC<AdvancedOfflineAIDashboardProps> = ({
  className
}) => {
  const {
    isOnline,
    aiCapabilities,
    offlineAIModels,
    aiProcessingQueue,
    edgeAIResults,
    loadOfflineAIModel,
    performOfflineInference,
    queueAIProcessing,
    getAIProcessingStats
  } = useAdvancedOfflineAI();

  const [selectedModel, setSelectedModel] = useState<string>('');
  const [testInput, setTestInput] = useState<string>('{"feature1": 0.5, "feature2": 0.8}');
  const [inferenceResult, setInferenceResult] = useState<any>(null);

  const stats = getAIProcessingStats();

  const handleTestInference = async () => {
    if (!selectedModel) return;

    try {
      const input = JSON.parse(testInput);
      const result = await performOfflineInference(selectedModel, input);
      setInferenceResult(result);
    } catch (error) {
      console.error('Test inference failed:', error);
      setInferenceResult({ error: error.message });
    }
  };

  const handleQueueProcessing = () => {
    if (!selectedModel) return;

    try {
      const input = JSON.parse(testInput);
      queueAIProcessing({
        id: `test-${Date.now()}`,
        modelId: selectedModel,
        input,
        priority: 'high',
        callback: (result) => {
          console.log('Queued AI processing completed:', result);
        }
      });
    } catch (error) {
      console.error('Failed to queue AI processing:', error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advanced Offline AI</h2>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            isOnline ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* AI Capabilities */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl mb-2">{aiCapabilities.edgeAI ? '🧠' : '🚫'}</div>
          <div className="font-semibold">Edge AI</div>
          <div className="text-sm text-gray-600">
            {aiCapabilities.edgeAI ? 'Available' : 'Not supported'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl mb-2">{aiCapabilities.offlineML ? '💾' : '🚫'}</div>
          <div className="font-semibold">Offline ML</div>
          <div className="text-sm text-gray-600">
            {aiCapabilities.offlineML ? 'Available' : 'Not supported'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl mb-2">{aiCapabilities.federatedLearning ? '🌐' : '🚫'}</div>
          <div className="font-semibold">Federated Learning</div>
          <div className="text-sm text-gray-600">
            {aiCapabilities.federatedLearning ? 'Available' : 'Not supported'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl mb-2">{aiCapabilities.onDeviceInference ? '📱' : '🚫'}</div>
          <div className="font-semibold">On-Device Inference</div>
          <div className="text-sm text-gray-600">
            {aiCapabilities.onDeviceInference ? 'Available' : 'Not supported'}
          </div>
        </div>
      </div>

      {/* Processing Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{stats.queued}</div>
          <div className="text-sm text-gray-600">Queued</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
      </div>

      {/* Model Management */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">AI Models ({offlineAIModels.length})</h3>
        <div className="space-y-2">
          {offlineAIModels.map(([id, model]) => (
            <div key={id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">{id}</div>
                <div className="text-sm text-gray-600">v{model.version || '1.0.0'}</div>
              </div>
              <button
                onClick={() => setSelectedModel(id)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedModel === id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Select
              </button>
            </div>
          ))}
          {offlineAIModels.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">🤖</div>
              <p>No AI models loaded</p>
              <p className="text-sm">Models will be downloaded automatically when needed</p>
            </div>
          )}
        </div>
      </div>

      {/* Test Inference */}
      {selectedModel && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Test Inference</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Input Data (JSON)</label>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="w-full h-24 p-3 border rounded font-mono text-sm"
                placeholder='{"feature1": 0.5, "feature2": 0.8}'
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleTestInference}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Inference
              </button>
              <button
                onClick={handleQueueProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Queue Processing
              </button>
            </div>
          </div>

          {/* Results */}
          {inferenceResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">Result:</h4>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(inferenceResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Processing Queue */}
      {aiProcessingQueue.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Processing Queue</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {aiProcessingQueue.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{task.modelId}</div>
                  <div className="text-sm text-gray-600">
                    Status: {task.status} | Priority: {task.priority}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};