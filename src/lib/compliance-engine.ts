// Compliance Automation Framework
import { logger, LogCategory } from './logger';
import { DataEncryption, PrivacyProtection } from './data-encryption';

export enum ComplianceFramework {
  GDPR = 'GDPR',
  POPIA = 'POPIA',
  CCPA = 'CCPA',
  HIPAA = 'HIPAA',
  SOX = 'SOX'
}

export interface ComplianceRule {
  id: string;
  framework: ComplianceFramework;
  name: string;
  description: string;
  category: 'data_protection' | 'privacy' | 'security' | 'audit' | 'retention';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  checkFunction: (data: any, context?: any) => Promise<ComplianceResult>;
  remediationFunction?: (data: any, context?: any) => Promise<ComplianceResult>;
}

export interface ComplianceResult {
  compliant: boolean;
  violations: ComplianceViolation[];
  recommendations: string[];
  metadata: Record<string, any>;
}

export interface ComplianceViolation {
  ruleId: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
  remediation?: string;
}

export class ComplianceEngine {
  private static rules: Map<string, ComplianceRule> = new Map();
  private static auditLog: ComplianceAuditEntry[] = [];

  static initialize(): void {
    this.registerGDPRRules();
    this.registerPOPIARules();
    this.registerCCPArules();
    logger.info(LogCategory.SECURITY, 'Compliance engine initialized', {
      rulesCount: this.rules.size
    });
  }

  // GDPR Compliance Rules
  private static registerGDPRRules(): void {
    // Article 5: Lawfulness, fairness and transparency
    this.registerRule({
      id: 'gdpr_art5_lawful_processing',
      framework: ComplianceFramework.GDPR,
      name: 'Lawful Processing',
      description: 'Personal data must be processed lawfully, fairly and in a transparent manner',
      category: 'data_protection',
      severity: 'high',
      enabled: true,
      checkFunction: async (data, context) => {
        const violations: ComplianceViolation[] = [];

        // Check for valid legal basis
        if (!data.legalBasis || !['consent', 'contract', 'legitimate_interest', 'legal_obligation', 'public_task', 'vital_interest'].includes(data.legalBasis)) {
          violations.push({
            ruleId: 'gdpr_art5_lawful_processing',
            description: 'Missing or invalid legal basis for processing',
            severity: 'high',
            remediation: 'Specify a valid legal basis for data processing'
          });
        }

        // Check for transparency
        if (!data.privacyNoticeProvided) {
          violations.push({
            ruleId: 'gdpr_art5_lawful_processing',
            description: 'Privacy notice not provided to data subject',
            severity: 'medium',
            remediation: 'Provide clear privacy notice to individuals'
          });
        }

        return {
          compliant: violations.length === 0,
          violations,
          recommendations: violations.length > 0 ? ['Review legal basis documentation', 'Update privacy notices'] : [],
          metadata: { checkedFields: ['legalBasis', 'privacyNoticeProvided'] }
        };
      }
    });

    // Article 6: Consent
    this.registerRule({
      id: 'gdpr_art6_consent',
      framework: ComplianceFramework.GDPR,
      name: 'Valid Consent',
      description: 'Consent must be freely given, specific, informed and unambiguous',
      category: 'privacy',
      severity: 'critical',
      enabled: true,
      checkFunction: async (data, context) => {
        const violations: ComplianceViolation[] = [];

        if (data.processingRequiresConsent) {
          // Check consent validity
          if (!data.consentGiven || data.consentGiven === false) {
            violations.push({
              ruleId: 'gdpr_art6_consent',
              description: 'Consent not obtained or withdrawn',
              severity: 'critical',
              remediation: 'Obtain valid consent before processing'
            });
          }

          if (!data.consentTimestamp) {
            violations.push({
              ruleId: 'gdpr_art6_consent',
              description: 'Consent timestamp missing',
              severity: 'medium',
              remediation: 'Record when consent was obtained'
            });
          }

          // Check consent age (must be recent)
          if (data.consentTimestamp) {
            const consentAge = Date.now() - new Date(data.consentTimestamp).getTime();
            const oneYearMs = 365 * 24 * 60 * 60 * 1000;
            if (consentAge > oneYearMs) {
              violations.push({
                ruleId: 'gdpr_art6_consent',
                description: 'Consent is more than 1 year old',
                severity: 'medium',
                remediation: 'Refresh consent annually'
              });
            }
          }
        }

        return {
          compliant: violations.length === 0,
          violations,
          recommendations: violations.length > 0 ? ['Review consent mechanisms', 'Implement consent management'] : [],
          metadata: { consentRequired: data.processingRequiresConsent }
        };
      }
    });

    // Article 17: Right to erasure
    this.registerRule({
      id: 'gdpr_art17_right_to_erasure',
      framework: ComplianceFramework.GDPR,
      name: 'Right to Erasure',
      description: 'Individuals have the right to have their data erased',
      category: 'privacy',
      severity: 'high',
      enabled: true,
      checkFunction: async (data, context) => {
        const violations: ComplianceViolation[] = [];

        if (data.deletionRequested && !data.deletionCompleted) {
          violations.push({
            ruleId: 'gdpr_art17_right_to_erasure',
            description: 'Deletion request not fulfilled within required timeframe',
            severity: 'high',
            remediation: 'Complete data erasure within 30 days'
          });
        }

        return {
          compliant: violations.length === 0,
          violations,
          recommendations: violations.length > 0 ? ['Implement automated deletion workflows'] : [],
          metadata: { deletionRequested: data.deletionRequested }
        };
      },
      remediationFunction: async (data, context) => {
        // Implement data erasure
        await PrivacyProtection.anonymizeUserData(data.userId);

        return {
          compliant: true,
          violations: [],
          recommendations: ['Verify data erasure completion'],
          metadata: { erasureCompleted: true, timestamp: new Date().toISOString() }
        };
      }
    });
  }

  // POPIA Compliance Rules (South African Protection of Personal Information Act)
  private static registerPOPIARules(): void {
    this.registerRule({
      id: 'popia_condition_1_lawfulness',
      framework: ComplianceFramework.POPIA,
      name: 'Lawful Processing',
      description: 'Personal information must be processed lawfully and in a reasonable manner',
      category: 'data_protection',
      severity: 'high',
      enabled: true,
      checkFunction: async (data, context) => {
        const violations: ComplianceViolation[] = [];

        // POPIA requires accountability - check if responsible party is identified
        if (!data.responsibleParty) {
          violations.push({
            ruleId: 'popia_condition_1_lawfulness',
            description: 'Responsible party not identified',
            severity: 'high',
            remediation: 'Designate responsible party for data processing'
          });
        }

        // Check for processing limitation principle
        if (data.processingPurpose && data.processingPurpose.length > 200) {
          violations.push({
            ruleId: 'popia_condition_1_lawfulness',
            description: 'Processing purpose too broad or vague',
            severity: 'medium',
            remediation: 'Specify precise and limited processing purposes'
          });
        }

        return {
          compliant: violations.length === 0,
          violations,
          recommendations: violations.length > 0 ? ['Review processing purposes', 'Document responsible parties'] : [],
          metadata: { framework: 'POPIA', condition: 1 }
        };
      }
    });

    // POPIA Section 18: Direct marketing
    this.registerRule({
      id: 'popia_section_18_direct_marketing',
      framework: ComplianceFramework.POPIA,
      name: 'Direct Marketing Consent',
      description: 'Direct marketing requires consent unless existing customer relationship exists',
      category: 'privacy',
      severity: 'medium',
      enabled: true,
      checkFunction: async (data, context) => {
        const violations: ComplianceViolation[] = [];

        if (data.directMarketing && !data.marketingConsent) {
          // Check if existing customer relationship exists
          const hasRelationship = data.customerSince &&
            (Date.now() - new Date(data.customerSince).getTime()) < (365 * 24 * 60 * 60 * 1000); // 1 year

          if (!hasRelationship) {
            violations.push({
              ruleId: 'popia_section_18_direct_marketing',
              description: 'Direct marketing consent required',
              severity: 'medium',
              remediation: 'Obtain consent for direct marketing or verify existing customer relationship'
            });
          }
        }

        return {
          compliant: violations.length === 0,
          violations,
          recommendations: violations.length > 0 ? ['Implement consent management for marketing'] : [],
          metadata: { directMarketing: data.directMarketing }
        };
      }
    });
  }

  // CCPA Compliance Rules (California Consumer Privacy Act)
  private static registerCCPArules(): void {
    this.registerRule({
      id: 'ccpa_right_to_know',
      framework: ComplianceFramework.CCPA,
      name: 'Right to Know',
      description: 'Consumers have the right to know what personal information is collected',
      category: 'privacy',
      severity: 'medium',
      enabled: true,
      checkFunction: async (data, context) => {
        const violations: ComplianceViolation[] = [];

        if (!data.privacyNotice || !data.privacyNotice.includesPersonalInfoCollected) {
          violations.push({
            ruleId: 'ccpa_right_to_know',
            description: 'Privacy notice does not disclose personal information collected',
            severity: 'medium',
            remediation: 'Update privacy notice to include specific categories of personal information'
          });
        }

        return {
          compliant: violations.length === 0,
          violations,
          recommendations: violations.length > 0 ? ['Enhance privacy notices', 'Create data inventory'] : [],
          metadata: { framework: 'CCPA' }
        };
      }
    });
  }

  static registerRule(rule: ComplianceRule): void {
    this.rules.set(rule.id, rule);
    logger.info(LogCategory.SECURITY, 'Compliance rule registered', {
      ruleId: rule.id,
      framework: rule.framework,
      category: rule.category
    });
  }

  static async checkCompliance(data: any, frameworks: ComplianceFramework[] = Object.values(ComplianceFramework), context?: any): Promise<ComplianceResult> {
    const allViolations: ComplianceViolation[] = [];
    const allRecommendations: string[] = [];
    const metadata = { checkedRules: 0, frameworks };

    for (const rule of this.rules.values()) {
      if (!rule.enabled || !frameworks.includes(rule.framework)) continue;

      try {
        metadata.checkedRules++;
        const result = await rule.checkFunction(data, context);

        allViolations.push(...result.violations);
        allRecommendations.push(...result.recommendations);

        // Log compliance check
        if (!result.compliant) {
          logger.warn(LogCategory.SECURITY, 'Compliance violation detected', {
            ruleId: rule.id,
            framework: rule.framework,
            violations: result.violations.length,
            severity: rule.severity
          });
        }
      } catch (error) {
        logger.error(LogCategory.SECURITY, 'Compliance check failed', error as Error, {
          ruleId: rule.id
        });
      }
    }

    const compliant = allViolations.length === 0;

    // Create audit entry
    const auditEntry: ComplianceAuditEntry = {
      timestamp: new Date(),
      dataType: 'user_data',
      frameworks,
      compliant,
      violationsCount: allViolations.length,
      recommendationsCount: allRecommendations.length,
      metadata
    };

    this.auditLog.push(auditEntry);

    // Keep only last 1000 audit entries
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }

    return {
      compliant,
      violations: allViolations,
      recommendations: [...new Set(allRecommendations)], // Remove duplicates
      metadata
    };
  }

  static async remediateViolation(violation: ComplianceViolation, data: any, context?: any): Promise<ComplianceResult> {
    const rule = this.rules.get(violation.ruleId);

    if (!rule || !rule.remediationFunction) {
      return {
        compliant: false,
        violations: [violation],
        recommendations: ['Manual remediation required'],
        metadata: { remediationAvailable: false }
      };
    }

    try {
      logger.info(LogCategory.SECURITY, 'Starting compliance remediation', {
        ruleId: violation.ruleId,
        severity: violation.severity
      });

      const result = await rule.remediationFunction(data, context);

      logger.info(LogCategory.SECURITY, 'Compliance remediation completed', {
        ruleId: violation.ruleId,
        success: result.compliant
      });

      return result;
    } catch (error) {
      logger.error(LogCategory.SECURITY, 'Compliance remediation failed', error as Error, {
        ruleId: violation.ruleId
      });

      return {
        compliant: false,
        violations: [violation],
        recommendations: ['Remediation failed, manual intervention required'],
        metadata: { remediationError: (error as Error).message }
      };
    }
  }

  static getComplianceReport(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): ComplianceReport {
    const now = Date.now();
    const timeframeMs = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };

    const cutoff = now - timeframeMs[timeframe];
    const relevantAudits = this.auditLog.filter(entry => entry.timestamp.getTime() > cutoff);

    const report: ComplianceReport = {
      timeframe,
      totalChecks: relevantAudits.length,
      compliantChecks: relevantAudits.filter(a => a.compliant).length,
      violations: relevantAudits.reduce((sum, a) => sum + a.violationsCount, 0),
      frameworks: [...new Set(relevantAudits.flatMap(a => a.frameworks))],
      generatedAt: new Date()
    };

    return report;
  }

  static getAuditLog(limit: number = 100): ComplianceAuditEntry[] {
    return this.auditLog.slice(-limit);
  }
}

export interface ComplianceAuditEntry {
  timestamp: Date;
  dataType: string;
  frameworks: ComplianceFramework[];
  compliant: boolean;
  violationsCount: number;
  recommendationsCount: number;
  metadata: Record<string, any>;
}

export interface ComplianceReport {
  timeframe: 'hour' | 'day' | 'week' | 'month';
  totalChecks: number;
  compliantChecks: number;
  violations: number;
  frameworks: ComplianceFramework[];
  generatedAt: Date;
}

// Initialize compliance engine
ComplianceEngine.initialize();