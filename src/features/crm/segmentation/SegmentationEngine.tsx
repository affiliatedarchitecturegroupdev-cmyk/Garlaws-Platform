'use client';

import { useState, useEffect, useCallback } from 'react';
import InteractiveChart from '../../bi/visualization/InteractiveChart';

interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  customerCount: number;
  avgLifetimeValue: number;
  avgEngagementScore: number;
  createdAt: string;
  lastUpdated: string;
  isActive: boolean;
}

interface SegmentCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'between' | 'in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface SegmentationEngineProps {
  tenantId?: string;
}

export default function SegmentationEngine({ tenantId = 'default' }: SegmentationEngineProps) {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);
  const [segmentCustomers, setSegmentCustomers] = useState<any[]>([]);
  const [showSegmentCreator, setShowSegmentCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const [newSegment, setNewSegment] = useState<CustomerSegment>({
    id: '',
    name: '',
    description: '',
    criteria: [],
    customerCount: 0,
    avgLifetimeValue: 0,
    avgEngagementScore: 0,
    createdAt: '',
    lastUpdated: '',
    isActive: true
  });

  const [newCriteria, setNewCriteria] = useState<SegmentCriteria>({
    field: 'totalSpent',
    operator: 'greater_than',
    value: 0
  });

  useEffect(() => {
    fetchSegments();
    fetchCustomers();
  }, [tenantId]);

  const fetchSegments = useCallback(async () => {
    try {
      const response = await fetch(`/api/crm?action=customer_segments&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setSegments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch segments:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch(`/api/crm?action=customers&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  }, [tenantId]);

  const createSegment = async () => {
    if (!newSegment.name || newSegment.criteria.length === 0) return;

    try {
      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_customer_segment',
          tenantId,
          name: newSegment.name,
          description: newSegment.description,
          criteria: newSegment.criteria
        })
      });

      const data = await response.json();
      if (data.success) {
        // Analyze the segment to get customer count and metrics
        await analyzeSegment(data.data);
        setSegments([...segments, data.data]);
        setShowSegmentCreator(false);
        resetNewSegment();
      }
    } catch (error) {
      console.error('Failed to create segment:', error);
    }
  };

  const analyzeSegment = async (segment: CustomerSegment) => {
    setAnalyzing(true);
    try {
      const matchingCustomers = customers.filter(customer => matchesCriteria(customer, segment.criteria));

      const avgLifetimeValue = matchingCustomers.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0) / matchingCustomers.length;
      const avgEngagementScore = matchingCustomers.reduce((sum, c) => sum + (c.engagementScore || 0), 0) / matchingCustomers.length;

      const updatedSegment = {
        ...segment,
        customerCount: matchingCustomers.length,
        avgLifetimeValue: avgLifetimeValue || 0,
        avgEngagementScore: avgEngagementScore || 0,
        lastUpdated: new Date().toISOString()
      };

      // Update segment in database
      await fetch('/api/crm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_customer_segment',
          tenantId,
          segmentId: segment.id,
          updates: {
            customerCount: updatedSegment.customerCount,
            avgLifetimeValue: updatedSegment.avgLifetimeValue,
            avgEngagementScore: updatedSegment.avgEngagementScore,
            lastUpdated: updatedSegment.lastUpdated
          }
        })
      });

      setSegments(segments.map(s => s.id === segment.id ? updatedSegment : s));
      return matchingCustomers;
    } catch (error) {
      console.error('Failed to analyze segment:', error);
      return [];
    } finally {
      setAnalyzing(false);
    }
  };

  const matchesCriteria = (customer: any, criteria: SegmentCriteria[]): boolean => {
    return criteria.every(criterion => {
      const fieldValue = getNestedValue(customer, criterion.field);
      const criterionValue = criterion.value;

      switch (criterion.operator) {
        case 'equals':
          return fieldValue === criterionValue;
        case 'not_equals':
          return fieldValue !== criterionValue;
        case 'greater_than':
          return fieldValue > criterionValue;
        case 'less_than':
          return fieldValue < criterionValue;
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(criterionValue).toLowerCase());
        case 'between':
          return fieldValue >= criterionValue.min && fieldValue <= criterionValue.max;
        case 'in':
          return Array.isArray(criterionValue) && criterionValue.includes(fieldValue);
        default:
          return false;
      }
    });
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const addCriteria = () => {
    setNewSegment({
      ...newSegment,
      criteria: [...newSegment.criteria, { ...newCriteria }]
    });
    setNewCriteria({
      field: 'totalSpent',
      operator: 'greater_than',
      value: 0
    });
  };

  const removeCriteria = (index: number) => {
    setNewSegment({
      ...newSegment,
      criteria: newSegment.criteria.filter((_, i) => i !== index)
    });
  };

  const resetNewSegment = () => {
    setNewSegment({
      id: '',
      name: '',
      description: '',
      criteria: [],
      customerCount: 0,
      avgLifetimeValue: 0,
      avgEngagementScore: 0,
      createdAt: '',
      lastUpdated: '',
      isActive: true
    });
  };

  const viewSegmentCustomers = async (segment: CustomerSegment) => {
    setSelectedSegment(segment);
    const customers = await analyzeSegment(segment);
    setSegmentCustomers(customers);
  };

  const getFieldOptions = () => [
    { value: 'totalSpent', label: 'Total Spent' },
    { value: 'totalOrders', label: 'Total Orders' },
    { value: 'engagementScore', label: 'Engagement Score' },
    { value: 'leadScore', label: 'Lead Score' },
    { value: 'lifetimeValue', label: 'Lifetime Value' },
    { value: 'lastOrderDate', label: 'Last Order Date' },
    { value: 'firstContactDate', label: 'First Contact Date' },
    { value: 'status', label: 'Status' },
    { value: 'segment', label: 'Current Segment' },
    { value: 'tags', label: 'Tags' }
  ];

  const getOperatorOptions = (field: string) => {
    switch (field) {
      case 'totalSpent':
      case 'totalOrders':
      case 'engagementScore':
      case 'leadScore':
      case 'lifetimeValue':
        return [
          { value: 'greater_than', label: 'Greater Than' },
          { value: 'less_than', label: 'Less Than' },
          { value: 'equals', label: 'Equals' },
          { value: 'between', label: 'Between' }
        ];
      case 'status':
      case 'segment':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Not Equals' },
          { value: 'in', label: 'In' }
        ];
      case 'tags':
        return [
          { value: 'contains', label: 'Contains' }
        ];
      case 'lastOrderDate':
      case 'firstContactDate':
        return [
          { value: 'greater_than', label: 'After' },
          { value: 'less_than', label: 'Before' },
          { value: 'between', label: 'Between' }
        ];
      default:
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'contains', label: 'Contains' }
        ];
    }
  };

  // Prepare data for segment distribution chart
  const getSegmentDistributionData = () => {
    const segmentCounts = segments.reduce((acc, segment) => {
      acc[segment.name] = segment.customerCount;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(segmentCounts),
      datasets: [{
        name: 'Customers',
        data: Object.values(segmentCounts),
        color: '#3B82F6'
      }]
    };
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customer Segmentation Engine</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSegmentCreator(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Segment
          </button>
          <button
            onClick={() => fetchSegments()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Segmentation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Segments</p>
              <p className="text-2xl font-bold text-blue-600">{segments.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Segments</p>
              <p className="text-2xl font-bold text-green-600">
                {segments.filter(s => s.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-purple-600">
                {segments.reduce((sum, s) => sum + s.customerCount, 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
              <p className="text-2xl font-bold text-indigo-600">
                {segments.length > 0
                  ? (segments.reduce((sum, s) => sum + s.avgEngagementScore, 0) / segments.length).toFixed(1)
                  : 0}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Segment Distribution Chart */}
      {segments.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Customer Segment Distribution</h3>
          <InteractiveChart
            title="Customers by Segment"
            data={getSegmentDistributionData()}
            chartType="bar"
            height={300}
          />
        </div>
      )}

      {/* Segments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg LTV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {segments.map((segment) => (
                <tr key={segment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{segment.name}</div>
                      <div className="text-sm text-gray-500">{segment.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {segment.customerCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R{segment.avgLifetimeValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {segment.avgEngagementScore.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      segment.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {segment.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewSegmentCustomers(segment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => analyzeSegment(segment)}
                        disabled={analyzing}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        {analyzing ? 'Analyzing...' : 'Analyze'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Segment Modal */}
      {showSegmentCreator && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Create Customer Segment</h3>
              <button
                onClick={() => setShowSegmentCreator(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Segment Name *</label>
                  <input
                    type="text"
                    value={newSegment.name}
                    onChange={(e) => setNewSegment({...newSegment, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newSegment.description}
                    onChange={(e) => setNewSegment({...newSegment, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Criteria Builder */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Segmentation Criteria</h4>

                {/* Add Criteria Form */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4 p-4 bg-gray-50 rounded">
                  <select
                    value={newCriteria.field}
                    onChange={(e) => setNewCriteria({...newCriteria, field: e.target.value})}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {getFieldOptions().map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>

                  <select
                    value={newCriteria.operator}
                    onChange={(e) => setNewCriteria({...newCriteria, operator: e.target.value as any})}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {getOperatorOptions(newCriteria.field).map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Value"
                    value={newCriteria.value}
                    onChange={(e) => setNewCriteria({...newCriteria, value: e.target.value})}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />

                  <select
                    value={newCriteria.logicalOperator || 'AND'}
                    onChange={(e) => setNewCriteria({...newCriteria, logicalOperator: e.target.value as any})}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>

                  <button
                    onClick={addCriteria}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>

                {/* Current Criteria */}
                {newSegment.criteria.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Current Criteria:</h5>
                    {newSegment.criteria.map((criteria, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="text-sm">
                          <span className="font-medium">{getFieldOptions().find(f => f.value === criteria.field)?.label}</span>
                          <span className="mx-2 text-blue-600">
                            {getOperatorOptions(criteria.field).find(o => o.value === criteria.operator)?.label}
                          </span>
                          <span className="font-medium text-blue-800">{criteria.value}</span>
                          {criteria.logicalOperator && index < newSegment.criteria.length - 1 && (
                            <span className="ml-2 px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                              {criteria.logicalOperator}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeCriteria(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={createSegment}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={!newSegment.name || newSegment.criteria.length === 0}
              >
                Create Segment
              </button>
              <button
                onClick={() => setShowSegmentCreator(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Segment Customers Modal */}
      {selectedSegment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-5/6 shadow-lg rounded-md bg-white max-h-screen overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold">Segment: {selectedSegment.name}</h3>
                <p className="text-sm text-gray-600">{selectedSegment.description}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedSegment(null);
                  setSegmentCustomers([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{selectedSegment.customerCount}</div>
                <div className="text-sm text-gray-600">Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">R{selectedSegment.avgLifetimeValue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Avg LTV</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{selectedSegment.avgEngagementScore.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Avg Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {selectedSegment.criteria.length}
                </div>
                <div className="text-sm text-gray-600">Criteria</div>
              </div>
            </div>

            {/* Customers Table */}
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">LTV</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Order</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {segmentCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">
                        <div>
                          <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                          <div className="text-gray-500">{customer.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm">R{customer.lifetimeValue?.toLocaleString() || '0'}</td>
                      <td className="px-4 py-2 text-sm">{customer.engagementScore || 0}</td>
                      <td className="px-4 py-2 text-sm">{customer.totalOrders || 0}</td>
                      <td className="px-4 py-2 text-sm">
                        {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setSelectedSegment(null);
                  setSegmentCustomers([]);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}