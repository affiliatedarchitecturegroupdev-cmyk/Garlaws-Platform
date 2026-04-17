import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversations, conversation_participants, messages, users } from "@/db/schema";
import { AuthMiddleware, AuthenticatedRequest } from "@/lib/auth-middleware";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { id } = await params;
      const conversationId = parseInt(id);

      if (isNaN(conversationId)) {
        return NextResponse.json(
          { error: "Invalid conversation ID" },
          { status: 400 }
        );
      }

      // Check if user is a participant in this conversation
      const participantCheck = await db
        .select()
        .from(conversation_participants)
        .where(and(
          eq(conversation_participants.conversationId, conversationId),
          eq(conversation_participants.userId, req.user!.userId)
        ))
        .limit(1);

      if (participantCheck.length === 0) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }

      // Get conversation details
      const conversation = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

      if (conversation.length === 0) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }

      // Get messages with sender info
      const conversationMessages = await db
        .select({
          message: messages,
          sender: {
            id: users.id,
            name: users.name,
            role: users.role,
          },
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.conversationId, conversationId))
        .orderBy(desc(messages.createdAt));

      return NextResponse.json({
        conversation: conversation[0],
        messages: conversationMessages,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch conversation" },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const conversationId = parseInt((await params).id);
      const body = await request.json();
      const { content, messageType, metadata } = body;

      if (isNaN(conversationId) || !content) {
        return NextResponse.json(
          { error: "Invalid conversation ID or missing content" },
          { status: 400 }
        );
      }

      // Check if user is a participant
      const participantCheck = await db
        .select()
        .from(conversation_participants)
        .where(and(
          eq(conversation_participants.conversationId, conversationId),
          eq(conversation_participants.userId, req.user!.userId)
        ))
        .limit(1);

      if (participantCheck.length === 0) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }

      // Create message
      const newMessage = await db.insert(messages).values({
        conversationId,
        senderId: req.user!.userId,
        content,
        messageType: messageType || "text",
        metadata: metadata ? JSON.stringify(metadata) : null,
      }).returning();

      // Update conversation last updated time
      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));

      return NextResponse.json(newMessage[0], { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }
  });
}