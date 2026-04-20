'use client';

import { useState, useEffect, useCallback } from 'react';

interface UserSession {
  id: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  pageViews: PageView[];
  events: UserEvent[];
  deviceInfo: DeviceInfo;
  location?: GeolocationCoordinates;
  referrer?: string;
  utmParameters?: Record<string, string>;
}

interface PageView {
  id: string;
  url: string;
  title: string;
  timestamp: string;
  timeSpent: number;
  scrollDepth: number;
  interactions: number;
}

interface UserEvent {
  id: string;
  type: 'click' | 'scroll' | 'form_submit' | 'video_play' | 'download' | 'search' | 'conversion';
  element?: string;
  value?: any;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  viewportSize: string;
  connectionType?: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  os: string;
}

interface ConversionFunnel {
  id: string;
  name: string;
  steps: FunnelStep[];
  totalEntrances: number;
  totalConversions: number;
  conversionRate: number;
  averageTime: number;
}

interface FunnelStep {
  name: string;
  url: string;
  entrances: number;
  exits: number;
  completions: number;
  dropOffRate: number;
  averageTime: number;
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: ABVariant[];
  targetMetric: string;
  startDate: string;
  endDate?: string;
  winner?: string;
  confidence: number;
}

interface ABVariant {
  id: string;
  name: string;
  description: string;
  trafficPercentage: number;
  visitors: number;
  conversions: number;
  conversionRate: number;
  improvement: number;
}

interface AnalyticsDashboard {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ url: string; views: number; uniqueViews: number }>;
  topReferrers: Array<{ source: string; visitors: number }>;
  deviceBreakdown: Array<{ device: string; percentage: number }>;
  geographicData: Array<{ country: string; visitors: number }>;
  realTime: {
    activeUsers: number;
    currentPageViews: number;
    topPages: Array<{ url: string; viewers: number }>;
  };
}

interface LandingPageAnalyticsProps {
  tenantId?: string;
}

export default function LandingPageAnalytics({ tenantId = 'default' }: LandingPageAnalyticsProps) {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [funnels, setFunnels] = useState<ConversionFunnel[]>([]);
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d' | '90d'>('7d');
  const [isTracking, setIsTracking] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'realtime' | 'funnels' | 'ab-tests'>('overview');

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/landing?action=analytics&timeRange=${selectedTimeRange}&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setDashboard(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  }, [selectedTimeRange, tenantId]);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch(`/api/landing?action=sessions&limit=50&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  }, [tenantId]);

  const fetchFunnels = useCallback(async () => {
    try {
      const response = await fetch(`/api/landing?action=funnels&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setFunnels(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch funnels:', error);
    }
  }, [tenantId]);

  const fetchAbTests = useCallback(async () => {
    try {
      const response = await fetch(`/api/landing?action=ab-tests&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setAbTests(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch A/B tests:', error);
    }
  }, [tenantId]);

  // Track user interactions
  useEffect(() => {
    if (!isTracking) return;

    const trackEvent = (event: UserEvent) => {
      fetch('/api/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track-event',
          tenantId,
          event
        })
      }).catch(console.error);
    };

    // Track clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      trackEvent({
        id: `event_${Date.now()}`,
        type: 'click',
        element: target.tagName + (target.id ? `#${target.id}` : '') + (target.className ? `.${target.className.split(' ')[0]}` : ''),
        timestamp: new Date().toISOString(),
        metadata: {
          x: e.clientX,
          y: e.clientY,
          url: window.location.href
        }
      });
    };

    // Track scroll
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        trackEvent({
          id: `event_${Date.now()}`,
          type: 'scroll',
          value: scrollDepth,
          timestamp: new Date().toISOString(),
          metadata: { scrollDepth }
        });
      }, 500);
    };

    // Track form submissions
    const handleFormSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      trackEvent({
        id: `event_${Date.now()}`,
        type: 'form_submit',
        element: form.id || form.name || 'form',
        timestamp: new Date().toISOString(),
        metadata: { action: form.action }
      });
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('submit', handleFormSubmit);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('submit', handleFormSubmit);
      clearTimeout(scrollTimeout);
    };
  }, [isTracking, tenantId]);

  // Track page views
  useEffect(() => {
    if (!isTracking) return;

    const trackPageView = () => {
      fetch('/api/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track-page-view',
          tenantId,
          pageView: {
            id: `pv_${Date.now()}`,
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
            timeSpent: 0,
            scrollDepth: 0,
            interactions: 0
          }
        })
      }).catch(console.error);
    };

    trackPageView();
  }, [isTracking, tenantId]);

  useEffect(() => {
    fetchAnalytics();
    fetchSessions();
    fetchFunnels();
    fetchAbTests();
  }, [fetchAnalytics, fetchSessions, fetchFunnels, fetchAbTests]);

  const createFunnel = async (funnelData: Partial<ConversionFunnel>) => {
    try {
      const response = await fetch('/api/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-funnel',
          tenantId,
          funnel: funnelData
        })
      });

      const data = await response.json();
      if (data.success) {
        setFunnels(prev => [...prev, data.data]);
      }
    } catch (error) {
      console.error('Failed to create funnel:', error);
    }
  };

  const createAbTest = async (testData: Partial<ABTest>) => {
    try {
      const response = await fetch('/api/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-ab-test',
          tenantId,
          test: testData
        })
      });

      const data = await response.json();
      if (data.success) {
        setAbTests(prev => [...prev, data.data]);
      }
    } catch (error) {
      console.error('Failed to create A/B test:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Landing Page Analytics</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isTracking}
              onChange={(e) => setIsTracking(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm">Enable Tracking</span>
          </label>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setSelectedView('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              selectedView === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedView('realtime')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              selectedView === 'realtime'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Real-time
          </button>
          <button
            onClick={() => setSelectedView('funnels')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              selectedView === 'funnels'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Conversion Funnels
          </button>
          <button
            onClick={() => setSelectedView('ab-tests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              selectedView === 'ab-tests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            A/B Tests
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && dashboard && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{formatNumber(dashboard.totalVisitors)}</div>
              <div className="text-sm text-gray-600">Total Visitors</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{formatNumber(dashboard.uniqueVisitors)}</div>
              <div className="text-sm text-gray-600">Unique Visitors</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">{formatNumber(dashboard.pageViews)}</div>
              <div className="text-sm text-gray-600">Page Views</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">{formatDuration(dashboard.averageSessionDuration)}</div>
              <div className="text-sm text-gray-600">Avg Session</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-red-600">{dashboard.bounceRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Bounce Rate</div>
            </div>
          </div>

          {/* Charts and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
              <div className="space-y-3">
                {dashboard.topPages.slice(0, 5).map((page, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{page.url}</div>
                      <div className="text-xs text-gray-600">{page.uniqueViews} unique views</div>
                    </div>
                    <div className="text-sm font-bold text-gray-900">{formatNumber(page.views)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Referrers */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Top Referrers</h3>
              <div className="space-y-3">
                {dashboard.topReferrers.slice(0, 5).map((referrer, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-900">{referrer.source}</div>
                    <div className="text-sm font-bold text-gray-900">{formatNumber(referrer.visitors)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
              <div className="space-y-3">
                {dashboard.deviceBreakdown.map((device, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900 capitalize">{device.device}</span>
                      <span className="text-sm text-gray-600">{device.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Data */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Top Countries</h3>
              <div className="space-y-3">
                {dashboard.geographicData.slice(0, 5).map((country, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{country.country}</span>
                    <span className="text-sm font-bold text-gray-900">{formatNumber(country.visitors)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Real-time Tab */}
      {selectedView === 'realtime' && dashboard && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-green-600">{dashboard.realTime.activeUsers}</div>
              <div className="text-sm text-gray-600">Active Users</div>
              <div className="text-xs text-gray-500 mt-1">Right now</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-blue-600">{dashboard.realTime.currentPageViews}</div>
              <div className="text-sm text-gray-600">Current Page Views</div>
              <div className="text-xs text-gray-500 mt-1">Last 5 minutes</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {dashboard.realTime.topPages.reduce((sum, page) => sum + page.viewers, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Viewers</div>
              <div className="text-xs text-gray-500 mt-1">Across top pages</div>
            </div>
          </div>

          {/* Real-time Page Views */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Live Page Views</h3>
            <div className="space-y-3">
              {dashboard.realTime.topPages.map((page, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{page.url}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-gray-900">{page.viewers}</span>
                    <span className="text-xs text-gray-600">viewing</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sessions.slice(0, 10).map((session) => (
                <div key={session.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      Session {session.id.slice(0, 8)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {session.pageViews.length} pages • {formatDuration(session.duration)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {session.deviceInfo.deviceType} • {session.deviceInfo.browser}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conversion Funnels Tab */}
      {selectedView === 'funnels' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Conversion Funnels</h3>
            <button
              onClick={() => createFunnel({
                name: 'New Funnel',
                steps: [],
                totalEntrances: 0,
                totalConversions: 0,
                conversionRate: 0,
                averageTime: 0
              })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Funnel
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {funnels.map((funnel) => (
              <div key={funnel.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{funnel.name}</h4>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{funnel.totalEntrances}</div>
                        <div className="text-sm text-gray-600">Entrances</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{funnel.totalConversions}</div>
                        <div className="text-sm text-gray-600">Conversions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{funnel.conversionRate.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Rate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Funnel Steps */}
                <div className="space-y-3">
                  {funnel.steps.map((step, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{step.name}</div>
                          <div className="text-sm text-gray-600">{step.url}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{step.completions}</div>
                          <div className="text-xs text-gray-600">{step.dropOffRate.toFixed(1)}% drop-off</div>
                        </div>
                      </div>
                      {index < funnel.steps.length - 1 && (
                        <div className="absolute left-4 top-12 w-0.5 h-6 bg-gray-300"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {funnels.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-lg">No conversion funnels configured</p>
                <p className="text-sm">Create funnels to track user journey and conversion rates.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* A/B Tests Tab */}
      {selectedView === 'ab-tests' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">A/B Tests</h3>
            <button
              onClick={() => createAbTest({
                name: 'New A/B Test',
                description: 'Test description',
                status: 'draft',
                variants: [],
                targetMetric: 'conversion_rate',
                startDate: new Date().toISOString(),
                confidence: 0
              })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create A/B Test
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {abTests.map((test) => (
              <div key={test.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{test.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        test.status === 'running' ? 'bg-green-100 text-green-800' :
                        test.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        test.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {test.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(test.startDate).toLocaleDateString()} - {test.endDate ? new Date(test.endDate).toLocaleDateString() : 'Ongoing'}
                      </span>
                    </div>
                  </div>
                  {test.winner && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">Winner: {test.winner}</div>
                      <div className="text-xs text-gray-600">{test.confidence.toFixed(1)}% confidence</div>
                    </div>
                  )}
                </div>

                {/* Test Variants */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {test.variants.map((variant) => (
                    <div key={variant.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-gray-900">{variant.name}</h5>
                          <p className="text-xs text-gray-600">{variant.description}</p>
                        </div>
                        <span className="text-xs text-gray-500">{variant.trafficPercentage}% traffic</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{variant.visitors}</div>
                          <div className="text-xs text-gray-600">Visitors</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600">{variant.conversions}</div>
                          <div className="text-xs text-gray-600">Conversions</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-blue-600">{variant.conversionRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-600">Rate</div>
                        </div>
                      </div>

                      {variant.improvement !== 0 && (
                        <div className={`text-xs mt-2 ${variant.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {variant.improvement > 0 ? '+' : ''}{variant.improvement.toFixed(1)}% improvement
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {abTests.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">🧪</div>
                <p className="text-lg">No A/B tests configured</p>
                <p className="text-sm">Create tests to optimize your landing page performance.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-600">🔒</span>
          <div>
            <h4 className="font-medium text-yellow-800">Privacy & Tracking</h4>
            <p className="text-yellow-700 text-sm mt-1">
              Analytics tracking collects anonymous usage data to improve user experience.
              Users can opt-out of tracking at any time. All data is processed in compliance with privacy regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}