'use client';

import { useState } from 'react';
import WebhookManager from '@/features/integrations/webhooks/WebhookManager';
import APIConnectorLibrary from '@/features/integrations/connectors/APIConnectorLibrary';
import DataSyncEngine from '@/features/integrations/sync/DataSyncEngine';
import IntegrationWorkflowBuilder from '@/features/integrations/workflows/IntegrationWorkflowBuilder';

type TabType = 'webhooks' | 'connectors' | 'sync' | 'workflows';

export default function IntegrationsDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('webhooks');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Integration Platform</h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'webhooks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Webhooks
            </button>
            <button
              onClick={() => setActiveTab('connectors')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'connectors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              API Connectors
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'sync'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Data Sync
            </button>
            <button
              onClick={() => setActiveTab('workflows')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'workflows'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Workflows
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'webhooks' && <WebhookManager />}
        {activeTab === 'connectors' && <APIConnectorLibrary />}
        {activeTab === 'sync' && <DataSyncEngine />}
        {activeTab === 'workflows' && <IntegrationWorkflowBuilder />}
      </div>
    </div>
  );
}