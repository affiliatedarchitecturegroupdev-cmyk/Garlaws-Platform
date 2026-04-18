// Advanced Sentiment Analysis and Customer Insights Engine
export interface CustomerFeedback {
  id: string;
  customerId: string;
  type: 'review' | 'complaint' | 'suggestion' | 'survey' | 'chat';
  content: string;
  rating?: number; // 1-5 scale
  timestamp: Date;
  category?: string;
  tags?: string[];
  sentiment?: number; // -1 to 1
  urgency?: 'low' | 'medium' | 'high';
  channel: 'website' | 'mobile' | 'phone' | 'email' | 'chat';
}

export interface SentimentAnalysis {
  overallSentiment: number; // -1 to 1
  confidence: number; // 0-1
  emotions: Array<{
    emotion: string;
    intensity: number; // 0-1
  }>;
  topics: Array<{
    topic: string;
    sentiment: number;
    mentions: number;
  }>;
  keywords: Array<{
    word: string;
    sentiment: number;
    frequency: number;
  }>;
}

export interface CustomerInsights {
  customerId: string;
  profile: {
    totalInteractions: number;
    averageRating: number;
    preferredChannel: string;
    lastInteraction: Date;
    lifetimeValue: number;
  };
  sentiment: {
    overall: number;
    trend: 'improving' | 'declining' | 'stable';
    recentChange: number;
  };
  preferences: {
    serviceTypes: string[];
    priceSensitivity: number; // 0-1
    qualityImportance: number; // 0-1
    speedImportance: number; // 0-1
  };
  behavior: {
    bookingFrequency: number;
    complaintRate: number;
    referralLikelihood: number;
    churnRisk: number;
  };
  recommendations: string[];
}

export interface FeedbackAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  totalFeedback: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topIssues: Array<{
    issue: string;
    frequency: number;
    averageSentiment: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  topCompliments: Array<{
    compliment: string;
    frequency: number;
    averageSentiment: number;
  }>;
  channelPerformance: Record<string, {
    volume: number;
    averageSentiment: number;
    responseRate: number;
  }>;
  actionableInsights: Array<{
    insight: string;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
    priority: number;
  }>;
  trends: {
    sentiment: 'improving' | 'declining' | 'stable';
    volume: 'increasing' | 'decreasing' | 'stable';
    issues: Array<{
      issue: string;
      change: number;
    }>;
  };
}

class SentimentAnalysisEngine {
  private lexicon: Map<string, number> = new Map();
  private feedbackData: Map<string, CustomerFeedback[]> = new Map();

  constructor() {
    this.initializeSentimentLexicon();
  }

  private initializeSentimentLexicon() {
    // Positive words
    const positiveWords = [
      'excellent', 'amazing', 'fantastic', 'great', 'good', 'wonderful', 'perfect',
      'outstanding', 'brilliant', 'superb', 'awesome', 'incredible', 'marvelous',
      'exceptional', 'splendid', 'terrific', 'fabulous', 'phenomenal', 'magnificent',
      'delightful', 'pleasing', 'satisfying', 'gratifying', 'rewarding', 'enjoyable',
      'pleasurable', 'thrilling', 'exciting', 'happy', 'joyful', 'cheerful',
      'content', 'pleased', 'glad', 'thankful', 'grateful', 'appreciative'
    ];

    // Negative words
    const negativeWords = [
      'terrible', 'awful', 'horrible', 'dreadful', 'abhorrent', 'abominable',
      'appalling', 'atrocious', 'dismal', 'dire', 'disastrous', 'dreadful',
      'egregious', 'flagrant', 'ghastly', 'grievous', 'heinous', 'hideous',
      'horrendous', 'horrific', 'horrifying', 'infamous', 'lurid', 'monstrous',
      'nefarious', 'nightmarish', 'offensive', 'outrageous', 'repugnant',
      'revolting', 'scandalous', 'shameful', 'shocking', 'unspeakable',
      'vile', 'villainous', 'wicked', 'wrong', 'bad', 'poor', 'inferior'
    ];

    // Intensifiers
    const intensifiers = ['very', 'extremely', 'highly', 'incredibly', 'absolutely', 'totally', 'completely'];

    // Negations
    const negations = ['not', 'never', 'no', 'none', 'nothing', 'nobody', 'nowhere'];

    // Initialize lexicon
    positiveWords.forEach(word => this.lexicon.set(word, 0.8));
    negativeWords.forEach(word => this.lexicon.set(word, -0.8));
    intensifiers.forEach(word => this.lexicon.set(word, 0.3));
    negations.forEach(word => this.lexicon.set(word, -0.5));
  }

  // Analyze sentiment of text
  analyzeSentiment(text: string): SentimentAnalysis {
    const words = this.tokenizeAndClean(text);
    let sentimentScore = 0;
    let wordCount = 0;
    const wordSentiments: Array<{ word: string; sentiment: number }> = [];

    // Analyze each word
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase();
      const baseSentiment = this.lexicon.get(word) || 0;

      if (baseSentiment !== 0) {
        let adjustedSentiment = baseSentiment;

        // Check for intensifiers before this word
        for (let j = Math.max(0, i - 3); j < i; j++) {
          const prevWord = words[j].toLowerCase();
          const intensifier = this.lexicon.get(prevWord);
          if (intensifier && intensifier > 0 && intensifier < 0.5) {
            adjustedSentiment *= (1 + intensifier);
          }
        }

        // Check for negations
        for (let j = Math.max(0, i - 2); j < i; j++) {
          const prevWord = words[j].toLowerCase();
          const negation = this.lexicon.get(prevWord);
          if (negation && negation < -0.3) {
            adjustedSentiment *= -1;
          }
        }

        sentimentScore += adjustedSentiment;
        wordCount++;
        wordSentiments.push({ word, sentiment: adjustedSentiment });
      }
    }

    const normalizedSentiment = wordCount > 0 ? sentimentScore / wordCount : 0;
    const overallSentiment = Math.max(-1, Math.min(1, normalizedSentiment));

    // Extract emotions
    const emotions = this.extractEmotions(text, wordSentiments);

    // Extract topics
    const topics = this.extractTopics(text);

    // Extract keywords
    const keywords = this.extractKeywords(wordSentiments);

    return {
      overallSentiment,
      confidence: Math.min(0.9, wordCount / 10), // Confidence based on word count
      emotions,
      topics,
      keywords: keywords.slice(0, 10) // Top 10 keywords
    };
  }

  // Add customer feedback for analysis
  addFeedback(feedback: CustomerFeedback): void {
    if (!this.feedbackData.has(feedback.customerId)) {
      this.feedbackData.set(feedback.customerId, []);
    }

    // Analyze sentiment if not provided
    if (feedback.sentiment === undefined) {
      const analysis = this.analyzeSentiment(feedback.content);
      feedback.sentiment = analysis.overallSentiment;
    }

    this.feedbackData.get(feedback.customerId)!.push(feedback);
  }

  // Generate customer insights
  generateCustomerInsights(customerId: string): CustomerInsights {
    const feedback = this.feedbackData.get(customerId) || [];

    if (feedback.length === 0) {
      return this.getDefaultInsights(customerId);
    }

    // Calculate profile metrics
    const totalInteractions = feedback.length;
    const averageRating = feedback
      .filter(f => f.rating)
      .reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.filter(f => f.rating).length || 0;

    const channelCounts = feedback.reduce((acc, f) => {
      acc[f.channel] = (acc[f.channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const preferredChannel = Object.entries(channelCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'website';

    const lastInteraction = feedback
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]?.timestamp || new Date();

    // Calculate sentiment metrics
    const sentiments = feedback.map(f => f.sentiment || 0);
    const overallSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;

    // Calculate sentiment trend (simplified)
    const recentFeedback = feedback
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, Math.ceil(feedback.length / 3));

    const recentSentiment = recentFeedback
      .map(f => f.sentiment || 0)
      .reduce((a, b) => a + b, 0) / recentFeedback.length;

    const olderFeedback = feedback.slice(Math.ceil(feedback.length / 3));
    const olderSentiment = olderFeedback.length > 0
      ? olderFeedback.map(f => f.sentiment || 0).reduce((a, b) => a + b, 0) / olderFeedback.length
      : overallSentiment;

    const sentimentChange = recentSentiment - olderSentiment;
    const trend = sentimentChange > 0.1 ? 'improving' :
                 sentimentChange < -0.1 ? 'declining' : 'stable';

    // Infer preferences from feedback
    const preferences = this.inferPreferences(feedback);

    // Calculate behavior metrics
    const behavior = this.calculateBehaviorMetrics(feedback);

    // Generate recommendations
    const recommendations = this.generateCustomerRecommendations(feedback, overallSentiment, behavior);

    return {
      customerId,
      profile: {
        totalInteractions,
        averageRating,
        preferredChannel,
        lastInteraction,
        lifetimeValue: this.calculateLifetimeValue(feedback)
      },
      sentiment: {
        overall: overallSentiment,
        trend,
        recentChange: sentimentChange
      },
      preferences,
      behavior,
      recommendations
    };
  }

  // Generate comprehensive feedback analytics
  generateFeedbackAnalytics(startDate: Date, endDate: Date): FeedbackAnalytics {
    const allFeedback = Array.from(this.feedbackData.values()).flat()
      .filter(f => f.timestamp >= startDate && f.timestamp <= endDate);

    const totalFeedback = allFeedback.length;

    // Sentiment distribution
    const sentiments = allFeedback.map(f => f.sentiment || 0);
    const positive = sentiments.filter(s => s > 0.1).length;
    const neutral = sentiments.filter(s => s >= -0.1 && s <= 0.1).length;
    const negative = sentiments.filter(s => s < -0.1).length;

    // Top issues and compliments
    const topIssues = this.analyzeTopIssues(allFeedback);
    const topCompliments = this.analyzeTopCompliments(allFeedback);

    // Channel performance
    const channelPerformance = this.analyzeChannelPerformance(allFeedback);

    // Actionable insights
    const actionableInsights = this.generateActionableInsights(allFeedback, topIssues, channelPerformance);

    // Trends
    const trends = this.analyzeFeedbackTrends(allFeedback, startDate, endDate);

    return {
      period: { start: startDate, end: endDate },
      totalFeedback,
      sentimentDistribution: {
        positive,
        neutral,
        negative
      },
      topIssues,
      topCompliments,
      channelPerformance,
      actionableInsights,
      trends
    };
  }

  // Helper methods
  private tokenizeAndClean(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  private extractEmotions(text: string, wordSentiments: Array<{ word: string; sentiment: number }>): Array<{ emotion: string; intensity: number }> {
    const emotions: Array<{ emotion: string; intensity: number }> = [];

    // Simple emotion detection based on keywords
    const emotionKeywords = {
      anger: ['angry', 'frustrated', 'annoyed', 'irritated', 'furious'],
      joy: ['happy', 'joyful', 'delighted', 'pleased', 'excited'],
      sadness: ['sad', 'disappointed', 'unhappy', 'sorry', 'regretful'],
      fear: ['worried', 'concerned', 'anxious', 'scared', 'nervous'],
      surprise: ['amazed', 'shocked', 'surprised', 'unexpected'],
      trust: ['confident', 'reliable', 'trustworthy', 'dependable']
    };

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword =>
        text.toLowerCase().includes(keyword) ||
        wordSentiments.some(ws => ws.word.includes(keyword))
      );

      if (matches.length > 0) {
        const intensity = Math.min(1, matches.length / 3); // Normalize intensity
        emotions.push({ emotion, intensity });
      }
    });

    return emotions.sort((a, b) => b.intensity - a.intensity);
  }

  private extractTopics(text: string): Array<{ topic: string; sentiment: number; mentions: number }> {
    const topics: Record<string, { sentiment: number[]; count: number }> = {};

    // Topic keywords
    const topicKeywords = {
      service: ['service', 'maintenance', 'repair', 'technician', 'work'],
      quality: ['quality', 'professional', 'skilled', 'experienced', 'expert'],
      pricing: ['price', 'cost', 'expensive', 'cheap', 'value', 'affordable'],
      timing: ['time', 'delay', 'late', 'early', 'schedule', 'wait'],
      communication: ['communication', 'contact', 'response', 'call', 'email'],
      cleanliness: ['clean', 'tidy', 'messy', 'dirty', 'organized']
    };

    const words = this.tokenizeAndClean(text);
    const analysis = this.analyzeSentiment(text);

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      const mentions = keywords.filter(keyword =>
        words.some(word => word.includes(keyword))
      ).length;

      if (mentions > 0) {
        if (!topics[topic]) {
          topics[topic] = { sentiment: [], count: 0 };
        }
        topics[topic].sentiment.push(analysis.overallSentiment);
        topics[topic].count += mentions;
      }
    });

    return Object.entries(topics).map(([topic, data]) => ({
      topic,
      sentiment: data.sentiment.reduce((a, b) => a + b, 0) / data.sentiment.length,
      mentions: data.count
    })).sort((a, b) => b.mentions - a.mentions);
  }

  private extractKeywords(wordSentiments: Array<{ word: string; sentiment: number }>): Array<{ word: string; sentiment: number; frequency: number }> {
    const keywordMap = new Map<string, { sentiment: number[]; count: number }>();

    wordSentiments.forEach(({ word, sentiment }) => {
      if (!keywordMap.has(word)) {
        keywordMap.set(word, { sentiment: [], count: 0 });
      }
      const data = keywordMap.get(word)!;
      data.sentiment.push(sentiment);
      data.count++;
    });

    return Array.from(keywordMap.entries())
      .map(([word, data]) => ({
        word,
        sentiment: data.sentiment.reduce((a, b) => a + b, 0) / data.sentiment.length,
        frequency: data.count
      }))
      .filter(item => item.frequency > 1) // Only keywords that appear multiple times
      .sort((a, b) => b.frequency - a.frequency);
  }

  private getDefaultInsights(customerId: string): CustomerInsights {
    return {
      customerId,
      profile: {
        totalInteractions: 0,
        averageRating: 0,
        preferredChannel: 'website',
        lastInteraction: new Date(),
        lifetimeValue: 0
      },
      sentiment: {
        overall: 0,
        trend: 'stable',
        recentChange: 0
      },
      preferences: {
        serviceTypes: [],
        priceSensitivity: 0.5,
        qualityImportance: 0.5,
        speedImportance: 0.5
      },
      behavior: {
        bookingFrequency: 0,
        complaintRate: 0,
        referralLikelihood: 0.5,
        churnRisk: 0.5
      },
      recommendations: ['Collect more feedback to generate personalized insights']
    };
  }

  private inferPreferences(feedback: CustomerFeedback[]): CustomerInsights['preferences'] {
    const serviceTypes = [...new Set(
      feedback
        .filter(f => f.category)
        .map(f => f.category!)
    )];

    // Analyze feedback for preference indicators
    const priceMentions = feedback.filter(f =>
      f.content.toLowerCase().includes('price') ||
      f.content.toLowerCase().includes('cost') ||
      f.content.toLowerCase().includes('expensive')
    ).length;

    const qualityMentions = feedback.filter(f =>
      f.content.toLowerCase().includes('quality') ||
      f.content.toLowerCase().includes('professional') ||
      f.content.toLowerCase().includes('skilled')
    ).length;

    const speedMentions = feedback.filter(f =>
      f.content.toLowerCase().includes('fast') ||
      f.content.toLowerCase().includes('quick') ||
      f.content.toLowerCase().includes('time')
    ).length;

    const totalMentions = priceMentions + qualityMentions + speedMentions;

    return {
      serviceTypes,
      priceSensitivity: totalMentions > 0 ? priceMentions / totalMentions : 0.5,
      qualityImportance: totalMentions > 0 ? qualityMentions / totalMentions : 0.5,
      speedImportance: totalMentions > 0 ? speedMentions / totalMentions : 0.5
    };
  }

  private calculateBehaviorMetrics(feedback: CustomerFeedback[]): CustomerInsights['behavior'] {
    const totalFeedback = feedback.length;
    const complaints = feedback.filter(f => f.type === 'complaint').length;
    const positiveFeedback = feedback.filter(f => (f.sentiment || 0) > 0.3).length;

    // Simplified calculations
    return {
      bookingFrequency: totalFeedback / 30, // Per month
      complaintRate: totalFeedback > 0 ? complaints / totalFeedback : 0,
      referralLikelihood: positiveFeedback / Math.max(totalFeedback, 1),
      churnRisk: complaints > positiveFeedback ? 0.8 : 0.2
    };
  }

  private generateCustomerRecommendations(
    feedback: CustomerFeedback[],
    sentiment: number,
    behavior: CustomerInsights['behavior']
  ): string[] {
    const recommendations: string[] = [];

    if (sentiment < -0.3) {
      recommendations.push('Address customer concerns to improve satisfaction');
      recommendations.push('Follow up personally to resolve outstanding issues');
    }

    if (behavior.complaintRate > 0.3) {
      recommendations.push('Implement proactive communication to prevent complaints');
    }

    if (behavior.churnRisk > 0.6) {
      recommendations.push('High churn risk - consider loyalty incentives');
    }

    if (behavior.referralLikelihood > 0.7) {
      recommendations.push('Satisfied customer - excellent candidate for referrals');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue providing excellent service');
    }

    return recommendations;
  }

  private calculateLifetimeValue(feedback: CustomerFeedback[]): number {
    // Simplified calculation based on feedback volume and sentiment
    const baseValue = feedback.length * 100; // R100 per interaction
    const sentimentMultiplier = (feedback
      .map(f => f.sentiment || 0)
      .reduce((a, b) => a + b, 0) / feedback.length + 1) / 2; // 0.5 to 1.5

    return Math.round(baseValue * sentimentMultiplier);
  }

  private analyzeTopIssues(feedback: CustomerFeedback[]): Array<{ issue: string; frequency: number; averageSentiment: number; trend: 'increasing' | 'decreasing' | 'stable' }> {
    const issues: Record<string, { count: number; sentiments: number[]; timestamps: Date[] }> = {};

    feedback.forEach(f => {
      if (f.type === 'complaint' && f.category) {
        if (!issues[f.category]) {
          issues[f.category] = { count: 0, sentiments: [], timestamps: [] };
        }
        issues[f.category].count++;
        issues[f.category].sentiments.push(f.sentiment || 0);
        issues[f.category].timestamps.push(f.timestamp);
      }
    });

    return Object.entries(issues)
      .map(([issue, data]) => ({
        issue,
        frequency: data.count,
        averageSentiment: data.sentiments.reduce((a, b) => a + b, 0) / data.sentiments.length,
        trend: this.calculateTrend(data.timestamps.map(() => data.count)) // Simplified
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  }

  private analyzeTopCompliments(feedback: CustomerFeedback[]): Array<{ compliment: string; frequency: number; averageSentiment: number }> {
    const compliments: Record<string, { count: number; sentiments: number[] }> = {};

    feedback.forEach(f => {
      if (f.sentiment && f.sentiment > 0.5 && f.category) {
        if (!compliments[f.category]) {
          compliments[f.category] = { count: 0, sentiments: [] };
        }
        compliments[f.category].count++;
        compliments[f.category].sentiments.push(f.sentiment);
      }
    });

    return Object.entries(compliments)
      .map(([compliment, data]) => ({
        compliment,
        frequency: data.count,
        averageSentiment: data.sentiments.reduce((a, b) => a + b, 0) / data.sentiments.length
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  }

  private analyzeChannelPerformance(feedback: CustomerFeedback[]): Record<string, { volume: number; averageSentiment: number; responseRate: number }> {
    const channels: Record<string, { volume: number; sentiments: number[]; responses: number }> = {};

    feedback.forEach(f => {
      if (!channels[f.channel]) {
        channels[f.channel] = { volume: 0, sentiments: [], responses: 0 };
      }
      channels[f.channel].volume++;
      if (f.sentiment !== undefined) {
        channels[f.channel].sentiments.push(f.sentiment);
      }
      // Simplified response rate calculation
      if (f.timestamp.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
        channels[f.channel].responses++;
      }
    });

    const result: Record<string, { volume: number; averageSentiment: number; responseRate: number }> = {};
    Object.entries(channels).forEach(([channel, data]) => {
      result[channel] = {
        volume: data.volume,
        averageSentiment: data.sentiments.length > 0
          ? data.sentiments.reduce((a, b) => a + b, 0) / data.sentiments.length
          : 0,
        responseRate: data.volume > 0 ? data.responses / data.volume : 0
      };
    });

    return result;
  }

  private generateActionableInsights(
    feedback: CustomerFeedback[],
    topIssues: Array<{ issue: string; frequency: number; averageSentiment: number; trend: string }>,
    channelPerformance: Record<string, any>
  ): Array<{ insight: string; impact: 'high' | 'medium' | 'low'; recommendation: string; priority: number }> {
    const insights: Array<{ insight: string; impact: 'high' | 'medium' | 'low'; recommendation: string; priority: number }> = [];

    // Issue-based insights
    topIssues.forEach(issue => {
      if (issue.frequency > feedback.length * 0.1) { // More than 10% of feedback
        insights.push({
          insight: `High frequency of ${issue.issue} complaints (${issue.frequency} mentions)`,
          impact: 'high',
          recommendation: `Implement immediate fixes for ${issue.issue} and communicate improvements`,
          priority: 9
        });
      }
    });

    // Channel performance insights
    Object.entries(channelPerformance).forEach(([channel, perf]) => {
      if (perf.averageSentiment < -0.2) {
        insights.push({
          insight: `${channel} channel has poor sentiment (${(perf.averageSentiment * 100).toFixed(0)}%)`,
          impact: 'medium',
          recommendation: `Improve ${channel} experience and response times`,
          priority: 7
        });
      }
    });

    // Overall sentiment insights
    const overallSentiment = feedback
      .map(f => f.sentiment || 0)
      .reduce((a, b) => a + b, 0) / feedback.length;

    if (overallSentiment < 0) {
      insights.push({
        insight: `Overall customer sentiment is negative (${(overallSentiment * 100).toFixed(0)}%)`,
        impact: 'high',
        recommendation: 'Conduct customer satisfaction survey and implement improvement plan',
        priority: 10
      });
    }

    return insights.sort((a, b) => b.priority - a.priority);
  }

  private analyzeFeedbackTrends(
    feedback: CustomerFeedback[],
    startDate: Date,
    endDate: Date
  ): FeedbackAnalytics['trends'] {
    const midpoint = new Date((startDate.getTime() + endDate.getTime()) / 2);

    const firstHalf = feedback.filter(f => f.timestamp < midpoint);
    const secondHalf = feedback.filter(f => f.timestamp >= midpoint);

    const firstHalfSentiment = firstHalf.length > 0
      ? firstHalf.map(f => f.sentiment || 0).reduce((a, b) => a + b, 0) / firstHalf.length
      : 0;

    const secondHalfSentiment = secondHalf.length > 0
      ? secondHalf.map(f => f.sentiment || 0).reduce((a, b) => a + b, 0) / secondHalf.length
      : 0;

    const sentimentChange = secondHalfSentiment - firstHalfSentiment;
    const sentimentTrend = sentimentChange > 0.05 ? 'improving' :
                          sentimentChange < -0.05 ? 'declining' : 'stable';

    const volumeChange = secondHalf.length - firstHalf.length;
    const volumeTrend: 'increasing' | 'decreasing' | 'stable' = volumeChange > 2 ? 'increasing' :
                       volumeChange < -2 ? 'decreasing' : 'stable';

    // Simplified issue trend analysis
    const issues: Record<string, number[]> = {};
    feedback.forEach(f => {
      if (f.type === 'complaint' && f.category) {
        if (!issues[f.category]) issues[f.category] = [0, 0];
        if (f.timestamp < midpoint) {
          issues[f.category][0]++;
        } else {
          issues[f.category][1]++;
        }
      }
    });

    const issueTrends = Object.entries(issues)
      .map(([issue, [first, second]]) => ({
        issue,
        change: second - first
      }))
      .filter(item => Math.abs(item.change) > 1);

    return {
      sentiment: sentimentTrend,
      volume: volumeTrend,
      issues: issueTrends
    };
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const recent = values.slice(-Math.ceil(values.length / 2));
    const earlier = values.slice(0, Math.floor(values.length / 2));

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

    const change = recentAvg - earlierAvg;

    return change > 0.1 ? 'increasing' : change < -0.1 ? 'decreasing' : 'stable';
  }
}

export const sentimentAnalysisEngine = new SentimentAnalysisEngine();