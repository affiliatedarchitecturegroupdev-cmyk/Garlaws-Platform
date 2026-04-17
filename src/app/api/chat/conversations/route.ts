import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversations, conversation_participants, messages } from "@/db/schema";
import { AuthMiddleware, AuthenticatedRequest } from "@/lib/auth-middleware";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Get conversations for the authenticated user
      const userConversations = await db
        .select({
          conversation: conversations,
          participant: conversation_participants,
        })
        .from(conversation_participants)
        .innerJoin(conversations, eq(conversation_participants.conversationId, conversations.id))
        .where(and(
          eq(conversation_participants.userId, req.user!.userId),
          eq(conversations.isActive, true)
        ))
        .orderBy(desc(conversations.updatedAt));

      return NextResponse.json(userConversations);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch conversations" },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const { bookingId, title, type } = body;

      if (!title) {
        return NextResponse.json(
          { error: "Title is required" },
          { status: 400 }
        );
      }

      // Create conversation
      const newConversation = await db.insert(conversations).values({
        bookingId,
        type: type || "general",
        title,
      }).returning();

      // Add creator as participant
      await db.insert(conversation_participants).values({
        conversationId: newConversation[0].id,
        userId: req.user!.userId,
        role: req.user!.role === "service_provider" ? "provider" : "customer",
      });

      return NextResponse.json(newConversation[0], { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to create conversation" },
        { status: 500 }
      );
    }
  });
}