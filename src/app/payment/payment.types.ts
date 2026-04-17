export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'bank' | 'wallet';
  logo: string;
  status: 'active' | 'coming_soon';
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  gateway: string;
  createdAt: string;
}

export const paymentGateways: PaymentMethod[] = [
  { id: 'ozow', name: 'Ozow', type: 'bank', logo: '🏦', status: 'active' },
  { id: 'yoco', name: 'Yoco', type: 'card', logo: '💳', status: 'active' },
  { id: 'payjustnow', name: 'PayJustNow', type: 'wallet', logo: '📱', status: 'active' },
  { id: 'capitec', name: 'Capitec Pay', type: 'bank', logo: '🏛️', status: 'active' },
  { id: 'snapscan', name: 'SnapScan', type: 'wallet', logo: '📲', status: 'active' },
  { id: 'zapper', name: 'Zapper', type: 'wallet', logo: '✓', status: 'coming_soon' },
];

export const transactionHistory: Transaction[] = [
  { id: 'txn_001', amount: 2450, currency: 'ZAR', status: 'completed', gateway: 'Yoco', createdAt: '2026-04-17' },
  { id: 'txn_002', amount: 890, currency: 'ZAR', status: 'completed', gateway: 'Ozow', createdAt: '2026-04-16' },
  { id: 'txn_003', amount: 3500, currency: 'ZAR', status: 'pending', gateway: 'PayJustNow', createdAt: '2026-04-15' },
];