'use client';

import { useState } from 'react';
import AIChatbot from '@/features/ml/chatbot/AIChatbot';
import PredictiveMaintenance from '@/features/ml/predictive/PredictiveMaintenance';
import RecommendationEngine from '@/features/ml/recommendations/RecommendationEngine';
import WorkflowAutomation from '@/features/ml/automation/WorkflowAutomation';
import DataMining from '@/features/data-science/data-mining/DataMining';
import QuantumComputing from '@/features/quantum-computing/QuantumComputing';

type TabType = 'chatbot' | 'predictive' | 'recommendations' | 'automation' | 'mining' | 'quantum';

export default function MLDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('chatbot');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI/ML Platform</h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'chatbot'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI Chatbot
            </button>
            <button
              onClick={() => setActiveTab('predictive')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'predictive'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Predictive Maintenance
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'recommendations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recommendations
            </button>
            <button
              onClick={() => setActiveTab('automation')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'automation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Workflow Automation
            </button>
            <button
              onClick={() => setActiveTab('mining')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'mining'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Data Mining
            </button>
            <button
              onClick={() => setActiveTab('quantum')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'quantum'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quantum Computing
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'chatbot' && <AIChatbot />}
        {activeTab === 'predictive' && <PredictiveMaintenance />}
        {activeTab === 'recommendations' && <RecommendationEngine />}
        {activeTab === 'automation' && <WorkflowAutomation />}
        {activeTab === 'mining' && (
          <DataMining
            data={[]} // Would be populated with actual ML training data
            onPatternsFound={(patterns) => console.log('Data mining patterns found:', patterns)}
          />
        )}
        {activeTab === 'quantum' && (
          <QuantumComputing
            onQuantumResult={(result) => console.log('Quantum computation result:', result)}
            onOptimizationComplete={(solution) => console.log('Optimization solution:', solution)}
          />
        )}
      </div>
    </div>
  );
}