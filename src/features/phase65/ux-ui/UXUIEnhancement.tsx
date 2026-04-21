'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ComponentVariant {
  id: string;
  name: string;
  type: 'button' | 'input' | 'card' | 'modal';
  theme: 'light' | 'dark' | 'auto';
  accessibility: 'WCAG_AA' | 'WCAG_AAA' | 'basic';
  usage: number;
  lastUpdated: string;
}

interface ThemePreset {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
  };
  radius: string;
  shadow: string;
}

interface AccessibilityIssue {
  id: string;
  component: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'fixed' | 'in_progress';
  wcag: string;
}

const componentVariants: ComponentVariant[] = [
  {
    id: 'btn_primary_large',
    name: 'Primary Button (Large)',
    type: 'button',
    theme: 'light',
    accessibility: 'WCAG_AA',
    usage: 1247,
    lastUpdated: '2026-04-21'
  },
  {
    id: 'input_search_dark',
    name: 'Search Input (Dark Mode)',
    type: 'input',
    theme: 'dark',
    accessibility: 'WCAG_AAA',
    usage: 892,
    lastUpdated: '2026-04-20'
  },
  {
    id: 'card_dashboard_light',
    name: 'Dashboard Card (Light)',
    type: 'card',
    theme: 'light',
    accessibility: 'WCAG_AA',
    usage: 2156,
    lastUpdated: '2026-04-19'
  },
  {
    id: 'modal_confirmation_auto',
    name: 'Confirmation Modal (Auto Theme)',
    type: 'modal',
    theme: 'auto',
    accessibility: 'WCAG_AAA',
    usage: 456,
    lastUpdated: '2026-04-18'
  }
];

const themePresets: ThemePreset[] = [
  {
    id: 'garlaws_default',
    name: 'Garlaws Default',
    colors: {
      primary: '#2d7d2d',
      secondary: '#e6b83a',
      accent: '#45a29e',
      background: '#ffffff',
      surface: '#f9fafb'
    },
    typography: {
      fontFamily: 'Inter, system-ui',
      fontSize: '16px'
    },
    radius: '8px',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  {
    id: 'garlaws_dark',
    name: 'Garlaws Dark',
    colors: {
      primary: '#3d9d3d',
      secondary: '#f5c842',
      accent: '#5baaa6',
      background: '#0f172a',
      surface: '#1e293b'
    },
    typography: {
      fontFamily: 'Inter, system-ui',
      fontSize: '16px'
    },
    radius: '12px',
    shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
  },
  {
    id: 'enterprise_minimal',
    name: 'Enterprise Minimal',
    colors: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#374151',
      background: '#ffffff',
      surface: '#f9fafb'
    },
    typography: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px'
    },
    radius: '4px',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  }
];

const accessibilityIssues: AccessibilityIssue[] = [
  {
    id: 'a11y_001',
    component: 'DataTable',
    issue: 'Missing keyboard navigation for sortable columns',
    severity: 'high',
    status: 'in_progress',
    wcag: '2.1.1'
  },
  {
    id: 'a11y_002',
    component: 'Modal',
    issue: 'Focus trap not working on mobile devices',
    severity: 'medium',
    status: 'open',
    wcag: '2.4.3'
  },
  {
    id: 'a11y_003',
    component: 'ColorPicker',
    issue: 'Insufficient color contrast in dark mode',
    severity: 'critical',
    status: 'fixed',
    wcag: '1.4.3'
  },
  {
    id: 'a11y_004',
    component: 'Notification',
    issue: 'Screen reader announcements not working',
    severity: 'high',
    status: 'open',
    wcag: '4.1.3'
  }
];

export default function UXUIEnhancement() {
  const [selectedTab, setSelectedTab] = useState<'components' | 'themes' | 'accessibility' | 'interactions'>('components');
  const [selectedTheme, setSelectedTheme] = useState<string>('garlaws_default');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'fixed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Garlaws</span>
            </Link>

            <div className="flex items-center gap-8">
              <Link href="/ux" className="text-gray-600 hover:text-gray-900">UX/UI</Link>
              <Link href="/design-system" className="text-gray-600 hover:text-gray-900">Design System</Link>
              <Link href="/accessibility" className="text-gray-600 hover:text-gray-900">Accessibility</Link>
              <Link href="/components" className="text-gray-600 hover:text-gray-900">Components</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">UX/UI Enhancement</h1>
          <p className="text-gray-600">Advanced user experience and interface improvements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Components</p>
                <p className="text-2xl font-bold text-gray-900">{componentVariants.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">🎨</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Theme Variants</p>
                <p className="text-2xl font-bold text-gray-900">{themePresets.length}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm">🎭</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accessibility Score</p>
                <p className="text-2xl font-bold text-gray-900">94.7%</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">♿</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Issues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accessibilityIssues.filter(i => i.status !== 'fixed').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-sm">⚠️</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'components', label: 'Component Library' },
                { id: 'themes', label: 'Theme System' },
                { id: 'accessibility', label: 'Accessibility' },
                { id: 'interactions', label: 'Interactions' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'components' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Component Library</h2>
                  <div className="flex gap-3">
                    <select
                      value={previewMode}
                      onChange={(e) => setPreviewMode(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="desktop">Desktop Preview</option>
                      <option value="tablet">Tablet Preview</option>
                      <option value="mobile">Mobile Preview</option>
                    </select>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                      Add Component
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {componentVariants.map((component) => (
                    <div key={component.id} className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{component.name}</h3>
                          <p className="text-sm text-gray-600">
                            {component.type} • {component.theme} theme • {component.accessibility}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            Used {component.usage.toLocaleString()} times
                          </span>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            Preview
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        {/* Component Preview Placeholder */}
                        <div className="flex items-center justify-center h-16 text-gray-500">
                          Component Preview ({component.type})
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Last updated: {component.lastUpdated}</span>
                        <div className="flex gap-3">
                          <button className="text-blue-600 hover:text-blue-800">Edit</button>
                          <button className="text-red-600 hover:text-red-800">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'themes' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Theme System</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    Create Theme
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {themePresets.map((theme) => (
                    <div
                      key={theme.id}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTheme === theme.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTheme(theme.id)}
                    >
                      <h3 className="font-medium text-gray-900 mb-4">{theme.name}</h3>

                      <div className="space-y-3 mb-4">
                        <div className="flex gap-2">
                          {Object.entries(theme.colors).map(([key, color]) => (
                            <div key={key} className="flex flex-col items-center">
                              <div
                                className="w-6 h-6 rounded border border-gray-300"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-xs text-gray-600 mt-1">{key}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Font: {theme.typography.fontFamily}</p>
                        <p>Size: {theme.typography.fontSize}</p>
                        <p>Radius: {theme.radius}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTheme && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Theme Preview</h3>
                    <div
                      className="p-6 rounded-lg"
                      style={{
                        backgroundColor: themePresets.find(t => t.id === selectedTheme)?.colors.background,
                        color: themePresets.find(t => t.id === selectedTheme)?.colors.surface === '#1e293b' ? '#ffffff' : '#111827',
                        borderRadius: themePresets.find(t => t.id === selectedTheme)?.radius
                      }}
                    >
                      <div className="space-y-4">
                        <button
                          className="px-4 py-2 rounded text-white"
                          style={{
                            backgroundColor: themePresets.find(t => t.id === selectedTheme)?.colors.primary,
                            borderRadius: themePresets.find(t => t.id === selectedTheme)?.radius
                          }}
                        >
                          Primary Button
                        </button>

                        <div
                          className="p-4 rounded"
                          style={{
                            backgroundColor: themePresets.find(t => t.id === selectedTheme)?.colors.surface,
                            borderRadius: themePresets.find(t => t.id === selectedTheme)?.radius
                          }}
                        >
                          <h4 className="font-medium mb-2">Sample Card</h4>
                          <p className="text-sm opacity-80">This is how content looks in this theme.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'accessibility' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Accessibility Dashboard</h2>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                    Run Audit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {accessibilityIssues.filter(i => i.status === 'fixed').length}
                    </div>
                    <div className="text-sm text-green-700">Fixed Issues</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {accessibilityIssues.filter(i => i.severity === 'critical' && i.status !== 'fixed').length}
                    </div>
                    <div className="text-sm text-red-700">Critical Issues</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {accessibilityIssues.filter(i => i.severity === 'high' && i.status !== 'fixed').length}
                    </div>
                    <div className="text-sm text-yellow-700">High Priority</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">94.7%</div>
                    <div className="text-sm text-blue-700">WCAG Compliance</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {accessibilityIssues.map((issue) => (
                    <div key={issue.id} className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                          </span>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(issue.status)}`}>
                            {issue.status.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">WCAG {issue.wcag}</span>
                      </div>

                      <div className="mb-3">
                        <h3 className="font-medium text-gray-900">{issue.component}</h3>
                        <p className="text-sm text-gray-600 mt-1">{issue.issue}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">View Details</button>
                          <button className="text-green-600 hover:text-green-800 text-sm">Mark Fixed</button>
                        </div>
                        <span className="text-xs text-gray-500">Issue #{issue.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'interactions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Interaction Patterns</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    Add Pattern
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Micro-interactions</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">Button hover effects</span>
                        <span className="text-green-600 text-sm">✓ Active</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">Form validation feedback</span>
                        <span className="text-green-600 text-sm">✓ Active</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">Loading states</span>
                        <span className="text-yellow-600 text-sm">⚠ Needs Update</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">Success animations</span>
                        <span className="text-green-600 text-sm">✓ Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Patterns</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">Progressive disclosure</span>
                        <span className="text-green-600 text-sm">✓ Active</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">Contextual menus</span>
                        <span className="text-green-600 text-sm">✓ Active</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">Drag & drop interfaces</span>
                        <span className="text-yellow-600 text-sm">⚠ Limited</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">Gesture navigation</span>
                        <span className="text-blue-600 text-sm">In Development</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-3">Interaction Guidelines</h3>
                  <div className="text-sm text-blue-700 space-y-2">
                    <p>• All interactions should provide immediate visual feedback</p>
                    <p>• Loading states should be shown for operations &gt;500ms</p>
                    <p>• Error states should be clearly communicated with actionable solutions</p>
                    <p>• Success states should be celebrated with appropriate animations</p>
                    <p>• Touch targets should be at least 44px on mobile devices</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}