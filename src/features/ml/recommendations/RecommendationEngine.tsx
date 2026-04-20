'use client';

import { useState, useEffect, useCallback } from 'react';

interface Recommendation {
  id: string;
  type: 'product' | 'service' | 'optimization' | 'risk' | 'opportunity';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high';
  category: string;
  data: any; // Additional context data
  actions: RecommendationAction[];
  createdAt: string;
  expiresAt?: string;
}

interface RecommendationAction {
  label: string;
  type: 'primary' | 'secondary';
  action: string;
  payload?: any;
}

interface RecommendationEngineProps {
  tenantId?: string;
  category?: 'all' | 'products' | 'services' | 'operations' | 'risks';
}

export default function RecommendationEngine({
  tenantId = 'default',
  category = 'all'
}: RecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [sortBy, setSortBy] = useState<'confidence' | 'impact' | 'date'>('confidence');
  const [filterImpact, setFilterImpact] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/ml?action=recommendations&tenantId=${tenantId}&category=${selectedCategory}&sort=${sortBy}&impact=${filterImpact}`
      );
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId, selectedCategory, sortBy, filterImpact]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const executeAction = async (recommendationId: string, action: RecommendationAction) => {
    try {
      const response = await fetch('/api/ml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute-recommendation',
          tenantId,
          recommendationId,
          actionType: action.action,
          payload: action.payload
        })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh recommendations and show success message
        fetchRecommendations();
        alert(`Action executed: ${action.label}`);
      }
    } catch (error) {
      console.error('Failed to execute action:', error);
      alert('Failed to execute action. Please try again.');
    }
  };

  const dismissRecommendation = async (recommendationId: string) => {
    try {
      const response = await fetch('/api/ml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dismiss-recommendation',
          tenantId,
          recommendationId
        })
      });

      const data = await response.json();
      if (data.success) {
        setRecommendations(recommendations.filter(r => r.id !== recommendationId));
      }
    } catch (error) {
      console.error('Failed to dismiss recommendation:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-blue-100 text-blue-800';
      case 'service': return 'bg-green-100 text-green-800';
      case 'optimization': return 'bg-purple-100 text-purple-800';
      case 'risk': return 'bg-red-100 text-red-800';
      case 'opportunity': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    if (confidence >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return '🛍️';
      case 'service': return '🛠️';
      case 'optimization': return '⚡';
      case 'risk': return '⚠️';
      case 'opportunity': return '💡';
      default: return '📋';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (filterImpact === 'all') return true;
    return rec.impact === filterImpact;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">AI Recommendation Engine</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="products">Products</option>
            <option value="services">Services</option>
            <option value="operations">Operations</option>
            <option value="risks">Risks</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="confidence">Sort by Confidence</option>
            <option value="impact">Sort by Impact</option>
            <option value="date">Sort by Date</option>
          </select>
          <select
            value={filterImpact}
            onChange={(e) => setFilterImpact(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Impact Levels</option>
            <option value="high">High Impact</option>
            <option value="medium">Medium Impact</option>
            <option value="low">Low Impact</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Recommendations</p>
              <p className="text-2xl font-bold text-gray-900">{filteredRecommendations.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Impact</p>
              <p className="text-2xl font-bold text-red-600">
                {filteredRecommendations.filter(r => r.impact === 'high').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredRecommendations.length > 0
                  ? Math.round(filteredRecommendations.reduce((sum, r) => sum + r.confidence, 0) / filteredRecommendations.length)
                  : 0}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Opportunities</p>
              <p className="text-2xl font-bold text-purple-600">
                {filteredRecommendations.filter(r => r.type === 'opportunity').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{getTypeIcon(recommendation.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{recommendation.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(recommendation.type)}`}>
                      {recommendation.type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(recommendation.impact)}`}>
                      {recommendation.impact} impact
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{recommendation.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Confidence: <span className={`font-semibold ${getConfidenceColor(recommendation.confidence)}`}>
                      {recommendation.confidence}%
                    </span></span>
                    <span>Category: {recommendation.category}</span>
                    <span>Created: {new Date(recommendation.createdAt).toLocaleDateString()}</span>
                    {recommendation.expiresAt && (
                      <span>Expires: {new Date(recommendation.expiresAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => dismissRecommendation(recommendation.id)}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Dismiss recommendation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Actions */}
            {recommendation.actions && recommendation.actions.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                {recommendation.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => executeAction(recommendation.id, action)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      action.type === 'primary'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Additional Data */}
            {recommendation.data && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Supporting Data</h4>
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(recommendation.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}

        {filteredRecommendations.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-lg">No recommendations available</p>
            <p className="text-sm">The AI engine is analyzing your data to generate personalized recommendations.</p>
          </div>
        )}
      </div>
    </div>
  );
}