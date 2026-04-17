"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function processPayment(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const amount = formData.get("amount") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const cardNumber = formData.get("cardNumber") as string;
  const expiryDate = formData.get("expiryDate") as string;
  const cvv = formData.get("cvv") as string;

  if (!bookingId || !amount || !paymentMethod) {
    return { error: "Booking ID, amount, and payment method are required" };
  }

  if (paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvv)) {
    return { error: "Card details are required for card payments" };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { error: "Authentication required" };
    }

    // In a real implementation, you would integrate with a payment processor like Stripe
    // For now, we'll simulate payment processing
    const paymentData = {
      bookingId: parseInt(bookingId),
      amount: parseFloat(amount),
      currency: 'ZAR',
      paymentMethod,
      status: 'completed', // In real app, this would come from payment processor
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Payment processing failed" };
    }

    const payment = await response.json();

    // Revalidate relevant pages
    revalidatePath('/payment');
    revalidatePath('/bookings');

    return {
      success: true,
      payment,
      message: "Payment processed successfully"
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}

export async function getPaymentHistory() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { error: "Authentication required" };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/payments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Failed to fetch payment history" };
    }

    const payments = await response.json();

    return {
      success: true,
      payments
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}