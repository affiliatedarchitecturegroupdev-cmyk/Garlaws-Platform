"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getConversations() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { error: "Authentication required" };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/chat/conversations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Failed to fetch conversations" };
    }

    const conversations = await response.json();

    return {
      success: true,
      conversations
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}

export async function getConversationMessages(conversationId: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { error: "Authentication required" };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/chat/conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Failed to fetch messages" };
    }

    const data = await response.json();

    return {
      success: true,
      conversation: data.conversation,
      messages: data.messages
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}

export async function sendMessage(conversationId: number, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { error: "Authentication required" };
    }

    const messageData = {
      content: formData.get("content") as string,
      messageType: formData.get("messageType") as string || "text",
      metadata: formData.get("metadata") ? JSON.parse(formData.get("metadata") as string) : null,
    };

    if (!messageData.content.trim()) {
      return { error: "Message content is required" };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/chat/conversations/${conversationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Failed to send message" };
    }

    const message = await response.json();

    return {
      success: true,
      message
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}

export async function createConversation(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { error: "Authentication required" };
    }

    const conversationData = {
      bookingId: formData.get("bookingId") ? parseInt(formData.get("bookingId") as string) : undefined,
      title: formData.get("title") as string,
      type: formData.get("type") as string || "general",
    };

    if (!conversationData.title) {
      return { error: "Conversation title is required" };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/chat/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(conversationData),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Failed to create conversation" };
    }

    const conversation = await response.json();

    revalidatePath('/dashboard/chat');

    return {
      success: true,
      conversation
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}