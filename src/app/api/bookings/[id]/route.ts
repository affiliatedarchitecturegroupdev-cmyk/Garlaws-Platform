import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const booking = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);

    if (booking.length === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(booking[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      propertyId,
      serviceId,
      customerId,
      providerId,
      scheduledDate,
      status,
      notes,
      totalPrice
    } = body;

    const updatedBooking = await db.update(bookings)
      .set({
        propertyId,
        serviceId,
        customerId,
        providerId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        status,
        notes,
        totalPrice,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (updatedBooking.length === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBooking[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const deletedBooking = await db.delete(bookings)
      .where(eq(bookings.id, bookingId))
      .returning();

    if (deletedBooking.length === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}