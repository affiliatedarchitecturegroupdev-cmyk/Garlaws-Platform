'use client';

import { useState, useEffect, useCallback } from 'react';

interface Architecture {
  id: string;
  name: string;
  layers: number;
  neurons: number[];
  activation: string;
  optimizer: string;
  learningRate: number;
  accuracy: number;
  loss: number;
  trainingTime: number;
  parameters: number;
}

interface SearchResult {
  architecture: Architecture;
  generation: number;
  fitness: number;
  rank: number;
  timestamp: Date;
}

interface SearchConfig {
  populationSize: number;
  generations: number;
  mutationRate: number;
  crossoverRate: number;
  searchSpace: {
    layers: [number, number];
    neurons: [number, number];
    learningRate: [number, number];
  };
}

interface NeuralSearchProps {
  tenantId?: string;
  dataset?: 'mnist' | 'cifar10' | 'custom';
  searchConfig?: Partial<SearchConfig>;
  onSearchComplete?: (bestArchitecture: Architecture) => void;
}

const DEFAULT_CONFIG: SearchConfig = {
  populationSize: 20,
  generations: 10,
  mutationRate: 0.1,
  crossoverRate: 0.8,
  searchSpace: {
    layers: [2, 5],
    neurons: [32, 512],
    learningRate: [0.001, 0.1]
  }
};

const OPTIMIZERS = ['adam', 'sgd', 'rmsprop', 'adagrad'];
const ACTIVATIONS = ['relu', 'tanh', 'sigmoid', 'elu'];

const SAMPLE_DATASETS = {
  mnist: { name: 'MNIST', classes: 10, samples: 60000, description: 'Handwritten digit recognition' },
  cifar10: { name: 'CIFAR-10', classes: 10, samples: 50000, description: 'Object recognition in images' },
  custom: { name: 'Custom Dataset', classes: 0, samples: 0, description: 'User-defined dataset' }
};

export default function NeuralSearch({
  tenantId = 'default',
  dataset = 'mnist',
  searchConfig = {},
  onSearchComplete
}: NeuralSearchProps) {
  const [config] = useState<SearchConfig>({ ...DEFAULT_CONFIG, ...searchConfig });
  const [isSearching, setIsSearching] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState(0);
  const [bestArchitecture, setBestArchitecture] = useState<Architecture | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);
  const [population, setPopulation] = useState<Architecture[]>([]);

  const generateRandomArchitecture = useCallback((): Architecture => {
    const layers = Math.floor(Math.random() * (config.searchSpace.layers[1] - config.searchSpace.layers[0] + 1)) + config.searchSpace.layers[0];
    const neurons = Array.from({ length: layers }, () =>
      Math.floor(Math.random() * (config.searchSpace.neurons[1] - config.searchSpace.neurons[0] + 1)) + config.searchSpace.neurons[0]
    );
    const activation = ACTIVATIONS[Math.floor(Math.random() * ACTIVATIONS.length)];
    const optimizer = OPTIMIZERS[Math.floor(Math.random() * OPTIMIZERS.length)];
    const learningRate = config.searchSpace.learningRate[0] + Math.random() * (config.searchSpace.learningRate[1] - config.searchSpace.learningRate[0]);

    return {
      id: `arch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `Arch_${layers}L_${neurons.reduce((a, b) => a + b, 0)}N`,
      layers,
      neurons,
      activation,
      optimizer,
      learningRate,
      accuracy: 0,
      loss: 0,
      trainingTime: 0,
      parameters: neurons.reduce((sum, n) => sum + n, 0) * 2 // Rough parameter count
    };
  }, [config]);

  const evaluateArchitecture = useCallback(async (architecture: Architecture): Promise<Architecture> => {
    // Simulate training and evaluation
    const trainingTime = 1000 + Math.random() * 2000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, trainingTime));

    // Simulate accuracy based on architecture quality
    const baseAccuracy = 0.7;
    const layerBonus = Math.min(0.1, architecture.layers * 0.02);
    const neuronBonus = Math.min(0.1, (architecture.neurons.reduce((a, b) => a + b, 0) / 1000) * 0.1);
    const lrBonus = architecture.learningRate > 0.001 && architecture.learningRate < 0.01 ? 0.05 : 0;

    const accuracy = Math.min(0.95, baseAccuracy + layerBonus + neuronBonus + lrBonus + Math.random() * 0.1);
    const loss = 1 - accuracy + Math.random() * 0.1;

    return {
      ...architecture,
      accuracy,
      loss,
      trainingTime: Math.round(trainingTime)
    };
  }, []);

  const mutateArchitecture = useCallback((architecture: Architecture): Architecture => {
    const mutated = { ...architecture };

    if (Math.random() < config.mutationRate) {
      // Mutate layers
      mutated.layers = Math.max(config.searchSpace.layers[0],
        Math.min(config.searchSpace.layers[1], mutated.layers + (Math.random() > 0.5 ? 1 : -1)));
    }

    if (Math.random() < config.mutationRate) {
      // Mutate neurons
      mutated.neurons = mutated.neurons.map(n =>
        Math.max(config.searchSpace.neurons[0],
          Math.min(config.searchSpace.neurons[1], n + Math.floor(Math.random() * 101) - 50))
      );
    }

    if (Math.random() < config.mutationRate) {
      // Mutate learning rate
      mutated.learningRate = config.searchSpace.learningRate[0] +
        Math.random() * (config.searchSpace.learningRate[1] - config.searchSpace.learningRate[0]);
    }

    if (Math.random() < config.mutationRate) {
      // Mutate activation
      mutated.activation = ACTIVATIONS[Math.floor(Math.random() * ACTIVATIONS.length)];
    }

    if (Math.random() < config.mutationRate) {
      // Mutate optimizer
      mutated.optimizer = OPTIMIZERS[Math.floor(Math.random() * OPTIMIZERS.length)];
    }

    mutated.parameters = mutated.neurons.reduce((sum, n) => sum + n, 0) * 2;
    mutated.name = `Arch_${mutated.layers}L_${mutated.neurons.reduce((a, b) => a + b, 0)}N`;

    return mutated;
  }, [config]);

  const crossoverArchitectures = useCallback((parent1: Architecture, parent2: Architecture): [Architecture, Architecture] => {
    const child1 = { ...parent1 };
    const child2 = { ...parent2 };

    // Crossover layers
    if (Math.random() < config.crossoverRate) {
      const tempLayers = child1.layers;
      child1.layers = child2.layers;
      child2.layers = tempLayers;
    }

    // Crossover neurons (single point crossover)
    if (Math.random() < config.crossoverRate && child1.neurons.length > 0 && child2.neurons.length > 0) {
      const minLength = Math.min(child1.neurons.length, child2.neurons.length);
      const crossoverPoint = Math.floor(Math.random() * minLength);

      const tempNeurons1 = [...child1.neurons];
      const tempNeurons2 = [...child2.neurons];

      child1.neurons = [...tempNeurons1.slice(0, crossoverPoint), ...tempNeurons2.slice(crossoverPoint)];
      child2.neurons = [...tempNeurons2.slice(0, crossoverPoint), ...tempNeurons1.slice(crossoverPoint)];
    }

    // Ensure neuron counts are within bounds
    child1.neurons = child1.neurons.map(n =>
      Math.max(config.searchSpace.neurons[0], Math.min(config.searchSpace.neurons[1], n))
    );
    child2.neurons = child2.neurons.map(n =>
      Math.max(config.searchSpace.neurons[0], Math.min(config.searchSpace.neurons[1], n))
    );

    // Update parameters
    child1.parameters = child1.neurons.reduce((sum, n) => sum + n, 0) * 2;
    child2.parameters = child2.neurons.reduce((sum, n) => sum + n, 0) * 2;

    child1.name = `Arch_${child1.layers}L_${child1.neurons.reduce((a, b) => a + b, 0)}N`;
    child2.name = `Arch_${child2.layers}L_${child2.neurons.reduce((a, b) => a + b, 0)}N`;

    return [child1, child2];
  }, [config]);

  const runEvolutionStep = useCallback(async (currentPop: Architecture[]): Promise<Architecture[]> => {
    // Evaluate current population
    const evaluated = await Promise.all(currentPop.map(evaluateArchitecture));

    // Sort by fitness (accuracy)
    evaluated.sort((a, b) => b.accuracy - a.accuracy);

    // Select top performers (elitism)
    const eliteCount = Math.floor(config.populationSize * 0.2);
    const elites = evaluated.slice(0, eliteCount);

    // Create offspring through crossover and mutation
    const offspring: Architecture[] = [];
    while (offspring.length < config.populationSize - eliteCount) {
      // Tournament selection
      const parent1 = evaluated[Math.floor(Math.random() * Math.floor(config.populationSize * 0.5))];
      const parent2 = evaluated[Math.floor(Math.random() * Math.floor(config.populationSize * 0.5))];

      const [child1, child2] = crossoverArchitectures(parent1, parent2);
      offspring.push(mutateArchitecture(child1));
      if (offspring.length < config.populationSize - eliteCount) {
        offspring.push(mutateArchitecture(child2));
      }
    }

    return [...elites, ...offspring];
  }, [config, evaluateArchitecture, crossoverArchitectures, mutateArchitecture]);

  const startSearch = useCallback(async () => {
    if (isSearching) return;

    setIsSearching(true);
    setCurrentGeneration(0);
    setBestArchitecture(null);
    setSearchHistory([]);

    // Initialize population
    const initialPopulation = Array.from({ length: config.populationSize }, generateRandomArchitecture);
    setPopulation(initialPopulation);

    let currentPop = initialPopulation;

    for (let gen = 1; gen <= config.generations; gen++) {
      setCurrentGeneration(gen);
      currentPop = await runEvolutionStep(currentPop);
      setPopulation(currentPop);

      // Update best architecture
      const best = currentPop.reduce((best, arch) =>
        arch.accuracy > best.accuracy ? arch : best
      );

      setBestArchitecture(best);

      // Add to search history
      const result: SearchResult = {
        architecture: best,
        generation: gen,
        fitness: best.accuracy,
        rank: 1,
        timestamp: new Date()
      };
      setSearchHistory(prev => [result, ...prev.slice(0, 49)]); // Keep last 50 results
    }

    setIsSearching(false);
    onSearchComplete?.(currentPop[0]);
  }, [isSearching, config, generateRandomArchitecture, runEvolutionStep, onSearchComplete]);

  const datasetInfo = SAMPLE_DATASETS[dataset];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Neural Architecture Search</h1>
            <p className="text-gray-600">Automated model optimization and hyperparameter tuning</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Dataset</div>
              <div className="font-medium">{datasetInfo.name}</div>
            </div>
            <div className={`w-3 h-3 rounded-full ${isSearching ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          </div>
        </div>

        {/* Dataset Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{datasetInfo.classes}</div>
            <div className="text-sm text-gray-600">Classes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{datasetInfo.samples.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Samples</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{config.populationSize}</div>
            <div className="text-sm text-gray-600">Population</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{config.generations}</div>
            <div className="text-sm text-gray-600">Generations</div>
          </div>
        </div>
      </div>

      {/* Search Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Search Configuration</h2>
          <button
            onClick={startSearch}
            disabled={isSearching}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Searching... (Gen {currentGeneration}/{config.generations})
              </>
            ) : (
              'Start Neural Architecture Search'
            )}
          </button>
        </div>

        {/* Search Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-900">{config.mutationRate * 100}%</div>
            <div className="text-sm text-gray-600">Mutation Rate</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-900">{config.crossoverRate * 100}%</div>
            <div className="text-sm text-gray-600">Crossover Rate</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-900">{config.searchSpace.layers[0]}-{config.searchSpace.layers[1]}</div>
            <div className="text-sm text-gray-600">Layer Range</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-900">{config.searchSpace.neurons[0]}-{config.searchSpace.neurons[1]}</div>
            <div className="text-sm text-gray-600">Neuron Range</div>
          </div>
        </div>
      </div>

      {/* Best Architecture */}
      {bestArchitecture && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Best Architecture Found</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Architecture</div>
                <div className="font-medium">{bestArchitecture.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Layers</div>
                <div className="font-medium">{bestArchitecture.layers}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Parameters</div>
                <div className="font-medium">{bestArchitecture.parameters.toLocaleString()}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Accuracy</div>
                <div className="font-medium text-green-600">{(bestArchitecture.accuracy * 100).toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Loss</div>
                <div className="font-medium text-red-600">{bestArchitecture.loss.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Training Time</div>
                <div className="font-medium">{bestArchitecture.trainingTime}ms</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Activation</div>
                <div className="font-medium capitalize">{bestArchitecture.activation}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Optimizer</div>
                <div className="font-medium uppercase">{bestArchitecture.optimizer}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Learning Rate</div>
                <div className="font-medium">{bestArchitecture.learningRate.toFixed(4)}</div>
              </div>
            </div>
          </div>

          {/* Architecture Visualization */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium mb-3">Network Architecture</div>
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold mb-1">
                  I
                </div>
                <div className="text-xs text-gray-600">Input</div>
              </div>
              {bestArchitecture.neurons.map((neurons, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold mb-1 text-xs">
                    {neurons}
                  </div>
                  <div className="text-xs text-gray-600">Layer {index + 1}</div>
                </div>
              ))}
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold mb-1">
                  O
                </div>
                <div className="text-xs text-gray-600">Output</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Population Overview */}
      {population.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Population</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {population.slice(0, 6).map((arch, index) => (
              <div key={arch.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">{arch.name}</div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    index === 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    #{index + 1}
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Accuracy: {(arch.accuracy * 100).toFixed(1)}%</div>
                  <div>Parameters: {arch.parameters.toLocaleString()}</div>
                  <div>Layers: {arch.layers}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Search Progress</h2>
          <div className="h-64">
            {/* Simple chart visualization */}
            <div className="flex items-end justify-center space-x-1 h-full">
              {searchHistory.slice().reverse().map((result, index) => (
                <div
                  key={index}
                  className="bg-blue-500 hover:bg-blue-600 transition-colors"
                  style={{
                    width: '8px',
                    height: `${result.fitness * 100}%`,
                    minHeight: '4px'
                  }}
                  title={`Gen ${result.generation}: ${(result.fitness * 100).toFixed(1)}%`}
                ></div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600 mt-2">Fitness over generations</div>
          </div>
        </div>
      )}

      {/* Evolution Metrics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Evolution Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded">
            <div className="text-lg font-bold text-blue-600">{currentGeneration}</div>
            <div className="text-sm text-gray-600">Current Generation</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-lg font-bold text-green-600">
              {bestArchitecture ? (bestArchitecture.accuracy * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-600">Best Fitness</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded">
            <div className="text-lg font-bold text-purple-600">
              {population.length > 0 ? population.reduce((sum, arch) => sum + arch.accuracy, 0) / population.length * 100 : 0}%
            </div>
            <div className="text-sm text-gray-600">Avg Population Fitness</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded">
            <div className="text-lg font-bold text-orange-600">
              {searchHistory.length}
            </div>
            <div className="text-sm text-gray-600">Total Evaluations</div>
          </div>
        </div>
      </div>
    </div>
  );
}