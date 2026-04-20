'use client';

import { useState, useEffect, useCallback } from 'react';

interface GanttTask {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  progress: number; // 0-100
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
}

interface GanttChartProps {
  tenantId?: string;
}

export default function GanttChart({ tenantId = 'default' }: GanttChartProps) {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskStartDate, setNewTaskStartDate] = useState('');
  const [newTaskEndDate, setNewTaskEndDate] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [currentDate] = useState(new Date());

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects?action=gantt-tasks&tenantId=${tenantId}`);
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
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async () => {
    if (!newTaskTitle.trim() || !newTaskStartDate || !newTaskEndDate) return;

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-gantt-task',
          tenantId,
          title: newTaskTitle,
          description: newTaskDescription,
          startDate: newTaskStartDate,
          endDate: newTaskEndDate,
          assignee: newTaskAssignee || undefined,
          priority: newTaskPriority,
          progress: 0
        })
      });

      const data = await response.json();
      if (data.success) {
        setTasks([...tasks, data.data]);
        setShowCreateForm(false);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskStartDate('');
        setNewTaskEndDate('');
        setNewTaskAssignee('');
        setNewTaskPriority('medium');
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const updateTaskProgress = async (taskId: string, progress: number) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-task-progress',
          tenantId,
          taskId,
          progress
        })
      });

      const data = await response.json();
      if (data.success) {
        setTasks(tasks.map(t => t.id === taskId ? data.data : t));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const getTaskDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
  };

  const getTaskPosition = (start: string) => {
    const startDate = new Date(start);
    const diffTime = startDate.getTime() - currentDate.getTime();
    const daysFromNow = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, daysFromNow * 40); // 40px per day
  };

  const getTaskWidth = (start: string, end: string) => {
    return getTaskDuration(start, end) * 40; // 40px per day
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const generateDateHeaders = () => {
    const headers = [];
    for (let i = -7; i <= 30; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      headers.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    return headers;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Project Gantt Chart</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Task
        </button>
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter task title"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Enter task description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={newTaskStartDate}
                onChange={(e) => setNewTaskStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={newTaskEndDate}
                onChange={(e) => setNewTaskEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <input
                type="text"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Assign to team member"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={createTask}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Create Task
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Gantt Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header with dates */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <div className="w-64 px-4 py-3 font-medium text-gray-900 border-r border-gray-200">
              Task
            </div>
            <div className="flex-1 overflow-x-auto">
              <div className="flex min-w-max">
                {generateDateHeaders().map((header, index) => (
                  <div key={index} className="w-10 px-1 py-3 text-center text-xs text-gray-600 border-r border-gray-100">
                    {header.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="max-h-96 overflow-y-auto">
          {tasks.map((task, index) => (
            <div key={task.id} className="border-b border-gray-100">
              <div className="flex">
                <div className="w-64 px-4 py-3 border-r border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      {task.assignee && <p className="text-sm text-gray-600">👤 {task.assignee}</p>}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority) === 'bg-red-500' ? 'bg-red-100 text-red-800' : getPriorityColor(task.priority) === 'bg-yellow-500' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {task.priority.toUpperCase()}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress: {task.progress}%</span>
                      <span>{new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative overflow-x-auto">
                  <div className="flex min-w-max h-full">
                    <div className="relative w-full h-16">
                      <div
                        className={`absolute top-2 h-8 rounded ${getPriorityColor(task.priority)} border-2 border-white shadow-sm cursor-pointer hover:opacity-80`}
                        style={{
                          left: `${getTaskPosition(task.startDate)}px`,
                          width: `${getTaskWidth(task.startDate, task.endDate)}px`
                        }}
                        title={`${task.title} (${task.progress}% complete)`}
                      >
                        <div className="px-2 py-1 text-xs text-white font-medium truncate">
                          {task.title}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No tasks in the Gantt chart</p>
              <p className="text-sm">Add tasks with start and end dates to visualize the timeline</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}