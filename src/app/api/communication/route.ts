import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, support_tickets, ticket_messages } from "@/db/schema";
import { AuthMiddleware, AuthenticatedRequest } from "@/lib/auth-middleware";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const type = searchParams.get('type'); // 'reviews' or 'tickets'

      if (type === 'reviews') {
        const userReviews = await db
          .select()
          .from(reviews)
          .where(eq(reviews.reviewerId, req.user!.userId))
          .orderBy(desc(reviews.createdAt));

        return NextResponse.json(userReviews);
      } else if (type === 'tickets') {
        const userTickets = await db
          .select()
          .from(support_tickets)
          .where(eq(support_tickets.userId, req.user!.userId))
          .orderBy(desc(support_tickets.createdAt));

        return NextResponse.json(userTickets);
      }

      return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const { type, ...data } = body;

      if (type === 'review') {
        const newReview = await db.insert(reviews).values({
          bookingId: data.bookingId,
          reviewerId: req.user!.userId,
          revieweeId: data.revieweeId,
          rating: data.rating,
          title: data.title,
          comment: data.comment,
          categories: JSON.stringify(data.categories || []),
        }).returning();

        return NextResponse.json(newReview[0], { status: 201 });
      } else if (type === 'ticket') {
        const newTicket = await db.insert(support_tickets).values({
          userId: req.user!.userId,
          bookingId: data.bookingId,
          subject: data.subject,
          description: data.description,
          category: data.category || "general",
          priority: data.priority || "medium",
        }).returning();

        return NextResponse.json(newTicket[0], { status: 201 });
      }

      return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to create item" },
        { status: 500 }
      );
    }
  });
}