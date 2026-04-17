import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Controller('api/subscriptions')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get('plans')
  async getPlans() {
    return { plans: await this.subscriptionService.getPlans() };
  }

  @Get('customer/:customerId')
  async getCustomerSubscription(@Param('customerId') customerId: string) {
    return this.subscriptionService.getCustomerSubscription(customerId);
  }

  @Post()
  async createSubscription(@Body() body: { customerId: string; plan: string }) {
    return this.subscriptionService.createSubscription(body);
  }
}