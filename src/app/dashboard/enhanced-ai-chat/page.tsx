"use client";

import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EnhancedAIChat } from '@/components/EnhancedAIChat';
import { enhancedNLPService } from '@/lib/enhanced-nlp-service';

export default function EnhancedAIChatPage() {
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [userId] = useState('demo_user'); // In real app, get from auth
  const [insights, setInsights] = useState<any>(null);

  const handleGetInsights = async () => {
    try {
      const conversationInsights = enhancedNLPService.getConversationInsights(conversationId);
      setInsights(conversationInsights);
    } catch (error) {
      console.error('Failed to get insights:', error);
    }
  };

  return (
    <DashboardLayout activeTab="chat">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Enhanced AI Chat</h1>
          <p className="text-[#45a29e]">
            Experience our next-generation AI assistant with context awareness, memory, and intelligent conversation handling
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            <EnhancedAIChat
              conversationId={conversationId}
              userId={userId}
              className="h-[600px]"
            />

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => {
                  // Simulate user typing a booking message
                  const event = new CustomEvent('ai-chat-input', {
                    detail: { message: 'I need to book garden maintenance for next week' }
                  });
                  window.dispatchEvent(event);
                }}
                className="p-4 bg-[#1f2833] border border-[#45a29e]/20 rounded-xl hover:border-[#45a29e]/40 transition-colors text-center"
              >
                <div className="text-2xl mb-2">📅</div>
                <div className="text-white text-sm font-medium">Book Service</div>
              </button>

              <button
                onClick={() => {
                  const event = new CustomEvent('ai-chat-input', {
                    detail: { message: 'What services do you offer?' }
                  });
                  window.dispatchEvent(event);
                }}
                className="p-4 bg-[#1f2833] border border-[#45a29e]/20 rounded-xl hover:border-[#45a29e]/40 transition-colors text-center"
              >
                <div className="text-2xl mb-2">ℹ️</div>
                <div className="text-white text-sm font-medium">Get Info</div>
              </button>

              <button
                onClick={() => {
                  const event = new CustomEvent('ai-chat-input', {
                    detail: { message: 'I had a bad experience with a service' }
                  });
                  window.dispatchEvent(event);
                }}
                className="p-4 bg-[#1f2833] border border-[#45a29e]/20 rounded-xl hover:border-[#45a29e]/40 transition-colors text-center"
              >
                <div className="text-2xl mb-2">🆘</div>
                <div className="text-white text-sm font-medium">Report Issue</div>
              </button>

              <button
                onClick={handleGetInsights}
                className="p-4 bg-[#1f2833] border border-[#45a29e]/20 rounded-xl hover:border-[#45a29e]/40 transition-colors text-center"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="text-white text-sm font-medium">Get Insights</div>
              </button>
            </div>
          </div>

          {/* Insights & Analytics Panel */}
          <div className="space-y-6">
            {/* AI Capabilities */}
            <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">AI Capabilities</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[#c5a059]">🧠</span>
                  <div>
                    <div className="text-white text-sm font-medium">Context Awareness</div>
                    <div className="text-[#45a29e] text-xs">Remembers conversation history</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[#c5a059]">💭</span>
                  <div>
                    <div className="text-white text-sm font-medium">Intent Recognition</div>
                    <div className="text-[#45a29e] text-xs">Understands user goals</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[#c5a059]">🎯</span>
                  <div>
                    <div className="text-white text-sm font-medium">Entity Extraction</div>
                    <div className="text-[#45a29e] text-xs">Identifies key information</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[#c5a059]">📚</span>
                  <div>
                    <div className="text-white text-sm font-medium">Memory Learning</div>
                    <div className="text-[#45a29e] text-xs">Learns from interactions</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[#c5a059]">🎭</span>
                  <div>
                    <div className="text-white text-sm font-medium">Sentiment Analysis</div>
                    <div className="text-[#45a29e] text-xs">Detects user emotions</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[#c5a059]">⚡</span>
                  <div>
                    <div className="text-white text-sm font-medium">Action Generation</div>
                    <div className="text-[#45a29e] text-xs">Suggests next steps</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation Insights */}
            {insights && (
              <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Conversation Insights</h3>

                <div className="space-y-4">
                  <div>
                    <div className="text-[#45a29e] text-sm mb-1">Summary</div>
                    <div className="text-white text-sm">{insights.summary}</div>
                  </div>

                  <div>
                    <div className="text-[#45a29e] text-sm mb-2">Key Topics</div>
                    <div className="flex flex-wrap gap-2">
                      {insights.keyTopics.map((topic: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[#c5a059]/20 text-[#c5a059] text-xs rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#45a29e] text-sm mb-1">User Sentiment</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${
                        insights.userSentiment > 0.3 ? 'text-green-400' :
                        insights.userSentiment < -0.3 ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {insights.userSentiment > 0.3 ? '😊' :
                         insights.userSentiment < -0.3 ? '😞' : '😐'}
                      </span>
                      <span className="text-white text-sm">
                        {(insights.userSentiment * 100).toFixed(0)}% positive
                      </span>
                    </div>
                  </div>

                  {insights.actionItems.length > 0 && (
                    <div>
                      <div className="text-[#45a29e] text-sm mb-2">Action Items</div>
                      <ul className="text-white text-sm space-y-1">
                        {insights.actionItems.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-[#c5a059] mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {insights.followUpSuggestions.length > 0 && (
                    <div>
                      <div className="text-[#45a29e] text-sm mb-2">Follow-up Suggestions</div>
                      <ul className="text-[#45a29e] text-sm space-y-1">
                        {insights.followUpSuggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-[#c5a059] mt-1">💡</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* NLP Stats */}
            <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">NLP Processing</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#45a29e] text-sm">Intent Detection</span>
                  <span className="text-green-400 text-sm">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#45a29e] text-sm">Entity Extraction</span>
                  <span className="text-green-400 text-sm">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#45a29e] text-sm">Sentiment Analysis</span>
                  <span className="text-green-400 text-sm">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#45a29e] text-sm">Context Memory</span>
                  <span className="text-green-400 text-sm">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#45a29e] text-sm">Learning Patterns</span>
                  <span className="text-blue-400 text-sm">Learning</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}