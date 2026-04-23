'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface NLPEntity {
  text: string;
  type: 'person' | 'organization' | 'location' | 'date' | 'number' | 'currency' | 'property' | 'maintenance';
  confidence: number;
  start: number;
  end: number;
}

interface Intent {
  name: string;
  confidence: number;
  parameters?: Record<string, any>;
}

interface ConversationContext {
  domain: 'maintenance' | 'financial' | 'supply-chain' | 'crm' | 'general';
  entities: NLPEntity[];
  intent: Intent | null;
  sentiment: 'positive' | 'negative' | 'neutral';
  urgency: 'low' | 'medium' | 'high';
  previousIntents: string[];
}

interface NLPMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  context: ConversationContext;
  processing: {
    entities: NLPEntity[];
    intent: Intent | null;
    sentiment: string;
    response: string;
  };
}

interface AdvancedNLPProps {
  tenantId?: string;
  userId?: string;
  initialDomain?: 'maintenance' | 'financial' | 'supply-chain' | 'crm' | 'general';
  onNLPResult?: (result: NLPMessage) => void;
}

const DOMAIN_KEYWORDS = {
  maintenance: ['repair', 'fix', 'maintenance', 'equipment', 'broken', 'service', 'technician', 'inspection'],
  financial: ['budget', 'cost', 'expense', 'revenue', 'profit', 'invoice', 'payment', 'financial'],
  'supply-chain': ['inventory', 'supplier', 'stock', 'procurement', 'logistics', 'delivery', 'warehouse'],
  crm: ['customer', 'client', 'lead', 'contact', 'relationship', 'marketing', 'campaign', 'sales'],
  general: []
};

const INTENT_PATTERNS = [
  { pattern: /schedule.*maintenance|book.*service|fix.*issue/i, intent: 'schedule_maintenance', domain: 'maintenance' },
  { pattern: /financial.*report|budget.*analysis|expense.*tracking/i, intent: 'financial_analysis', domain: 'financial' },
  { pattern: /inventory.*level|stock.*check|supplier.*contact/i, intent: 'inventory_check', domain: 'supply-chain' },
  { pattern: /customer.*info|lead.*status|campaign.*performance/i, intent: 'customer_inquiry', domain: 'crm' },
  { pattern: /help|support|assist/i, intent: 'request_help', domain: 'general' }
];

export default function AdvancedNLP({
  tenantId = 'default',
  userId = 'user1',
  initialDomain = 'general',
  onNLPResult
}: AdvancedNLPProps) {
  const [messages, setMessages] = useState<NLPMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentContext, setCurrentContext] = useState<ConversationContext>({
    domain: initialDomain,
    entities: [],
    intent: null,
    sentiment: 'neutral',
    urgency: 'low',
    previousIntents: []
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeEntities = useCallback((text: string): NLPEntity[] => {
    const entities: NLPEntity[] = [];

    // Property-related entities
    const propertyMatch = text.match(/(property|building|unit|apartment|office)\s+(\w+)/i);
    if (propertyMatch) {
      entities.push({
        text: propertyMatch[0],
        type: 'property',
        confidence: 0.9,
        start: propertyMatch.index || 0,
        end: (propertyMatch.index || 0) + propertyMatch[0].length
      });
    }

    // Date entities
    const dateMatch = text.match(/\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|tomorrow|today|next week)\b/i);
    if (dateMatch) {
      entities.push({
        text: dateMatch[0],
        type: 'date',
        confidence: 0.85,
        start: dateMatch.index || 0,
        end: (dateMatch.index || 0) + dateMatch[0].length
      });
    }

    // Currency entities
    const currencyMatch = text.match(/\$\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:dollars?|USD)/i);
    if (currencyMatch) {
      entities.push({
        text: currencyMatch[0],
        type: 'currency',
        confidence: 0.95,
        start: currencyMatch.index || 0,
        end: (currencyMatch.index || 0) + currencyMatch[0].length
      });
    }

    // Maintenance entities
    const maintenanceMatch = text.match(/(HVAC|plumbing|electrical|roof|floor|wall|ceiling)/i);
    if (maintenanceMatch) {
      entities.push({
        text: maintenanceMatch[0],
        type: 'maintenance',
        confidence: 0.8,
        start: maintenanceMatch.index || 0,
        end: (maintenanceMatch.index || 0) + maintenanceMatch[0].length
      });
    }

    return entities;
  }, []);

  const detectIntent = useCallback((text: string, domain: string): Intent | null => {
    for (const pattern of INTENT_PATTERNS) {
      if (pattern.pattern.test(text) && (pattern.domain === domain || domain === 'general')) {
        return {
          name: pattern.intent,
          confidence: 0.85 + Math.random() * 0.1,
          parameters: {}
        };
      }
    }
    return null;
  }, []);

  const analyzeSentiment = useCallback((text: string): 'positive' | 'negative' | 'neutral' => {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'perfect', 'happy', 'satisfied'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointed', 'angry', 'frustrated'];

    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }, []);

  const detectUrgency = useCallback((text: string): 'low' | 'medium' | 'high' => {
    const urgentWords = ['urgent', 'emergency', 'asap', 'immediately', 'critical', 'broken', 'leak'];
    const lowerText = text.toLowerCase();
    const urgentCount = urgentWords.filter(word => lowerText.includes(word)).length;

    if (urgentCount > 0) return 'high';
    if (lowerText.includes('soon') || lowerText.includes('quick')) return 'medium';
    return 'low';
  }, []);

  const determineDomain = useCallback((text: string, currentDomain: string): string => {
    const lowerText = text.toLowerCase();
    let bestDomain = currentDomain;
    let maxScore = 0;

    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      const score = keywords.filter(keyword => lowerText.includes(keyword)).length;
      if (score > maxScore) {
        maxScore = score;
        bestDomain = domain;
      }
    }

    return bestDomain;
  }, []);

  const generateResponse = useCallback((intent: Intent | null, context: ConversationContext, entities: NLPEntity[]): string => {
    const { domain, sentiment, urgency } = context;

    if (!intent) {
      return `I understand you're asking about ${domain === 'general' ? 'our platform' : domain.replace('-', ' ')}. Could you provide more details so I can better assist you?`;
    }

    switch (intent.name) {
      case 'schedule_maintenance':
        return urgency === 'high'
          ? "I understand this is urgent. I'll help you schedule emergency maintenance immediately. Please provide the property details and issue description."
          : "I'll help you schedule maintenance. Please provide the property location, type of service needed, and preferred date/time.";

      case 'financial_analysis':
        return "I'll assist with your financial analysis. What specific metrics or time period are you interested in reviewing?";

      case 'inventory_check':
        return "I'll check the current inventory levels. Which items or locations would you like me to review?";

      case 'customer_inquiry':
        return "I'll look up the customer information. Please provide the customer name, ID, or contact details.";

      case 'request_help':
        return `I'm here to help with ${domain === 'general' ? 'any aspect of our platform' : domain.replace('-', ' ')}. What specific assistance do you need?`;

      default:
        return `I detected your intent as "${intent.name}". How can I help you with this ${domain} matter?`;
    }
  }, []);

  const processMessage = useCallback(async (text: string): Promise<NLPMessage> => {
    const domain = determineDomain(text, currentContext.domain);
    const entities = analyzeEntities(text);
    const intent = detectIntent(text, domain);
    const sentiment = analyzeSentiment(text);
    const urgency = detectUrgency(text);

    const newContext: ConversationContext = {
      domain: domain as any,
      entities,
      intent,
      sentiment,
      urgency,
      previousIntents: intent ? [...currentContext.previousIntents.slice(-4), intent.name] : currentContext.previousIntents
    };

    const response = generateResponse(intent, newContext, entities);

    const message: NLPMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      sender: 'user',
      timestamp: new Date(),
      context: newContext,
      processing: {
        entities,
        intent,
        sentiment,
        response
      }
    };

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    setCurrentContext(newContext);
    return message;
  }, [currentContext, determineDomain, analyzeEntities, detectIntent, analyzeSentiment, detectUrgency, generateResponse]);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: NLPMessage = {
      id: `msg_${Date.now()}`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      context: currentContext,
      processing: {
        entities: [],
        intent: null,
        sentiment: 'neutral',
        response: ''
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      const processedMessage = await processMessage(inputValue);
      const assistantMessage: NLPMessage = {
        ...processedMessage,
        sender: 'assistant',
        text: processedMessage.processing.response
      };

      setMessages(prev => [...prev, assistantMessage]);
      onNLPResult?.(processedMessage);
    } catch (error) {
      console.error('NLP processing failed:', error);
      const errorMessage: NLPMessage = {
        id: `msg_${Date.now()}_error`,
        text: 'I apologize, but I encountered an error processing your message. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
        context: currentContext,
        processing: {
          entities: [],
          intent: null,
          sentiment: 'neutral',
          response: 'Error occurred'
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [inputValue, isProcessing, currentContext, processMessage, onNLPResult]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced NLP System</h1>
            <p className="text-gray-600">Context-aware natural language processing with intent detection</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Domain</div>
              <div className="font-medium capitalize">{currentContext.domain.replace('-', ' ')}</div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              currentContext.domain !== 'general' ? 'bg-green-500' : 'bg-blue-500'
            }`}></div>
          </div>
        </div>

        {/* Context Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 capitalize">{currentContext.sentiment}</div>
            <div className="text-sm text-gray-600">Sentiment</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 capitalize">{currentContext.urgency}</div>
            <div className="text-sm text-gray-600">Urgency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{currentContext.entities.length}</div>
            <div className="text-sm text-gray-600">Entities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{currentContext.intent?.name || 'None'}</div>
            <div className="text-sm text-gray-600">Intent</div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-lg shadow-lg flex flex-col h-96">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">💬</div>
              <div>Start a conversation to see NLP analysis in action</div>
              <div className="text-sm mt-2">Try: "Schedule HVAC maintenance for tomorrow" or "Check inventory levels"</div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="mb-2">{message.text}</div>
                {message.sender === 'assistant' && message.processing.entities.length > 0 && (
                  <div className="text-xs space-y-1">
                    <div className="font-medium">Entities detected:</div>
                    {message.processing.entities.map((entity, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>"{entity.text}"</span>
                        <span className="text-blue-600">{entity.type}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-gray-600">Analyzing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (e.g., 'Schedule maintenance' or 'Check financial reports')"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* NLP Analysis Details */}
      {messages.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">NLP Analysis Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Recent Entities</h3>
              <div className="space-y-2">
                {messages.slice(-3).flatMap(msg => msg.processing.entities).map((entity, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">"{entity.text}"</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      entity.type === 'date' ? 'bg-blue-100 text-blue-800' :
                      entity.type === 'currency' ? 'bg-green-100 text-green-800' :
                      entity.type === 'property' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {entity.type}
                    </span>
                  </div>
                ))}
                {messages.slice(-3).every(msg => msg.processing.entities.length === 0) && (
                  <div className="text-sm text-gray-500">No entities detected</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Intent History</h3>
              <div className="space-y-2">
                {currentContext.previousIntents.slice(-3).map((intent, idx) => (
                  <div key={idx} className="p-2 bg-blue-50 rounded">
                    <span className="text-sm text-blue-800">{intent.replace('_', ' ')}</span>
                  </div>
                ))}
                {currentContext.previousIntents.length === 0 && (
                  <div className="text-sm text-gray-500">No intents detected yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}