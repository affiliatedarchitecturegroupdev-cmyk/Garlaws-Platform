import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { AuthMiddleware, AuthenticatedRequest } from "@/lib/auth-middleware";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const notificationId = parseInt(params.id);
      const body = await request.json();
      const { read } = body;

      if (isNaN(notificationId)) {
        return NextResponse.json(
          { error: "Invalid notification ID" },
          { status: 400 }
        );
      }

      const updatedNotification = await db
        .update(notifications)
        .set({ read: read === true })
        .where(and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, req.user!.userId)
        ))
        .returning();

      if (updatedNotification.length === 0) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedNotification[0]);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to update notification" },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const notificationId = parseInt(params.id);

      if (isNaN(notificationId)) {
        return NextResponse.json(
          { error: "Invalid notification ID" },
          { status: 400 }
        );
      }

      const deletedNotification = await db
        .delete(notifications)
        .where(and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, req.user!.userId)
        ))
        .returning();

      if (deletedNotification.length === 0) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: "Notification deleted" });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to delete notification" },
        { status: 500 }
      );
    }
  });
}