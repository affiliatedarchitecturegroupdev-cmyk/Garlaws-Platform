export interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  pendingTasks: number;
  monthlyRevenue: number;
  bbeeLevel: string;
}

export interface PropertyHealth {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  lastService: Date;
  nextService: Date;
  iotConnected: boolean;
  healthScore: number;
}

export interface Task {
  id: string;
  title: string;
  property: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  dueDate: Date;
}

export interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}

export interface ComplianceStatus {
  regulation: string;
  status: 'compliant' | 'pending' | 'review';
  level: string;
  lastAudit: string;
}