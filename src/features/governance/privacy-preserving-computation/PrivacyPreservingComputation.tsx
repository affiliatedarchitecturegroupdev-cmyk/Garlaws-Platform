'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Privacy-Preserving Computation Types
export type EncryptionScheme =
  | 'paillier'
  | 'elgamal'
  | 'rsa'
  | 'ecdsa'
  | 'ckks'
  | 'bfv'
  | 'bgv';

export type MPCProtocol =
  | 'secret-sharing'
  | 'garbled-circuits'
  | 'oblivious-transfer'
  | 'homomorphic-encryption'
  | 'zero-knowledge-proof'
  | 'secure-multiplication'
  | 'federated-learning';

export type PrivacyTechnique =
  | 'differential-privacy'
  | 'homomorphic-encryption'
  | 'secure-multi-party-computation'
  | 'federated-learning'
  | 'zero-knowledge-proofs'
  | 'trusted-execution-environment'
  | 'confidential-computing';

export interface HomomorphicEncryption {
  id: string;
  name: string;
  scheme: EncryptionScheme;
  securityLevel: number; // bits
  performance: {
    encryptionTime: number; // ms
    decryptionTime: number; // ms
    operationTime: number; // ms per operation
    keySize: number; // bytes
    ciphertextSize: number; // bytes
  };
  supportedOperations: ('add' | 'multiply' | 'compare' | 'aggregate')[];
  useCase: string;
  status: 'active' | 'experimental' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export interface SecureMPCSession {
  id: string;
  name: string;
  protocol: MPCProtocol;
  participants: string[]; // party IDs
  computation: {
    type: 'aggregation' | 'comparison' | 'computation' | 'learning';
    function: string;
    inputs: Record<string, any>; // party -> input mapping
    output?: any;
  };
  security: {
    threshold: number; // minimum participants needed
    privacyLevel: 'basic' | 'enhanced' | 'quantum-resistant';
    auditTrail: boolean;
  };
  status: 'setup' | 'running' | 'completed' | 'failed' | 'aborted';
  performance: {
    setupTime: number;
    computationTime: number;
    communicationRounds: number;
    bandwidthUsed: number;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface PrivacyPreservingQuery {
  id: string;
  name: string;
  description: string;
  technique: PrivacyTechnique;
  query: {
    type: 'select' | 'aggregate' | 'join' | 'ml-training';
    statement: string;
    parameters: Record<string, any>;
  };
  privacy: {
    epsilon?: number; // for differential privacy
    noiseMechanism?: 'laplace' | 'gaussian';
    computationParty?: string;
    trustedEnvironment?: boolean;
  };
  datasets: string[]; // dataset IDs
  result?: {
    data: any;
    privacyMetrics: {
      privacyLoss: number;
      accuracyLoss: number;
      computationTime: number;
    };
  };
  status: 'draft' | 'executing' | 'completed' | 'failed';
  executedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DifferentialPrivacyConfig {
  id: string;
  name: string;
  dataset: string;
  epsilon: number;
  delta: number;
  sensitivity: number;
  mechanism: 'laplace' | 'gaussian' | 'exponential';
  queries: string[];
  budget: {
    total: number;
    used: number;
    remaining: number;
  };
  status: 'active' | 'paused' | 'exhausted';
  createdAt: string;
  updatedAt: string;
}

export interface FederatedLearningSession {
  id: string;
  name: string;
  description: string;
  participants: string[]; // organization IDs
  model: {
    type: string;
    architecture: any;
    initialWeights: any;
  };
  privacy: {
    encryption: boolean;
    differentialPrivacy: boolean;
    secureAggregation: boolean;
  };
  rounds: {
    total: number;
    current: number;
    status: 'waiting' | 'aggregating' | 'updating' | 'completed';
  };
  metrics: {
    globalAccuracy: number;
    participantCount: number;
    communicationCost: number;
    privacyLoss: number;
  };
  status: 'setup' | 'training' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

// Privacy-Preserving Computation Hook
export function usePrivacyPreservingComputation() {
  const [encryptionSchemes, setEncryptionSchemes] = useState<HomomorphicEncryption[]>([]);
  const [mpcSessions, setMpcSessions] = useState<SecureMPCSession[]>([]);
  const [privacyQueries, setPrivacyQueries] = useState<PrivacyPreservingQuery[]>([]);
  const [differentialPrivacyConfigs, setDifferentialPrivacyConfigs] = useState<DifferentialPrivacyConfig[]>([]);
  const [federatedSessions, setFederatedSessions] = useState<FederatedLearningSession[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for homomorphic encryption schemes
  const mockEncryptionSchemes: HomomorphicEncryption[] = [
    {
      id: 'paillier-scheme',
      name: 'Paillier Cryptosystem',
      scheme: 'paillier',
      securityLevel: 2048,
      performance: {
        encryptionTime: 5.2,
        decryptionTime: 8.1,
        operationTime: 12.3,
        keySize: 4096,
        ciphertextSize: 4096
      },
      supportedOperations: ['add', 'multiply', 'aggregate'],
      useCase: 'Secure aggregation of financial data',
      status: 'active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    },
    {
      id: 'ckks-scheme',
      name: 'CKKS Homomorphic Encryption',
      scheme: 'ckks',
      securityLevel: 128,
      performance: {
        encryptionTime: 25.8,
        decryptionTime: 18.9,
        operationTime: 45.2,
        keySize: 8192,
        ciphertextSize: 16384
      },
      supportedOperations: ['add', 'multiply', 'compare'],
      useCase: 'Machine learning on encrypted data',
      status: 'experimental',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    }
  ];

  const loadEncryptionSchemes = useCallback(async () => {
    setLoading(true);
    try {
      // In real implementation, load from secure key management system
      await new Promise(resolve => setTimeout(resolve, 300));
      setEncryptionSchemes(mockEncryptionSchemes);
    } catch (error) {
      console.error('Failed to load encryption schemes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const encryptData = useCallback(async (
    data: any,
    schemeId: string,
    keyId?: string
  ): Promise<{ encryptedData: string; keyId: string; metadata: any }> => {
    const scheme = encryptionSchemes.find(s => s.id === schemeId);
    if (!scheme) {
      throw new Error(`Encryption scheme ${schemeId} not found`);
    }

    // In real implementation, perform actual homomorphic encryption
    const encryptedData = `encrypted_${JSON.stringify(data)}_with_${scheme.scheme}`;
    const actualKeyId = keyId || `key_${Date.now()}`;

    return {
      encryptedData,
      keyId: actualKeyId,
      metadata: {
        scheme: scheme.scheme,
        timestamp: new Date().toISOString(),
        keySize: scheme.performance.keySize
      }
    };
  }, [encryptionSchemes]);

  const decryptData = useCallback(async (
    encryptedData: string,
    keyId: string
  ): Promise<any> => {
    // In real implementation, perform actual decryption
    try {
      const dataMatch = encryptedData.match(/encrypted_(\{.*\})_with_/);
      if (dataMatch) {
        return JSON.parse(dataMatch[1]);
      }
      throw new Error('Invalid encrypted data format');
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }, []);

  const performSecureComputation = useCallback(async (
    operation: string,
    encryptedInputs: string[],
    schemeId: string
  ): Promise<string> => {
    const scheme = encryptionSchemes.find(s => s.id === schemeId);
    if (!scheme) {
      throw new Error(`Encryption scheme ${schemeId} not found`);
    }

    // In real implementation, perform homomorphic computation
    const result = `computed_${operation}_result_with_${scheme.scheme}`;
    return result;
  }, [encryptionSchemes]);

  const createMPCSession = useCallback(async (
    sessionConfig: Omit<SecureMPCSession, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'performance'>
  ): Promise<string> => {
    const session: SecureMPCSession = {
      ...sessionConfig,
      id: `mpc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'setup',
      performance: {
        setupTime: 0,
        computationTime: 0,
        communicationRounds: 0,
        bandwidthUsed: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMpcSessions(prev => [...prev, session]);
    return session.id;
  }, []);

  const executeMPCSession = useCallback(async (sessionId: string): Promise<any> => {
    const session = mpcSessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error(`MPC session ${sessionId} not found`);
    }

    // Update status to running
    setMpcSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? { ...s, status: 'running', updatedAt: new Date().toISOString() }
          : s
      )
    );

    try {
      // In real implementation, execute MPC protocol
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate computation

      const result = { computation: 'completed', value: Math.random() * 100 };

      // Update session with results
      setMpcSessions(prev =>
        prev.map(s =>
          s.id === sessionId
            ? {
                ...s,
                status: 'completed',
                computation: { ...s.computation, output: result },
                performance: { ...s.performance, computationTime: 2000 },
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            : s
        )
      );

      return result;
    } catch (error) {
      setMpcSessions(prev =>
        prev.map(s =>
          s.id === sessionId
            ? { ...s, status: 'failed', updatedAt: new Date().toISOString() }
            : s
        )
      );
      throw error;
    }
  }, [mpcSessions]);

  const createPrivacyQuery = useCallback(async (
    queryConfig: Omit<PrivacyPreservingQuery, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const query: PrivacyPreservingQuery = {
      ...queryConfig,
      id: `privacy_query_${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPrivacyQueries(prev => [...prev, query]);
    return query.id;
  }, []);

  const executePrivacyQuery = useCallback(async (queryId: string): Promise<any> => {
    const query = privacyQueries.find(q => q.id === queryId);
    if (!query) {
      throw new Error(`Privacy query ${queryId} not found`);
    }

    // Update status
    setPrivacyQueries(prev =>
      prev.map(q =>
        q.id === queryId
          ? { ...q, status: 'executing', executedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : q
      )
    );

    try {
      // In real implementation, execute privacy-preserving query
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = {
        data: { count: Math.floor(Math.random() * 1000), average: Math.random() * 100 },
        privacyMetrics: {
          privacyLoss: query.privacy.epsilon || 1.0,
          accuracyLoss: Math.random() * 0.1,
          computationTime: 1500
        }
      };

      setPrivacyQueries(prev =>
        prev.map(q =>
          q.id === queryId
            ? { ...q, status: 'completed', result, updatedAt: new Date().toISOString() }
            : q
        )
      );

      return result;
    } catch (error) {
      setPrivacyQueries(prev =>
        prev.map(q =>
          q.id === queryId
            ? { ...q, status: 'failed', updatedAt: new Date().toISOString() }
            : q
        )
      );
      throw error;
    }
  }, [privacyQueries]);

  useEffect(() => {
    loadEncryptionSchemes();
  }, [loadEncryptionSchemes]);

  return {
    encryptionSchemes,
    mpcSessions,
    privacyQueries,
    differentialPrivacyConfigs,
    federatedSessions,
    loading,
    encryptData,
    decryptData,
    performSecureComputation,
    createMPCSession,
    executeMPCSession,
    createPrivacyQuery,
    executePrivacyQuery,
  };
}

// Homomorphic Encryption Dashboard Component
interface HomomorphicEncryptionDashboardProps {
  className?: string;
}

export const HomomorphicEncryptionDashboard: React.FC<HomomorphicEncryptionDashboardProps> = ({
  className
}) => {
  const {
    encryptionSchemes,
    encryptData,
    decryptData,
    performSecureComputation
  } = usePrivacyPreservingComputation();

  const [selectedScheme, setSelectedScheme] = useState<string>('');
  const [inputData, setInputData] = useState<string>('{"value": 42}');
  const [encryptedData, setEncryptedData] = useState<string>('');
  const [decryptedData, setDecryptedData] = useState<string>('');
  const [computationResult, setComputationResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEncrypt = async () => {
    if (!selectedScheme) return;

    setIsProcessing(true);
    try {
      const data = JSON.parse(inputData);
      const result = await encryptData(data, selectedScheme);
      setEncryptedData(result.encryptedData);
    } catch (error) {
      console.error('Encryption failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!encryptedData) return;

    setIsProcessing(true);
    try {
      const result = await decryptData(encryptedData, 'default-key');
      setDecryptedData(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Decryption failed:', error);
      setDecryptedData(`Error: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComputation = async () => {
    if (!encryptedData || !selectedScheme) return;

    setIsProcessing(true);
    try {
      const result = await performSecureComputation('add', [encryptedData], selectedScheme);
      setComputationResult(result);
    } catch (error) {
      console.error('Computation failed:', error);
      setComputationResult(`Error: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Homomorphic Encryption</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Privacy-preserving computation with encrypted data
          </p>
        </div>
      </div>

      {/* Encryption Schemes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {encryptionSchemes.map(scheme => (
          <div
            key={scheme.id}
            className={cn(
              'p-6 border rounded-lg cursor-pointer transition-all',
              selectedScheme === scheme.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            )}
            onClick={() => setSelectedScheme(scheme.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{scheme.name}</h3>
                <p className="text-sm text-muted-foreground">{scheme.useCase}</p>
              </div>
              <span className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                scheme.status === 'active' ? 'bg-green-100 text-green-800' :
                scheme.status === 'experimental' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              )}>
                {scheme.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Security Level:</span>
                <div className="font-medium">{scheme.securityLevel} bits</div>
              </div>
              <div>
                <span className="text-muted-foreground">Encryption Time:</span>
                <div className="font-medium">{scheme.performance.encryptionTime}ms</div>
              </div>
              <div>
                <span className="text-muted-foreground">Key Size:</span>
                <div className="font-medium">{scheme.performance.keySize} bytes</div>
              </div>
              <div>
                <span className="text-muted-foreground">Operations:</span>
                <div className="font-medium">{scheme.supportedOperations.join(', ')}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Encryption Playground */}
      {selectedScheme && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Encryption Playground</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Input Data</h4>
              <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                className="w-full h-32 p-3 border border-border rounded font-mono text-sm"
                placeholder='{"value": 42}'
              />
              <button
                onClick={handleEncrypt}
                disabled={isProcessing}
                className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Encrypt'}
              </button>
            </div>

            <div>
              <h4 className="font-medium mb-3">Encrypted Data</h4>
              <textarea
                value={encryptedData}
                readOnly
                className="w-full h-32 p-3 border border-border rounded font-mono text-sm bg-gray-50"
                placeholder="Encrypted data will appear here..."
              />
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleDecrypt}
                  disabled={isProcessing || !encryptedData}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Decrypt
                </button>
                <button
                  onClick={handleComputation}
                  disabled={isProcessing || !encryptedData}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  Compute
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {(decryptedData || computationResult) && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {decryptedData && (
                <div>
                  <h4 className="font-medium mb-3">Decrypted Result</h4>
                  <pre className="p-3 bg-gray-50 rounded text-sm overflow-x-auto">
                    {decryptedData}
                  </pre>
                </div>
              )}
              {computationResult && (
                <div>
                  <h4 className="font-medium mb-3">Computation Result</h4>
                  <pre className="p-3 bg-gray-50 rounded text-sm overflow-x-auto">
                    {computationResult}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 text-xl">🔒</div>
          <div>
            <h4 className="font-medium text-blue-900">Privacy-Preserving Technology</h4>
            <p className="text-sm text-blue-700 mt-1">
              All computations are performed on encrypted data without ever decrypting it.
              This ensures complete privacy while enabling powerful data analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Secure MPC Dashboard Component
interface SecureMPCDashboardProps {
  className?: string;
}

export const SecureMPCDashboard: React.FC<SecureMPCDashboardProps> = ({
  className
}) => {
  const {
    mpcSessions,
    createMPCSession,
    executeMPCSession
  } = usePrivacyPreservingComputation();

  const [newSession, setNewSession] = useState({
    name: '',
    protocol: 'secret-sharing' as MPCProtocol,
    participants: [] as string[],
    computation: {
      type: 'aggregation' as 'aggregation' | 'comparison' | 'computation' | 'learning',
      function: '',
      inputs: {}
    }
  });

  const handleCreateSession = async () => {
    if (!newSession.name || newSession.participants.length < 2) return;

    try {
      await createMPCSession({
        name: newSession.name,
        protocol: newSession.protocol,
        participants: newSession.participants,
        computation: newSession.computation,
        security: {
          threshold: Math.ceil(newSession.participants.length / 2),
          privacyLevel: 'enhanced',
          auditTrail: true
        }
      });

      setNewSession({
        name: '',
        protocol: 'secret-sharing',
        participants: [],
        computation: {
          type: 'aggregation',
          function: '',
          inputs: {}
        }
      });
    } catch (error) {
      console.error('Failed to create MPC session:', error);
    }
  };

  const handleExecuteSession = async (sessionId: string) => {
    try {
      await executeMPCSession(sessionId);
    } catch (error) {
      console.error('Failed to execute MPC session:', error);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Secure Multi-Party Computation</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Collaborative computation without revealing private data
          </p>
        </div>
      </div>

      {/* Create New Session */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Create MPC Session</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Session Name</label>
              <input
                type="text"
                value={newSession.name}
                onChange={(e) => setNewSession(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded"
                placeholder="Enter session name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Protocol</label>
              <select
                value={newSession.protocol}
                onChange={(e) => setNewSession(prev => ({ ...prev, protocol: e.target.value as MPCProtocol }))}
                className="w-full px-3 py-2 border border-border rounded"
              >
                <option value="secret-sharing">Secret Sharing</option>
                <option value="garbled-circuits">Garbled Circuits</option>
                <option value="homomorphic-encryption">Homomorphic Encryption</option>
                <option value="zero-knowledge-proof">Zero-Knowledge Proof</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Computation Type</label>
              <select
                value={newSession.computation.type}
                onChange={(e) => setNewSession(prev => ({
                  ...prev,
                  computation: { ...prev.computation, type: e.target.value as any }
                }))}
                className="w-full px-3 py-2 border border-border rounded"
              >
                <option value="aggregation">Aggregation</option>
                <option value="comparison">Comparison</option>
                <option value="computation">Computation</option>
                <option value="learning">Machine Learning</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Participants</label>
              <input
                type="text"
                placeholder="Enter participant IDs (comma-separated)"
                onChange={(e) => setNewSession(prev => ({
                  ...prev,
                  participants: e.target.value.split(',').map(p => p.trim()).filter(p => p)
                }))}
                className="w-full px-3 py-2 border border-border rounded"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {newSession.participants.length} participants added
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Computation Function</label>
              <textarea
                value={newSession.computation.function}
                onChange={(e) => setNewSession(prev => ({
                  ...prev,
                  computation: { ...prev.computation, function: e.target.value }
                }))}
                className="w-full h-20 px-3 py-2 border border-border rounded resize-none"
                placeholder="Describe the computation to perform..."
              />
            </div>

            <button
              onClick={handleCreateSession}
              disabled={!newSession.name || newSession.participants.length < 2}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
            >
              Create Session
            </button>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Sessions</h3>

        <div className="grid grid-cols-1 gap-4">
          {mpcSessions.map(session => (
            <div key={session.id} className="bg-white p-6 rounded-lg border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{session.name}</h4>
                  <p className="text-sm text-muted-foreground">{session.protocol} • {session.participants.length} participants</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    session.status === 'completed' ? 'bg-green-100 text-green-800' :
                    session.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    session.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  )}>
                    {session.status}
                  </span>
                  {session.status === 'setup' && (
                    <button
                      onClick={() => handleExecuteSession(session.id)}
                      className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                    >
                      Execute
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Computation:</span>
                  <div className="font-medium capitalize">{session.computation.type}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Setup Time:</span>
                  <div className="font-medium">{session.performance.setupTime}ms</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Computation Time:</span>
                  <div className="font-medium">{session.performance.computationTime}ms</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Rounds:</span>
                  <div className="font-medium">{session.performance.communicationRounds}</div>
                </div>
              </div>

              {session.computation.output && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Result</h5>
                  <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(session.computation.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {mpcSessions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-lg font-semibold">No MPC Sessions</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Create a secure multi-party computation session to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};