'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  colorBlindFriendly: boolean;
  dyslexiaFriendly: boolean;
  seizureSafe: boolean;
}

interface AriaCompliance {
  missingLabels: Array<{ element: string; type: string; location: string }>;
  invalidRoles: Array<{ element: string; role: string; location: string }>;
  missingAltText: Array<{ element: string; location: string }>;
  keyboardIssues: Array<{ element: string; issue: string; location: string }>;
  colorContrast: Array<{ element: string; ratio: number; location: string }>;
  score: number; // 0-100
}

interface KeyboardNavigation {
  tabOrder: Array<{ element: string; tabIndex: number; location: string }>;
  focusableElements: number;
  keyboardTraps: Array<{ element: string; location: string }>;
  skipLinks: boolean;
  focusManagement: boolean;
}

interface ScreenReaderSupport {
  ariaLabels: number;
  ariaDescriptions: number;
  landmarks: number;
  headings: { h1: number; h2: number; h3: number; h4: number; h5: number; h6: number };
  semanticHtml: number;
  altTexts: number;
}

interface AccessibilityImprovementsProps {
  tenantId?: string;
}

export default function AccessibilityImprovements({ tenantId = 'default' }: AccessibilityImprovementsProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true,
    colorBlindFriendly: false,
    dyslexiaFriendly: false,
    seizureSafe: true
  });

  const [compliance, setCompliance] = useState<AriaCompliance | null>(null);
  const [keyboardNav, setKeyboardNav] = useState<KeyboardNavigation | null>(null);
  const [screenReader, setScreenReader] = useState<ScreenReaderSupport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [currentFocus, setCurrentFocus] = useState<string>('');

  const focusIndicatorRef = useRef<HTMLDivElement>(null);

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement;

    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
    }

    // Color blind friendly
    if (settings.colorBlindFriendly) {
      root.classList.add('color-blind-friendly');
    } else {
      root.classList.remove('color-blind-friendly');
    }

    // Dyslexia friendly
    if (settings.dyslexiaFriendly) {
      root.classList.add('dyslexia-friendly');
    } else {
      root.classList.remove('dyslexia-friendly');
    }

    // Seizure safe (remove flashing elements)
    if (settings.seizureSafe) {
      // Remove or modify potentially triggering animations
      const flashingElements = document.querySelectorAll('[class*="flash"], [class*="blink"], [class*="pulse"]');
      flashingElements.forEach(el => {
        (el as HTMLElement).style.animation = 'none';
      });
    }
  }, [settings]);

  // Focus management
  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip links with Ctrl/Cmd + number keys
      if ((e.ctrlKey || e.metaKey) && /^[1-9]$/.test(e.key)) {
        const skipLinks = document.querySelectorAll('[data-skip-link]');
        const index = parseInt(e.key) - 1;
        if (skipLinks[index]) {
          (skipLinks[index] as HTMLElement).focus();
          e.preventDefault();
        }
      }

      // Enhanced tab navigation
      if (e.key === 'Tab') {
        setTimeout(() => {
          const activeElement = document.activeElement;
          if (activeElement && focusIndicatorRef.current) {
            const rect = activeElement.getBoundingClientRect();
            focusIndicatorRef.current.style.cssText = `
              position: fixed;
              left: ${rect.left - 4}px;
              top: ${rect.top - 4}px;
              width: ${rect.width + 8}px;
              height: ${rect.height + 8}px;
              border: 2px solid #3B82F6;
              border-radius: 4px;
              pointer-events: none;
              z-index: 9999;
              transition: all 0.2s ease;
            `;
            setCurrentFocus(activeElement.id || activeElement.tagName);
          }
        }, 0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboardNavigation]);

  const runAccessibilityAudit = async () => {
    setIsAuditing(true);

    try {
      // Simulate accessibility audit
      const auditResult: AriaCompliance = {
        missingLabels: [
          { element: 'button', type: 'aria-label', location: 'header nav' },
          { element: 'input', type: 'aria-describedby', location: 'form section' }
        ],
        invalidRoles: [],
        missingAltText: [
          { element: 'img', location: 'hero section' }
        ],
        keyboardIssues: [
          { element: 'div', issue: 'not focusable', location: 'dropdown menu' }
        ],
        colorContrast: [
          { element: 'span', ratio: 2.1, location: 'footer text' }
        ],
        score: 85
      };

      const keyboardResult: KeyboardNavigation = {
        tabOrder: [
          { element: 'button', tabIndex: 0, location: 'header' },
          { element: 'input', tabIndex: 0, location: 'search form' }
        ],
        focusableElements: 25,
        keyboardTraps: [],
        skipLinks: true,
        focusManagement: true
      };

      const screenReaderResult: ScreenReaderSupport = {
        ariaLabels: 15,
        ariaDescriptions: 8,
        landmarks: 12,
        headings: { h1: 1, h2: 3, h3: 8, h4: 5, h5: 2, h6: 1 },
        semanticHtml: 45,
        altTexts: 12
      };

      setCompliance(auditResult);
      setKeyboardNav(keyboardResult);
      setScreenReader(screenReaderResult);

    } catch (error) {
      console.error('Accessibility audit failed:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  const fixAccessibilityIssue = async (issue: any, type: string) => {
    // Simulate fixing accessibility issues
    console.log(`Fixing ${type} issue:`, issue);

    // Update compliance scores
    setCompliance(prev => prev ? {
      ...prev,
      score: Math.min(100, prev.score + 5)
    } : null);
  };

  const generateAccessibilityReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      settings,
      compliance,
      keyboardNavigation: keyboardNav,
      screenReader: screenReader,
      recommendations: generateRecommendations()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateRecommendations = () => {
    const recommendations = [];

    if (compliance && compliance.score < 90) {
      recommendations.push('Improve ARIA labeling for better screen reader support');
    }

    if (keyboardNav && !keyboardNav.skipLinks) {
      recommendations.push('Add skip links for keyboard navigation');
    }

    if (screenReader && screenReader.headings.h1 === 0) {
      recommendations.push('Add proper heading hierarchy starting with H1');
    }

    if (settings.highContrast === false) {
      recommendations.push('Consider enabling high contrast mode for visually impaired users');
    }

    return recommendations;
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Accessibility Improvements</h2>
        <div className="flex space-x-3">
          <button
            onClick={runAccessibilityAudit}
            disabled={isAuditing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isAuditing ? 'Auditing...' : 'Run Audit'}
          </button>
          <button
            onClick={generateAccessibilityReport}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Accessibility Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Accessibility Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Visual Settings */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Visual</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => setSettings(prev => ({ ...prev, highContrast: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">High contrast mode</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.largeText}
                onChange={(e) => setSettings(prev => ({ ...prev, largeText: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">Large text</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.colorBlindFriendly}
                onChange={(e) => setSettings(prev => ({ ...prev, colorBlindFriendly: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">Color blind friendly</span>
            </label>
          </div>

          {/* Motion & Animation */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Motion</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => setSettings(prev => ({ ...prev, reducedMotion: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">Reduced motion</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.seizureSafe}
                onChange={(e) => setSettings(prev => ({ ...prev, seizureSafe: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">Seizure safe</span>
            </label>
          </div>

          {/* Navigation & Interaction */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Navigation</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.keyboardNavigation}
                onChange={(e) => setSettings(prev => ({ ...prev, keyboardNavigation: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">Keyboard navigation</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.focusIndicators}
                onChange={(e) => setSettings(prev => ({ ...prev, focusIndicators: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">Focus indicators</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.dyslexiaFriendly}
                onChange={(e) => setSettings(prev => ({ ...prev, dyslexiaFriendly: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">Dyslexia friendly</span>
            </label>
          </div>
        </div>
      </div>

      {/* Compliance Overview */}
      {compliance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className={`text-3xl font-bold mb-1 ${getComplianceColor(compliance.score)}`}>
              {compliance.score}/100
            </div>
            <div className="text-sm text-gray-600">Compliance Score</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-red-600 mb-1">
              {compliance.missingLabels.length + compliance.missingAltText.length + compliance.keyboardIssues.length}
            </div>
            <div className="text-sm text-gray-600">Issues Found</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {compliance.colorContrast.filter(c => c.ratio >= 4.5).length}
            </div>
            <div className="text-sm text-gray-600">WCAG Compliant</div>
          </div>
        </div>
      )}

      {/* Current Focus Indicator */}
      {settings.focusIndicators && (
        <div
          ref={focusIndicatorRef}
          className="fixed pointer-events-none z-50 transition-all duration-200 ease-out"
          style={{ display: currentFocus ? 'block' : 'none' }}
        />
      )}

      {/* Skip Links */}
      {settings.keyboardNavigation && (
        <div className="fixed top-0 left-0 z-40 space-y-1">
          <a
            href="#main-content"
            data-skip-link
            className="bg-blue-600 text-white px-4 py-2 rounded-br-md opacity-0 focus:opacity-100 transition-opacity"
          >
            Skip to main content
          </a>
          <a
            href="#navigation"
            data-skip-link
            className="bg-blue-600 text-white px-4 py-2 rounded-br-md opacity-0 focus:opacity-100 transition-opacity"
          >
            Skip to navigation
          </a>
        </div>
      )}

      {/* Accessibility Issues */}
      {compliance && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Accessibility Issues</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {/* Missing Labels */}
            {compliance.missingLabels.map((issue, index) => (
              <div key={`label-${index}`} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        Missing Label
                      </span>
                      <span className="text-sm font-medium">{issue.element}</span>
                    </div>
                    <p className="text-sm text-gray-600">Location: {issue.location}</p>
                  </div>
                  <button
                    onClick={() => fixAccessibilityIssue(issue, 'missing-label')}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Fix
                  </button>
                </div>
              </div>
            ))}

            {/* Missing Alt Text */}
            {compliance.missingAltText.map((issue, index) => (
              <div key={`alt-${index}`} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                        Missing Alt Text
                      </span>
                      <span className="text-sm font-medium">{issue.element}</span>
                    </div>
                    <p className="text-sm text-gray-600">Location: {issue.location}</p>
                  </div>
                  <button
                    onClick={() => fixAccessibilityIssue(issue, 'missing-alt')}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Fix
                  </button>
                </div>
              </div>
            ))}

            {/* Keyboard Issues */}
            {compliance.keyboardIssues.map((issue, index) => (
              <div key={`keyboard-${index}`} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Keyboard Issue
                      </span>
                      <span className="text-sm font-medium">{issue.element}</span>
                    </div>
                    <p className="text-sm text-gray-600">Issue: {issue.issue} • Location: {issue.location}</p>
                  </div>
                  <button
                    onClick={() => fixAccessibilityIssue(issue, 'keyboard')}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Fix
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screen Reader Support */}
      {screenReader && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Screen Reader Support</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{screenReader.ariaLabels}</div>
              <div className="text-sm text-gray-600">ARIA Labels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{screenReader.landmarks}</div>
              <div className="text-sm text-gray-600">Landmarks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{screenReader.altTexts}</div>
              <div className="text-sm text-gray-600">Alt Texts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(screenReader.headings).reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-sm text-gray-600">Headings</div>
            </div>
          </div>

          {/* Heading Structure */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium mb-3">Heading Structure</h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {Object.entries(screenReader.headings).map(([level, count]) => (
                <div key={level} className="text-center">
                  <div className="text-lg font-bold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-600">{level.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Accessibility Recommendations</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          {generateRecommendations().map((rec, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Keyboard Navigation Demo */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Keyboard Navigation Demo</h3>
        <p className="text-sm text-gray-600 mb-4">
          Use Tab to navigate through focusable elements. Current focus: <strong>{currentFocus || 'None'}</strong>
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button id="demo-button-1" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-4 focus:ring-blue-300">
            Button 1
          </button>
          <button id="demo-button-2" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:ring-4 focus:ring-green-300">
            Button 2
          </button>
          <input
            id="demo-input"
            type="text"
            placeholder="Focusable input"
            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select id="demo-select" className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>

        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-700">
            <strong>Keyboard Shortcuts:</strong> Ctrl/Cmd + 1-9 to jump to skip links (if available)
          </p>
        </div>
      </div>

      <style jsx>{`
        .high-contrast {
          filter: contrast(150%);
        }

        .large-text {
          font-size: 120%;
        }

        .color-blind-friendly {
          filter: grayscale(20%);
        }

        .dyslexia-friendly {
          font-family: 'Open Dyslexic', sans-serif;
          line-height: 1.6;
        }

        .focus-visible:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}