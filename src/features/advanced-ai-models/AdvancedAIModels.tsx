"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Brain, Network, Zap, Target, Cpu, Layers, Eye, Settings } from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  architecture: 'transformer' | 'diffusion' | 'gan' | 'autoencoder' | 'graph-neural' | 'attention';
  type: 'language' | 'vision' | 'multimodal' | 'generative' | 'predictive';
  parameters: number; // Number of parameters in millions
  trainingData: string;
  accuracy: number;
  latency: number; // ms
  status: 'training' | 'ready' | 'deployed' | 'error';
  layers: number;
  attentionHeads?: number;
  embeddingDim?: number;
  lastUpdated: Date;
}

interface NeuralArchitecture {
  id: string;
  name: string;
  type: 'feedforward' | 'recurrent' | 'convolutional' | 'attention' | 'graph';
  layers: LayerConfig[];
  connections: Connection[];
  activation: 'relu' | 'sigmoid' | 'tanh' | 'gelu' | 'swish';
  optimizer: 'adam' | 'adamw' | 'sgd' | 'rmsprop';
  learningRate: number;
}

interface LayerConfig {
  id: string;
  type: 'dense' | 'conv2d' | 'lstm' | 'attention' | 'dropout' | 'batch-norm';
  units?: number;
  filters?: number;
  kernelSize?: number;
  dropout?: number;
  activation?: string;
}

interface Connection {
  from: string;
  to: string;
  type: 'forward' | 'residual' | 'attention';
}

interface AdvancedAIModelsProps {
  tenantId?: string;
  onModelTrained?: (model: AIModel) => void;
  onPredictionMade?: (prediction: any) => void;
}

const AdvancedAIModels: React.FC<AdvancedAIModelsProps> = ({
  tenantId = 'default',
  onModelTrained,
  onPredictionMade
}) => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [architectures, setArchitectures] = useState<NeuralArchitecture[]>([]);
  const [activeTab, setActiveTab] = useState<'models' | 'architectures' | 'training' | 'inference'>('models');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [isTraining, setIsTraining] = useState<string | null>(null);

  useEffect(() => {
    initializeAIModels();
    loadArchitectures();
  }, []);

  const initializeAIModels = () => {
    const initialModels: AIModel[] = [
      {
        id: '1',
        name: 'GarLaws Vision Transformer',
        architecture: 'transformer',
        type: 'vision',
        parameters: 86,
        trainingData: 'ImageNet-21K + Property Images',
        accuracy: 89.2,
        latency: 45,
        status: 'deployed',
        layers: 24,
        attentionHeads: 16,
        embeddingDim: 768,
        lastUpdated: new Date(Date.now() - 86400000 * 7)
      },
      {
        id: '2',
        name: 'Property Price Predictor (Diffusion)',
        architecture: 'diffusion',
        type: 'predictive',
        parameters: 124,
        trainingData: 'Historical Property Data',
        accuracy: 94.1,
        latency: 120,
        status: 'ready',
        layers: 18,
        lastUpdated: new Date(Date.now() - 86400000 * 3)
      },
      {
        id: '3',
        name: 'Multi-Modal Property Analyzer',
        architecture: 'attention',
        type: 'multimodal',
        parameters: 156,
        trainingData: 'Property Images + Descriptions',
        accuracy: 91.7,
        latency: 85,
        status: 'ready',
        layers: 32,
        attentionHeads: 24,
        embeddingDim: 1024,
        lastUpdated: new Date(Date.now() - 86400000 * 1)
      },
      {
        id: '4',
        name: 'Generative Property Designs',
        architecture: 'gan',
        type: 'generative',
        parameters: 78,
        trainingData: 'Architectural Designs Dataset',
        accuracy: 87.3,
        latency: 200,
        status: 'training',
        layers: 12,
        lastUpdated: new Date()
      }
    ];

    setModels(initialModels);
  };

  const loadArchitectures = () => {
    const initialArchitectures: NeuralArchitecture[] = [
      {
        id: '1',
        name: 'Vision Transformer (ViT)',
        type: 'attention',
        layers: [
          { id: 'patch_embed', type: 'dense', units: 768 },
          { id: 'pos_embed', type: 'dense', units: 768 },
          { id: 'attention_1', type: 'attention', units: 768 },
          { id: 'attention_2', type: 'attention', units: 768 },
          { id: 'attention_3', type: 'attention', units: 768 },
          { id: 'mlp_head', type: 'dense', units: 1000 }
        ],
        connections: [
          { from: 'patch_embed', to: 'pos_embed', type: 'forward' },
          { from: 'pos_embed', to: 'attention_1', type: 'forward' },
          { from: 'attention_1', to: 'attention_2', type: 'forward' },
          { from: 'attention_2', to: 'attention_3', type: 'forward' },
          { from: 'attention_3', to: 'mlp_head', type: 'forward' }
        ],
        activation: 'gelu',
        optimizer: 'adamw',
        learningRate: 0.0001
      },
      {
        id: '2',
        name: 'Stable Diffusion v2',
        type: 'attention',
        layers: [
          { id: 'encoder', type: 'conv2d', filters: 128, kernelSize: 3 },
          { id: 'attention', type: 'attention', units: 512 },
          { id: 'decoder', type: 'conv2d', filters: 64, kernelSize: 3 },
          { id: 'output', type: 'conv2d', filters: 3, kernelSize: 1 }
        ],
        connections: [
          { from: 'encoder', to: 'attention', type: 'forward' },
          { from: 'attention', to: 'decoder', type: 'forward' },
          { from: 'decoder', to: 'output', type: 'forward' }
        ],
        activation: 'swish',
        optimizer: 'adam',
        learningRate: 0.00001
      }
    ];

    setArchitectures(initialArchitectures);
  };

  const trainModel = async (modelId: string) => {
    setIsTraining(modelId);
    try {
      // Simulate model training
      await new Promise(resolve => setTimeout(resolve, 8000));

      setModels(prev => prev.map(model =>
        model.id === modelId ? {
          ...model,
          status: 'deployed',
          accuracy: model.accuracy + (Math.random() * 2 - 1), // Slight improvement
          lastUpdated: new Date()
        } : model
      ));

      const updatedModel = models.find(m => m.id === modelId);
      if (updatedModel && onModelTrained) {
        onModelTrained(updatedModel);
      }

    } catch (error) {
      console.error('Training failed:', error);
      setModels(prev => prev.map(model =>
        model.id === modelId ? { ...model, status: 'error' } : model
      ));
    } finally {
      setIsTraining(null);
    }
  };

  const makePrediction = async (modelId: string, input: any) => {
    try {
      // Simulate prediction
      await new Promise(resolve => setTimeout(resolve, 1000));

      const model = models.find(m => m.id === modelId);
      if (!model) return;

      let prediction: any = {};
      switch (model.type) {
        case 'vision':
          prediction = {
            class: 'Residential Property',
            confidence: 0.94,
            features: ['Modern Design', 'Good Condition', 'Prime Location']
          };
          break;
        case 'predictive':
          prediction = {
            price: 2850000,
            confidence: 0.87,
            range: { min: 2650000, max: 3050000 },
            factors: ['Location', 'Size', 'Condition']
          };
          break;
        case 'language':
          prediction = {
            sentiment: 'positive',
            score: 0.82,
            keywords: ['excellent', 'modern', 'spacious']
          };
          break;
      }

      if (onPredictionMade) {
        onPredictionMade(prediction);
      }

      return prediction;

    } catch (error) {
      console.error('Prediction failed:', error);
      return null;
    }
  };

  const getArchitectureColor = (type: string) => {
    switch (type) {
      case 'transformer': return 'bg-purple-100 text-purple-800';
      case 'diffusion': return 'bg-blue-100 text-blue-800';
      case 'gan': return 'bg-green-100 text-green-800';
      case 'autoencoder': return 'bg-yellow-100 text-yellow-800';
      case 'graph-neural': return 'bg-red-100 text-red-800';
      case 'attention': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModelTypeColor = (type: string) => {
    switch (type) {
      case 'language': return 'bg-green-100 text-green-800';
      case 'vision': return 'bg-blue-100 text-blue-800';
      case 'multimodal': return 'bg-purple-100 text-purple-800';
      case 'generative': return 'bg-orange-100 text-orange-800';
      case 'predictive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-blue-500';
      case 'training': return 'bg-yellow-500';
      case 'deployed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Advanced AI Models Platform
          </h2>
          <p className="text-gray-600 mt-1">Next-generation AI architectures and neural networks</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            GPU Cluster: Active
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {models.filter(m => m.status === 'deployed').length} Models Deployed
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            AI Models
          </TabsTrigger>
          <TabsTrigger value="architectures" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Architectures
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Training
          </TabsTrigger>
          <TabsTrigger value="inference" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Inference
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          {/* AI Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {models.map((model) => (
              <Card key={model.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getArchitectureColor(model.architecture)}>
                          {model.architecture.toUpperCase()}
                        </Badge>
                        <Badge className={getModelTypeColor(model.type)}>
                          {model.type.toUpperCase()}
                        </Badge>
                        <Badge className={`${getStatusColor(model.status)} text-white`}>
                          {model.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Parameters</p>
                        <p className="font-semibold">{model.parameters}M</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Accuracy</p>
                        <p className="font-semibold">{model.accuracy.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Latency</p>
                        <p className="font-semibold">{model.latency}ms</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Layers</p>
                        <p className="font-semibold">{model.layers}</p>
                      </div>
                    </div>

                    {model.attentionHeads && model.embeddingDim && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Attention Heads</p>
                          <p className="font-semibold">{model.attentionHeads}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Embedding Dim</p>
                          <p className="font-semibold">{model.embeddingDim}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Training Data</p>
                      <p className="text-sm font-medium">{model.trainingData}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedModel(model)}
                        className="flex-1"
                        variant="outline"
                      >
                        View Details
                      </Button>
                      {model.status === 'ready' && (
                        <Button
                          onClick={() => trainModel(model.id)}
                          disabled={isTraining === model.id}
                          className="flex items-center gap-2"
                        >
                          {isTraining === model.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Training...
                            </>
                          ) : (
                            <>
                              <Settings className="h-4 w-4" />
                              Train
                            </>
                          )}
                        </Button>
                      )}
                      {model.status === 'deployed' && (
                        <Button
                          onClick={() => makePrediction(model.id, {})}
                          className="flex items-center gap-2"
                        >
                          <Target className="h-4 w-4" />
                          Predict
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="architectures" className="space-y-6">
          {/* Neural Architectures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {architectures.map((arch) => (
              <Card key={arch.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{arch.name}</CardTitle>
                  <Badge variant="outline" className="mt-2 capitalize">
                    {arch.type} Neural Network
                  </Badge>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Layers</p>
                        <p className="font-semibold">{arch.layers.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Activation</p>
                        <p className="font-semibold capitalize">{arch.activation}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Optimizer</p>
                        <p className="font-semibold uppercase">{arch.optimizer}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Learning Rate</p>
                        <p className="font-semibold">{arch.learningRate}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Layer Configuration</p>
                      <div className="space-y-1">
                        {arch.layers.slice(0, 4).map((layer) => (
                          <div key={layer.id} className="flex justify-between text-sm">
                            <span className="capitalize">{layer.type}</span>
                            <span>{layer.units || layer.filters || 'N/A'}</span>
                          </div>
                        ))}
                        {arch.layers.length > 4 && (
                          <p className="text-sm text-gray-500">... and {arch.layers.length - 4} more layers</p>
                        )}
                      </div>
                    </div>

                    <Button className="w-full" variant="outline">
                      View Architecture Diagram
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Model Training</h3>
              <p className="text-gray-600 mb-4">
                Distributed training with automatic hyperparameter optimization,
                early stopping, and model compression techniques.
              </p>
              <Button>Configure Training Pipeline</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inference" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Inference</h3>
              <p className="text-gray-600 mb-4">
                High-performance inference with model optimization, quantization,
                and edge deployment capabilities.
              </p>
              <Button>Start Inference Engine</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Model Details Modal */}
      {selectedModel && (
        <Card className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{selectedModel.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getArchitectureColor(selectedModel.architecture)}>
                      {selectedModel.architecture.toUpperCase()}
                    </Badge>
                    <Badge className={getModelTypeColor(selectedModel.type)}>
                      {selectedModel.type.toUpperCase()}
                    </Badge>
                    <Badge className={`${getStatusColor(selectedModel.status)} text-white`}>
                      {selectedModel.status}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedModel(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Model Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedModel.parameters}M</p>
                  <p className="text-sm text-gray-600">Parameters</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{selectedModel.accuracy.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Accuracy</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{selectedModel.latency}ms</p>
                  <p className="text-sm text-gray-600">Latency</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{selectedModel.layers}</p>
                  <p className="text-sm text-gray-600">Layers</p>
                </div>
              </div>

              {/* Architecture Details */}
              <div>
                <h4 className="font-semibold mb-4">Architecture Details</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Architecture Type</p>
                      <p className="font-medium capitalize">{selectedModel.architecture}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Model Type</p>
                      <p className="font-medium capitalize">{selectedModel.type}</p>
                    </div>
                    {selectedModel.attentionHeads && (
                      <div>
                        <p className="text-gray-600">Attention Heads</p>
                        <p className="font-medium">{selectedModel.attentionHeads}</p>
                      </div>
                    )}
                    {selectedModel.embeddingDim && (
                      <div>
                        <p className="text-gray-600">Embedding Dimension</p>
                        <p className="font-medium">{selectedModel.embeddingDim}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Training Information */}
              <div>
                <h4 className="font-semibold mb-4">Training Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Training Data</p>
                      <p className="font-medium">{selectedModel.trainingData}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Updated</p>
                      <p className="font-medium">{selectedModel.lastUpdated.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="font-semibold mb-4">Performance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-medium text-green-800 mb-2">Accuracy Over Time</h5>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                    <p className="text-sm text-green-700 mt-1">{selectedModel.accuracy.toFixed(1)}% current accuracy</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">Latency Distribution</h5>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">{selectedModel.latency}ms average latency</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Card>
      )}
    </div>
  );
};

export default AdvancedAIModels;