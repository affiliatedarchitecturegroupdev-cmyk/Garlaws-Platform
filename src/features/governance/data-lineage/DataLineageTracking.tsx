'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

// Data Governance Types
export type DataSensitivityLevel =
  | 'public'
  | 'internal'
  | 'confidential'
  | 'restricted'
  | 'highly-sensitive';

export type PrivacyRegulation =
  | 'gdpr'
  | 'ccpa'
  | 'popia'
  | 'pipL'
  | 'lgpd'
  | 'pdpa'
  | 'cdp'
  | 'other';

export type DataOperation =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'transform'
  | 'aggregate'
  | 'export'
  | 'share'
  | 'archive'
  | 'anonymize';

export interface DataLineageNode {
  id: string;
  name: string;
  type: 'source' | 'transformation' | 'destination' | 'storage';
  system: string;
  schema: string;
  table: string;
  column?: string;
  dataType?: string;
  sensitivityLevel: DataSensitivityLevel;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DataLineageEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  operation: DataOperation;
  transformation?: {
    type: string;
    parameters: Record<string, any>;
    sql?: string;
  };
  dataFlow: {
    volume: number;
    frequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
    lastExecution?: string;
  };
  compliance: {
    regulations: PrivacyRegulation[];
    retentionPeriod: number;
    consentRequired: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DataClassificationRule {
  id: string;
  name: string;
  description: string;
  pattern: {
    type: 'regex' | 'keyword' | 'semantic' | 'ml';
    value: string | string[];
    confidence: number;
  };
  classification: {
    sensitivityLevel: DataSensitivityLevel;
    categories: string[];
    regulations: PrivacyRegulation[];
  };
  scope: {
    systems: string[];
    schemas: string[];
    tables: string[];
  };
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface PrivacyConsent {
  id: string;
  userId: string;
  dataSubjectId: string;
  regulation: PrivacyRegulation;
  purpose: string;
  dataCategories: string[];
  processingActivities: DataOperation[];
  consentGiven: boolean;
  consentDate: string;
  expiryDate?: string;
  withdrawalDate?: string;
  consentMechanism: 'web-form' | 'mobile-app' | 'api' | 'third-party';
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, any>;
}

export interface ComplianceViolation {
  id: string;
  regulation: PrivacyRegulation;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'unauthorized-access' | 'data-breach' | 'consent-violation' | 'retention-violation' | 'processing-violation';
  description: string;
  affectedData: {
    systems: string[];
    records: number;
    dataSubjects: number;
  };
  detectedAt: string;
  resolvedAt?: string;
  resolution: string;
  responsibleParty: string;
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
}

export interface PrivacyImpactAssessment {
  id: string;
  name: string;
  description: string;
  system: string;
  dataCategories: string[];
  processingActivities: DataOperation[];
  riskLevel: 'low' | 'medium' | 'high';
  impactAssessment: {
    dataSubjects: number;
    dataVolume: number;
    sensitivityLevel: DataSensitivityLevel;
    crossBorderTransfer: boolean;
    thirdPartySharing: boolean;
  };
  mitigationMeasures: string[];
  recommendations: string[];
  status: 'draft' | 'review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Data Lineage Tracking Hook
export function useDataLineageTracking() {
  const [lineageNodes, setLineageNodes] = useState<DataLineageNode[]>([]);
  const [lineageEdges, setLineageEdges] = useState<DataLineageEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<DataLineageNode | null>(null);
  const [lineageGraph, setLineageGraph] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  const mockNodes: DataLineageNode[] = [
    {
      id: 'user_source',
      name: 'User Registration Database',
      type: 'source',
      system: 'PostgreSQL',
      schema: 'public',
      table: 'users',
      sensitivityLevel: 'confidential',
      tags: ['pii', 'gdpr', 'user-data'],
      metadata: { recordCount: 1000000, lastUpdated: '2026-04-22T10:00:00Z' },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-04-22T10:00:00Z'
    },
    {
      id: 'consent_transform',
      name: 'Consent Processing',
      type: 'transformation',
      system: 'Apache Spark',
      schema: 'processing',
      table: 'consent_data',
      sensitivityLevel: 'restricted',
      tags: ['consent', 'gdpr', 'processing'],
      metadata: { transformation: 'anonymization', compliance: 'gdpr' },
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-04-22T10:00:00Z'
    },
    {
      id: 'analytics_destination',
      name: 'Analytics Data Warehouse',
      type: 'destination',
      system: 'Snowflake',
      schema: 'analytics',
      table: 'user_analytics',
      sensitivityLevel: 'internal',
      tags: ['analytics', 'aggregated', 'anonymized'],
      metadata: { retention: '7-years', access: 'internal-only' },
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-04-22T10:00:00Z'
    }
  ];

  const mockEdges: DataLineageEdge[] = [
    {
      id: 'edge_1',
      sourceNodeId: 'user_source',
      targetNodeId: 'consent_transform',
      operation: 'read',
      dataFlow: {
        volume: 1000000,
        frequency: 'daily',
        lastExecution: '2026-04-22T06:00:00Z'
      },
      compliance: {
        regulations: ['gdpr'],
        retentionPeriod: 2555, // 7 years in days
        consentRequired: true
      },
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-04-22T10:00:00Z'
    },
    {
      id: 'edge_2',
      sourceNodeId: 'consent_transform',
      targetNodeId: 'analytics_destination',
      operation: 'transform',
      transformation: {
        type: 'anonymization',
        parameters: { method: 'k-anonymity', k: 5 },
        sql: 'SELECT anonymize(user_id) as user_id, COUNT(*) as event_count FROM consent_data GROUP BY anonymize(user_id)'
      },
      dataFlow: {
        volume: 500000,
        frequency: 'hourly',
        lastExecution: '2026-04-22T10:00:00Z'
      },
      compliance: {
        regulations: ['gdpr'],
        retentionPeriod: 2555,
        consentRequired: false
      },
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-04-22T10:00:00Z'
    }
  ];

  const loadLineageData = useCallback(async () => {
    setLoading(true);
    try {
      // In real implementation, fetch from graph database
      await new Promise(resolve => setTimeout(resolve, 500));
      setLineageNodes(mockNodes);
      setLineageEdges(mockEdges);

      // Build lineage graph
      const graph = buildLineageGraph(mockNodes, mockEdges);
      setLineageGraph(graph);
    } catch (error) {
      console.error('Failed to load lineage data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const buildLineageGraph = (nodes: DataLineageNode[], edges: DataLineageEdge[]) => {
    // Create adjacency list representation
    const graph: Record<string, any> = {};

    nodes.forEach(node => {
      graph[node.id] = {
        ...node,
        upstream: [],
        downstream: []
      };
    });

    edges.forEach(edge => {
      if (graph[edge.sourceNodeId]) {
        graph[edge.sourceNodeId].downstream.push({
          ...edge,
          targetNode: graph[edge.targetNodeId]
        });
      }
      if (graph[edge.targetNodeId]) {
        graph[edge.targetNodeId].upstream.push({
          ...edge,
          sourceNode: graph[edge.sourceNodeId]
        });
      }
    });

    return graph;
  };

  const getNodeLineage = useCallback((nodeId: string, direction: 'upstream' | 'downstream' | 'both' = 'both') => {
    if (!lineageGraph || !lineageGraph[nodeId]) return null;

    const result: { upstream: any[]; downstream: any[] } = { upstream: [], downstream: [] };
    const visited = new Set<string>();

    const traverse = (currentId: string, dir: 'upstream' | 'downstream') => {
      if (visited.has(currentId)) return;
      visited.add(currentId);

      const connections = lineageGraph[currentId][dir] || [];
      connections.forEach((connection: any) => {
        const nextNodeId = dir === 'upstream' ? connection.sourceNodeId : connection.targetNodeId;
        const nextNode = lineageGraph[nextNodeId];

        if (nextNode) {
          result[dir].push({
            node: nextNode,
            edge: connection
          });
          traverse(nextNodeId, dir);
        }
      });
    };

    if (direction === 'upstream' || direction === 'both') {
      traverse(nodeId, 'upstream');
    }
    if (direction === 'downstream' || direction === 'both') {
      traverse(nodeId, 'downstream');
    }

    return result;
  }, [lineageGraph]);

  const traceDataOrigin = useCallback((targetNodeId: string, dataField?: string) => {
    const lineage = getNodeLineage(targetNodeId, 'upstream');
    if (!lineage) return null;

    // Trace complete data lineage path
    const trace: any[] = [];
    const visited = new Set<string>();

    const tracePath = (nodeId: string, path: any[] = []) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = lineageGraph[nodeId];
      const currentPath = [...path, node];

      // If this is a source node, we've reached the origin
      if (node.type === 'source') {
        trace.push({
          path: currentPath,
          origin: node,
          field: dataField
        });
        return;
      }

      // Continue tracing upstream
      const upstreamConnections = node.upstream || [];
      upstreamConnections.forEach((connection: any) => {
        tracePath(connection.sourceNodeId, currentPath);
      });
    };

    tracePath(targetNodeId);
    return trace;
  }, [lineageGraph, getNodeLineage]);

  useEffect(() => {
    loadLineageData();
  }, [loadLineageData]);

  return {
    lineageNodes,
    lineageEdges,
    selectedNode,
    setSelectedNode,
    lineageGraph,
    loading,
    getNodeLineage,
    traceDataOrigin,
    loadLineageData,
  };
}

// Data Lineage Visualization Component
interface DataLineageVisualizationProps {
  className?: string;
  selectedNodeId?: string;
  onNodeSelect?: (node: DataLineageNode) => void;
}

export const DataLineageVisualization: React.FC<DataLineageVisualizationProps> = ({
  className,
  selectedNodeId,
  onNodeSelect,
}) => {
  const { lineageNodes, lineageEdges, selectedNode, setSelectedNode, getNodeLineage } = useDataLineageTracking();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'full' | 'upstream' | 'downstream'>('full');

  const getNodeColor = (type: DataLineageNode['type']) => {
    const colors = {
      source: 'bg-blue-500',
      transformation: 'bg-green-500',
      destination: 'bg-purple-500',
      storage: 'bg-orange-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getSensitivityColor = (level: DataSensitivityLevel) => {
    const colors = {
      public: 'border-green-300',
      internal: 'border-blue-300',
      confidential: 'border-yellow-300',
      restricted: 'border-orange-300',
      'highly-sensitive': 'border-red-300'
    };
    return colors[level] || 'border-gray-300';
  };

  const visibleNodes = lineageNodes.filter(node => {
    if (!selectedNodeId) return true;

    const lineage = getNodeLineage(selectedNodeId, viewMode === 'full' ? 'both' :
      viewMode === 'upstream' ? 'upstream' : 'downstream');

    if (!lineage) return false;

    const relatedNodeIds = new Set([
      selectedNodeId,
      ...lineage.upstream.map((item: any) => item.node.id),
      ...lineage.downstream.map((item: any) => item.node.id)
    ]);

    return relatedNodeIds.has(node.id);
  });

  const visibleEdges = lineageEdges.filter(edge =>
    visibleNodes.some(node => node.id === edge.sourceNodeId) &&
    visibleNodes.some(node => node.id === edge.targetNodeId)
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">View Mode:</span>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="px-3 py-1 border border-border rounded text-sm"
          >
            <option value="full">Full Graph</option>
            <option value="upstream">Upstream Only</option>
            <option value="downstream">Downstream Only</option>
          </select>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Source</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Transform</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Destination</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg min-h-[600px] overflow-auto"
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Edges */}
          {visibleEdges.map(edge => {
            const sourceNode = visibleNodes.find(n => n.id === edge.sourceNodeId);
            const targetNode = visibleNodes.find(n => n.id === edge.targetNodeId);

            if (!sourceNode || !targetNode) return null;

            // Simple line drawing (in real implementation, use proper graph layout)
            const x1 = 200 + (visibleNodes.indexOf(sourceNode) % 3) * 300;
            const y1 = 150 + Math.floor(visibleNodes.indexOf(sourceNode) / 3) * 200;
            const x2 = 200 + (visibleNodes.indexOf(targetNode) % 3) * 300;
            const y2 = 150 + Math.floor(visibleNodes.indexOf(targetNode) / 3) * 200;

            return (
              <g key={edge.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#6b7280"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {edge.operation}
                </text>
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                  </marker>
                </defs>
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {visibleNodes.map((node, index) => {
          const x = 150 + (index % 3) * 300;
          const y = 100 + Math.floor(index / 3) * 200;

          return (
            <div
              key={node.id}
              className={cn(
                'absolute w-48 p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105',
                getNodeColor(node.type),
                getSensitivityColor(node.sensitivityLevel),
                selectedNode?.id === node.id ? 'ring-4 ring-blue-300' : ''
              )}
              style={{ left: x, top: y }}
              onClick={() => {
                setSelectedNode(node);
                onNodeSelect?.(node);
              }}
            >
              <div className="text-white">
                <div className="font-semibold text-sm truncate">{node.name}</div>
                <div className="text-xs opacity-90">{node.system}.{node.schema}.{node.table}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs bg-white/20 px-2 py-1 rounded capitalize">
                    {node.type}
                  </span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded capitalize">
                    {node.sensitivityLevel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">{selectedNode.name}</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Type</div>
              <div className="font-medium capitalize">{selectedNode.type}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">System</div>
              <div className="font-medium">{selectedNode.system}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Sensitivity</div>
              <div className="font-medium capitalize">{selectedNode.sensitivityLevel}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tags</div>
              <div className="font-medium">{selectedNode.tags.length}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {selectedNode.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2">Metadata</h4>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
              {JSON.stringify(selectedNode.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};