"use client";

import { useState, useEffect } from "react";
import { getConversations } from "@/lib/server-actions/chat";

interface Conversation {
  conversation: {
    id: number;
    title: string;
    type: string;
    isActive: boolean;
    updatedAt: string;
  };
  participant: {
    role: string;
  };
}

interface ChatListProps {
  selectedConversationId?: number;
  onConversationSelect: (conversationId: number) => void;
  className?: string;
}

export function ChatList({ selectedConversationId, onConversationSelect, className = "" }: ChatListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const loadConversations = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const result = await getConversations();
      if (result.success) {
        setConversations(result.conversations);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized) {
      loadConversations();
      setInitialized(true);
    }
  }, [initialized]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getConversationIcon = (type: string) => {
    switch (type) {
      case "booking": return "📅";
      case "general": return "💬";
      default: return "💬";
    }
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 bg-[#1f2833] rounded-lg border border-[#45a29e]/20 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#45a29e]/20 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#45a29e]/20 rounded w-3/4"></div>
                <div className="h-3 bg-[#45a29e]/10 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {conversations.length === 0 ? (
        <div className="text-center text-[#45a29e] py-8">
          <div className="text-4xl mb-2">💬</div>
          <p>No conversations yet</p>
        </div>
      ) : (
        conversations.map(({ conversation, participant }) => (
          <button
            key={conversation.id}
            onClick={() => onConversationSelect(conversation.id)}
            className={`w-full p-4 rounded-lg border transition-all text-left ${
              selectedConversationId === conversation.id
                ? 'bg-[#c5a059] border-[#c5a059] text-[#0b0c10]'
                : 'bg-[#1f2833] border-[#45a29e]/20 hover:border-[#45a29e]/40 text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{getConversationIcon(conversation.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold truncate ${
                    selectedConversationId === conversation.id ? 'text-[#0b0c10]' : 'text-white'
                  }`}>
                    {conversation.title}
                  </h3>
                  <span className={`text-xs ${
                    selectedConversationId === conversation.id ? 'text-[#0b0c10]/70' : 'text-[#45a29e]'
                  }`}>
                    {formatTime(conversation.updatedAt)}
                  </span>
                </div>
                <p className={`text-sm truncate ${
                  selectedConversationId === conversation.id ? 'text-[#0b0c10]/80' : 'text-[#45a29e]'
                }`}>
                  {conversation.type === 'booking' ? 'Service booking discussion' : 'General conversation'}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    participant.role === 'provider'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {participant.role}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
}