// Decentralized Identity System
export interface DecentralizedIdentifier {
  id: string; // did:garlaws:uuid
  controller: string; // Ethereum address
  created: Date;
  updated: Date;
  publicKey: {
    id: string;
    type: 'Ed25519VerificationKey2020' | 'EcdsaSecp256k1VerificationKey2019';
    publicKeyMultibase?: string;
    ethereumAddress?: string;
  };
  authentication: string[];
  service?: Array<{
    id: string;
    type: string;
    serviceEndpoint: string;
  }>;
  status: 'active' | 'revoked' | 'suspended';
}

export interface VerifiableCredential {
  id: string;
  type: string[];
  issuer: string; // DID of issuer
  issuanceDate: Date;
  expirationDate?: Date;
  credentialSubject: {
    id: string; // DID of subject
    [key: string]: any; // Credential-specific claims
  };
  proof: {
    type: 'Ed25519Signature2020' | 'EcdsaSecp256k1Signature2019';
    created: Date;
    verificationMethod: string;
    proofPurpose: 'assertionMethod';
    proofValue: string;
  };
}

export interface VerifiablePresentation {
  id: string;
  type: string[];
  holder: string; // DID of holder
  verifiableCredential: VerifiableCredential[];
  proof: {
    type: 'Ed25519Signature2020' | 'EcdsaSecp256k1Signature2019';
    created: Date;
    verificationMethod: string;
    proofPurpose: 'authentication';
    challenge?: string;
    proofValue: string;
  };
}

export interface IdentityClaim {
  type: 'personal' | 'property' | 'professional' | 'financial';
  issuer: string;
  subject: string;
  claim: Record<string, any>;
  evidence?: string[];
  confidence: number; // 0-1
  issuedAt: Date;
  expiresAt?: Date;
}

class DecentralizedIdentitySystem {
  private dids: Map<string, DecentralizedIdentifier> = new Map();
  private credentials: Map<string, VerifiableCredential> = new Map();
  private claims: Map<string, IdentityClaim[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create sample DIDs for demonstration
    this.createDID('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'metamask');
    this.createDID('0x1234567890123456789012345678901234567890', 'walletconnect');
  }

  /**
   * Create a new Decentralized Identifier (DID)
   */
  async createDID(ethereumAddress: string, walletType: string = 'metamask'): Promise<DecentralizedIdentifier> {
    const didId = `did:garlaws:${this.generateUUID()}`;

    const did: DecentralizedIdentifier = {
      id: didId,
      controller: ethereumAddress,
      created: new Date(),
      updated: new Date(),
      publicKey: {
        id: `${didId}#keys-1`,
        type: walletType === 'metamask' ? 'EcdsaSecp256k1VerificationKey2019' : 'Ed25519VerificationKey2020',
        ethereumAddress: ethereumAddress
      },
      authentication: [`${didId}#keys-1`],
      service: [
        {
          id: `${didId}#web`,
          type: 'LinkedDomains',
          serviceEndpoint: 'https://garlaws.com'
        }
      ],
      status: 'active'
    };

    this.dids.set(didId, did);
    this.claims.set(didId, []);

    return did;
  }

  /**
   * Get DID by ID
   */
  getDID(didId: string): DecentralizedIdentifier | undefined {
    return this.dids.get(didId);
  }

  /**
   * Get DID by Ethereum address
   */
  getDIDByAddress(ethereumAddress: string): DecentralizedIdentifier | undefined {
    for (const did of this.dids.values()) {
      if (did.controller.toLowerCase() === ethereumAddress.toLowerCase()) {
        return did;
      }
    }
    return undefined;
  }

  /**
   * Resolve DID (simulate DID resolution)
   */
  async resolveDID(didId: string): Promise<DecentralizedIdentifier | null> {
    return this.getDID(didId) || null;
  }

  /**
   * Issue a verifiable credential
   */
  async issueCredential(
    issuerDID: string,
    subjectDID: string,
    credentialType: string,
    claims: Record<string, any>,
    expirationDays?: number
  ): Promise<VerifiableCredential> {
    const issuer = this.getDID(issuerDID);
    if (!issuer) {
      throw new Error('Issuer DID not found');
    }

    const subject = this.getDID(subjectDID);
    if (!subject) {
      throw new Error('Subject DID not found');
    }

    const credentialId = `urn:uuid:${this.generateUUID()}`;
    const issuanceDate = new Date();
    const expirationDate = expirationDays ?
      new Date(issuanceDate.getTime() + expirationDays * 24 * 60 * 60 * 1000) :
      undefined;

    const credential: VerifiableCredential = {
      id: credentialId,
      type: ['VerifiableCredential', credentialType],
      issuer: issuerDID,
      issuanceDate,
      expirationDate,
      credentialSubject: {
        id: subjectDID,
        ...claims
      },
      proof: {
        type: 'EcdsaSecp256k1Signature2019',
        created: new Date(),
        verificationMethod: issuer.publicKey.id,
        proofPurpose: 'assertionMethod',
        proofValue: this.generateMockSignature()
      }
    };

    this.credentials.set(credentialId, credential);

    // Add to subject's claims
    const subjectClaims = this.claims.get(subjectDID) || [];
    subjectClaims.push({
      type: this.mapCredentialTypeToClaimType(credentialType),
      issuer: issuerDID,
      subject: subjectDID,
      claim: claims,
      confidence: 0.95,
      issuedAt: issuanceDate,
      expiresAt: expirationDate
    });
    this.claims.set(subjectDID, subjectClaims);

    return credential;
  }

  /**
   * Verify a credential
   */
  async verifyCredential(credential: VerifiableCredential): Promise<{
    verified: boolean;
    reason?: string;
  }> {
    // Check if credential exists
    const storedCredential = this.credentials.get(credential.id);
    if (!storedCredential) {
      return { verified: false, reason: 'Credential not found' };
    }

    // Check expiration
    if (credential.expirationDate && credential.expirationDate < new Date()) {
      return { verified: false, reason: 'Credential expired' };
    }

    // Check issuer exists
    const issuer = this.getDID(credential.issuer);
    if (!issuer || issuer.status !== 'active') {
      return { verified: false, reason: 'Invalid issuer' };
    }

    // In real implementation, verify cryptographic signature
    // For demo, we'll assume valid signature
    return { verified: true };
  }

  /**
   * Create a verifiable presentation
   */
  async createPresentation(
    holderDID: string,
    credentials: VerifiableCredential[],
    challenge?: string
  ): Promise<VerifiablePresentation> {
    const holder = this.getDID(holderDID);
    if (!holder) {
      throw new Error('Holder DID not found');
    }

    const presentationId = `urn:uuid:${this.generateUUID()}`;

    const presentation: VerifiablePresentation = {
      id: presentationId,
      type: ['VerifiablePresentation'],
      holder: holderDID,
      verifiableCredential: credentials,
      proof: {
        type: 'EcdsaSecp256k1Signature2019',
        created: new Date(),
        verificationMethod: holder.publicKey.id,
        proofPurpose: 'authentication',
        challenge,
        proofValue: this.generateMockSignature()
      }
    };

    return presentation;
  }

  /**
   * Get identity claims for a DID
   */
  getIdentityClaims(didId: string): IdentityClaim[] {
    return this.claims.get(didId) || [];
  }

  /**
   * Add an identity claim manually
   */
  async addIdentityClaim(
    didId: string,
    claimType: IdentityClaim['type'],
    claim: Record<string, any>,
    issuer?: string
  ): Promise<IdentityClaim> {
    const did = this.getDID(didId);
    if (!did) {
      throw new Error('DID not found');
    }

    const newClaim: IdentityClaim = {
      type: claimType,
      issuer: issuer || didId,
      subject: didId,
      claim,
      confidence: 0.9,
      issuedAt: new Date()
    };

    const existingClaims = this.claims.get(didId) || [];
    existingClaims.push(newClaim);
    this.claims.set(didId, existingClaims);

    return newClaim;
  }

  /**
   * Get identity score based on verified claims
   */
  getIdentityScore(didId: string): {
    overall: number;
    breakdown: {
      personal: number;
      property: number;
      professional: number;
      financial: number;
    };
    verifiedClaims: number;
    totalClaims: number;
  } {
    const claims = this.getIdentityClaims(didId);

    if (claims.length === 0) {
      return {
        overall: 0,
        breakdown: { personal: 0, property: 0, professional: 0, financial: 0 },
        verifiedClaims: 0,
        totalClaims: 0
      };
    }

    const breakdown = {
      personal: 0,
      property: 0,
      professional: 0,
      financial: 0
    };

    let verifiedClaims = 0;

    claims.forEach(claim => {
      // In real implementation, verify each claim
      // For demo, assume high confidence claims are verified
      if (claim.confidence > 0.8) {
        verifiedClaims++;
        breakdown[claim.type] = Math.min(100, breakdown[claim.type] + (claim.confidence * 100));
      }
    });

    const overall = Object.values(breakdown).reduce((sum, score) => sum + score, 0) / 4;

    return {
      overall,
      breakdown,
      verifiedClaims,
      totalClaims: claims.length
    };
  }

  // Utility functions

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private generateMockSignature(): string {
    // In real implementation, this would generate actual cryptographic signature
    return 'z' + Math.random().toString(36).substr(2, 64);
  }

  private mapCredentialTypeToClaimType(credentialType: string): IdentityClaim['type'] {
    const typeMap: Record<string, IdentityClaim['type']> = {
      'IdentityCredential': 'personal',
      'PropertyOwnershipCredential': 'property',
      'ProfessionalCredential': 'professional',
      'FinancialCredential': 'financial',
      'KYC_Credential': 'personal',
      'Property_Deed': 'property',
      'License_Credential': 'professional',
      'Credit_Score': 'financial'
    };

    return typeMap[credentialType] || 'personal';
  }

  // Mock data generation for demonstration
  async generateMockCredentials(didId: string): Promise<VerifiableCredential[]> {
    const credentials: VerifiableCredential[] = [];

    // KYC Credential
    const kycCredential = await this.issueCredential(
      'did:garlaws:issuer-001',
      didId,
      'KYC_Credential',
      {
        fullName: 'John Doe',
        dateOfBirth: '1990-01-01',
        nationality: 'South African',
        verified: true
      },
      365
    );
    credentials.push(kycCredential);

    // Property Ownership Credential
    const propertyCredential = await this.issueCredential(
      'did:garlaws:property-registry',
      didId,
      'PropertyOwnershipCredential',
      {
        propertyId: 'PROP_001',
        ownershipPercentage: 100,
        titleDeedNumber: 'T123456',
        purchaseDate: '2020-01-15'
      }
    );
    credentials.push(propertyCredential);

    return credentials;
  }

  // DID Document resolution (simplified)
  async resolveDIDDocument(didId: string): Promise<any> {
    const did = this.getDID(didId);
    if (!did) {
      throw new Error('DID not found');
    }

    return {
      '@context': 'https://www.w3.org/ns/did/v1',
      id: did.id,
      controller: did.controller,
      created: did.created.toISOString(),
      updated: did.updated.toISOString(),
      publicKey: [did.publicKey],
      authentication: did.authentication,
      service: did.service,
      status: did.status
    };
  }
}

export const decentralizedIdentity = new DecentralizedIdentitySystem();