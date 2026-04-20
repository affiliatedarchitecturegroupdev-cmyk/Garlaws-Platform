'use client';

import { useState, useEffect, useCallback } from 'react';

interface Resource {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
  capacity: number; // hours per week
  allocatedHours: number;
  availability: 'available' | 'partially-available' | 'fully-allocated' | 'unavailable';
  currentProjects: string[];
  skills: string[];
}

interface Task {
  id: string;
  title: string;
  assignee?: string;
  estimatedHours: number;
  status: 'todo' | 'in-progress' | 'done';
}

interface ResourceAllocationProps {
  tenantId?: string;
}

export default function ResourceAllocation({ tenantId = 'default' }: ResourceAllocationProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedResource, setSelectedResource] = useState<string>('');

  const fetchResources = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects?action=resources&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setResources(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    }
  }, [tenantId]);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects?action=unassigned-tasks&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchResources();
    fetchTasks();
  }, [fetchResources, fetchTasks]);

  const assignResource = async () => {
    if (!selectedTask || !selectedResource) return;

    try {
      const response = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign-resource',
          tenantId,
          taskId: selectedTask.id,
          resourceId: selectedResource
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchResources();
        fetchTasks();
        setShowAssignForm(false);
        setSelectedTask(null);
        setSelectedResource('');
      }
    } catch (error) {
      console.error('Failed to assign resource:', error);
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'partially-available': return 'bg-yellow-100 text-yellow-800';
      case 'fully-allocated': return 'bg-red-100 text-red-800';
      case 'unavailable': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUtilizationPercentage = (allocated: number, capacity: number) => {
    return Math.round((allocated / capacity) * 100);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Resource Allocation</h2>
        <button
          onClick={() => setShowAssignForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Assign Resource
        </button>
      </div>

      {/* Assign Resource Form */}
      {showAssignForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Assign Resource to Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Task</label>
              <select
                value={selectedTask?.id || ''}
                onChange={(e) => {
                  const task = tasks.find(t => t.id === e.target.value);
                  setSelectedTask(task || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a task...</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title} ({task.estimatedHours}h)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Resource</label>
              <select
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a resource...</option>
                {resources
                  .filter(r => r.availability !== 'unavailable' && r.availability !== 'fully-allocated')
                  .map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} ({resource.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={assignResource}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Assign Resource
            </button>
            <button
              onClick={() => {
                setShowAssignForm(false);
                setSelectedTask(null);
                setSelectedResource('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => {
          const utilization = getUtilizationPercentage(resource.allocatedHours, resource.capacity);
          return (
            <div
              key={resource.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {resource.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{resource.name}</h3>
                  <p className="text-sm text-gray-600">{resource.role}</p>
                  <p className="text-xs text-gray-500">{resource.email}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${getAvailabilityColor(resource.availability)}`}>
                  {resource.availability.replace('-', ' ').toUpperCase()}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium">{resource.capacity}h/week</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Allocated:</span>
                  <span className="font-medium">{resource.allocatedHours}h/week</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Utilization:</span>
                  <span className={`font-medium ${getUtilizationColor(utilization)}`}>
                    {utilization}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${utilization < 50 ? 'bg-green-500' : utilization < 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${utilization}%` }}
                  ></div>
                </div>

                {resource.currentProjects.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Projects:</h4>
                    <div className="flex flex-wrap gap-1">
                      {resource.currentProjects.map((project, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {project}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {resource.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {resource.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {resources.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No resources available</p>
          <p className="text-sm">Add team members to start resource allocation</p>
        </div>
      )}

      {/* Unassigned Tasks Summary */}
      {tasks.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Unassigned Tasks ({tasks.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.slice(0, 6).map((task) => (
              <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{task.estimatedHours}h estimated</p>
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                  task.status === 'todo' ? 'bg-gray-100 text-gray-800' :
                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.status.replace('-', ' ').toUpperCase()}
                </div>
              </div>
            ))}
          </div>
          {tasks.length > 6 && (
            <p className="text-sm text-gray-600 mt-4">
              And {tasks.length - 6} more unassigned tasks...
            </p>
          )}
        </div>
      )}
    </div>
  );
}