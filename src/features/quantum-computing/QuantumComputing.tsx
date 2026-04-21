"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Atom, Zap, Target, Brain, Cpu, Calculator, Play, Square } from 'lucide-react';

interface QuantumCircuit {
  id: string;
  name: string;
  type: 'optimization' | 'machine-learning' | 'cryptography' | 'simulation';
  qubits: number;
  gates: QuantumGate[];
  parameters: any;
  status: 'ready' | 'running' | 'completed' | 'error';
  result?: any;
  executionTime?: number;
  fidelity?: number;
}

interface QuantumGate {
  id: string;
  type: 'H' | 'X' | 'Y' | 'Z' | 'CNOT' | 'Toffoli' | 'Fredkin' | 'RX' | 'RY' | 'RZ';
  qubits: number[];
  parameters?: number[];
}

interface OptimizationProblem {
  id: string;
  name: string;
  type: 'traveling-salesman' | 'knapsack' | 'max-cut' | 'portfolio-optimization';
  variables: number;
  constraints: any[];
  objective: string;
}

interface QuantumComputingProps {
  tenantId?: string;
  onQuantumResult?: (result: any) => void;
  onOptimizationComplete?: (solution: any) => void;
}

const QuantumComputing: React.FC<QuantumComputingProps> = ({
  tenantId = 'default',
  onQuantumResult,
  onOptimizationComplete
}) => {
  const [circuits, setCircuits] = useState<QuantumCircuit[]>([]);
  const [activeTab, setActiveTab] = useState<'circuits' | 'optimization' | 'ml' | 'simulation'>('circuits');
  const [selectedCircuit, setSelectedCircuit] = useState<QuantumCircuit | null>(null);
  const [isExecuting, setIsExecuting] = useState<string | null>(null);
  const [optimizationProblems, setOptimizationProblems] = useState<OptimizationProblem[]>([]);

  useEffect(() => {
    initializeQuantumCircuits();
    loadOptimizationProblems();
  }, []);

  const initializeQuantumCircuits = () => {
    const initialCircuits: QuantumCircuit[] = [
      {
        id: '1',
        name: 'Quantum Approximate Optimization Algorithm (QAOA)',
        type: 'optimization',
        qubits: 4,
        gates: [
          { id: 'h1', type: 'H', qubits: [0] },
          { id: 'h2', type: 'H', qubits: [1] },
          { id: 'h3', type: 'H', qubits: [2] },
          { id: 'h4', type: 'H', qubits: [3] },
          { id: 'cnot1', type: 'CNOT', qubits: [0, 1] },
          { id: 'cnot2', type: 'CNOT', qubits: [1, 2] },
          { id: 'cnot3', type: 'CNOT', qubits: [2, 3] }
        ],
        parameters: { layers: 2, beta: [0.5, 0.3], gamma: [0.8, 0.6] },
        status: 'ready'
      },
      {
        id: '2',
        name: 'Variational Quantum Eigensolver (VQE)',
        type: 'machine-learning',
        qubits: 3,
        gates: [
          { id: 'ry1', type: 'RY', qubits: [0], parameters: [0.5] },
          { id: 'ry2', type: 'RY', qubits: [1], parameters: [0.3] },
          { id: 'ry3', type: 'RY', qubits: [2], parameters: [0.8] },
          { id: 'cnot1', type: 'CNOT', qubits: [0, 1] },
          { id: 'cnot2', type: 'CNOT', qubits: [1, 2] }
        ],
        parameters: { ansatz: 'hardware-efficient', optimizer: 'adam', learningRate: 0.01 },
        status: 'ready'
      },
      {
        id: '3',
        name: 'Quantum Fourier Transform',
        type: 'cryptography',
        qubits: 4,
        gates: [
          { id: 'h1', type: 'H', qubits: [0] },
          { id: 'cu1', type: 'CNOT', qubits: [0, 1] },
          { id: 'cu2', type: 'CNOT', qubits: [0, 2] },
          { id: 'cu3', type: 'CNOT', qubits: [0, 3] }
        ],
        parameters: { precision: 0.001 },
        status: 'ready'
      }
    ];

    setCircuits(initialCircuits);
  };

  const loadOptimizationProblems = () => {
    const problems: OptimizationProblem[] = [
      {
        id: '1',
        name: 'Traveling Salesman Problem (4 cities)',
        type: 'traveling-salesman',
        variables: 4,
        constraints: ['visit-each-city-once', 'return-to-start'],
        objective: 'minimize-total-distance'
      },
      {
        id: '2',
        name: 'Knapsack Optimization',
        type: 'knapsack',
        variables: 5,
        constraints: ['weight-capacity', 'binary-selection'],
        objective: 'maximize-value'
      },
      {
        id: '3',
        name: 'Portfolio Optimization',
        type: 'portfolio-optimization',
        variables: 10,
        constraints: ['budget-constraint', 'risk-limits'],
        objective: 'maximize-sharpe-ratio'
      }
    ];

    setOptimizationProblems(problems);
  };

  const executeQuantumCircuit = async (circuitId: string) => {
    setIsExecuting(circuitId);
    try {
      // Simulate quantum circuit execution
      await new Promise(resolve => setTimeout(resolve, 3000));

      const circuit = circuits.find(c => c.id === circuitId);
      if (!circuit) return;

      // Generate mock quantum results based on circuit type
      let result: any = {};
      switch (circuit.type) {
        case 'optimization':
          result = {
            optimalSolution: [1, 0, 1, 0],
            objectiveValue: 15.7,
            probability: 0.87,
            iterations: 42
          };
          break;
        case 'machine-learning':
          result = {
            eigenvalues: [-2.3, -1.8, -0.5, 0.2],
            groundStateEnergy: -2.3,
            convergence: 0.001,
            iterations: 156
          };
          break;
        case 'cryptography':
          result = {
            transformedState: '0x1a2b3c4d...',
            phaseEstimation: 0.785,
            precision: 0.001,
            qubitsUsed: circuit.qubits
          };
          break;
        default:
          result = { success: true, timestamp: new Date() };
      }

      setCircuits(prev => prev.map(c =>
        c.id === circuitId ? {
          ...c,
          status: 'completed',
          result,
          executionTime: Math.random() * 5000 + 1000,
          fidelity: Math.random() * 0.3 + 0.7
        } : c
      ));

      if (onQuantumResult) {
        onQuantumResult(result);
      }

    } catch (error) {
      console.error('Quantum execution failed:', error);
      setCircuits(prev => prev.map(c =>
        c.id === circuitId ? { ...c, status: 'error' } : c
      ));
    } finally {
      setIsExecuting(null);
    }
  };

  const solveOptimizationProblem = async (problemId: string) => {
    const problem = optimizationProblems.find(p => p.id === problemId);
    if (!problem) return;

    setIsExecuting(`opt-${problemId}`);
    try {
      // Simulate quantum optimization
      await new Promise(resolve => setTimeout(resolve, 5000));

      let solution: any = {};
      switch (problem.type) {
        case 'traveling-salesman':
          solution = {
            route: [0, 2, 1, 3, 0],
            totalDistance: 245.8,
            optimality: 0.92,
            computationTime: 1250
          };
          break;
        case 'knapsack':
          solution = {
            selectedItems: [1, 3, 5],
            totalValue: 1250,
            totalWeight: 15.2,
            capacityUtilization: 0.87
          };
          break;
        case 'portfolio-optimization':
          solution = {
            allocation: [0.15, 0.12, 0.08, 0.10, 0.15, 0.10, 0.08, 0.12, 0.05, 0.05],
            expectedReturn: 0.124,
            risk: 0.087,
            sharpeRatio: 1.42
          };
          break;
      }

      if (onOptimizationComplete) {
        onOptimizationComplete(solution);
      }

    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsExecuting(null);
    }
  };

  const getCircuitTypeColor = (type: string) => {
    switch (type) {
      case 'optimization': return 'bg-blue-100 text-blue-800';
      case 'machine-learning': return 'bg-purple-100 text-purple-800';
      case 'cryptography': return 'bg-green-100 text-green-800';
      case 'simulation': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-gray-500';
      case 'running': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
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
            <Atom className="h-6 w-6 text-purple-600" />
            Quantum Computing Platform
          </h2>
          <p className="text-gray-600 mt-1">Advanced quantum algorithms for optimization and machine learning</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Quantum Simulator: Active
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {circuits.length} Circuits Ready
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="circuits" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Quantum Circuits
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Optimization
          </TabsTrigger>
          <TabsTrigger value="ml" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Quantum ML
          </TabsTrigger>
          <TabsTrigger value="simulation" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Simulation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="circuits" className="space-y-6">
          {/* Quantum Circuits List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {circuits.map((circuit) => (
              <Card key={circuit.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{circuit.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getCircuitTypeColor(circuit.type)}>
                          {circuit.type.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {circuit.qubits} Qubits
                        </Badge>
                        <Badge className={`${getStatusColor(circuit.status)} text-white`}>
                          {circuit.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Circuit Gates ({circuit.gates.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {circuit.gates.slice(0, 6).map((gate) => (
                          <Badge key={gate.id} variant="outline" className="text-xs">
                            {gate.type}
                          </Badge>
                        ))}
                        {circuit.gates.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{circuit.gates.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {circuit.result && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Results</p>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          {circuit.type === 'optimization' && (
                            <div>
                              <p>Optimal Solution: [{circuit.result.optimalSolution?.join(', ')}]</p>
                              <p>Objective Value: {circuit.result.objectiveValue}</p>
                              <p>Success Probability: {(circuit.result.probability * 100).toFixed(1)}%</p>
                            </div>
                          )}
                          {circuit.type === 'machine-learning' && (
                            <div>
                              <p>Ground State Energy: {circuit.result.groundStateEnergy}</p>
                              <p>Convergence: {circuit.result.convergence}</p>
                              <p>Iterations: {circuit.result.iterations}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {circuit.executionTime && circuit.fidelity && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Execution Time</p>
                          <p className="font-semibold">{(circuit.executionTime / 1000).toFixed(2)}s</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Fidelity</p>
                          <p className="font-semibold">{(circuit.fidelity * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedCircuit(circuit)}
                        className="flex-1"
                        variant="outline"
                      >
                        View Circuit
                      </Button>
                      <Button
                        onClick={() => executeQuantumCircuit(circuit.id)}
                        disabled={isExecuting === circuit.id || circuit.status === 'running'}
                        className="flex items-center gap-2"
                      >
                        {isExecuting === circuit.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Execute
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {/* Optimization Problems */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {optimizationProblems.map((problem) => (
              <Card key={problem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{problem.name}</CardTitle>
                  <Badge variant="outline" className="mt-2">
                    {problem.type.replace('-', ' ').toUpperCase()}
                  </Badge>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Variables</p>
                        <p className="font-semibold">{problem.variables}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Constraints</p>
                        <p className="font-semibold">{problem.constraints.length}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Objective</p>
                      <p className="font-medium">{problem.objective.replace('-', ' ')}</p>
                    </div>

                    <Button
                      onClick={() => solveOptimizationProblem(problem.id)}
                      disabled={isExecuting === `opt-${problem.id}`}
                      className="w-full flex items-center gap-2"
                    >
                      {isExecuting === `opt-${problem.id}` ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Solving...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Solve with Quantum
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ml" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quantum Machine Learning</h3>
              <p className="text-gray-600 mb-4">
                Quantum-enhanced machine learning algorithms including quantum neural networks,
                quantum support vector machines, and quantum principal component analysis.
              </p>
              <Button>Explore Quantum ML Models</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulation" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quantum Simulation</h3>
              <p className="text-gray-600 mb-4">
                Simulate quantum systems and molecular dynamics using quantum algorithms
                for computational chemistry and materials science.
              </p>
              <Button>Start Quantum Simulation</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Circuit Details Modal */}
      {selectedCircuit && (
        <Card className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{selectedCircuit.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getCircuitTypeColor(selectedCircuit.type)}>
                      {selectedCircuit.type.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {selectedCircuit.qubits} Qubits
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCircuit(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Circuit Visualization */}
              <div>
                <h4 className="font-semibold mb-4">Quantum Circuit Diagram</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    {Array.from({ length: selectedCircuit.qubits }, (_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-sm font-mono w-8">q[{i}]</span>
                        <div className="flex-1 h-8 bg-blue-100 rounded relative">
                          {selectedCircuit.gates
                            .filter(gate => gate.qubits.includes(i))
                            .map((gate, gateIndex) => (
                              <div
                                key={gateIndex}
                                className="absolute top-0 h-full bg-blue-500 text-white text-xs rounded flex items-center justify-center px-2"
                                style={{
                                  left: `${(gateIndex / selectedCircuit.gates.length) * 100}%`,
                                  width: '60px'
                                }}
                              >
                                {gate.type}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Parameters */}
              {selectedCircuit.parameters && (
                <div>
                  <h4 className="font-semibold mb-4">Circuit Parameters</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(selectedCircuit.parameters, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Execution Results */}
              {selectedCircuit.result && (
                <div>
                  <h4 className="font-semibold mb-4">Execution Results</h4>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <pre className="text-sm overflow-x-auto text-green-800">
                      {JSON.stringify(selectedCircuit.result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Card>
      )}
    </div>
  );
};

export default QuantumComputing;