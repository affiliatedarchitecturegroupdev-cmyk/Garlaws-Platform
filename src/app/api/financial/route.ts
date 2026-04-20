import { NextRequest, NextResponse } from 'next/server';
import { financialReconciliationEngine, FinancialTransaction, Invoice, BankAccount, BankTransaction } from '@/lib/financial-reconciliation-engine';

// In-memory storage for demo purposes
const transactions: FinancialTransaction[] = [];
const budgets: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tenantId = searchParams.get('tenantId');

    switch (action) {
      case 'transactions':
        if (!tenantId) {
          return NextResponse.json(
            { error: 'tenantId parameter required' },
            { status: 400 }
          );
        }
        const transactions = financialReconciliationEngine.getTransactions(tenantId);
        return NextResponse.json({
          success: true,
          data: transactions
        });

      case 'invoices':
        if (!tenantId) {
          return NextResponse.json(
            { error: 'tenantId parameter required' },
            { status: 400 }
          );
        }
        const invoices = financialReconciliationEngine.getInvoices(tenantId);
        return NextResponse.json({
          success: true,
          data: invoices
        });

      case 'bank_accounts':
        if (!tenantId) {
          return NextResponse.json(
            { error: 'tenantId parameter required' },
            { status: 400 }
          );
        }
        const accounts = financialReconciliationEngine.getBankAccounts(tenantId);
        return NextResponse.json({
          success: true,
          data: accounts
        });

      case 'analytics':
        if (!tenantId) {
          return NextResponse.json(
            { error: 'tenantId parameter required' },
            { status: 400 }
          );
        }
        const timeframe = searchParams.get('timeframe') || 'month';
        const analytics = financialReconciliationEngine.getFinancialAnalytics(tenantId, timeframe as any);
        return NextResponse.json({
          success: true,
          data: analytics
        });

      case 'exchange_rate':
        const fromCurrency = searchParams.get('from');
        const toCurrency = searchParams.get('to');
        if (!fromCurrency || !toCurrency) {
          return NextResponse.json(
            { error: 'from and to currency parameters required' },
            { status: 400 }
          );
        }
        const rate = financialReconciliationEngine.getExchangeRate(fromCurrency, toCurrency);
        return NextResponse.json({
          success: true,
          data: rate
        });

      case 'budgets':
        if (!tenantId) {
          return NextResponse.json(
            { error: 'tenantId parameter required' },
            { status: 400 }
          );
        }
        const tenantBudgets = budgets.filter(b => b.tenantId === tenantId);
        return NextResponse.json({
          success: true,
          data: tenantBudgets
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: transactions, invoices, bank_accounts, analytics, or exchange_rate' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching financial data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'create_transaction':
        const transaction = await financialReconciliationEngine.createTransaction(body);
        transactions.push(transaction);
        return NextResponse.json({
          success: true,
          data: transaction
        }, { status: 201 });

      case 'create_invoice':
        const invoice = await financialReconciliationEngine.createInvoice(body);
        return NextResponse.json({
          success: true,
          data: invoice
        }, { status: 201 });

      case 'create_bank_account':
        const account = await financialReconciliationEngine.createBankAccount(body);
        return NextResponse.json({
          success: true,
          data: account
        }, { status: 201 });

      case 'sync_bank_transactions':
        if (!body.accountId) {
          return NextResponse.json(
            { error: 'accountId is required' },
            { status: 400 }
          );
        }

        const syncedTransactions = await financialReconciliationEngine.syncBankTransactions(body.accountId);
        return NextResponse.json({
          success: true,
          data: syncedTransactions
        });

      case 'reconcile_transaction':
        if (!body.transactionId || !body.bankTransactionId) {
          return NextResponse.json(
            { error: 'transactionId and bankTransactionId are required' },
            { status: 400 }
          );
        }

        const reconciled = await financialReconciliationEngine.reconcileTransaction(
          body.transactionId,
          body.bankTransactionId,
          body.reconciliationType
        );
        return NextResponse.json({
          success: reconciled,
          message: reconciled ? 'Transaction reconciled successfully' : 'Reconciliation failed'
        });

      case 'generate_report':
        if (!body.tenantId || !body.reportType || !body.startDate || !body.endDate) {
          return NextResponse.json(
            { error: 'tenantId, reportType, startDate, and endDate are required' },
            { status: 400 }
          );
        }

        const report = await financialReconciliationEngine.generateFinancialReport(
          body.tenantId,
          body.reportType,
          new Date(body.startDate),
          new Date(body.endDate),
          body.currency
        );
        return NextResponse.json({
          success: true,
          data: report
        });

      case 'update_exchange_rate':
        if (!body.fromCurrency || !body.toCurrency || body.rate === undefined) {
          return NextResponse.json(
            { error: 'fromCurrency, toCurrency, and rate are required' },
            { status: 400 }
          );
        }

        const exchange = await financialReconciliationEngine.updateExchangeRate(
          body.fromCurrency,
          body.toCurrency,
          body.rate,
          body.source
        );
        return NextResponse.json({
          success: true,
          data: exchange
        });

      case 'convert_currency':
        if (body.amount === undefined || !body.fromCurrency || !body.toCurrency) {
          return NextResponse.json(
            { error: 'amount, fromCurrency, and toCurrency are required' },
            { status: 400 }
          );
        }

        const convertedAmount = financialReconciliationEngine.convertCurrency(
          body.amount,
          body.fromCurrency,
          body.toCurrency
        );
        return NextResponse.json({
          success: true,
          data: {
            originalAmount: body.amount,
            convertedAmount,
            fromCurrency: body.fromCurrency,
            toCurrency: body.toCurrency,
            exchangeRate: financialReconciliationEngine.getExchangeRate(body.fromCurrency, body.toCurrency)?.rate
          }
        });

      case 'calculate_tax':
        if (body.amount === undefined || !body.taxCategory || !body.jurisdiction) {
          return NextResponse.json(
            { error: 'amount, taxCategory, and jurisdiction are required' },
            { status: 400 }
          );
        }

        const taxAmount = financialReconciliationEngine.calculateTax(
          body.amount,
          body.taxCategory,
          body.jurisdiction
        );
        return NextResponse.json({
          success: true,
          data: {
            originalAmount: body.amount,
            taxAmount,
            totalAmount: body.amount + taxAmount,
            taxCategory: body.taxCategory,
            jurisdiction: body.jurisdiction,
            taxRate: financialReconciliationEngine.getTaxCalculations(undefined, body.jurisdiction)
              .find(calc => calc.category === body.taxCategory)?.taxRate || 0
          }
        });

      case 'create-budget':
        if (!body.tenantId || !body.name || !body.period || body.year === undefined) {
          return NextResponse.json(
            { error: 'tenantId, name, period, and year are required' },
            { status: 400 }
          );
        }

        const newBudget = {
          id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tenantId: body.tenantId,
          name: body.name,
          period: body.period,
          year: body.year,
          categories: body.categories || [],
          totalBudget: 0,
          totalActual: 0,
          totalVariance: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Calculate totals
        newBudget.totalBudget = newBudget.categories.reduce((sum: number, cat: any) => sum + (cat.budgetedAmount || 0), 0);
        newBudget.totalActual = newBudget.categories.reduce((sum: number, cat: any) => sum + (cat.actualAmount || 0), 0);
        newBudget.totalVariance = newBudget.totalBudget - newBudget.totalActual;

        budgets.push(newBudget);
        return NextResponse.json({
          success: true,
          data: newBudget
        }, { status: 201 });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: create_transaction, create_invoice, create_bank_account, sync_bank_transactions, reconcile_transaction, generate_report, update_exchange_rate, convert_currency, or calculate_tax' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing financial operation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to perform financial operation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'update_invoice':
        if (!body.invoiceId) {
          return NextResponse.json(
            { error: 'invoiceId is required' },
            { status: 400 }
          );
        }

        const updatedInvoice = await financialReconciliationEngine.updateInvoice(body.invoiceId, body.updates);
        if (!updatedInvoice) {
          return NextResponse.json(
            { error: 'Invoice not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: updatedInvoice
        });

      case 'mark_invoice_paid':
        if (!body.invoiceId || !body.paymentTransactionId) {
          return NextResponse.json(
            { error: 'invoiceId and paymentTransactionId are required' },
            { status: 400 }
          );
        }

        const markedPaid = await financialReconciliationEngine.markInvoiceAsPaid(body.invoiceId, body.paymentTransactionId);
        return NextResponse.json({
          success: markedPaid,
          message: markedPaid ? 'Invoice marked as paid' : 'Failed to mark invoice as paid'
        });

      case 'update-budget-category':
        if (!body.tenantId || !body.budgetId || !body.categoryId || body.budgetedAmount === undefined) {
          return NextResponse.json(
            { error: 'tenantId, budgetId, categoryId, and budgetedAmount are required' },
            { status: 400 }
          );
        }

        const budget = budgets.find(b => b.id === body.budgetId && b.tenantId === body.tenantId);
        if (!budget) {
          return NextResponse.json(
            { error: 'Budget not found' },
            { status: 404 }
          );
        }

        const category = budget.categories.find((c: any) => c.id === body.categoryId);
        if (!category) {
          return NextResponse.json(
            { error: 'Category not found' },
            { status: 404 }
          );
        }

        category.budgetedAmount = body.budgetedAmount;
        category.variance = category.budgetedAmount - category.actualAmount;
        category.variancePercent = category.budgetedAmount !== 0 ? (category.variance / category.budgetedAmount) * 100 : 0;

        // Recalculate budget totals
        budget.totalBudget = budget.categories.reduce((sum: number, cat: any) => sum + (cat.budgetedAmount || 0), 0);
        budget.totalActual = budget.categories.reduce((sum: number, cat: any) => sum + (cat.actualAmount || 0), 0);
        budget.totalVariance = budget.totalBudget - budget.totalActual;
        budget.updatedAt = new Date().toISOString();

        return NextResponse.json({
          success: true,
          data: budget
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: update_invoice or mark_invoice_paid' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating financial data:', error);
    return NextResponse.json(
      { error: 'Failed to update financial data' },
      { status: 500 }
    );
  }
}

// Webhook handler for payment provider callbacks
export async function POST_WEBHOOK(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle payment provider webhooks (Stripe, PayPal, etc.)
    switch (body.type) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(body.data);
        break;
      case 'payment.failed':
        await handlePaymentFailed(body.data);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(body.data);
        break;
      case 'bank_account.updated':
        await handleBankAccountUpdated(body.data);
        break;
      default:
        console.log('Unhandled financial webhook type:', body.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Financial webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(data: any): Promise<void> {
  // Update transaction status and trigger reconciliation
  console.log('Payment succeeded:', data);

  // Find related invoice and mark as paid
  const invoiceId = data.metadata?.invoiceId;
  if (invoiceId) {
    await financialReconciliationEngine.markInvoiceAsPaid(invoiceId, data.id);
  }
}

async function handlePaymentFailed(data: any): Promise<void> {
  // Handle failed payment, update transaction status
  console.log('Payment failed:', data);
}

async function handleInvoicePaymentSucceeded(data: any): Promise<void> {
  // Handle invoice payment success
  console.log('Invoice payment succeeded:', data);
}

async function handleBankAccountUpdated(data: any): Promise<void> {
  // Handle bank account updates from banking APIs
  console.log('Bank account updated:', data);
}

// Bulk operations for reconciliation
export async function POST_BULK_RECONCILE(request: NextRequest) {
  try {
    const { tenantId, reconciliationRules } = await request.json();

    if (!tenantId || !reconciliationRules) {
      return NextResponse.json(
        { error: 'tenantId and reconciliationRules are required' },
        { status: 400 }
      );
    }

    const results = [];

    for (const rule of reconciliationRules) {
      try {
        const reconciled = await financialReconciliationEngine.reconcileTransaction(
          rule.transactionId,
          rule.bankTransactionId,
          'auto'
        );
        results.push({
          transactionId: rule.transactionId,
          bankTransactionId: rule.bankTransactionId,
          success: reconciled
        });
      } catch (error) {
        results.push({
          transactionId: rule.transactionId,
          bankTransactionId: rule.bankTransactionId,
          success: false,
          error: error instanceof Error ? error.message : 'Reconciliation failed'
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      data: {
        total: results.length,
        successful,
        failed,
        results
      }
    });
  } catch (error) {
    console.error('Bulk reconciliation error:', error);
    return NextResponse.json(
      { error: 'Bulk reconciliation failed' },
      { status: 500 }
    );
  }
}

// Financial reporting and compliance exports
export async function GET_EXPORT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const format = searchParams.get('format') || 'json';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!tenantId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'tenantId, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    const transactions = financialReconciliationEngine.getTransactions(tenantId, {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    const invoices = financialReconciliationEngine.getInvoices(tenantId);
    const bankAccounts = financialReconciliationEngine.getBankAccounts(tenantId);

    const exportData = {
      tenantId,
      period: { startDate, endDate },
      exportedAt: new Date(),
      transactions,
      invoices,
      bankAccounts,
      summary: {
        totalTransactions: transactions.length,
        totalInvoices: invoices.length,
        totalBankAccounts: bankAccounts.length,
        totalRevenue: transactions
          .filter(t => t.category === 'revenue')
          .reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: transactions
          .filter(t => t.category === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      }
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvContent = convertToCSV(exportData);
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="financial-export-${tenantId}-${startDate}-to-${endDate}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

function convertToCSV(data: any): string {
  // Simple CSV conversion - in production, use a proper CSV library
  const headers = ['Date', 'Description', 'Amount', 'Category', 'Status'];
  const rows = data.transactions.map((t: FinancialTransaction) => [
    t.transactionDate.toISOString().split('T')[0],
    t.description,
    t.amount,
    t.category,
    t.status
  ]);

  const csvContent = [headers, ...rows]
    .map((row: any[]) => row.map((field: any) => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}