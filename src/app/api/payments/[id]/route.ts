import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ [key: string]: string }> }) {
  try {
    const paymentId = parseInt((await params).id);

    if (isNaN(paymentId)) {
      return NextResponse.json(
        { error: "Invalid payment ID" },
        { status: 400 }
      );
    }

    const payment = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);

    if (payment.length === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(payment[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ [key: string]: string }> }) {
  try {
    const paymentId = parseInt((await params).id);

    if (isNaN(paymentId)) {
      return NextResponse.json(
        { error: "Invalid payment ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      bookingId,
      amount,
      currency,
      status,
      paymentMethod,
      transactionId
    } = body;

    const updatedPayment = await db.update(payments)
      .set({
        bookingId,
        amount,
        currency,
        status,
        paymentMethod,
        transactionId,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId))
      .returning();

    if (updatedPayment.length === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPayment[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ [key: string]: string }> }) {
  try {
    const paymentId = parseInt((await params).id);

    if (isNaN(paymentId)) {
      return NextResponse.json(
        { error: "Invalid payment ID" },
        { status: 400 }
      );
    }

    const deletedPayment = await db.delete(payments)
      .where(eq(payments.id, paymentId))
      .returning();

    if (deletedPayment.length === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Payment deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    );
  }
}