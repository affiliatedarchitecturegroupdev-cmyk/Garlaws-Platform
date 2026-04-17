"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ChatList } from "@/components/ChatList";
import { ChatWindow } from "@/components/ChatWindow";

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);

  return (
    <DashboardLayout activeTab="notifications">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
          <p className="text-[#45a29e]">
            Communicate with service providers and manage your conversations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-4 h-full">
              <h2 className="text-xl font-bold text-white mb-4">Conversations</h2>
              <div className="overflow-y-auto h-[calc(100%-60px)]">
                <ChatList
                  selectedConversationId={selectedConversationId || undefined}
                  onConversationSelect={setSelectedConversationId}
                />
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedConversationId ? (
              <ChatWindow
                conversationId={selectedConversationId}
                title={`Conversation #${selectedConversationId}`}
                className="h-full"
              />
            ) : (
              <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-8 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
                  <p className="text-[#45a29e]">
                    Choose a conversation from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}