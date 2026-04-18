"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardActions } from '@/components/MobileCard';
import { sentimentAnalysisEngine, type FeedbackAnalytics, type CustomerInsights } from '@/lib/sentiment-analysis-engine';

interface SentimentIndicatorProps {
  sentiment: number;
  size?: 'sm' | 'md' | 'lg';
}

function SentimentIndicator({ sentiment, size = 'md' }: SentimentIndicatorProps) {
  const getSentimentColor = (s: number) => {
    if (s > 0.3) return 'text-green-500';
    if (s < -0.3) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getSentimentEmoji = (s: number) => {
    if (s > 0.3) return '😊';
    if (s < -0.3) return '😞';
    return '😐';
  };

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-2 ${getSentimentColor(sentiment)}`}>
      <span className={sizeClasses[size]}>{getSentimentEmoji(sentiment)}</span>
      <span className="font-semibold">{(sentiment * 100).toFixed(0)}%</span>
    </div>
  );
}

interface CustomerInsightCardProps {
  insights: CustomerInsights;
}

function CustomerInsightCard({ insights }: CustomerInsightCardProps) {
  const getRiskColor = (risk: number) => {
    if (risk > 0.7) return 'text-red-500 bg-red-500/20';
    if (risk > 0.5) return 'text-orange-500 bg-orange-500/20';
    return 'text-green-500 bg-green-500/20';
  };

  return (
    <MobileCard>
      <MobileCardHeader
        title={`Customer ${insights.customerId}`}
        subtitle={`${insights.profile.totalInteractions} interactions • Last: ${insights.profile.lastInteraction.toLocaleDateString()}`}
        avatar={<span className="text-2xl">👤</span>}
      />

      <MobileCardContent>
        <div className="space-y-4">
          {/* Sentiment Overview */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#45a29e]">Overall Sentiment:</span>
            <SentimentIndicator sentiment={insights.sentiment.overall} size="sm" />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-[#45a29e]">Trend:</span>
            <span className={`text-sm font-semibold capitalize ${
              insights.sentiment.trend === 'improving' ? 'text-green-500' :
              insights.sentiment.trend === 'declining' ? 'text-red-500' :
              'text-blue-500'
            }`}>
              {insights.sentiment.trend}
            </span>
          </div>

          {/* Behavior Metrics */}
          <div className="p-3 bg-[#1f2833] rounded-lg">
            <h4 className="text-sm font-semibold text-[#c5a059] mb-2">Behavior Insights</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[#45a29e]">Complaint Rate:</span>
                <div className="font-semibold">{(insights.behavior.complaintRate * 100).toFixed(1)}%</div>
              </div>
              <div>
                <span className="text-[#45a29e]">Referral Likelihood:</span>
                <div className="font-semibold">{(insights.behavior.referralLikelihood * 100).toFixed(1)}%</div>
              </div>
              <div>
                <span className={`font-semibold ${insights.behavior.churnRisk > 0.5 ? 'text-red-400' : 'text-green-400'}`}>
                  Churn Risk: {(insights.behavior.churnRisk * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="text-[#45a29e]">Booking Freq:</span>
                <div className="font-semibold">{insights.behavior.bookingFrequency.toFixed(1)}/month</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {insights.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[#c5a059] mb-2">Recommendations:</h4>
              <ul className="text-sm text-[#45a29e] space-y-1">
                {insights.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#c5a059] mt-1">💡</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </MobileCardContent>

      <MobileCardActions>
        <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm">
          View Details
        </button>
        <button className="px-4 py-2 bg-[#45a29e] text-white rounded-lg font-medium text-sm">
          Contact Customer
        </button>
      </MobileCardActions>
    </MobileCard>
  );
}

export default function SentimentAnalysisPage() {
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsights[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const handleGenerateAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (selectedPeriod) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      // Generate mock analytics data
      const mockAnalytics: FeedbackAnalytics = {
        period: { start: startDate, end: endDate },
        totalFeedback: 1247,
        sentimentDistribution: {
          positive: 834,
          neutral: 289,
          negative: 124
        },
        topIssues: [
          {
            issue: 'Service Delays',
            frequency: 89,
            averageSentiment: -0.65,
            trend: 'increasing'
          },
          {
            issue: 'Communication',
            frequency: 67,
            averageSentiment: -0.45,
            trend: 'stable'
          },
          {
            issue: 'Pricing',
            frequency: 45,
            averageSentiment: -0.38,
            trend: 'decreasing'
          }
        ],
        topCompliments: [
          {
            compliment: 'Professional Service',
            frequency: 156,
            averageSentiment: 0.78
          },
          {
            compliment: 'Quality Workmanship',
            frequency: 134,
            averageSentiment: 0.82
          },
          {
            compliment: 'Timely Completion',
            frequency: 98,
            averageSentiment: 0.75
          }
        ],
        channelPerformance: {
          website: { volume: 623, averageSentiment: 0.12, responseRate: 0.85 },
          mobile: { volume: 456, averageSentiment: 0.08, responseRate: 0.92 },
          phone: { volume: 168, averageSentiment: -0.15, responseRate: 0.78 }
        },
        actionableInsights: [
          {
            insight: 'Service delays are the top complaint with increasing trend',
            impact: 'high',
            recommendation: 'Implement better scheduling system and communicate delays proactively',
            priority: 9
          },
          {
            insight: 'Mobile app has highest response rate but lower sentiment',
            impact: 'medium',
            recommendation: 'Improve mobile app user experience and add more self-service options',
            priority: 7
          },
          {
            insight: 'Phone channel has lowest sentiment scores',
            impact: 'medium',
            recommendation: 'Provide additional training for phone support staff',
            priority: 6
          }
        ],
        trends: {
          sentiment: 'improving',
          volume: 'increasing',
          issues: [
            { issue: 'Service Delays', change: 12 },
            { issue: 'Communication', change: -3 },
            { issue: 'Pricing', change: -8 }
          ]
        }
      };

      // Generate mock customer insights
      const mockCustomerInsights: CustomerInsights[] = [
        {
          customerId: 'CUST_001',
          profile: {
            totalInteractions: 15,
            averageRating: 4.2,
            preferredChannel: 'mobile',
            lastInteraction: new Date(),
            lifetimeValue: 12500
          },
          sentiment: {
            overall: 0.35,
            trend: 'improving',
            recentChange: 0.15
          },
          preferences: {
            serviceTypes: ['maintenance', 'electrical'],
            priceSensitivity: 0.6,
            qualityImportance: 0.8,
            speedImportance: 0.7
          },
          behavior: {
            bookingFrequency: 2.1,
            complaintRate: 0.13,
            referralLikelihood: 0.75,
            churnRisk: 0.25
          },
          recommendations: [
            'Excellent customer - consider loyalty program',
            'High referral potential - encourage reviews'
          ]
        },
        {
          customerId: 'CUST_002',
          profile: {
            totalInteractions: 8,
            averageRating: 2.8,
            preferredChannel: 'phone',
            lastInteraction: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            lifetimeValue: 3200
          },
          sentiment: {
            overall: -0.42,
            trend: 'declining',
            recentChange: -0.18
          },
          preferences: {
            serviceTypes: ['pool_services'],
            priceSensitivity: 0.9,
            qualityImportance: 0.4,
            speedImportance: 0.3
          },
          behavior: {
            bookingFrequency: 0.8,
            complaintRate: 0.5,
            referralLikelihood: 0.2,
            churnRisk: 0.85
          },
          recommendations: [
            'High churn risk - immediate follow-up needed',
            'Address service quality concerns',
            'Consider service recovery program'
          ]
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setAnalytics(mockAnalytics);
      setCustomerInsights(mockCustomerInsights);

    } catch (error) {
      console.error('Failed to generate analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateAnalytics();
  }, [selectedPeriod]);

  if (loading && !analytics) {
    return (
      <DashboardLayout activeTab="analytics">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Analyzing Customer Sentiment...</h2>
            <p className="text-[#45a29e]">AI is processing feedback and generating insights</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="analytics">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sentiment Analysis</h1>
          <p className="text-[#45a29e]">
            AI-powered customer feedback analysis and actionable insights
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Analysis Period</h3>
          <div className="flex gap-4">
            {[
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 90 Days' }
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-[#c5a059] text-[#0b0c10]'
                    : 'bg-[#2d3b2d] border border-[#45a29e]/20 text-[#45a29e] hover:border-[#45a29e]/40'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overall Analytics */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
              <div className="text-2xl font-bold text-[#c5a059] mb-1">{analytics.totalFeedback}</div>
              <div className="text-sm text-[#45a29e]">Total Feedback</div>
            </div>
            <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {((analytics.sentimentDistribution.positive / analytics.totalFeedback) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-green-300">Positive</div>
            </div>
            <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/30 text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">
                {((analytics.sentimentDistribution.negative / analytics.totalFeedback) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-red-300">Negative</div>
            </div>
            <div className={`rounded-xl p-4 text-center ${
              analytics.trends.sentiment === 'improving' ? 'bg-green-500/20 border border-green-500/30' :
              analytics.trends.sentiment === 'declining' ? 'bg-red-500/20 border border-red-500/30' :
              'bg-blue-500/20 border border-blue-500/30'
            }`}>
              <div className={`text-2xl font-bold mb-1 capitalize ${
                analytics.trends.sentiment === 'improving' ? 'text-green-400' :
                analytics.trends.sentiment === 'declining' ? 'text-red-400' :
                'text-blue-400'
              }`}>
                {analytics.trends.sentiment}
              </div>
              <div className="text-sm opacity-75">Sentiment Trend</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Issues & Compliments */}
          {analytics && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">🎯 Top Issues</h3>
                <div className="space-y-3">
                  {analytics.topIssues.map((issue, index) => (
                    <MobileCard key={index} variant="outlined">
                      <MobileCardHeader
                        title={issue.issue}
                        subtitle={`${issue.frequency} mentions • ${(issue.averageSentiment * 100).toFixed(0)}% sentiment`}
                        avatar={<span className="text-2xl">⚠️</span>}
                        action={
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            issue.trend === 'increasing' ? 'bg-red-500/20 text-red-400' :
                            issue.trend === 'decreasing' ? 'bg-green-500/20 text-green-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {issue.trend}
                          </span>
                        }
                      />
                    </MobileCard>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">💝 Top Compliments</h3>
                <div className="space-y-3">
                  {analytics.topCompliments.map((compliment, index) => (
                    <MobileCard key={index} variant="outlined">
                      <MobileCardHeader
                        title={compliment.compliment}
                        subtitle={`${compliment.frequency} mentions • ${(compliment.averageSentiment * 100).toFixed(0)}% sentiment`}
                        avatar={<span className="text-2xl">⭐</span>}
                      />
                    </MobileCard>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Customer Insights */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">👥 Customer Insights</h3>
              <div className="space-y-4">
                {customerInsights.map((insights) => (
                  <CustomerInsightCard key={insights.customerId} insights={insights} />
                ))}
              </div>
            </div>

            {/* Actionable Insights */}
            {analytics && analytics.actionableInsights.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">🚀 Actionable Insights</h3>
                <div className="space-y-3">
                  {analytics.actionableInsights.map((insight, index) => (
                    <MobileCard key={index} variant="outlined">
                      <MobileCardContent>
                        <div className="space-y-2">
                          <p className="text-white text-sm">{insight.insight}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              insight.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                              insight.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {insight.impact.toUpperCase()} IMPACT
                            </span>
                            <span className="text-xs text-[#45a29e]">
                              Priority: {insight.priority}/10
                            </span>
                          </div>
                          <p className="text-[#c5a059] text-sm font-semibold">
                            💡 {insight.recommendation}
                          </p>
                        </div>
                      </MobileCardContent>
                    </MobileCard>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Channel Performance */}
        {analytics && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">📊 Channel Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(analytics.channelPerformance).map(([channel, perf]) => (
                <MobileCard key={channel}>
                  <MobileCardHeader
                    title={channel.charAt(0).toUpperCase() + channel.slice(1)}
                    subtitle={`${perf.volume} interactions`}
                    avatar={<span className="text-2xl">
                      {channel === 'website' ? '💻' : channel === 'mobile' ? '📱' : '📞'}
                    </span>}
                  />
                  <MobileCardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#45a29e]">Sentiment:</span>
                        <SentimentIndicator sentiment={perf.averageSentiment} size="sm" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#45a29e]">Response Rate:</span>
                        <span className="text-white font-semibold">{(perf.responseRate * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </MobileCardContent>
                </MobileCard>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights Summary */}
        {analytics && (
          <div className="mt-8 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">🧠 AI Analysis Summary</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-[#c5a059] font-semibold mb-2">Key Findings</h4>
                <ul className="text-sm text-[#45a29e] space-y-1">
                  <li>• Analyzed {analytics.totalFeedback} customer feedback items</li>
                  <li>• {analytics.sentimentDistribution.positive} positive, {analytics.sentimentDistribution.negative} negative sentiments</li>
                  <li>• Sentiment trend: {analytics.trends.sentiment}</li>
                  <li>• {analytics.topIssues.length} main issue categories identified</li>
                  <li>• {analytics.actionableInsights.length} high-priority recommendations</li>
                </ul>
              </div>
              <div>
                <h4 className="text-[#c5a059] font-semibold mb-2">Strategic Recommendations</h4>
                <ul className="text-sm text-[#45a29e] space-y-1">
                  <li>• Focus on resolving top {analytics.topIssues[0]?.issue.toLowerCase()} issues</li>
                  <li>• Leverage ${analytics.topCompliments[0]?.compliment.toLowerCase()} as marketing strength</li>
                  <li>• Improve {Object.entries(analytics.channelPerformance)
                      .sort(([,a], [,b]) => a.averageSentiment - b.averageSentiment)[0][0]} channel experience</li>
                  <li>• Monitor {analytics.trends.issues.filter(i => i.change > 0).length} increasing issue trends</li>
                  <li>• Implement customer feedback loop for continuous improvement</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}