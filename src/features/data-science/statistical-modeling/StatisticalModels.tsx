"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, ScatterChart, BarChart3, Brain } from 'lucide-react';

interface StatisticalModelsProps {
  results?: any;
  onUpdate?: (results: any) => void;
}

const StatisticalModels: React.FC<StatisticalModelsProps> = ({
  results = {},
  onUpdate
}) => {
  const [activeModel, setActiveModel] = useState('overview');

  // Core statistical calculation functions
  const calculateMean = (values: number[]): number => {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  const calculateVariance = (values: number[], mean?: number): number => {
    const avg = mean ?? calculateMean(values);
    return values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  };

  const calculateStandardDeviation = (values: number[]): number => {
    return Math.sqrt(calculateVariance(values));
  };

  const calculateSkewness = (values: number[]): number => {
    const mean = calculateMean(values);
    const std = calculateStandardDeviation(values);
    const n = values.length;

    const skewness = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / n;
    return skewness;
  };

  const calculateKurtosis = (values: number[]): number => {
    const mean = calculateMean(values);
    const std = calculateStandardDeviation(values);
    const n = values.length;

    const kurtosis = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0) / n - 3;
    return kurtosis;
  };

  const calculateCorrelation = (x: number[], y: number[]): number => {
    if (x.length !== y.length) return 0;

    const meanX = calculateMean(x);
    const meanY = calculateMean(y);
    const stdX = calculateStandardDeviation(x);
    const stdY = calculateStandardDeviation(y);

    let covariance = 0;
    for (let i = 0; i < x.length; i++) {
      covariance += (x[i] - meanX) * (y[i] - meanY);
    }
    covariance /= x.length;

    return covariance / (stdX * stdY);
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

  const runHypothesisTests = async (data: any[]): Promise<any> => {
    // Simulate hypothesis testing (t-test, chi-square, etc.)
    return new Promise(resolve => {
      setTimeout(() => {
        const tests = {
          tTest: {
            statistic: (Math.random() * 4 - 2).toFixed(3),
            pValue: (Math.random() * 0.1).toFixed(4),
            significance: Math.random() > 0.05 ? 'Not significant' : 'Significant',
            confidence: '95%'
          },
          chiSquare: {
            statistic: (Math.random() * 20 + 5).toFixed(3),
            pValue: (Math.random() * 0.05).toFixed(4),
            degreesOfFreedom: Math.floor(Math.random() * 10) + 1,
            significance: Math.random() > 0.05 ? 'Not significant' : 'Significant'
          },
          anova: {
            fStatistic: (Math.random() * 10 + 1).toFixed(3),
            pValue: (Math.random() * 0.01).toFixed(4),
            significance: Math.random() > 0.05 ? 'Not significant' : 'Significant',
            groups: Math.floor(Math.random() * 5) + 2
          }
        };
        resolve(tests);
      }, 1000);
    });
  };

  const runRegressionAnalysis = async (data: any[]): Promise<any> => {
    // Simulate regression analysis
    return new Promise(resolve => {
      setTimeout(() => {
        const regression = {
          linear: {
            rSquared: (Math.random() * 0.8 + 0.2).toFixed(4),
            slope: (Math.random() * 2 - 1).toFixed(4),
            intercept: (Math.random() * 10 - 5).toFixed(4),
            pValue: (Math.random() * 0.05).toFixed(4),
            significance: Math.random() > 0.05 ? 'Not significant' : 'Significant'
          },
          multiple: {
            rSquared: (Math.random() * 0.9 + 0.1).toFixed(4),
            adjustedRSquared: (Math.random() * 0.85 + 0.1).toFixed(4),
            fStatistic: (Math.random() * 15 + 5).toFixed(3),
            predictors: Math.floor(Math.random() * 5) + 2,
            coefficients: Array.from({ length: Math.floor(Math.random() * 5) + 2 }, () => ({
              value: (Math.random() * 4 - 2).toFixed(4),
              stdError: (Math.random() * 0.5).toFixed(4),
              tValue: (Math.random() * 6 - 3).toFixed(3),
              pValue: (Math.random() * 0.1).toFixed(4)
            }))
          }
        };
        resolve(regression);
      }, 1500);
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Statistical Models & Algorithms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeModel} onValueChange={setActiveModel}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="hypothesis">Hypothesis Tests</TabsTrigger>
              <TabsTrigger value="regression">Regression</TabsTrigger>
              <TabsTrigger value="correlation">Correlations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Statistical Tests</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {results.hypothesisTesting ? '3' : '0'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <ScatterChart className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Regression Models</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {results.regression ? '2' : '0'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Correlations</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {results.correlation ? Object.keys(results.correlation).length : '0'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Model Accuracy</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {results.regression?.linear?.rSquared || '0.00'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="hypothesis" className="space-y-4">
              {results.hypothesisTesting ? (
                <div className="space-y-4">
                  {Object.entries(results.hypothesisTesting).map(([test, data]: [string, any]) => (
                    <Card key={test}>
                      <CardHeader>
                        <CardTitle className="capitalize">{test.replace(/([A-Z])/g, ' $1')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Statistic</p>
                            <p className="font-semibold">{data.statistic}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">P-Value</p>
                            <p className="font-semibold">{data.pValue}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Significance</p>
                            <Badge variant={data.significance === 'Significant' ? 'success' : 'secondary'}>
                              {data.significance}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Confidence</p>
                            <p className="font-semibold">{data.confidence || 'N/A'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    No hypothesis testing results available. Run comprehensive analysis first.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="regression" className="space-y-4">
              {results.regression ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Linear Regression</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">R²</p>
                          <p className="font-semibold">{results.regression.linear.rSquared}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Slope</p>
                          <p className="font-semibold">{results.regression.linear.slope}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Intercept</p>
                          <p className="font-semibold">{results.regression.linear.intercept}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Significance</p>
                          <Badge variant={results.regression.linear.significance === 'Significant' ? 'success' : 'secondary'}>
                            {results.regression.linear.significance}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Multiple Regression</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">R²</p>
                            <p className="font-semibold">{results.regression.multiple.rSquared}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Adj. R²</p>
                            <p className="font-semibold">{results.regression.multiple.adjustedRSquared}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">F-Statistic</p>
                            <p className="font-semibold">{results.regression.multiple.fStatistic}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Predictors</p>
                            <p className="font-semibold">{results.regression.multiple.predictors}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Coefficients</h4>
                          <div className="space-y-2">
                            {results.regression.multiple.coefficients.map((coef: any, index: number) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                <span className="text-sm">Predictor {index + 1}</span>
                                <div className="flex gap-4 text-sm">
                                  <span>Value: {coef.value}</span>
                                  <span>P: {coef.pValue}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    No regression analysis results available. Run comprehensive analysis first.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="correlation" className="space-y-4">
              {results.correlation && Object.keys(results.correlation).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(results.correlation).map(([key, data]: [string, any]) => (
                    <Card key={key}>
                      <CardHeader>
                        <CardTitle className="text-sm">{key.replace('_', ' vs ')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Correlation</p>
                              <p className="font-semibold">{data.correlation}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Strength</p>
                              <Badge variant={
                                data.strength === 'Strong' ? 'success' :
                                data.strength === 'Moderate' ? 'warning' : 'secondary'
                              }>
                                {data.strength}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Direction</p>
                              <Badge variant="outline">{data.direction}</Badge>
                            </div>
                          </div>
                          <div className="w-24">
                            <Progress value={Math.abs(parseFloat(data.correlation)) * 100} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    No correlation analysis results available. Run comprehensive analysis first.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Export utility functions
export const calculateSkewness = (values: number[]): number => {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
  return values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / values.length;
};

export const calculateKurtosis = (values: number[]): number => {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
  return values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0) / values.length - 3;
};

export default StatisticalModels;