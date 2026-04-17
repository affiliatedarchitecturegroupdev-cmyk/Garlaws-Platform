interface AIResponse {
  message: string;
  suggestions?: string[];
  actions?: Array<{
    type: 'booking' | 'support' | 'navigation';
    label: string;
    data?: any;
  }>;
}

class AIChatService {
  private knowledgeBase = {
    greetings: [
      "Hello! I'm your AI assistant for Garlaws Property Maintenance. How can I help you today?",
      "Hi there! I'm here to assist with your property maintenance needs. What can I do for you?",
      "Welcome to Garlaws! I'm your intelligent assistant. How may I help you?"
    ],

    booking: {
      keywords: ['book', 'schedule', 'appointment', 'service', 'maintenance'],
      responses: [
        "I'd be happy to help you book a service! What type of maintenance do you need?",
        "Great! I can help you schedule a service. What property needs maintenance?",
        "Let's get you booked! Tell me what service you're looking for."
      ],
      suggestions: [
        "Garden Maintenance",
        "Pool Cleaning",
        "Electrical Inspection",
        "Plumbing Services",
        "Landscaping"
      ]
    },

    support: {
      keywords: ['help', 'problem', 'issue', 'support', 'ticket'],
      responses: [
        "I'm here to help! Could you describe the issue you're experiencing?",
        "I'd be glad to assist you. What seems to be the problem?",
        "Let me help you resolve this. Can you tell me more about what's happening?"
      ],
      suggestions: [
        "Technical Issues",
        "Billing Questions",
        "Account Problems",
        "Service Quality",
        "General Support"
      ]
    },

    status: {
      keywords: ['status', 'check', 'update', 'progress'],
      responses: [
        "I can help you check the status of your bookings or support tickets. What would you like to check?",
        "Let me check that for you. Are you looking for booking status or support ticket updates?"
      ]
    }
  };

  async generateResponse(message: string, context?: any): Promise<AIResponse> {
    const lowerMessage = message.toLowerCase();

    // Check for greetings
    if (this.isGreeting(lowerMessage)) {
      return {
        message: this.getRandomResponse(this.knowledgeBase.greetings),
        suggestions: ['Book a service', 'Check booking status', 'Get support help']
      };
    }

    // Check for booking-related queries
    if (this.containsKeywords(lowerMessage, this.knowledgeBase.booking.keywords)) {
      return {
        message: this.getRandomResponse(this.knowledgeBase.booking.responses),
        suggestions: this.knowledgeBase.booking.suggestions,
        actions: [{
          type: 'booking',
          label: 'Browse Services',
          data: { action: 'browse_services' }
        }]
      };
    }

    // Check for support queries
    if (this.containsKeywords(lowerMessage, this.knowledgeBase.support.keywords)) {
      return {
        message: this.getRandomResponse(this.knowledgeBase.support.responses),
        suggestions: this.knowledgeBase.support.suggestions,
        actions: [{
          type: 'support',
          label: 'Create Support Ticket',
          data: { action: 'create_ticket' }
        }]
      };
    }

    // Check for status queries
    if (this.containsKeywords(lowerMessage, this.knowledgeBase.status.keywords)) {
      return {
        message: this.getRandomResponse(this.knowledgeBase.status.responses),
        actions: [
          {
            type: 'navigation',
            label: 'View My Bookings',
            data: { path: '/dashboard/bookings' }
          },
          {
            type: 'navigation',
            label: 'Check Support Tickets',
            data: { path: '/dashboard/support' }
          }
        ]
      };
    }

    // Default response with helpful suggestions
    return {
      message: "I'm not sure I understand. Let me help you with some common tasks:",
      suggestions: [
        'Book a maintenance service',
        'Check my booking status',
        'Get help with an issue',
        'Browse available services'
      ],
      actions: [
        {
          type: 'navigation',
          label: 'Browse All Services',
          data: { path: '/services' }
        },
        {
          type: 'support',
          label: 'Contact Support',
          data: { action: 'contact_support' }
        }
      ]
    };
  }

  private isGreeting(message: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'];
    return greetings.some(greeting => message.includes(greeting));
  }

  private containsKeywords(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword));
  }

  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const aiChatService = new AIChatService();