'use client';

import { useState, useEffect, useCallback } from 'react';

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'blocker';
  severity: 'minor' | 'major' | 'critical' | 'blocker';
  type: 'bug' | 'feature' | 'improvement' | 'task' | 'epic';
  assignee?: string;
  reporter: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  comments: IssueComment[];
  attachments: IssueAttachment[];
  linkedIssues: string[];
  testCases?: TestCase[];
}

interface IssueComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  attachments?: string[];
}

interface IssueAttachment {
  id: string;
  filename: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface TestCase {
  id: string;
  title: string;
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  status: 'pass' | 'fail' | 'pending' | 'blocked';
  lastRun?: string;
}

interface BugTrackingIntegrationProps {
  tenantId?: string;
}

export default function BugTrackingIntegration({ tenantId = 'default' }: BugTrackingIntegrationProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIssue, setNewIssue] = useState<Partial<Issue>>({
    title: '',
    description: '',
    type: 'bug',
    priority: 'medium',
    severity: 'major',
    labels: []
  });
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'open' | 'in_progress' | 'resolved' | 'closed',
    priority: 'all' as 'all' | 'low' | 'medium' | 'high' | 'critical' | 'blocker',
    type: 'all' as 'all' | 'bug' | 'feature' | 'improvement' | 'task' | 'epic',
    assignee: 'all' as string
  });

  const fetchIssues = useCallback(async () => {
    try {
      const response = await fetch(`/api/qa?action=issues&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setIssues(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const createIssue = async () => {
    if (!newIssue.title || !newIssue.description) return;

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-issue',
          tenantId,
          issue: newIssue
        })
      });

      const data = await response.json();
      if (data.success) {
        setIssues([...issues, data.data]);
        setShowCreateForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create issue:', error);
    }
  };

  const resetForm = () => {
    setNewIssue({
      title: '',
      description: '',
      type: 'bug',
      priority: 'medium',
      severity: 'major',
      labels: []
    });
  };

  const updateIssueStatus = async (issueId: string, newStatus: Issue['status']) => {
    try {
      const response = await fetch('/api/qa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-issue-status',
          tenantId,
          issueId,
          status: newStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        setIssues(issues.map(issue =>
          issue.id === issueId ? { ...issue, status: newStatus, updatedAt: new Date().toISOString() } : issue
        ));
      }
    } catch (error) {
      console.error('Failed to update issue status:', error);
    }
  };

  const addComment = async (issueId: string, content: string) => {
    if (!content.trim()) return;

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-issue-comment',
          tenantId,
          issueId,
          content
        })
      });

      const data = await response.json();
      if (data.success) {
        setIssues(issues.map(issue =>
          issue.id === issueId
            ? { ...issue, comments: [...issue.comments, data.comment], updatedAt: new Date().toISOString() }
            : issue
        ));
        if (selectedIssue?.id === issueId) {
          setSelectedIssue(prev => prev ? { ...prev, comments: [...prev.comments, data.comment] } : null);
        }
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const getFilteredIssues = () => {
    return issues.filter(issue => {
      const statusMatch = filters.status === 'all' || issue.status === filters.status;
      const priorityMatch = filters.priority === 'all' || issue.priority === filters.priority;
      const typeMatch = filters.type === 'all' || issue.type === filters.type;
      const assigneeMatch = filters.assignee === 'all' || issue.assignee === filters.assignee;
      return statusMatch && priorityMatch && typeMatch && assigneeMatch;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'reopened': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'blocker': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return '🐛';
      case 'feature': return '⭐';
      case 'improvement': return '⬆️';
      case 'task': return '📋';
      case 'epic': return '🎯';
      default: return '❓';
    }
  };

  const getUniqueAssignees = () => {
    const assignees = new Set<string>();
    issues.forEach(issue => {
      if (issue.assignee) assignees.add(issue.assignee);
    });
    return Array.from(assignees);
  };

  const calculateStats = () => {
    const total = issues.length;
    const open = issues.filter(i => i.status === 'open').length;
    const inProgress = issues.filter(i => i.status === 'in_progress').length;
    const resolved = issues.filter(i => i.status === 'resolved').length;
    const closed = issues.filter(i => i.status === 'closed').length;
    const critical = issues.filter(i => i.priority === 'critical' || i.priority === 'blocker').length;
    const overdue = issues.filter(i => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'closed').length;

    return { total, open, inProgress, resolved, closed, critical, overdue };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Bug Tracking & Issue Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Issue
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Issues</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
          <div className="text-sm text-gray-600">Open</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
          <div className="text-sm text-gray-600">Closed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-sm text-gray-600">Critical</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{stats.overdue}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="blocker">Blocker</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="improvement">Improvement</option>
              <option value="task">Task</option>
              <option value="epic">Epic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
            <select
              value={filters.assignee}
              onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Assignees</option>
              <option value="">Unassigned</option>
              {getUniqueAssignees().map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Create Issue Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New Issue</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newIssue.title || ''}
                onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Issue title"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newIssue.description || ''}
                onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Issue description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newIssue.type || 'bug'}
                onChange={(e) => setNewIssue(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="improvement">Improvement</option>
                <option value="task">Task</option>
                <option value="epic">Epic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={newIssue.priority || 'medium'}
                onChange={(e) => setNewIssue(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
                <option value="blocker">Blocker</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={newIssue.severity || 'major'}
                onChange={(e) => setNewIssue(prev => ({ ...prev, severity: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
                <option value="blocker">Blocker</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={newIssue.dueDate || ''}
                onChange={(e) => setNewIssue(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={createIssue}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Create Issue
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Issues List */}
      <div className="grid grid-cols-1 gap-4">
        {getFilteredIssues().map((issue) => (
          <div
            key={issue.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{getTypeIcon(issue.type)}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(issue.status)}`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{issue.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Reporter: {issue.reporter}</span>
                  {issue.assignee && <span>Assignee: {issue.assignee}</span>}
                  <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>
                  {issue.dueDate && (
                    <span className={new Date(issue.dueDate) < new Date() && issue.status !== 'closed' ? 'text-red-600' : ''}>
                      Due: {new Date(issue.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Labels */}
            {issue.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {issue.labels.map((label, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    {label}
                  </span>
                ))}
              </div>
            )}

            {/* Issue Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-600">Comments:</span>
                <span className="ml-1 font-medium">{issue.comments.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Attachments:</span>
                <span className="ml-1 font-medium">{issue.attachments.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Linked Issues:</span>
                <span className="ml-1 font-medium">{issue.linkedIssues.length}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <select
                value={issue.status}
                onChange={(e) => updateIssueStatus(issue.id, e.target.value as Issue['status'])}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="reopened">Reopened</option>
              </select>
              <button
                onClick={() => setSelectedIssue(issue)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        ))}

        {getFilteredIssues().length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-lg">No issues found</p>
            <p className="text-sm">Create issues to track bugs, features, and improvements.</p>
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getTypeIcon(selectedIssue.type)}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedIssue.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedIssue.status)}`}>
                      {selectedIssue.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedIssue.priority)}`}>
                      {selectedIssue.priority}
                    </span>
                    <span className="text-sm text-gray-600">#{selectedIssue.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Issue Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Reporter</h4>
                  <p className="text-sm text-gray-900">{selectedIssue.reporter}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Assignee</h4>
                  <p className="text-sm text-gray-900">{selectedIssue.assignee || 'Unassigned'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Created</h4>
                  <p className="text-sm text-gray-900">{new Date(selectedIssue.createdAt).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Updated</h4>
                  <p className="text-sm text-gray-900">{new Date(selectedIssue.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedIssue.description}</p>
              </div>

              {/* Labels */}
              {selectedIssue.labels.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Labels</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIssue.labels.map((label, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Comments ({selectedIssue.comments.length})</h4>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {selectedIssue.comments.map((comment) => (
                    <div key={comment.id} className="bg-white p-3 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="mt-4">
                  <textarea
                    id={`comment-${selectedIssue.id}`}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  <button
                    onClick={() => {
                      const textarea = document.getElementById(`comment-${selectedIssue.id}`) as HTMLTextAreaElement;
                      if (textarea.value.trim()) {
                        addComment(selectedIssue.id, textarea.value);
                        textarea.value = '';
                      }
                    }}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Comment
                  </button>
                </div>
              </div>

              {/* Test Cases */}
              {selectedIssue.testCases && selectedIssue.testCases.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Test Cases ({selectedIssue.testCases.length})</h4>
                  <div className="space-y-3">
                    {selectedIssue.testCases.map((testCase) => (
                      <div key={testCase.id} className="bg-white p-3 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{testCase.title}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            testCase.status === 'pass' ? 'bg-green-100 text-green-800' :
                            testCase.status === 'fail' ? 'bg-red-100 text-red-800' :
                            testCase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {testCase.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700">
                          <div className="mb-2">
                            <strong>Steps:</strong>
                            <ol className="list-decimal list-inside mt-1">
                              {testCase.steps.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ol>
                          </div>
                          <div className="mb-2">
                            <strong>Expected:</strong> {testCase.expectedResult}
                          </div>
                          {testCase.actualResult && (
                            <div>
                              <strong>Actual:</strong> {testCase.actualResult}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}