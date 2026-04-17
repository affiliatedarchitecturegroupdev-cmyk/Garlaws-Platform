"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface AnalyticsSummaryProps {
  className?: string;
}

interface SummaryData {
  revenue: number[];
  bookings: number[];
  labels: string[];
  growth: number;
}

export function AnalyticsSummary({ className = "" }: AnalyticsSummaryProps) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analytics summary
    const mockData: SummaryData = {
      revenue: [18500, 22100, 19800, 25600, 28900, 31330],
      bookings: [32, 41, 38, 48, 52, 76],
      labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      growth: 23.5,
    };

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading || !data) {
    return (
      <div className={`bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-[#45a29e]/20 rounded mb-4"></div>
          <div className="h-32 bg-[#45a29e]/10 rounded"></div>
        </div>
      </div>
    );
  }

  const chartData = data.labels.map((label, index) => ({
    month: label,
    revenue: data.revenue[index],
    bookings: data.bookings[index],
  }));

  return (
    <div className={`bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#c5a059]">
            +{data.growth}%
          </div>
          <div className="text-xs text-[#45a29e]">vs last period</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#c5a059"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex justify-between items-center mt-4 text-sm">
        <span className="text-[#45a29e]">6-month overview</span>
        <a
          href="/dashboard/analytics"
          className="text-[#c5a059] hover:text-white transition-colors font-medium"
        >
          View details →
        </a>
      </div>
    </div>
  );
}