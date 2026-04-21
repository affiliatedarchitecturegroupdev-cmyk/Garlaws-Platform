"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { FileSearch, GitBranch, Clock, Shield, AlertTriangle, CheckCircle, Hash, Database } from 'lucide-react';

interface AuditEvent {
  id: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
  eventType: 'create' | 'update' | 'transfer' | 'verify' | 'revoke';
  entityType: 'property' | 'contract' | 'identity' | 'credential';
  entityId: string;
  actor: string; // DID or address
  action: string;
  details: any;
  proof: {
    merkleRoot: string;
    signature: string;
    publicKey: string;
  };
  status: 'confirmed' | 'pending' | 'failed';
  gasUsed?: number;
  network: 'ethereum' | 'polygon' | 'bsc';
}

interface ProvenanceRecord {
  id: string;
  assetId: string;
  assetType: 'property' | 'nft' | 'contract';
  ownershipChain: OwnershipEvent[];
  verificationHistory: VerificationEvent[];
  currentOwner: string;
  authenticityScore: number;
  lastVerified: Date;
}

interface OwnershipEvent {
  id: string;
  timestamp: Date;
  from: string;
  to: string;
  transactionHash: string;
  transferType: 'sale' | 'gift' | 'inheritance' | 'foreclosure';
  value?: number;
  currency?: string;
}

interface VerificationEvent {
  id: string;
  timestamp: Date;
  verifier: string;
  verificationType: 'authenticity' | 'ownership' | 'condition';
  result: 'passed' | 'failed' | 'warning';
  details: string;
  certificate?: string;
}

interface BlockchainAuditProps {
  tenantId?: string;
  onAuditEvent?: (event: AuditEvent) => void;
  onProvenanceCheck?: (record: ProvenanceRecord) => void;
}

const BlockchainAudit: React.FC<BlockchainAuditProps> = ({
  tenantId = 'default',
  onAuditEvent,
  onProvenanceCheck
}) => {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [provenanceRecords, setProvenanceRecords] = useState<ProvenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'audit' | 'provenance' | 'verification'>('audit');
  const [selectedRecord, setSelectedRecord] = useState<ProvenanceRecord | null>(null);
  const [auditFilter, setAuditFilter] = useState({
    eventType: 'all',
    entityType: 'all',
    network: 'all',
    status: 'all'
  });

  useEffect(() => {
    fetchAuditData();
  }, [tenantId]);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      // Simulate API call to fetch audit data
      const auditResponse = await new Promise<AuditEvent[]>(resolve => {
        setTimeout(() => {
          resolve([
            {
              id: '1',
              transactionHash: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e742d35Cc6634C0532925a3b844Bc454e4438f44e',
              blockNumber: 18500000,
              timestamp: new Date(Date.now() - 86400000 * 2),
              eventType: 'transfer',
              entityType: 'property',
              entityId: 'PROP-001',
              actor: 'did:ethr:0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
              action: 'Property ownership transfer',
              details: {
                from: '0x8ba1f109551bD432803012645Bcc238AC0d5fb6',
                to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                value: 2.5,
                currency: 'ETH'
              },
              proof: {
                merkleRoot: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                publicKey: '0x042d35Cc6634C0532925a3b844Bc454e4438f44e742d35Cc6634C0532925a3b844Bc454e4438f44e'
              },
              status: 'confirmed',
              gasUsed: 21000,
              network: 'ethereum'
            },
            {
              id: '2',
              transactionHash: '0x8ba1f109551bD432803012645Bcc238AC0d5fb68ba1f109551bD432803012645Bcc238AC0d5fb6',
              blockNumber: 35000000,
              timestamp: new Date(Date.now() - 86400000),
              eventType: 'create',
              entityType: 'contract',
              entityId: 'CONTRACT-001',
              actor: 'did:ethr:0x8ba1f109551bD432803012645Bcc238AC0d5fb6',
              action: 'Smart contract deployment',
              details: {
                contractType: 'EscrowContract',
                bytecode: '0x608060405234801561001057600080fd5b50d3801561001d57600080fd5b50d2801561002a57600080fd5b5060c0806100386000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063c298557814602d575b600080fd5b60336035565b005b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16fffea2646970667358221220c298557814602d575b600080fd5b506004361060285760003560e01c8063c298557814602d575b600080fd5b60336035565b005b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16fffea2646970667358221220',
                constructorArgs: ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 2500000000000000000]
              },
              proof: {
                merkleRoot: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba',
                signature: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba',
                publicKey: '0x048ba1f109551bD432803012645Bcc238AC0d5fb68ba1f109551bD432803012645Bcc238AC0d5fb6'
              },
              status: 'confirmed',
              gasUsed: 250000,
              network: 'polygon'
            }
          ]);
        }, 1000);
      });

      const provenanceResponse = await new Promise<ProvenanceRecord[]>(resolve => {
        setTimeout(() => {
          resolve([
            {
              id: '1',
              assetId: 'PROP-001',
              assetType: 'property',
              ownershipChain: [
                {
                  id: 'transfer-1',
                  timestamp: new Date(Date.now() - 86400000 * 365 * 2),
                  from: 'Original Developer',
                  to: '0x8ba1f109551bD432803012645Bcc238AC0d5fb6',
                  transactionHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
                  transferType: 'sale',
                  value: 500000,
                  currency: 'USD'
                },
                {
                  id: 'transfer-2',
                  timestamp: new Date(Date.now() - 86400000 * 2),
                  from: '0x8ba1f109551bD432803012645Bcc238AC0d5fb6',
                  to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                  transactionHash: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e742d35Cc6634C0532925a3b844Bc454e4438f44e',
                  transferType: 'sale',
                  value: 2.5,
                  currency: 'ETH'
                }
              ],
              verificationHistory: [
                {
                  id: 'ver-1',
                  timestamp: new Date(Date.now() - 86400000),
                  verifier: 'Garlaws Verification Service',
                  verificationType: 'authenticity',
                  result: 'passed',
                  details: 'Property deed and title verified',
                  certificate: 'CERT-2024-001'
                },
                {
                  id: 'ver-2',
                  timestamp: new Date(Date.now() - 86400000 * 7),
                  verifier: 'Blockchain Notary Service',
                  verificationType: 'ownership',
                  result: 'passed',
                  details: 'Current ownership confirmed on blockchain',
                  certificate: 'BCN-2024-015'
                }
              ],
              currentOwner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
              authenticityScore: 98,
              lastVerified: new Date(Date.now() - 86400000)
            }
          ]);
        }, 800);
      });

      setAuditEvents(auditResponse);
      setProvenanceRecords(provenanceResponse);
    } catch (error) {
      console.error('Failed to fetch audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAuditEvent = async (eventData: Partial<AuditEvent>) => {
    try {
      // Simulate audit event creation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newEvent: AuditEvent = {
        id: Date.now().toString(),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: Math.floor(Math.random() * 20000000) + 18000000,
        timestamp: new Date(),
        eventType: 'update',
        entityType: 'property',
        entityId: 'TEMP-001',
        actor: 'did:ethr:0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        action: 'Property information update',
        details: eventData.details || {},
        proof: {
          merkleRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
          signature: `0x${Math.random().toString(16).substr(2, 128)}`,
          publicKey: '0x042d35Cc6634C0532925a3b844Bc454e4438f44e742d35Cc6634C0532925a3b844Bc454e4438f44e'
        },
        status: 'confirmed',
        gasUsed: Math.floor(Math.random() * 50000) + 21000,
        network: 'ethereum',
        ...eventData
      };

      setAuditEvents(prev => [newEvent, ...prev]);

      if (onAuditEvent) {
        onAuditEvent(newEvent);
      }
    } catch (error) {
      console.error('Failed to create audit event:', error);
    }
  };

  const verifyProvenance = async (assetId: string) => {
    try {
      // Simulate provenance verification
      await new Promise(resolve => setTimeout(resolve, 1500));

      const record = provenanceRecords.find(r => r.assetId === assetId);
      if (record && onProvenanceCheck) {
        onProvenanceCheck(record);
      }
    } catch (error) {
      console.error('Provenance verification failed:', error);
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'transfer': return 'bg-purple-100 text-purple-800';
      case 'verify': return 'bg-yellow-100 text-yellow-800';
      case 'revoke': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredEvents = auditEvents.filter(event => {
    if (auditFilter.eventType !== 'all' && event.eventType !== auditFilter.eventType) return false;
    if (auditFilter.entityType !== 'all' && event.entityType !== auditFilter.entityType) return false;
    if (auditFilter.network !== 'all' && event.network !== auditFilter.network) return false;
    if (auditFilter.status !== 'all' && event.status !== auditFilter.status) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSearch className="h-6 w-6 text-blue-600" />
            Blockchain Audit Trails
          </h2>
          <p className="text-gray-600 mt-1">Immutable audit logs and provenance tracking</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Network: Multi-chain
          </div>
          <Button onClick={() => createAuditEvent({})} className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Log Event
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="provenance" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Provenance
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Verification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <select
                  value={auditFilter.eventType}
                  onChange={(e) => setAuditFilter(prev => ({ ...prev, eventType: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Event Types</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="transfer">Transfer</option>
                  <option value="verify">Verify</option>
                  <option value="revoke">Revoke</option>
                </select>

                <select
                  value={auditFilter.entityType}
                  onChange={(e) => setAuditFilter(prev => ({ ...prev, entityType: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Entities</option>
                  <option value="property">Property</option>
                  <option value="contract">Contract</option>
                  <option value="identity">Identity</option>
                  <option value="credential">Credential</option>
                </select>

                <select
                  value={auditFilter.network}
                  onChange={(e) => setAuditFilter(prev => ({ ...prev, network: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Networks</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="polygon">Polygon</option>
                  <option value="bsc">BSC</option>
                  <option value="arbitrum">Arbitrum</option>
                </select>

                <select
                  value={auditFilter.status}
                  onChange={(e) => setAuditFilter(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Audit Events */}
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Badge className={getEventTypeColor(event.eventType)}>
                        {event.eventType.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {event.entityType}
                      </Badge>
                      <Badge className={`${getStatusColor(event.status)} text-white`}>
                        {event.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{event.network.toUpperCase()}</p>
                      <p className="text-sm font-mono text-gray-500">Block #{event.blockNumber}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Timestamp</p>
                      <p className="font-medium">{event.timestamp.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Actor</p>
                      <p className="font-mono text-xs">{event.actor.substring(0, 20)}...</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Entity ID</p>
                      <p className="font-medium">{event.entityId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gas Used</p>
                      <p className="font-medium">{event.gasUsed?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Action</p>
                    <p className="font-medium">{event.action}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Transaction Hash</p>
                    <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                      {event.transactionHash}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <FileSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No audit events found</h3>
                <p className="text-gray-600">Try adjusting your filter criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="provenance" className="space-y-6">
          {/* Provenance Records */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {provenanceRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{record.assetType} #{record.assetId}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">Authenticity: {record.authenticityScore}%</Badge>
                        <Badge variant="secondary">
                          Owner: {record.currentOwner.substring(0, 10)}...
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedRecord(record)}
                      variant="outline"
                      size="sm"
                    >
                      View Chain
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Ownership History ({record.ownershipChain.length} transfers)</p>
                      <div className="space-y-2">
                        {record.ownershipChain.slice(-3).map((transfer, index) => (
                          <div key={transfer.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{transfer.transferType}</p>
                              <p className="text-gray-600">{transfer.timestamp.toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              {transfer.value && (
                                <p className="font-medium">{transfer.value} {transfer.currency}</p>
                              )}
                              <p className="font-mono text-xs text-gray-500">
                                {transfer.from.substring(0, 8)} → {transfer.to.substring(0, 8)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Recent Verifications ({record.verificationHistory.length})</p>
                      <div className="space-y-1">
                        {record.verificationHistory.slice(-2).map((verification) => (
                          <div key={verification.id} className="flex justify-between items-center text-sm">
                            <span>{verification.verificationType}</span>
                            <Badge variant={verification.result === 'passed' ? 'success' : 'secondary'}>
                              {verification.result}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => verifyProvenance(record.assetId)}
                        className="flex-1"
                        variant="outline"
                      >
                        Verify Provenance
                      </Button>
                      <Button variant="outline" size="sm">
                        <Clock className="h-4 w-4 mr-2" />
                        History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Provenance Details Modal */}
          {selectedRecord && (
            <Card className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        Provenance Chain - {selectedRecord.assetType} #{selectedRecord.assetId}
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Authenticity: {selectedRecord.authenticityScore}%</Badge>
                        <Badge variant="secondary">Verified: {selectedRecord.lastVerified.toLocaleDateString()}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRecord(null)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Complete Ownership Chain */}
                  <div>
                    <h4 className="font-semibold mb-4">Complete Ownership Chain</h4>
                    <div className="space-y-4">
                      {selectedRecord.ownershipChain.map((transfer, index) => (
                        <div key={transfer.id} className="relative">
                          {index < selectedRecord.ownershipChain.length - 1 && (
                            <div className="absolute left-6 top-12 w-0.5 h-16 bg-blue-200"></div>
                          )}
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <GitBranch className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium capitalize">{transfer.transferType}</p>
                                  <p className="text-sm text-gray-600">{transfer.timestamp.toLocaleString()}</p>
                                </div>
                                {transfer.value && (
                                  <Badge variant="outline">
                                    {transfer.value} {transfer.currency}
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">From</p>
                                  <p className="font-mono text-xs">{transfer.from}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">To</p>
                                  <p className="font-mono text-xs">{transfer.to}</p>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2 font-mono">
                                TX: {transfer.transactionHash.substring(0, 20)}...
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verification History */}
                  <div>
                    <h4 className="font-semibold mb-4">Verification History</h4>
                    <div className="space-y-3">
                      {selectedRecord.verificationHistory.map((verification) => (
                        <Card key={verification.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-medium capitalize">{verification.verificationType} Check</p>
                                <p className="text-sm text-gray-600">By: {verification.verifier}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant={
                                  verification.result === 'passed' ? 'success' :
                                  verification.result === 'failed' ? 'destructive' : 'secondary'
                                }>
                                  {verification.result}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  {verification.timestamp.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">{verification.details}</p>
                            {verification.certificate && (
                              <p className="text-xs text-gray-500 mt-2">
                                Certificate: {verification.certificate}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Provenance Verification</h3>
              <p className="text-gray-600 mb-4">Verify asset authenticity and ownership history using blockchain technology.</p>
              <Button>Start Verification</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlockchainAudit;