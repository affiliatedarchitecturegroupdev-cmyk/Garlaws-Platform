'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

// Data Virtualization Types
export type DataSourceType =
  | 'database'
  | 'api'
  | 'file'
  | 'stream'
  | 'cache'
  | 'blockchain'
  | 'iot';

export type DataFormat =
  | 'json'
  | 'xml'
  | 'csv'
  | 'parquet'
  | 'avro'
  | 'protobuf';

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  format: DataFormat;
  connection: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string; // In real implementation, use secure storage
    apiKey?: string;
    endpoint?: string;
    filePath?: string;
    streamUrl?: string;
  };
  schema: DataSchema;
  metadata: {
    recordCount?: number;
    lastUpdated?: string;
    size?: number;
    encoding?: string;
    compression?: string;
  };
  status: 'active' | 'inactive' | 'error';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DataSchema {
  fields: DataField[];
  primaryKey?: string[];
  indexes?: string[];
  relationships?: DataRelationship[];
}

export interface DataField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  nullable: boolean;
  default?: any;
  description?: string;
  constraints?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    enum?: string[];
    minimum?: number;
    maximum?: number;
  };
}

export interface DataRelationship {
  name: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  sourceField: string;
  targetDataSource: string;
  targetField: string;
  cardinality: string;
}

export interface VirtualView {
  id: string;
  name: string;
  description: string;
  query: VirtualQuery;
  schema: DataSchema;
  caching: {
    enabled: boolean;
    ttl: number;
    strategy: 'write-through' | 'write-behind' | 'read-through';
  };
  accessControl: {
    roles: string[];
    permissions: ('read' | 'write' | 'delete')[];
  };
  status: 'active' | 'inactive' | 'draft';
  usage: {
    queryCount: number;
    averageResponseTime: number;
    lastQueried?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VirtualQuery {
  type: 'sql' | 'graphql' | 'rest' | 'custom';
  statement: string;
  parameters: VirtualParameter[];
  dataSources: string[]; // Data source IDs
  transformations: DataTransformation[];
  joins: VirtualJoin[];
  filters: VirtualFilter[];
  aggregations: VirtualAggregation[];
}

export interface VirtualParameter {
  name: string;
  type: string;
  required: boolean;
  default?: any;
  description?: string;
}

export interface DataTransformation {
  id: string;
  type: 'map' | 'filter' | 'reduce' | 'aggregate' | 'join' | 'pivot';
  field: string;
  operation: string;
  parameters?: Record<string, any>;
}

export interface VirtualJoin {
  type: 'inner' | 'left' | 'right' | 'full';
  leftDataSource: string;
  rightDataSource: string;
  leftField: string;
  rightField: string;
  alias?: string;
}

export interface VirtualFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'startswith' | 'endswith';
  value: any;
  dataSource?: string;
}

export interface VirtualAggregation {
  field: string;
  function: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct';
  alias?: string;
  groupBy?: string[];
}

export interface SemanticMapping {
  id: string;
  name: string;
  description: string;
  domain: string; // e.g., 'finance', 'healthcare', 'retail'
  mappings: SemanticFieldMapping[];
  ontologies: string[];
  rules: SemanticRule[];
  status: 'active' | 'draft' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export interface SemanticFieldMapping {
  sourceField: string;
  targetField: string;
  dataType: string;
  transformation?: string;
  confidence: number;
  mappings: {
    sourceValue: any;
    targetValue: any;
    confidence: number;
  }[];
}

export interface SemanticRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
}

export interface DataQuery {
  id: string;
  virtualViewId: string;
  parameters: Record<string, any>;
  result?: any;
  executionTime: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  cacheHit: boolean;
  timestamp: string;
}

// Data Virtualization Hook
export function useDataVirtualization() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [virtualViews, setVirtualViews] = useState<VirtualView[]>([]);
  const [semanticMappings, setSemanticMappings] = useState<SemanticMapping[]>([]);
  const [queries, setQueries] = useState<DataQuery[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data - in real implementation, this would come from backend
  const mockDataSources: DataSource[] = [
    {
      id: 'financial-db',
      name: 'Financial Database',
      type: 'database',
      format: 'json',
      connection: {
        host: 'db.garlaws.com',
        port: 5432,
        database: 'financial',
        username: 'api_user'
      },
      schema: {
        fields: [
          { name: 'id', type: 'string', nullable: false },
          { name: 'account_id', type: 'string', nullable: false },
          { name: 'amount', type: 'number', nullable: false },
          { name: 'currency', type: 'string', nullable: false },
          { name: 'date', type: 'date', nullable: false },
          { name: 'description', type: 'string', nullable: true }
        ],
        primaryKey: ['id'],
        indexes: ['account_id', 'date']
      },
      metadata: {
        recordCount: 1000000,
        lastUpdated: '2026-04-22T12:00:00Z',
        size: 500000000
      },
      status: 'active',
      tags: ['finance', 'transactions', 'postgresql'],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-04-22T12:00:00Z'
    },
    {
      id: 'supply-chain-api',
      name: 'Supply Chain REST API',
      type: 'api',
      format: 'json',
      connection: {
        endpoint: 'https://api.supply-chain.garlaws.com/v2'
      },
      schema: {
        fields: [
          { name: 'order_id', type: 'string', nullable: false },
          { name: 'supplier_id', type: 'string', nullable: false },
          { name: 'product_id', type: 'string', nullable: false },
          { name: 'quantity', type: 'number', nullable: false },
          { name: 'unit_price', type: 'number', nullable: false },
          { name: 'order_date', type: 'date', nullable: false },
          { name: 'status', type: 'string', nullable: false }
        ]
      },
      metadata: {
        recordCount: 500000,
        lastUpdated: '2026-04-22T11:30:00Z'
      },
      status: 'active',
      tags: ['supply-chain', 'orders', 'rest-api'],
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-04-22T11:30:00Z'
    }
  ];

  const mockVirtualViews: VirtualView[] = [
    {
      id: 'unified-financial-view',
      name: 'Unified Financial Overview',
      description: 'Combined view of all financial data across systems',
      query: {
        type: 'sql',
        statement: `
          SELECT
            t.id,
            t.account_id,
            t.amount,
            t.currency,
            t.date,
            t.description,
            a.account_name,
            a.account_type
          FROM financial.transactions t
          JOIN financial.accounts a ON t.account_id = a.id
          WHERE t.date >= ? AND t.date <= ?
        `,
        parameters: [
          { name: 'startDate', type: 'date', required: true },
          { name: 'endDate', type: 'date', required: true }
        ],
        dataSources: ['financial-db'],
        transformations: [],
        joins: [],
        filters: [],
        aggregations: []
      },
      schema: {
        fields: [
          { name: 'id', type: 'string', nullable: false },
          { name: 'account_id', type: 'string', nullable: false },
          { name: 'account_name', type: 'string', nullable: false },
          { name: 'account_type', type: 'string', nullable: false },
          { name: 'amount', type: 'number', nullable: false },
          { name: 'currency', type: 'string', nullable: false },
          { name: 'date', type: 'date', nullable: false },
          { name: 'description', type: 'string', nullable: true }
        ]
      },
      caching: {
        enabled: true,
        ttl: 300000, // 5 minutes
        strategy: 'read-through'
      },
      accessControl: {
        roles: ['admin', 'finance-manager', 'accountant'],
        permissions: ['read']
      },
      status: 'active',
      usage: {
        queryCount: 1250,
        averageResponseTime: 45,
        lastQueried: '2026-04-22T14:30:00Z'
      },
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-04-22T14:30:00Z'
    }
  ];

  const loadDataSources = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setDataSources(mockDataSources);
    } catch (error) {
      console.error('Failed to load data sources:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVirtualViews = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      setVirtualViews(mockVirtualViews);
    } catch (error) {
      console.error('Failed to load virtual views:', error);
    }
  }, []);

  const executeVirtualQuery = useCallback(async (
    viewId: string,
    parameters: Record<string, any> = {}
  ): Promise<any> => {
    const view = virtualViews.find(v => v.id === viewId);
    if (!view) {
      throw new Error(`Virtual view ${viewId} not found`);
    }

    const startTime = Date.now();
    const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Check cache first
      let cacheHit = false;
      let result: any;

      if (view.caching.enabled) {
        // In real implementation, check cache
        cacheHit = false;
      }

      if (!cacheHit) {
        // Execute query across data sources
        result = await executeQueryAcrossSources(view.query, parameters);
      }

      const executionTime = Date.now() - startTime;

      const query: DataQuery = {
        id: queryId,
        virtualViewId: viewId,
        parameters,
        result,
        executionTime,
        status: 'completed',
        cacheHit,
        timestamp: new Date().toISOString()
      };

      setQueries(prev => [query, ...prev.slice(0, 99)]); // Keep last 100 queries

      return result;
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      const query: DataQuery = {
        id: queryId,
        virtualViewId: viewId,
        parameters,
        executionTime,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        cacheHit: false,
        timestamp: new Date().toISOString()
      };

      setQueries(prev => [query, ...prev.slice(0, 99)]);
      throw error;
    }
  }, [virtualViews]);

  const executeQueryAcrossSources = async (
    query: VirtualQuery,
    parameters: Record<string, any>
  ): Promise<any> => {
    // In real implementation, this would federate queries across multiple data sources
    // For now, simulate with mock data

    if (query.type === 'sql') {
      // Simulate SQL execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

      return {
        columns: ['id', 'account_id', 'amount', 'currency', 'date', 'description'],
        rows: [
          ['txn_001', 'acc_001', 1500.00, 'USD', '2026-04-20', 'Invoice payment'],
          ['txn_002', 'acc_002', -250.00, 'USD', '2026-04-21', 'Office supplies'],
          ['txn_003', 'acc_001', 3200.00, 'USD', '2026-04-22', 'Service revenue']
        ],
        totalCount: 3,
        executionTime: Math.random() * 50 + 25
      };
    }

    return { data: [], executionTime: 0 };
  };

  const createVirtualView = useCallback(async (view: Omit<VirtualView, 'id' | 'createdAt' | 'updatedAt' | 'usage'>) => {
    const newView: VirtualView = {
      ...view,
      id: `view_${Date.now()}`,
      usage: {
        queryCount: 0,
        averageResponseTime: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setVirtualViews(prev => [...prev, newView]);
    return newView.id;
  }, []);

  const updateDataSource = useCallback(async (sourceId: string, updates: Partial<DataSource>) => {
    setDataSources(prev =>
      prev.map(source =>
        source.id === sourceId
          ? { ...source, ...updates, updatedAt: new Date().toISOString() }
          : source
      )
    );
  }, []);

  useEffect(() => {
    loadDataSources();
    loadVirtualViews();
  }, [loadDataSources, loadVirtualViews]);

  return {
    dataSources,
    virtualViews,
    semanticMappings,
    queries,
    loading,
    executeVirtualQuery,
    createVirtualView,
    updateDataSource,
    loadDataSources,
    loadVirtualViews,
  };
}

// Data Virtualization Dashboard Component
interface DataVirtualizationDashboardProps {
  className?: string;
}

export const DataVirtualizationDashboard: React.FC<DataVirtualizationDashboardProps> = ({
  className
}) => {
  const {
    dataSources,
    virtualViews,
    queries,
    loading,
    executeVirtualQuery
  } = useDataVirtualization();

  const [activeTab, setActiveTab] = useState<'sources' | 'views' | 'queries'>('sources');
  const [selectedView, setSelectedView] = useState<VirtualView | null>(null);
  const [queryParameters, setQueryParameters] = useState<Record<string, any>>({});
  const [queryResult, setQueryResult] = useState<any>(null);
  const [executing, setExecuting] = useState(false);

  const handleExecuteQuery = async () => {
    if (!selectedView) return;

    setExecuting(true);
    try {
      const result = await executeVirtualQuery(selectedView.id, queryParameters);
      setQueryResult(result);
    } catch (error) {
      console.error('Query execution failed:', error);
      setQueryResult({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setExecuting(false);
    }
  };

  const getDataSourceIcon = (type: DataSourceType) => {
    const icons: Record<DataSourceType, string> = {
      database: '🗄️',
      api: '🔗',
      file: '📄',
      stream: '🌊',
      cache: '💾',
      blockchain: '⛓️',
      iot: '📡'
    };
    return icons[type];
  };

  const formatQueryTime = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold">Loading Data Virtualization</h3>
          <p className="text-sm text-muted-foreground mt-2">Connecting to data sources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Data Virtualization</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Unified data access across heterogeneous sources with semantic mapping
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {dataSources.length} sources, {virtualViews.length} views
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {[
            { id: 'sources', name: 'Data Sources', icon: '🗄️' },
            { id: 'views', name: 'Virtual Views', icon: '👁️' },
            { id: 'queries', name: 'Query History', icon: '🔍' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'sources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataSources.map(source => (
              <div
                key={source.id}
                className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{getDataSourceIcon(source.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{source.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-muted-foreground capitalize">{source.type}</span>
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        source.status === 'active' ? 'bg-green-100 text-green-800' :
                        source.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      )}>
                        {source.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span className="uppercase">{source.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Records:</span>
                    <span>{source.metadata.recordCount?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>{source.metadata.lastUpdated ? new Date(source.metadata.lastUpdated).toLocaleDateString() : 'Never'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-4">
                  {source.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted rounded text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'views' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {virtualViews.map(view => (
                <div
                  key={view.id}
                  className={cn(
                    'bg-white p-6 rounded-lg border cursor-pointer hover:shadow-md transition-all',
                    selectedView?.id === view.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  )}
                  onClick={() => setSelectedView(view)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">👁️</span>
                    </div>
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      view.status === 'active' ? 'bg-green-100 text-green-800' :
                      view.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    )}>
                      {view.status}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{view.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {view.description}
                  </p>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">Queries:</span>
                      <span className="font-medium">{view.usage.queryCount}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {formatQueryTime(view.usage.averageResponseTime)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {view.query.dataSources.length} sources
                    </div>
                    <div className="flex items-center space-x-1">
                      {view.caching.enabled && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Cached
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Query Panel */}
            {selectedView && (
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Execute Query: {selectedView.name}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Parameters</h4>
                    <div className="space-y-3">
                      {selectedView.query.parameters.map(param => (
                        <div key={param.name}>
                          <label className="block text-sm font-medium mb-1">
                            {param.name} {param.required && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type={param.type === 'date' ? 'date' : 'text'}
                            value={queryParameters[param.name] || param.default || ''}
                            onChange={(e) => setQueryParameters(prev => ({
                              ...prev,
                              [param.name]: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-border rounded-md"
                            placeholder={`Enter ${param.name}`}
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleExecuteQuery}
                      disabled={executing}
                      className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                    >
                      {executing ? 'Executing...' : 'Execute Query'}
                    </button>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Results</h4>
                    <div className="bg-gray-50 p-4 rounded max-h-60 overflow-y-auto">
                      {queryResult ? (
                        <pre className="text-sm whitespace-pre-wrap">
                          {JSON.stringify(queryResult, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-muted-foreground text-sm">Execute a query to see results</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'queries' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Queries</h3>
              <div className="text-sm text-muted-foreground">
                {queries.length} queries executed
              </div>
            </div>

            <div className="space-y-2">
              {queries.map(query => (
                <div key={query.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={cn(
                        'w-2 h-2 rounded-full',
                        query.status === 'completed' ? 'bg-green-500' :
                        query.status === 'running' ? 'bg-yellow-500' :
                        'bg-red-500'
                      )} />
                      <span className="font-medium font-mono text-sm">{query.id}</span>
                      <span className="text-sm text-muted-foreground">
                        {virtualViews.find(v => v.id === query.virtualViewId)?.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {formatQueryTime(query.executionTime)}
                      </span>
                      {query.cacheHit && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Cache Hit
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground mb-2">
                    {new Date(query.timestamp).toLocaleString()}
                  </div>

                  {query.parameters && Object.keys(query.parameters).length > 0 && (
                    <div className="text-sm mb-2">
                      <span className="font-medium">Parameters:</span>{' '}
                      {JSON.stringify(query.parameters)}
                    </div>
                  )}

                  {query.error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      Error: {query.error}
                    </div>
                  )}
                </div>
              ))}

              {queries.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold">No Queries Yet</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Execute some virtual view queries to see history here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};