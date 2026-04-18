"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardActions } from '@/components/MobileCard';
import { recommendationEngine, type RecommendationResult, type RecommendationRequest } from '@/lib/recommendation-engine';

interface RecommendationDisplayProps {
  result: RecommendationResult;
  onBookService: (serviceId: string, providerId: string) => void;
}

function RecommendationDisplay({ result, onBookService }: RecommendationDisplayProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'text-red-500 bg-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Service Recommendation */}
      <MobileCard className="border-l-4 border-l-[#c5a059]">
        <MobileCardHeader
          title="🎯 Recommended Service"
          subtitle={`Confidence: ${(result.confidence * 100).toFixed(0)}% • Urgency: ${result.urgencyLevel.toUpperCase()}`}
          avatar={<span className="text-2xl">✅</span>}
        />

        <MobileCardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{result.primaryService.name}</h3>
              <p className="text-[#45a29e] mb-3">{result.primaryService.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-[#2d3b2d] rounded-lg">
                  <div className="text-lg font-bold text-[#c5a059]">
                    R{result.primaryService.estimatedPrice.min} - R{result.primaryService.estimatedPrice.max}
                  </div>
                  <div className="text-xs text-[#45a29e]">Estimated Price</div>
                </div>
                <div className="text-center p-3 bg-[#2d3b2d] rounded-lg">
                  <div className="text-lg font-bold text-[#c5a059]">
                    {result.primaryService.estimatedDuration}h
                  </div>
                  <div className="text-xs text-[#45a29e]">Duration</div>
                </div>
              </div>

              <div className="p-3 bg-[#1f2833] rounded-lg mb-4">
                <h4 className="text-[#c5a059] font-semibold mb-2">Why This Service?</h4>
                <ul className="text-sm text-[#45a29e] space-y-1">
                  {result.primaryService.reasoning.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#c5a059] mt-1">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Personalized Insights */}
            {result.personalizedInsights.length > 0 && (
              <div className="p-3 bg-[#c5a059]/10 rounded-lg">
                <h4 className="text-[#c5a059] font-semibold mb-2">💡 Personalized Insights</h4>
                <ul className="text-sm text-white space-y-1">
                  {result.personalizedInsights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#c5a059] mt-1">💭</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </MobileCardContent>
      </MobileCard>

      {/* Recommended Providers */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">🏆 Recommended Providers</h3>
        <div className="space-y-4">
          {result.recommendedProviders.map((provider, index) => (
            <MobileCard
              key={provider.providerId}
              className={selectedProvider === provider.providerId ? 'ring-2 ring-[#c5a059]' : ''}
              interactive
              onClick={() => setSelectedProvider(
                selectedProvider === provider.providerId ? null : provider.providerId
              )}
            >
              <MobileCardHeader
                title={`#${index + 1}: ${provider.name}`}
                subtitle={`${provider.distance.toFixed(1)}km away • ⭐ ${provider.rating} (${provider.reviewCount} reviews)`}
                avatar={<span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>}
                action={
                  <div className="text-right">
                    <div className={`text-xs px-2 py-1 rounded-full font-semibold ${getUrgencyColor('medium')}`}>
                      Match: {(provider.matchScore * 100).toFixed(0)}%
                    </div>
                  </div>
                }
              />

              <MobileCardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-2 bg-[#2d3b2d] rounded">
                    <div className="text-sm font-bold text-[#c5a059]">R{provider.estimatedPrice}</div>
                    <div className="text-xs text-[#45a29e]">Est. Cost</div>
                  </div>
                  <div className="text-center p-2 bg-[#2d3b2d] rounded">
                    <div className="text-sm font-bold text-[#c5a059]">{provider.estimatedArrival}min</div>
                    <div className="text-xs text-[#45a29e]">Response Time</div>
                  </div>
                </div>

                {provider.strengths.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-semibold text-[#c5a059] mb-2">Strengths:</h5>
                    <div className="flex flex-wrap gap-1">
                      {provider.strengths.map((strength, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-[#c5a059]/20 text-[#c5a059] rounded-full">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {provider.certifications.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-semibold text-[#c5a059] mb-2">Certifications:</h5>
                    <div className="flex flex-wrap gap-1">
                      {provider.certifications.map((cert, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-[#45a29e]/20 text-[#45a29e] rounded-full">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProvider === provider.providerId && (
                  <div className="mt-4 p-3 bg-[#1f2833] rounded-lg">
                    <h5 className="text-sm font-semibold text-[#c5a059] mb-2">Availability:</h5>
                    <div className="space-y-1">
                      <div className="text-sm text-[#45a29e]">
                        Soonest: {provider.availability.soonest.toLocaleString()}
                      </div>
                      <div className="text-xs text-[#666]">
                        Other options: {provider.availability.options.slice(1, 3).map(date =>
                          date.toLocaleDateString()
                        ).join(', ')}
                      </div>
                    </div>
                  </div>
                )}
              </MobileCardContent>

              <MobileCardActions>
                <button
                  onClick={() => onBookService(result.primaryService.serviceId, provider.providerId)}
                  className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm"
                >
                  Book with {provider.name}
                </button>
                <button className="px-4 py-2 bg-[#45a29e] text-white rounded-lg font-medium text-sm">
                  View Profile
                </button>
              </MobileCardActions>
            </MobileCard>
          ))}
        </div>
      </div>

      {/* Alternatives */}
      {result.alternatives.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">🔄 Alternative Options</h3>
          <div className="space-y-3">
            {result.alternatives.map((alt) => (
              <MobileCard key={alt.serviceId} variant="outlined">
                <MobileCardHeader
                  title={alt.name}
                  subtitle={`R${alt.estimatedPrice.min} - R${alt.estimatedPrice.max} • ${alt.estimatedDuration}h`}
                  avatar={<span className="text-2xl">🔄</span>}
                />
                <MobileCardContent>
                  <p className="text-sm text-[#45a29e]">{alt.description}</p>
                </MobileCardContent>
              </MobileCard>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
        <h3 className="text-xl font-bold text-white mb-4">📊 Recommendation Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#c5a059]">
              R{result.estimatedSavings.toLocaleString()}
            </div>
            <div className="text-sm text-[#45a29e]">Potential Savings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#c5a059]">
              {(result.confidence * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-[#45a29e]">Confidence</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${getUrgencyColor(result.urgencyLevel)}`}>
            <div className="text-sm font-bold">
              {result.urgencyLevel.toUpperCase()}
            </div>
            <div className="text-xs opacity-75">Urgency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#c5a059]">
              {result.recommendedProviders.length}
            </div>
            <div className="text-sm text-[#45a29e]">Providers Found</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationEnginePage() {
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<RecommendationRequest>({
    userId: 'demo_user',
    serviceType: 'maintenance',
    urgency: 'medium'
  });

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const result = await recommendationEngine.getRecommendations(currentRequest);
      setRecommendations(result);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (serviceId: string, providerId: string) => {
    console.log('Booking service:', { serviceId, providerId });
    // In real app, navigate to booking flow
  };

  useEffect(() => {
    handleGetRecommendations();
  }, []);

  return (
    <DashboardLayout activeTab="analytics">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Recommendation Engine</h1>
          <p className="text-[#45a29e]">
            Intelligent service and provider recommendations powered by machine learning
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="mb-8 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
          <h3 className="text-xl font-bold text-white mb-4">🎛️ Recommendation Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Service Type
              </label>
              <select
                value={currentRequest.serviceType || ''}
                onChange={(e) => setCurrentRequest(prev => ({
                  ...prev,
                  serviceType: e.target.value
                }))}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white focus:border-[#c5a059] focus:outline-none"
              >
                <option value="maintenance">General Maintenance</option>
                <option value="landscaping">Landscaping</option>
                <option value="pool_services">Pool Services</option>
                <option value="electrical">Electrical</option>
                <option value="emergency_services">Emergency Services</option>
              </select>
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Urgency Level
              </label>
              <select
                value={currentRequest.urgency || 'medium'}
                onChange={(e) => setCurrentRequest(prev => ({
                  ...prev,
                  urgency: e.target.value as any
                }))}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white focus:border-[#c5a059] focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Max Budget (R)
              </label>
              <input
                type="number"
                value={currentRequest.budget || ''}
                onChange={(e) => setCurrentRequest(prev => ({
                  ...prev,
                  budget: parseInt(e.target.value) || undefined
                }))}
                placeholder="Optional"
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white placeholder-[#45a29e]/50 focus:border-[#c5a059] focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleGetRecommendations}
            disabled={loading}
            className="px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors font-medium disabled:opacity-50"
          >
            {loading ? '🔄 Analyzing...' : '🤖 Get AI Recommendations'}
          </button>
        </div>

        {/* Results */}
        {recommendations && (
          <RecommendationDisplay
            result={recommendations}
            onBookService={handleBookService}
          />
        )}

        {!recommendations && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2">Ready for AI Recommendations</h3>
            <p className="text-[#45a29e] mb-6">
              Click "Get AI Recommendations" to see personalized service and provider suggestions
            </p>
            <button
              onClick={handleGetRecommendations}
              className="px-8 py-4 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors font-medium"
            >
              🚀 Start AI Analysis
            </button>
          </div>
        )}

        {/* AI Insights */}
        {recommendations && (
          <div className="mt-8 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">🧠 AI Engine Insights</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-[#c5a059] font-semibold mb-2">How Recommendations Work</h4>
                <ul className="text-sm text-[#45a29e] space-y-1">
                  <li>• Analyzes your property type and features</li>
                  <li>• Considers your budget and time preferences</li>
                  <li>• Reviews past booking history and ratings</li>
                  <li>• Evaluates provider ratings and reliability</li>
                  <li>• Calculates optimal distance and availability</li>
                  <li>• Learns from your feedback for better recommendations</li>
                </ul>
              </div>
              <div>
                <h4 className="text-[#c5a059] font-semibold mb-2">Recommendation Factors</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#45a29e]">Provider Rating:</span>
                    <span className="text-white font-semibold">25%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#45a29e]">Distance:</span>
                    <span className="text-white font-semibold">20%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#45a29e]">Past Experience:</span>
                    <span className="text-white font-semibold">15%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#45a29e]">Response Time:</span>
                    <span className="text-white font-semibold">15%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#45a29e]">Specializations:</span>
                    <span className="text-white font-semibold">10%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#45a29e]">Budget Match:</span>
                    <span className="text-white font-semibold">15%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}