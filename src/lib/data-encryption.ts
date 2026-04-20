// Data Encryption and Privacy Protection
import { logger, LogCategory } from './logger';

export interface EncryptionConfig {
  algorithm: 'AES-256-GCM' | 'AES-256-CBC';
  keyLength: 256;
  ivLength: 16;
  saltRounds: 12;
  enableDataMasking: boolean;
  enableFieldEncryption: boolean;
  sensitiveFields: string[];
}

export class DataEncryption {
  private static config: EncryptionConfig = {
    algorithm: 'AES-256-GCM',
    keyLength: 256,
    ivLength: 16,
    saltRounds: 12,
    enableDataMasking: true,
    enableFieldEncryption: true,
    sensitiveFields: ['password', 'ssn', 'creditCard', 'email', 'phone']
  };

  private static encryptionKey: CryptoKey | null = null;

  static configure(config: Partial<EncryptionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Generate encryption key
  static async generateKey(): Promise<CryptoKey> {
    if (this.encryptionKey) return this.encryptionKey;

    try {
      // In production, this key should come from environment variables or key management service
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(process.env.ENCRYPTION_KEY || 'default-dev-key-32-chars-long'),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );

      this.encryptionKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: new TextEncoder().encode('encryption-salt'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: this.config.keyLength },
        true,
        ['encrypt', 'decrypt']
      );

      return this.encryptionKey;
    } catch (error) {
      logger.error(LogCategory.SECURITY, 'Failed to generate encryption key', error as Error);
      throw new Error('Encryption key generation failed');
    }
  }

  // Encrypt data
  static async encrypt(data: string): Promise<string> {
    try {
      const key = await this.generateKey();
      const iv = crypto.getRandomValues(new Uint8Array(this.config.ivLength));
      const encodedData = new TextEncoder().encode(data);

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Return as base64
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      logger.error(LogCategory.SECURITY, 'Encryption failed', error as Error);
      throw new Error('Data encryption failed');
    }
  }

  // Decrypt data
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.generateKey();
      const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));

      const iv = combined.slice(0, this.config.ivLength);
      const encrypted = combined.slice(this.config.ivLength);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      logger.error(LogCategory.SECURITY, 'Decryption failed', error as Error);
      throw new Error('Data decryption failed');
    }
  }

  // Hash sensitive data (one-way)
  static async hash(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      logger.error(LogCategory.SECURITY, 'Hashing failed', error as Error);
      throw new Error('Data hashing failed');
    }
  }

  // Mask sensitive data for display
  static maskSensitiveData(data: any, fields: string[] = this.config.sensitiveFields): any {
    if (!this.config.enableDataMasking) return data;

    if (typeof data !== 'object' || data === null) return data;

    const masked = Array.isArray(data) ? [...data] : { ...data };

    for (const field of fields) {
      if (masked[field]) {
        if (field === 'email') {
          masked[field] = this.maskEmail(masked[field]);
        } else if (field === 'phone') {
          masked[field] = this.maskPhone(masked[field]);
        } else if (field === 'creditCard') {
          masked[field] = this.maskCreditCard(masked[field]);
        } else {
          masked[field] = this.maskString(masked[field]);
        }
      }
    }

    return masked;
  }

  private static maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return local.substring(0, 2) + '*'.repeat(local.length - 2) + '@' + domain;
  }

  private static maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return phone;
    return '*'.repeat(cleaned.length - 4) + cleaned.substring(cleaned.length - 4);
  }

  private static maskCreditCard(card: string): string {
    const cleaned = card.replace(/\D/g, '');
    if (cleaned.length < 4) return card;
    return '*'.repeat(cleaned.length - 4) + cleaned.substring(cleaned.length - 4);
  }

  private static maskString(str: string): string {
    if (str.length <= 4) return '*'.repeat(str.length);
    return str.substring(0, 2) + '*'.repeat(str.length - 4) + str.substring(str.length - 2);
  }

  // Encrypt specific fields in data object
  static async encryptFields(data: any, fields: string[] = this.config.sensitiveFields): Promise<any> {
    if (!this.config.enableFieldEncryption) return data;

    const encrypted = { ...data };

    for (const field of fields) {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        try {
          encrypted[field] = await this.encrypt(encrypted[field]);
          encrypted[`${field}_encrypted`] = true;
        } catch (error) {
          logger.warn(LogCategory.SECURITY, `Failed to encrypt field: ${field}`, { error: (error as Error).message });
        }
      }
    }

    return encrypted;
  }

  // Decrypt specific fields in data object
  static async decryptFields(data: any, fields: string[] = this.config.sensitiveFields): Promise<any> {
    if (!this.config.enableFieldEncryption) return data;

    const decrypted = { ...data };

    for (const field of fields) {
      if (decrypted[`${field}_encrypted`] && decrypted[field]) {
        try {
          decrypted[field] = await this.decrypt(decrypted[field]);
          delete decrypted[`${field}_encrypted`];
        } catch (error) {
          logger.warn(LogCategory.SECURITY, `Failed to decrypt field: ${field}`, { error: (error as Error).message });
        }
      }
    }

    return decrypted;
  }

  // Generate secure token
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validate data against PII patterns
  static validatePIIData(data: any): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      violations.push('Invalid email format');
    }

    // Phone validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (data.phone && !phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
      violations.push('Invalid phone format');
    }

    // Credit card validation (basic)
    const ccRegex = /^\d{13,19}$/;
    if (data.creditCard && !ccRegex.test(data.creditCard.replace(/\s/g, ''))) {
      violations.push('Invalid credit card format');
    }

    // SSN validation (US format)
    const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
    if (data.ssn && !ssnRegex.test(data.ssn)) {
      violations.push('Invalid SSN format');
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  // Anonymize data for analytics
  static anonymizeData(data: any): any {
    const anonymized = { ...data };

    // Remove or hash identifiable information
    const identifiableFields = ['id', 'email', 'phone', 'name', 'address', 'ssn', 'creditCard'];
    for (const field of identifiableFields) {
      if (anonymized[field]) {
        anonymized[field] = this.hashField(anonymized[field]);
      }
    }

    // Add anonymization timestamp
    anonymized.anonymizedAt = new Date().toISOString();

    return anonymized;
  }

  private static async hashField(value: any): Promise<string> {
    try {
      return await this.hash(JSON.stringify(value));
    } catch {
      return 'anonymized';
    }
  }
}

// Privacy Protection Utilities
export class PrivacyProtection {
  // Data retention policies
  static readonly RETENTION_POLICIES = {
    user_data: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
    logs: 90 * 24 * 60 * 60 * 1000, // 90 days
    analytics: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
    backups: 365 * 24 * 60 * 60 * 1000 // 1 year
  };

  // Check if data should be retained
  static shouldRetainData(dataType: keyof typeof PrivacyProtection.RETENTION_POLICIES, createdAt: Date): boolean {
    const retentionPeriod = this.RETENTION_POLICIES[dataType];
    const age = Date.now() - createdAt.getTime();
    return age <= retentionPeriod;
  }

  // Right to be forgotten - anonymize user data
  static async anonymizeUserData(userId: string): Promise<void> {
    try {
      logger.info(LogCategory.SECURITY, 'Anonymizing user data for right to be forgotten', { userId });

      // In a real implementation, this would:
      // 1. Find all user data in database
      // 2. Anonymize or delete personal information
      // 3. Log the action for compliance
      // 4. Notify relevant systems

      logger.logSecurityEvent('user_data_anonymized', undefined, {
        userId,
        reason: 'right_to_be_forgotten',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(LogCategory.SECURITY, 'Failed to anonymize user data', error as Error);
      throw error;
    }
  }

  // Data portability - export user data
  static async exportUserData(userId: string): Promise<any> {
    try {
      logger.info(LogCategory.SECURITY, 'Exporting user data for portability', { userId });

      // In a real implementation, this would:
      // 1. Collect all user data from various systems
      // 2. Format it according to data portability standards
      // 3. Return structured data

      const mockData = {
        userId,
        exportDate: new Date().toISOString(),
        data: {
          profile: { /* user profile data */ },
          activity: { /* user activity data */ },
          preferences: { /* user preferences */ }
        }
      };

      logger.logSecurityEvent('user_data_exported', undefined, {
        userId,
        exportDate: mockData.exportDate
      });

      return mockData;
    } catch (error) {
      logger.error(LogCategory.SECURITY, 'Failed to export user data', error as Error);
      throw error;
    }
  }

  // Consent management
  static async updateUserConsent(userId: string, consents: Record<string, boolean>): Promise<void> {
    try {
      logger.info(LogCategory.SECURITY, 'Updating user consent', { userId, consents });

      // In a real implementation, this would update consent records
      // and potentially delete data for withdrawn consents

      logger.logBusinessEvent('user_consent_updated', {
        userId,
        consents,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(LogCategory.SECURITY, 'Failed to update user consent', error as Error);
      throw error;
    }
  }

  // Data minimization - remove unnecessary data
  static async minimizeData(data: any, requiredFields: string[]): Promise<any> {
    const minimized: any = {};

    for (const field of requiredFields) {
      if (data[field] !== undefined) {
        minimized[field] = data[field];
      }
    }

    // Add metadata about minimization
    minimized._metadata = {
      minimizedAt: new Date().toISOString(),
      originalFields: Object.keys(data),
      retainedFields: requiredFields
    };

    return minimized;
  }
}