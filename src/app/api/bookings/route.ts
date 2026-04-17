import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { AuthMiddleware, AuthenticatedRequest } from "@/lib/auth-middleware";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const customerId = searchParams.get('customerId');
      const providerId = searchParams.get('providerId');
      const status = searchParams.get('status');

      let whereClause = undefined;

      // If user is not admin, only show their own bookings
      if (req.user!.role !== 'admin') {
        if (req.user!.role === 'service_provider') {
          whereClause = eq(bookings.providerId, req.user!.userId);
        } else {
          whereClause = eq(bookings.customerId, req.user!.userId);
        }
      } else {
        // Admin can filter by customer or provider
        if (customerId) {
          whereClause = eq(bookings.customerId, parseInt(customerId));
        } else if (providerId) {
          whereClause = eq(bookings.providerId, parseInt(providerId));
        } else if (status) {
          whereClause = eq(bookings.status, status as any);
        }
      }

      const allBookings = whereClause
        ? await db.select().from(bookings).where(whereClause)
        : await db.select().from(bookings);

      return NextResponse.json(allBookings);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  try {
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

    if (!propertyId || !serviceId || !customerId || !scheduledDate) {
      return NextResponse.json(
        { error: "Property ID, service ID, customer ID, and scheduled date are required" },
        { status: 400 }
      );
    }

    const newBooking = await db.insert(bookings).values({
      propertyId,
      serviceId,
      customerId,
      providerId,
      scheduledDate: new Date(scheduledDate),
      status: status || "pending",
      notes,
      totalPrice,
    }).returning();

    return NextResponse.json(newBooking[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}