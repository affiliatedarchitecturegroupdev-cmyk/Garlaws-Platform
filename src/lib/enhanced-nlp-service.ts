// Enhanced NLP Service with Context Awareness and Memory
export interface ConversationContext {
  conversationId: string;
  userId: string;
  messages: Array<{
    id: string;
    content: string;
    timestamp: Date;
    sender: 'user' | 'assistant';
    intent?: string;
    entities?: Record<string, any>;
    sentiment?: number; // -1 to 1
  }>;
  userProfile: {
    name?: string;
    role?: string;
    preferences: Record<string, any>;
    bookingHistory: string[];
    propertyIds: string[];
  };
  sessionState: {
    currentIntent?: string;
    pendingActions: string[];
    contextVariables: Record<string, any>;
    lastTopic?: string;
    conversationStage: 'greeting' | 'information_gathering' | 'problem_solving' | 'action' | 'closing';
  };
  memory: {
    shortTerm: Map<string, any>; // Last 10 exchanges
    longTerm: Map<string, any>; // Important facts and preferences
    learnedPatterns: Array<{
      pattern: string;
      response: string;
      successRate: number;
      lastUsed: Date;
    }>;
  };
}

export interface NLPAnalysis {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  sentiment: number;
  topics: string[];
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  suggestedActions: string[];
}

export interface ContextualResponse {
  message: string;
  confidence: number;
  actions: Array<{
    type: 'booking' | 'information' | 'clarification' | 'escalation';
    data: any;
    priority: number;
  }>;
  followUpQuestions?: string[];
  contextUpdates: Record<string, any>;
}

class EnhancedNLPService {
  private contexts: Map<string, ConversationContext> = new Map();
  private intentPatterns: Map<string, RegExp[]> = new Map();
  private entityExtractors: Map<string, (text: string) => any> = new Map();

  constructor() {
    this.initializeIntentPatterns();
    this.initializeEntityExtractors();
  }

  // Analyze user message with full context awareness
  async analyzeMessage(
    conversationId: string,
    userId: string,
    message: string
  ): Promise<NLPAnalysis> {
    const context = this.getOrCreateContext(conversationId, userId);

    // Add message to context
    const messageData = {
      id: `msg_${Date.now()}`,
      content: message,
      timestamp: new Date(),
      sender: 'user' as const,
      intent: '',
      entities: {},
      sentiment: this.analyzeSentiment(message)
    };

    context.messages.push(messageData);

    // Analyze intent and entities
    const intent = this.detectIntent(message, context);
    const entities = this.extractEntities(message);
    const topics = this.extractTopics(message);
    const urgency = this.assessUrgency(message, intent, context);

    messageData.intent = intent;
    messageData.entities = entities;

    // Update context
    context.sessionState.currentIntent = intent;
    context.sessionState.lastTopic = topics[0];

    const analysis: NLPAnalysis = {
      intent,
      confidence: this.calculateConfidence(message, intent, entities),
      entities,
      sentiment: messageData.sentiment,
      topics,
      urgency,
      suggestedActions: this.generateSuggestedActions(intent, entities, context)
    };

    return analysis;
  }

  // Generate contextual response based on full conversation history
  async generateResponse(
    conversationId: string,
    userId: string,
    analysis: NLPAnalysis
  ): Promise<ContextualResponse> {
    const context = this.getOrCreateContext(conversationId, userId);

    // Update conversation stage
    this.updateConversationStage(context, analysis);

    // Generate response based on context and analysis
    const response = await this.generateContextualResponse(context, analysis);

    // Update context with response
    context.messages.push({
      id: `msg_${Date.now()}`,
      content: response.message,
      timestamp: new Date(),
      sender: 'assistant',
      intent: analysis.intent,
      entities: {},
      sentiment: 0
    });

    // Learn from successful interactions
    this.updateLearnedPatterns(context, analysis, response);

    return response;
  }

  // Get conversation summary and insights
  getConversationInsights(conversationId: string): {
    summary: string;
    keyTopics: string[];
    userSentiment: number;
    actionItems: string[];
    followUpSuggestions: string[];
  } {
    const context = this.contexts.get(conversationId);
    if (!context) {
      return {
        summary: 'No conversation data available',
        keyTopics: [],
        userSentiment: 0,
        actionItems: [],
        followUpSuggestions: []
      };
    }

    const userMessages = context.messages.filter(m => m.sender === 'user');
    const averageSentiment = userMessages.reduce((sum, m) => sum + (m.sentiment || 0), 0) / userMessages.length;

    const allTopics = userMessages.flatMap(m => this.extractTopics(m.content));
    const keyTopics = [...new Set(allTopics)].slice(0, 5);

    const actionItems = context.sessionState.pendingActions;
    const followUpSuggestions = this.generateFollowUpSuggestions(context);

    const summary = this.generateConversationSummary(context);

    return {
      summary,
      keyTopics,
      userSentiment: averageSentiment,
      actionItems,
      followUpSuggestions
    };
  }

  private initializeIntentPatterns() {
    this.intentPatterns.set('booking', [
      /book.*service/i,
      /schedule.*appointment/i,
      /make.*reservation/i,
      /need.*maintenance/i,
      /want.*to.*hire/i
    ]);

    this.intentPatterns.set('information', [
      /what.*is/i,
      /how.*does/i,
      /tell.*me.*about/i,
      /explain/i,
      /information/i
    ]);

    this.intentPatterns.set('complaint', [
      /problem/i,
      /issue/i,
      /wrong/i,
      /bad/i,
      /terrible/i,
      /disappointed/i
    ]);

    this.intentPatterns.set('pricing', [
      /cost/i,
      /price/i,
      /fee/i,
      /charge/i,
      /expensive/i,
      /cheap/i
    ]);

    this.intentPatterns.set('support', [
      /help/i,
      /support/i,
      /assistance/i,
      /contact/i,
      /speak.*to.*someone/i
    ]);

    this.intentPatterns.set('status', [
      /status/i,
      /update/i,
      /progress/i,
      /when/i,
      /ready/i
    ]);
  }

  private initializeEntityExtractors() {
    // Date/time extractor
    this.entityExtractors.set('datetime', (text: string) => {
      const datePatterns = [
        /\b(today|tomorrow|next week|next month)\b/i,
        /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/,
        /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(st|nd|rd|th)?/i
      ];

      for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
          return { value: match[0], type: 'date', original: match[0] };
        }
      }
      return null;
    });

    // Service type extractor
    this.entityExtractors.set('service', (text: string) => {
      const services = [
        'gardening', 'landscaping', 'pool cleaning', 'electrical', 'plumbing',
        'painting', 'roofing', 'security', 'cleaning', 'maintenance'
      ];

      for (const service of services) {
        if (text.toLowerCase().includes(service)) {
          return { value: service, type: 'service', confidence: 0.9 };
        }
      }
      return null;
    });

    // Location extractor
    this.entityExtractors.set('location', (text: string) => {
      // Simple location detection - in real app, use geocoding API
      const locationPatterns = [
        /\b(johannesburg|pretoria|cape town|durban)\b/i,
        /\b\d+\s+[a-zA-Z\s]+(street|road|avenue|drive|place)\b/i
      ];

      for (const pattern of locationPatterns) {
        const match = text.match(pattern);
        if (match) {
          return { value: match[0], type: 'location', confidence: 0.8 };
        }
      }
      return null;
    });
  }

  private getOrCreateContext(conversationId: string, userId: string): ConversationContext {
    if (!this.contexts.has(conversationId)) {
      this.contexts.set(conversationId, {
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
      });
    }

    return this.contexts.get(conversationId)!;
  }

  private detectIntent(message: string, context: ConversationContext): string {
    // Check context first - if we're in a booking flow, maintain that intent
    if (context.sessionState.currentIntent === 'booking' &&
        !message.match(/(cancel|end|stop)/i)) {
      return 'booking';
    }

    // Pattern matching
    for (const [intent, patterns] of this.intentPatterns) {
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          return intent;
        }
      }
    }

    // Context-based intent detection
    const recentMessages = context.messages.slice(-3);
    if (recentMessages.some(m => m.intent === 'booking')) {
      return 'booking_followup';
    }

    return 'general';
  }

  private extractEntities(message: string): Record<string, any> {
    const entities: Record<string, any> = {};

    for (const [entityType, extractor] of this.entityExtractors) {
      const result = extractor(message);
      if (result) {
        entities[entityType] = result;
      }
    }

    return entities;
  }

  private extractTopics(message: string): string[] {
    const topics: string[] = [];
    const lowerMessage = message.toLowerCase();

    const topicKeywords = {
      'maintenance': ['maintenance', 'repair', 'fix', 'service'],
      'booking': ['book', 'schedule', 'appointment', 'hire'],
      'pricing': ['cost', 'price', 'fee', 'expensive', 'cheap'],
      'quality': ['quality', 'good', 'bad', 'satisfied', 'dissatisfied'],
      'timing': ['when', 'time', 'schedule', 'delay', 'late'],
      'location': ['where', 'location', 'address', 'area']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  private analyzeSentiment(message: string): number {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'perfect', 'happy', 'satisfied', 'thanks', 'thank you'];
    const negativeWords = ['bad', 'terrible', 'awful', 'disappointed', 'angry', 'frustrated', 'problem', 'issue', 'wrong'];

    const lowerMessage = message.toLowerCase();
    let sentiment = 0;

    positiveWords.forEach(word => {
      if (lowerMessage.includes(word)) sentiment += 0.2;
    });

    negativeWords.forEach(word => {
      if (lowerMessage.includes(word)) sentiment -= 0.3;
    });

    // Check for exclamation marks and question marks
    const exclamationCount = (message.match(/!/g) || []).length;
    const questionCount = (message.match(/\?/g) || []).length;

    sentiment += exclamationCount * 0.1; // Excitement
    sentiment -= questionCount * 0.05; // Uncertainty

    return Math.max(-1, Math.min(1, sentiment));
  }

  private assessUrgency(message: string, intent: string, context: ConversationContext): 'low' | 'medium' | 'high' | 'urgent' {
    const lowerMessage = message.toLowerCase();

    // Urgent keywords
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') ||
        lowerMessage.includes('immediately') || lowerMessage.includes('asap')) {
      return 'urgent';
    }

    // High priority intents
    if (intent === 'complaint' || context.sessionState.currentIntent === 'complaint') {
      return 'high';
    }

    // Medium priority
    if (intent === 'booking' || intent === 'support') {
      return 'medium';
    }

    return 'low';
  }

  private calculateConfidence(message: string, intent: string, entities: Record<string, any>): number {
    let confidence = 0.5; // Base confidence

    // Intent matching increases confidence
    if (intent !== 'general') confidence += 0.2;

    // Entity extraction increases confidence
    confidence += Object.keys(entities).length * 0.1;

    // Message length affects confidence
    if (message.length > 10) confidence += 0.1;
    if (message.length > 50) confidence += 0.1;

    return Math.min(1, confidence);
  }

  private generateSuggestedActions(intent: string, entities: Record<string, any>, context: ConversationContext): string[] {
    const actions: string[] = [];

    switch (intent) {
      case 'booking':
        actions.push('show_available_services', 'check_availability', 'provide_pricing');
        break;
      case 'information':
        actions.push('provide_service_details', 'show_faq', 'suggest_resources');
        break;
      case 'complaint':
        actions.push('escalate_to_supervisor', 'offer_compensation', 'schedule_followup');
        break;
      case 'pricing':
        actions.push('show_pricing_tiers', 'explain_cost_factors', 'suggest_alternatives');
        break;
      case 'support':
        actions.push('provide_contact_options', 'offer_live_chat', 'create_support_ticket');
        break;
    }

    return actions;
  }

  private updateConversationStage(context: ConversationContext, analysis: NLPAnalysis) {
    const { intent, urgency } = analysis;

    if (context.messages.length <= 2) {
      context.sessionState.conversationStage = 'greeting';
    } else if (intent === 'booking' || context.sessionState.currentIntent === 'booking') {
      context.sessionState.conversationStage = 'action';
    } else if (intent === 'complaint' || urgency === 'high' || urgency === 'urgent') {
      context.sessionState.conversationStage = 'problem_solving';
    } else if (intent === 'information' || intent === 'general') {
      context.sessionState.conversationStage = 'information_gathering';
    } else {
      context.sessionState.conversationStage = 'closing';
    }
  }

  private async generateContextualResponse(context: ConversationContext, analysis: NLPAnalysis): Promise<ContextualResponse> {
    const { intent, entities, sentiment, urgency } = analysis;

    // Context-aware response generation
    let message = '';
    const actions: ContextualResponse['actions'] = [];
    const contextUpdates: Record<string, any> = {};

    switch (context.sessionState.conversationStage) {
      case 'greeting':
        message = this.generateGreetingResponse(context, sentiment);
        break;

      case 'information_gathering':
        message = this.generateInformationResponse(context, intent, entities);
        break;

      case 'problem_solving':
        message = this.generateProblemSolvingResponse(context, intent, urgency);
        actions.push({
          type: 'escalation',
          data: { reason: 'high_priority_issue' },
          priority: 9
        });
        break;

      case 'action':
        message = this.generateActionResponse(context, intent, entities);
        if (intent === 'booking') {
          actions.push({
            type: 'booking',
            data: { service: entities.service?.value, date: entities.datetime?.value },
            priority: 8
          });
        }
        break;

      case 'closing':
        message = this.generateClosingResponse(context, sentiment);
        break;
    }

    // Add follow-up questions if needed
    const followUpQuestions = this.generateFollowUpQuestions(context, analysis);

    // Update context variables
    if (entities.service) {
      contextUpdates.preferredService = entities.service.value;
    }
    if (entities.location) {
      contextUpdates.preferredLocation = entities.location.value;
    }

    return {
      message,
      confidence: analysis.confidence,
      actions,
      followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined,
      contextUpdates
    };
  }

  private generateGreetingResponse(context: ConversationContext, sentiment: number): string {
    const greetings = [
      "Hello! I'm your AI assistant for Garlaws Property Maintenance. How can I help you today?",
      "Hi there! Welcome to Garlaws. What can I assist you with regarding your property maintenance needs?",
      "Greetings! I'm here to help with all your property maintenance questions and bookings."
    ];

    let greeting = greetings[Math.floor(Math.random() * greetings.length)];

    // Personalize based on user history
    if (context.userProfile.bookingHistory.length > 0) {
      greeting = `Welcome back! I see you've worked with us before. How can I assist you today?`;
    }

    if (sentiment < -0.3) {
      greeting = "I sense you might be frustrated. I'm here to help resolve any issues you have.";
    }

    return greeting;
  }

  private generateInformationResponse(context: ConversationContext, intent: string, entities: Record<string, any>): string {
    if (entities.service) {
      return `I'd be happy to tell you more about our ${entities.service.value} services. We offer comprehensive solutions with certified professionals. Would you like me to explain our process or provide pricing information?`;
    }

    if (intent === 'pricing') {
      return "Our pricing depends on the service type, property size, and specific requirements. For basic maintenance, prices start from R850. Would you like a detailed quote for a specific service?";
    }

    return "I can help you with information about our services, pricing, booking process, or any other questions about property maintenance. What would you like to know?";
  }

  private generateProblemSolvingResponse(context: ConversationContext, intent: string, urgency: string): string {
    if (urgency === 'urgent' || urgency === 'high') {
      return "I understand this is urgent. Let me connect you with our senior support team who can address this immediately. Would you like me to escalate this to a human representative right away?";
    }

    return "I'm sorry to hear you're experiencing issues. Let me help resolve this for you. Can you tell me more details about what's happening so I can provide the best solution?";
  }

  private generateActionResponse(context: ConversationContext, intent: string, entities: Record<string, any>): string {
    if (intent === 'booking') {
      const service = entities.service?.value || 'service';
      const date = entities.datetime?.value || 'preferred time';

      return `Great! I'd be happy to help you book ${service}. Let me check availability for ${date}. Could you please provide your property location so I can find the best local professionals?`;
    }

    return "I'm ready to help you take action. Let me guide you through the process step by step.";
  }

  private generateClosingResponse(context: ConversationContext, sentiment: number): string {
    if (sentiment > 0.3) {
      return "I'm glad I could help! If you need anything else in the future, don't hesitate to reach out. Have a great day!";
    }

    if (sentiment < -0.3) {
      return "I apologize that I couldn't fully resolve your concerns. Our team will follow up with you shortly. Please don't hesitate to contact us again.";
    }

    return "Thank you for chatting with me today. If you have any more questions, I'm here to help. Take care!";
  }

  private generateFollowUpQuestions(context: ConversationContext, analysis: NLPAnalysis): string[] {
    const questions: string[] = [];

    if (analysis.intent === 'booking' && !analysis.entities.location) {
      questions.push("What's your property location so I can find local service providers?");
    }

    if (analysis.intent === 'booking' && !analysis.entities.datetime) {
      questions.push("When would you prefer the service to be scheduled?");
    }

    if (analysis.intent === 'complaint' && context.messages.length < 5) {
      questions.push("Can you tell me more details about the issue you're experiencing?");
    }

    return questions;
  }

  private updateLearnedPatterns(context: ConversationContext, analysis: NLPAnalysis, response: ContextualResponse) {
    // Simple learning mechanism - in real implementation, use ML
    const pattern = {
      pattern: analysis.intent,
      response: response.message.substring(0, 100),
      successRate: response.confidence,
      lastUsed: new Date()
    };

    // Keep only recent patterns
    context.memory.learnedPatterns.push(pattern);
    if (context.memory.learnedPatterns.length > 10) {
      context.memory.learnedPatterns.shift();
    }
  }

  private generateConversationSummary(context: ConversationContext): string {
    const messageCount = context.messages.length;
    const userMessages = context.messages.filter(m => m.sender === 'user');

    if (messageCount < 3) {
      return "Brief conversation about initial inquiry.";
    }

    const mainTopics = [...new Set(userMessages.flatMap(m => this.extractTopics(m.content)))];
    const intents = [...new Set(userMessages.map(m => m.intent).filter(Boolean))];

    let summary = `Conversation covered ${mainTopics.length} main topics: ${mainTopics.join(', ')}. `;
    summary += `Primary intents: ${intents.join(', ')}. `;

    if (context.sessionState.pendingActions.length > 0) {
      summary += `Actions pending: ${context.sessionState.pendingActions.join(', ')}.`;
    }

    return summary;
  }

  private generateFollowUpSuggestions(context: ConversationContext): string[] {
    const suggestions: string[] = [];

    if (context.sessionState.pendingActions.includes('booking')) {
      suggestions.push("Complete your service booking");
    }

    if (context.sessionState.currentIntent === 'complaint') {
      suggestions.push("Follow up on your support request");
    }

    if (context.messages.length > 10) {
      suggestions.push("Schedule regular maintenance check");
    }

    return suggestions;
  }
}

export const enhancedNLPService = new EnhancedNLPService();