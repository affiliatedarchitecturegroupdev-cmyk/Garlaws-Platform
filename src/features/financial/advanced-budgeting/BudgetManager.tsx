'use client';

import { useState, useEffect, useCallback } from 'react';

interface Budget {
  id: string;
  name: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  year: number;
  categories: BudgetCategory[];
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  createdAt: string;
  updatedAt: string;
}

interface BudgetCategory {
  id: string;
  name: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  subcategories?: BudgetCategory[];
}

interface BudgetManagerProps {
  tenantId?: string;
}

export default function BudgetManager({ tenantId = 'default' }: BudgetManagerProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetPeriod, setNewBudgetPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [newBudgetYear, setNewBudgetYear] = useState(new Date().getFullYear());

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await fetch(`/api/financial?action=budgets&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setBudgets(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const createBudget = async () => {
    if (!newBudgetName.trim()) return;

    try {
      const response = await fetch('/api/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-budget',
          tenantId,
          name: newBudgetName,
          period: newBudgetPeriod,
          year: newBudgetYear,
          categories: [
            { name: 'Revenue', budgetedAmount: 0, actualAmount: 0 },
            { name: 'Operating Expenses', budgetedAmount: 0, actualAmount: 0 },
            { name: 'Capital Expenditures', budgetedAmount: 0, actualAmount: 0 },
          ]
        })
      });

      const data = await response.json();
      if (data.success) {
        setBudgets([...budgets, data.data]);
        setShowCreateForm(false);
        setNewBudgetName('');
      }
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  };

  const updateCategory = async (budgetId: string, categoryId: string, budgetedAmount: number) => {
    try {
      const response = await fetch('/api/financial', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-budget-category',
          tenantId,
          budgetId,
          categoryId,
          budgetedAmount
        })
      });

      const data = await response.json();
      if (data.success) {
        setBudgets(budgets.map(b => b.id === budgetId ? data.data : b));
        if (selectedBudget?.id === budgetId) {
          setSelectedBudget(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to update category:', error);
    }
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
        <h2 className="text-2xl font-bold text-gray-900">Budget Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Budget
        </button>
      </div>

      {/* Create Budget Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New Budget</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Name</label>
              <input
                type="text"
                value={newBudgetName}
                onChange={(e) => setNewBudgetName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Q1 Marketing Budget"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select
                value={newBudgetPeriod}
                onChange={(e) => setNewBudgetPeriod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={newBudgetYear}
                onChange={(e) => setNewBudgetYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="2020"
                max="2030"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={createBudget}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Create Budget
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

      {/* Budget List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => (
          <div
            key={budget.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedBudget(budget)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{budget.period} {budget.year}</p>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                budget.totalVariance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {budget.totalVariance >= 0 ? 'Under' : 'Over'} Budget
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Budgeted:</span>
                <span className="font-medium">R{budget.totalBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Actual:</span>
                <span className="font-medium">R{budget.totalActual.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Variance:</span>
                <span className={`font-medium ${budget.totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R{budget.totalVariance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Budget Detail Modal/View */}
      {selectedBudget && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">{selectedBudget.name}</h3>
            <button
              onClick={() => setSelectedBudget(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {selectedBudget.categories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    category.variance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {category.variancePercent.toFixed(1)}%
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budgeted Amount</label>
                    <input
                      type="number"
                      value={category.budgetedAmount}
                      onChange={(e) => updateCategory(selectedBudget.id, category.id, Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Actual Amount</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      R{category.actualAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Variance</label>
                    <div className={`px-3 py-2 border rounded-md ${
                      category.variance >= 0 ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'
                    }`}>
                      R{category.variance.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}