"use client";

import { useState, useEffect } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { AIChatWindow } from "@/components/AIChatWindow";
import { getConversations } from "@/lib/server-actions/chat";

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);

  const loadConversations = async () => {
    if (!isOpen || initialized) return;

    try {
      const result = await getConversations();
      if (result.success) {
        setConversations(result.conversations);
        // Auto-select the first conversation if available
        if (result.conversations.length > 0 && !selectedConversationId) {
          setSelectedConversationId(result.conversations[0].conversation.id);
        }
        setInitialized(true);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
      setInitialized(true); // Prevent retrying on error
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const unreadCount = conversations.filter((conv: any, index: number) =>
    // In a real app, you'd track unread messages
    index % 3 === 0 // Mock unread indicator
  ).length;

  return (
    <>
      {/* AI Assistant Button */}
      <button
        onClick={() => setIsAIOpen(!isAIOpen)}
        className="fixed bottom-6 right-20 w-14 h-14 bg-[#45a29e] rounded-full shadow-lg hover:bg-[#3a8c7a] transition-colors flex items-center justify-center z-50"
        aria-label="AI Assistant"
      >
        <span className="text-white text-lg font-bold">AI</span>
      </button>

      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#c5a059] rounded-full shadow-lg hover:bg-[#b8954f] transition-colors flex items-center justify-center z-50"
        aria-label="Open chat"
      >
        {unreadCount > 0 ? (
          <div className="relative">
            <span className="text-2xl">💬</span>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        ) : (
          <span className="text-2xl">💬</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Panel */}
          <div className="fixed bottom-20 right-6 w-96 max-w-[calc(100vw-3rem)] h-96 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#45a29e]/20 flex items-center justify-between">
              <h3 className="text-white font-semibold">Messages</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#45a29e] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Conversations List */}
            {conversations.length > 0 && (
              <div className="p-3 border-b border-[#45a29e]/20 max-h-32 overflow-y-auto">
                <div className="space-y-2">
                  {conversations.slice(0, 3).map(({ conversation }: any) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full p-2 rounded text-left transition-colors ${
                        selectedConversationId === conversation.id
                          ? 'bg-[#c5a059] text-[#0b0c10]'
                          : 'hover:bg-[#2d3b2d] text-[#45a29e]'
                      }`}
                    >
                      <div className="text-sm font-medium truncate">
                        {conversation.title}
                      </div>
                      <div className="text-xs opacity-75">
                        {conversation.type === 'booking' ? 'Service chat' : 'General chat'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Content */}
            <div className="flex-1 h-64">
              {selectedConversationId ? (
                <ChatWindow
                  conversationId={selectedConversationId}
                  className="h-full rounded-none border-none"
                />
              ) : (
                <div className="p-4 text-center text-[#45a29e] h-full flex items-center justify-center">
                  <div>
                    <div className="text-3xl mb-2">💬</div>
                    <p className="text-sm">Select a conversation to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* AI Chat Window */}
      <AIChatWindow
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />
    </>
  );
}