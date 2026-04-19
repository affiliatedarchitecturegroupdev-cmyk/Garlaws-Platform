import { NextRequest, NextResponse } from 'next/server';
import { subscriptionManagementEngine } from '@/lib/subscription-management-engine';
import { Invoice, Subscription, PaymentMethod } from '@/lib/subscription-management-engine';

// In-memory storage for demo purposes
const paymentMethods: Map<string, PaymentMethod> = new Map();
const transactions: Map<string, any> = new Map();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tenantId = searchParams.get('tenantId');
    const subscriptionId = searchParams.get('subscriptionId');

    switch (action) {
      case 'invoices':
        if (!tenantId) {
          return NextResponse.json(
            { error: 'tenantId parameter required' },
            { status: 400 }
          );
        }
        const invoices = await getTenantInvoices(tenantId);
        return NextResponse.json({
          success: true,
          data: invoices
        });

      case 'invoice':
        const invoiceId = searchParams.get('invoiceId');
        if (!invoiceId) {
          return NextResponse.json(
            { error: 'invoiceId parameter required' },
            { status: 400 }
          );
        }
        const invoice = await getInvoice(invoiceId);
        return NextResponse.json({
          success: true,
          data: invoice
        });

      case 'payment_methods':
        if (!tenantId) {
          return NextResponse.json(
            { error: 'tenantId parameter required' },
            { status: 400 }
          );
        }
        const methods = getTenantPaymentMethods(tenantId);
        return NextResponse.json({
          success: true,
          data: methods
        });

      case 'billing_history':
        if (!tenantId) {
          return NextResponse.json(
            { error: 'tenantId parameter required' },
            { status: 400 }
          );
        }
        const history = await getBillingHistory(tenantId);
        return NextResponse.json({
          success: true,
          data: history
        });

      case 'upcoming_invoice':
        if (!subscriptionId) {
          return NextResponse.json(
            { error: 'subscriptionId parameter required' },
            { status: 400 }
          );
        }
        const upcoming = await generateUpcomingInvoice(subscriptionId);
        return NextResponse.json({
          success: true,
          data: upcoming
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: invoices, invoice, payment_methods, billing_history, or upcoming_invoice' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching billing data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing data' },
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
      case 'create_invoice':
        if (!body.subscriptionId) {
          return NextResponse.json(
            { error: 'subscriptionId is required' },
            { status: 400 }
          );
        }

        const invoice = await subscriptionManagementEngine.generateInvoice(
          body.subscriptionId,
          body.billingPeriod || getCurrentBillingPeriod()
        );
        return NextResponse.json({
          success: true,
          data: invoice
        }, { status: 201 });

      case 'process_payment':
        if (!body.invoiceId || !body.paymentMethodId) {
          return NextResponse.json(
            { error: 'invoiceId and paymentMethodId are required' },
            { status: 400 }
          );
        }

        const paymentMethod = paymentMethods.get(body.paymentMethodId);
        if (!paymentMethod) {
          return NextResponse.json(
            { error: 'Payment method not found' },
            { status: 404 }
          );
        }

        const paymentSuccess = await subscriptionManagementEngine.processPayment(body.invoiceId, paymentMethod);

        if (paymentSuccess) {
          // Record transaction
          const transaction = {
            id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            invoiceId: body.invoiceId,
            amount: 0, // Would get from invoice
            currency: 'USD',
            status: 'completed',
            paymentMethod: paymentMethod.type,
            processedAt: new Date()
          };
          transactions.set(transaction.id, transaction);
        }

        return NextResponse.json({
          success: paymentSuccess,
          message: paymentSuccess ? 'Payment processed successfully' : 'Payment failed'
        });

      case 'add_payment_method':
        if (!body.tenantId || !body.paymentMethod) {
          return NextResponse.json(
            { error: 'tenantId and paymentMethod are required' },
            { status: 400 }
          );
        }

        const newPaymentMethod = await addPaymentMethod(body.tenantId, body.paymentMethod);
        return NextResponse.json({
          success: true,
          data: newPaymentMethod
        }, { status: 201 });

      case 'retry_payment':
        if (!body.invoiceId) {
          return NextResponse.json(
            { error: 'invoiceId is required' },
            { status: 400 }
          );
        }

        const retrySuccess = await retryFailedPayment(body.invoiceId);
        return NextResponse.json({
          success: retrySuccess,
          message: retrySuccess ? 'Payment retry initiated' : 'Payment retry failed'
        });

      case 'apply_coupon':
        if (!body.subscriptionId || !body.couponCode) {
          return NextResponse.json(
            { error: 'subscriptionId and couponCode are required' },
            { status: 400 }
          );
        }

        const discountApplied = await applyCoupon(body.subscriptionId, body.couponCode);
        return NextResponse.json({
          success: discountApplied,
          message: discountApplied ? 'Coupon applied successfully' : 'Invalid coupon code'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: create_invoice, process_payment, add_payment_method, retry_payment, or apply_coupon' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing billing operation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to perform billing operation' },
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
      case 'update_payment_method':
        if (!body.paymentMethodId) {
          return NextResponse.json(
            { error: 'paymentMethodId is required' },
            { status: 400 }
          );
        }

        const updatedMethod = await updatePaymentMethod(body.paymentMethodId, body.updates);
        return NextResponse.json({
          success: true,
          data: updatedMethod
        });

      case 'set_default_payment_method':
        if (!body.tenantId || !body.paymentMethodId) {
          return NextResponse.json(
            { error: 'tenantId and paymentMethodId are required' },
            { status: 400 }
          );
        }

        const defaultSet = await setDefaultPaymentMethod(body.tenantId, body.paymentMethodId);
        return NextResponse.json({
          success: defaultSet,
          message: defaultSet ? 'Default payment method updated' : 'Failed to update default payment method'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: update_payment_method or set_default_payment_method' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating billing data:', error);
    return NextResponse.json(
      { error: 'Failed to update billing data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const paymentMethodId = searchParams.get('paymentMethodId');

    switch (action) {
      case 'remove_payment_method':
        if (!paymentMethodId) {
          return NextResponse.json(
            { error: 'paymentMethodId parameter required' },
            { status: 400 }
          );
        }

        const removed = paymentMethods.delete(paymentMethodId);
        return NextResponse.json({
          success: removed,
          message: removed ? 'Payment method removed' : 'Payment method not found'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: remove_payment_method' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error deleting billing data:', error);
    return NextResponse.json(
      { error: 'Failed to delete billing data' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getTenantInvoices(tenantId: string): Promise<Invoice[]> {
  // In production, this would query the database
  // For demo, return mock data
  return [];
}

async function getInvoice(invoiceId: string): Promise<Invoice | null> {
  // Mock implementation
  return null;
}

function getTenantPaymentMethods(tenantId: string): PaymentMethod[] {
  return Array.from(paymentMethods.values()).filter(pm => pm.isDefault); // Simplified
}

async function getBillingHistory(tenantId: string): Promise<any[]> {
  // Mock billing history
  return [
    {
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      amount: 149,
      status: 'paid',
      description: 'Professional Plan - Monthly'
    },
    {
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      amount: 149,
      status: 'paid',
      description: 'Professional Plan - Monthly'
    }
  ];
}

async function generateUpcomingInvoice(subscriptionId: string): Promise<Invoice | null> {
  const subscription = subscriptionManagementEngine.getSubscription(subscriptionId);
  if (!subscription) return null;

  const nextBillingDate = new Date(subscription.currentPeriodEnd);
  nextBillingDate.setDate(nextBillingDate.getDate() + 1);

  return await subscriptionManagementEngine.generateInvoice(subscriptionId, {
    start: nextBillingDate,
    end: new Date(nextBillingDate.getTime() + 30 * 24 * 60 * 60 * 1000)
  });
}

function getCurrentBillingPeriod(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return { start, end };
}

async function addPaymentMethod(tenantId: string, paymentMethodData: any): Promise<PaymentMethod> {
  const paymentMethod: PaymentMethod = {
    id: `pm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: paymentMethodData.type || 'card',
    last4: paymentMethodData.last4,
    brand: paymentMethodData.brand,
    expiryMonth: paymentMethodData.expiryMonth,
    expiryYear: paymentMethodData.expiryYear,
    isDefault: paymentMethodData.isDefault || false
  };

  paymentMethods.set(paymentMethod.id, paymentMethod);
  return paymentMethod;
}

async function updatePaymentMethod(paymentMethodId: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod | null> {
  const method = paymentMethods.get(paymentMethodId);
  if (!method) return null;

  const updatedMethod = { ...method, ...updates };
  paymentMethods.set(paymentMethodId, updatedMethod);
  return updatedMethod;
}

async function setDefaultPaymentMethod(tenantId: string, paymentMethodId: string): Promise<boolean> {
  // Set all methods for tenant to non-default, then set the specified one as default
  const allMethods = Array.from(paymentMethods.values());
  allMethods.forEach(method => {
    method.isDefault = method.id === paymentMethodId;
  });

  return true;
}

async function retryFailedPayment(invoiceId: string): Promise<boolean> {
  // Mock payment retry logic
  const success = Math.random() > 0.3; // 70% success rate for retries

  if (success) {
    // Update invoice status
    console.log(`Payment retry successful for invoice ${invoiceId}`);
  }

  return success;
}

async function applyCoupon(subscriptionId: string, couponCode: string): Promise<boolean> {
  // Mock coupon validation
  const validCoupons = ['SAVE20', 'WELCOME10', 'ENTERPRISE50'];

  if (validCoupons.includes(couponCode)) {
    // Apply discount to subscription
    const subscription = subscriptionManagementEngine.getSubscription(subscriptionId);
    if (subscription) {
      subscription.metadata.couponCode = couponCode;
      subscription.updatedAt = new Date();
    }
    return true;
  }

  return false;
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
      case 'subscription.updated':
        await handleSubscriptionUpdated(body.data);
        break;
      default:
        console.log('Unhandled webhook type:', body.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(data: any): Promise<void> {
  // Update invoice status to paid
  console.log('Payment succeeded:', data);
}

async function handlePaymentFailed(data: any): Promise<void> {
  // Handle failed payment, send notifications, etc.
  console.log('Payment failed:', data);
}

async function handleSubscriptionUpdated(data: any): Promise<void> {
  // Handle subscription changes from payment provider
  console.log('Subscription updated:', data);
}