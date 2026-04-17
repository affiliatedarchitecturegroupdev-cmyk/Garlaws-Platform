import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { AuthMiddleware, AuthenticatedRequest } from "@/lib/auth-middleware";
import { eq, and, desc, lt } from "drizzle-orm";

export async function GET(request: NextRequest) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const unreadOnly = searchParams.get('unread') === 'true';
      const limit = parseInt(searchParams.get('limit') || '50');

      let whereClause: any = eq(notifications.userId, req.user!.userId);

      if (unreadOnly) {
        whereClause = and(whereClause, eq(notifications.read, false));
      }

      // Clean up expired notifications
      await db.delete(notifications).where(
        and(
          eq(notifications.userId, req.user!.userId),
          lt(notifications.expiresAt, new Date())
        )
      );

      const userNotifications = await db
        .select()
        .from(notifications)
        .where(whereClause)
        .orderBy(desc(notifications.createdAt))
        .limit(limit);

      return NextResponse.json(userNotifications);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const { type, title, message, data, priority, expiresAt } = body;

      if (!type || !title || !message) {
        return NextResponse.json(
          { error: "Type, title, and message are required" },
          { status: 400 }
        );
      }

      // In a real app, you might want to restrict who can create notifications
      // For now, allowing authenticated users to create their own notifications
      const newNotification = await db.insert(notifications).values({
        userId: req.user!.userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
        priority: priority || "medium",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }).returning();

      return NextResponse.json(newNotification[0], { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      );
    }
  });
}