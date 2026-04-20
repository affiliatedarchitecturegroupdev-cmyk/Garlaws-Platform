'use client';

import { useState, useEffect } from 'react';
import BusinessProcessAutomation from '@/features/erp/workflows/BusinessProcessAutomation';
import CrossSystemSync from '@/features/erp/sync/CrossSystemSync';
import IndustrySpecificModules from '@/features/erp/industry/IndustrySpecificModules';
import ERPAutomationEngine from '@/features/erp/automation/ERPAutomationEngine';

interface ERPDashboard {
  totalConnectors: number;
  activeConnectors: number;
  runningWorkflows: number;
  recentSyncs: any[];
  pendingTransactions: number;
  syncSuccessRate: number;
  dataQuality: number;
  integrationUptime: number;
}

type TabType = 'overview' | 'workflows' | 'sync' | 'industry' | 'automation';

export default function ERPDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dashboard, setDashboard] = useState<ERPDashboard | null>(null);
  const [connectors, setConnectors] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashboardRes, connectorsRes, workflowsRes, transactionsRes] = await Promise.all([
        fetch('/api/erp?action=erp_dashboard&tenantId=default'),
        fetch('/api/erp?action=connectors&tenantId=default'),
        fetch('/api/erp?action=workflows&tenantId=default'),
        fetch('/api/erp?action=transactions&tenantId=default')
      ]);

      const dashboardData = await dashboardRes.json();
      const connectorsData = await connectorsRes.json();
      const workflowsData = await workflowsRes.json();
      const transactionsData = await transactionsRes.json();

      if (dashboardData.success) setDashboard(dashboardData.data);
      if (connectorsData.success) setConnectors(connectorsData.data);
      if (workflowsData.success) setWorkflows(workflowsData.data);
      if (transactionsData.success) setTransactions(transactionsData.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConnector = async () => {
    const response = await fetch('/api/erp?action=create_connector', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'SAP Integration',
        provider: 'sap',
        connectionType: 'api',
        endpoint: 'https://sap-api.example.com',
        syncFrequency: 'hourly',
        tenantId: 'default'
      })
    });
    if (response.ok) {
      fetchData();
      alert('ERP connector created successfully!');
    }
  };

  const handleCreateWorkflow = async () => {
    const response = await fetch('/api/erp?action=create_workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Purchase Order Approval',
        description: 'Automated PO approval workflow',
        workflowType: 'purchase_order',
        trigger: 'manual',
        tenantId: 'default'
      })
    });
    if (response.ok) {
      fetchData();
      alert('ERP workflow created successfully!');
    }
  };

  const handleSyncConnector = async () => {
    if (connectors.length === 0) return;

    const response = await fetch('/api/erp?action=sync_connector', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        connectorId: connectors[0].id,
        syncType: 'incremental',
        direction: 'bidirectional'
      })
    });
    if (response.ok) {
      fetchData();
      alert('ERP sync started successfully!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ERP Deep Integration Platform</h1>
          {activeTab === 'overview' && (
            <div className="flex space-x-4">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={handleCreateConnector}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Connector
              </button>
              <button
                onClick={handleCreateWorkflow}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                New Workflow
              </button>
              <button
                onClick={handleSyncConnector}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Sync Data
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('workflows')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'workflows'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Business Process Automation
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'sync'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cross-System Sync
            </button>
            <button
              onClick={() => setActiveTab('industry')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'industry'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Industry Modules
            </button>
            <button
              onClick={() => setActiveTab('automation')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'automation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Automation Engine
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Key ERP Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Connectors</p>
                <p className="text-2xl font-bold text-blue-600">{dashboard?.totalConnectors || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Connectors</p>
                <p className="text-2xl font-bold text-green-600">{dashboard?.activeConnectors || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Running Workflows</p>
                <p className="text-2xl font-bold text-purple-600">{dashboard?.runningWorkflows || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sync Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{dashboard?.syncSuccessRate?.toFixed(1) || 0}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ERP Connectors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">ERP Connectors</h2>
              <button onClick={handleCreateConnector} className="text-blue-600 hover:text-blue-700 text-sm">
                + Add Connector
              </button>
            </div>
            <div className="space-y-4">
              {connectors.length > 0 ? connectors.map((connector) => (
                <div key={connector.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{connector.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      connector.status === 'connected' ? 'bg-green-100 text-green-800' :
                      connector.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {connector.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>Provider: <span className="font-medium">{connector.provider}</span></div>
                    <div>Type: <span className="font-medium">{connector.connectionType}</span></div>
                    <div>Sync: <span className="font-medium">{connector.syncFrequency}</span></div>
                    <div>Last Sync: <span className="font-medium">
                      {connector.lastSync ? new Date(connector.lastSync).toLocaleString() : 'Never'}
                    </span></div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No ERP connectors configured</p>
                  <button onClick={handleCreateConnector} className="mt-2 text-blue-600 hover:text-blue-700 text-sm">
                    Create your first connector
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">ERP Workflows</h2>
              <button onClick={handleCreateWorkflow} className="text-green-600 hover:text-green-700 text-sm">
                + New Workflow
              </button>
            </div>
            <div className="space-y-4">
              {workflows.length > 0 ? workflows.map((workflow) => (
                <div key={workflow.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      workflow.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Type: {workflow.workflowType}</span>
                    <span>Trigger: {workflow.trigger}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No ERP workflows configured</p>
                  <button onClick={handleCreateWorkflow} className="mt-2 text-green-600 hover:text-green-700 text-sm">
                    Create your first workflow
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Syncs & Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Sync Activity</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dashboard?.recentSyncs?.map((sync: any) => (
                <div key={sync.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {sync.syncType} sync
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(sync.startTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      sync.status === 'completed' ? 'bg-green-100 text-green-800' :
                      sync.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {sync.status}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      {sync.recordsProcessed || 0} records
                    </p>
                  </div>
                </div>
              )) || <p className="text-gray-500">No recent sync activity</p>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Transactions</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.filter(t => t.status === 'pending').slice(0, 5).map((transaction: any) => (
                <div key={transaction.id} className="border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 text-sm">{transaction.transactionId}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.priority === 'high' ? 'bg-red-100 text-red-800' :
                      transaction.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {transaction.sourceModule} → {transaction.targetModule}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Type: {transaction.transactionType}</span>
                    <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {transactions.filter(t => t.status === 'pending').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No pending transactions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ERP System Health */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ERP System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{dashboard?.dataQuality?.toFixed(1) || 0}%</div>
              <div className="text-sm text-gray-600">Data Quality</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{dashboard?.integrationUptime?.toFixed(1) || 0}%</div>
              <div className="text-sm text-gray-600">Integration Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{dashboard?.pendingTransactions || 0}</div>
              <div className="text-sm text-gray-600">Pending Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{connectors.filter(c => c.status === 'error').length}</div>
              <div className="text-sm text-gray-600">Failed Connectors</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex flex-col items-center px-4 py-3 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
              <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-blue-600">Generate Report</span>
            </button>
            <button className="flex flex-col items-center px-4 py-3 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors">
              <svg className="w-6 h-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm font-medium text-green-600">Run ETL Process</span>
            </button>
            <button className="flex flex-col items-center px-4 py-3 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors">
              <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-purple-600">System Settings</span>
            </button>
          </div>
        </div>
          </>
        )}

        {activeTab === 'workflows' && <BusinessProcessAutomation />}
        {activeTab === 'sync' && <CrossSystemSync />}
        {activeTab === 'industry' && <IndustrySpecificModules />}
        {activeTab === 'automation' && <ERPAutomationEngine />}
      </div>
    </div>
  );
}