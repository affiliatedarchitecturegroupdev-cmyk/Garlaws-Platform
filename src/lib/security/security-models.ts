// Advanced Security Framework with Threat Detection and Response

export interface SecurityEvent {
  id: string;
  type: 'authentication' | 'authorization' | 'access' | 'data' | 'network' | 'system' | 'application';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource: string;
  action: string;
  success: boolean;
  details: Record<string, any>;
  timestamp: Date;
  location?: {
    country: string;
    region?: string;
    city?: string;
    coordinates?: [number, number];
  };
  riskScore: number;
}

export interface ThreatIndicator {
  id: string;
  type: 'ip_address' | 'user_agent' | 'behavior' | 'pattern' | 'anomaly';
  value: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'malware' | 'phishing' | 'brute_force' | 'ddos' | 'data_exfiltration' | 'unauthorized_access';
  description: string;
  firstSeen: Date;
  lastSeen: Date;
  occurrences: number;
  blocked: boolean;
  metadata: Record<string, any>;
}

export interface SecurityRule {
  id: string;
  name: string;
  description?: string;
  type: 'signature' | 'behavioral' | 'anomaly' | 'correlation';
  category: 'authentication' | 'authorization' | 'network' | 'application' | 'data';
  conditions: SecurityCondition[];
  actions: SecurityAction[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  priority: number;
  cooldown: number; // seconds
  lastTriggered?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'regex' | 'greater_than' | 'less_than' | 'in_range';
  value: any;
  logic?: 'AND' | 'OR';
  weight: number;
}

export interface SecurityAction {
  type: 'block' | 'alert' | 'log' | 'redirect' | 'rate_limit' | 'terminate_session' | 'require_mfa' | 'notify_admin';
  config: Record<string, any>;
  delay?: number; // seconds
}

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  type: string;
  affectedResources: string[];
  affectedUsers: string[];
  events: SecurityEvent[];
  indicators: ThreatIndicator[];
  timeline: IncidentTimelineEntry[];
  assignedTo?: string;
  resolution?: string;
  impact: {
    users: number;
    systems: number;
    data: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface IncidentTimelineEntry {
  timestamp: Date;
  type: 'detection' | 'investigation' | 'action' | 'resolution' | 'comment';
  description: string;
  userId?: string;
  details?: Record<string, any>;
}

export interface SecurityMetrics {
  period: {
    start: Date;
    end: Date;
  };
  events: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
  threats: {
    detected: number;
    blocked: number;
    active: number;
  };
  incidents: {
    total: number;
    open: number;
    resolved: number;
    averageResolutionTime: number;
  };
  authentication: {
    successful: number;
    failed: number;
    rate: number;
  };
  performance: {
    responseTime: number;
    uptime: number;
    errorRate: number;
  };
}

export interface AccessControlPolicy {
  id: string;
  name: string;
  description?: string;
  type: 'rbac' | 'abac' | 'mac' | 'dac';
  subjects: string[]; // User IDs, roles, or attributes
  resources: string[]; // Resources or resource patterns
  actions: string[]; // Actions allowed/denied
  conditions: AccessCondition[];
  effect: 'allow' | 'deny';
  priority: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessCondition {
  type: 'time' | 'location' | 'device' | 'risk_score' | 'mfa_required';
  operator: 'equals' | 'not_equals' | 'in_range' | 'contains';
  value: any;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  endpoint: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  responseCode?: number;
  responseTime?: number;
  requestSize?: number;
  responseSize?: number;
  details: Record<string, any>;
  sessionId?: string;
  location?: {
    country: string;
    region?: string;
    city?: string;
  };
}

export interface EncryptionKey {
  id: string;
  version: number;
  algorithm: 'AES-256-GCM' | 'RSA-4096' | 'ChaCha20-Poly1305';
  keyType: 'data' | 'transport' | 'signing';
  status: 'active' | 'rotated' | 'compromised' | 'expired';
  keyMaterial?: string; // Encrypted key material
  publicKey?: string; // For asymmetric keys
  fingerprint: string;
  createdAt: Date;
  expiresAt?: Date;
  rotatedAt?: Date;
}

export interface DataClassification {
  id: string;
  name: string;
  level: 'public' | 'internal' | 'confidential' | 'restricted' | 'highly_restricted';
  description?: string;
  retentionPeriod: number; // days
  encryptionRequired: boolean;
  accessControls: string[]; // Policy IDs
  dataElements: string[]; // Field names or patterns
  compliance: string[]; // GDPR, POPIA, etc.
  createdAt: Date;
  updatedAt: Date;
}