import { Injectable } from '@nestjs/common';

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  gateway: 'ozow' | 'yoco' | 'payjustnow' | 'capitec' | 'snapscan' | 'zapper';
  customerId: string;
  createdAt: Date;
}

@Injectable()
export class PaymentService {
  private transactions: PaymentTransaction[] = [];

  async processPayment(data: {
    amount: number;
    gateway: string;
    customerId: string;
  }): Promise<PaymentTransaction> {
    const transaction: PaymentTransaction = {
      id: `txn_${Date.now()}`,
      amount: data.amount,
      currency: 'ZAR',
      status: 'completed',
      gateway: data.gateway as any,
      customerId: data.customerId,
      createdAt: new Date(),
    };
    this.transactions.push(transaction);
    return transaction;
  }

  async getTransactions(customerId: string): Promise<PaymentTransaction[]> {
    return this.transactions.filter(t => t.customerId === customerId);
  }

  async getGateways(): Promise<string[]> {
    return ['Ozow', 'Yoco', 'PayJustNow', 'Capitec Pay', 'SnapScan', 'Zapper', 'Apple Pay', 'Google Pay'];
  }
}