'use client';

import { useState } from 'react';
import AdvancedOfflineFunctionality from '@/features/mobile/offline/AdvancedOfflineFunctionality';
import NativeDeviceIntegrations from '@/features/mobile/native/NativeDeviceIntegrations';
import PushNotificationSystem from '@/features/mobile/push/PushNotificationSystem';
import MobilePerformanceOptimization from '@/features/mobile/optimization/MobilePerformanceOptimization';

type TabType = 'offline' | 'native' | 'push' | 'performance';

export default function MobileDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('offline');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mobile & PWA Platform</h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('offline')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'offline'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Advanced Offline
            </button>
            <button
              onClick={() => setActiveTab('native')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'native'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Native Device Integration
            </button>
            <button
              onClick={() => setActiveTab('push')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'push'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Push Notifications
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'performance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Performance Optimization
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'offline' && <AdvancedOfflineFunctionality />}
        {activeTab === 'native' && <NativeDeviceIntegrations />}
        {activeTab === 'push' && <PushNotificationSystem />}
        {activeTab === 'performance' && <MobilePerformanceOptimization />}
      </div>
    </div>
  );
}