'use client';

import { useState, useEffect, useCallback } from 'react';

interface Customer {
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  status: 'lead' | 'prospect' | 'customer' | 'loyal' | 'churned';
  lifecycleStage: 'awareness' | 'consideration' | 'purchase' | 'retention' | 'advocacy';
  leadScore: number;
  totalSpent: number;
  totalOrders: number;
  lastOrderDate?: string;
  firstContactDate: string;
  lastActivityDate: string;
  source: string;
  tags: string[];
  segment: string;
  engagementScore: number;
  churnRisk: 'low' | 'medium' | 'high';
  lifetimeValue: number;
  nextBestAction?: string;
}

interface LifecycleStage {
  stage: Customer['lifecycleStage'];
  label: string;
  description: string;
  color: string;
  actions: string[];
  metrics: string[];
}

interface LifecycleManagerProps {
  tenantId?: string;
}

export default function LifecycleManager({ tenantId = 'default' }: LifecycleManagerProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [churnRiskFilter, setChurnRiskFilter] = useState<string>('all');

  const lifecycleStages: LifecycleStage[] = [
    {
      stage: 'awareness',
      label: 'Awareness',
      description: 'Initial contact and brand discovery',
      color: 'bg-blue-100 text-blue-800',
      actions: ['Send welcome email', 'Provide educational content', 'Social media engagement'],
      metrics: ['Website visits', 'Content downloads', 'Social interactions']
    },
    {
      stage: 'consideration',
      label: 'Consideration',
      description: 'Evaluating options and requirements',
      color: 'bg-yellow-100 text-yellow-800',
      actions: ['Product demos', 'Case studies', 'Comparison guides', 'Free trials'],
      metrics: ['Demo requests', 'Proposal downloads', 'Feature comparisons']
    },
    {
      stage: 'purchase',
      label: 'Purchase',
      description: 'Ready to buy decision',
      color: 'bg-green-100 text-green-800',
      actions: ['Price negotiations', 'Contract review', 'Payment processing'],
      metrics: ['Quote requests', 'Purchase intent', 'Deal closure rate']
    },
    {
      stage: 'retention',
      label: 'Retention',
      description: 'Post-purchase engagement and support',
      color: 'bg-purple-100 text-purple-800',
      actions: ['Onboarding support', 'Customer success check-ins', 'Usage training'],
      metrics: ['Product adoption', 'Support tickets', 'Satisfaction scores']
    },
    {
      stage: 'advocacy',
      label: 'Advocacy',
      description: 'Loyal customers promoting the brand',
      color: 'bg-indigo-100 text-indigo-800',
      actions: ['Referral programs', 'Testimonials', 'Case studies', 'Community engagement'],
      metrics: ['Referrals generated', 'Reviews written', 'Social shares']
    }
  ];

  useEffect(() => {
    fetchCustomers();
  }, [tenantId]);

  useEffect(() => {
    applyFilters();
  }, [customers, stageFilter, segmentFilter, churnRiskFilter]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch(`/api/crm?action=customers&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        // Enhance customers with lifecycle data
        const enhancedCustomers = data.data.map((customer: any) => ({
          ...customer,
          lifecycleStage: calculateLifecycleStage(customer),
          leadScore: calculateLeadScore(customer),
          engagementScore: calculateEngagementScore(customer),
          churnRisk: calculateChurnRisk(customer),
          lifetimeValue: calculateLifetimeValue(customer),
          nextBestAction: suggestNextBestAction(customer)
        }));
        setCustomers(enhancedCustomers);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const calculateLifecycleStage = (customer: any): Customer['lifecycleStage'] => {
    const daysSinceFirstContact = (Date.now() - new Date(customer.firstContactDate).getTime()) / (1000 * 60 * 60 * 24);

    if (customer.totalOrders === 0) {
      return daysSinceFirstContact < 30 ? 'awareness' : 'consideration';
    } else if (customer.totalSpent < 5000) {
      return 'purchase';
    } else if (customer.engagementScore > 70) {
      return 'advocacy';
    } else {
      return 'retention';
    }
  };

  const calculateLeadScore = (customer: any): number => {
    let score = 0;

    // Email engagement
    if (customer.emailOpens > 5) score += 20;
    if (customer.emailClicks > 2) score += 15;

    // Website activity
    if (customer.websiteVisits > 10) score += 25;
    if (customer.pageViews > 50) score += 20;

    // Social engagement
    if (customer.socialInteractions > 5) score += 15;

    // Purchase history
    if (customer.totalOrders > 0) score += 30;
    if (customer.totalSpent > 1000) score += 20;

    // Company size (B2B)
    if (customer.companySize === 'enterprise') score += 25;
    else if (customer.companySize === 'large') score += 15;

    return Math.min(score, 100);
  };

  const calculateEngagementScore = (customer: any): number => {
    let score = 0;

    // Recency of activity
    const daysSinceLastActivity = (Date.now() - new Date(customer.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastActivity < 7) score += 30;
    else if (daysSinceLastActivity < 30) score += 20;
    else if (daysSinceLastActivity < 90) score += 10;

    // Frequency of interactions
    const monthlyInteractions = customer.monthlyInteractions || 0;
    if (monthlyInteractions > 10) score += 25;
    else if (monthlyInteractions > 5) score += 15;

    // Purchase frequency
    const avgOrderFrequency = customer.avgOrderFrequency || 0;
    if (avgOrderFrequency > 30) score += 20; // Frequent buyer
    else if (avgOrderFrequency > 90) score += 10;

    // Support interactions (lower is better)
    const supportTickets = customer.supportTickets || 0;
    if (supportTickets === 0) score += 15;
    else if (supportTickets < 3) score += 10;

    return Math.min(score, 100);
  };

  const calculateChurnRisk = (customer: any): 'low' | 'medium' | 'high' => {
    const daysSinceLastOrder = customer.lastOrderDate ?
      (Date.now() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24) : 999;

    const engagementScore = calculateEngagementScore(customer);
    const orderFrequency = customer.avgOrderFrequency || 999;

    if (daysSinceLastOrder > 180 && engagementScore < 30) return 'high';
    if (daysSinceLastOrder > 90 && orderFrequency > 120) return 'high';
    if (engagementScore < 40) return 'medium';

    return 'low';
  };

  const calculateLifetimeValue = (customer: any): number => {
    const avgOrderValue = customer.totalSpent / Math.max(customer.totalOrders, 1);
    const purchaseFrequency = 365 / Math.max(customer.avgOrderFrequency || 365, 30);
    const customerLifespan = 24; // 2 years average

    return avgOrderValue * purchaseFrequency * customerLifespan;
  };

  const suggestNextBestAction = (customer: any): string => {
    const stage = calculateLifecycleStage(customer);
    const churnRisk = calculateChurnRisk(customer);

    if (churnRisk === 'high') {
      return 'Urgent: Re-engagement campaign needed';
    }

    switch (stage) {
      case 'awareness':
        return 'Send educational content and product info';
      case 'consideration':
        return 'Schedule product demo or consultation';
      case 'purchase':
        return 'Offer special pricing or incentives';
      case 'retention':
        return 'Provide onboarding support and training';
      case 'advocacy':
        return 'Invite to referral program and ask for testimonial';
      default:
        return 'Review customer profile for personalized action';
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...customers];

    if (stageFilter !== 'all') {
      filtered = filtered.filter(customer => customer.lifecycleStage === stageFilter);
    }

    if (segmentFilter !== 'all') {
      filtered = filtered.filter(customer => customer.segment === segmentFilter);
    }

    if (churnRiskFilter !== 'all') {
      filtered = filtered.filter(customer => customer.churnRisk === churnRiskFilter);
    }

    setFilteredCustomers(filtered);
  }, [customers, stageFilter, segmentFilter, churnRiskFilter]);

  const updateCustomerStage = async (customerId: string, newStage: Customer['lifecycleStage']) => {
    try {
      const response = await fetch('/api/crm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_customer_lifecycle',
          tenantId,
          customerId,
          lifecycleStage: newStage
        })
      });

      const data = await response.json();
      if (data.success) {
        setCustomers(customers.map(c =>
          c.id === customerId ? { ...c, lifecycleStage: newStage, nextBestAction: suggestNextBestAction(c) } : c
        ));
      }
    } catch (error) {
      console.error('Failed to update customer stage:', error);
    }
  };

  const getStageColor = (stage: string) => {
    const stageInfo = lifecycleStages.find(s => s.stage === stage);
    return stageInfo?.color || 'bg-gray-100 text-gray-800';
  };

  const getChurnRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <h2 className="text-2xl font-bold text-gray-900">Customer Lifecycle Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={fetchCustomers}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Lifecycle Stages Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {lifecycleStages.map((stage) => {
          const stageCustomers = customers.filter(c => c.lifecycleStage === stage.stage);
          return (
            <div key={stage.stage} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">{stage.label}</h3>
                <span className="text-lg font-bold text-gray-600">{stageCustomers.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: customers.length > 0 ? `${(stageCustomers.length / customers.length) * 100}%` : '0%' }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">{stage.description}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Stages</option>
            {lifecycleStages.map(stage => (
              <option key={stage.stage} value={stage.stage}>{stage.label}</option>
            ))}
          </select>

          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Segments</option>
            <option value="vip">VIP Customers</option>
            <option value="regular">Regular Customers</option>
            <option value="new">New Customers</option>
            <option value="at_risk">At Risk</option>
          </select>

          <select
            value={churnRiskFilter}
            onChange={(e) => setChurnRiskFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>

          <button
            onClick={() => {
              setStageFilter('all');
              setSegmentFilter('all');
              setChurnRiskFilter('all');
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.slice(0, 50).map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                      <div className="text-xs text-gray-400">{customer.customerNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={customer.lifecycleStage}
                      onChange={(e) => updateCustomerStage(customer.id, e.target.value as Customer['lifecycleStage'])}
                      className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStageColor(customer.lifecycleStage)}`}
                    >
                      {lifecycleStages.map(stage => (
                        <option key={stage.stage} value={stage.stage}>{stage.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>Lead: {customer.leadScore}</div>
                    <div>Engage: {customer.engagementScore}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>R{customer.totalSpent.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">LTV: R{customer.lifetimeValue.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChurnRiskColor(customer.churnRisk)}`}>
                      {customer.churnRisk}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {customer.nextBestAction}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Engage
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">Customer Profile</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Customer ID</div>
                      <div className="text-sm font-mono text-gray-900">{selectedCustomer.customerNumber}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(selectedCustomer.lifecycleStage)}`}>
                        {lifecycleStages.find(s => s.stage === selectedCustomer.lifecycleStage)?.label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Contact Information</div>
                    <div className="text-sm text-gray-900 mt-1">
                      <div>{selectedCustomer.email}</div>
                      <div>{selectedCustomer.phone}</div>
                      {selectedCustomer.company && <div>{selectedCustomer.company}</div>}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Engagement & Risk</div>
                    <div className="grid grid-cols-2 gap-4 mt-1">
                      <div>
                        <div className="text-xs text-gray-500">Lead Score</div>
                        <div className="text-lg font-semibold text-blue-600">{selectedCustomer.leadScore}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Churn Risk</div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChurnRiskColor(selectedCustomer.churnRisk)}`}>
                          {selectedCustomer.churnRisk}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">Purchase History & Value</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Total Spent</div>
                      <div className="text-xl font-bold text-green-600">R{selectedCustomer.totalSpent.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                      <div className="text-xl font-bold text-blue-600">{selectedCustomer.totalOrders}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Lifetime Value</div>
                    <div className="text-lg font-semibold text-purple-600">R{selectedCustomer.lifetimeValue.toLocaleString()}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Last Order</div>
                    <div className="text-sm text-gray-900">
                      {selectedCustomer.lastOrderDate ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString() : 'Never'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Recommended Action</div>
                    <div className="text-sm text-blue-600 font-medium mt-1">{selectedCustomer.nextBestAction}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lifecycle Stage Actions */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">Stage-Specific Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lifecycleStages.find(s => s.stage === selectedCustomer.lifecycleStage)?.actions.map((action, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
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