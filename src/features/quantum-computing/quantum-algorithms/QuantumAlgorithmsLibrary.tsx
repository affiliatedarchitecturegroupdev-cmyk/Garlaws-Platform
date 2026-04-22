'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Quantum Algorithm Types
export interface QuantumAlgorithm {
  id: string;
  name: string;
  category: 'optimization' | 'search' | 'cryptography' | 'simulation' | 'machine-learning';
  description: string;
  complexity: {
    qubits: number;
    depth: number;
    gates: number;
  };
  performance: {
    classicalComplexity: string;
    quantumAdvantage: number;
    successProbability: number;
    errorTolerance: number;
  };
  useCases: string[];
  parameters: AlgorithmParameter[];
  implementation: {
    framework: 'qiskit' | 'cirq' | 'braket' | 'azure-quantum';
    codeSnippet: string;
    optimizationLevel: number;
  };
  benchmarks: AlgorithmBenchmark[];
  status: 'experimental' | 'stable' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export interface AlgorithmParameter {
  name: string;
  type: 'number' | 'boolean' | 'string' | 'array';
  description: string;
  default?: any;
  min?: number;
  max?: number;
  required: boolean;
}

export interface AlgorithmBenchmark {
  id: string;
  backend: string;
  qubits: number;
  executionTime: number;
  fidelity: number;
  successRate: number;
  classicalComparison: {
    algorithm: string;
    executionTime: number;
    speedup: number;
  };
  date: string;
}

export interface AlgorithmExecution {
  id: string;
  algorithmId: string;
  parameters: Record<string, any>;
  backend: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: any;
  executionTime: number;
  cost: number;
  startedAt: string;
  completedAt?: string;
}

// Quantum Algorithms Library Hook
export function useQuantumAlgorithms() {
  const [algorithms, setAlgorithms] = useState<QuantumAlgorithm[]>([]);
  const [executions, setExecutions] = useState<AlgorithmExecution[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<QuantumAlgorithm | null>(null);
  const [executionParameters, setExecutionParameters] = useState<Record<string, any>>({});

  // Mock quantum algorithms library
  const mockAlgorithms: QuantumAlgorithm[] = [
    {
      id: 'shors-algorithm',
      name: "Shor's Algorithm",
      category: 'cryptography',
      description: 'Quantum algorithm for integer factorization, threatening RSA cryptography',
      complexity: {
        qubits: 14, // For factoring 15
        depth: 1000,
        gates: 5000
      },
      performance: {
        classicalComplexity: 'O(2^(n/3))',
        quantumAdvantage: 1000000, // Million times faster
        successProbability: 0.5,
        errorTolerance: 0.001
      },
      useCases: [
        'Cryptanalysis of RSA',
        'Discrete logarithm problems',
        'Post-quantum cryptography research'
      ],
      parameters: [
        {
          name: 'numberToFactor',
          type: 'number',
          description: 'The integer to factorize',
          default: 15,
          min: 2,
          required: true
        },
        {
          name: 'precision',
          type: 'number',
          description: 'Precision for period finding',
          default: 0.01,
          min: 0.001,
          max: 0.1,
          required: false
        }
      ],
      implementation: {
        framework: 'qiskit',
        codeSnippet: `from qiskit import QuantumCircuit
from qiskit.algorithms import Shor

def shor_factorization(N):
    shor = Shor()
    result = shor.factor(N)
    return result.factors`,
        optimizationLevel: 3
      },
      benchmarks: [
        {
          id: 'bench1',
          backend: 'ibm-quantum',
          qubits: 14,
          executionTime: 120000,
          fidelity: 0.85,
          successRate: 0.45,
          classicalComparison: {
            algorithm: 'Pollard\'s rho',
            executionTime: 3600000,
            speedup: 30
          },
          date: '2026-04-22T00:00:00Z'
        }
      ],
      status: 'experimental',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    },
    {
      id: 'grovers-algorithm',
      name: "Grover's Algorithm",
      category: 'search',
      description: 'Quantum search algorithm providing quadratic speedup for unstructured search',
      complexity: {
        qubits: 10, // For searching 1024 items
        depth: 20,
        gates: 200
      },
      performance: {
        classicalComplexity: 'O(N)',
        quantumAdvantage: 32, // sqrt(1024) = 32
        successProbability: 0.95,
        errorTolerance: 0.01
      },
      useCases: [
        'Database search optimization',
        'Cryptographic attacks',
        'Machine learning optimization',
        'Combinatorial optimization'
      ],
      parameters: [
        {
          name: 'searchSpace',
          type: 'number',
          description: 'Size of the search space (must be power of 2)',
          default: 1024,
          min: 4,
          required: true
        },
        {
          name: 'targetItem',
          type: 'number',
          description: 'Index of the item to find',
          default: 0,
          required: true
        }
      ],
      implementation: {
        framework: 'qiskit',
        codeSnippet: `from qiskit import QuantumCircuit
from qiskit.algorithms import Grover

def grover_search(search_space_size, target):
    oracle = create_oracle(target, search_space_size)
    grover = Grover(oracle)
    circuit = grover.construct_circuit()
    return circuit`,
        optimizationLevel: 2
      },
      benchmarks: [
        {
          id: 'bench2',
          backend: 'google-quantum',
          qubits: 10,
          executionTime: 5000,
          fidelity: 0.95,
          successRate: 0.92,
          classicalComparison: {
            algorithm: 'Linear search',
            executionTime: 1024,
            speedup: 204.8
          },
          date: '2026-04-22T00:00:00Z'
        }
      ],
      status: 'stable',
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    },
    {
      id: 'qaoa-optimization',
      name: 'QAOA Optimization',
      category: 'optimization',
      description: 'Quantum Approximate Optimization Algorithm for combinatorial optimization',
      complexity: {
        qubits: 8,
        depth: 50,
        gates: 400
      },
      performance: {
        classicalComplexity: 'NP-hard',
        quantumAdvantage: 10,
        successProbability: 0.85,
        errorTolerance: 0.05
      },
      useCases: [
        'Supply chain optimization',
        'Financial portfolio optimization',
        'Traffic routing',
        'Resource allocation'
      ],
      parameters: [
        {
          name: 'problemSize',
          type: 'number',
          description: 'Size of the optimization problem',
          default: 8,
          min: 4,
          max: 20,
          required: true
        },
        {
          name: 'layers',
          type: 'number',
          description: 'Number of QAOA layers',
          default: 2,
          min: 1,
          max: 10,
          required: true
        },
        {
          name: 'optimizationTarget',
          type: 'string',
          description: 'Type of optimization (maxcut, tsp, knapsack)',
          default: 'maxcut',
          required: true
        }
      ],
      implementation: {
        framework: 'qiskit',
        codeSnippet: `from qiskit import QuantumCircuit
from qiskit.algorithms import QAOA
from qiskit_optimization import QuadraticProgram

def qaoa_optimization(cost_matrix, layers=2):
    qp = QuadraticProgram()
    # Add variables and constraints
    qaoa = QAOA(optimizer=COBYLA(), reps=layers)
    result = qaoa.compute_minimum_eigenvalue(cost_matrix)
    return result`,
        optimizationLevel: 3
      },
      benchmarks: [
        {
          id: 'bench3',
          backend: 'aws-braket',
          qubits: 8,
          executionTime: 25000,
          fidelity: 0.88,
          successRate: 0.82,
          classicalComparison: {
            algorithm: 'Simulated annealing',
            executionTime: 180000,
            speedup: 7.2
          },
          date: '2026-04-22T00:00:00Z'
        }
      ],
      status: 'stable',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    },
    {
      id: 'vqe-molecule',
      name: 'VQE Molecular Simulation',
      category: 'simulation',
      description: 'Variational Quantum Eigensolver for quantum chemistry simulations',
      complexity: {
        qubits: 12,
        depth: 100,
        gates: 1200
      },
      performance: {
        classicalComplexity: 'O(4^n)',
        quantumAdvantage: 100,
        successProbability: 0.75,
        errorTolerance: 0.1
      },
      useCases: [
        'Drug discovery',
        'Materials science',
        'Catalyst design',
        'Battery chemistry'
      ],
      parameters: [
        {
          name: 'molecule',
          type: 'string',
          description: 'Molecular formula or SMILES string',
          default: 'H2',
          required: true
        },
        {
          name: 'basisSet',
          type: 'string',
          description: 'Quantum chemistry basis set',
          default: 'sto-3g',
          required: false
        },
        {
          name: 'ansatzLayers',
          type: 'number',
          description: 'Number of ansatz layers',
          default: 3,
          min: 1,
          max: 10,
          required: true
        }
      ],
      implementation: {
        framework: 'qiskit',
        codeSnippet: `from qiskit import QuantumCircuit
from qiskit.algorithms import VQE
from qiskit_nature.second_q.drivers import PySCFDriver

def vqe_molecular_energy(molecule_formula, basis='sto-3g'):
    driver = PySCFDriver(atom=molecule_formula, basis=basis)
    problem = driver.run()
    
    vqe = VQE(ansatz=UCCSD(), optimizer=SLSQP())
    result = vqe.compute_minimum_eigenvalue(problem.hamiltonian)
    return result.eigenvalue`,
        optimizationLevel: 3
      },
      benchmarks: [
        {
          id: 'bench4',
          backend: 'azure-quantum',
          qubits: 12,
          executionTime: 180000,
          fidelity: 0.78,
          successRate: 0.72,
          classicalComparison: {
            algorithm: 'Hartree-Fock + CI',
            executionTime: 7200000,
            speedup: 40
          },
          date: '2026-04-22T00:00:00Z'
        }
      ],
      status: 'experimental',
      createdAt: '2026-02-15T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    }
  ];

  const loadAlgorithms = useCallback(async () => {
    try {
      // In real implementation, load from quantum algorithm registry
      await new Promise(resolve => setTimeout(resolve, 300));
      setAlgorithms(mockAlgorithms);
    } catch (error) {
      console.error('Failed to load quantum algorithms:', error);
    }
  }, []);

  const executeAlgorithm = useCallback(async (
    algorithmId: string,
    parameters: Record<string, any>,
    backend: string = 'simulator'
  ): Promise<AlgorithmExecution> => {
    const algorithm = algorithms.find(a => a.id === algorithmId);
    if (!algorithm) {
      throw new Error(`Algorithm ${algorithmId} not found`);
    }

    const execution: AlgorithmExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      algorithmId,
      parameters,
      backend,
      status: 'queued',
      executionTime: 0,
      cost: calculateExecutionCost(algorithm, parameters),
      startedAt: new Date().toISOString()
    };

    setExecutions(prev => [...prev, execution]);

    // Simulate algorithm execution
    setTimeout(async () => {
      try {
        const result = await simulateAlgorithmExecution(algorithm, parameters);

        setExecutions(prev =>
          prev.map(e =>
            e.id === execution.id
              ? {
                  ...e,
                  status: 'completed',
                  result,
                  executionTime: result.executionTime,
                  completedAt: new Date().toISOString()
                }
              : e
          )
        );
      } catch (error) {
        setExecutions(prev =>
          prev.map(e =>
            e.id === execution.id
              ? { ...e, status: 'failed', completedAt: new Date().toISOString() }
              : e
          )
        );
      }
    }, Math.random() * 10000 + 5000);

    return execution;
  }, [algorithms]);

  const simulateAlgorithmExecution = async (algorithm: QuantumAlgorithm, parameters: Record<string, any>) => {
    // Mock algorithm execution based on type
    const baseExecutionTime = algorithm.complexity.depth * 100 + Math.random() * 1000;
    const successProbability = algorithm.performance.successProbability;

    if (Math.random() > successProbability) {
      throw new Error('Algorithm execution failed due to quantum noise');
    }

    let result: any = {};

    switch (algorithm.category) {
      case 'cryptography':
        // Shor's algorithm result
        result = {
          factors: [3, 5], // For N=15
          period: 4,
          executionTime: baseExecutionTime
        };
        break;

      case 'search':
        // Grover's algorithm result
        const searchSpaceSize = parameters.searchSpace || 1024;
        result = {
          found: true,
          index: parameters.targetItem || Math.floor(Math.random() * searchSpaceSize),
          iterations: Math.ceil(Math.sqrt(searchSpaceSize)),
          executionTime: baseExecutionTime
        };
        break;

      case 'optimization':
        // QAOA result
        result = {
          optimalValue: Math.random() * 100,
          solution: Array.from({ length: parameters.problemSize || 8 }, () => Math.random() > 0.5),
          confidence: 0.85 + Math.random() * 0.1,
          executionTime: baseExecutionTime
        };
        break;

      case 'simulation':
        // VQE result
        result = {
          groundStateEnergy: -1.5 + Math.random() * 0.5,
          converged: true,
          iterations: 50 + Math.floor(Math.random() * 50),
          executionTime: baseExecutionTime
        };
        break;

      default:
        result = {
          output: 'Algorithm completed successfully',
          executionTime: baseExecutionTime
        };
    }

    return result;
  };

  const calculateExecutionCost = (algorithm: QuantumAlgorithm, parameters: Record<string, any>): number => {
    const baseCost = 0.1;
    const qubitMultiplier = algorithm.complexity.qubits * 0.05;
    const depthMultiplier = algorithm.complexity.depth * 0.001;

    return baseCost + qubitMultiplier + depthMultiplier;
  };

  const getAlgorithmByCategory = useCallback((category: QuantumAlgorithm['category']) => {
    return algorithms.filter(alg => alg.category === category);
  }, [algorithms]);

  const getTopPerformingAlgorithms = useCallback(() => {
    return algorithms
      .sort((a, b) => b.performance.quantumAdvantage - a.performance.quantumAdvantage)
      .slice(0, 5);
  }, [algorithms]);

  useEffect(() => {
    loadAlgorithms();
  }, [loadAlgorithms]);

  return {
    algorithms,
    executions,
    selectedAlgorithm,
    setSelectedAlgorithm,
    executionParameters,
    setExecutionParameters,
    executeAlgorithm,
    getAlgorithmByCategory,
    getTopPerformingAlgorithms,
    loadAlgorithms,
  };
}

// Quantum Algorithms Library Component
interface QuantumAlgorithmsLibraryProps {
  className?: string;
}

export const QuantumAlgorithmsLibrary: React.FC<QuantumAlgorithmsLibraryProps> = ({
  className
}) => {
  const {
    algorithms,
    executions,
    selectedAlgorithm,
    setSelectedAlgorithm,
    executionParameters,
    setExecutionParameters,
    executeAlgorithm,
    getAlgorithmByCategory
  } = useQuantumAlgorithms();

  const [selectedCategory, setSelectedCategory] = useState<QuantumAlgorithm['category']>('optimization');
  const [executing, setExecuting] = useState<string | null>(null);

  const categories = [
    { key: 'optimization', label: 'Optimization', icon: '🎯' },
    { key: 'search', label: 'Search', icon: '🔍' },
    { key: 'cryptography', label: 'Cryptography', icon: '🔐' },
    { key: 'simulation', label: 'Simulation', icon: '⚛️' },
    { key: 'machine-learning', label: 'Machine Learning', icon: '🤖' }
  ];

  const filteredAlgorithms = getAlgorithmByCategory(selectedCategory);

  const handleExecuteAlgorithm = async () => {
    if (!selectedAlgorithm) return;

    setExecuting(selectedAlgorithm.id);
    try {
      const execution = await executeAlgorithm(selectedAlgorithm.id, executionParameters);
      console.log('Algorithm execution started:', execution);
    } catch (error) {
      console.error('Failed to execute algorithm:', error);
    } finally {
      setExecuting(null);
    }
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 10) return 'text-green-600';
    if (complexity <= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quantum Algorithms Library</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Advanced quantum algorithms for optimization, search, cryptography, and simulation
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key as any)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2',
              selectedCategory === category.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 hover:bg-gray-200'
            )}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Algorithms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAlgorithms.map(algorithm => (
          <div
            key={algorithm.id}
            className={cn(
              'bg-white p-6 rounded-lg border cursor-pointer transition-all hover:shadow-md',
              selectedAlgorithm?.id === algorithm.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
            )}
            onClick={() => setSelectedAlgorithm(algorithm)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{algorithm.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{algorithm.description}</p>
              </div>
              <span className={cn(
                'px-2 py-1 rounded text-xs font-medium ml-4',
                algorithm.status === 'stable' ? 'bg-green-100 text-green-800' :
                algorithm.status === 'experimental' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              )}>
                {algorithm.status}
              </span>
            </div>

            {/* Complexity Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
              <div className="text-center">
                <div className={cn('text-lg font-bold', getComplexityColor(algorithm.complexity.qubits))}>
                  {algorithm.complexity.qubits}
                </div>
                <div className="text-muted-foreground">Qubits</div>
              </div>
              <div className="text-center">
                <div className={cn('text-lg font-bold', getComplexityColor(algorithm.complexity.depth))}>
                  {algorithm.complexity.depth}
                </div>
                <div className="text-muted-foreground">Depth</div>
              </div>
              <div className="text-center">
                <div className={cn('text-lg font-bold', getComplexityColor(algorithm.complexity.gates))}>
                  {algorithm.complexity.gates}
                </div>
                <div className="text-muted-foreground">Gates</div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-muted-foreground">Quantum Advantage:</span>
                <div className="font-semibold text-green-600">{algorithm.performance.quantumAdvantage}x</div>
              </div>
              <div>
                <span className="text-muted-foreground">Success Rate:</span>
                <div className="font-semibold">{(algorithm.performance.successProbability * 100).toFixed(1)}%</div>
              </div>
            </div>

            {/* Use Cases */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Use Cases:</h4>
              <div className="flex flex-wrap gap-1">
                {algorithm.useCases.slice(0, 3).map(useCase => (
                  <span key={useCase} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {useCase}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Algorithm Detail Panel */}
      {selectedAlgorithm && (
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold">{selectedAlgorithm.name}</h3>
              <p className="text-muted-foreground mt-2">{selectedAlgorithm.description}</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium capitalize">
                {selectedAlgorithm.category}
              </span>
              <div className="text-sm text-muted-foreground mt-2">
                Framework: {selectedAlgorithm.implementation.framework}
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Parameters</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedAlgorithm.parameters.map(param => (
                <div key={param.name} className="space-y-2">
                  <label className="block text-sm font-medium">
                    {param.name} {param.required && <span className="text-red-500">*</span>}
                  </label>
                  {param.type === 'number' && (
                    <input
                      type="number"
                      value={executionParameters[param.name] || param.default || ''}
                      onChange={(e) => setExecutionParameters(prev => ({
                        ...prev,
                        [param.name]: parseFloat(e.target.value)
                      }))}
                      className="w-full px-3 py-2 border border-border rounded"
                      min={param.min}
                      max={param.max}
                    />
                  )}
                  {param.type === 'string' && (
                    <input
                      type="text"
                      value={executionParameters[param.name] || param.default || ''}
                      onChange={(e) => setExecutionParameters(prev => ({
                        ...prev,
                        [param.name]: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-border rounded"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">{param.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Execution */}
          <div className="flex justify-center">
            <button
              onClick={handleExecuteAlgorithm}
              disabled={executing === selectedAlgorithm.id}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-semibold"
            >
              {executing === selectedAlgorithm.id ? 'Executing Algorithm...' : 'Execute Quantum Algorithm'}
            </button>
          </div>

          {/* Code Snippet */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-4">Implementation</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{selectedAlgorithm.implementation.codeSnippet}</code>
            </pre>
          </div>

          {/* Benchmarks */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-4">Benchmarks</h4>
            <div className="space-y-3">
              {selectedAlgorithm.benchmarks.map(benchmark => (
                <div key={benchmark.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Backend:</span>
                      <div className="font-medium">{benchmark.backend}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Execution Time:</span>
                      <div className="font-medium">{(benchmark.executionTime / 1000).toFixed(2)}s</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fidelity:</span>
                      <div className="font-medium">{(benchmark.fidelity * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Speedup:</span>
                      <div className="font-medium text-green-600">{benchmark.classicalComparison.speedup}x</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Executions */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Recent Executions</h3>
        <div className="space-y-3">
          {executions.slice(-5).map(execution => {
            const algorithm = algorithms.find(a => a.id === execution.algorithmId);
            return (
              <div key={execution.id} className="flex items-center justify-between p-4 border rounded">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    execution.status === 'completed' ? 'bg-green-500' :
                    execution.status === 'running' ? 'bg-blue-500' :
                    execution.status === 'failed' ? 'bg-red-500' :
                    'bg-yellow-500'
                  )} />
                  <div>
                    <div className="font-medium">{algorithm?.name || execution.algorithmId}</div>
                    <div className="text-sm text-muted-foreground">
                      {execution.backend} • {(execution.executionTime / 1000).toFixed(2)}s • ${execution.cost.toFixed(4)}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(execution.startedAt).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};