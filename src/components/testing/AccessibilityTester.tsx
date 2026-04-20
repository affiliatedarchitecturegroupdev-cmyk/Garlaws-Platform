import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    target: string[];
    html: string;
    failureSummary: string;
  }>;
}

interface AccessibilityResult {
  violations: AccessibilityViolation[];
  passes: Array<{
    id: string;
    description: string;
    help: string;
  }>;
  incomplete: Array<{
    id: string;
    description: string;
  }>;
  inapplicable: Array<{
    id: string;
    description: string;
  }>;
  timestamp: Date;
  score: number;
}

interface AccessibilityTesterProps {
  element?: HTMLElement;
  scope?: 'page' | 'component';
  onResult?: (result: AccessibilityResult) => void;
  className?: string;
  autoRun?: boolean;
}

export function AccessibilityTester({
  element,
  scope = 'page',
  onResult,
  className,
  autoRun = false,
}: AccessibilityTesterProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AccessibilityResult[]>([]);
  const [currentResult, setCurrentResult] = useState<AccessibilityResult | null>(null);

  // Mock axe-core results for demonstration
  // In a real implementation, this would import and use axe-core
  const mockAxeResults = useCallback((): AccessibilityResult => {
    const mockViolations: AccessibilityViolation[] = [
      {
        id: 'color-contrast',
        impact: 'serious',
        description: 'Elements must have sufficient color contrast',
        help: 'Ensure the contrast between the text and background is at least 4.5:1',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
        nodes: [{
          target: ['.text-muted'],
          html: '<span class="text-muted">Low contrast text</span>',
          failureSummary: 'Fix the color contrast of this text',
        }],
      },
      {
        id: 'image-alt',
        impact: 'critical',
        description: 'Images must have alt text',
        help: 'Provide alternative text for images',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt',
        nodes: [{
          target: ['img[alt=""]'],
          html: '<img src="image.jpg" alt="">',
          failureSummary: 'Add alt text to this image',
        }],
      },
    ];

    const totalChecks = 100;
    const passes = totalChecks - mockViolations.length;
    const score = Math.round((passes / totalChecks) * 100);

    return {
      violations: mockViolations,
      passes: Array.from({ length: passes }, (_, i) => ({
        id: `pass-${i}`,
        description: `Accessibility check ${i + 1} passed`,
        help: 'This element meets accessibility standards',
      })),
      incomplete: [],
      inapplicable: [],
      timestamp: new Date(),
      score,
    };
  }, []);

  const runAccessibilityTest = useCallback(async () => {
    setIsRunning(true);

    try {
      // Simulate axe-core run
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = mockAxeResults();
      setCurrentResult(result);
      setResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
      onResult?.(result);
    } catch (error) {
      console.error('Accessibility test failed:', error);
    } finally {
      setIsRunning(false);
    }
  }, [mockAxeResults, onResult]);

  useEffect(() => {
    if (autoRun) {
      runAccessibilityTest();
    }
  }, [autoRun, runAccessibilityTest]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'serious': return 'text-orange-600 bg-orange-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'minor': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Accessibility Testing</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Scope: {scope === 'page' ? 'Full Page' : 'Component'}
          </span>
          <button
            onClick={runAccessibilityTest}
            disabled={isRunning}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 disabled:opacity-50"
          >
            {isRunning ? 'Testing...' : 'Run Test'}
          </button>
        </div>
      </div>

      {/* Current Results */}
      {currentResult && (
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Latest Test Results</h4>
            <div className="flex items-center space-x-3">
              <span className={cn('text-lg font-bold', getScoreColor(currentResult.score))}>
                {currentResult.score}/100
              </span>
              <span className="text-sm text-muted-foreground">
                {currentResult.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{currentResult.violations.length}</div>
              <div className="text-sm text-muted-foreground">Violations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{currentResult.passes.length}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{currentResult.incomplete.length}</div>
              <div className="text-sm text-muted-foreground">Incomplete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{currentResult.inapplicable.length}</div>
              <div className="text-sm text-muted-foreground">N/A</div>
            </div>
          </div>

          {/* Violations */}
          {currentResult.violations.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-medium text-red-600">Violations Found</h5>
              {currentResult.violations.map((violation, index) => (
                <div key={index} className="border border-red-200 rounded-lg p-3 bg-red-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium uppercase',
                        getImpactColor(violation.impact)
                      )}>
                        {violation.impact}
                      </span>
                      <span className="font-medium">{violation.id}</span>
                    </div>
                    <a
                      href={violation.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Learn More
                    </a>
                  </div>
                  <p className="text-sm mb-2">{violation.description}</p>
                  <p className="text-sm text-muted-foreground mb-3">{violation.help}</p>
                  {violation.nodes.map((node, nodeIndex) => (
                    <div key={nodeIndex} className="bg-white p-2 rounded border text-xs font-mono">
                      <div className="text-red-600 mb-1">{node.failureSummary}</div>
                      <div className="text-gray-700">{node.html}</div>
                      <div className="text-gray-500 mt-1">Target: {node.target.join(', ')}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Test History */}
      {results.length > 1 && (
        <div className="bg-card p-4 rounded-lg border border-border">
          <h4 className="font-medium mb-3">Test History</h4>
          <div className="space-y-2">
            {results.slice(1, 6).map((result, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <span className="text-sm">{result.timestamp.toLocaleString()}</span>
                <div className="flex items-center space-x-2">
                  <span className={cn('font-medium', getScoreColor(result.score))}>
                    {result.score}/100
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {result.violations.length} violations
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}