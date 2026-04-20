'use client';

import { useState, useEffect, useCallback } from 'react';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'social' | 'paid_ads' | 'content' | 'event' | 'direct_mail';
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  targetAudience: string[];
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  goals: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  actuals: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  performance: {
    ctr: number; // Click-through rate
    cpc: number; // Cost per click
    cpa: number; // Cost per acquisition
    roi: number; // Return on investment
  };
  segments: string[];
  channels: string[];
  creatives: CampaignCreative[];
  createdAt: string;
  updatedAt: string;
}

interface CampaignCreative {
  id: string;
  type: 'image' | 'video' | 'text' | 'html';
  name: string;
  content: string;
  url?: string;
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
}

interface CampaignManagerProps {
  tenantId?: string;
}

export default function CampaignManager({ tenantId = 'default' }: CampaignManagerProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    type: 'email' as Campaign['type'],
    targetAudience: [] as string[],
    budget: 0,
    startDate: '',
    endDate: '',
    segments: [] as string[],
    channels: [] as string[],
    goals: {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0
    }
  });

  useEffect(() => {
    fetchCampaigns();
  }, [tenantId]);

  useEffect(() => {
    applyFilters();
  }, [campaigns, statusFilter, typeFilter]);

  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await fetch(`/api/crm?action=campaigns&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        // Enhance campaigns with calculated metrics
        const enhancedCampaigns = data.data.map((campaign: any) => ({
          ...campaign,
          performance: calculatePerformance(campaign),
          actuals: campaign.actuals || {
            impressions: Math.floor(Math.random() * 10000),
            clicks: Math.floor(Math.random() * 500),
            conversions: Math.floor(Math.random() * 50),
            revenue: Math.floor(Math.random() * 10000)
          }
        }));
        setCampaigns(enhancedCampaigns);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const calculatePerformance = (campaign: any) => {
    const actuals = campaign.actuals || { impressions: 0, clicks: 0, conversions: 0, revenue: 0 };

    return {
      ctr: actuals.impressions > 0 ? (actuals.clicks / actuals.impressions) * 100 : 0,
      cpc: actuals.clicks > 0 ? campaign.spent / actuals.clicks : 0,
      cpa: actuals.conversions > 0 ? campaign.spent / actuals.conversions : 0,
      roi: campaign.budget > 0 ? ((actuals.revenue - campaign.spent) / campaign.budget) * 100 : 0
    };
  };

  const applyFilters = useCallback(() => {
    let filtered = [...campaigns];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.type === typeFilter);
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, statusFilter, typeFilter]);

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.startDate || !newCampaign.endDate) return;

    try {
      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_campaign',
          tenantId,
          ...newCampaign
        })
      });

      const data = await response.json();
      if (data.success) {
        setCampaigns([...campaigns, data.data]);
        setShowCreateForm(false);
        setNewCampaign({
          name: '',
          description: '',
          type: 'email',
          targetAudience: [],
          budget: 0,
          startDate: '',
          endDate: '',
          segments: [],
          channels: [],
          goals: {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0
          }
        });
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: Campaign['status']) => {
    try {
      const response = await fetch('/api/crm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_campaign_status',
          tenantId,
          campaignId,
          status
        })
      });

      const data = await response.json();
      if (data.success) {
        setCampaigns(campaigns.map(c => c.id === campaignId ? data.data : c));
      }
    } catch (error) {
      console.error('Failed to update campaign status:', error);
    }
  };

  const addSegmentToCampaign = (segment: string) => {
    if (!newCampaign.segments.includes(segment)) {
      setNewCampaign({
        ...newCampaign,
        segments: [...newCampaign.segments, segment]
      });
    }
  };

  const removeSegmentFromCampaign = (segment: string) => {
    setNewCampaign({
      ...newCampaign,
      segments: newCampaign.segments.filter(s => s !== segment)
    });
  };

  const addChannelToCampaign = (channel: string) => {
    if (!newCampaign.channels.includes(channel)) {
      setNewCampaign({
        ...newCampaign,
        channels: [...newCampaign.channels, channel]
      });
    }
  };

  const removeChannelFromCampaign = (channel: string) => {
    setNewCampaign({
      ...newCampaign,
      channels: newCampaign.channels.filter(c => c !== channel)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-purple-100 text-purple-800';
      case 'paid_ads': return 'bg-green-100 text-green-800';
      case 'content': return 'bg-yellow-100 text-yellow-800';
      case 'event': return 'bg-indigo-100 text-indigo-800';
      case 'direct_mail': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (value: number, type: 'good' | 'bad') => {
    if (type === 'good') {
      return value > 75 ? 'text-green-600' : value > 50 ? 'text-yellow-600' : 'text-red-600';
    } else {
      return value < 25 ? 'text-green-600' : value < 50 ? 'text-yellow-600' : 'text-red-600';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Marketing Campaign Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={fetchCampaigns}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Refresh Campaigns
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Campaign
          </button>
        </div>
      </div>

      {/* Campaign Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-blue-600">
                {campaigns.filter(c => c.status === 'running').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-green-600">
                R{campaigns.reduce((sum, c) => sum + c.budget, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">
                R{campaigns.reduce((sum, c) => sum + (c.actuals?.revenue || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg ROI</p>
              <p className="text-2xl font-bold text-indigo-600">
                {campaigns.length > 0
                  ? (campaigns.reduce((sum, c) => sum + (c.performance?.roi || 0), 0) / campaigns.length).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="running">Running</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="email">Email</option>
            <option value="social">Social Media</option>
            <option value="paid_ads">Paid Ads</option>
            <option value="content">Content Marketing</option>
            <option value="event">Events</option>
            <option value="direct_mail">Direct Mail</option>
          </select>

          <button
            onClick={() => {
              setStatusFilter('all');
              setTypeFilter('all');
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.description}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(campaign.type)}`}>
                      {campaign.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={campaign.status}
                      onChange={(e) => updateCampaignStatus(campaign.id, e.target.value as Campaign['status'])}
                      className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(campaign.status)}`}
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="running">Running</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>R{campaign.budget.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Spent: R{campaign.spent.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>CTR: {campaign.performance.ctr.toFixed(2)}%</div>
                    <div>CPC: R{campaign.performance.cpc.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${getPerformanceColor(campaign.performance.roi, 'good')}`}>
                      {campaign.performance.roi.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedCampaign(campaign)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New Campaign</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
              <input
                type="text"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
              <select
                value={newCampaign.type}
                onChange={(e) => setNewCampaign({...newCampaign, type: e.target.value as Campaign['type']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="email">Email Marketing</option>
                <option value="social">Social Media</option>
                <option value="paid_ads">Paid Advertising</option>
                <option value="content">Content Marketing</option>
                <option value="event">Event Marketing</option>
                <option value="direct_mail">Direct Mail</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (R)</label>
              <input
                type="number"
                value={newCampaign.budget}
                onChange={(e) => setNewCampaign({...newCampaign, budget: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={newCampaign.startDate}
                onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={newCampaign.endDate}
                onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Segments */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Segments</label>
            <div className="flex flex-wrap gap-2">
              {['VIP Customers', 'New Customers', 'High-Value', 'At Risk', 'Inactive'].map(segment => (
                <button
                  key={segment}
                  type="button"
                  onClick={() => newCampaign.segments.includes(segment)
                    ? removeSegmentFromCampaign(segment)
                    : addSegmentToCampaign(segment)
                  }
                  className={`px-3 py-1 text-sm rounded-full ${
                    newCampaign.segments.includes(segment)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {segment}
                </button>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Marketing Channels</label>
            <div className="flex flex-wrap gap-2">
              {['Email', 'Facebook', 'Google Ads', 'LinkedIn', 'Instagram', 'Twitter'].map(channel => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => newCampaign.channels.includes(channel)
                    ? removeChannelFromCampaign(channel)
                    : addChannelToCampaign(channel)
                  }
                  className={`px-3 py-1 text-sm rounded-full ${
                    newCampaign.channels.includes(channel)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {channel}
                </button>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Goals</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Impressions</label>
                <input
                  type="number"
                  value={newCampaign.goals.impressions}
                  onChange={(e) => setNewCampaign({
                    ...newCampaign,
                    goals: {...newCampaign.goals, impressions: Number(e.target.value)}
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Clicks</label>
                <input
                  type="number"
                  value={newCampaign.goals.clicks}
                  onChange={(e) => setNewCampaign({
                    ...newCampaign,
                    goals: {...newCampaign.goals, clicks: Number(e.target.value)}
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Conversions</label>
                <input
                  type="number"
                  value={newCampaign.goals.conversions}
                  onChange={(e) => setNewCampaign({
                    ...newCampaign,
                    goals: {...newCampaign.goals, conversions: Number(e.target.value)}
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Revenue (R)</label>
                <input
                  type="number"
                  value={newCampaign.goals.revenue}
                  onChange={(e) => setNewCampaign({
                    ...newCampaign,
                    goals: {...newCampaign.goals, revenue: Number(e.target.value)}
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex space-x-3">
            <button
              onClick={createCampaign}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Create Campaign
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{selectedCampaign.name}</h3>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">Campaign Overview</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Type</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedCampaign.type)}`}>
                        {selectedCampaign.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCampaign.status)}`}>
                        {selectedCampaign.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Date Range</div>
                    <div className="text-sm text-gray-900">
                      {new Date(selectedCampaign.startDate).toLocaleDateString()} - {new Date(selectedCampaign.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Budget & Spend</div>
                    <div className="grid grid-cols-2 gap-4 mt-1">
                      <div>
                        <div className="text-xs text-gray-500">Budget</div>
                        <div className="text-lg font-semibold text-green-600">R{selectedCampaign.budget.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Spent</div>
                        <div className="text-lg font-semibold text-blue-600">R{selectedCampaign.spent.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Segments</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCampaign.segments.map(segment => (
                        <span key={segment} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {segment}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Channels</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCampaign.channels.map(channel => (
                        <span key={channel} className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">Performance Metrics</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Impressions</div>
                      <div className="text-xl font-bold text-blue-600">{selectedCampaign.actuals.impressions.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Goal: {selectedCampaign.goals.impressions.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Clicks</div>
                      <div className="text-xl font-bold text-green-600">{selectedCampaign.actuals.clicks.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Goal: {selectedCampaign.goals.clicks.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Conversions</div>
                      <div className="text-xl font-bold text-purple-600">{selectedCampaign.actuals.conversions.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Goal: {selectedCampaign.goals.conversions.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Revenue</div>
                      <div className="text-xl font-bold text-indigo-600">R{selectedCampaign.actuals.revenue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Goal: R{selectedCampaign.goals.revenue.toLocaleString()}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Key Performance Indicators</div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <div className="text-xs text-gray-500">CTR</div>
                        <div className="text-lg font-semibold text-blue-600">{selectedCampaign.performance.ctr.toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">CPC</div>
                        <div className="text-lg font-semibold text-green-600">R{selectedCampaign.performance.cpc.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">CPA</div>
                        <div className="text-lg font-semibold text-purple-600">R{selectedCampaign.performance.cpa.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">ROI</div>
                        <div className={`text-lg font-semibold ${getPerformanceColor(selectedCampaign.performance.roi, 'good')}`}>
                          {selectedCampaign.performance.roi.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}