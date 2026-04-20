import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface KeyboardNavigationEvent {
  type: 'keydown' | 'focus' | 'blur';
  key?: string;
  target: string;
  timestamp: Date;
  sequence: number;
}

interface KeyboardTestResult {
  totalElements: number;
  focusableElements: number;
  tabOrder: string[];
  missingLabels: string[];
  keyboardTraps: string[];
  events: KeyboardNavigationEvent[];
  score: number;
}

interface KeyboardNavigationTesterProps {
  container?: HTMLElement;
  onResult?: (result: KeyboardTestResult) => void;
  className?: string;
  autoRun?: boolean;
}

export function KeyboardNavigationTester({
  container,
  onResult,
  className,
  autoRun = false,
}: KeyboardNavigationTesterProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [currentResult, setCurrentResult] = useState<KeyboardTestResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const eventsRef = useRef<KeyboardNavigationEvent[]>([]);
  const sequenceRef = useRef(0);

  const getFocusableElements = useCallback((root: HTMLElement = document.body) => {
    const focusableSelectors = [
      'a[href]',
      'area[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ];

    return Array.from(root.querySelectorAll(focusableSelectors.join(',')))
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0; // Visible elements only
      });
  }, []);

  const checkAccessibility = useCallback((elements: HTMLElement[]) => {
    const missingLabels: string[] = [];
    const keyboardTraps: string[] = [];

    elements.forEach((el, index) => {
      // Check for missing labels
      const tagName = el.tagName.toLowerCase();
      const hasLabel = el.hasAttribute('aria-label') ||
                      el.hasAttribute('aria-labelledby') ||
                      el.getAttribute('title') ||
                      (tagName === 'input' && document.querySelector(`label[for="${el.id}"]`)) ||
                      (tagName === 'button' && el.textContent?.trim());

      if (!hasLabel) {
        missingLabels.push(`Element ${index + 1} (${tagName})`);
      }

      // Check for potential keyboard traps (elements that might trap focus)
      const role = el.getAttribute('role');
      if (role === 'dialog' || role === 'alertdialog') {
        const hasEscapeHandler = el.hasAttribute('data-escape-handler') ||
                                el.getAttribute('onkeydown')?.includes('Escape');
        if (!hasEscapeHandler) {
          keyboardTraps.push(`Dialog ${index + 1} missing Escape key handler`);
        }
      }
    });

    return { missingLabels, keyboardTraps };
  }, []);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    eventsRef.current = [];
    sequenceRef.current = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      eventsRef.current.push({
        type: 'keydown',
        key: e.key,
        target: (e.target as HTMLElement)?.tagName?.toLowerCase() || 'unknown',
        timestamp: new Date(),
        sequence: ++sequenceRef.current,
      });
    };

    const handleFocus = (e: FocusEvent) => {
      eventsRef.current.push({
        type: 'focus',
        target: (e.target as HTMLElement)?.tagName?.toLowerCase() || 'unknown',
        timestamp: new Date(),
        sequence: ++sequenceRef.current,
      });
    };

    const handleBlur = (e: FocusEvent) => {
      eventsRef.current.push({
        type: 'blur',
        target: (e.target as HTMLElement)?.tagName?.toLowerCase() || 'unknown',
        timestamp: new Date(),
        sequence: ++sequenceRef.current,
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  const runKeyboardTest = useCallback(async () => {
    setIsTesting(true);

    try {
      const testContainer = container || document.body;
      const focusableElements = getFocusableElements(testContainer);

      // Start recording events
      const stopRecording = startRecording();

      // Simulate Tab navigation
      const tabOrder: string[] = [];
      let currentElement = document.activeElement as HTMLElement;

      // Reset focus to beginning
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }

      // Wait for recording to capture events
      await new Promise(resolve => setTimeout(resolve, 1000));

      stopRecording();

      // Analyze results
      const { missingLabels, keyboardTraps } = checkAccessibility(focusableElements as HTMLElement[]);

      // Build tab order from events
      eventsRef.current.forEach(event => {
        if (event.type === 'focus' && !tabOrder.includes(event.target)) {
          tabOrder.push(event.target);
        }
      });

      // Calculate score
      const totalChecks = focusableElements.length * 3; // focusable, labeled, no traps
      const passedChecks = focusableElements.length - missingLabels.length - keyboardTraps.length;
      const score = Math.round((passedChecks / totalChecks) * 100);

      const result: KeyboardTestResult = {
        totalElements: focusableElements.length,
        focusableElements: focusableElements.length,
        tabOrder,
        missingLabels,
        keyboardTraps,
        events: eventsRef.current,
        score: Math.max(0, score),
      };

      setCurrentResult(result);
      onResult?.(result);
    } catch (error) {
      console.error('Keyboard navigation test failed:', error);
    } finally {
      setIsTesting(false);
      setIsRecording(false);
    }
  }, [container, getFocusableElements, checkAccessibility, startRecording, onResult]);

  useEffect(() => {
    if (autoRun) {
      runKeyboardTest();
    }
  }, [autoRun, runKeyboardTest]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Keyboard Navigation Testing</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={runKeyboardTest}
            disabled={isTesting}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 disabled:opacity-50"
          >
            {isTesting ? 'Testing...' : 'Run Test'}
          </button>
          {isRecording && (
            <span className="text-sm text-red-600 animate-pulse">Recording...</span>
          )}
        </div>
      </div>

      {/* Current Results */}
      {currentResult && (
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Test Results</h4>
            <span className={cn('text-lg font-bold', getScoreColor(currentResult.score))}>
              {currentResult.score}/100
            </span>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentResult.totalElements}</div>
              <div className="text-sm text-muted-foreground">Total Elements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{currentResult.focusableElements}</div>
              <div className="text-sm text-muted-foreground">Focusable</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{currentResult.missingLabels.length}</div>
              <div className="text-sm text-muted-foreground">Missing Labels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{currentResult.keyboardTraps.length}</div>
              <div className="text-sm text-muted-foreground">Keyboard Traps</div>
            </div>
          </div>

          {/* Tab Order */}
          <div className="mb-4">
            <h5 className="font-medium mb-2">Tab Order ({currentResult.tabOrder.length} elements)</h5>
            <div className="bg-muted p-3 rounded text-sm font-mono max-h-32 overflow-y-auto">
              {currentResult.tabOrder.length > 0 ? (
                currentResult.tabOrder.map((element, index) => (
                  <div key={index} className="mb-1">
                    {index + 1}. {element}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">No tab navigation detected</div>
              )}
            </div>
          </div>

          {/* Issues */}
          {(currentResult.missingLabels.length > 0 || currentResult.keyboardTraps.length > 0) && (
            <div className="space-y-3">
              <h5 className="font-medium text-red-600">Issues Found</h5>

              {currentResult.missingLabels.map((issue, index) => (
                <div key={`label-${index}`} className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                  <span className="font-medium">Missing Label:</span> {issue}
                </div>
              ))}

              {currentResult.keyboardTraps.map((issue, index) => (
                <div key={`trap-${index}`} className="bg-orange-50 border border-orange-200 rounded p-2 text-sm">
                  <span className="font-medium">Keyboard Trap:</span> {issue}
                </div>
              ))}
            </div>
          )}

          {/* Event Log */}
          <div className="mt-4">
            <h5 className="font-medium mb-2">Event Log ({currentResult.events.length} events)</h5>
            <div className="bg-muted p-3 rounded text-xs font-mono max-h-32 overflow-y-auto">
              {currentResult.events.slice(-20).map((event, index) => (
                <div key={index} className="mb-1">
                  {event.sequence}. [{event.type}] {event.key ? `${event.key} on ` : ''}{event.target}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}