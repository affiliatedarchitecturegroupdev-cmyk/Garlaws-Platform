'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Consent Management Types
export type ConsentPurpose =
  | 'marketing'
  | 'analytics'
  | 'personalization'
  | 'communication'
  | 'research'
  | 'third-party-sharing'
  | 'data-processing'
  | 'profiling';

export type ConsentStatus =
  | 'given'
  | 'withdrawn'
  | 'expired'
  | 'pending'
  | 'rejected';

export type ConsentMechanism =
  | 'web-form'
  | 'mobile-app'
  | 'api'
  | 'email'
  | 'third-party'
  | 'inferred'
  | 'legacy';

export interface ConsentRecord {
  id: string;
  userId: string;
  dataSubjectId: string;
  regulation: 'gdpr' | 'ccpa' | 'pipL' | 'other';
  purposes: ConsentPurpose[];
  dataCategories: string[];
  processingActivities: string[];
  status: ConsentStatus;
  consentGivenAt?: string;
  consentWithdrawnAt?: string;
  expiryDate?: string;
  consentMechanism: ConsentMechanism;
  ipAddress: string;
  userAgent: string;
  geoLocation?: {
    country: string;
    region: string;
    city: string;
  };
  legalBasis: string;
  consentVersion: string;
  language: string;
  metadata: Record<string, any>;
  auditTrail: ConsentAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ConsentAuditEntry {
  id: string;
  action: 'granted' | 'withdrawn' | 'modified' | 'expired' | 'renewed';
  timestamp: string;
  performedBy: string;
  reason?: string;
  previousState?: Partial<ConsentRecord>;
  newState?: Partial<ConsentRecord>;
  ipAddress: string;
  userAgent: string;
}

export interface ConsentTemplate {
  id: string;
  name: string;
  description: string;
  regulation: string;
  purposes: ConsentPurpose[];
  dataCategories: string[];
  processingActivities: string[];
  retentionPeriod: number; // days
  consentText: {
    en: string;
    [key: string]: string; // Multi-language support
  };
  legalBasis: string;
  version: string;
  isActive: boolean;
  requiresExplicitConsent: boolean;
  allowsGranularConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConsentAnalytics {
  totalConsents: number;
  activeConsents: number;
  withdrawnConsents: number;
  expiredConsents: number;
  consentByPurpose: Record<ConsentPurpose, number>;
  consentByRegulation: Record<string, number>;
  consentByMechanism: Record<ConsentMechanism, number>;
  withdrawalRate: number;
  averageConsentDuration: number;
  complianceScore: number;
}

// Consent Management Hook
export function useConsentManagement() {
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [consentTemplates, setConsentTemplates] = useState<ConsentTemplate[]>([]);
  const [analytics, setAnalytics] = useState<ConsentAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock consent templates
  const mockTemplates: ConsentTemplate[] = [
    {
      id: 'gdpr-marketing-consent',
      name: 'GDPR Marketing Communications',
      description: 'Consent for marketing communications and promotional materials',
      regulation: 'gdpr',
      purposes: ['marketing', 'communication'],
      dataCategories: ['contact-information', 'communication-preferences'],
      processingActivities: ['email-marketing', 'sms-marketing', 'direct-mail'],
      retentionPeriod: 2555, // 7 years
      consentText: {
        en: 'I consent to receive marketing communications from Garlaws and its partners. I understand I can withdraw this consent at any time.'
      },
      legalBasis: 'Article 6(1)(a) - Consent',
      version: '1.2.0',
      isActive: true,
      requiresExplicitConsent: true,
      allowsGranularConsent: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    },
    {
      id: 'ccpa-data-sharing',
      name: 'CCPA Data Sharing Consent',
      description: 'Consent for sharing personal information with third parties',
      regulation: 'ccpa',
      purposes: ['third-party-sharing'],
      dataCategories: ['personal-information', 'online-activity'],
      processingActivities: ['data-sharing', 'cross-context-behavioral-advertising'],
      retentionPeriod: 730, // 2 years
      consentText: {
        en: 'I consent to Garlaws sharing my personal information with third parties for advertising and business purposes. I understand my rights under CCPA.'
      },
      legalBasis: 'Notice at Collection',
      version: '1.0.0',
      isActive: true,
      requiresExplicitConsent: true,
      allowsGranularConsent: false,
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    }
  ];

  // Mock consent records
  const mockRecords: ConsentRecord[] = [
    {
      id: 'consent_001',
      userId: 'user_123',
      dataSubjectId: 'user_123',
      regulation: 'gdpr',
      purposes: ['marketing', 'analytics'],
      dataCategories: ['contact-information', 'online-activity'],
      processingActivities: ['email-marketing', 'website-analytics'],
      status: 'given',
      consentGivenAt: '2026-03-15T10:30:00Z',
      expiryDate: '2029-03-15T10:30:00Z',
      consentMechanism: 'web-form',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      legalBasis: 'Article 6(1)(a) - Consent',
      consentVersion: '1.2.0',
      language: 'en',
      metadata: { source: 'website-registration' },
      auditTrail: [
        {
          id: 'audit_001',
          action: 'granted',
          timestamp: '2026-03-15T10:30:00Z',
          performedBy: 'user_123',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...'
        }
      ],
      createdAt: '2026-03-15T10:30:00Z',
      updatedAt: '2026-03-15T10:30:00Z'
    }
  ];

  const loadConsentData = useCallback(async () => {
    setLoading(true);
    try {
      // In real implementation, load from database
      await new Promise(resolve => setTimeout(resolve, 300));
      setConsentRecords(mockRecords);
      setConsentTemplates(mockTemplates);
    } catch (error) {
      console.error('Failed to load consent data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const grantConsent = useCallback(async (
    userId: string,
    templateId: string,
    customizations?: {
      purposes?: ConsentPurpose[];
      dataCategories?: string[];
      expiryDate?: string;
    },
    context?: {
      ipAddress: string;
      userAgent: string;
      geoLocation?: any;
    }
  ): Promise<string> => {
    const template = consentTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Consent template ${templateId} not found`);
    }

    const consentRecord: ConsentRecord = {
      id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      dataSubjectId: userId,
      regulation: template.regulation as any,
      purposes: customizations?.purposes || template.purposes,
      dataCategories: customizations?.dataCategories || template.dataCategories,
      processingActivities: template.processingActivities,
      status: 'given',
      consentGivenAt: new Date().toISOString(),
      expiryDate: customizations?.expiryDate || new Date(Date.now() + template.retentionPeriod * 24 * 60 * 60 * 1000).toISOString(),
      consentMechanism: 'web-form',
      ipAddress: context?.ipAddress || 'unknown',
      userAgent: context?.userAgent || 'unknown',
      geoLocation: context?.geoLocation,
      legalBasis: template.legalBasis,
      consentVersion: template.version,
      language: 'en',
      metadata: { templateId },
      auditTrail: [{
        id: `audit_${Date.now()}`,
        action: 'granted',
        timestamp: new Date().toISOString(),
        performedBy: userId,
        ipAddress: context?.ipAddress || 'unknown',
        userAgent: context?.userAgent || 'unknown'
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setConsentRecords(prev => [...prev, consentRecord]);
    return consentRecord.id;
  }, [consentTemplates]);

  const withdrawConsent = useCallback(async (
    consentId: string,
    reason?: string,
    context?: {
      ipAddress: string;
      userAgent: string;
      performedBy: string;
    }
  ): Promise<void> => {
    setConsentRecords(prev =>
      prev.map(record =>
        record.id === consentId
          ? {
              ...record,
              status: 'withdrawn',
              consentWithdrawnAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              auditTrail: [
                ...record.auditTrail,
                {
                  id: `audit_${Date.now()}`,
                  action: 'withdrawn',
                  timestamp: new Date().toISOString(),
                  performedBy: context?.performedBy || record.userId,
                  reason,
                  ipAddress: context?.ipAddress || 'unknown',
                  userAgent: context?.userAgent || 'unknown'
                }
              ]
            }
          : record
      )
    );
  }, []);

  const getUserConsents = useCallback((userId: string): ConsentRecord[] => {
    return consentRecords.filter(record => record.userId === userId);
  }, [consentRecords]);

  const checkConsent = useCallback((
    userId: string,
    purpose: ConsentPurpose,
    dataCategory?: string
  ): { hasConsent: boolean; record?: ConsentRecord } => {
    const userConsents = getUserConsents(userId);
    const relevantConsent = userConsents.find(record =>
      record.status === 'given' &&
      record.purposes.includes(purpose) &&
      (!dataCategory || record.dataCategories.includes(dataCategory)) &&
      (!record.expiryDate || new Date(record.expiryDate) > new Date())
    );

    return {
      hasConsent: !!relevantConsent,
      record: relevantConsent
    };
  }, [getUserConsents]);

  const generateConsentReport = useCallback(async (
    startDate: string,
    endDate: string,
    filters?: {
      regulation?: string;
      purpose?: ConsentPurpose;
      status?: ConsentStatus;
    }
  ): Promise<any> => {
    let filteredRecords = consentRecords.filter(record =>
      record.createdAt >= startDate && record.createdAt <= endDate
    );

    if (filters?.regulation) {
      filteredRecords = filteredRecords.filter(r => r.regulation === filters.regulation);
    }
    if (filters?.purpose) {
      filteredRecords = filteredRecords.filter(r => r.purposes.includes(filters.purpose!));
    }
    if (filters?.status) {
      filteredRecords = filteredRecords.filter(r => r.status === filters.status);
    }

    const analytics: ConsentAnalytics = {
      totalConsents: filteredRecords.length,
      activeConsents: filteredRecords.filter(r => r.status === 'given').length,
      withdrawnConsents: filteredRecords.filter(r => r.status === 'withdrawn').length,
      expiredConsents: filteredRecords.filter(r =>
        r.status === 'expired' || (r.expiryDate && new Date(r.expiryDate) < new Date())
      ).length,
      consentByPurpose: {} as Record<ConsentPurpose, number>,
      consentByRegulation: {},
      consentByMechanism: {} as Record<ConsentMechanism, number>,
      withdrawalRate: 0,
      averageConsentDuration: 0,
      complianceScore: 95.5
    };

    // Calculate aggregations
    filteredRecords.forEach(record => {
      record.purposes.forEach(purpose => {
        analytics.consentByPurpose[purpose] = (analytics.consentByPurpose[purpose] || 0) + 1;
      });

      analytics.consentByRegulation[record.regulation] = (analytics.consentByRegulation[record.regulation] || 0) + 1;
      analytics.consentByMechanism[record.consentMechanism] = (analytics.consentByMechanism[record.consentMechanism] || 0) + 1;
    });

    analytics.withdrawalRate = analytics.totalConsents > 0 ?
      (analytics.withdrawnConsents / analytics.totalConsents) * 100 : 0;

    setAnalytics(analytics);
    return analytics;
  }, [consentRecords]);

  const createConsentTemplate = useCallback((template: Omit<ConsentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: ConsentTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setConsentTemplates(prev => [...prev, newTemplate]);
    return newTemplate.id;
  }, []);

  useEffect(() => {
    loadConsentData();
  }, [loadConsentData]);

  return {
    consentRecords,
    consentTemplates,
    analytics,
    loading,
    grantConsent,
    withdrawConsent,
    getUserConsents,
    checkConsent,
    generateConsentReport,
    createConsentTemplate,
    loadConsentData,
  };
}

// Consent Management Dashboard Component
interface ConsentManagementDashboardProps {
  className?: string;
}

export const ConsentManagementDashboard: React.FC<ConsentManagementDashboardProps> = ({
  className
}) => {
  const {
    consentRecords,
    consentTemplates,
    analytics,
    loading,
    grantConsent,
    withdrawConsent,
    checkConsent,
    generateConsentReport
  } = useConsentManagement();

  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'templates' | 'analytics'>('overview');
  const [selectedRecord, setSelectedRecord] = useState<ConsentRecord | null>(null);
  const [testUserId, setTestUserId] = useState('user_123');

  const handleGrantConsent = async () => {
    if (consentTemplates.length === 0) return;

    try {
      await grantConsent(testUserId, consentTemplates[0].id, undefined, {
        ipAddress: '192.168.1.100',
        userAgent: 'Test Browser'
      });
      console.log('Consent granted successfully');
    } catch (error) {
      console.error('Failed to grant consent:', error);
    }
  };

  const handleWithdrawConsent = async (consentId: string) => {
    try {
      await withdrawConsent(consentId, 'User requested withdrawal');
      console.log('Consent withdrawn successfully');
    } catch (error) {
      console.error('Failed to withdraw consent:', error);
    }
  };

  const handleCheckConsent = () => {
    const result = checkConsent(testUserId, 'marketing');
    console.log('Consent check result:', result);
  };

  const handleGenerateReport = async () => {
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = new Date().toISOString();

    try {
      const report = await generateConsentReport(startDate, endDate);
      console.log('Consent report generated:', report);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const getConsentStatusColor = (status: ConsentStatus) => {
    const colors = {
      given: 'bg-green-100 text-green-800',
      withdrawn: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      rejected: 'bg-gray-100 text-gray-800'
    };
    return colors[status];
  };

  const getPurposeColor = (purpose: ConsentPurpose) => {
    const colors = {
      marketing: 'bg-purple-100 text-purple-800',
      analytics: 'bg-blue-100 text-blue-800',
      personalization: 'bg-green-100 text-green-800',
      communication: 'bg-orange-100 text-orange-800',
      research: 'bg-pink-100 text-pink-800',
      'third-party-sharing': 'bg-red-100 text-red-800',
      'data-processing': 'bg-indigo-100 text-indigo-800',
      profiling: 'bg-yellow-100 text-yellow-800'
    };
    return colors[purpose] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold">Loading Consent Management</h3>
          <p className="text-sm text-muted-foreground mt-2">Loading consent records and templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Consent Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Advanced user consent and preference management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={testUserId}
            onChange={(e) => setTestUserId(e.target.value)}
            placeholder="Test User ID"
            className="px-3 py-1 border border-border rounded text-sm"
          />
          <button
            onClick={handleGrantConsent}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Grant Consent
          </button>
          <button
            onClick={handleCheckConsent}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Check Consent
          </button>
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.totalConsents}</div>
            <div className="text-sm text-gray-600">Total Consents</div>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-green-600">{analytics.activeConsents}</div>
            <div className="text-sm text-gray-600">Active Consents</div>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-red-600">{analytics.withdrawnConsents}</div>
            <div className="text-sm text-gray-600">Withdrawn</div>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-purple-600">{analytics.complianceScore.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Compliance Score</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'records', name: 'Consent Records', icon: '📋' },
            { id: 'templates', name: 'Templates', icon: '📄' },
            { id: 'analytics', name: 'Analytics', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Consent by Purpose */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Consent by Purpose</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analytics && Object.entries(analytics.consentByPurpose).map(([purpose, count]) => (
                  <div key={purpose} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{count}</div>
                    <div className={cn('text-sm px-2 py-1 rounded', getPurposeColor(purpose as ConsentPurpose))}>
                      {purpose.replace('-', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Consent Activity */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Recent Consent Activity</h3>
              <div className="space-y-3">
                {consentRecords.slice(0, 5).map(record => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', getConsentStatusColor(record.status))}>
                        {record.status}
                      </span>
                      <div>
                        <div className="font-medium">User {record.userId}</div>
                        <div className="text-sm text-muted-foreground">
                          {record.purposes.join(', ')} • {record.regulation.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Consent Records ({consentRecords.length})</h3>
            </div>

            <div className="space-y-3">
              {consentRecords.map(record => (
                <div
                  key={record.id}
                  className={cn(
                    'p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow',
                    selectedRecord?.id === record.id ? 'border-primary bg-primary/5' : 'border-border'
                  )}
                  onClick={() => setSelectedRecord(record)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={cn('px-2 py-1 rounded text-xs font-medium', getConsentStatusColor(record.status))}>
                          {record.status}
                        </span>
                        <span className="text-sm text-muted-foreground uppercase">{record.regulation}</span>
                      </div>
                      <div className="font-medium">User {record.userId}</div>
                      <div className="text-sm text-muted-foreground">
                        {record.consentMechanism} • {record.language}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {record.consentGivenAt ? new Date(record.consentGivenAt).toLocaleDateString() : 'N/A'}
                      </div>
                      {record.expiryDate && (
                        <div className="text-xs text-muted-foreground">
                          Expires: {new Date(record.expiryDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {record.purposes.map(purpose => (
                      <span key={purpose} className={cn('px-2 py-1 rounded text-xs', getPurposeColor(purpose))}>
                        {purpose.replace('-', ' ')}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Version {record.consentVersion} • {record.auditTrail.length} audit entries
                    </div>
                    {record.status === 'given' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWithdrawConsent(record.id);
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Consent Templates ({consentTemplates.length})</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {consentTemplates.map(template => (
                <div key={template.id} className="bg-white p-6 rounded-lg border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    )}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span>Regulation:</span>
                      <span className="uppercase">{template.regulation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Version:</span>
                      <span>{template.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Retention:</span>
                      <span>{template.retentionPeriod} days</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-medium mb-2">Purposes</h5>
                    <div className="flex flex-wrap gap-1">
                      {template.purposes.map(purpose => (
                        <span key={purpose} className={cn('px-2 py-1 rounded text-xs', getPurposeColor(purpose))}>
                          {purpose.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
                    {template.consentText.en.substring(0, 100)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {analytics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">Consent by Regulation</h3>
                    <div className="space-y-3">
                      {Object.entries(analytics.consentByRegulation).map(([regulation, count]) => (
                        <div key={regulation} className="flex items-center justify-between">
                          <span className="uppercase">{regulation}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(count / analytics.totalConsents) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">Consent Mechanisms</h3>
                    <div className="space-y-3">
                      {Object.entries(analytics.consentByMechanism).map(([mechanism, count]) => (
                        <div key={mechanism} className="flex items-center justify-between">
                          <span className="capitalize">{mechanism.replace('-', ' ')}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.withdrawalRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Withdrawal Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(analytics.averageConsentDuration / (24 * 60 * 60 * 1000))} days
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analytics.complianceScore.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Compliance Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {analytics.expiredConsents}
                      </div>
                      <div className="text-sm text-muted-foreground">Expired Consents</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Consent Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">Consent Record Details</h2>
                  <p className="text-muted-foreground mt-1">ID: {selectedRecord.id}</p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">User ID</span>
                  <div className="font-medium">{selectedRecord.userId}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className={cn('font-medium', getConsentStatusColor(selectedRecord.status))}>
                    {selectedRecord.status}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Regulation</span>
                  <div className="font-medium uppercase">{selectedRecord.regulation}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Version</span>
                  <div className="font-medium">{selectedRecord.consentVersion}</div>
                </div>
              </div>

              {/* Purposes and Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Purposes</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.purposes.map(purpose => (
                      <span key={purpose} className={cn('px-3 py-1 rounded text-sm', getPurposeColor(purpose))}>
                        {purpose.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Data Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.dataCategories.map(category => (
                      <span key={category} className="px-3 py-1 bg-gray-100 rounded text-sm">
                        {category.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Audit Trail */}
              <div>
                <h4 className="font-medium mb-3">Audit Trail</h4>
                <div className="space-y-2">
                  {selectedRecord.auditTrail.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium capitalize">{entry.action}</span>
                        {entry.reason && <span className="text-sm text-muted-foreground ml-2">- {entry.reason}</span>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};