'use client';

import { useState, useEffect, useCallback } from 'react';

interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'stream' | 'iot' | 'blockchain';
  connection: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    endpoint?: string;
    filePath?: string;
  };
  schema: DataTable[];
  lastSync: Date;
  syncFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
  status: 'active' | 'inactive' | 'error';
  recordsCount: number;
}

interface DataTable {
  id: string;
  name: string;
  description: string;
  columns: DataColumn[];
  primaryKey: string[];
  indexes: string[][];
  relationships: DataRelationship[];
  rowCount: number;
  lastUpdated: Date;
  dataQuality: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
  };
}

interface DataColumn {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'binary';
  nullable: boolean;
  description?: string;
  constraints?: string[];
  statistics?: {
    distinctValues: number;
    nullCount: number;
    minValue?: any;
    maxValue?: any;
    averageValue?: number;
  };
}

interface DataRelationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  targetTable: string;
  sourceColumns: string[];
  targetColumns: string[];
  cardinality: string;
}

interface DataPipeline {
  id: string;
  name: string;
  description: string;
  source: DataSource;
  targetTable: string;
  transformation: PipelineTransformation[];
  schedule: {
    frequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
    lastRun?: Date;
    nextRun?: Date;
  };
  status: 'active' | 'paused' | 'error';
  metrics: {
    recordsProcessed: number;
    processingTime: number;
    errorCount: number;
    throughput: number;
  };
}

interface PipelineTransformation {
  id: string;
  type: 'filter' | 'map' | 'join' | 'aggregate' | 'validate' | 'clean';
  config: Record<string, any>;
  order: number;
}

interface QueryExecution {
  id: string;
  query: string;
  user: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed';
  resultCount?: number;
  executionTime?: number;
  error?: string;
}

interface EnterpriseDataWarehouseProps {
  tenantId?: string;
  onDataUpdate?: (update: { table: string; operation: string; recordCount: number }) => void;
  onQueryExecuted?: (query: QueryExecution) => void;
}

const SAMPLE_DATA_SOURCES: DataSource[] = [
  {
    id: 'postgres_main',
    name: 'Main PostgreSQL Database',
    type: 'database',
    connection: {
      host: 'db-primary.garlaws.com',
      port: 5432,
      database: 'garlaws_main',
      username: 'warehouse_user'
    },
    schema: [],
    lastSync: new Date('2024-04-23T06:00:00Z'),
    syncFrequency: 'real-time',
    status: 'active',
    recordsCount: 12500000
  },
  {
    id: 'salesforce_api',
    name: 'Salesforce CRM API',
    type: 'api',
    connection: {
      endpoint: 'https://garlaws.my.salesforce.com/services/data/v55.0'
    },
    schema: [],
    lastSync: new Date('2024-04-23T05:45:00Z'),
    syncFrequency: 'hourly',
    status: 'active',
    recordsCount: 2500000
  },
  {
    id: 'iot_sensors',
    name: 'IoT Sensor Network',
    type: 'iot',
    connection: {
      endpoint: 'mqtt://iot.garlaws.com:1883'
    },
    schema: [],
    lastSync: new Date('2024-04-23T06:40:00Z'),
    syncFrequency: 'real-time',
    status: 'active',
    recordsCount: 50000000
  },
  {
    id: 'financial_reports',
    name: 'Financial Reports CSV',
    type: 'file',
    connection: {
      filePath: '/data/financial/*.csv'
    },
    schema: [],
    lastSync: new Date('2024-04-22T18:00:00Z'),
    syncFrequency: 'daily',
    status: 'active',
    recordsCount: 500000
  }
];

const SAMPLE_TABLES: DataTable[] = [
  {
    id: 'customers',
    name: 'customers',
    description: 'Customer master data with demographics and contact information',
    columns: [
      {
        name: 'customer_id',
        type: 'string',
        nullable: false,
        description: 'Unique customer identifier',
        constraints: ['PRIMARY KEY'],
        statistics: { distinctValues: 1250000, nullCount: 0 }
      },
      {
        name: 'first_name',
        type: 'string',
        nullable: false,
        statistics: { distinctValues: 45000, nullCount: 0 }
      },
      {
        name: 'last_name',
        type: 'string',
        nullable: false,
        statistics: { distinctValues: 75000, nullCount: 0 }
      },
      {
        name: 'email',
        type: 'string',
        nullable: false,
        constraints: ['UNIQUE'],
        statistics: { distinctValues: 1250000, nullCount: 0 }
      },
      {
        name: 'created_at',
        type: 'date',
        nullable: false,
        statistics: { minValue: '2020-01-01', maxValue: '2024-04-23' }
      }
    ],
    primaryKey: ['customer_id'],
    indexes: [['email'], ['created_at']],
    relationships: [
      {
        type: 'one-to-many',
        targetTable: 'orders',
        sourceColumns: ['customer_id'],
        targetColumns: ['customer_id'],
        cardinality: '1:N'
      }
    ],
    rowCount: 1250000,
    lastUpdated: new Date('2024-04-23T06:30:00Z'),
    dataQuality: {
      completeness: 0.98,
      accuracy: 0.96,
      consistency: 0.94,
      timeliness: 0.99
    }
  },
  {
    id: 'orders',
    name: 'orders',
    description: 'Order transactions with line items and fulfillment details',
    columns: [
      {
        name: 'order_id',
        type: 'string',
        nullable: false,
        constraints: ['PRIMARY KEY'],
        statistics: { distinctValues: 5000000, nullCount: 0 }
      },
      {
        name: 'customer_id',
        type: 'string',
        nullable: false,
        constraints: ['FOREIGN KEY'],
        statistics: { distinctValues: 850000, nullCount: 0 }
      },
      {
        name: 'order_date',
        type: 'date',
        nullable: false,
        statistics: { minValue: '2020-01-01', maxValue: '2024-04-23' }
      },
      {
        name: 'total_amount',
        type: 'number',
        nullable: false,
        statistics: { minValue: 0, maxValue: 50000, averageValue: 125.50 }
      },
      {
        name: 'status',
        type: 'string',
        nullable: false,
        statistics: { distinctValues: 5, nullCount: 0 }
      }
    ],
    primaryKey: ['order_id'],
    indexes: [['customer_id'], ['order_date'], ['status']],
    relationships: [
      {
        type: 'many-to-one',
        targetTable: 'customers',
        sourceColumns: ['customer_id'],
        targetColumns: ['customer_id'],
        cardinality: 'N:1'
      },
      {
        type: 'one-to-many',
        targetTable: 'order_items',
        sourceColumns: ['order_id'],
        targetColumns: ['order_id'],
        cardinality: '1:N'
      }
    ],
    rowCount: 5000000,
    lastUpdated: new Date('2024-04-23T06:35:00Z'),
    dataQuality: {
      completeness: 0.97,
      accuracy: 0.95,
      consistency: 0.93,
      timeliness: 0.98
    }
  }
];

export default function EnterpriseDataWarehouse({
  tenantId = 'default',
  onDataUpdate,
  onQueryExecuted
}: EnterpriseDataWarehouseProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'tables' | 'pipelines' | 'queries'>('overview');
  const [dataSources, setDataSources] = useState<DataSource[]>(SAMPLE_DATA_SOURCES);
  const [tables, setTables] = useState<DataTable[]>(SAMPLE_TABLES);
  const [pipelines, setPipelines] = useState<DataPipeline[]>([]);
  const [queries, setQueries] = useState<QueryExecution[]>([]);
  const [selectedTable, setSelectedTable] = useState<DataTable | null>(null);
  const [queryInput, setQueryInput] = useState('');

  const executeQuery = useCallback(async (query: string) => {
    const queryExecution: QueryExecution = {
      id: `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      query,
      user: 'admin',
      startTime: new Date(),
      status: 'running'
    };

    setQueries(prev => [queryExecution, ...prev]);

    // Simulate query execution
    const executionTime = 500 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, executionTime));

    const success = Math.random() > 0.05; // 95% success rate
    const resultCount = success ? Math.floor(Math.random() * 100000) : undefined;

    const completedQuery: QueryExecution = {
      ...queryExecution,
      status: success ? 'completed' : 'failed',
      endTime: new Date(),
      resultCount,
      executionTime,
      error: success ? undefined : 'Query execution failed: syntax error'
    };

    setQueries(prev => prev.map(q => q.id === queryExecution.id ? completedQuery : q));
    onQueryExecuted?.(completedQuery);
  }, [onQueryExecuted]);

  const createDataPipeline = useCallback((sourceId: string, tableName: string) => {
    const source = dataSources.find(s => s.id === sourceId);
    if (!source) return;

    const pipeline: DataPipeline = {
      id: `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${source.name} → ${tableName}`,
      description: `Data pipeline from ${source.name} to ${tableName} table`,
      source,
      targetTable: tableName,
      transformation: [
        {
          id: 'validate',
          type: 'validate',
          config: { rules: ['not_null', 'data_type'] },
          order: 1
        },
        {
          id: 'clean',
          type: 'clean',
          config: { removeDuplicates: true, standardizeFormats: true },
          order: 2
        },
        {
          id: 'map',
          type: 'map',
          config: { fieldMappings: {} },
          order: 3
        }
      ],
      schedule: {
        frequency: 'real-time',
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 3600000) // 1 hour
      },
      status: 'active',
      metrics: {
        recordsProcessed: 0,
        processingTime: 0,
        errorCount: 0,
        throughput: 0
      }
    };

    setPipelines(prev => [...prev, pipeline]);
  }, [dataSources]);

  const getDataSourceIcon = (type: DataSource['type']) => {
    switch (type) {
      case 'database': return '🗄️';
      case 'api': return '🔗';
      case 'file': return '📄';
      case 'stream': return '🌊';
      case 'iot': return '📡';
      case 'blockchain': return '⧫';
      default: return '📊';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#6B7280';
      case 'error': return '#EF4444';
      case 'completed': return '#3B82F6';
      case 'running': return '#F59E0B';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const totalRecords = dataSources.reduce((sum, source) => sum + source.recordsCount, 0);
  const activeSources = dataSources.filter(s => s.status === 'active').length;
  const activePipelines = pipelines.filter(p => p.status === 'active').length;
  const recentQueries = queries.filter(q => q.startTime > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enterprise Data Warehouse</h1>
            <p className="text-gray-600">Centralized data warehouse with real-time updates and analytics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Tenant</div>
              <div className="font-mono text-sm">{tenantId}</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{activeSources}</div>
            <div className="text-sm text-gray-600">Active Sources</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{tables.length}</div>
            <div className="text-sm text-gray-600">Data Tables</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalRecords.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Records</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{activePipelines}</div>
            <div className="text-sm text-gray-600">Active Pipelines</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'sources', label: 'Data Sources', icon: '🔗' },
              { id: 'tables', label: 'Data Tables', icon: '📋' },
              { id: 'pipelines', label: 'Pipelines', icon: '🔄' },
              { id: 'queries', label: 'Query Analytics', icon: '🔍' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Storage Overview */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Storage Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Storage Used</span>
                      <span className="font-bold">2.4 TB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                    <div className="text-xs text-gray-600">68% of 3.5 TB capacity</div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">1.2 TB</div>
                        <div className="text-sm text-gray-600">Structured Data</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">1.2 TB</div>
                        <div className="text-sm text-gray-600">Unstructured Data</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Quality Overview */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Data Quality Overview</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">96.2%</div>
                        <div className="text-sm text-gray-600">Completeness</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">94.8%</div>
                        <div className="text-sm text-gray-600">Accuracy</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <div className="text-2xl font-bold text-purple-600">93.1%</div>
                        <div className="text-sm text-gray-600">Consistency</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded">
                        <div className="text-2xl font-bold text-orange-600">97.9%</div>
                        <div className="text-sm text-gray-600">Timeliness</div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Quality Score</span>
                        <span>95.5%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '95.5%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { time: '2 minutes ago', action: 'Processed 15,000 records from IoT sensors', type: 'pipeline' },
                    { time: '5 minutes ago', action: 'Updated customer table schema', type: 'schema' },
                    { time: '12 minutes ago', action: 'Synced Salesforce data (2,500 records)', type: 'sync' },
                    { time: '18 minutes ago', action: 'Executed analytical query (45,000 results)', type: 'query' },
                    { time: '25 minutes ago', action: 'Created new data pipeline for financial reports', type: 'pipeline' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'pipeline' ? 'bg-blue-500' :
                        activity.type === 'schema' ? 'bg-green-500' :
                        activity.type === 'sync' ? 'bg-purple-500' :
                        'bg-orange-500'
                      }`}></div>
                      <div className="flex-1 text-sm">{activity.action}</div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('sources')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Manage Data Sources
                </button>
                <button
                  onClick={() => setActiveTab('queries')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Run Analytics Query
                </button>
                <button
                  onClick={() => setActiveTab('pipelines')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Create Data Pipeline
                </button>
              </div>
            </div>
          )}

          {/* Data Sources Tab */}
          {activeTab === 'sources' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Data Sources</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Add Data Source
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dataSources.map((source) => (
                  <div
                    key={source.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getDataSourceIcon(source.type)}</span>
                        <div>
                          <h3 className="font-medium text-gray-900">{source.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{source.type} Source</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full text-white ${
                          source.status === 'active' ? 'bg-green-600' :
                          source.status === 'inactive' ? 'bg-gray-600' :
                          'bg-red-600'
                        }`}
                      >
                        {source.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Records:</span>
                        <span className="font-medium">{source.recordsCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Sync:</span>
                        <span className="font-medium">{source.lastSync.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Frequency:</span>
                        <span className="font-medium capitalize">{source.syncFrequency.replace('-', ' ')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Configure
                      </button>
                      <button
                        onClick={() => createDataPipeline(source.id, `table_${source.id}`)}
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Create Pipeline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Tables Tab */}
          {activeTab === 'tables' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Data Tables</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search tables..."
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Create Table
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedTable(table)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">{table.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {table.columns.length} columns
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {table.rowCount.toLocaleString()} rows
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{table.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-sm font-bold text-green-600">
                          {(table.dataQuality.completeness * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Completeness</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-sm font-bold text-blue-600">
                          {(table.dataQuality.accuracy * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Accuracy</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Query Data
                      </button>
                      <button className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
                        View Schema
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pipelines Tab */}
          {activeTab === 'pipelines' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Data Pipelines</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Pipeline
                </button>
              </div>

              {pipelines.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">🔄</div>
                  <div>No data pipelines configured yet</div>
                  <div className="text-sm">Create pipelines to automate data ingestion and transformation</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {pipelines.map((pipeline) => (
                    <div key={pipeline.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{pipeline.name}</h3>
                          <p className="text-sm text-gray-600">{pipeline.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 text-sm rounded-full text-white ${
                              pipeline.status === 'active' ? 'bg-green-600' :
                              pipeline.status === 'paused' ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                          >
                            {pipeline.status}
                          </span>
                          <span className="text-sm text-gray-500 capitalize">
                            {pipeline.schedule.frequency}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-gray-900">
                            {pipeline.metrics.recordsProcessed.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Records Processed</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-gray-900">
                            {pipeline.metrics.processingTime.toFixed(1)}s
                          </div>
                          <div className="text-sm text-gray-600">Avg Processing Time</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-red-600">
                            {pipeline.metrics.errorCount}
                          </div>
                          <div className="text-sm text-gray-600">Errors</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-blue-600">
                            {pipeline.metrics.throughput.toLocaleString()}/min
                          </div>
                          <div className="text-sm text-gray-600">Throughput</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm font-medium mb-2">Transformations ({pipeline.transformation.length})</div>
                        <div className="flex flex-wrap gap-2">
                          {pipeline.transformation.map((transform) => (
                            <span key={transform.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                              {transform.type}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                          Edit Pipeline
                        </button>
                        <button className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                          Run Now
                        </button>
                        <button className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
                          View Logs
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Queries Tab */}
          {activeTab === 'queries' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Query Analytics</h2>
                <div className="text-sm text-gray-600">
                  {recentQueries} queries in last 24 hours
                </div>
              </div>

              {/* Query Editor */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">SQL Query Editor</h3>
                <textarea
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder={`SELECT customer_id, COUNT(*) as order_count
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_date >= '2024-01-01'
GROUP BY customer_id
ORDER BY order_count DESC
LIMIT 10;`}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => executeQuery(queryInput)}
                    disabled={!queryInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Execute Query
                  </button>
                  <button
                    onClick={() => setQueryInput('')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Query History */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Query History</h3>
                {queries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🔍</div>
                    <div>No queries executed yet</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {queries.map((query) => (
                      <div key={query.id} className="border border-gray-200 rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">Query {query.id.slice(-8)}</span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                query.status === 'completed' ? 'bg-green-100 text-green-800' :
                                query.status === 'running' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {query.status}
                            </span>
                            {query.executionTime && (
                              <span className="text-xs text-gray-500">
                                {query.executionTime.toFixed(1)}ms
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-xs font-mono bg-gray-50 p-2 rounded mb-2 max-h-20 overflow-y-auto">
                          {query.query.length > 100 ? `${query.query.substring(0, 100)}...` : query.query}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>By {query.user} at {query.startTime.toLocaleString()}</span>
                          {query.resultCount !== undefined && (
                            <span>{query.resultCount.toLocaleString()} results</span>
                          )}
                        </div>

                        {query.error && (
                          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                            {query.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table Details Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedTable.name}</h2>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-600">{selectedTable.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{selectedTable.columns.length}</div>
                    <div className="text-sm text-gray-600">Columns</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{selectedTable.rowCount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Rows</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{selectedTable.relationships.length}</div>
                    <div className="text-sm text-gray-600">Relationships</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">
                      {selectedTable.lastUpdated.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">Last Updated</div>
                  </div>
                </div>

                {/* Data Quality */}
                <div>
                  <h3 className="font-medium mb-3">Data Quality Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">
                        {(selectedTable.dataQuality.completeness * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Completeness</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {(selectedTable.dataQuality.accuracy * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-lg font-bold text-purple-600">
                        {(selectedTable.dataQuality.consistency * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Consistency</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <div className="text-lg font-bold text-orange-600">
                        {(selectedTable.dataQuality.timeliness * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Timeliness</div>
                    </div>
                  </div>
                </div>

                {/* Schema */}
                <div>
                  <h3 className="font-medium mb-3">Table Schema</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Column</th>
                          <th className="text-left py-2">Type</th>
                          <th className="text-left py-2">Nullable</th>
                          <th className="text-left py-2">Description</th>
                          <th className="text-left py-2">Statistics</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTable.columns.map((column) => (
                          <tr key={column.name} className="border-b">
                            <td className="py-2 font-medium">{column.name}</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 text-xs rounded ${
                                column.type === 'string' ? 'bg-blue-100 text-blue-800' :
                                column.type === 'number' ? 'bg-green-100 text-green-800' :
                                column.type === 'date' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {column.type}
                              </span>
                            </td>
                            <td className="py-2">
                              {column.nullable ? (
                                <span className="text-red-600">Yes</span>
                              ) : (
                                <span className="text-green-600">No</span>
                              )}
                            </td>
                            <td className="py-2 text-gray-600">{column.description || '-'}</td>
                            <td className="py-2 text-gray-600">
                              {column.statistics ? (
                                <div className="text-xs">
                                  <div>Distinct: {column.statistics.distinctValues?.toLocaleString()}</div>
                                  <div>Null: {column.statistics.nullCount}</div>
                                </div>
                              ) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Generate Sample Query
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Export Schema
                  </button>
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}