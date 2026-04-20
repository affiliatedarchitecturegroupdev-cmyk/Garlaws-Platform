import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface BrowserTest {
  browser: string;
  version: string;
  platform: string;
  userAgent: string;
  features: Record<string, boolean>;
  issues: string[];
  score: number;
}

interface CrossBrowserTestResult {
  tests: BrowserTest[];
  overallScore: number;
  compatibilityIssues: string[];
  recommendations: string[];
}

interface CrossBrowserTesterProps {
  onResult?: (result: CrossBrowserTestResult) => void;
  className?: string;
}

export function CrossBrowserTester({ onResult, className }: CrossBrowserTesterProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [currentResult, setCurrentResult] = useState<CrossBrowserTestResult | null>(null);

  const detectBrowser = useCallback(() => {
    const ua = navigator.userAgent;
    const platform = navigator.platform;

    // Browser detection logic
    const browsers = [
      { name: 'Chrome', regex: /Chrome\/(\d+)/ },
      { name: 'Firefox', regex: /Firefox\/(\d+)/ },
      { name: 'Safari', regex: /Safari\/(\d+)/ },
      { name: 'Edge', regex: /Edg\/(\d+)/ },
      { name: 'Opera', regex: /OPR\/(\d+)/ },
      { name: 'IE', regex: /MSIE (\d+)/ },
    ];

    let detectedBrowser = 'Unknown';
    let version = 'Unknown';

    for (const browser of browsers) {
      const match = ua.match(browser.regex);
      if (match) {
        detectedBrowser = browser.name;
        version = match[1];
        break;
      }
    }

    return { browser: detectedBrowser, version, platform, userAgent: ua };
  }, []);

  const testBrowserFeatures = useCallback(() => {
    const features: Record<string, boolean> = {
      // CSS Features
      cssGrid: CSS.supports('display', 'grid'),
      cssFlexbox: CSS.supports('display', 'flex'),
      cssCustomProperties: CSS.supports('--test', 'value'),
      cssAnimations: typeof document.body.style.animation !== 'undefined',

      // JavaScript Features
      es6: typeof Symbol !== 'undefined' && typeof Promise !== 'undefined',
      asyncAwait: typeof async function() {}.constructor === 'function',
      fetch: typeof fetch !== 'undefined',
      webgl: (() => {
        try {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch {
          return false;
        }
      })(),

      // HTML5 Features
      canvas: typeof document.createElement('canvas').getContext === 'function',
      svg: typeof document.createElementNS === 'function',
      video: typeof document.createElement('video').canPlayType === 'function',
      audio: typeof document.createElement('audio').canPlayType === 'function',

      // Storage
      localStorage: (() => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch {
          return false;
        }
      })(),
      sessionStorage: (() => {
        try {
          sessionStorage.setItem('test', 'test');
          sessionStorage.removeItem('test');
          return true;
        } catch {
          return false;
        }
      })(),

      // APIs
      geolocation: typeof navigator.geolocation !== 'undefined',
      webworkers: typeof Worker !== 'undefined',
      websockets: typeof WebSocket !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,

      // Touch
      touch: 'ontouchstart' in window,
      pointer: typeof window.PointerEvent !== 'undefined',
    };

    return features;
  }, []);

  const analyzeCompatibility = useCallback((browser: string, version: string, features: Record<string, boolean>) => {
    const issues: string[] = [];
    let score = 100;

    // Browser-specific checks
    const versionNum = parseInt(version);

    switch (browser) {
      case 'Chrome':
        if (versionNum < 90) {
          issues.push('Chrome version too old - update recommended');
          score -= 20;
        }
        break;
      case 'Firefox':
        if (versionNum < 88) {
          issues.push('Firefox version too old - update recommended');
          score -= 20;
        }
        break;
      case 'Safari':
        if (versionNum < 14) {
          issues.push('Safari version too old - update recommended');
          score -= 20;
        }
        break;
      case 'Edge':
        if (versionNum < 90) {
          issues.push('Edge version too old - update recommended');
          score -= 20;
        }
        break;
      case 'IE':
        issues.push('Internet Explorer is deprecated - migrate to modern browser');
        score -= 50;
        break;
    }

    // Feature checks
    const criticalFeatures = ['es6', 'fetch', 'cssGrid', 'cssFlexbox'];
    criticalFeatures.forEach(feature => {
      if (!features[feature]) {
        issues.push(`Critical feature '${feature}' not supported`);
        score -= 15;
      }
    });

    const importantFeatures = ['webgl', 'localStorage', 'canvas'];
    importantFeatures.forEach(feature => {
      if (!features[feature]) {
        issues.push(`Important feature '${feature}' not supported`);
        score -= 5;
      }
    });

    return { issues, score: Math.max(0, score) };
  }, []);

  const runCrossBrowserTest = useCallback(async () => {
    setIsTesting(true);

    try {
      const { browser, version, platform, userAgent } = detectBrowser();
      const features = testBrowserFeatures();
      const { issues, score } = analyzeCompatibility(browser, version, features);

      const currentBrowserTest: BrowserTest = {
        browser,
        version,
        platform,
        userAgent,
        features,
        issues,
        score,
      };

      // Mock tests for other browsers (in real implementation, this would run on multiple browsers)
      const mockTests: BrowserTest[] = [
        currentBrowserTest,
        {
          browser: 'Chrome',
          version: '120.0',
          platform: 'MacIntel',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          features: { ...features, es6: true, fetch: true },
          issues: [],
          score: 100,
        },
        {
          browser: 'Firefox',
          version: '119.0',
          platform: 'MacIntel',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:119.0) Gecko/20100101 Firefox/119.0',
          features: { ...features },
          issues: ['WebGL performance may be slower'],
          score: 95,
        },
        {
          browser: 'Safari',
          version: '17.0',
          platform: 'MacIntel',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
          features: { ...features },
          issues: [],
          score: 100,
        },
      ];

      const overallScore = Math.round(mockTests.reduce((sum, test) => sum + test.score, 0) / mockTests.length);

      const compatibilityIssues = mockTests.flatMap(test => test.issues);
      const uniqueIssues = Array.from(new Set(compatibilityIssues));

      const recommendations = [];
      if (uniqueIssues.length > 0) {
        recommendations.push('Consider using CSS feature queries and JavaScript polyfills');
        recommendations.push('Test on target browsers before deployment');
        recommendations.push('Implement progressive enhancement strategies');
      }

      const result: CrossBrowserTestResult = {
        tests: mockTests,
        overallScore,
        compatibilityIssues: uniqueIssues,
        recommendations,
      };

      setCurrentResult(result);
      onResult?.(result);
    } catch (error) {
      console.error('Cross-browser test failed:', error);
    } finally {
      setIsTesting(false);
    }
  }, [detectBrowser, testBrowserFeatures, analyzeCompatibility, onResult]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFeatureStatus = (supported: boolean) => (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
      supported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    )}>
      {supported ? '✓' : '✗'}
    </span>
  );

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cross-Browser Testing</h3>
        <button
          onClick={runCrossBrowserTest}
          disabled={isTesting}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Run Tests'}
        </button>
      </div>

      {/* Current Results */}
      {currentResult && (
        <div className="space-y-4">
          {/* Overall Score */}
          <div className="bg-card p-4 rounded-lg border border-border text-center">
            <div className={cn('text-3xl font-bold', getScoreColor(currentResult.overallScore))}>
              {currentResult.overallScore}/100
            </div>
            <div className="text-sm text-muted-foreground">Overall Compatibility Score</div>
          </div>

          {/* Browser Tests */}
          <div className="space-y-3">
            {currentResult.tests.map((test, index) => (
              <div key={index} className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{test.browser} {test.version}</h4>
                    <p className="text-sm text-muted-foreground">{test.platform}</p>
                  </div>
                  <span className={cn('text-lg font-bold', getScoreColor(test.score))}>
                    {test.score}/100
                  </span>
                </div>

                {/* Feature Matrix */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  {Object.entries(test.features).map(([feature, supported]) => (
                    <div key={feature} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                      {getFeatureStatus(supported)}
                    </div>
                  ))}
                </div>

                {/* Issues */}
                {test.issues.length > 0 && (
                  <div className="space-y-1">
                    <h5 className="text-sm font-medium text-red-600">Issues:</h5>
                    {test.issues.map((issue, issueIndex) => (
                      <div key={issueIndex} className="text-sm bg-red-50 p-2 rounded">
                        {issue}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Recommendations */}
          {currentResult.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Recommendations</h4>
              <ul className="list-disc list-inside space-y-1">
                {currentResult.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-blue-700">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}