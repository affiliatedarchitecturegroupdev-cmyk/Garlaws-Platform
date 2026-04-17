import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const status = searchParams.get('status');

    let whereClause = undefined;

    if (bookingId) {
      whereClause = eq(payments.bookingId, parseInt(bookingId));
    } else if (status) {
      whereClause = eq(payments.status, status as any);
    }

    const allPayments = whereClause
      ? await db.select().from(payments).where(whereClause)
      : await db.select().from(payments);

    return NextResponse.json(allPayments);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingId,
      amount,
      currency,
      status,
      paymentMethod,
      transactionId
    } = body;

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: "Booking ID and amount are required" },
        { status: 400 }
      );
    }

    const newPayment = await db.insert(payments).values({
      bookingId,
      amount,
      currency: currency || "ZAR",
      status: status || "pending",
      paymentMethod,
      transactionId,
    }).returning();

    return NextResponse.json(newPayment[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}