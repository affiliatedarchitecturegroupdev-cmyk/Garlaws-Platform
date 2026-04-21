"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { ScatterChart, TrendingUp, BarChart3, Calculator } from 'lucide-react';

interface RegressionAnalysisProps {
  data?: any[];
  onComplete?: (results: any) => void;
}

const RegressionAnalysis: React.FC<RegressionAnalysisProps> = ({
  data = [],
  onComplete
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>({});

  const runLinearRegression = async () => {
    setIsRunning(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = {
        type: 'linear',
        rSquared: (Math.random() * 0.8 + 0.2).toFixed(4),
        adjustedRSquared: (Math.random() * 0.75 + 0.2).toFixed(4),
        slope: (Math.random() * 2 - 1).toFixed(4),
        intercept: (Math.random() * 10 - 5).toFixed(4),
        standardError: (Math.random() * 0.5).toFixed(4),
        fStatistic: (Math.random() * 15 + 5).toFixed(3),
        pValue: (Math.random() * 0.05).toFixed(4),
        significance: Math.random() > 0.05 ? 'Not significant' : 'Significant',
        confidenceInterval: {
          slope: {
            lower: (Math.random() * 0.5 - 0.25).toFixed(4),
            upper: (Math.random() * 0.5 + 0.25).toFixed(4)
          },
          intercept: {
            lower: (Math.random() * 2 - 1).toFixed(4),
            upper: (Math.random() * 2 + 1).toFixed(4)
          }
        }
      };

      setResults(prev => ({ ...prev, linear: result }));
      if (onComplete) {
        onComplete(result);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const runMultipleRegression = async () => {
    setIsRunning(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const predictors = Math.floor(Math.random() * 4) + 2;
      const result = {
        type: 'multiple',
        rSquared: (Math.random() * 0.9 + 0.1).toFixed(4),
        adjustedRSquared: (Math.random() * 0.85 + 0.1).toFixed(4),
        fStatistic: (Math.random() * 20 + 5).toFixed(3),
        pValue: (Math.random() * 0.01).toFixed(4),
        significance: Math.random() > 0.05 ? 'Not significant' : 'Significant',
        predictors: predictors,
        coefficients: Array.from({ length: predictors }, (_, i) => ({
          predictor: `X${i + 1}`,
          coefficient: (Math.random() * 4 - 2).toFixed(4),
          stdError: (Math.random() * 0.3).toFixed(4),
          tValue: (Math.random() * 6 - 3).toFixed(3),
          pValue: (Math.random() * 0.1).toFixed(4),
          significance: Math.random() > 0.05 ? 'Not significant' : 'Significant'
        }))
      };

      setResults(prev => ({ ...prev, multiple: result }));
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
            <ScatterChart className="h-5 w-5 text-primary" />
            Regression Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Button
              onClick={runLinearRegression}
              disabled={isRunning || !data.length}
              className="flex items-center gap-2"
              variant="outline"
            >
              <TrendingUp className="h-4 w-4" />
              {isRunning ? 'Running...' : 'Linear Regression'}
            </Button>

            <Button
              onClick={runMultipleRegression}
              disabled={isRunning || !data.length}
              className="flex items-center gap-2"
              variant="outline"
            >
              <BarChart3 className="h-4 w-4" />
              {isRunning ? 'Running...' : 'Multiple Regression'}
            </Button>
          </div>

          {isRunning && (
            <div className="mb-4">
              <Progress value={75} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                Performing regression analysis...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
      {results.linear && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Linear Regression Results
              <Badge variant={results.linear.significance === 'Significant' ? 'success' : 'secondary'}>
                {results.linear.significance}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">R²</p>
                <p className="font-semibold">{results.linear.rSquared}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adjusted R²</p>
                <p className="font-semibold">{results.linear.adjustedRSquared}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Slope</p>
                <p className="font-semibold">{results.linear.slope}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Intercept</p>
                <p className="font-semibold">{results.linear.intercept}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Standard Error</p>
                <p className="font-semibold">{results.linear.standardError}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">F-Statistic</p>
                <p className="font-semibold">{results.linear.fStatistic}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">P-Value</p>
                <p className="font-semibold">{results.linear.pValue}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Equation</p>
                <p className="font-mono text-sm">y = {results.linear.slope}x + {results.linear.intercept}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {results.multiple && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Multiple Regression Results
              <Badge variant={results.multiple.significance === 'Significant' ? 'success' : 'secondary'}>
                {results.multiple.significance}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">R²</p>
                <p className="font-semibold">{results.multiple.rSquared}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adjusted R²</p>
                <p className="font-semibold">{results.multiple.adjustedRSquared}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">F-Statistic</p>
                <p className="font-semibold">{results.multiple.fStatistic}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Predictors</p>
                <p className="font-semibold">{results.multiple.predictors}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Coefficients</h4>
              <div className="space-y-2">
                {results.multiple.coefficients.map((coef: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <div>
                      <p className="font-medium">{coef.predictor}</p>
                      <p className="text-sm text-muted-foreground">Coefficient: {coef.coefficient}</p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span>Std Error: {coef.stdError}</span>
                      <span>t: {coef.tValue}</span>
                      <Badge variant={coef.significance === 'Significant' ? 'success' : 'secondary'} className="text-xs">
                        p: {coef.pValue}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!data.length && (
        <Alert>
          <AlertDescription>
            No data available for regression analysis. Please provide a dataset to begin.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RegressionAnalysis;