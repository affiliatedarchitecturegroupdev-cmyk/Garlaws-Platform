"use client";

import { useState, useEffect, useRef } from 'react';
import { enhancedNLPService, type ConversationContext, type NLPAnalysis, type ContextualResponse } from '@/lib/enhanced-nlp-service';

interface EnhancedMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  analysis?: NLPAnalysis;
  actions?: ContextualResponse['actions'];
  followUpQuestions?: string[];
}

interface EnhancedAIChatProps {
  conversationId: string;
  userId: string;
  className?: string;
}

export function EnhancedAIChat({ conversationId, userId, className = "" }: EnhancedAIChatProps) {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState<ConversationContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversationHistory();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversationHistory = async () => {
    try {
      // In a real app, load from API
      // For now, start with empty conversation
      setMessages([]);

      // Initialize conversation context
      const context = {
        conversationId,
        userId,
        messages: [],
        userProfile: {
          preferences: {},
          bookingHistory: [],
          propertyIds: []
        },
        sessionState: {
          pendingActions: [],
          contextVariables: {},
          conversationStage: 'greeting'
        },
        memory: {
          shortTerm: new Map(),
          longTerm: new Map(),
          learnedPatterns: []
        }
      };

      setConversationContext(context as any);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: EnhancedMessage = {
      id: `user_${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Analyze the message
      const analysis = await enhancedNLPService.analyzeMessage(conversationId, userId, inputValue);

      // Generate contextual response
      const response = await enhancedNLPService.generateResponse(conversationId, userId, analysis);

      const assistantMessage: EnhancedMessage = {
        id: `assistant_${Date.now()}`,
        content: response.message,
        sender: 'assistant',
        timestamp: new Date(),
        analysis,
        actions: response.actions,
        followUpQuestions: response.followUpQuestions,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update conversation context
      const updatedContext = await enhancedNLPService.getConversationInsights(conversationId);
      setConversationContext(prev => prev ? { ...prev, ...updatedContext } : null);

    } catch (error) {
      console.error('Failed to process message:', error);

      const errorMessage: EnhancedMessage = {
        id: `error_${Date.now()}`,
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action: any) => {
    switch (action.type) {
      case 'booking':
        // Handle booking action
        console.log('Booking action:', action.data);
        break;
      case 'information':
        // Handle information request
        console.log('Information action:', action.data);
        break;
      case 'clarification':
        // Request clarification
        console.log('Clarification needed:', action.data);
        break;
      case 'escalation':
        // Escalate to human
        console.log('Escalating:', action.data);
        break;
    }
  };

  const handleFollowUpClick = (question: string) => {
    setInputValue(question);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSentimentColor = (sentiment?: number) => {
    if (!sentiment) return 'text-gray-400';
    if (sentiment > 0.3) return 'text-green-400';
    if (sentiment < -0.3) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getIntentIcon = (intent?: string) => {
    switch (intent) {
      case 'booking': return '📅';
      case 'information': return 'ℹ️';
      case 'complaint': return '😞';
      case 'pricing': return '💰';
      case 'support': return '🆘';
      case 'status': return '📊';
      default: return '💬';
    }
  };

  return (
    <div className={`bg-[#1f2833] rounded-xl border border-[#45a29e]/20 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-[#45a29e]/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#c5a059] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">Enhanced AI Assistant</h3>
            <p className="text-[#45a29e] text-xs">
              Context-aware • Memory-enabled • Action-oriented
            </p>
          </div>
        </div>
      </div>

      {/* Conversation Context */}
      {conversationContext && (
        <div className="px-4 py-2 bg-[#2d3b2d] border-b border-[#45a29e]/20">
          <div className="text-xs text-[#45a29e]">
            Stage: {conversationContext.sessionState.conversationStage.replace('_', ' ')} •
            Messages: {conversationContext.messages.length}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {messages.length === 0 ? (
          <div className="text-center text-[#45a29e] py-8">
            <div className="text-4xl mb-2">🤖</div>
            <p>Start a conversation with our enhanced AI assistant</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-[#c5a059] text-[#0b0c10]'
                  : 'bg-[#2d3b2d] text-white'
              }`}>
                {/* Message Header */}
                <div className="flex items-center gap-2 mb-1">
                  {message.sender === 'assistant' && message.analysis && (
                    <span className="text-sm">
                      {getIntentIcon(message.analysis.intent)}
                    </span>
                  )}
                  <span className={`text-xs ${
                    message.sender === 'user'
                      ? 'text-[#0b0c10]/70'
                      : 'text-[#45a29e]'
                  }`}>
                    {message.sender === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                  {message.analysis?.sentiment !== undefined && (
                    <span className={`text-xs ${getSentimentColor(message.analysis.sentiment)}`}>
                      {message.analysis.sentiment > 0 ? '😊' : message.analysis.sentiment < 0 ? '😞' : '😐'}
                    </span>
                  )}
                </div>

                {/* Message Content */}
                <div className="text-sm">
                  {message.content}
                </div>

                {/* Analysis Info */}
                {message.analysis && (
                  <div className="mt-2 pt-2 border-t border-current/20">
                    <div className="text-xs opacity-75">
                      Intent: {message.analysis.intent} ({(message.analysis.confidence * 100).toFixed(0)}%)
                      {message.analysis.entities && Object.keys(message.analysis.entities).length > 0 && (
                        <span className="ml-2">
                          • Entities: {Object.keys(message.analysis.entities).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleActionClick(action)}
                        className="block w-full text-left text-xs px-2 py-1 bg-current/20 rounded hover:bg-current/30 transition-colors"
                      >
                        {action.type.toUpperCase()}: {JSON.stringify(action.data).substring(0, 30)}...
                      </button>
                    ))}
                  </div>
                )}

                {/* Follow-up Questions */}
                {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.followUpQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleFollowUpClick(question)}
                        className="block w-full text-left text-xs px-2 py-1 bg-[#45a29e]/20 text-[#45a29e] rounded hover:bg-[#45a29e]/30 transition-colors"
                      >
                        💭 {question}
                      </button>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <div className={`text-xs mt-1 ${
                  message.sender === 'user'
                    ? 'text-[#0b0c10]/70'
                    : 'text-[#45a29e]'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#2d3b2d] rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#45a29e] border-t-transparent"></div>
                <span className="text-[#45a29e] text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#45a29e]/20">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask me anything with context awareness..."
            className="flex-1 bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white placeholder-[#45a29e]/50 focus:border-[#c5a059] focus:outline-none"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Send
          </button>
        </div>

        {/* Context Info */}
        {conversationContext && (
          <div className="mt-2 text-xs text-[#45a29e]">
            Context: {conversationContext.sessionState.conversationStage} •
            Memory: {conversationContext.memory.learnedPatterns.length} patterns
          </div>
        )}
      </div>
    </div>
  );
}