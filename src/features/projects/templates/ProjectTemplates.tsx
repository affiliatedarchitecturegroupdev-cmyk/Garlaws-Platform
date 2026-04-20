'use client';

import { useState, useEffect, useCallback } from 'react';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration: number; // weeks
  teamSize: number;
  complexity: 'low' | 'medium' | 'high';
  tasks: TemplateTask[];
  milestones: string[];
  requiredSkills: string[];
}

interface TemplateTask {
  title: string;
  description: string;
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high';
  dependencies?: string[];
}

interface ProjectTemplatesProps {
  tenantId?: string;
}

export default function ProjectTemplates({ tenantId = 'default' }: ProjectTemplatesProps) {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [startDate, setStartDate] = useState('');

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects?action=templates&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createProjectFromTemplate = async () => {
    if (!selectedTemplate || !projectName.trim() || !startDate) return;

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-project-from-template',
          tenantId,
          templateId: selectedTemplate.id,
          name: projectName,
          description: projectDescription,
          startDate
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateProject(false);
        setSelectedTemplate(null);
        setProjectName('');
        setProjectDescription('');
        setStartDate('');
        alert('Project created successfully!');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Project Templates</h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{template.category}</p>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(template.complexity)}`}>
                {template.complexity.toUpperCase()}
              </div>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-3">{template.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium ml-1">{template.estimatedDuration} weeks</span>
              </div>
              <div>
                <span className="text-gray-600">Team Size:</span>
                <span className="font-medium ml-1">{template.teamSize} people</span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Key Milestones:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {template.milestones.slice(0, 3).map((milestone, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {milestone}
                  </li>
                ))}
                {template.milestones.length > 3 && (
                  <li className="text-gray-400">+{template.milestones.length - 3} more...</li>
                )}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Required Skills:</h4>
              <div className="flex flex-wrap gap-1">
                {template.requiredSkills.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
                {template.requiredSkills.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{template.requiredSkills.length - 4}
                  </span>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowCreateProject(true);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Use Template
              </button>
              <button
                onClick={() => setSelectedTemplate(template)}
                className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors"
              >
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No templates found</p>
          <p className="text-sm">Try selecting a different category</p>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateProject && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Create Project from &ldquo;{selectedTemplate.name}&rdquo;
              </h3>
              <button
                onClick={() => {
                  setShowCreateProject(false);
                  setSelectedTemplate(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe the project goals and objectives"
                />
              </div>

              {/* Template Preview */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-4">Template Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedTemplate.tasks.length}</div>
                    <div className="text-sm text-gray-600">Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedTemplate.estimatedDuration}</div>
                    <div className="text-sm text-gray-600">Weeks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedTemplate.teamSize}</div>
                    <div className="text-sm text-gray-600">Team Size</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getComplexityColor(selectedTemplate.complexity).includes('green') ? 'text-green-600' : getComplexityColor(selectedTemplate.complexity).includes('yellow') ? 'text-yellow-600' : 'text-red-600'}`}>
                      {selectedTemplate.complexity.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600">Complexity</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Milestones:</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {selectedTemplate.milestones.map((milestone, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          {milestone}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Sample Tasks:</h5>
                    <div className="space-y-2">
                      {selectedTemplate.tasks.slice(0, 5).map((task, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-900">{task.title}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="text-xs text-gray-600">{task.estimatedHours}h</span>
                          </div>
                        </div>
                      ))}
                      {selectedTemplate.tasks.length > 5 && (
                        <p className="text-sm text-gray-500">+{selectedTemplate.tasks.length - 5} more tasks...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={createProjectFromTemplate}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Create Project
                </button>
                <button
                  onClick={() => {
                    setShowCreateProject(false);
                    setSelectedTemplate(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {selectedTemplate && !showCreateProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{selectedTemplate.name} - Preview</h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-gray-700">{selectedTemplate.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Project Details</h4>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Duration:</strong> {selectedTemplate.estimatedDuration} weeks</li>
                    <li><strong>Team Size:</strong> {selectedTemplate.teamSize} people</li>
                    <li><strong>Complexity:</strong> <span className={getComplexityColor(selectedTemplate.complexity)}>{selectedTemplate.complexity}</span></li>
                    <li><strong>Tasks:</strong> {selectedTemplate.tasks.length}</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Milestones</h4>
                  <ul className="space-y-2 text-sm">
                    {selectedTemplate.milestones.map((milestone, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {milestone}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.requiredSkills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">All Tasks ({selectedTemplate.tasks.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedTemplate.tasks.map((task, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <h5 className="font-medium text-gray-900">{task.title}</h5>
                        {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-sm text-gray-600">{task.estimatedHours}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Use This Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}