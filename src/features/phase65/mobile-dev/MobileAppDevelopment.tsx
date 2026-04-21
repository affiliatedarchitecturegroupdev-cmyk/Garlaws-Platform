'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MobileApp {
  id: string;
  name: string;
  platform: 'ios' | 'android' | 'pwa';
  version: string;
  status: 'developing' | 'testing' | 'published' | 'updating';
  downloads: number;
  rating: number;
  lastUpdated: string;
}

interface MobileFeature {
  id: string;
  name: string;
  description: string;
  status: 'implemented' | 'developing' | 'planned';
  platform: 'ios' | 'android' | 'both';
  priority: 'high' | 'medium' | 'low';
}

const mobileApps: MobileApp[] = [
  {
    id: 'garlaws-ios',
    name: 'Garlaws Property Manager',
    platform: 'ios',
    version: '2.4.1',
    status: 'published',
    downloads: 15420,
    rating: 4.8,
    lastUpdated: '2026-04-20'
  },
  {
    id: 'garlaws-android',
    name: 'Garlaws Property Manager',
    platform: 'android',
    version: '2.4.0',
    status: 'published',
    downloads: 28940,
    rating: 4.7,
    lastUpdated: '2026-04-19'
  },
  {
    id: 'garlaws-pwa',
    name: 'Garlaws PWA',
    platform: 'pwa',
    version: '3.1.2',
    status: 'published',
    downloads: 5670,
    rating: 4.9,
    lastUpdated: '2026-04-21'
  }
];

const mobileFeatures: MobileFeature[] = [
  {
    id: 'offline-sync',
    name: 'Offline Data Synchronization',
    description: 'Complete offline functionality with background sync',
    status: 'implemented',
    platform: 'both',
    priority: 'high'
  },
  {
    id: 'biometric-auth',
    name: 'Biometric Authentication',
    description: 'Face ID and fingerprint login support',
    status: 'implemented',
    platform: 'both',
    priority: 'high'
  },
  {
    id: 'camera-integration',
    name: 'Advanced Camera Integration',
    description: 'Property inspection photos with AI analysis',
    status: 'developing',
    platform: 'both',
    priority: 'high'
  },
  {
    id: 'push-notifications',
    name: 'Smart Push Notifications',
    description: 'Context-aware notifications with scheduling',
    status: 'implemented',
    platform: 'both',
    priority: 'medium'
  },
  {
    id: 'gesture-navigation',
    name: 'Gesture-Based Navigation',
    description: 'Swipe gestures and haptic feedback',
    status: 'developing',
    platform: 'both',
    priority: 'medium'
  },
  {
    id: 'wearable-integration',
    name: 'Wearable Device Integration',
    description: 'Apple Watch and Android Wear support',
    status: 'planned',
    platform: 'both',
    priority: 'low'
  }
];

export default function MobileAppDevelopment() {
  const [selectedApp, setSelectedApp] = useState<MobileApp | null>(null);
  const [selectedTab, setSelectedTab] = useState<'apps' | 'features' | 'analytics' | 'deployment'>('apps');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'developing': return 'bg-blue-100 text-blue-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      case 'updating': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios': return '🍎';
      case 'android': return '🤖';
      case 'pwa': return '🌐';
      default: return '📱';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Garlaws</span>
            </Link>

            <div className="flex items-center gap-8">
              <Link href="/mobile" className="text-gray-600 hover:text-gray-900">Mobile Apps</Link>
              <Link href="/ios" className="text-gray-600 hover:text-gray-900">iOS</Link>
              <Link href="/android" className="text-gray-600 hover:text-gray-900">Android</Link>
              <Link href="/pwa" className="text-gray-600 hover:text-gray-900">PWA</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mobile App Development</h1>
          <p className="text-gray-600">Native iOS/Android apps with advanced mobile features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mobileApps.reduce((sum, app) => sum + app.downloads, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">📱</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(mobileApps.reduce((sum, app) => sum + app.rating, 0) / mobileApps.length).toFixed(1)}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-sm">⭐</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Apps</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mobileApps.filter(app => app.status === 'published').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Active Users</p>
                <p className="text-2xl font-bold text-gray-900">45.2K</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm">👥</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'apps', label: 'App Management' },
                { id: 'features', label: 'Mobile Features' },
                { id: 'analytics', label: 'App Analytics' },
                { id: 'deployment', label: 'Deployment' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'apps' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Mobile Applications</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    Create New App
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {mobileApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer"
                      onClick={() => setSelectedApp(app)}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{getPlatformIcon(app.platform)}</span>
                        <div>
                          <h3 className="font-medium text-gray-900">{app.name}</h3>
                          <p className="text-sm text-gray-600">{app.platform.toUpperCase()} v{app.version}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-sm font-medium">{app.rating}</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <div>Downloads: {app.downloads.toLocaleString()}</div>
                        <div>Last updated: {app.lastUpdated}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'features' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Mobile Features</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    Add Feature
                  </button>
                </div>

                <div className="space-y-4">
                  {mobileFeatures.map((feature) => (
                    <div key={feature.id} className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900">{feature.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            feature.platform === 'both' ? 'bg-blue-100 text-blue-800' :
                            feature.platform === 'ios' ? 'bg-gray-100 text-gray-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {feature.platform === 'both' ? 'iOS + Android' : feature.platform.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(feature.priority)}`}>
                            {feature.priority}
                          </span>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            feature.status === 'implemented' ? 'bg-green-100 text-green-800' :
                            feature.status === 'developing' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {feature.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{feature.description}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Priority: {feature.priority}</span>
                        <span>Platform: {feature.platform}</span>
                        <span>Status: {feature.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'analytics' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">App Analytics</h2>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Daily Active Users</h3>
                    <p className="text-2xl font-bold text-blue-600">12.4K</p>
                    <p className="text-xs text-blue-700">+8.2% vs last week</p>
                  </div>

                  <div className="p-6 bg-green-50 rounded-lg">
                    <h3 className="text-sm font-medium text-green-900 mb-2">Session Duration</h3>
                    <p className="text-2xl font-bold text-green-600">4m 32s</p>
                    <p className="text-xs text-green-700">+12.1% vs last week</p>
                  </div>

                  <div className="p-6 bg-purple-50 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-900 mb-2">Crash Rate</h3>
                    <p className="text-2xl font-bold text-purple-600">0.08%</p>
                    <p className="text-xs text-purple-700">-15.3% vs last week</p>
                  </div>

                  <div className="p-6 bg-orange-50 rounded-lg">
                    <h3 className="text-sm font-medium text-orange-900 mb-2">App Store Rating</h3>
                    <p className="text-2xl font-bold text-orange-600">4.75</p>
                    <p className="text-xs text-orange-700">+0.1 vs last week</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Distribution</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🍎</span>
                        <span className="text-sm font-medium">iOS</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-gray-600 h-2 rounded-full" style={{ width: '54%' }} />
                        </div>
                        <span className="text-sm text-gray-600">54%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🤖</span>
                        <span className="text-sm font-medium">Android</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '42%' }} />
                        </div>
                        <span className="text-sm text-gray-600">42%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🌐</span>
                        <span className="text-sm font-medium">PWA</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '4%' }} />
                        </div>
                        <span className="text-sm text-gray-600">4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'deployment' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">App Store Deployment</h2>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                    Deploy All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🍎</span>
                      <div>
                        <h3 className="font-medium text-gray-900">App Store Connect</h3>
                        <p className="text-sm text-gray-600">iOS App Store deployment</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Build Status:</span>
                        <span className="text-green-600">✅ Ready</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Version:</span>
                        <span className="text-gray-900">2.4.1</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Review Time:</span>
                        <span className="text-gray-900">~24 hours</span>
                      </div>
                    </div>

                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700">
                      Submit to App Store
                    </button>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🤖</span>
                      <div>
                        <h3 className="font-medium text-gray-900">Google Play Console</h3>
                        <p className="text-sm text-gray-600">Android Play Store deployment</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Build Status:</span>
                        <span className="text-green-600">✅ Ready</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Version:</span>
                        <span className="text-gray-900">2.4.0</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Review Time:</span>
                        <span className="text-gray-900">~2-3 hours</span>
                      </div>
                    </div>

                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700">
                      Submit to Play Store
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-400 text-xl">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Deployment Checklist</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>TestFlight beta testing completed</li>
                          <li>Privacy policy updated for new features</li>
                          <li>Screenshots and app store assets ready</li>
                          <li>Release notes documented</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedApp.name}</h3>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Platform</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <span>{getPlatformIcon(selectedApp.platform)}</span>
                      {selectedApp.platform.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Version</p>
                    <p className="font-medium text-gray-900">{selectedApp.version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Downloads</p>
                    <p className="font-medium text-gray-900">{selectedApp.downloads.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      {selectedApp.rating}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700">
                    Update App
                  </button>
                  <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300">
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}