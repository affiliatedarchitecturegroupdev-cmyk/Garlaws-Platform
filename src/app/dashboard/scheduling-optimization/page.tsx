"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardActions } from '@/components/MobileCard';
import { schedulingOptimizationEngine, type ScheduleOptimizationResult, type OptimizedSchedule } from '@/lib/scheduling-optimization-engine';

interface ScheduleCardProps {
  schedule: OptimizedSchedule;
}

function ScheduleCard({ schedule }: ScheduleCardProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400 bg-green-500/20';
    if (confidence >= 0.6) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <MobileCard>
      <MobileCardHeader
        title={`Booking ${schedule.bookingId}`}
        subtitle={`Technician: ${schedule.assignedTechnician} • ${formatDate(schedule.scheduledDate)}`}
        avatar={<span className="text-2xl">📅</span>}
      />

      <MobileCardContent>
        <div className="space-y-4">
          {/* Schedule Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-[#45a29e]">Start Time</div>
              <div className="text-white font-semibold">{schedule.startTime}</div>
            </div>
            <div>
              <div className="text-sm text-[#45a29e]">Duration</div>
              <div className="text-white font-semibold">{schedule.totalDuration.toFixed(1)}h</div>
            </div>
          </div>

          {/* Travel & Confidence */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-[#45a29e]">Travel Time</div>
              <div className="text-white font-semibold">{schedule.travelTime} min</div>
            </div>
            <div>
              <div className="text-sm text-[#45a29e]">Confidence</div>
              <div className={`font-semibold px-2 py-1 rounded text-sm ${getConfidenceColor(schedule.confidence)}`}>
                {(schedule.confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Reasoning */}
          {schedule.reasoning.length > 0 && (
            <div>
              <h4 className="text-[#c5a059] font-semibold mb-2">Assignment Reasoning:</h4>
              <ul className="text-sm text-[#45a29e] space-y-1">
                {schedule.reasoning.map((reason: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#c5a059] mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Alternatives */}
          {schedule.alternatives.length > 0 && (
            <div className="p-3 bg-[#2d3b2d] rounded-lg">
              <h4 className="text-[#c5a059] font-semibold mb-2">Alternative Options:</h4>
              <div className="space-y-2">
                {schedule.alternatives.slice(0, 2).map((alt: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-[#45a29e]">{alt.technicianId} • {formatDate(alt.date)}</span>
                    <span className="text-white font-medium">{(alt.score * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </MobileCardContent>

      <MobileCardActions>
        <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm">
          Confirm Schedule
        </button>
        <button className="px-4 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg font-medium text-sm">
          View Details
        </button>
      </MobileCardActions>
    </MobileCard>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  icon: string;
}

function MetricCard({ title, value, subtitle, color, icon }: MetricCardProps) {
  return (
    <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-2xl font-bold mb-1 ${color}`}>{value}</div>
      <div className="text-sm text-[#45a29e] font-medium">{title}</div>
      <div className="text-xs text-[#45a29e]/70">{subtitle}</div>
    </div>
  );
}

export default function SchedulingOptimizationPage() {
  const [optimizationResult, setOptimizationResult] = useState<ScheduleOptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingsCount, setBookingsCount] = useState(5);
  const [criteria, setCriteria] = useState({
    prioritizeCustomerPreferences: true,
    minimizeTravelTime: true,
    balanceTechnicianLoad: true,
    considerUrgency: true,
  });

  // Generate mock bookings based on count
  const generateMockBookings = (count: number) => {
    const serviceTypes = ['electrical', 'plumbing', 'hvac', 'maintenance', 'pool_services'];
    const urgencies: Array<'low' | 'medium' | 'high' | 'emergency'> = ['low', 'medium', 'high', 'emergency'];

    return Array.from({ length: count }, (_, i) => ({
      id: `BK${String(i + 1).padStart(3, '0')}`,
      customerId: `CUST${String(i + 1).padStart(3, '0')}`,
      serviceType: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
      location: {
        latitude: -26.2041 + (Math.random() - 0.5) * 0.1,
        longitude: 28.0473 + (Math.random() - 0.5) * 0.1,
        address: `Property ${i + 1}, Johannesburg CBD`
      },
      urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
      estimatedDuration: 1 + Math.random() * 3, // 1-4 hours
      requiredSkills: [serviceTypes[Math.floor(Math.random() * serviceTypes.length)]],
      customerPreferences: {
        preferredTechnician: Math.random() > 0.7 ? `TECH_00${Math.floor(Math.random() * 3) + 1}` : undefined,
        accessibility: Math.random() > 0.8
      }
    }));
  };

  const handleOptimizeSchedule = async () => {
    setLoading(true);
    try {
      const mockBookings = generateMockBookings(bookingsCount);

      // In real app, this would call the API
      // const response = await fetch('/api/scheduling-optimization', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ bookings: mockBookings, optimizationCriteria: criteria })
      // });
      // const result = await response.json();

      // For demo, use the engine directly
      const result = await schedulingOptimizationEngine.optimizeSchedule(mockBookings, criteria);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setOptimizationResult(result);

    } catch (error) {
      console.error('Failed to optimize schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleOptimizeSchedule();
  }, [bookingsCount, criteria]);

  const getConflictSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <DashboardLayout activeTab="analytics">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Scheduling Optimization</h1>
          <p className="text-[#45a29e]">
            AI-powered technician assignment and route optimization for maximum efficiency
          </p>
        </div>

        {/* Optimization Controls */}
        <div className="mb-6 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Optimization Parameters</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Number of Bookings
              </label>
              <select
                value={bookingsCount}
                onChange={(e) => setBookingsCount(parseInt(e.target.value))}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white focus:border-[#c5a059] focus:outline-none"
              >
                <option value={3}>3 Bookings</option>
                <option value={5}>5 Bookings</option>
                <option value={8}>8 Bookings</option>
                <option value={10}>10 Bookings</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Optimization Criteria
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(criteria).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setCriteria(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded border-[#45a29e]/30 bg-[#0b0c10] text-[#c5a059] focus:ring-[#c5a059]"
                    />
                    <span className="text-white text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleOptimizeSchedule}
              disabled={loading}
              className="px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors font-bold disabled:opacity-50"
            >
              {loading ? '🔄 Optimizing...' : '🚀 Optimize Schedule'}
            </button>
          </div>
        </div>

        {/* Efficiency Metrics */}
        {optimizationResult && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <MetricCard
              title="Avg Travel Time"
              value={`${optimizationResult.efficiencyMetrics.averageTravelTime} min`}
              subtitle="Per assignment"
              color="text-blue-400"
              icon="🕐"
            />
            <MetricCard
              title="Utilization"
              value={`${optimizationResult.efficiencyMetrics.technicianUtilization}%`}
              subtitle="Technician capacity"
              color="text-green-400"
              icon="📊"
            />
            <MetricCard
              title="Satisfaction"
              value={`${optimizationResult.efficiencyMetrics.customerSatisfaction}%`}
              subtitle="Predicted score"
              color="text-yellow-400"
              icon="😊"
            />
            <MetricCard
              title="Cost Efficiency"
              value={`${optimizationResult.efficiencyMetrics.costEfficiency}%`}
              subtitle="Optimization gain"
              color="text-purple-400"
              icon="💰"
            />
          </div>
        )}

        {/* Optimized Schedules */}
        {optimizationResult && optimizationResult.optimizedSchedules.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">✅ Optimized Schedules</h2>
            <div className="space-y-4">
              {optimizationResult.optimizedSchedules.map((schedule: OptimizedSchedule) => (
                <ScheduleCard key={schedule.bookingId} schedule={schedule} />
              ))}
            </div>
          </div>
        )}

        {/* Conflicts */}
        {optimizationResult && optimizationResult.conflicts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">⚠️ Scheduling Conflicts</h2>
            <div className="space-y-4">
              {optimizationResult.conflicts.map((conflict: any, index: number) => (
                <MobileCard key={index} className={`${getConflictSeverityColor(conflict.severity)} border-l-4 ${
                  conflict.severity === 'high' ? 'border-l-red-500' :
                  conflict.severity === 'medium' ? 'border-l-yellow-500' :
                  'border-l-green-500'
                }`}>
                  <MobileCardHeader
                    title={`Conflict: ${conflict.type.replace('_', ' ').toUpperCase()}`}
                    subtitle={`Booking ${conflict.bookingId} • Severity: ${conflict.severity}`}
                    avatar={<span className="text-2xl">⚠️</span>}
                  />
                  <MobileCardContent>
                    <p className="text-white">{conflict.description}</p>
                  </MobileCardContent>
                  <MobileCardActions>
                    <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm">
                      Resolve Conflict
                    </button>
                  </MobileCardActions>
                </MobileCard>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {optimizationResult && optimizationResult.recommendations.length > 0 && (
          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">🧠 AI Recommendations</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-[#c5a059] font-semibold mb-2">Optimization Insights</h4>
                <ul className="text-sm text-[#45a29e] space-y-2">
                  {optimizationResult.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#c5a059] mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[#c5a059] font-semibold mb-2">Performance Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#45a29e]">Total Bookings Optimized:</span>
                    <span className="text-white font-semibold">{optimizationResult.optimizedSchedules.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#45a29e]">Conflicts Resolved:</span>
                    <span className="text-white font-semibold">{optimizationResult.conflicts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#45a29e]">Efficiency Improvement:</span>
                    <span className="text-green-400 font-semibold">+{optimizationResult.efficiencyMetrics.costEfficiency - 70}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {optimizationResult && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="bg-[#c5a059] text-[#0b0c10] p-6 rounded-xl hover:opacity-90 transition-all text-center">
              <div className="text-3xl mb-3">💾</div>
              <h3 className="font-bold mb-2">Save Optimization</h3>
              <p className="text-sm opacity-80">Store this optimized schedule</p>
            </button>

            <button className="bg-[#45a29e] text-white p-6 rounded-xl hover:opacity-90 transition-all text-center">
              <div className="text-3xl mb-3">📤</div>
              <h3 className="font-bold mb-2">Export Schedule</h3>
              <p className="text-sm opacity-80">Download technician assignments</p>
            </button>

            <button className="bg-[#1f2833] border border-[#45a29e]/20 text-[#45a29e] p-6 rounded-xl hover:bg-[#45a29e]/10 transition-all text-center">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="font-bold mb-2">Re-optimize</h3>
              <p className="text-sm opacity-80">Run optimization with new criteria</p>
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}