'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Workflow, WorkflowNode, WorkflowConnection, NodeConfig } from '../../lib/workflow/workflow-models';

interface WorkflowDesignerProps {
  workflow: Workflow;
  onWorkflowChange: (workflow: Workflow) => void;
  readOnly?: boolean;
}

interface DragState {
  isDragging: boolean;
  draggedNode?: WorkflowNode;
  dragOffset: { x: number; y: number };
}

interface ConnectionState {
  isConnecting: boolean;
  sourceNode?: WorkflowNode;
  sourcePort?: string;
  tempConnection?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export default function WorkflowDesigner({
  workflow,
  onWorkflowChange,
  readOnly = false
}: WorkflowDesignerProps) {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragOffset: { x: 0, y: 0 }
  });
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnecting: false
  });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleNodeSelect = useCallback((node: WorkflowNode) => {
    setSelectedNode(node);
  }, []);

  const handleNodeDragStart = useCallback((node: WorkflowNode, event: React.MouseEvent) => {
    if (readOnly) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const offsetX = event.clientX - rect.left - node.position.x;
    const offsetY = event.clientY - rect.top - node.position.y;

    setDragState({
      isDragging: true,
      draggedNode: node,
      dragOffset: { x: offsetX, y: offsetY }
    });
  }, [readOnly]);

  const handleNodeDrag = useCallback((event: MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedNode) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left - dragState.dragOffset.x) / zoom;
    const y = (event.clientY - rect.top - dragState.dragOffset.y) / zoom;

    const updatedNode = {
      ...dragState.draggedNode,
      position: { x: Math.max(0, x), y: Math.max(0, y) }
    };

    const updatedWorkflow = {
      ...workflow,
      nodes: workflow.nodes.map(node =>
        node.id === updatedNode.id ? updatedNode : node
      )
    };

    onWorkflowChange(updatedWorkflow);
  }, [dragState, zoom, workflow, onWorkflowChange]);

  const handleNodeDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      dragOffset: { x: 0, y: 0 }
    });
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (readOnly) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left - pan.x) / zoom;
    const y = (event.clientY - rect.top - pan.y) / zoom;

    // Add new node on double-click
    if (event.detail === 2) {
      const newNode: WorkflowNode = {
        id: `node_${Date.now()}`,
        type: 'action',
        name: 'New Action',
        position: { x, y },
        config: {},
        connections: { inputs: [], outputs: [] },
        status: 'idle'
      };

      const updatedWorkflow = {
        ...workflow,
        nodes: [...workflow.nodes, newNode]
      };

      onWorkflowChange(updatedWorkflow);
    } else {
      setSelectedNode(null);
    }
  }, [readOnly, pan, zoom, workflow, onWorkflowChange]);

  const handleConnectionStart = useCallback((node: WorkflowNode, port: string) => {
    if (readOnly) return;

    setConnectionState({
      isConnecting: true,
      sourceNode: node,
      sourcePort: port
    });
  }, [readOnly]);

  const handleConnectionMove = useCallback((event: MouseEvent) => {
    if (!connectionState.isConnecting) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setConnectionState(prev => ({
      ...prev,
      tempConnection: {
        x1: connectionState.sourceNode!.position.x + 100, // Approximate node center
        y1: connectionState.sourceNode!.position.y + 30,
        x2: x / zoom - pan.x,
        y2: y / zoom - pan.y
      }
    }));
  }, [connectionState, zoom, pan]);

  const handleConnectionEnd = useCallback((targetNode: WorkflowNode, targetPort: string) => {
    if (!connectionState.isConnecting || !connectionState.sourceNode) return;

    // Prevent self-connections
    if (connectionState.sourceNode.id === targetNode.id) {
      setConnectionState({ isConnecting: false });
      return;
    }

    // Create new connection
    const newConnection: WorkflowConnection = {
      id: `connection_${Date.now()}`,
      sourceNodeId: connectionState.sourceNode.id,
      targetNodeId: targetNode.id,
      sourcePort: connectionState.sourcePort,
      targetPort: targetPort
    };

    const updatedWorkflow = {
      ...workflow,
      connections: [...workflow.connections, newConnection],
      nodes: workflow.nodes.map(node => {
        if (node.id === connectionState.sourceNode!.id) {
          return {
            ...node,
            connections: {
              ...node.connections,
              outputs: [...node.connections.outputs, targetNode.id]
            }
          };
        }
        if (node.id === targetNode.id) {
          return {
            ...node,
            connections: {
              ...node.connections,
              inputs: [...node.connections.inputs, connectionState.sourceNode!.id]
            }
          };
        }
        return node;
      })
    };

    onWorkflowChange(updatedWorkflow);
    setConnectionState({ isConnecting: false });
  }, [connectionState, workflow, onWorkflowChange]);

  // Mouse event handlers
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (dragState.isDragging) {
        handleNodeDrag(event);
      }
      if (connectionState.isConnecting) {
        handleConnectionMove(event);
      }
    };

    const handleMouseUp = () => {
      if (dragState.isDragging) {
        handleNodeDragEnd();
      }
      if (connectionState.isConnecting) {
        setConnectionState({ isConnecting: false });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, connectionState, handleNodeDrag, handleNodeDragEnd, handleConnectionMove]);

  const renderConnections = () => {
    return (
      <svg
        ref={svgRef}
        className="absolute inset-0 pointer-events-none"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        {/* Existing connections */}
        {workflow.connections.map(connection => {
          const sourceNode = workflow.nodes.find(n => n.id === connection.sourceNodeId);
          const targetNode = workflow.nodes.find(n => n.id === connection.targetNodeId);

          if (!sourceNode || !targetNode) return null;

          const x1 = sourceNode.position.x + 100; // Approximate output position
          const y1 = sourceNode.position.y + 30;
          const x2 = targetNode.position.x + 100; // Approximate input position
          const y2 = targetNode.position.y - 10;

          return (
            <g key={connection.id}>
              <path
                d={`M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`}
                stroke="#6366f1"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        })}

        {/* Temporary connection during creation */}
        {connectionState.tempConnection && (
          <path
            d={`M ${connectionState.tempConnection.x1} ${connectionState.tempConnection.y1} L ${connectionState.tempConnection.x2} ${connectionState.tempConnection.y2}`}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
          />
        )}

        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6366f1"
            />
          </marker>
        </defs>
      </svg>
    );
  };

  const renderNode = (node: WorkflowNode) => {
    const isSelected = selectedNode?.id === node.id;
    const nodeColors = {
      trigger: 'bg-green-500',
      action: 'bg-blue-500',
      condition: 'bg-yellow-500',
      delay: 'bg-purple-500',
      webhook: 'bg-pink-500',
      email: 'bg-indigo-500',
      api_call: 'bg-red-500',
      database: 'bg-orange-500',
      approval: 'bg-teal-500',
      notification: 'bg-cyan-500'
    };

    return (
      <div
        key={node.id}
        className={`absolute cursor-pointer select-none transition-transform ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
        }`}
        style={{
          left: node.position.x,
          top: node.position.y,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
        onMouseDown={(e) => handleNodeDragStart(node, e)}
        onClick={() => handleNodeSelect(node)}
      >
        <div className={`w-48 p-3 rounded-lg shadow-lg border-2 ${
          isSelected ? 'border-blue-500' : 'border-gray-300'
        } bg-white hover:shadow-xl transition-shadow`}>
          {/* Node Header */}
          <div className={`flex items-center space-x-2 mb-2`}>
            <div className={`w-3 h-3 rounded-full ${nodeColors[node.type] || 'bg-gray-500'}`} />
            <span className="font-medium text-sm text-gray-900 truncate">{node.name}</span>
            <div className={`ml-auto w-2 h-2 rounded-full ${
              node.status === 'completed' ? 'bg-green-500' :
              node.status === 'running' ? 'bg-blue-500' :
              node.status === 'failed' ? 'bg-red-500' :
              node.status === 'waiting' ? 'bg-yellow-500' : 'bg-gray-400'
            }`} />
          </div>

          {/* Node Type */}
          <div className="text-xs text-gray-600 mb-2 capitalize">
            {node.type.replace('_', ' ')}
          </div>

          {/* Connection Ports */}
          <div className="flex justify-between items-center">
            {/* Input ports */}
            <div className="flex space-x-1">
              {node.connections.inputs.map((_, index) => (
                <div
                  key={`input-${index}`}
                  className="w-3 h-3 bg-gray-400 rounded-full border-2 border-white cursor-pointer hover:bg-gray-600"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleConnectionStart(node, `input-${index}`);
                  }}
                />
              ))}
            </div>

            {/* Output ports */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.max(1, node.connections.outputs.length) }, (_, index) => (
                <div
                  key={`output-${index}`}
                  className="w-3 h-3 bg-gray-400 rounded-full border-2 border-white cursor-pointer hover:bg-gray-600"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleConnectionStart(node, `output-${index}`);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-gray-50">
        {/* Controls */}
        <div className="absolute top-4 left-4 z-10 flex space-x-2">
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="px-3 py-1 bg-white border border-gray-300 rounded shadow hover:bg-gray-50"
          >
            +
          </button>
          <span className="px-3 py-1 bg-white border border-gray-300 rounded shadow">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
            className="px-3 py-1 bg-white border border-gray-300 rounded shadow hover:bg-gray-50"
          >
            -
          </button>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          style={{
            backgroundImage: `
              radial-gradient(circle, #e5e7eb 1px, transparent 1px),
              linear-gradient(to right, #f3f4f6 1px, transparent 1px),
              linear-gradient(to bottom, #f3f4f6 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px, ${100 * zoom}px ${100 * zoom}px, ${100 * zoom}px ${100 * zoom}px`
          }}
          onClick={handleCanvasClick}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${100 * zoom}px ${100 * zoom}px`
            }}
          />

          {/* Connections */}
          {renderConnections()}

          {/* Nodes */}
          {workflow.nodes.map(renderNode)}
        </div>
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <div className="w-80 bg-white border-l border-gray-300 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Node Properties</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={selectedNode.name}
                onChange={(e) => {
                  const updatedNode = { ...selectedNode, name: e.target.value };
                  const updatedWorkflow = {
                    ...workflow,
                    nodes: workflow.nodes.map(node =>
                      node.id === selectedNode.id ? updatedNode : node
                    )
                  };
                  onWorkflowChange(updatedWorkflow);
                  setSelectedNode(updatedNode);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={selectedNode.type}
                onChange={(e) => {
                  const updatedNode = { ...selectedNode, type: e.target.value as WorkflowNode['type'] };
                  const updatedWorkflow = {
                    ...workflow,
                    nodes: workflow.nodes.map(node =>
                      node.id === selectedNode.id ? updatedNode : node
                    )
                  };
                  onWorkflowChange(updatedWorkflow);
                  setSelectedNode(updatedNode);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="trigger">Trigger</option>
                <option value="action">Action</option>
                <option value="condition">Condition</option>
                <option value="delay">Delay</option>
                <option value="webhook">Webhook</option>
                <option value="email">Email</option>
                <option value="api_call">API Call</option>
                <option value="database">Database</option>
                <option value="approval">Approval</option>
                <option value="notification">Notification</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={selectedNode.description || ''}
                onChange={(e) => {
                  const updatedNode = { ...selectedNode, description: e.target.value };
                  const updatedWorkflow = {
                    ...workflow,
                    nodes: workflow.nodes.map(node =>
                      node.id === selectedNode.id ? updatedNode : node
                    )
                  };
                  onWorkflowChange(updatedWorkflow);
                  setSelectedNode(updatedNode);
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what this node does..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}