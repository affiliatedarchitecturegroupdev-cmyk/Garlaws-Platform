"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Shield, Key, UserCheck, Fingerprint, Globe, Lock, Unlock, Eye, EyeOff } from 'lucide-react';

interface DecentralizedIdentity {
  id: string;
  did: string; // Decentralized Identifier
  controller: string;
  publicKey: string;
  status: 'active' | 'revoked' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  credentials: Credential[];
  services: Service[];
  metadata: {
    name?: string;
    email?: string;
    organization?: string;
    role?: string;
  };
}

interface Credential {
  id: string;
  type: string;
  issuer: string;
  subject: string;
  issuanceDate: Date;
  expirationDate?: Date;
  claims: any;
  proof: {
    type: string;
    created: Date;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
  };
  status: 'valid' | 'expired' | 'revoked';
}

interface Service {
  id: string;
  type: string;
  serviceEndpoint: string;
  description?: string;
}

interface DecentralizedIDProps {
  tenantId?: string;
  onIdentityCreated?: (identity: DecentralizedIdentity) => void;
  onCredentialIssued?: (credential: Credential) => void;
}

const DecentralizedID: React.FC<DecentralizedIDProps> = ({
  tenantId = 'default',
  onIdentityCreated,
  onCredentialIssued
}) => {
  const [identities, setIdentities] = useState<DecentralizedIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'identities' | 'credentials' | 'verification'>('identities');
  const [selectedIdentity, setSelectedIdentity] = useState<DecentralizedIdentity | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  useEffect(() => {
    fetchIdentities();
  }, [tenantId]);

  const fetchIdentities = async () => {
    try {
      setLoading(true);
      // Simulate API call to fetch decentralized identities
      const response = await new Promise<DecentralizedIdentity[]>(resolve => {
        setTimeout(() => {
          resolve([
            {
              id: '1',
              did: 'did:ethr:0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
              controller: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
              publicKey: '0x042d35Cc6634C0532925a3b844Bc454e4438f44e742d35Cc6634C0532925a3b844Bc454e4438f44e742d35Cc6634C0532925a3b844Bc454e4438f44e',
              status: 'active',
              createdAt: new Date(Date.now() - 86400000 * 30), // 30 days ago
              updatedAt: new Date(Date.now() - 86400000 * 7),
              credentials: [
                {
                  id: 'cred-1',
                  type: 'PropertyOwnerCredential',
                  issuer: 'did:ethr:0x8ba1f109551bD432803012645Bcc238AC0d5fb6',
                  subject: 'did:ethr:0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                  issuanceDate: new Date(Date.now() - 86400000 * 25),
                  expirationDate: new Date(Date.now() + 86400000 * 335), // 1 year from now
                  claims: {
                    propertyAddress: '123 Main St, Anytown, USA',
                    ownershipType: 'Full Ownership',
                    squareFootage: 2500,
                    zoningType: 'Residential'
                  },
                  proof: {
                    type: 'EcdsaSecp256k1Signature2019',
                    created: new Date(Date.now() - 86400000 * 25),
                    verificationMethod: 'did:ethr:0x8ba1f109551bD432803012645Bcc238AC0d5fb6#keys-1',
                    proofPurpose: 'assertionMethod',
                    proofValue: 'z2tbzZ...'
                  },
                  status: 'valid'
                }
              ],
              services: [
                {
                  id: 'service-1',
                  type: 'PropertyManagementService',
                  serviceEndpoint: 'https://api.garlaws.com/properties',
                  description: 'Property management and transaction services'
                }
              ],
              metadata: {
                name: 'John Smith',
                email: 'john.smith@email.com',
                organization: 'Garlaws Properties',
                role: 'Property Owner'
              }
            },
            {
              id: '2',
              did: 'did:ethr:0x8ba1f109551bD432803012645Bcc238AC0d5fb6',
              controller: '0x8ba1f109551bD432803012645Bcc238AC0d5fb6',
              publicKey: '0x048ba1f109551bD432803012645Bcc238AC0d5fb68ba1f109551bD432803012645Bcc238AC0d5fb68ba1f109551bD432803012645Bcc238AC0d5fb6',
              status: 'active',
              createdAt: new Date(Date.now() - 86400000 * 15),
              updatedAt: new Date(Date.now() - 86400000 * 2),
              credentials: [
                {
                  id: 'cred-2',
                  type: 'PropertyManagerCredential',
                  issuer: 'did:ethr:0x1f9090dE28563b3c14292AF5cAE4b5B9a8f1f1f1',
                  subject: 'did:ethr:0x8ba1f109551bD432803012645Bcc238AC0d5fb6',
                  issuanceDate: new Date(Date.now() - 86400000 * 10),
                  claims: {
                    licenseNumber: 'PM-2024-001',
                    specializations: ['Residential', 'Commercial'],
                    experience: '8 years',
                    certifications: ['REA', 'CCIM']
                  },
                  proof: {
                    type: 'EcdsaSecp256k1Signature2019',
                    created: new Date(Date.now() - 86400000 * 10),
                    verificationMethod: 'did:ethr:0x1f9090dE28563b3c14292AF5cAE4b5B9a8f1f1f1#keys-1',
                    proofPurpose: 'assertionMethod',
                    proofValue: 'z4xyz...'
                  },
                  status: 'valid'
                }
              ],
              services: [],
              metadata: {
                name: 'Sarah Johnson',
                email: 'sarah.johnson@garlaws.com',
                organization: 'Garlaws Properties',
                role: 'Property Manager'
              }
            }
          ]);
        }, 1000);
      });

      setIdentities(response);
    } catch (error) {
      console.error('Failed to fetch identities:', error);
    } finally {
      setLoading(false);
    }
  };

  const createIdentity = async () => {
    try {
      // Simulate identity creation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newIdentity: DecentralizedIdentity = {
        id: Date.now().toString(),
        did: `did:ethr:0x${Math.random().toString(16).substr(2, 40)}`,
        controller: `0x${Math.random().toString(16).substr(2, 40)}`,
        publicKey: `0x04${Math.random().toString(16).substr(2, 80)}`,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        credentials: [],
        services: [],
        metadata: {}
      };

      setIdentities(prev => [...prev, newIdentity]);

      if (onIdentityCreated) {
        onIdentityCreated(newIdentity);
      }
    } catch (error) {
      console.error('Failed to create identity:', error);
    }
  };

  const issueCredential = async (identityId: string, credentialType: string) => {
    try {
      // Simulate credential issuance
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newCredential: Credential = {
        id: `cred-${Date.now()}`,
        type: credentialType,
        issuer: 'did:ethr:0x1f9090dE28563b3c14292AF5cAE4b5B9a8f1f1f1',
        subject: identities.find(i => i.id === identityId)?.did || '',
        issuanceDate: new Date(),
        claims: {
          verified: true,
          issuedBy: 'Garlaws Properties',
          purpose: credentialType
        },
        proof: {
          type: 'EcdsaSecp256k1Signature2019',
          created: new Date(),
          verificationMethod: 'did:ethr:0x1f9090dE28563b3c14292AF5cAE4b5B9a8f1f1f1#keys-1',
          proofPurpose: 'assertionMethod',
          proofValue: `z${Math.random().toString(16).substr(2, 64)}`
        },
        status: 'valid'
      };

      setIdentities(prev => prev.map(identity =>
        identity.id === identityId
          ? { ...identity, credentials: [...identity.credentials, newCredential] }
          : identity
      ));

      if (onCredentialIssued) {
        onCredentialIssued(newCredential);
      }
    } catch (error) {
      console.error('Failed to issue credential:', error);
    }
  };

  const verifyCredential = async (credentialId: string) => {
    try {
      // Simulate credential verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real implementation, this would verify the proof against the blockchain
      return Math.random() > 0.1; // 90% success rate
    } catch (error) {
      console.error('Verification failed:', error);
      return false;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'revoked': return 'bg-red-500';
      case 'suspended': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCredentialStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      case 'revoked': return 'bg-red-100 text-red-800';
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
            <Shield className="h-6 w-6 text-purple-600" />
            Decentralized Identity Management
          </h2>
          <p className="text-gray-600 mt-1">Self-sovereign identity and verifiable credentials</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            DID Method: ethr
          </div>
          <Button onClick={createIdentity} className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Create Identity
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="identities" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Identities
          </TabsTrigger>
          <TabsTrigger value="credentials" className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4" />
            Credentials
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Verification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="identities" className="space-y-6">
          {/* Identity List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {identities.map((identity) => (
              <Card key={identity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {identity.metadata.name || 'Unnamed Identity'}
                      </CardTitle>
                      <Badge className={`${getStatusColor(identity.status)} text-white mt-2`}>
                        {identity.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">DID</p>
                      <p className="font-mono text-xs bg-gray-100 p-1 rounded">
                        {identity.did.substring(0, 20)}...
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Controller</p>
                      <p className="font-mono text-xs">{identity.controller.substring(0, 10)}...</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Credentials</p>
                      <p className="font-semibold">{identity.credentials.length}</p>
                    </div>
                  </div>

                  {identity.metadata.organization && (
                    <div>
                      <p className="text-gray-600 text-sm">Organization</p>
                      <p className="font-medium">{identity.metadata.organization}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-gray-600 text-sm mb-2">Public Key</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs bg-gray-100 p-2 rounded flex-1">
                        {showPrivateKey ? identity.publicKey : `${identity.publicKey.substring(0, 20)}...`}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                      >
                        {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedIdentity(identity)}
                      className="flex-1"
                      variant="outline"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => issueCredential(identity.id, 'IdentityVerificationCredential')}
                      size="sm"
                    >
                      Issue Credential
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Identity Details Modal */}
          {selectedIdentity && (
            <Card className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {selectedIdentity.metadata.name || 'Identity Details'}
                      </CardTitle>
                      <Badge className={`${getStatusColor(selectedIdentity.status)} text-white mt-2`}>
                        {selectedIdentity.status.toUpperCase()}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIdentity(null)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* DID Information */}
                  <div>
                    <h4 className="font-semibold mb-3">Decentralized Identifier (DID)</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-mono text-sm break-all">{selectedIdentity.did}</p>
                      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Controller</p>
                          <p className="font-mono">{selectedIdentity.controller}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Created</p>
                          <p>{selectedIdentity.createdAt.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Credentials */}
                  <div>
                    <h4 className="font-semibold mb-3">Verifiable Credentials ({selectedIdentity.credentials.length})</h4>
                    <div className="space-y-3">
                      {selectedIdentity.credentials.map((credential) => (
                        <Card key={credential.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-medium">{credential.type}</p>
                                <p className="text-sm text-gray-600">
                                  Issued by: {credential.issuer.substring(0, 25)}...
                                </p>
                              </div>
                              <Badge className={getCredentialStatusColor(credential.status)}>
                                {credential.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Issued</p>
                                <p>{credential.issuanceDate.toLocaleDateString()}</p>
                              </div>
                              {credential.expirationDate && (
                                <div>
                                  <p className="text-gray-600">Expires</p>
                                  <p>{credential.expirationDate.toLocaleDateString()}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Services */}
                  {selectedIdentity.services.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Services ({selectedIdentity.services.length})</h4>
                      <div className="space-y-2">
                        {selectedIdentity.services.map((service) => (
                          <div key={service.id} className="flex justify-between items-center p-3 border rounded">
                            <div>
                              <p className="font-medium">{service.type}</p>
                              {service.description && (
                                <p className="text-sm text-gray-600">{service.description}</p>
                              )}
                            </div>
                            <p className="font-mono text-xs text-gray-600">{service.serviceEndpoint}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="credentials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {identities.flatMap(identity =>
              identity.credentials.map(credential => ({
                ...credential,
                identityName: identity.metadata.name || 'Unknown',
                identityDID: identity.did
              }))
            ).map((credential) => (
              <Card key={credential.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{credential.type}</CardTitle>
                  <Badge className={getCredentialStatusColor(credential.status)}>
                    {credential.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Subject</p>
                      <p className="font-medium">{credential.identityName}</p>
                      <p className="font-mono text-xs text-gray-500">
                        {credential.identityDID.substring(0, 20)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Issuer</p>
                      <p className="font-mono text-xs">{credential.issuer.substring(0, 20)}...</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Issued</p>
                        <p>{credential.issuanceDate.toLocaleDateString()}</p>
                      </div>
                      {credential.expirationDate && (
                        <div>
                          <p className="text-gray-600">Expires</p>
                          <p>{credential.expirationDate.toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Credential Verification</h3>
              <p className="text-gray-600 mb-4">Verify the authenticity of verifiable credentials using blockchain technology.</p>
              <Button>Verify Credential</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DecentralizedID;