import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('api/payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  async processPayment(@Body() body: {
    amount: number;
    gateway: string;
    customerId: string;
  }) {
    return this.paymentService.processPayment(body);
  }

  @Get('gateways')
  async getGateways() {
    return { gateways: await this.paymentService.getGateways() };
  }

  @Get('customer/:customerId')
  async getCustomerTransactions(@Param('customerId') customerId: string) {
    return this.paymentService.getTransactions(customerId);
  }
}