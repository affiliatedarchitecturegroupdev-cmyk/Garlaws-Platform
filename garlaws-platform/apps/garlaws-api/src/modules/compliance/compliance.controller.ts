import { Controller, Get } from '@nestjs/common';
import { ComplianceService } from './compliance.service';

@Controller('api/compliance')
export class ComplianceController {
  constructor(private complianceService: ComplianceService) {}

  @Get()
  getComplianceStatuses() {
    return this.complianceService.getComplianceStatuses();
  }

  @Get('bbee')
  getBBEEStatus() {
    return this.complianceService.getBBEEStatus();
  }
}