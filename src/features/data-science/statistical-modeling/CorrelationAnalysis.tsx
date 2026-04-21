"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CorrelationAnalysisProps {
  data?: any[];
  onComplete?: (results: any) => void;
}

const CorrelationAnalysis: React.FC<CorrelationAnalysisProps> = ({
  data = [],
  onComplete
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>({});

  // Calculate correlations
  const correlations = useMemo(() => {
    if (!data.length) return {};

    const numericColumns = Object.keys(data[0] || {}).filter(key =>
      typeof data[0][key] === 'number' && !isNaN(data[0][key])
    );

    const correlationMatrix: any = {};

    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];

        const values1 = data.map(row => parseFloat(row[col1])).filter(val => !isNaN(val));
        const values2 = data.map(row => parseFloat(row[col2])).filter(val => !isNaN(val));

        if (values1.length === values2.length && values1.length > 1) {
          const correlation = calculatePearsonCorrelation(values1, values2);
          const key = `${col1}_${col2}`;

          correlationMatrix[key] = {
            variables: [col1, col2],
            correlation: correlation,
            strength: Math.abs(correlation) > 0.7 ? 'Strong' :
                     Math.abs(correlation) > 0.3 ? 'Moderate' : 'Weak',
            direction: correlation > 0 ? 'Positive' :
                      correlation < 0 ? 'Negative' : 'None',
            significance: calculateCorrelationSignificance(correlation, values1.length),
            pValue: calculatePValue(correlation, values1.length)
          };
        }
      }
    }

    return correlationMatrix;
  }, [data]);

  const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
    if (x.length !== y.length) return 0;

    const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
    const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;

    let numerator = 0;
    let sumXX = 0;
    let sumYY = 0;

    for (let i = 0; i < x.length; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      sumXX += dx * dx;
      sumYY += dy * dy;
    }

    const denominator = Math.sqrt(sumXX * sumYY);
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const calculatePValue = (correlation: number, n: number): number => {
    // Simplified p-value calculation using t-distribution approximation
    const t = Math.abs(correlation) * Math.sqrt((n - 2) / (1 - correlation * correlation));
    // Approximate p-value (this is simplified)
    return Math.max(0.0001, 2 * (1 - Math.min(0.5, Math.abs(t) / 3)));
  };

  const calculateCorrelationSignificance = (correlation: number, n: number): string => {
    const pValue = calculatePValue(correlation, n);
    return pValue < 0.05 ? 'Significant' : 'Not significant';
  };

  const runCorrelationAnalysis = async () => {
    setIsRunning(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const analysisResults = {
        correlationMatrix: correlations,
        summary: {
          totalCorrelations: Object.keys(correlations).length,
          strongCorrelations: Object.values(correlations).filter((c: any) => c.strength === 'Strong').length,
          significantCorrelations: Object.values(correlations).filter((c: any) => c.significance === 'Significant').length,
          positiveCorrelations: Object.values(correlations).filter((c: any) => c.direction === 'Positive').length,
          negativeCorrelations: Object.values(correlations).filter((c: any) => c.direction === 'Negative').length
        },
        timestamp: new Date().toISOString()
      };

      setResults(analysisResults);
      if (onComplete) {
        onComplete(analysisResults);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const getCorrelationIcon = (direction: string) => {
    switch (direction) {
      case 'Positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'Negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Strong':
        return 'bg-green-100 text-green-800';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Correlation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={runCorrelationAnalysis}
            disabled={isRunning || !data.length}
            className="flex items-center gap-2 mb-4"
            variant="outline"
          >
            <BarChart3 className="h-4 w-4" />
            {isRunning ? 'Analyzing...' : 'Run Correlation Analysis'}
          </Button>

          {isRunning && (
            <div className="mb-4">
              <Progress value={75} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                Calculating correlations...
              </p>
            </div>
          )}

          {!data.length && (
            <Alert>
              <AlertDescription>
                No data available for correlation analysis. Please provide a dataset to begin.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {results.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Correlation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{results.summary.totalCorrelations}</p>
                <p className="text-sm text-muted-foreground">Total Correlations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{results.summary.strongCorrelations}</p>
                <p className="text-sm text-muted-foreground">Strong</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{results.summary.significantCorrelations}</p>
                <p className="text-sm text-muted-foreground">Significant</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{results.summary.positiveCorrelations}</p>
                <p className="text-sm text-muted-foreground">Positive</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{results.summary.negativeCorrelations}</p>
                <p className="text-sm text-muted-foreground">Negative</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Correlation Matrix */}
      {results.correlationMatrix && Object.keys(results.correlationMatrix).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Correlation Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(results.correlationMatrix).map(([key, correlation]: [string, any]) => (
                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getCorrelationIcon(correlation.direction)}
                    <div>
                      <p className="font-medium">
                        {correlation.variables[0]} ↔ {correlation.variables[1]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        r = {correlation.correlation.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getStrengthColor(correlation.strength)}>
                      {correlation.strength}
                    </Badge>
                    <Badge variant={correlation.significance === 'Significant' ? 'success' : 'secondary'}>
                      {correlation.significance}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium">{correlation.direction}</p>
                      <p className="text-xs text-muted-foreground">p = {correlation.pValue.toFixed(4)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Correlations from useMemo */}
      {Object.keys(correlations).length > 0 && !results.correlationMatrix && (
        <Card>
          <CardHeader>
            <CardTitle>Live Correlation Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(correlations).slice(0, 5).map(([key, correlation]: [string, any]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-sm">{correlation.variables[0]} vs {correlation.variables[1]}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{correlation.correlation.toFixed(3)}</span>
                    <Badge variant="outline" className="text-xs">
                      {correlation.strength}
                    </Badge>
                  </div>
                </div>
              ))}
              {Object.keys(correlations).length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  ... and {Object.keys(correlations).length - 5} more correlations
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CorrelationAnalysis;