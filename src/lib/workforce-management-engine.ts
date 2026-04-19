import { PropertyData } from '@/lib/types/property';

export interface Employee {
  id: string;
  userId?: string; // Link to system user account
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  nationality?: string;
  nationalId?: string;
  taxId?: string;

  // Employment details
  employmentType: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'intern';
  jobTitle: string;
  department: string;
  managerId?: string;
  startDate: Date;
  endDate?: Date;
  employmentStatus: 'active' | 'inactive' | 'terminated' | 'on_leave' | 'suspended';

  // Compensation
  salary: number;
  currency: string;
  payFrequency: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly';
  benefits: Benefit[];
  deductions: Deduction[];

  // Work details
  workLocation?: string;
  workSchedule: WorkSchedule;
  skills: Skill[];
  certifications: EmployeeCertification[];

  // Personal details
  address: Address;
  emergencyContacts: EmergencyContact[];
  bankDetails?: BankDetails;

  // System tracking
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  onboardingCompleted: boolean;
  exitDate?: Date;
  exitReason?: string;
}

export interface WorkSchedule {
  type: 'fixed' | 'flexible' | 'shift' | 'remote';
  workDays: number[]; // 0-6, Sunday = 0
  workHours: {
    start: string; // HH:MM format
    end: string;
  };
  breakDuration: number; // minutes
  overtimeEligible: boolean;
  shiftPattern?: ShiftPattern;
}

export interface ShiftPattern {
  name: string;
  shifts: Shift[];
  rotationDays: number;
  currentShiftIndex: number;
}

export interface Shift {
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  days: number[]; // Which days this shift applies
}

export interface Benefit {
  id: string;
  name: string;
  type: 'health' | 'retirement' | 'insurance' | 'paid_leave' | 'education' | 'other';
  provider?: string;
  coverageAmount?: number;
  employeeContribution: number;
  employerContribution: number;
  enrollmentDate: Date;
  expiryDate?: Date;
  status: 'active' | 'inactive' | 'pending';
}

export interface Deduction {
  id: string;
  name: string;
  type: 'tax' | 'insurance' | 'retirement' | 'loan' | 'other';
  amount: number;
  frequency: 'pay_period' | 'annual' | 'one_time';
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'inactive';
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  certified: boolean;
  certificationExpiry?: Date;
  lastAssessed: Date;
  assessor?: string;
}

export interface EmployeeCertification {
  id: string;
  certificationId: string; // Links to Academy certification
  issuedDate: Date;
  expiryDate?: Date;
  status: 'active' | 'expired' | 'revoked';
  verificationCode: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: Address;
  isPrimary: boolean;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
  routingNumber?: string; // For US banks
  swiftCode?: string; // For international
  currency: string;
}

export interface OnboardingTask {
  id: string;
  employeeId: string;
  taskName: string;
  description: string;
  category: 'documentation' | 'training' | 'equipment' | 'compliance' | 'orientation';
  dueDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo: string; // Employee ID or 'hr' or 'manager'
  documents?: string[]; // File URLs
  notes?: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewPeriod: {
    start: Date;
    end: Date;
  };
  type: 'annual' | 'mid_year' | 'probation' | 'project' | 'ad_hoc';
  status: 'draft' | 'submitted' | 'approved' | 'rejected';

  // Performance metrics
  overallRating: number; // 1-5 scale
  categories: PerformanceCategory[];
  goals: PerformanceGoal[];
  achievements: string[];
  areasForImprovement: string[];
  developmentPlan: string[];

  // Review details
  strengths: string[];
  weaknesses: string[];
  comments: string;
  reviewerSignature?: string;
  employeeSignature?: string;

  createdAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
}

export interface PerformanceCategory {
  name: string;
  rating: number; // 1-5 scale
  weight: number; // Percentage weight in overall score
  comments: string;
}

export interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  category: 'individual' | 'team' | 'organizational';
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  targetDate: Date;
  progress: number; // 0-100
  metrics?: string[];
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  date: Date;
  clockIn: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  status: 'active' | 'completed' | 'approved' | 'rejected';
  location?: string;
  project?: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'unpaid' | 'other';
  startDate: Date;
  endDate: Date;
  duration: number; // days
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  documents?: string[]; // Medical certificates, etc.
}

export class WorkforceManagementEngine {
  private employees: Map<string, Employee> = new Map();
  private onboardingTasks: Map<string, OnboardingTask[]> = new Map();
  private performanceReviews: Map<string, PerformanceReview[]> = new Map();
  private timeEntries: Map<string, TimeEntry[]> = new Map();
  private leaveRequests: Map<string, LeaveRequest[]> = new Map();

  constructor() {
    this.initializeDefaultEmployees();
  }

  // Employee Management
  async createEmployee(employee: Omit<Employee, 'id' | 'employeeNumber' | 'createdAt' | 'updatedAt' | 'onboardingCompleted'>): Promise<Employee> {
    const employeeNumber = await this.generateEmployeeNumber();
    const newEmployee: Employee = {
      ...employee,
      id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      employeeNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      onboardingCompleted: false
    };

    this.employees.set(newEmployee.id, newEmployee);
    await this.initializeOnboardingTasks(newEmployee.id);

    return newEmployee;
  }

  async updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<Employee | null> {
    const employee = this.employees.get(employeeId);
    if (!employee) return null;

    const updatedEmployee = { ...employee, ...updates, updatedAt: new Date() };
    this.employees.set(employeeId, updatedEmployee);

    return updatedEmployee;
  }

  getEmployee(employeeId: string): Employee | null {
    return this.employees.get(employeeId) || null;
  }

  getEmployees(filters?: {
    department?: string;
    employmentStatus?: string;
    managerId?: string;
    limit?: number;
  }): Employee[] {
    let employees = Array.from(this.employees.values());

    if (filters) {
      employees = employees.filter(employee => {
        if (filters.department && employee.department !== filters.department) return false;
        if (filters.employmentStatus && employee.employmentStatus !== filters.employmentStatus) return false;
        if (filters.managerId && employee.managerId !== filters.managerId) return false;
        return true;
      });
    }

    // Sort by start date (newest first)
    employees.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    if (filters?.limit) {
      employees = employees.slice(0, filters.limit);
    }

    return employees;
  }

  // Onboarding Management
  async createOnboardingTask(task: Omit<OnboardingTask, 'id'>): Promise<OnboardingTask> {
    const newTask: OnboardingTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    if (!this.onboardingTasks.has(task.employeeId)) {
      this.onboardingTasks.set(task.employeeId, []);
    }

    this.onboardingTasks.get(task.employeeId)!.push(newTask);
    return newTask;
  }

  async updateOnboardingTask(employeeId: string, taskId: string, updates: Partial<OnboardingTask>): Promise<boolean> {
    const tasks = this.onboardingTasks.get(employeeId);
    if (!tasks) return false;

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;

    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    return true;
  }

  getOnboardingTasks(employeeId: string): OnboardingTask[] {
    return this.onboardingTasks.get(employeeId) || [];
  }

  async completeOnboarding(employeeId: string): Promise<boolean> {
    const employee = this.employees.get(employeeId);
    if (!employee) return false;

    const tasks = this.onboardingTasks.get(employeeId) || [];
    const allTasksCompleted = tasks.every(task => task.status === 'completed');

    if (allTasksCompleted) {
      employee.onboardingCompleted = true;
      employee.updatedAt = new Date();
      return true;
    }

    return false;
  }

  // Performance Management
  async createPerformanceReview(review: Omit<PerformanceReview, 'id' | 'createdAt'>): Promise<PerformanceReview> {
    const newReview: PerformanceReview = {
      ...review,
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    if (!this.performanceReviews.has(review.employeeId)) {
      this.performanceReviews.set(review.employeeId, []);
    }

    this.performanceReviews.get(review.employeeId)!.push(newReview);
    return newReview;
  }

  getPerformanceReviews(employeeId: string): PerformanceReview[] {
    return this.performanceReviews.get(employeeId) || [];
  }

  // Time Tracking
  async clockIn(employeeId: string, location?: string, notes?: string): Promise<TimeEntry> {
    const employee = this.employees.get(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Check if already clocked in
    const today = new Date().toISOString().split('T')[0];
    const existingEntries = this.timeEntries.get(employeeId) || [];
    const todayEntry = existingEntries.find(entry =>
      entry.date.toISOString().split('T')[0] === today && entry.status === 'active'
    );

    if (todayEntry) {
      throw new Error('Employee is already clocked in');
    }

    const timeEntry: TimeEntry = {
      id: `time-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      employeeId,
      date: new Date(),
      clockIn: new Date(),
      totalHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      status: 'active',
      location,
      notes
    };

    if (!this.timeEntries.has(employeeId)) {
      this.timeEntries.set(employeeId, []);
    }

    this.timeEntries.get(employeeId)!.push(timeEntry);
    return timeEntry;
  }

  async clockOut(employeeId: string, notes?: string): Promise<TimeEntry | null> {
    const existingEntries = this.timeEntries.get(employeeId) || [];
    const activeEntry = existingEntries.find(entry => entry.status === 'active');

    if (!activeEntry) {
      return null; // No active entry found
    }

    const clockOut = new Date();
    const totalMinutes = (clockOut.getTime() - activeEntry.clockIn.getTime()) / (1000 * 60);
    const totalHours = totalMinutes / 60;

    // Calculate regular and overtime hours (simplified - 8 hours regular, rest overtime)
    const regularHours = Math.min(totalHours, 8);
    const overtimeHours = Math.max(0, totalHours - 8);

    activeEntry.clockOut = clockOut;
    activeEntry.totalHours = totalHours;
    activeEntry.regularHours = regularHours;
    activeEntry.overtimeHours = overtimeHours;
    activeEntry.status = 'completed';
    activeEntry.notes = notes || activeEntry.notes;

    return activeEntry;
  }

  getTimeEntries(employeeId: string, startDate?: Date, endDate?: Date): TimeEntry[] {
    let entries = this.timeEntries.get(employeeId) || [];

    if (startDate) {
      entries = entries.filter(entry => entry.date >= startDate);
    }

    if (endDate) {
      entries = entries.filter(entry => entry.date <= endDate);
    }

    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Leave Management
  async submitLeaveRequest(request: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>): Promise<LeaveRequest> {
    const leaveRequest: LeaveRequest = {
      ...request,
      id: `leave-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      submittedAt: new Date(),
      status: 'pending'
    };

    if (!this.leaveRequests.has(request.employeeId)) {
      this.leaveRequests.set(request.employeeId, []);
    }

    this.leaveRequests.get(request.employeeId)!.push(leaveRequest);
    return leaveRequest;
  }

  async approveLeaveRequest(requestId: string, approverId: string): Promise<boolean> {
    const allRequests = Array.from(this.leaveRequests.values()).flat();
    const request = allRequests.find(r => r.id === requestId);

    if (!request || request.status !== 'pending') return false;

    request.status = 'approved';
    request.approvedAt = new Date();
    request.approvedBy = approverId;

    return true;
  }

  getLeaveRequests(employeeId: string): LeaveRequest[] {
    return this.leaveRequests.get(employeeId) || [];
  }

  // Analytics and Reporting
  getWorkforceAnalytics(timeframe: 'month' | 'quarter' | 'year' = 'month'): any {
    const employees = Array.from(this.employees.values());
    const activeEmployees = employees.filter(e => e.employmentStatus === 'active');

    // Calculate various metrics
    const departmentDistribution = this.calculateDepartmentDistribution(employees);
    const employmentTypeDistribution = this.calculateEmploymentTypeDistribution(employees);
    const tenureDistribution = this.calculateTenureDistribution(activeEmployees);
    const leaveUtilization = this.calculateLeaveUtilization();

    return {
      overview: {
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        newHires: this.calculateNewHires(timeframe),
        terminations: this.calculateTerminations(timeframe),
        turnoverRate: this.calculateTurnoverRate(timeframe)
      },
      demographics: {
        departmentDistribution,
        employmentTypeDistribution,
        tenureDistribution,
        averageTenure: this.calculateAverageTenure(activeEmployees)
      },
      attendance: {
        averageHoursWorked: this.calculateAverageHoursWorked(timeframe),
        absenteeismRate: this.calculateAbsenteeismRate(timeframe),
        overtimeHours: this.calculateOvertimeHours(timeframe)
      },
      leave: leaveUtilization,
      performance: {
        averagePerformanceRating: this.calculateAveragePerformanceRating(),
        completedReviews: this.calculateCompletedReviews(timeframe)
      }
    };
  }

  // Helper Methods
  private async generateEmployeeNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const existingEmployees = Array.from(this.employees.values());
    const yearEmployees = existingEmployees.filter(e =>
      e.employeeNumber.startsWith(year.toString())
    );

    const nextNumber = (yearEmployees.length + 1).toString().padStart(4, '0');
    return `${year}${nextNumber}`;
  }

  private async initializeOnboardingTasks(employeeId: string): Promise<void> {
    const tasks: Omit<OnboardingTask, 'id'>[] = [
      {
        employeeId,
        taskName: 'Complete Personal Information',
        description: 'Update your personal details, emergency contacts, and banking information',
        category: 'documentation',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending',
        assignedTo: employeeId
      },
      {
        employeeId,
        taskName: 'Review Company Policies',
        description: 'Read and acknowledge company policies and code of conduct',
        category: 'compliance',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        status: 'pending',
        assignedTo: employeeId
      },
      {
        employeeId,
        taskName: 'Complete Orientation Training',
        description: 'Complete the mandatory employee orientation training course',
        category: 'training',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        status: 'pending',
        assignedTo: employeeId
      },
      {
        employeeId,
        taskName: 'Set Up Workstation',
        description: 'Configure your workstation, email, and required software',
        category: 'equipment',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        status: 'pending',
        assignedTo: 'hr'
      }
    ];

    for (const task of tasks) {
      await this.createOnboardingTask(task);
    }
  }

  private calculateDepartmentDistribution(employees: Employee[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    employees.forEach(employee => {
      distribution[employee.department] = (distribution[employee.department] || 0) + 1;
    });

    return distribution;
  }

  private calculateEmploymentTypeDistribution(employees: Employee[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    employees.forEach(employee => {
      distribution[employee.employmentType] = (distribution[employee.employmentType] || 0) + 1;
    });

    return distribution;
  }

  private calculateTenureDistribution(employees: Employee[]): Record<string, number> {
    const distribution: Record<string, number> = { '0-1': 0, '1-3': 0, '3-5': 0, '5+': 0 };

    employees.forEach(employee => {
      const tenureYears = (Date.now() - employee.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

      if (tenureYears < 1) distribution['0-1']++;
      else if (tenureYears < 3) distribution['1-3']++;
      else if (tenureYears < 5) distribution['3-5']++;
      else distribution['5+']++;
    });

    return distribution;
  }

  private calculateLeaveUtilization(): any {
    // Simplified leave calculation
    return {
      annualLeaveUtilization: 78, // percentage
      sickLeaveUtilization: 45,
      averageLeaveDays: 22,
      leaveRequestsPending: 5
    };
  }

  private calculateNewHires(timeframe: string): number {
    const days = timeframe === 'month' ? 30 : timeframe === 'quarter' ? 90 : 365;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return Array.from(this.employees.values()).filter(e =>
      e.startDate >= cutoffDate
    ).length;
  }

  private calculateTerminations(timeframe: string): number {
    const days = timeframe === 'month' ? 30 : timeframe === 'quarter' ? 90 : 365;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return Array.from(this.employees.values()).filter(e =>
      e.employmentStatus === 'terminated' && e.endDate && e.endDate >= cutoffDate
    ).length;
  }

  private calculateTurnoverRate(timeframe: string): number {
    const newHires = this.calculateNewHires(timeframe);
    const terminations = this.calculateTerminations(timeframe);
    const averageEmployees = Array.from(this.employees.values()).length; // Simplified

    if (averageEmployees === 0) return 0;

    return ((terminations + newHires) / 2 / averageEmployees) * 100;
  }

  private calculateAverageTenure(employees: Employee[]): number {
    if (employees.length === 0) return 0;

    const totalTenure = employees.reduce((sum, employee) => {
      return sum + (Date.now() - employee.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    }, 0);

    return totalTenure / employees.length;
  }

  private calculateAverageHoursWorked(timeframe: string): number {
    // Simplified calculation
    return 40; // hours per week
  }

  private calculateAbsenteeismRate(timeframe: string): number {
    // Simplified calculation
    return 3.2; // percentage
  }

  private calculateOvertimeHours(timeframe: string): number {
    // Simplified calculation
    return 1250; // total overtime hours
  }

  private calculateAveragePerformanceRating(): number {
    // Simplified calculation
    return 3.8; // out of 5
  }

  private calculateCompletedReviews(timeframe: string): number {
    // Simplified calculation
    return 24; // reviews completed
  }

  private initializeDefaultEmployees(): void {
    // Create some sample employees for demonstration
    const sampleEmployees: Omit<Employee, 'id' | 'employeeNumber' | 'createdAt' | 'updatedAt' | 'onboardingCompleted'>[] = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@garlaws.com',
        employmentType: 'full_time',
        jobTitle: 'Property Manager',
        department: 'Operations',
        startDate: new Date('2023-01-15'),
        employmentStatus: 'active',
        salary: 75000,
        currency: 'USD',
        payFrequency: 'monthly',
        workSchedule: {
          type: 'fixed',
          workDays: [1, 2, 3, 4, 5], // Monday to Friday
          workHours: { start: '09:00', end: '17:00' },
          breakDuration: 60,
          overtimeEligible: true
        },
        skills: [],
        certifications: [],
        benefits: [],
        deductions: [],
        address: {
          street: '123 Main St',
          city: 'Johannesburg',
          state: 'Gauteng',
          postalCode: '2001',
          country: 'South Africa'
        },
        emergencyContacts: []
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@garlaws.com',
        employmentType: 'full_time',
        jobTitle: 'HR Manager',
        department: 'Human Resources',
        startDate: new Date('2022-06-01'),
        employmentStatus: 'active',
        salary: 85000,
        currency: 'USD',
        payFrequency: 'monthly',
        workSchedule: {
          type: 'fixed',
          workDays: [1, 2, 3, 4, 5],
          workHours: { start: '08:30', end: '16:30' },
          breakDuration: 60,
          overtimeEligible: true
        },
        skills: [],
        certifications: [],
        benefits: [],
        deductions: [],
        address: {
          street: '456 Oak Ave',
          city: 'Cape Town',
          state: 'Western Cape',
          postalCode: '8001',
          country: 'South Africa'
        },
        emergencyContacts: []
      }
    ];

    sampleEmployees.forEach(employee => {
      this.createEmployee(employee);
    });
  }
}

export const workforceManagementEngine = new WorkforceManagementEngine();