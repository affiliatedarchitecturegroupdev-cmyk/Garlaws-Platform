"use client";

import { useState, useEffect, useRef } from "react";
import { aiChatService } from "@/lib/ai-chat-service";

interface Message {
  id: number;
  content: string;
  isAI: boolean;
  timestamp: Date;
  suggestions?: string[];
  actions?: Array<{
    type: 'booking' | 'support' | 'navigation';
    label: string;
    data?: any;
  }>;
}

interface AIChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatWindow({ isOpen, onClose }: AIChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with welcome message
      handleAIResponse("Hello! I'm your AI assistant for Garlaws Property Maintenance.");
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      content: inputValue,
      isAI: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await aiChatService.generateResponse(inputValue);
      handleAIResponse(response.message, response.suggestions, response.actions);
    } catch (error) {
      handleAIResponse("I'm sorry, I'm having trouble responding right now. Please try again or contact support.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleAIResponse = (content: string, suggestions?: string[], actions?: any[]) => {
    const aiMessage: Message = {
      id: Date.now() + 1,
      content,
      isAI: true,
      timestamp: new Date(),
      suggestions,
      actions,
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleActionClick = (action: any) => {
    switch (action.type) {
      case 'navigation':
        if (action.data?.path) {
          window.location.href = action.data.path;
        }
        break;
      case 'booking':
        if (action.data?.action === 'browse_services') {
          window.location.href = '/services';
        }
        break;
      case 'support':
        if (action.data?.action === 'create_ticket') {
          window.location.href = '/dashboard/support';
        } else if (action.data?.action === 'contact_support') {
          window.location.href = '/dashboard/support';
        }
        break;
    }
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 w-96 h-[600px] bg-[#1f2833] rounded-xl border border-[#45a29e]/20 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#45a29e]/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#c5a059] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Assistant</h3>
            <p className="text-[#45a29e] text-xs">Online • Ready to help</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-[#45a29e] hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] ${message.isAI ? 'bg-[#2d3b2d]' : 'bg-[#c5a059]'} rounded-lg p-3`}>
              <p className="text-white text-sm">{message.content}</p>

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left text-[#45a29e] text-xs hover:text-white transition-colors p-2 rounded bg-[#0b0c10]/50 hover:bg-[#0b0c10]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleActionClick(action)}
                      className="block w-full text-left text-white text-xs bg-[#45a29e]/20 hover:bg-[#45a29e]/40 transition-colors p-2 rounded"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-xs text-[#45a29e] mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#2d3b2d] rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#45a29e] rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-[#45a29e] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#45a29e] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white placeholder-[#45a29e]/50 focus:border-[#c5a059] focus:outline-none"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}