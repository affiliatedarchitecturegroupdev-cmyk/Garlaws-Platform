'use client';

import { useState } from 'react';
import KanbanBoard from '@/features/projects/kanban/KanbanBoard';
import GanttChart from '@/features/projects/gantt/GanttChart';
import ResourceAllocation from '@/features/projects/resources/ResourceAllocation';
import ProjectTemplates from '@/features/projects/templates/ProjectTemplates';

type TabType = 'kanban' | 'gantt' | 'resources' | 'templates';

export default function ProjectDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('kanban');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Project Management</h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'kanban'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setActiveTab('gantt')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'gantt'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gantt Chart
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'resources'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resource Allocation
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Project Templates
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'kanban' && <KanbanBoard />}
        {activeTab === 'gantt' && <GanttChart />}
        {activeTab === 'resources' && <ResourceAllocation />}
        {activeTab === 'templates' && <ProjectTemplates />}
      </div>
    </div>
  );
}