"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";

interface ChatAnalytics {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  averageResponseTime: number;
  userSatisfaction: number;
  peakHours: Array<{ hour: number; count: number }>;
  topTopics: Array<{ topic: string; count: number }>;
  agentPerformance: Array<{
    agentId: number;
    agentName: string;
    conversations: number;
    avgResponseTime: number;
    satisfaction: number;
  }>;
}

export default function ChatAnalyticsPage() {
  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from an analytics API
      const mockAnalytics: ChatAnalytics = {
        totalConversations: 1247,
        activeConversations: 23,
        totalMessages: 8921,
        averageResponseTime: 2.3, // minutes
        userSatisfaction: 4.6, // out of 5
        peakHours: [
          { hour: 9, count: 45 },
          { hour: 10, count: 67 },
          { hour: 11, count: 89 },
          { hour: 14, count: 78 },
          { hour: 15, count: 92 },
          { hour: 16, count: 85 },
        ],
        topTopics: [
          { topic: "Booking Issues", count: 234 },
          { topic: "Service Information", count: 189 },
          { topic: "Technical Support", count: 156 },
          { topic: "Payment Questions", count: 98 },
          { topic: "General Inquiry", count: 87 },
        ],
        agentPerformance: [
          {
            agentId: 1,
            agentName: "Sarah Johnson",
            conversations: 156,
            avgResponseTime: 1.8,
            satisfaction: 4.7,
          },
          {
            agentId: 2,
            agentName: "Mike Chen",
            conversations: 142,
            avgResponseTime: 2.1,
            satisfaction: 4.5,
          },
          {
            agentId: 3,
            agentName: "Emma Davis",
            conversations: 134,
            avgResponseTime: 2.4,
            satisfaction: 4.6,
          },
        ],
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="analytics">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading Analytics...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout activeTab="analytics">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="text-center text-[#45a29e] py-12">
            <div className="text-6xl mb-4">📊</div>
            <p>Unable to load analytics data. Please try again later.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="analytics">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Chat Analytics</h1>
            <p className="text-[#45a29e]">
              Real-time insights into chat performance and user engagement
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-[#1f2833] border border-[#45a29e]/30 rounded-lg px-4 py-2 text-white focus:border-[#c5a059] focus:outline-none"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#45a29e] text-sm font-medium">Total Conversations</p>
                <p className="text-2xl font-bold text-white">{analytics.totalConversations.toLocaleString()}</p>
              </div>
              <div className="text-3xl">💬</div>
            </div>
            <div className="mt-2 text-xs text-green-400">
              +12% from last period
            </div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#45a29e] text-sm font-medium">Active Now</p>
                <p className="text-2xl font-bold text-[#c5a059]">{analytics.activeConversations}</p>
              </div>
              <div className="text-3xl">🔴</div>
            </div>
            <div className="mt-2 text-xs text-[#45a29e]">
              Live conversations
            </div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#45a29e] text-sm font-medium">Avg Response Time</p>
                <p className="text-2xl font-bold text-white">{analytics.averageResponseTime}m</p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
            <div className="mt-2 text-xs text-green-400">
              -8% from last period
            </div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#45a29e] text-sm font-medium">User Satisfaction</p>
                <p className="text-2xl font-bold text-yellow-400">{analytics.userSatisfaction}/5</p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
            <div className="mt-2 text-xs text-green-400">
              +3% from last period
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Peak Hours Chart */}
          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Peak Chat Hours</h3>
            <div className="space-y-3">
              {analytics.peakHours.map((hour) => (
                <div key={hour.hour} className="flex items-center justify-between">
                  <span className="text-[#45a29e] text-sm">
                    {hour.hour}:00 - {hour.hour + 1}:00
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-[#2d3b2d] rounded-full h-2">
                      <div
                        className="bg-[#c5a059] h-2 rounded-full"
                        style={{ width: `${(hour.count / 100) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium w-8 text-right">
                      {hour.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Topics */}
          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Top Chat Topics</h3>
            <div className="space-y-3">
              {analytics.topTopics.map((topic, index) => (
                <div key={topic.topic} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[#c5a059] font-bold text-sm w-6">#{index + 1}</span>
                    <span className="text-white text-sm">{topic.topic}</span>
                  </div>
                  <span className="text-[#45a29e] text-sm font-medium">
                    {topic.count} chats
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-white mb-6">Agent Performance</h3>
          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2d3b2d]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#45a29e] uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#45a29e] uppercase tracking-wider">
                      Conversations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#45a29e] uppercase tracking-wider">
                      Avg Response Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#45a29e] uppercase tracking-wider">
                      Satisfaction
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#45a29e]/10">
                  {analytics.agentPerformance.map((agent) => (
                    <tr key={agent.agentId} className="hover:bg-[#2d3b2d]/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{agent.agentName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#45a29e]">{agent.conversations}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{agent.avgResponseTime}m</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-yellow-400 mr-2">
                            {agent.satisfaction}/5
                          </span>
                          <div className="flex">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span
                                key={i}
                                className={`text-xs ${i < Math.floor(agent.satisfaction) ? 'text-yellow-400' : 'text-[#45a29e]/30'}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Real-time Status */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6 text-center">
            <div className="text-3xl mb-2">🟢</div>
            <div className="text-white font-semibold">System Status</div>
            <div className="text-[#45a29e] text-sm">All systems operational</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6 text-center">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-white font-semibold">Active Agents</div>
            <div className="text-[#45a29e] text-sm">3 online now</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6 text-center">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-white font-semibold">Queue Status</div>
            <div className="text-[#45a29e] text-sm">2 waiting</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}