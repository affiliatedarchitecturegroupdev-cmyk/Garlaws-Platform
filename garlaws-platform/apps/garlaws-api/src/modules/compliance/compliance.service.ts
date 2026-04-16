import { Injectable } from '@nestjs/common';

export interface ComplianceStatus {
  regulation: string;
  status: 'compliant' | 'pending' | 'review';
  level: string;
  lastAudit: string;
}

@Injectable()
export class ComplianceService {
  private complianceStatuses: ComplianceStatus[] = [
    { regulation: 'B-BBEE', status: 'compliant', level: 'Level 2', lastAudit: '2026-01-15' },
    { regulation: 'POPIA', status: 'compliant', level: 'Full', lastAudit: '2026-02-01' },
    { regulation: 'SARS (VAT)', status: 'compliant', level: '15%', lastAudit: '2026-03-01' },
    { regulation: 'NHBRC', status: 'compliant', level: 'Registered', lastAudit: '2026-01-20' },
    { regulation: 'CIDB', status: 'pending', level: 'Grade 3', lastAudit: '2026-04-01' },
  ];

  getComplianceStatuses(): ComplianceStatus[] {
    return this.complianceStatuses;
  }

  getBBEEStatus(): ComplianceStatus | undefined {
    return this.complianceStatuses.find(c => c.regulation === 'B-BBEE');
  }
}