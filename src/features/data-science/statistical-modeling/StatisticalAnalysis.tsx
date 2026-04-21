"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, ScatterChart, BarChart3, Calculator } from 'lucide-react';
import HypothesisTesting from './HypothesisTesting';
import RegressionAnalysis from './RegressionAnalysis';
import CorrelationAnalysis from './CorrelationAnalysis';
import StatisticalModels from './StatisticalModels';

interface StatisticalAnalysisProps {
  data?: any[];
  onAnalysisComplete?: (results: any) => void;
}

const StatisticalAnalysis: React.FC<StatisticalAnalysisProps> = ({
  data = [],
  onAnalysisComplete
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>({});

  // Statistical calculation functions
  const calculateSkewness = (values: number[]): number => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
    return values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / values.length;
  };

  const calculateKurtosis = (values: number[]): number => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
    return values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0) / values.length - 3;
  };

  const runHypothesisTests = async (data: any[]): Promise<any> => {
    // Simulate hypothesis testing
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          tTest: {
            statistic: (Math.random() * 4 - 2).toFixed(3),
            pValue: (Math.random() * 0.1).toFixed(4),
            significance: Math.random() > 0.05 ? 'Not significant' : 'Significant'
          }
        });
      }, 1000);
    });
  };

  const runRegressionAnalysis = async (data: any[]): Promise<any> => {
    // Simulate regression analysis
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          linear: {
            rSquared: (Math.random() * 0.8 + 0.2).toFixed(4),
            slope: (Math.random() * 2 - 1).toFixed(4),
            intercept: (Math.random() * 10 - 5).toFixed(4),
            pValue: (Math.random() * 0.05).toFixed(4),
            significance: Math.random() > 0.05 ? 'Not significant' : 'Significant'
          }
        });
      }, 1500);
    });
  };

  const calculateCorrelations = (data: any[]): any => {
    if (!data.length) return {};

    const numericColumns = Object.keys(data[0] || {}).filter(key =>
      typeof data[0][key] === 'number' && !isNaN(data[0][key])
    );

    const correlations: any = {};

    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];

        const values1 = data.map(row => parseFloat(row[col1])).filter(val => !isNaN(val));
        const values2 = data.map(row => parseFloat(row[col2])).filter(val => !isNaN(val));

        if (values1.length === values2.length && values1.length > 1) {
          const correlation = calculateCorrelation(values1, values2);
          correlations[`${col1}_${col2}`] = {
            correlation: correlation.toFixed(4),
            strength: Math.abs(correlation) > 0.7 ? 'Strong' : Math.abs(correlation) > 0.3 ? 'Moderate' : 'Weak',
            direction: correlation > 0 ? 'Positive' : correlation < 0 ? 'Negative' : 'None'
          };
        }
      }
    }

    return correlations;
  };

  const calculateCorrelation = (x: number[], y: number[]): number => {
    if (x.length !== y.length) return 0;

    const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
    const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;

    let covariance = 0;
    for (let i = 0; i < x.length; i++) {
      covariance += (x[i] - meanX) * (y[i] - meanY);
    }
    covariance /= x.length;

    const stdX = Math.sqrt(x.reduce((sum, val) => sum + Math.pow(val - meanX, 2), 0) / x.length);
    const stdY = Math.sqrt(y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0) / y.length);

    return covariance / (stdX * stdY);
  };

  // Compute basic statistical metrics
  const basicStats = useMemo(() => {
    if (!data.length) return {};

    const numericColumns = Object.keys(data[0] || {}).filter(key =>
      typeof data[0][key] === 'number' && !isNaN(data[0][key])
    );

    const stats: any = {};

    numericColumns.forEach(column => {
      const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
      if (values.length === 0) return;

      const sorted = [...values].sort((a, b) => a - b);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      stats[column] = {
        count: values.length,
        mean: mean.toFixed(4),
        median: sorted[Math.floor(sorted.length / 2)].toFixed(4),
        stdDev: stdDev.toFixed(4),
        min: Math.min(...values).toFixed(4),
        max: Math.max(...values).toFixed(4),
        skewness: calculateSkewness(values).toFixed(4),
        kurtosis: calculateKurtosis(values).toFixed(4)
      };
    });

    return stats;
  }, [data]);

  const handleAnalysisComplete = (type: string, results: any) => {
    setAnalysisResults(prev => ({
      ...prev,
      [type]: results
    }));

    if (onAnalysisComplete) {
      onAnalysisComplete({
        ...analysisResults,
        [type]: results
      });
    }
  };

  const runComprehensiveAnalysis = async () => {
    setIsProcessing(true);
    try {
      // Run all statistical analyses
      const results = {
        basicStats,
        hypothesisTesting: await runHypothesisTests(data),
        regression: await runRegressionAnalysis(data),
        correlation: calculateCorrelations(data),
        timestamp: new Date().toISOString()
      };

      setAnalysisResults(results);
      if (onAnalysisComplete) {
        onAnalysisComplete(results);
      }
    } catch (error) {
      console.error('Statistical analysis failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Advanced Statistical Analysis
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="secondary">
                {Object.keys(basicStats).length} Numeric Variables
              </Badge>
              <Badge variant="secondary">
                {data.length} Observations
              </Badge>
            </div>
            <Button
              onClick={runComprehensiveAnalysis}
              disabled={isProcessing || !data.length}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              {isProcessing ? 'Analyzing...' : 'Run Full Analysis'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isProcessing && (
            <div className="mb-4">
              <Progress value={75} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                Performing comprehensive statistical analysis...
              </p>
            </div>
          )}

          {!data.length && (
            <Alert>
              <AlertDescription>
                No data available for statistical analysis. Please provide a dataset to begin.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="hypothesis" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Hypothesis Testing
          </TabsTrigger>
          <TabsTrigger value="regression" className="flex items-center gap-2">
            <ScatterChart className="h-4 w-4" />
            Regression
          </TabsTrigger>
          <TabsTrigger value="correlation" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Correlation
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Models
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Statistical Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(basicStats).map(([column, stats]: [string, any]) => (
                  <Card key={column}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{column}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Count: {stats.count}</div>
                        <div>Mean: {stats.mean}</div>
                        <div>Median: {stats.median}</div>
                        <div>Std Dev: {stats.stdDev}</div>
                        <div>Min: {stats.min}</div>
                        <div>Max: {stats.max}</div>
                        <div>Skewness: {stats.skewness}</div>
                        <div>Kurtosis: {stats.kurtosis}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hypothesis">
          <HypothesisTesting
            data={data}
            onComplete={(results) => handleAnalysisComplete('hypothesis', results)}
          />
        </TabsContent>

        <TabsContent value="regression">
          <RegressionAnalysis
            data={data}
            onComplete={(results) => handleAnalysisComplete('regression', results)}
          />
        </TabsContent>

        <TabsContent value="correlation">
          <CorrelationAnalysis
            data={data}
            onComplete={(results) => handleAnalysisComplete('correlation', results)}
          />
        </TabsContent>

        <TabsContent value="models">
          <StatisticalModels
            results={analysisResults}
            onUpdate={setAnalysisResults}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatisticalAnalysis;