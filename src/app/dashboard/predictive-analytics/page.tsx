"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardActions } from '@/components/MobileCard';
import { predictiveAnalyticsEngine, type TrendAnalysis, type BusinessInsight, type ScenarioAnalysis } from '@/lib/predictive-analytics-engine';

interface TrendChartProps {
  trend: TrendAnalysis;
}

function TrendChart({ trend }: TrendChartProps) {
  const getTrendColor = (trendType: string) => {
    switch (trendType) {
      case 'increasing': return 'text-green-400';
      case 'decreasing': return 'text-red-400';
      case 'stable': return 'text-blue-400';
      case 'volatile': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = (trendType: string) => {
    switch (trendType) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '📊';
      case 'volatile': return '📊';
      default: return '📊';
    }
  };

  // Simple chart representation using bars
  const forecastPoints = trend.forecast.slice(0, 7); // Show next 7 days
  const maxValue = Math.max(...forecastPoints.map(f => f.predictedValue));

  return (
    <MobileCard>
      <MobileCardHeader
        title={`${trend.metric.toUpperCase()} Trend Analysis`}
        subtitle={`${trend.trend} • ${(trend.confidence * 100).toFixed(0)}% confidence • ${trend.slope.toFixed(3)} change/day`}
        avatar={<span className="text-2xl">{getTrendIcon(trend.trend)}</span>}
      />

      <MobileCardContent>
        <div className="space-y-4">
          {/* Trend Summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#1f2833] rounded p-2">
              <div className={`text-lg font-bold ${getTrendColor(trend.trend)}`}>
                {trend.trend.toUpperCase()}
              </div>
              <div className="text-xs text-[#45a29e]">Direction</div>
            </div>
            <div className="bg-[#1f2833] rounded p-2">
              <div className="text-lg font-bold text-blue-400">
                {(trend.confidence * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-[#45a29e]">Confidence</div>
            </div>
            <div className="bg-[#1f2833] rounded p-2">
              <div className="text-lg font-bold text-purple-400">
                {trend.seasonality ? 'YES' : 'NO'}
              </div>
              <div className="text-xs text-[#45a29e]">Seasonal</div>
            </div>
          </div>

          {/* Forecast Visualization */}
          <div>
            <h4 className="text-[#c5a059] font-semibold mb-2">7-Day Forecast</h4>
            <div className="space-y-1">
              {forecastPoints.map((point, index) => {
                const percentage = maxValue > 0 ? (point.predictedValue / maxValue) * 100 : 0;
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-16 text-xs text-[#45a29e]">
                      {point.timestamp.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 bg-[#1f2833] rounded-full h-2">
                      <div
                        className="bg-[#c5a059] h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-16 text-xs text-white text-right">
                      {point.predictedValue.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outliers */}
          {trend.outliers.length > 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <h4 className="text-red-400 font-semibold mb-2">⚠️ Outliers Detected</h4>
              <div className="text-sm text-red-300">
                {trend.outliers.length} anomalous data points identified
              </div>
            </div>
          )}
        </div>
      </MobileCardContent>
    </MobileCard>
  );
}

interface InsightCardProps {
  insight: BusinessInsight;
}

function InsightCard({ insight }: InsightCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return '📊';
      case 'risk': return '⚠️';
      case 'opportunity': return '💡';
      case 'efficiency': return '⚡';
      case 'trend': return '📈';
      default: return '💭';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTimeframeColor = (timeframe: string) => {
    switch (timeframe) {
      case 'immediate': return 'text-red-500';
      case 'short_term': return 'text-orange-500';
      case 'medium_term': return 'text-yellow-500';
      case 'long_term': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <MobileCard className="border-l-4 border-l-[#c5a059]">
      <MobileCardHeader
        title={insight.title}
        subtitle={`${insight.category.toUpperCase()} • ${(insight.confidence * 100).toFixed(0)}% confidence`}
        avatar={<span className="text-2xl">{getCategoryIcon(insight.category)}</span>}
      />

      <MobileCardContent>
        <div className="space-y-4">
          <p className="text-white">{insight.description}</p>

          {/* Impact & Timeframe */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-[#45a29e]">Impact Level</div>
              <div className={`font-semibold px-2 py-1 rounded text-sm capitalize ${getImpactColor(insight.impact)}`}>
                {insight.impact}
              </div>
            </div>
            <div>
              <div className="text-sm text-[#45a29e]">Timeframe</div>
              <div className={`font-semibold capitalize ${getTimeframeColor(insight.timeframe)}`}>
                {insight.timeframe.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Data Metrics */}
          <div className="p-3 bg-[#1f2833] rounded-lg">
            <h4 className="text-[#c5a059] font-semibold mb-2">Key Metrics</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-[#45a29e]">Current</div>
                <div className="text-white font-semibold">
                  {insight.data.currentValue.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[#45a29e]">Predicted</div>
                <div className="text-white font-semibold">
                  {insight.data.predictedValue.toLocaleString()}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-[#45a29e]">Change</div>
                <div className={`font-semibold ${insight.data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {insight.data.change >= 0 ? '+' : ''}{insight.data.changePercent.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-[#c5a059] font-semibold mb-2">Recommendations</h4>
            <ul className="text-sm text-[#45a29e] space-y-1">
              {insight.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#c5a059] mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MobileCardContent>

      <MobileCardActions>
        <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm">
          Take Action
        </button>
        <button className="px-4 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg font-medium text-sm">
          View Details
        </button>
      </MobileCardActions>
    </MobileCard>
  );
}

export default function PredictiveAnalyticsPage() {
  const [trends, setTrends] = useState<TrendAnalysis[]>([]);
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['revenue', 'maintenance_cost', 'customer_satisfaction']);
  const [timeframe, setTimeframe] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');

  const availableMetrics = [
    { id: 'revenue', name: 'Revenue', icon: '💰' },
    { id: 'maintenance_cost', name: 'Maintenance Cost', icon: '🔧' },
    { id: 'occupancy_rate', name: 'Occupancy Rate', icon: '🏢' },
    { id: 'energy_consumption', name: 'Energy Consumption', icon: '⚡' },
    { id: 'maintenance_incidents', name: 'Maintenance Incidents', icon: '🚨' },
    { id: 'customer_satisfaction', name: 'Customer Satisfaction', icon: '😊' },
    { id: 'response_time', name: 'Response Time', icon: '⏱️' }
  ];

  const timeframes = [
    { value: 'short_term', label: 'Short Term (30 days)', icon: '📅' },
    { value: 'medium_term', label: 'Medium Term (90 days)', icon: '📊' },
    { value: 'long_term', label: 'Long Term (365 days)', icon: '🔮' }
  ];

  const handleAnalyzeTrends = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const trendPromises = selectedMetrics.map(async (metric) => {
        const startDate = timeframe === 'short_term'
          ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          : timeframe === 'medium_term'
          ? new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          : new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

        return await predictiveAnalyticsEngine.analyzeTrend(metric, startDate, now, 30);
      });

      const trendResults = await Promise.all(trendPromises);
      setTrends(trendResults);

      // Generate business insights
      const insightResults = await predictiveAnalyticsEngine.generateBusinessInsights(selectedMetrics, timeframe);
      setInsights(insightResults);

      // Generate scenario analysis
      const baseMetrics = {
        revenue: 50000,
        maintenance_cost: 8000,
        occupancy_rate: 85,
        customer_satisfaction: 4.2
      };

      const scenarioDefinitions = [
        { name: 'Economic Growth', changes: { revenue: 15, maintenance_cost: 5, occupancy_rate: 3, customer_satisfaction: 0.1 }, probability: 0.6 },
        { name: 'Market Recession', changes: { revenue: -10, maintenance_cost: 15, occupancy_rate: -5, customer_satisfaction: -0.1 }, probability: 0.3 },
        { name: 'Competitive Pressure', changes: { revenue: -5, maintenance_cost: 2, occupancy_rate: -2, customer_satisfaction: -0.2 }, probability: 0.4 }
      ];

      const scenarioResults = await predictiveAnalyticsEngine.performScenarioAnalysis(baseMetrics, scenarioDefinitions);
      setScenarios(scenarioResults);

    } catch (error) {
      console.error('Failed to perform predictive analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAnalyzeTrends();
  }, [selectedMetrics, timeframe]);

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metricId)
        ? prev.filter(m => m !== metricId)
        : [...prev, metricId]
    );
  };

  return (
    <DashboardLayout activeTab="analytics">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Predictive Analytics</h1>
          <p className="text-[#45a29e]">
            AI-powered forecasting, trend analysis, and business intelligence insights
          </p>
        </div>

        {/* Analysis Controls */}
        <div className="mb-6 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Analysis Parameters</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white focus:border-[#c5a059] focus:outline-none"
              >
                {timeframes.map(tf => (
                  <option key={tf.value} value={tf.value}>
                    {tf.icon} {tf.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Selected Metrics ({selectedMetrics.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {availableMetrics.map(metric => (
                  <button
                    key={metric.id}
                    onClick={() => toggleMetric(metric.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedMetrics.includes(metric.id)
                        ? 'bg-[#c5a059] text-[#0b0c10]'
                        : 'bg-[#0b0c10] border border-[#45a29e]/30 text-[#45a29e] hover:border-[#c5a059]'
                    }`}
                  >
                    {metric.icon} {metric.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAnalyzeTrends}
              disabled={loading}
              className="px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors font-bold disabled:opacity-50"
            >
              {loading ? '🔍 Analyzing...' : '🔍 Run Analysis'}
            </button>
          </div>
        </div>

        {/* Trend Analysis */}
        {trends.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">📈 Trend Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trends.map((trend, index) => (
                <TrendChart key={index} trend={trend} />
              ))}
            </div>
          </div>
        )}

        {/* Business Insights */}
        {insights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">💡 Business Insights</h2>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          </div>
        )}

        {/* Scenario Analysis */}
        {scenarios.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">🎭 Scenario Planning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map((scenario, index) => (
                <MobileCard key={index}>
                  <MobileCardHeader
                    title={scenario.scenario}
                    subtitle={`${(scenario.probability * 100).toFixed(0)}% probability • ${scenario.timeframe.start.toLocaleDateString()} - ${scenario.timeframe.end.toLocaleDateString()}`}
                    avatar={<span className="text-2xl">🎭</span>}
                  />

                  <MobileCardContent>
                    <p className="text-white text-sm mb-4">{scenario.description}</p>

                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-[#1f2833] rounded p-2">
                          <div className="text-sm font-bold text-green-400">
                            R{scenario.impact.financial.toLocaleString()}
                          </div>
                          <div className="text-xs text-green-300">Financial</div>
                        </div>
                        <div className="bg-[#1f2833] rounded p-2">
                          <div className="text-sm font-bold text-blue-400">
                            {scenario.impact.operational.toFixed(1)}
                          </div>
                          <div className="text-xs text-blue-300">Operational</div>
                        </div>
                        <div className="bg-[#1f2833] rounded p-2">
                          <div className="text-sm font-bold text-red-400">
                            {scenario.impact.risk.toFixed(1)}
                          </div>
                          <div className="text-xs text-red-300">Risk</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[#c5a059] font-semibold mb-2">Mitigation Strategies</h4>
                        <ul className="text-sm text-[#45a29e] space-y-1">
                          {scenario.mitigationStrategies.map((strategy, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-[#c5a059] mt-1">•</span>
                              <span>{strategy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </MobileCardContent>

                  <MobileCardActions>
                    <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm">
                      Plan Response
                    </button>
                  </MobileCardActions>
                </MobileCard>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <button className="bg-[#c5a059] text-[#0b0c10] p-6 rounded-xl hover:opacity-90 transition-all text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold mb-2">Export Report</h3>
            <p className="text-sm opacity-80">Download analysis results</p>
          </button>

          <button className="bg-[#45a29e] text-white p-6 rounded-xl hover:opacity-90 transition-all text-center">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="font-bold mb-2">Real-time Updates</h3>
            <p className="text-sm opacity-80">Enable live data feeds</p>
          </button>

          <button className="bg-[#1f2833] border border-[#45a29e]/20 text-[#45a29e] p-6 rounded-xl hover:bg-[#45a29e]/10 transition-all text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold mb-2">Custom Models</h3>
            <p className="text-sm opacity-80">Build tailored predictions</p>
          </button>

          <button className="bg-[#1f2833] border border-[#45a29e]/20 text-[#45a29e] p-6 rounded-xl hover:bg-[#45a29e]/10 transition-all text-center">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-bold mb-2">Advanced Charts</h3>
            <p className="text-sm opacity-80">Interactive visualizations</p>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}