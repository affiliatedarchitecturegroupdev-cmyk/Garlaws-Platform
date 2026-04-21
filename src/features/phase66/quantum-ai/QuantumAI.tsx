'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface QuantumCircuit {
  id: string;
  name: string;
  qubits: number;
  gates: number;
  accuracy: number;
  status: 'running' | 'completed' | 'failed';
  executionTime: number;
}

interface QuantumResult {
  probability: number;
  amplitude: number;
  phase: number;
  uncertainty: number;
}

const quantumCircuits: QuantumCircuit[] = [
  {
    id: 'qc_001',
    name: 'Property Value Quantum Predictor',
    qubits: 5,
    gates: 23,
    accuracy: 0.984,
    status: 'completed',
    executionTime: 2.3
  },
  {
    id: 'qc_002',
    name: 'Risk Assessment Quantum Analyzer',
    qubits: 7,
    gates: 41,
    accuracy: 0.976,
    status: 'running',
    executionTime: 0
  },
  {
    id: 'qc_003',
    name: 'Market Trend Quantum Simulator',
    qubits: 4,
    gates: 18,
    accuracy: 0.992,
    status: 'completed',
    executionTime: 1.8
  }
];

export default function QuantumAI() {
  const [selectedCircuit, setSelectedCircuit] = useState<QuantumCircuit | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [results, setResults] = useState<QuantumResult[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const runQuantumSimulation = async (circuit: QuantumCircuit) => {
    setIsSimulating(true);
    setSimulationProgress(0);
    setResults([]);

    const steps = [
      'Initializing quantum circuit...',
      'Applying quantum gates...',
      'Measuring quantum states...',
      'Computing probabilities...',
      'Analyzing uncertainty...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSimulationProgress(((i + 1) / steps.length) * 100);

      // Generate mock quantum results
      if (i === 4) {
        const mockResults: QuantumResult[] = [];
        for (let j = 0; j < Math.pow(2, circuit.qubits); j++) {
          mockResults.push({
            probability: Math.random() * 0.3,
            amplitude: (Math.random() - 0.5) * 2,
            phase: Math.random() * 2 * Math.PI,
            uncertainty: Math.random() * 0.1
          });
        }
        setResults(mockResults);
      }
    }

    setIsSimulating(false);
  };

  const renderQuantumCircuit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 300;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const qubits = 5;
    const gates = ['H', 'X', 'CNOT', 'Z', 'Y'];

    // Draw quantum wires (qubits)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;

    for (let i = 0; i < qubits; i++) {
      const y = 50 + (i * 50);
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(canvas.width - 50, y);
      ctx.stroke();

      // Draw qubit labels
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px monospace';
      ctx.fillText(`|q${i}⟩`, 20, y + 4);
    }

    // Draw quantum gates
    for (let i = 0; i < 8; i++) {
      const x = 100 + (i * 60);
      const qubitIndex = Math.floor(Math.random() * qubits);
      const y = 50 + (qubitIndex * 50);

      // Draw gate box
      ctx.fillStyle = '#dbeafe';
      ctx.fillRect(x - 15, y - 15, 30, 30);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 15, y - 15, 30, 30);

      // Draw gate label
      ctx.fillStyle = '#1e40af';
      ctx.font = '10px monospace';
      ctx.fillText(gates[Math.floor(Math.random() * gates.length)], x - 8, y + 4);
    }

    // Draw measurement symbols
    for (let i = 0; i < qubits; i++) {
      const y = 50 + (i * 50);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(canvas.width - 70, y, 8, 0, Math.PI * 2);
      ctx.stroke();

      // Measurement meter
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width - 55, y - 15);
      ctx.lineTo(canvas.width - 55, y + 15);
      ctx.stroke();
    }
  };

  useEffect(() => {
    renderQuantumCircuit();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Quantum AI</span>
            </Link>

            <div className="flex items-center gap-8">
              <Link href="/quantum" className="text-gray-600 hover:text-gray-900">Quantum Circuits</Link>
              <Link href="/nlp" className="text-gray-600 hover:text-gray-900">Advanced NLP</Link>
              <Link href="/predictive" className="text-gray-600 hover:text-gray-900">Predictive Models</Link>
              <Link href="/neural-search" className="text-gray-600 hover:text-gray-900">Neural Search</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quantum AI Integration</h1>
          <p className="text-gray-600">Quantum computing integration for advanced AI capabilities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Quantum Circuits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quantumCircuits.filter(c => c.status === 'running').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">⚛️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(quantumCircuits.reduce((sum, c) => sum + c.accuracy, 0) / quantumCircuits.length * 100).toFixed(1)}%
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
                <p className="text-sm text-gray-600">Total Qubits Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quantumCircuits.reduce((sum, c) => sum + c.qubits, 0)}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm">🔬</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quantum Circuits</h2>

              <div className="space-y-4">
                {quantumCircuits.map((circuit) => (
                  <div
                    key={circuit.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer"
                    onClick={() => setSelectedCircuit(circuit)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{circuit.name}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        circuit.status === 'completed' ? 'bg-green-100 text-green-800' :
                        circuit.status === 'running' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {circuit.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>Qubits: <span className="font-medium">{circuit.qubits}</span></div>
                      <div>Gates: <span className="font-medium">{circuit.gates}</span></div>
                      <div>Accuracy: <span className="font-medium">{(circuit.accuracy * 100).toFixed(1)}%</span></div>
                    </div>

                    {circuit.status === 'completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runQuantumSimulation(circuit);
                        }}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Run Simulation
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quantum Results</h2>

              {results.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.slice(0, 10).map((result, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-gray-600">|ψ{index}⟩</span>
                      <div className="flex gap-4">
                        <span>P: {(result.probability * 100).toFixed(1)}%</span>
                        <span>Unc: {(result.uncertainty * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Run a quantum simulation to see results</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Circuit Visualization</h2>
              <canvas
                ref={canvasRef}
                className="w-full h-64 border border-gray-200 rounded-lg bg-white"
              />
              <p className="text-sm text-gray-600 mt-2">
                Interactive quantum circuit with {quantumCircuits[0]?.qubits || 5} qubits and quantum gates
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quantum Computing Status</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">IBM Quantum Access</span>
                  <span className="text-green-600 text-sm">✅ Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AWS Braket Integration</span>
                  <span className="text-green-600 text-sm">✅ Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Quantum Simulator</span>
                  <span className="text-blue-600 text-sm">🔄 Running</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Error Correction</span>
                  <span className="text-yellow-600 text-sm">⚠️ Partial</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Metrics</h2>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Quantum Advantage</span>
                    <span className="text-gray-900">2.4x speedup</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Uncertainty Reduction</span>
                    <span className="text-gray-900">94.2% accuracy</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Scalability Index</span>
                    <span className="text-gray-900">87.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }} />
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