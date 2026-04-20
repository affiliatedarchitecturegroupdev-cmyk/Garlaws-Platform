import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ScreenshotComparison {
  baseline: string;
  current: string;
  diff: string;
  status: 'pass' | 'fail' | 'new';
  component: string;
  viewport: string;
  timestamp: Date;
}

interface VisualRegressionTestProps {
  componentName: string;
  onScreenshot?: (data: ScreenshotComparison) => void;
  className?: string;
}

export function VisualRegressionTest({
  componentName,
  onScreenshot,
  className,
}: VisualRegressionTestProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<ScreenshotComparison[]>([]);
  const [currentViewport, setCurrentViewport] = useState('desktop');

  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
  };

  const captureScreenshot = useCallback(async (viewport: keyof typeof viewports) => {
    // In a real implementation, this would use a library like puppeteer or playwright
    // For now, we'll simulate the capture
    return new Promise<string>((resolve) => {
      // Simulate screenshot capture
      setTimeout(() => {
        const mockScreenshot = `data:image/png;base64,${btoa(`mock-screenshot-${viewport}-${Date.now()}`)}`;
        resolve(mockScreenshot);
      }, 1000);
    });
  }, []);

  const compareScreenshots = useCallback(async (baseline: string, current: string) => {
    // In a real implementation, this would use pixel-by-pixel comparison
    // For now, we'll simulate comparison
    return new Promise<{ diff: string; status: 'pass' | 'fail' | 'new' }>((resolve) => {
      setTimeout(() => {
        const status = Math.random() > 0.8 ? 'fail' : 'pass';
        const diff = status === 'fail'
          ? `data:image/png;base64,${btoa(`diff-screenshot-${Date.now()}`)}`
          : '';
        resolve({ diff, status });
      }, 500);
    });
  }, []);

  const runVisualTest = useCallback(async (viewport: keyof typeof viewports) => {
    setIsTesting(true);

    try {
      // Capture current screenshot
      const currentScreenshot = await captureScreenshot(viewport);

      // Load baseline (in real implementation, this would be from a stored baseline)
      const baselineScreenshot = localStorage.getItem(`baseline-${componentName}-${viewport}`);

      let status: 'pass' | 'fail' | 'new' = 'new';
      let diffScreenshot = '';

      if (baselineScreenshot) {
        const comparison = await compareScreenshots(baselineScreenshot, currentScreenshot);
        status = comparison.status;
        diffScreenshot = comparison.diff;
      } else {
        // Save as new baseline
        localStorage.setItem(`baseline-${componentName}-${viewport}`, currentScreenshot);
      }

      const result: ScreenshotComparison = {
        baseline: baselineScreenshot || '',
        current: currentScreenshot,
        diff: diffScreenshot,
        status,
        component: componentName,
        viewport,
        timestamp: new Date(),
      };

      setResults(prev => [...prev, result]);
      onScreenshot?.(result);

    } catch (error) {
      console.error('Visual regression test failed:', error);
    } finally {
      setIsTesting(false);
    }
  }, [componentName, captureScreenshot, compareScreenshots, onScreenshot]);

  const runAllViewports = useCallback(async () => {
    for (const viewport of Object.keys(viewports) as Array<keyof typeof viewports>) {
      await runVisualTest(viewport);
    }
  }, [runVisualTest]);

  const updateBaseline = useCallback((viewport: keyof typeof viewports) => {
    const latestResult = results.find(r => r.viewport === viewport);
    if (latestResult) {
      localStorage.setItem(`baseline-${componentName}-${viewport}`, latestResult.current);
      setResults(prev => prev.map(r =>
        r.viewport === viewport ? { ...r, status: 'pass', diff: '' } : r
      ));
    }
  }, [componentName, results]);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Visual Regression Testing</h3>
        <div className="flex items-center space-x-2">
          <select
            value={currentViewport}
            onChange={(e) => setCurrentViewport(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          >
            {Object.keys(viewports).map(viewport => (
              <option key={viewport} value={viewport}>{viewport}</option>
            ))}
          </select>
          <button
            onClick={() => runVisualTest(currentViewport as keyof typeof viewports)}
            disabled={isTesting}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 disabled:opacity-50"
          >
            {isTesting ? 'Testing...' : 'Test Viewport'}
          </button>
          <button
            onClick={runAllViewports}
            disabled={isTesting}
            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 disabled:opacity-50"
          >
            Test All
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {results.map((result, index) => (
          <div key={index} className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  {
                    'bg-green-500': result.status === 'pass',
                    'bg-red-500': result.status === 'fail',
                    'bg-blue-500': result.status === 'new',
                  }
                )} />
                <span className="font-medium">{result.component}</span>
                <span className="text-sm text-muted-foreground">{result.viewport}</span>
                <span className="text-xs text-muted-foreground">
                  {result.timestamp.toLocaleTimeString()}
                </span>
              </div>
              {result.status === 'fail' && (
                <button
                  onClick={() => updateBaseline(result.viewport as keyof typeof viewports)}
                  className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                >
                  Update Baseline
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {result.baseline && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Baseline</div>
                  <img src={result.baseline} alt="Baseline" className="w-full h-20 object-cover border rounded" />
                </div>
              )}
              <div>
                <div className="text-xs text-muted-foreground mb-1">Current</div>
                <img src={result.current} alt="Current" className="w-full h-20 object-cover border rounded" />
              </div>
              {result.diff && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Diff</div>
                  <img src={result.diff} alt="Diff" className="w-full h-20 object-cover border rounded" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}