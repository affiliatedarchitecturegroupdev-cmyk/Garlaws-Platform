'use client';

import { useState, useEffect, useCallback } from 'react';

interface IndustryModule {
  id: string;
  name: string;
  industry: string;
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'beta' | 'deprecated';
  features: IndustryFeature[];
  workflows: IndustryWorkflow[];
  templates: IndustryTemplate[];
  integrations: string[];
  compliance: ComplianceRequirement[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

interface IndustryFeature {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'optional' | 'premium';
  enabled: boolean;
  configuration: Record<string, any>;
}

interface IndustryWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: 'manual' | 'scheduled' | 'event' | 'api';
  steps: WorkflowStep[];
  variables: WorkflowVariable[];
}

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
}

interface WorkflowVariable {
  id: string;
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
}

interface IndustryTemplate {
  id: string;
  name: string;
  description: string;
  category: 'document' | 'form' | 'report' | 'dashboard';
  content: any;
  variables: TemplateVariable[];
}

interface TemplateVariable {
  name: string;
  type: string;
  description?: string;
  required: boolean;
}

interface ComplianceRequirement {
  id: string;
  standard: string;
  requirement: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'pending' | 'not-applicable';
  evidence?: string;
  lastAudited?: string;
}

interface IndustryTenant {
  id: string;
  tenantId: string;
  industry: string;
  modules: string[]; // Module IDs
  customizations: Record<string, any>;
  complianceStatus: 'compliant' | 'review-required' | 'non-compliant';
  activatedAt: string;
  settings: IndustrySettings;
}

interface IndustrySettings {
  locale: string;
  currency: string;
  timezone: string;
  fiscalYearStart: number; // Month 1-12
  reportingStandards: string[];
  regulatoryBodies: string[];
  customFields: CustomField[];
}

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  options?: string[];
  validation?: string;
}

interface IndustrySpecificModulesProps {
  tenantId?: string;
}

export default function IndustrySpecificModules({ tenantId = 'default' }: IndustrySpecificModulesProps) {
  const [modules, setModules] = useState<IndustryModule[]>([]);
  const [tenantConfig, setTenantConfig] = useState<IndustryTenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<IndustryModule | null>(null);
  const [activeTab, setActiveTab] = useState<'modules' | 'configuration' | 'compliance'>('modules');
  const [showIndustrySelector, setShowIndustrySelector] = useState(false);

  const industries = [
    { id: 'construction', name: 'Construction & Engineering', icon: '🏗️' },
    { id: 'manufacturing', name: 'Manufacturing', icon: '🏭' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
    { id: 'retail', name: 'Retail & E-commerce', icon: '🛒' },
    { id: 'finance', name: 'Financial Services', icon: '🏦' },
    { id: 'real-estate', name: 'Real Estate', icon: '🏢' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'government', name: 'Government', icon: '🏛️' },
    { id: 'non-profit', name: 'Non-Profit', icon: '🤝' },
    { id: 'technology', name: 'Technology & IT', icon: '💻' }
  ];

  const fetchModules = useCallback(async () => {
    try {
      const response = await fetch(`/api/erp?action=industry-modules&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setModules(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch industry modules:', error);
    }
  }, [tenantId]);

  const fetchTenantConfig = useCallback(async () => {
    try {
      const response = await fetch(`/api/erp?action=industry-tenant-config&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setTenantConfig(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tenant config:', error);
    }
  }, [tenantId]);

  useEffect(() => {
    Promise.all([fetchModules(), fetchTenantConfig()]).finally(() => {
      setLoading(false);
    });
  }, [fetchModules, fetchTenantConfig]);

  const activateModule = async (moduleId: string) => {
    try {
      const response = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'activate-industry-module',
          tenantId,
          moduleId
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchTenantConfig(); // Refresh tenant config
        alert('Module activated successfully!');
      }
    } catch (error) {
      console.error('Failed to activate module:', error);
    }
  };

  const deactivateModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to deactivate this module?')) return;

    try {
      const response = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deactivate-industry-module',
          tenantId,
          moduleId
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchTenantConfig(); // Refresh tenant config
        alert('Module deactivated successfully!');
      }
    } catch (error) {
      console.error('Failed to deactivate module:', error);
    }
  };

  const setIndustry = async (industryId: string) => {
    try {
      const response = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set-tenant-industry',
          tenantId,
          industry: industryId
        })
      });

      const data = await response.json();
      if (data.success) {
        setTenantConfig(prev => prev ? { ...prev, industry: industryId } : null);
        setShowIndustrySelector(false);
        fetchModules(); // Refresh available modules
        alert('Industry set successfully!');
      }
    } catch (error) {
      console.error('Failed to set industry:', error);
    }
  };

  const updateModuleFeature = async (moduleId: string, featureId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/erp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-module-feature',
          tenantId,
          moduleId,
          featureId,
          enabled
        })
      });

      const data = await response.json();
      if (data.success) {
        setModules(modules.map(module =>
          module.id === moduleId
            ? {
                ...module,
                features: module.features.map(feature =>
                  feature.id === featureId ? { ...feature, enabled } : feature
                )
              }
            : module
        ));
      }
    } catch (error) {
      console.error('Failed to update module feature:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'beta': return 'bg-blue-100 text-blue-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'review-required': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIndustryIcon = (industryId: string) => {
    return industries.find(i => i.id === industryId)?.icon || '🏢';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-blue-100 text-blue-800';
      case 'optional': return 'bg-gray-100 text-gray-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">Industry-Specific Modules</h2>
          {tenantConfig?.industry && (
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getIndustryIcon(tenantConfig.industry)}</span>
              <span className="text-sm font-medium text-gray-600">
                {industries.find(i => i.id === tenantConfig.industry)?.name}
              </span>
              <button
                onClick={() => setShowIndustrySelector(true)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Change
              </button>
            </div>
          )}
        </div>
        {!tenantConfig?.industry && (
          <button
            onClick={() => setShowIndustrySelector(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Set Industry
          </button>
        )}
      </div>

      {/* Industry Selector Modal */}
      {showIndustrySelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Select Your Industry</h3>
              <button
                onClick={() => setShowIndustrySelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {industries.map((industry) => (
                <button
                  key={industry.id}
                  onClick={() => setIndustry(industry.id)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{industry.icon}</span>
                    <span className="font-medium text-gray-900">{industry.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Specialized modules and workflows for {industry.name.toLowerCase()} industry requirements.
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('modules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'modules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Available Modules ({modules.length})
          </button>
          <button
            onClick={() => setActiveTab('configuration')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'configuration'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Configuration
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'compliance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Compliance
          </button>
        </nav>
      </div>

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const isActive = tenantConfig?.modules.includes(module.id);
            return (
              <div
                key={module.id}
                className={`bg-white p-6 rounded-lg shadow-sm border transition-all ${
                  isActive ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{module.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(module.status)}`}>
                        {module.status}
                      </span>
                      <span className="text-xs text-gray-600">v{module.version}</span>
                    </div>
                  </div>
                  {isActive && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Features:</span>
                    <span className="ml-1 font-medium">{module.features.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Workflows:</span>
                    <span className="ml-1 font-medium">{module.workflows.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Templates:</span>
                    <span className="ml-1 font-medium">{module.templates.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Usage:</span>
                    <span className="ml-1 font-medium">{module.usageCount}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {isActive ? (
                    <>
                      <button
                        onClick={() => setSelectedModule(module)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Configure
                      </button>
                      <button
                        onClick={() => deactivateModule(module.id)}
                        className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                      >
                        Deactivate
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => activateModule(module.id)}
                      disabled={module.status === 'deprecated'}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {modules.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🏭</div>
              <p className="text-lg">No industry modules available</p>
              <p className="text-sm">Select an industry to see available specialized modules.</p>
            </div>
          )}
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'configuration' && tenantConfig && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Industry Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locale</label>
                <select
                  value={tenantConfig.settings.locale}
                  onChange={(e) => setTenantConfig(prev => prev ? {
                    ...prev,
                    settings: { ...prev.settings, locale: e.target.value }
                  } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={tenantConfig.settings.currency}
                  onChange={(e) => setTenantConfig(prev => prev ? {
                    ...prev,
                    settings: { ...prev.settings, currency: e.target.value }
                  } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  value={tenantConfig.settings.timezone}
                  onChange={(e) => setTenantConfig(prev => prev ? {
                    ...prev,
                    settings: { ...prev.settings, timezone: e.target.value }
                  } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year Start</label>
                <select
                  value={tenantConfig.settings.fiscalYearStart}
                  onChange={(e) => setTenantConfig(prev => prev ? {
                    ...prev,
                    settings: { ...prev.settings, fiscalYearStart: parseInt(e.target.value) }
                  } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Modules Configuration */}
          {tenantConfig.modules.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Module Configuration</h3>
              <div className="space-y-4">
                {tenantConfig.modules.map(moduleId => {
                  const module = modules.find(m => m.id === moduleId);
                  if (!module) return null;

                  return (
                    <div key={moduleId} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">{module.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {module.features.map(feature => (
                          <div key={feature.id} className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(feature.category)}`}>
                                  {feature.category}
                                </span>
                                <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={feature.enabled}
                                onChange={(e) => updateModuleFeature(moduleId, feature.id, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && tenantConfig && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className={`text-2xl font-bold mb-1 ${tenantConfig.complianceStatus === 'compliant' ? 'text-green-600' : 'text-red-600'}`}>
                {tenantConfig.complianceStatus === 'compliant' ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600">Overall Status</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {tenantConfig.settings.regulatoryBodies.length}
              </div>
              <div className="text-sm text-gray-600">Regulatory Bodies</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {tenantConfig.settings.reportingStandards.length}
              </div>
              <div className="text-sm text-gray-600">Reporting Standards</div>
            </div>
          </div>

          {/* Compliance Requirements by Module */}
          {tenantConfig.modules.map(moduleId => {
            const module = modules.find(m => m.id === moduleId);
            if (!module || module.compliance.length === 0) return null;

            return (
              <div key={moduleId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">{module.name} - Compliance Requirements</h3>
                <div className="space-y-3">
                  {module.compliance.map(requirement => (
                    <div key={requirement.id} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{requirement.standard}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(requirement.status)}`}>
                            {requirement.status.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{requirement.requirement}</p>
                        <p className="text-xs text-gray-600">{requirement.description}</p>
                        {requirement.lastAudited && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last audited: {new Date(requirement.lastAudited).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {requirement.evidence && (
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          View Evidence
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {(!tenantConfig.modules.length || tenantConfig.modules.every(moduleId => {
            const module = modules.find(m => m.id === moduleId);
            return !module || module.compliance.length === 0;
          })) && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">⚖️</div>
              <p>No compliance requirements found</p>
              <p className="text-sm">Activate industry modules to see compliance requirements.</p>
            </div>
          )}
        </div>
      )}

      {/* Module Detail Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{selectedModule.name} - Details</h3>
              <button
                onClick={() => setSelectedModule(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Module Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Version</h4>
                  <p className="text-sm text-gray-900">v{selectedModule.version}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Features</h4>
                  <p className="text-sm text-gray-900">{selectedModule.features.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Workflows</h4>
                  <p className="text-sm text-gray-900">{selectedModule.workflows.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Templates</h4>
                  <p className="text-sm text-gray-900">{selectedModule.templates.length}</p>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Features ({selectedModule.features.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedModule.features.map(feature => (
                    <div key={feature.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{feature.name}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(feature.category)}`}>
                          {feature.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflows */}
              {selectedModule.workflows.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Workflows ({selectedModule.workflows.length})</h4>
                  <div className="space-y-3">
                    {selectedModule.workflows.slice(0, 3).map(workflow => (
                      <div key={workflow.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{workflow.name}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            workflow.trigger === 'manual' ? 'bg-blue-100 text-blue-800' :
                            workflow.trigger === 'scheduled' ? 'bg-green-100 text-green-800' :
                            workflow.trigger === 'event' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {workflow.trigger}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{workflow.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{workflow.steps.length} steps</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Integrations */}
              {selectedModule.integrations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Integrations</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedModule.integrations.map((integration, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {integration}
                      </span>
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