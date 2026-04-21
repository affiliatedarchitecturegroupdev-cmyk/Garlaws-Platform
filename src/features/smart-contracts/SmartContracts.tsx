"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { FileText, Shield, Clock, CheckCircle, AlertCircle, Code, Play, Pause } from 'lucide-react';

interface SmartContract {
  id: string;
  name: string;
  type: 'escrow' | 'rental' | 'sale' | 'lease' | 'custom';
  status: 'draft' | 'deployed' | 'executing' | 'completed' | 'failed';
  network: 'ethereum' | 'polygon' | 'bsc' | 'arbitrum';
  address?: string;
  creator: string;
  createdAt: Date;
  deployedAt?: Date;
  gasUsed?: number;
  transactionHash?: string;
  parties: {
    buyer?: string;
    seller?: string;
    landlord?: string;
    tenant?: string;
    escrow?: string;
  };
  conditions: {
    paymentAmount?: number;
    paymentToken?: string;
    deadline?: Date;
    milestones?: string[];
    terms?: string;
  };
  events: SmartContractEvent[];
}

interface SmartContractEvent {
  id: string;
  type: 'created' | 'deployed' | 'funded' | 'executed' | 'completed' | 'disputed';
  timestamp: Date;
  transactionHash: string;
  details: any;
}

interface SmartContractsProps {
  tenantId?: string;
  onContractDeploy?: (contract: SmartContract) => void;
  onContractExecute?: (contractId: string) => void;
}

const SmartContracts: React.FC<SmartContractsProps> = ({
  tenantId = 'default',
  onContractDeploy,
  onContractExecute
}) => {
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contracts' | 'templates' | 'deploy'>('contracts');
  const [selectedContract, setSelectedContract] = useState<SmartContract | null>(null);
  const [deployingContract, setDeployingContract] = useState<string | null>(null);

  useEffect(() => {
    fetchContracts();
  }, [tenantId]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      // Simulate API call to fetch smart contracts
      const response = await new Promise<SmartContract[]>(resolve => {
        setTimeout(() => {
          resolve([
            {
              id: '1',
              name: 'Property Sale Escrow Contract',
              type: 'escrow',
              status: 'deployed',
              network: 'ethereum',
              address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
              creator: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
              createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
              deployedAt: new Date(Date.now() - 86400000 * 6),
              gasUsed: 250000,
              transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              parties: {
                buyer: '0x8ba1f109551bD432803012645Bcc238AC0d5fb6',
                seller: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                escrow: '0x1f9090dE28563b3c14292AF5cAE4b5B9a8f1f1f1'
              },
              conditions: {
                paymentAmount: 2.5,
                paymentToken: 'ETH',
                deadline: new Date(Date.now() + 86400000 * 30), // 30 days from now
                terms: 'Standard property sale terms with escrow protection'
              },
              events: [
                {
                  id: '1',
                  type: 'created',
                  timestamp: new Date(Date.now() - 86400000 * 7),
                  transactionHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
                  details: { creator: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' }
                },
                {
                  id: '2',
                  type: 'deployed',
                  timestamp: new Date(Date.now() - 86400000 * 6),
                  transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                  details: { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', gasUsed: 250000 }
                },
                {
                  id: '3',
                  type: 'funded',
                  timestamp: new Date(Date.now() - 86400000 * 5),
                  transactionHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
                  details: { amount: 2.5, token: 'ETH' }
                }
              ]
            },
            {
              id: '2',
              name: 'Monthly Rental Agreement',
              type: 'rental',
              status: 'executing',
              network: 'polygon',
              address: '0x8ba1f109551bD432803012645Bcc238AC0d5fb6',
              creator: '0x8ba1f109551bD432803012645Bcc238AC0d5fb6',
              createdAt: new Date(Date.now() - 86400000 * 3),
              deployedAt: new Date(Date.now() - 86400000 * 2),
              gasUsed: 180000,
              transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
              parties: {
                landlord: '0x8ba1f109551bD432803012645Bcc238AC0d5fb6',
                tenant: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
              },
              conditions: {
                paymentAmount: 1500,
                paymentToken: 'USDC',
                deadline: new Date(Date.now() + 86400000 * 365), // 1 year from now
                terms: 'Monthly rental payment with automatic execution'
              },
              events: [
                {
                  id: '4',
                  type: 'created',
                  timestamp: new Date(Date.now() - 86400000 * 3),
                  transactionHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
                  details: { creator: '0x8ba1f109551bD432803012645Bcc238AC0d5fb6' }
                }
              ]
            },
            {
              id: '3',
              name: 'Property Lease Contract',
              type: 'lease',
              status: 'draft',
              network: 'bsc',
              creator: '0x1f9090dE28563b3c14292AF5cAE4b5B9a8f1f1f1',
              createdAt: new Date(),
              parties: {
                landlord: '0x1f9090dE28563b3c14292AF5cAE4b5B9a8f1f1f1',
                tenant: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
              },
              conditions: {
                paymentAmount: 2500,
                paymentToken: 'BUSD',
                deadline: new Date(Date.now() + 86400000 * 730), // 2 years from now
                terms: 'Commercial lease with flexible terms'
              },
              events: []
            }
          ]);
        }, 1000);
      });

      setContracts(response);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deployContract = async (contractId: string) => {
    setDeployingContract(contractId);
    try {
      // Simulate blockchain deployment
      await new Promise(resolve => setTimeout(resolve, 3000));

      const deployedContract = {
        ...contracts.find(c => c.id === contractId)!,
        status: 'deployed' as const,
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        deployedAt: new Date(),
        gasUsed: Math.floor(Math.random() * 300000) + 150000,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
      };

      setContracts(prev => prev.map(c => c.id === contractId ? deployedContract : c));

      if (onContractDeploy) {
        onContractDeploy(deployedContract);
      }
    } catch (error) {
      console.error('Deployment failed:', error);
    } finally {
      setDeployingContract(null);
    }
  };

  const executeContract = async (contractId: string) => {
    try {
      // Simulate contract execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      setContracts(prev => prev.map(c =>
        c.id === contractId ? { ...c, status: 'executing' as const } : c
      ));

      if (onContractExecute) {
        onContractExecute(contractId);
      }
    } catch (error) {
      console.error('Execution failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'deployed': return 'bg-blue-500';
      case 'executing': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'ethereum': return 'bg-blue-100 text-blue-800';
      case 'polygon': return 'bg-purple-100 text-purple-800';
      case 'bsc': return 'bg-yellow-100 text-yellow-800';
      case 'arbitrum': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
            <FileText className="h-6 w-6 text-blue-600" />
            Smart Contract Automation
          </h2>
          <p className="text-gray-600 mt-1">Automated property transactions on the blockchain</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Network Status: Active
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            My Contracts
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="deploy" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Deploy New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-6">
          {/* Contract List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contracts.map((contract) => (
              <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{contract.name}</CardTitle>
                      <Badge className={`${getStatusColor(contract.status)} text-white mt-2`}>
                        {contract.status.toUpperCase()}
                      </Badge>
                    </div>
                    <Badge className={getNetworkColor(contract.network)}>
                      {contract.network.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Type</p>
                      <p className="font-medium capitalize">{contract.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Created</p>
                      <p className="font-medium">{contract.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>

                  {contract.conditions.paymentAmount && (
                    <div>
                      <p className="text-gray-600 text-sm">Payment Amount</p>
                      <p className="font-semibold">
                        {contract.conditions.paymentAmount} {contract.conditions.paymentToken}
                      </p>
                    </div>
                  )}

                  {contract.address && (
                    <div>
                      <p className="text-gray-600 text-sm">Contract Address</p>
                      <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                        {contract.address}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {contract.status === 'draft' && (
                      <Button
                        onClick={() => deployContract(contract.id)}
                        disabled={deployingContract === contract.id}
                        className="flex-1 flex items-center gap-2"
                        size="sm"
                      >
                        {deployingContract === contract.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Deploying...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Deploy
                          </>
                        )}
                      </Button>
                    )}

                    {contract.status === 'deployed' && (
                      <Button
                        onClick={() => executeContract(contract.id)}
                        className="flex-1 flex items-center gap-2"
                        size="sm"
                      >
                        <Play className="h-4 w-4" />
                        Execute
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedContract(contract)}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contract Details Modal */}
          {selectedContract && (
            <Card className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{selectedContract.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge className={`${getStatusColor(selectedContract.status)} text-white`}>
                          {selectedContract.status.toUpperCase()}
                        </Badge>
                        <Badge className={getNetworkColor(selectedContract.network)}>
                          {selectedContract.network.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedContract(null)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Contract Details */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Contract Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="capitalize">{selectedContract.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span>{selectedContract.createdAt.toLocaleString()}</span>
                        </div>
                        {selectedContract.deployedAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Deployed:</span>
                            <span>{selectedContract.deployedAt.toLocaleString()}</span>
                          </div>
                        )}
                        {selectedContract.gasUsed && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gas Used:</span>
                            <span>{selectedContract.gasUsed.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Parties Involved</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(selectedContract.parties).map(([role, address]) =>
                          address && (
                            <div key={role} className="flex justify-between">
                              <span className="text-gray-600 capitalize">{role}:</span>
                              <span className="font-mono text-xs">{address}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Conditions */}
                  {selectedContract.conditions && (
                    <div>
                      <h4 className="font-semibold mb-3">Contract Conditions</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {selectedContract.conditions.paymentAmount && (
                          <div className="mb-2">
                            <span className="text-gray-600">Payment Amount:</span>
                            <span className="font-semibold ml-2">
                              {selectedContract.conditions.paymentAmount} {selectedContract.conditions.paymentToken}
                            </span>
                          </div>
                        )}
                        {selectedContract.conditions.deadline && (
                          <div className="mb-2">
                            <span className="text-gray-600">Deadline:</span>
                            <span className="font-semibold ml-2">
                              {selectedContract.conditions.deadline.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {selectedContract.conditions.terms && (
                          <div>
                            <span className="text-gray-600">Terms:</span>
                            <p className="mt-1 text-sm">{selectedContract.conditions.terms}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Event Timeline */}
                  <div>
                    <h4 className="font-semibold mb-3">Contract Events</h4>
                    <div className="space-y-3">
                      {selectedContract.events.map((event) => (
                        <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            event.type === 'created' ? 'bg-blue-100' :
                            event.type === 'deployed' ? 'bg-green-100' :
                            event.type === 'funded' ? 'bg-yellow-100' :
                            'bg-purple-100'
                          }`}>
                            {event.type === 'created' && <FileText className="h-4 w-4 text-blue-600" />}
                            {event.type === 'deployed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {event.type === 'funded' && <Clock className="h-4 w-4 text-yellow-600" />}
                            {event.type === 'executed' && <Play className="h-4 w-4 text-purple-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium capitalize">{event.type}</p>
                                <p className="text-sm text-gray-600">{event.timestamp.toLocaleString()}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {event.transactionHash.substring(0, 10)}...
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Property Sale Escrow', type: 'escrow', description: 'Secure escrow service for property sales' },
              { name: 'Monthly Rental Agreement', type: 'rental', description: 'Automated monthly rental payments' },
              { name: 'Commercial Lease', type: 'lease', description: 'Flexible commercial lease agreements' },
              { name: 'Property Management', type: 'custom', description: 'Custom property management contracts' }
            ].map((template, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="outline" className="w-fit capitalize">{template.type}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  <Button className="w-full" variant="outline">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deploy" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Deploy Smart Contract</h3>
              <p className="text-gray-600 mb-4">Create and deploy a new smart contract for property transactions.</p>
              <Button>Start Deployment</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartContracts;