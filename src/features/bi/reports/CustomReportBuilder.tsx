'use client';

import { useState, useEffect, useCallback } from 'react';

interface ReportField {
  id: string;
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  options?: string[];
  required?: boolean;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: ReportField[];
  dataSource: string;
  defaultParameters: Record<string, any>;
}

interface CustomReportBuilderProps {
  tenantId?: string;
}

export default function CustomReportBuilder({ tenantId = 'default' }: CustomReportBuilderProps) {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportParameters, setReportParameters] = useState<Record<string, any>>({});
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    category: '',
    search: ''
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: '',
    dataSource: '',
    fields: [] as ReportField[]
  });

  useEffect(() => {
    fetchReportTemplates();
  }, [tenantId]);

  const fetchReportTemplates = useCallback(async () => {
    try {
      const response = await fetch(`/api/bi?action=report_templates&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch report templates:', error);
    }
  }, [tenantId]);

  const generateReport = async () => {
    if (!selectedTemplate) return;

    setLoading(true);
    try {
      const response = await fetch('/api/bi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_custom_report',
          tenantId,
          templateId: selectedTemplate.id,
          parameters: reportParameters,
          filters: reportFilters
        })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedReport(data.data);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!generatedReport) return;

    try {
      const response = await fetch('/api/bi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export_report',
          tenantId,
          reportId: generatedReport.id,
          format
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${generatedReport.id}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const createTemplate = async () => {
    if (!newTemplate.name || !newTemplate.category || !newTemplate.dataSource) return;

    try {
      const response = await fetch('/api/bi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_report_template',
          tenantId,
          ...newTemplate
        })
      });

      const data = await response.json();
      if (data.success) {
        setTemplates([...templates, data.data]);
        setShowTemplateForm(false);
        setNewTemplate({
          name: '',
          description: '',
          category: '',
          dataSource: '',
          fields: []
        });
      }
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const addFieldToTemplate = () => {
    const newField: ReportField = {
      id: `field_${Date.now()}`,
      name: '',
      label: '',
      type: 'string',
      required: false
    };

    setNewTemplate({
      ...newTemplate,
      fields: [...newTemplate.fields, newField]
    });
  };

  const updateField = (fieldId: string, updates: Partial<ReportField>) => {
    setNewTemplate({
      ...newTemplate,
      fields: newTemplate.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    });
  };

  const removeField = (fieldId: string) => {
    setNewTemplate({
      ...newTemplate,
      fields: newTemplate.fields.filter(field => field.id !== fieldId)
    });
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = !reportFilters.category || template.category === reportFilters.category;
    const matchesSearch = !reportFilters.search ||
      template.name.toLowerCase().includes(reportFilters.search.toLowerCase()) ||
      template.description.toLowerCase().includes(reportFilters.search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderFieldInput = (field: ReportField, value: any, onChange: (value: any) => void) => {
    switch (field.type) {
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required={field.required}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required={field.required}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required={field.required}
          />
        );
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        );
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required={field.required}
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      default:
        return <div>Unsupported field type</div>;
    }
  };

  if (loading && !generatedReport) {
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
        <h2 className="text-2xl font-bold text-gray-900">Custom Report Builder</h2>
        <button
          onClick={() => setShowTemplateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Template
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search templates..."
            value={reportFilters.search}
            onChange={(e) => setReportFilters({...reportFilters, search: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={reportFilters.category}
            onChange={(e) => setReportFilters({...reportFilters, category: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option value="financial">Financial</option>
            <option value="operational">Operational</option>
            <option value="customer">Customer</option>
            <option value="inventory">Inventory</option>
            <option value="hr">HR</option>
          </select>
          <button
            onClick={() => setReportFilters({ category: '', search: '' })}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Report Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`bg-white p-6 rounded-lg shadow-sm border cursor-pointer transition-all ${
              selectedTemplate?.id === template.id
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:shadow-md'
            }`}
            onClick={() => {
              setSelectedTemplate(template);
              setReportParameters(template.defaultParameters || {});
              setGeneratedReport(null);
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {template.category}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{template.description}</p>
            <div className="text-xs text-gray-500">
              <div>Data Source: {template.dataSource}</div>
              <div>Fields: {template.fields.length}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Template Parameters */}
      {selectedTemplate && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Report Parameters: {selectedTemplate.name}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {selectedTemplate.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderFieldInput(
                  field,
                  reportParameters[field.name],
                  (value) => setReportParameters({...reportParameters, [field.name]: value})
                )}
              </div>
            ))}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      )}

      {/* Generated Report */}
      {generatedReport && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Generated Report: {generatedReport.title}</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => exportReport('pdf')}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Export PDF
              </button>
              <button
                onClick={() => exportReport('excel')}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Export Excel
              </button>
              <button
                onClick={() => exportReport('csv')}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Report Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{generatedReport.summary.totalRecords}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">R{generatedReport.summary.totalValue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">R{generatedReport.summary.averageValue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Average Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{new Date(generatedReport.generatedAt).toLocaleString()}</div>
              <div className="text-sm text-gray-600">Generated At</div>
            </div>
          </div>

          {/* Report Data Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {generatedReport.data.length > 0 && Object.keys(generatedReport.data[0]).map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {generatedReport.data.slice(0, 50).map((row: any, index: number) => (
                  <tr key={index}>
                    {Object.values(row).map((value: any, cellIndex: number) => (
                      <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {generatedReport.data.length > 50 && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                Showing first 50 of {generatedReport.data.length} records. Export for full data.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Create Template Form */}
      {showTemplateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New Report Template</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Category</option>
                <option value="financial">Financial</option>
                <option value="operational">Operational</option>
                <option value="customer">Customer</option>
                <option value="inventory">Inventory</option>
                <option value="hr">HR</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Source *</label>
              <select
                value={newTemplate.dataSource}
                onChange={(e) => setNewTemplate({...newTemplate, dataSource: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Data Source</option>
                <option value="financial_transactions">Financial Transactions</option>
                <option value="inventory_items">Inventory Items</option>
                <option value="customer_data">Customer Data</option>
                <option value="operational_metrics">Operational Metrics</option>
                <option value="hr_records">HR Records</option>
              </select>
            </div>
          </div>

          {/* Fields Builder */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-semibold">Report Fields</h4>
              <button
                onClick={addFieldToTemplate}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Field
              </button>
            </div>

            <div className="space-y-3">
              {newTemplate.fields.map((field) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 border border-gray-200 rounded">
                  <input
                    type="text"
                    placeholder="Field Name"
                    value={field.name}
                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Display Label"
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="boolean">Boolean</option>
                    <option value="select">Select</option>
                  </select>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={field.required || false}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      className="mr-2"
                    />
                    <label className="text-sm">Required</label>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => removeField(field.id)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={createTemplate}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Create Template
            </button>
            <button
              onClick={() => setShowTemplateForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}