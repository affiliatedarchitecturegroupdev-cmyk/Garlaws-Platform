"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Shield, Key, Lock, Unlock, Hash, Fingerprint, AlertTriangle, CheckCircle } from 'lucide-react';

interface QuantumCryptographicKey {
  id: string;
  algorithm: 'kyber' | 'dilithium' | 'falcon' | 'sphincs+' | 'aes256-gcm';
  type: 'encryption' | 'signature' | 'hybrid';
  keySize: number; // bits
  securityLevel: number; // 1-5 (NIST security categories)
  status: 'active' | 'compromised' | 'rotated' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  lastUsed: Date;
  usageCount: number;
  quantumResistant: boolean;
}

interface EncryptionSession {
  id: string;
  algorithm: string;
  keyId: string;
  plaintext: string;
  ciphertext: string;
  status: 'encrypted' | 'decrypted' | 'error';
  timestamp: Date;
  performance: {
    encryptionTime: number; // ms
    keySize: number;
    throughput: number; // MB/s
  };
}

interface SecurityAssessment {
  id: string;
  timestamp: Date;
  algorithm: string;
  keyId: string;
  assessmentType: 'quantum-resistance' | 'side-channel' | 'timing-attack' | 'fault-injection';
  vulnerabilityScore: number; // 0-100
  recommendations: string[];
  status: 'passed' | 'warning' | 'failed';
}

interface QuantumCryptoProps {
  tenantId?: string;
  onKeyGenerated?: (key: QuantumCryptographicKey) => void;
  onEncryptionComplete?: (session: EncryptionSession) => void;
}

const QuantumCrypto: React.FC<QuantumCryptoProps> = ({
  tenantId = 'default',
  onKeyGenerated,
  onEncryptionComplete
}) => {
  const [keys, setKeys] = useState<QuantumCryptographicKey[]>([]);
  const [sessions, setSessions] = useState<EncryptionSession[]>([]);
  const [assessments, setAssessments] = useState<SecurityAssessment[]>([]);
  const [activeTab, setActiveTab] = useState<'keys' | 'encryption' | 'assessment'>('keys');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);

  useEffect(() => {
    initializeKeys();
    loadSessions();
    loadAssessments();
  }, []);

  const initializeKeys = () => {
    const initialKeys: QuantumCryptographicKey[] = [
      {
        id: '1',
        algorithm: 'kyber',
        type: 'encryption',
        keySize: 1632,
        securityLevel: 3,
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 30),
        expiresAt: new Date(Date.now() + 86400000 * 335),
        lastUsed: new Date(Date.now() - 86400000 * 2),
        usageCount: 1247,
        quantumResistant: true
      },
      {
        id: '2',
        algorithm: 'dilithium',
        type: 'signature',
        keySize: 2592,
        securityLevel: 3,
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 15),
        expiresAt: new Date(Date.now() + 86400000 * 350),
        lastUsed: new Date(Date.now() - 86400000),
        usageCount: 892,
        quantumResistant: true
      },
      {
        id: '3',
        algorithm: 'aes256-gcm',
        type: 'hybrid',
        keySize: 256,
        securityLevel: 1,
        status: 'compromised',
        createdAt: new Date(Date.now() - 86400000 * 60),
        expiresAt: new Date(Date.now() - 86400000 * 10),
        lastUsed: new Date(Date.now() - 86400000 * 35),
        usageCount: 5432,
        quantumResistant: false
      }
    ];

    setKeys(initialKeys);
  };

  const loadSessions = () => {
    const initialSessions: EncryptionSession[] = [
      {
        id: '1',
        algorithm: 'Kyber-768',
        keyId: '1',
        plaintext: 'Sensitive property transaction data...',
        ciphertext: '0x2a4b8c9d...',
        status: 'encrypted',
        timestamp: new Date(Date.now() - 86400000),
        performance: {
          encryptionTime: 45,
          keySize: 1632,
          throughput: 2.1
        }
      },
      {
        id: '2',
        algorithm: 'Dilithium-3',
        keyId: '2',
        plaintext: 'Digital signature for contract...',
        ciphertext: '0x8f3d5a2e...',
        status: 'encrypted',
        timestamp: new Date(Date.now() - 86400000 * 2),
        performance: {
          encryptionTime: 120,
          keySize: 2592,
          throughput: 0.8
        }
      }
    ];

    setSessions(initialSessions);
  };

  const loadAssessments = () => {
    const initialAssessments: SecurityAssessment[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 86400000 * 7),
        algorithm: 'Kyber-768',
        keyId: '1',
        assessmentType: 'quantum-resistance',
        vulnerabilityScore: 2,
        recommendations: ['Regular key rotation', 'Monitor quantum computing advancements'],
        status: 'passed'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 86400000 * 14),
        algorithm: 'AES-256-GCM',
        keyId: '3',
        assessmentType: 'quantum-resistance',
        vulnerabilityScore: 85,
        recommendations: ['Migrate to quantum-resistant algorithms', 'Implement hybrid cryptography'],
        status: 'failed'
      }
    ];

    setAssessments(initialAssessments);
  };

  const generateQuantumKey = async (algorithm: QuantumCryptographicKey['algorithm'], type: QuantumCryptographicKey['type']) => {
    setIsGenerating(true);
    try {
      // Simulate key generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const keySize = getKeySize(algorithm);
      const securityLevel = getSecurityLevel(algorithm);

      const newKey: QuantumCryptographicKey = {
        id: Date.now().toString(),
        algorithm,
        type,
        keySize,
        securityLevel,
        status: 'active',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000 * 365), // 1 year
        lastUsed: new Date(),
        usageCount: 0,
        quantumResistant: isQuantumResistant(algorithm)
      };

      setKeys(prev => [...prev, newKey]);

      if (onKeyGenerated) {
        onKeyGenerated(newKey);
      }

    } catch (error) {
      console.error('Key generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const encryptData = async (keyId: string, data: string) => {
    setIsEncrypting(true);
    try {
      // Simulate encryption
      await new Promise(resolve => setTimeout(resolve, 1000));

      const key = keys.find(k => k.id === keyId);
      if (!key) return;

      const session: EncryptionSession = {
        id: Date.now().toString(),
        algorithm: `${key.algorithm}-${key.keySize}`,
        keyId,
        plaintext: data,
        ciphertext: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: 'encrypted',
        timestamp: new Date(),
        performance: {
          encryptionTime: Math.random() * 200 + 50,
          keySize: key.keySize,
          throughput: Math.random() * 3 + 0.5
        }
      };

      setSessions(prev => [session, ...prev]);

      // Update key usage
      setKeys(prev => prev.map(k =>
        k.id === keyId ? { ...k, lastUsed: new Date(), usageCount: k.usageCount + 1 } : k
      ));

      if (onEncryptionComplete) {
        onEncryptionComplete(session);
      }

    } catch (error) {
      console.error('Encryption failed:', error);
    } finally {
      setIsEncrypting(false);
    }
  };

  const getKeySize = (algorithm: string): number => {
    switch (algorithm) {
      case 'kyber': return 1632;
      case 'dilithium': return 2592;
      case 'falcon': return 1280;
      case 'sphincs+': return 64;
      case 'aes256-gcm': return 256;
      default: return 2048;
    }
  };

  const getSecurityLevel = (algorithm: string): number => {
    switch (algorithm) {
      case 'kyber':
      case 'dilithium':
      case 'falcon': return 3;
      case 'sphincs+': return 5;
      case 'aes256-gcm': return 1;
      default: return 2;
    }
  };

  const isQuantumResistant = (algorithm: string): boolean => {
    return ['kyber', 'dilithium', 'falcon', 'sphincs+'].includes(algorithm);
  };

  const getAlgorithmColor = (algorithm: string) => {
    if (isQuantumResistant(algorithm)) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'compromised': return 'bg-red-500';
      case 'rotated': return 'bg-blue-500';
      case 'expired': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getAssessmentColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            Quantum-Resistant Cryptography
          </h2>
          <p className="text-gray-600 mt-1">Post-quantum cryptographic algorithms and key management</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            NIST PQC: Active
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {keys.filter(k => k.quantumResistant).length} Quantum Keys
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Key Management
          </TabsTrigger>
          <TabsTrigger value="encryption" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Encryption
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4" />
            Security Assessment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
          {/* Key Generation */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Quantum-Resistant Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => generateQuantumKey('kyber', 'encryption')}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Key className="h-4 w-4" />
                  {isGenerating ? 'Generating...' : 'Kyber (KEM)'}
                </Button>
                <Button
                  onClick={() => generateQuantumKey('dilithium', 'signature')}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Fingerprint className="h-4 w-4" />
                  {isGenerating ? 'Generating...' : 'Dilithium (Signature)'}
                </Button>
                <Button
                  onClick={() => generateQuantumKey('falcon', 'signature')}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Hash className="h-4 w-4" />
                  {isGenerating ? 'Generating...' : 'Falcon (Signature)'}
                </Button>
              </div>

              {isGenerating && (
                <div className="mt-4">
                  <Progress value={75} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Generating quantum-resistant cryptographic keys...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {keys.map((key) => (
              <Card key={key.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{key.algorithm.toUpperCase()}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getAlgorithmColor(key.algorithm)}>
                          {key.quantumResistant ? 'Quantum-Resistant' : 'Vulnerable'}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {key.type}
                        </Badge>
                        <Badge className={`${getStatusColor(key.status)} text-white`}>
                          {key.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Key Size</p>
                        <p className="font-semibold">{key.keySize} bits</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Security Level</p>
                        <p className="font-semibold">Level {key.securityLevel}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Usage Count</p>
                        <p className="font-semibold">{key.usageCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Expires</p>
                        <p className="font-semibold">{key.expiresAt.toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Last Used</p>
                      <p className="text-sm">{key.lastUsed.toLocaleString()}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Rotate Key
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Export Key
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-6">
          {/* Encryption Interface */}
          <Card>
            <CardHeader>
              <CardTitle>Encrypt/Decrypt Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Key</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {keys.filter(k => k.status === 'active').map(key => (
                      <option key={key.id} value={key.id}>
                        {key.algorithm.toUpperCase()} - {key.keySize} bits ({key.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data to Encrypt</label>
                  <textarea
                    placeholder="Enter sensitive data to encrypt..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <Button
                  onClick={() => encryptData('1', 'Sample sensitive data')}
                  disabled={isEncrypting}
                  className="w-full flex items-center gap-2"
                >
                  {isEncrypting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Encrypting...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Encrypt Data
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Encryption Sessions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Encryption Sessions</h3>
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">{session.algorithm}</p>
                      <p className="text-sm text-gray-600">{session.timestamp.toLocaleString()}</p>
                    </div>
                    <Badge variant={session.status === 'encrypted' ? 'success' : 'secondary'}>
                      {session.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Encryption Time</p>
                      <p className="font-semibold">{session.performance.encryptionTime}ms</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Key Size</p>
                      <p className="font-semibold">{session.performance.keySize} bits</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Throughput</p>
                      <p className="font-semibold">{session.performance.throughput.toFixed(1)} MB/s</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-6">
          {/* Security Assessments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{assessment.algorithm}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      {assessment.assessmentType.replace('-', ' ')}
                    </Badge>
                    <Badge className={getAssessmentColor(assessment.status)}>
                      {assessment.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Vulnerability Score</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            assessment.vulnerabilityScore > 70 ? 'bg-red-500' :
                            assessment.vulnerabilityScore > 30 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${assessment.vulnerabilityScore}%` }}
                        />
                      </div>
                      <p className="text-sm font-semibold mt-1">{assessment.vulnerabilityScore}/100</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Recommendations</p>
                      <ul className="text-sm space-y-1">
                        {assessment.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-xs text-gray-500">
                      Assessed on {assessment.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Security Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle>Quantum Security Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {keys.filter(k => k.quantumResistant).length}
                  </p>
                  <p className="text-sm text-gray-600">Quantum-Safe Keys</p>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">
                    {keys.filter(k => !k.quantumResistant).length}
                  </p>
                  <p className="text-sm text-gray-600">Vulnerable Keys</p>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {assessments.filter(a => a.status === 'passed').length}
                  </p>
                  <p className="text-sm text-gray-600">Security Assessments Passed</p>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Fingerprint className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">
                    {sessions.length}
                  </p>
                  <p className="text-sm text-gray-600">Encryption Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuantumCrypto;