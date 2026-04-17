"use client";

import { useState, useEffect, useRef } from "react";
import { getConversationMessages, sendMessage } from "@/lib/server-actions/chat";

interface Message {
  message: {
    id: number;
    content: string;
    messageType: string;
    createdAt: string;
    readAt?: string;
  };
  sender: {
    id: number;
    name: string;
    role: string;
  };
}

interface ChatWindowProps {
  conversationId: number;
  title?: string;
  className?: string;
}

export function ChatWindow({ conversationId, title, className = "" }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const result = await getConversationMessages(conversationId);
      if (result.success) {
        setMessages(result.messages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized) {
      loadMessages();
      setInitialized(true);
    }
  }, [conversationId, initialized]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    setSending(true);
    const formData = new FormData();
    formData.append("content", messageText.trim());

    const result = await sendMessage(conversationId, formData);
    if (result.success) {
      // Add the new message to the list
      // In a real app, you'd get this from the server response
      const newMessage: Message = {
        message: {
          id: Date.now(),
          content: messageText,
          messageType: "text",
          createdAt: new Date().toISOString(),
        },
        sender: {
          id: 1, // Current user ID
          name: "You",
          role: "customer",
        },
      };
      setMessages(prev => [...prev, newMessage]);
      setMessageText("");
    }
    setSending(false);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`bg-[#1f2833] rounded-xl border border-[#45a29e]/20 ${className}`}>
        <div className="p-4 border-b border-[#45a29e]/20">
          <div className="h-6 bg-[#45a29e]/20 rounded animate-pulse"></div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-[#45a29e]/20 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#45a29e]/20 rounded animate-pulse"></div>
                  <div className="h-3 bg-[#45a29e]/10 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#1f2833] rounded-xl border border-[#45a29e]/20 flex flex-col ${className}`}>
      {/* Header */}
      {title && (
        <div className="p-4 border-b border-[#45a29e]/20">
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {messages.length === 0 ? (
          <div className="text-center text-[#45a29e] py-8">
            <div className="text-4xl mb-2">💬</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.message.id}
              className={`flex ${msg.sender.role === 'customer' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender.role === 'customer'
                  ? 'bg-[#c5a059] text-[#0b0c10]'
                  : 'bg-[#2d3b2d] text-white'
              }`}>
                <div className="text-sm font-medium mb-1">
                  {msg.sender.name}
                </div>
                <div className="text-sm">
                  {msg.message.content}
                </div>
                <div className={`text-xs mt-1 ${
                  msg.sender.role === 'customer'
                    ? 'text-[#0b0c10]/70'
                    : 'text-[#45a29e]'
                }`}>
                  {formatTime(msg.message.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-[#45a29e]/20">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-4 py-2 text-white placeholder-[#45a29e]/50 focus:border-[#c5a059] focus:outline-none"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!messageText.trim() || sending}
            className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {sending ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}