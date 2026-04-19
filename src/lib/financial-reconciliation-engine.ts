import { PropertyData } from '@/lib/types/property';

export interface FinancialTransaction {
  id: string;
  tenantId: string;
  transactionType: 'invoice' | 'payment' | 'credit' | 'debit' | 'transfer' | 'fee' | 'refund';
  amount: number;
  currency: string;
  exchangeRate?: number;
  baseAmount?: number; // Amount in base currency
  description: string;
  reference: string;
  category: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity';
  subcategory?: string;

  // Related entities
  propertyId?: string;
  customerId?: string;
  vendorId?: string;
  invoiceId?: string;
  paymentMethodId?: string;

  // Transaction details
  transactionDate: Date;
  dueDate?: Date;
  paymentDate?: Date;
  status: 'pending' | 'cleared' | 'reconciled' | 'disputed' | 'cancelled';
  reconciliationStatus: 'unreconciled' | 'partially_reconciled' | 'fully_reconciled';

  // Bank reconciliation
  bankAccountId?: string;
  bankTransactionId?: string;
  bankStatementId?: string;

  // Tax information
  taxAmount: number;
  taxRate: number;
  taxCategory: 'vat' | 'income_tax' | 'withholding' | 'none';
  taxJurisdiction: string;

  // Audit trail
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  attachments?: string[]; // File URLs

  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;

  // Invoice details
  issueDate: Date;
  dueDate: Date;
  paymentTerms: string; // e.g., "Net 30", "Due on receipt"

  // Financial details
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;

  // Line items
  lineItems: InvoiceLineItem[];

  // Status and tracking
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';

  // Related transactions
  transactions: string[]; // Transaction IDs

  // Additional metadata
  notes?: string;
  footerText?: string;
  poNumber?: string; // Purchase order number

  // System tracking
  sentAt?: Date;
  viewedAt?: Date;
  paidAt?: Date;
  createdBy: string;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  category: string;
  reference?: string; // Property ID, service ID, etc.
}

export interface BankAccount {
  id: string;
  tenantId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchCode: string;
  accountType: 'checking' | 'savings' | 'business';
  currency: string;
  balance: number;
  availableBalance: number;

  // Integration details
  bankIntegrationId?: string;
  lastSync?: Date;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  transactionId: string; // Bank's transaction ID
  amount: number;
  currency: string;
  description: string;
  transactionDate: Date;
  valueDate: Date;
  transactionType: 'credit' | 'debit';

  // Reconciliation
  reconciledTransactionId?: string;
  reconciliationStatus: 'unreconciled' | 'matched' | 'manually_reconciled';
  reconciliationNotes?: string;

  // Categorization
  category: string;
  subcategory?: string;
  tags: string[];

  // Additional data
  reference?: string;
  counterpartyName?: string;
  counterpartyAccount?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface ReconciliationRule {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  priority: number;
  isActive: boolean;

  // Matching criteria
  amountTolerance: number; // Percentage tolerance
  dateTolerance: number; // Days tolerance
  descriptionPatterns: string[];
  categoryFilters: string[];

  // Auto-reconciliation settings
  autoReconcile: boolean;
  requireApproval: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface CurrencyExchange {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  inverseRate: number;
  source: 'manual' | 'ecb' | 'xe' | 'oanda' | 'bank';
  effectiveDate: Date;
  expiryDate?: Date;
  createdAt: Date;
}

export interface TaxCalculation {
  id: string;
  tenantId: string;
  jurisdiction: string; // Country/Province/State
  taxType: 'vat' | 'gst' | 'sales_tax' | 'income_tax';
  taxRate: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  category: string; // Goods, services, etc.
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialReport {
  id: string;
  tenantId: string;
  reportType: 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'tax_report' | 'aging_report';
  period: {
    start: Date;
    end: Date;
  };
  currency: string;

  // Report data
  sections: ReportSection[];
  totals: {
    revenue: number;
    expenses: number;
    profit: number;
    assets: number;
    liabilities: number;
    equity: number;
  };

  // Metadata
  generatedBy: string;
  generatedAt: Date;
  status: 'draft' | 'final' | 'archived';

  // File storage
  fileUrl?: string;
  fileFormat: 'pdf' | 'excel' | 'csv';
}

export interface ReportSection {
  name: string;
  type: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity';
  items: ReportItem[];
  subtotal: number;
}

export interface ReportItem {
  name: string;
  amount: number;
  percentage: number;
  category: string;
  transactions: number; // Count of transactions
}

export class FinancialReconciliationEngine {
  private transactions: Map<string, FinancialTransaction> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private bankAccounts: Map<string, BankAccount> = new Map();
  private bankTransactions: Map<string, BankTransaction> = new Map();
  private reconciliationRules: Map<string, ReconciliationRule> = new Map();
  private currencyRates: Map<string, CurrencyExchange> = new Map();
  private taxCalculations: Map<string, TaxCalculation> = new Map();
  private financialReports: Map<string, FinancialReport> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  // Transaction Management
  async createTransaction(transaction: Omit<FinancialTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialTransaction> {
    const newTransaction: FinancialTransaction = {
      ...transaction,
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.transactions.set(newTransaction.id, newTransaction);
    return newTransaction;
  }

  async reconcileTransaction(
    transactionId: string,
    bankTransactionId: string,
    reconciliationType: 'auto' | 'manual' = 'manual'
  ): Promise<boolean> {
    const transaction = this.transactions.get(transactionId);
    const bankTransaction = this.bankTransactions.get(bankTransactionId);

    if (!transaction || !bankTransaction) return false;

    // Check if amounts match (within tolerance)
    const tolerance = 0.01; // 1% tolerance
    const amountMatch = Math.abs(transaction.amount - bankTransaction.amount) / transaction.amount <= tolerance;

    if (!amountMatch) return false;

    // Update reconciliation status
    transaction.reconciliationStatus = 'fully_reconciled';
    transaction.bankTransactionId = bankTransactionId;
    transaction.updatedAt = new Date();

    bankTransaction.reconciledTransactionId = transactionId;
    bankTransaction.reconciliationStatus = 'matched';
    bankTransaction.updatedAt = new Date();

    return true;
  }

  getTransactions(tenantId?: string, filters?: {
    status?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): FinancialTransaction[] {
    let transactions = Array.from(this.transactions.values());

    if (tenantId) {
      transactions = transactions.filter(t => t.tenantId === tenantId);
    }

    if (filters) {
      if (filters.status) {
        transactions = transactions.filter(t => t.status === filters.status);
      }
      if (filters.category) {
        transactions = transactions.filter(t => t.category === filters.category);
      }
      if (filters.startDate) {
        transactions = transactions.filter(t => t.transactionDate >= filters.startDate!);
      }
      if (filters.endDate) {
        transactions = transactions.filter(t => t.transactionDate <= filters.endDate!);
      }
    }

    // Sort by transaction date (newest first)
    transactions.sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());

    if (filters?.limit) {
      transactions = transactions.slice(0, filters.limit);
    }

    return transactions;
  }

  // Invoice Management
  async createInvoice(invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'updatedAt'>): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber(invoice.tenantId);

    const newInvoice: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      invoiceNumber,
      updatedAt: new Date()
    };

    // Calculate totals
    this.calculateInvoiceTotals(newInvoice);

    this.invoices.set(newInvoice.id, newInvoice);
    return newInvoice;
  }

  async updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) return null;

    const updatedInvoice = { ...invoice, ...updates, updatedAt: new Date() };

    // Recalculate totals if line items changed
    if (updates.lineItems) {
      this.calculateInvoiceTotals(updatedInvoice);
    }

    this.invoices.set(invoiceId, updatedInvoice);
    return updatedInvoice;
  }

  async markInvoiceAsPaid(invoiceId: string, paymentTransactionId: string): Promise<boolean> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) return false;

    invoice.status = 'paid';
    invoice.paymentStatus = 'paid';
    invoice.paidAt = new Date();
    invoice.transactions.push(paymentTransactionId);
    invoice.updatedAt = new Date();

    return true;
  }

  getInvoices(tenantId?: string, status?: string): Invoice[] {
    let invoices = Array.from(this.invoices.values());

    if (tenantId) {
      invoices = invoices.filter(i => i.tenantId === tenantId);
    }

    if (status) {
      invoices = invoices.filter(i => i.status === status);
    }

    // Sort by issue date (newest first)
    invoices.sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime());

    return invoices;
  }

  // Bank Account Management
  async createBankAccount(account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankAccount> {
    const newAccount: BankAccount = {
      ...account,
      id: `bank-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.bankAccounts.set(newAccount.id, newAccount);
    return newAccount;
  }

  async syncBankTransactions(accountId: string): Promise<BankTransaction[]> {
    // Mock bank transaction sync - in production, this would connect to bank APIs
    const account = this.bankAccounts.get(accountId);
    if (!account) throw new Error('Bank account not found');

    const mockTransactions: Omit<BankTransaction, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        bankAccountId: accountId,
        transactionId: `bank-txn-${Date.now()}-1`,
        amount: -1500.00,
        currency: account.currency,
        description: 'Office rent payment',
        transactionDate: new Date(),
        valueDate: new Date(),
        transactionType: 'debit',
        category: 'expense',
        subcategory: 'rent',
        tags: ['monthly', 'recurring'],
        reconciliationStatus: 'unreconciled'
      },
      {
        bankAccountId: accountId,
        transactionId: `bank-txn-${Date.now()}-2`,
        amount: 2500.00,
        currency: account.currency,
        description: 'Client payment - Property Management',
        transactionDate: new Date(),
        valueDate: new Date(),
        transactionType: 'credit',
        category: 'revenue',
        subcategory: 'services',
        tags: ['client_payment'],
        reconciliationStatus: 'unreconciled'
      }
    ];

    const savedTransactions: BankTransaction[] = [];

    for (const txnData of mockTransactions) {
      const transaction: BankTransaction = {
        ...txnData,
        id: `btxn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.bankTransactions.set(transaction.id, transaction);
      savedTransactions.push(transaction);
    }

    // Update account last sync
    account.lastSync = new Date();
    account.updatedAt = new Date();

    return savedTransactions;
  }

  getBankAccounts(tenantId: string): BankAccount[] {
    return Array.from(this.bankAccounts.values())
      .filter(account => account.tenantId === tenantId);
  }

  getBankTransactions(accountId: string, unreconciledOnly: boolean = false): BankTransaction[] {
    let transactions = Array.from(this.bankTransactions.values())
      .filter(txn => txn.bankAccountId === accountId);

    if (unreconciledOnly) {
      transactions = transactions.filter(txn => txn.reconciliationStatus === 'unreconciled');
    }

    return transactions.sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());
  }

  // Currency Management
  async updateExchangeRate(fromCurrency: string, toCurrency: string, rate: number, source: string = 'manual'): Promise<CurrencyExchange> {
    const key = `${fromCurrency}-${toCurrency}`;
    const exchange: CurrencyExchange = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromCurrency,
      toCurrency,
      rate,
      inverseRate: 1 / rate,
      source: source as any,
      effectiveDate: new Date(),
      createdAt: new Date()
    };

    this.currencyRates.set(key, exchange);
    return exchange;
  }

  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;

    const key = `${fromCurrency}-${toCurrency}`;
    const exchange = this.currencyRates.get(key);

    if (!exchange) {
      throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    }

    return amount * exchange.rate;
  }

  getExchangeRate(fromCurrency: string, toCurrency: string): CurrencyExchange | null {
    const key = `${fromCurrency}-${toCurrency}`;
    return this.currencyRates.get(key) || null;
  }

  // Tax Management
  async createTaxCalculation(calc: Omit<TaxCalculation, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaxCalculation> {
    const newCalc: TaxCalculation = {
      ...calc,
      id: `tax-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.taxCalculations.set(newCalc.id, newCalc);
    return newCalc;
  }

  calculateTax(amount: number, taxType: string, jurisdiction: string): number {
    const applicableTax = Array.from(this.taxCalculations.values())
      .find(calc =>
        calc.taxType === taxType &&
        calc.jurisdiction === jurisdiction &&
        calc.isActive &&
        calc.effectiveFrom <= new Date() &&
        (!calc.effectiveTo || calc.effectiveTo >= new Date())
      );

    if (!applicableTax) return 0;

    return amount * (applicableTax.taxRate / 100);
  }

  getTaxCalculations(tenantId?: string, jurisdiction?: string): TaxCalculation[] {
    let calculations = Array.from(this.taxCalculations.values());

    if (tenantId) {
      calculations = calculations.filter(calc => calc.tenantId === tenantId);
    }

    if (jurisdiction) {
      calculations = calculations.filter(calc => calc.jurisdiction === jurisdiction);
    }

    return calculations;
  }

  // Financial Reporting
  async generateFinancialReport(
    tenantId: string,
    reportType: FinancialReport['reportType'],
    startDate: Date,
    endDate: Date,
    currency: string = 'ZAR'
  ): Promise<FinancialReport> {
    const transactions = this.getTransactions(tenantId, {
      startDate,
      endDate
    });

    const report: FinancialReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      reportType,
      period: { start: startDate, end: endDate },
      currency,
      sections: [],
      totals: {
        revenue: 0,
        expenses: 0,
        profit: 0,
        assets: 0,
        liabilities: 0,
        equity: 0
      },
      generatedBy: 'system',
      generatedAt: new Date(),
      status: 'final',
      fileFormat: 'pdf'
    };

    // Generate report sections based on type
    switch (reportType) {
      case 'profit_loss':
        report.sections = this.generateProfitLossSections(transactions);
        break;
      case 'balance_sheet':
        report.sections = this.generateBalanceSheetSections(transactions);
        break;
      case 'cash_flow':
        report.sections = this.generateCashFlowSections(transactions);
        break;
    }

    // Calculate totals
    this.calculateReportTotals(report);

    this.financialReports.set(report.id, report);
    return report;
  }

  getFinancialReports(tenantId: string, reportType?: string): FinancialReport[] {
    let reports = Array.from(this.financialReports.values())
      .filter(report => report.tenantId === tenantId);

    if (reportType) {
      reports = reports.filter(report => report.reportType === reportType);
    }

    return reports.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  // Analytics and Insights
  getFinancialAnalytics(tenantId: string, timeframe: 'month' | 'quarter' | 'year' = 'month'): any {
    const endDate = new Date();
    const startDate = new Date(endDate);

    switch (timeframe) {
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const transactions = this.getTransactions(tenantId, {
      startDate,
      endDate
    });

    const revenue = transactions
      .filter(t => t.category === 'revenue' && t.status === 'cleared')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.category === 'expense' && t.status === 'cleared')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const profit = revenue - expenses;

    const topRevenueSources = this.getTopCategories(transactions.filter(t => t.category === 'revenue'), 5);
    const topExpenseCategories = this.getTopCategories(transactions.filter(t => t.category === 'expense'), 5);

    const cashFlow = this.calculateCashFlow(transactions);
    const reconciliationRate = this.calculateReconciliationRate(transactions);

    return {
      overview: {
        revenue,
        expenses,
        profit,
        profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
        timeframe
      },
      trends: {
        revenueByMonth: this.groupTransactionsByMonth(transactions.filter(t => t.category === 'revenue')),
        expensesByMonth: this.groupTransactionsByMonth(transactions.filter(t => t.category === 'expense'))
      },
      breakdown: {
        topRevenueSources,
        topExpenseCategories,
        revenueByCategory: this.groupTransactionsByCategory(transactions.filter(t => t.category === 'revenue')),
        expensesByCategory: this.groupTransactionsByCategory(transactions.filter(t => t.category === 'expense'))
      },
      cashFlow,
      reconciliation: {
        rate: reconciliationRate,
        unreconciledCount: transactions.filter(t => t.reconciliationStatus !== 'fully_reconciled').length
      },
      insights: this.generateFinancialInsights(revenue, expenses, profit, transactions)
    };
  }

  // Private Helper Methods
  private async generateInvoiceNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const tenantInvoices = Array.from(this.invoices.values())
      .filter(inv => inv.tenantId === tenantId && inv.invoiceNumber.startsWith(year.toString()));

    const nextNumber = (tenantInvoices.length + 1).toString().padStart(4, '0');
    return `${year}${nextNumber}`;
  }

  private calculateInvoiceTotals(invoice: Invoice): void {
    let subtotal = 0;
    let taxAmount = 0;

    invoice.lineItems.forEach(item => {
      const lineTotal = (item.quantity * item.unitPrice) - item.discount;
      subtotal += lineTotal;
      taxAmount += item.taxAmount;
    });

    invoice.subtotal = subtotal;
    invoice.taxAmount = taxAmount;
    invoice.totalAmount = subtotal + taxAmount - invoice.discountAmount;
  }

  private generateProfitLossSections(transactions: FinancialTransaction[]): ReportSection[] {
    const revenueTransactions = transactions.filter(t => t.category === 'revenue');
    const expenseTransactions = transactions.filter(t => t.category === 'expense');

    return [
      {
        name: 'Revenue',
        type: 'revenue',
        items: this.groupTransactionsBySubcategory(revenueTransactions),
        subtotal: revenueTransactions.reduce((sum, t) => sum + t.amount, 0)
      },
      {
        name: 'Expenses',
        type: 'expense',
        items: this.groupTransactionsBySubcategory(expenseTransactions),
        subtotal: expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      }
    ];
  }

  private generateBalanceSheetSections(transactions: FinancialTransaction[]): ReportSection[] {
    // Simplified balance sheet - in production, this would track assets, liabilities, equity properly
    return [
      {
        name: 'Assets',
        type: 'asset',
        items: [],
        subtotal: 0
      },
      {
        name: 'Liabilities',
        type: 'liability',
        items: [],
        subtotal: 0
      },
      {
        name: 'Equity',
        type: 'equity',
        items: [],
        subtotal: 0
      }
    ];
  }

  private generateCashFlowSections(transactions: FinancialTransaction[]): ReportSection[] {
    const operatingCashFlow = transactions.filter(t =>
      t.category === 'revenue' || t.category === 'expense'
    );

    const investingCashFlow = transactions.filter(t =>
      t.subcategory?.includes('investment') || t.subcategory?.includes('asset')
    );

    const financingCashFlow = transactions.filter(t =>
      t.subcategory?.includes('loan') || t.subcategory?.includes('equity')
    );

    return [
      {
        name: 'Operating Activities',
        type: 'revenue',
        items: this.groupTransactionsBySubcategory(operatingCashFlow),
        subtotal: operatingCashFlow.reduce((sum, t) => sum + t.amount, 0)
      },
      {
        name: 'Investing Activities',
        type: 'asset',
        items: this.groupTransactionsBySubcategory(investingCashFlow),
        subtotal: investingCashFlow.reduce((sum, t) => sum + t.amount, 0)
      },
      {
        name: 'Financing Activities',
        type: 'liability',
        items: this.groupTransactionsBySubcategory(financingCashFlow),
        subtotal: financingCashFlow.reduce((sum, t) => sum + t.amount, 0)
      }
    ];
  }

  private calculateReportTotals(report: FinancialReport): void {
    report.totals.revenue = report.sections
      .filter(s => s.type === 'revenue')
      .reduce((sum, s) => sum + s.subtotal, 0);

    report.totals.expenses = report.sections
      .filter(s => s.type === 'expense')
      .reduce((sum, s) => sum + s.subtotal, 0);

    report.totals.profit = report.totals.revenue - report.totals.expenses;
  }

  private groupTransactionsBySubcategory(transactions: FinancialTransaction[]): ReportItem[] {
    const grouped = transactions.reduce((acc, transaction) => {
      const key = transaction.subcategory || 'Other';
      if (!acc[key]) {
        acc[key] = { amount: 0, count: 0 };
      }
      acc[key].amount += transaction.amount;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return Object.entries(grouped).map(([name, data]) => ({
      name,
      amount: data.amount,
      percentage: totalAmount > 0 ? (Math.abs(data.amount) / totalAmount) * 100 : 0,
      category: name,
      transactions: data.count
    }));
  }

  private getTopCategories(transactions: FinancialTransaction[], limit: number): any[] {
    const grouped = transactions.reduce((acc, transaction) => {
      const key = transaction.subcategory || 'Other';
      acc[key] = (acc[key] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([category, amount]) => ({ category, amount }));
  }

  private groupTransactionsByMonth(transactions: FinancialTransaction[]): Record<string, number> {
    return transactions.reduce((acc, transaction) => {
      const monthKey = transaction.transactionDate.toISOString().substring(0, 7); // YYYY-MM
      acc[monthKey] = (acc[monthKey] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupTransactionsByCategory(transactions: FinancialTransaction[]): Record<string, number> {
    return transactions.reduce((acc, transaction) => {
      const category = transaction.subcategory || 'Other';
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateCashFlow(transactions: FinancialTransaction[]): any {
    const inflows = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const outflows = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      netCashFlow: inflows - outflows,
      operatingCashFlow: inflows * 0.7, // Simplified
      investingCashFlow: inflows * 0.2,
      financingCashFlow: inflows * 0.1
    };
  }

  private calculateReconciliationRate(transactions: FinancialTransaction[]): number {
    const reconciled = transactions.filter(t => t.reconciliationStatus === 'fully_reconciled').length;
    return transactions.length > 0 ? (reconciled / transactions.length) * 100 : 0;
  }

  private generateFinancialInsights(revenue: number, expenses: number, profit: number, transactions: FinancialTransaction[]): string[] {
    const insights: string[] = [];

    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    if (profitMargin > 20) {
      insights.push('Excellent profit margin - consider expanding operations');
    } else if (profitMargin < 10) {
      insights.push('Profit margin below industry average - review pricing strategy');
    }

    const expenseRatio = expenses / revenue;
    if (expenseRatio > 0.8) {
      insights.push('High expense ratio - focus on cost optimization');
    }

    const unreconciledCount = transactions.filter(t => t.reconciliationStatus !== 'fully_reconciled').length;
    if (unreconciledCount > transactions.length * 0.1) {
      insights.push('High number of unreconciled transactions - improve reconciliation processes');
    }

    return insights;
  }

  private initializeDefaultData(): void {
    // Initialize default tax calculations for South Africa
    this.createTaxCalculation({
      tenantId: 'default',
      jurisdiction: 'South Africa',
      taxType: 'vat',
      taxRate: 15,
      effectiveFrom: new Date('2020-01-01'),
      category: 'standard',
      isActive: true
    });

    // Initialize default currency exchange rates
    this.updateExchangeRate('USD', 'ZAR', 18.5, 'manual');
    this.updateExchangeRate('EUR', 'ZAR', 20.2, 'manual');
    this.updateExchangeRate('GBP', 'ZAR', 23.1, 'manual');
  }
}

export const financialReconciliationEngine = new FinancialReconciliationEngine();