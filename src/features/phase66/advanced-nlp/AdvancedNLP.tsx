'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Conversation {
  id: string;
  user: string;
  context: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  intent: string;
  entities: string[];
  response: string;
  confidence: number;
  timestamp: string;
}

interface ContextMemory {
  topic: string;
  relevance: number;
  lastMentioned: string;
  frequency: number;
}

const conversations: Conversation[] = [
  {
    id: 'conv_001',
    user: 'john@properties.com',
    context: 'Property maintenance scheduling',
    sentiment: 'neutral',
    intent: 'schedule_maintenance',
    entities: ['HVAC', 'next week', 'urgent'],
    response: 'I understand you need to schedule urgent HVAC maintenance for next week. Let me check availability and create a maintenance request.',
    confidence: 0.94,
    timestamp: '2026-04-21T15:30:00Z'
  },
  {
    id: 'conv_002',
    user: 'sarah@realtors.com',
    context: 'Property valuation inquiry',
    sentiment: 'positive',
    intent: 'property_valuation',
    entities: ['downtown condo', '$450k', 'market analysis'],
    response: 'Thank you for your interest in our downtown condo valuation. Based on current market analysis, I can provide a comprehensive assessment for $450k.',
    confidence: 0.89,
    timestamp: '2026-04-21T15:25:00Z'
  },
  {
    id: 'conv_003',
    user: 'mike@investors.com',
    context: 'Investment opportunity discussion',
    sentiment: 'positive',
    intent: 'investment_analysis',
    entities: ['ROI', '15%', 'portfolio', 'diversification'],
    response: 'Excellent question about ROI! Our current portfolio shows 15% returns with strong diversification. I can provide detailed investment analysis.',
    confidence: 0.97,
    timestamp: '2026-04-21T15:20:00Z'
  }
];

const contextMemory: ContextMemory[] = [
  { topic: 'Property Maintenance', relevance: 0.92, lastMentioned: '2026-04-21T15:30:00Z', frequency: 45 },
  { topic: 'Investment Analysis', relevance: 0.88, lastMentioned: '2026-04-21T15:20:00Z', frequency: 32 },
  { topic: 'Market Trends', relevance: 0.76, lastMentioned: '2026-04-21T14:45:00Z', frequency: 28 },
  { topic: 'Tenant Relations', relevance: 0.81, lastMentioned: '2026-04-21T14:30:00Z', frequency: 21 },
  { topic: 'Compliance Updates', relevance: 0.69, lastMentioned: '2026-04-21T13:15:00Z', frequency: 15 }
];

export default function AdvancedNLP() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'conversations' | 'context' | 'analysis'>('conversations');

  const analyzeText = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setAnalysis(null);

    // Simulate NLP processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockAnalysis = {
      sentiment: Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative',
      intent: ['property_inquiry', 'maintenance_request', 'investment_question', 'complaint'][Math.floor(Math.random() * 4)],
      entities: ['property', 'maintenance', 'investment', 'contract'].slice(0, Math.floor(Math.random() * 3) + 1),
      confidence: 0.85 + Math.random() * 0.1,
      contextRelevance: 0.78 + Math.random() * 0.15,
      topics: ['Real Estate', 'Property Management', 'Investment'],
      emotion: ['enthusiastic', 'concerned', 'professional', 'urgent'][Math.floor(Math.random() * 4)],
      urgency: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    };

    setAnalysis(mockAnalysis);
    setIsProcessing(false);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.9) return 'bg-green-500';
    if (confidence > 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🧠</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Advanced NLP</span>
            </Link>

            <div className="flex items-center gap-8">
              <Link href="/nlp" className="text-gray-600 hover:text-gray-900">NLP Analysis</Link>
              <Link href="/context" className="text-gray-600 hover:text-gray-900">Context Memory</Link>
              <Link href="/conversations" className="text-gray-600 hover:text-gray-900">Conversations</Link>
              <Link href="/sentiment" className="text-gray-600 hover:text-gray-900">Sentiment</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Natural Language Processing</h1>
          <p className="text-gray-600">Context-aware NLP with advanced language understanding</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processed Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">💬</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Confidence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(conversations.reduce((sum, c) => sum + c.confidence, 0) / conversations.length * 100).toFixed(0)}%
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Context Topics</p>
                <p className="text-2xl font-bold text-gray-900">{contextMemory.length}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm">🧠</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">94.2%</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-sm">📊</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'conversations', label: 'Conversations' },
                { id: 'context', label: 'Context Memory' },
                { id: 'analysis', label: 'Live Analysis' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'conversations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Conversations</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    Export Data
                  </button>
                </div>

                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer"
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getSentimentColor(conversation.sentiment)}`}
                        >
                          {conversation.sentiment}
                        </span>
                        <span className="text-sm text-gray-600">{conversation.user}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getConfidenceColor(conversation.confidence)}`}
                            style={{ width: `${conversation.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{(conversation.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-gray-900 mb-2">{conversation.context}</p>
                      <p className="text-sm text-gray-600">{conversation.response}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Intent: {conversation.intent.replace('_', ' ')}</span>
                      <span>Entities: {conversation.entities.join(', ')}</span>
                      <span>{new Date(conversation.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'context' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Context Memory</h2>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                    Update Memory
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contextMemory.map((memory, index) => (
                    <div key={index} className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{memory.topic}</h3>
                        <span className="text-sm text-gray-600">{memory.frequency} mentions</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Relevance:</span>
                          <span className="text-gray-900">{(memory.relevance * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${memory.relevance * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Last mentioned: {new Date(memory.lastMentioned).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Live NLP Analysis</h2>
                  <button
                    onClick={analyzeText}
                    disabled={isProcessing || !inputText.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Analyzing...' : 'Analyze Text'}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Input Text
                    </label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Enter text to analyze..."
                      className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isProcessing}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Results</h3>

                    {analysis ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">Sentiment</p>
                            <p className={`font-medium ${getSentimentColor(analysis.sentiment).split(' ')[0]}`}>
                              {analysis.sentiment}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">Intent</p>
                            <p className="font-medium text-gray-900">{analysis.intent.replace('_', ' ')}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">Confidence</p>
                            <p className="font-medium text-gray-900">{(analysis.confidence * 100).toFixed(1)}%</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">Urgency</p>
                            <p className="font-medium text-gray-900">{analysis.urgency}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-2">Entities Detected</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.entities.map((entity: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {entity}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-2">Context Relevance</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${analysis.contextRelevance * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {(analysis.contextRelevance * 100).toFixed(1)}% relevance to ongoing conversation
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        {isProcessing ? (
                          <div>
                            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p>Analyzing text...</p>
                          </div>
                        ) : (
                          <p>Enter text and click "Analyze" to see NLP results</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedConversation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Conversation Analysis</h3>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">User</p>
                      <p className="font-medium text-gray-900">{selectedConversation.user}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sentiment</p>
                      <p className={`font-medium ${getSentimentColor(selectedConversation.sentiment).split(' ')[0]}`}>
                        {selectedConversation.sentiment}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Intent</p>
                      <p className="font-medium text-gray-900">{selectedConversation.intent.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Confidence</p>
                      <p className="font-medium text-gray-900">{(selectedConversation.confidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Context</p>
                    <p className="text-gray-900">{selectedConversation.context}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">AI Response</p>
                    <p className="text-gray-900">{selectedConversation.response}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Extracted Entities</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedConversation.entities.map((entity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {entity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}