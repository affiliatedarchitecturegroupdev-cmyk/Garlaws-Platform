"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { TestTube, TrendingUp, BarChart3, CheckCircle, XCircle } from 'lucide-react';

interface HypothesisTestingProps {
  data?: any[];
  onComplete?: (results: any) => void;
}

const HypothesisTesting: React.FC<HypothesisTestingProps> = ({
  data = [],
  onComplete
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>({});

  const runTTest = async () => {
    setIsRunning(true);
    try {
      // Simulate t-test calculation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = {
        test: 't-test',
        statistic: (Math.random() * 4 - 2).toFixed(3),
        pValue: (Math.random() * 0.1).toFixed(4),
        degreesOfFreedom: data.length - 2,
        confidenceInterval: {
          lower: (-Math.random() * 2 - 1).toFixed(3),
          upper: (Math.random() * 2 + 1).toFixed(3)
        },
        significance: Math.random() > 0.05 ? 'Not significant' : 'Significant',
        effectSize: (Math.random() * 2).toFixed(3),
        power: (Math.random() * 0.8 + 0.2).toFixed(3)
      };

      setResults(prev => ({ ...prev, tTest: result }));
      if (onComplete) {
        onComplete(result);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const runChiSquareTest = async () => {
    setIsRunning(true);
    try {
      // Simulate chi-square test calculation
      await new Promise(resolve => setTimeout(resolve, 1200));

      const result = {
        test: 'chi-square',
        statistic: (Math.random() * 20 + 5).toFixed(3),
        pValue: (Math.random() * 0.05).toFixed(4),
        degreesOfFreedom: Math.floor(Math.random() * 10) + 1,
        expectedFrequencies: Array.from({ length: 4 }, () => Math.floor(Math.random() * 50) + 10),
        observedFrequencies: Array.from({ length: 4 }, () => Math.floor(Math.random() * 50) + 10),
        significance: Math.random() > 0.05 ? 'Not significant' : 'Significant',
        cramersV: (Math.random() * 0.8).toFixed(3)
      };

      setResults(prev => ({ ...prev, chiSquare: result }));
      if (onComplete) {
        onComplete(result);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const runAnovaTest = async () => {
    setIsRunning(true);
    try {
      // Simulate ANOVA test calculation
      await new Promise(resolve => setTimeout(resolve, 1800));

      const groups = Math.floor(Math.random() * 4) + 2;
      const result = {
        test: 'anova',
        fStatistic: (Math.random() * 10 + 1).toFixed(3),
        pValue: (Math.random() * 0.01).toFixed(4),
        degreesOfFreedom: {
          between: groups - 1,
          within: data.length - groups
        },
        sumOfSquares: {
          between: (Math.random() * 1000).toFixed(2),
          within: (Math.random() * 500).toFixed(2),
          total: (Math.random() * 1500).toFixed(2)
        },
        significance: Math.random() > 0.05 ? 'Not significant' : 'Significant',
        etaSquared: (Math.random() * 0.6).toFixed(3),
        groups: groups
      };

      setResults(prev => ({ ...prev, anova: result }));
      if (onComplete) {
        onComplete(result);
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-primary" />
            Hypothesis Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button
              onClick={runTTest}
              disabled={isRunning || !data.length}
              className="flex items-center gap-2"
              variant="outline"
            >
              <TrendingUp className="h-4 w-4" />
              {isRunning ? 'Running...' : 'T-Test'}
            </Button>

            <Button
              onClick={runChiSquareTest}
              disabled={isRunning || !data.length}
              className="flex items-center gap-2"
              variant="outline"
            >
              <BarChart3 className="h-4 w-4" />
              {isRunning ? 'Running...' : 'Chi-Square Test'}
            </Button>

            <Button
              onClick={runAnovaTest}
              disabled={isRunning || !data.length}
              className="flex items-center gap-2"
              variant="outline"
            >
              <CheckCircle className="h-4 w-4" />
              {isRunning ? 'Running...' : 'ANOVA Test'}
            </Button>
          </div>

          {isRunning && (
            <div className="mb-4">
              <Progress value={75} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                Performing hypothesis test...
              </p>
            </div>
          )}

          {!data.length && (
            <Alert>
              <AlertDescription>
                No data available for hypothesis testing. Please provide a dataset to begin.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
      <div className="space-y-4">
        {results.tTest && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                T-Test Results
                <Badge variant={results.tTest.significance === 'Significant' ? 'success' : 'secondary'}>
                  {results.tTest.significance}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">T-Statistic</p>
                  <p className="font-semibold">{results.tTest.statistic}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">P-Value</p>
                  <p className="font-semibold">{results.tTest.pValue}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Degrees of Freedom</p>
                  <p className="font-semibold">{results.tTest.degreesOfFreedom}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Effect Size</p>
                  <p className="font-semibold">{results.tTest.effectSize}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">95% Confidence Interval</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">[{results.tTest.confidenceInterval.lower}, {results.tTest.confidenceInterval.upper}]</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {results.chiSquare && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Chi-Square Test Results
                <Badge variant={results.chiSquare.significance === 'Significant' ? 'success' : 'secondary'}>
                  {results.chiSquare.significance}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Chi-Square</p>
                  <p className="font-semibold">{results.chiSquare.statistic}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">P-Value</p>
                  <p className="font-semibold">{results.chiSquare.pValue}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Degrees of Freedom</p>
                  <p className="font-semibold">{results.chiSquare.degreesOfFreedom}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cramér's V</p>
                  <p className="font-semibold">{results.chiSquare.cramersV}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Contingency Table</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Observed:</p>
                    <p className="font-mono">{results.chiSquare.observedFrequencies.join(', ')}</p>
                  </div>
                  <div>
                    <p className="font-medium">Expected:</p>
                    <p className="font-mono">{results.chiSquare.expectedFrequencies.join(', ')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {results.anova && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                ANOVA Test Results
                <Badge variant={results.anova.significance === 'Significant' ? 'success' : 'secondary'}>
                  {results.anova.significance}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">F-Statistic</p>
                  <p className="font-semibold">{results.anova.fStatistic}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">P-Value</p>
                  <p className="font-semibold">{results.anova.pValue}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">η² (Effect Size)</p>
                  <p className="font-semibold">{results.anova.etaSquared}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Groups</p>
                  <p className="font-semibold">{results.anova.groups}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Degrees of Freedom</p>
                <div className="flex gap-4 text-sm">
                  <span>Between: {results.anova.degreesOfFreedom.between}</span>
                  <span>Within: {results.anova.degreesOfFreedom.within}</span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Sum of Squares</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Between</p>
                    <p className="font-mono">{results.anova.sumOfSquares.between}</p>
                  </div>
                  <div>
                    <p className="font-medium">Within</p>
                    <p className="font-mono">{results.anova.sumOfSquares.within}</p>
                  </div>
                  <div>
                    <p className="font-medium">Total</p>
                    <p className="font-mono">{results.anova.sumOfSquares.total}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HypothesisTesting;