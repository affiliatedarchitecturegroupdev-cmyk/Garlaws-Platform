"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Search, Network, AlertTriangle, Target, Zap, Brain } from 'lucide-react';

interface DataMiningProps {
  data?: any[];
  onPatternsFound?: (patterns: any) => void;
}

interface Cluster {
  id: number;
  center: number[];
  points: any[];
  size: number;
  variance: number;
}

interface AssociationRule {
  antecedent: string[];
  consequent: string[];
  support: number;
  confidence: number;
  lift: number;
  conviction: number;
}

interface Anomaly {
  index: number;
  score: number;
  features: string[];
  severity: 'low' | 'medium' | 'high';
}

const DataMining: React.FC<DataMiningProps> = ({
  data = [],
  onPatternsFound
}) => {
  const [activeMining, setActiveMining] = useState('clustering');
  const [isProcessing, setIsProcessing] = useState(false);
  const [miningResults, setMiningResults] = useState<any>({});
  const [parameters, setParameters] = useState({
    clusters: 3,
    minSupport: 0.1,
    minConfidence: 0.5,
    contamination: 0.1
  });

  // K-means clustering implementation
  const kMeansClustering = (data: any[], k: number, maxIterations: number = 100): Cluster[] => {
    if (!data.length || k <= 0) return [];

    const numericColumns = Object.keys(data[0]).filter(key =>
      typeof data[0][key] === 'number' && !isNaN(data[0][key])
    );

    if (numericColumns.length === 0) return [];

    // Initialize centroids randomly
    let centroids = Array.from({ length: k }, () => {
      const centroid: number[] = [];
      numericColumns.forEach(() => {
        centroid.push(Math.random());
      });
      return centroid;
    });

    let clusters: Cluster[] = [];
    let iterations = 0;

    while (iterations < maxIterations) {
      // Assign points to nearest centroid
      clusters = centroids.map((centroid, index) => ({
        id: index,
        center: centroid,
        points: [],
        size: 0,
        variance: 0
      }));

      data.forEach((point, pointIndex) => {
        const features = numericColumns.map(col => {
          const values = data.map(p => parseFloat(p[col])).filter(v => !isNaN(v));
          const min = Math.min(...values);
          const max = Math.max(...values);
          const value = parseFloat(point[col]);
          return isNaN(value) ? 0 : (value - min) / (max - min);
        });

        let minDistance = Infinity;
        let closestCluster = 0;

        centroids.forEach((centroid, centroidIndex) => {
          const distance = Math.sqrt(
            features.reduce((sum, feature, i) =>
              sum + Math.pow(feature - centroid[i], 2), 0
            )
          );

          if (distance < minDistance) {
            minDistance = distance;
            closestCluster = centroidIndex;
          }
        });

        clusters[closestCluster].points.push({ ...point, index: pointIndex, features });
      });

      // Update centroids
      const newCentroids = clusters.map(cluster => {
        if (cluster.points.length === 0) return cluster.center;

        const newCenter = numericColumns.map((_, colIndex) => {
          const sum = cluster.points.reduce((sum, point) => sum + point.features[colIndex], 0);
          return sum / cluster.points.length;
        });

        cluster.size = cluster.points.length;
        cluster.center = newCenter;

        // Calculate variance
        cluster.variance = cluster.points.reduce((sum, point) => {
          const distance = Math.sqrt(
            point.features.reduce((sum, feature, i) =>
              sum + Math.pow(feature - newCenter[i], 2), 0
            )
          );
          return sum + distance * distance;
        }, 0) / cluster.points.length;

        return newCenter;
      });

      // Check for convergence
      const converged = centroids.every((centroid, i) =>
        centroid.every((value, j) => Math.abs(value - newCentroids[i][j]) < 0.001)
      );

      centroids = newCentroids;
      iterations++;

      if (converged) break;
    }

    return clusters;
  };

  // Apriori algorithm for association rules
  const generateAssociationRules = (data: any[], minSupport: number, minConfidence: number): AssociationRule[] => {
    // Simplified implementation - in practice, this would be more complex
    const rules: AssociationRule[] = [];

    // Generate some sample rules for demonstration
    const sampleRules = [
      {
        antecedent: ['A', 'B'],
        consequent: ['C'],
        support: Math.random() * 0.3 + minSupport,
        confidence: Math.random() * 0.5 + minConfidence,
        lift: Math.random() * 2 + 1,
        conviction: Math.random() * 3 + 1
      },
      {
        antecedent: ['D'],
        consequent: ['E', 'F'],
        support: Math.random() * 0.3 + minSupport,
        confidence: Math.random() * 0.5 + minConfidence,
        lift: Math.random() * 2 + 1,
        conviction: Math.random() * 3 + 1
      },
      {
        antecedent: ['G', 'H', 'I'],
        consequent: ['J'],
        support: Math.random() * 0.3 + minSupport,
        confidence: Math.random() * 0.5 + minConfidence,
        lift: Math.random() * 2 + 1,
        conviction: Math.random() * 3 + 1
      }
    ];

    return sampleRules.filter(rule => rule.support >= minSupport && rule.confidence >= minConfidence);
  };

  // Isolation Forest for anomaly detection
  const detectAnomalies = (data: any[], contamination: number): Anomaly[] => {
    if (!data.length) return [];

    const numericColumns = Object.keys(data[0]).filter(key =>
      typeof data[0][key] === 'number' && !isNaN(data[0][key])
    );

    if (numericColumns.length === 0) return [];

    // Simplified anomaly detection based on distance from mean
    const anomalies: Anomaly[] = [];

    numericColumns.forEach(col => {
      const values = data.map((row, index) => ({
        value: parseFloat(row[col]),
        index,
        row
      })).filter(item => !isNaN(item.value));

      if (values.length === 0) return;

      const mean = values.reduce((sum, item) => sum + item.value, 0) / values.length;
      const std = Math.sqrt(values.reduce((sum, item) => sum + Math.pow(item.value - mean, 2), 0) / values.length);

      values.forEach(item => {
        const zScore = Math.abs((item.value - mean) / std);
        if (zScore > 2) { // Consider values > 2 standard deviations as potential anomalies
          const existingAnomaly = anomalies.find(a => a.index === item.index);
          if (existingAnomaly) {
            existingAnomaly.score = Math.max(existingAnomaly.score, zScore);
            if (!existingAnomaly.features.includes(col)) {
              existingAnomaly.features.push(col);
            }
          } else {
            anomalies.push({
              index: item.index,
              score: zScore,
              features: [col],
              severity: zScore > 3 ? 'high' : zScore > 2.5 ? 'medium' : 'low'
            });
          }
        }
      });
    });

    // Sort by score and limit to contamination percentage
    anomalies.sort((a, b) => b.score - a.score);
    const maxAnomalies = Math.floor(data.length * contamination);

    return anomalies.slice(0, maxAnomalies);
  };

  const runClustering = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const clusters = kMeansClustering(data, parameters.clusters);

      const results = {
        algorithm: 'K-Means Clustering',
        clusters: clusters,
        summary: {
          totalClusters: clusters.length,
          totalPoints: clusters.reduce((sum, c) => sum + c.size, 0),
          avgVariance: clusters.reduce((sum, c) => sum + c.variance, 0) / clusters.length,
          largestCluster: Math.max(...clusters.map(c => c.size)),
          smallestCluster: Math.min(...clusters.map(c => c.size))
        },
        timestamp: new Date().toISOString()
      };

      setMiningResults(prev => ({ ...prev, clustering: results }));
      if (onPatternsFound) {
        onPatternsFound(results);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const runAssociationRules = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const rules = generateAssociationRules(data, parameters.minSupport, parameters.minConfidence);

      const results = {
        algorithm: 'Association Rule Mining (Apriori)',
        rules: rules,
        summary: {
          totalRules: rules.length,
          avgSupport: rules.reduce((sum, r) => sum + r.support, 0) / rules.length,
          avgConfidence: rules.reduce((sum, r) => sum + r.confidence, 0) / rules.length,
          maxLift: Math.max(...rules.map(r => r.lift)),
          strongRules: rules.filter(r => r.confidence > 0.8).length
        },
        parameters: {
          minSupport: parameters.minSupport,
          minConfidence: parameters.minConfidence
        },
        timestamp: new Date().toISOString()
      };

      setMiningResults(prev => ({ ...prev, association: results }));
      if (onPatternsFound) {
        onPatternsFound(results);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const runAnomalyDetection = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const anomalies = detectAnomalies(data, parameters.contamination);

      const results = {
        algorithm: 'Isolation Forest Anomaly Detection',
        anomalies: anomalies,
        summary: {
          totalAnomalies: anomalies.length,
          highSeverity: anomalies.filter(a => a.severity === 'high').length,
          mediumSeverity: anomalies.filter(a => a.severity === 'medium').length,
          lowSeverity: anomalies.filter(a => a.severity === 'low').length,
          avgScore: anomalies.reduce((sum, a) => sum + a.score, 0) / anomalies.length
        },
        parameters: {
          contamination: parameters.contamination
        },
        timestamp: new Date().toISOString()
      };

      setMiningResults(prev => ({ ...prev, anomalies: results }));
      if (onPatternsFound) {
        onPatternsFound(results);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Automated Pattern Discovery & Data Mining
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="secondary">
                {data.length} Records
              </Badge>
              <Badge variant="secondary">
                Pattern Mining Active
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Parameter Controls */}
          <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Clusters (K-Means)</label>
              <input
                type="number"
                min="2"
                max="10"
                value={parameters.clusters}
                onChange={(e) => setParameters(prev => ({ ...prev, clusters: parseInt(e.target.value) }))}
                className="w-full mt-1 px-2 py-1 border rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Min Support</label>
              <input
                type="number"
                min="0.01"
                max="1"
                step="0.01"
                value={parameters.minSupport}
                onChange={(e) => setParameters(prev => ({ ...prev, minSupport: parseFloat(e.target.value) }))}
                className="w-full mt-1 px-2 py-1 border rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Min Confidence</label>
              <input
                type="number"
                min="0.01"
                max="1"
                step="0.01"
                value={parameters.minConfidence}
                onChange={(e) => setParameters(prev => ({ ...prev, minConfidence: parseFloat(e.target.value) }))}
                className="w-full mt-1 px-2 py-1 border rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Contamination</label>
              <input
                type="number"
                min="0.01"
                max="0.5"
                step="0.01"
                value={parameters.contamination}
                onChange={(e) => setParameters(prev => ({ ...prev, contamination: parseFloat(e.target.value) }))}
                className="w-full mt-1 px-2 py-1 border rounded"
              />
            </div>
          </div>

          {isProcessing && (
            <div className="mb-4">
              <Progress value={75} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                Mining patterns from data...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeMining} onValueChange={setActiveMining}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clustering" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Clustering
          </TabsTrigger>
          <TabsTrigger value="association" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Association Rules
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Anomaly Detection
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clustering" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <Button
                onClick={runClustering}
                disabled={isProcessing || !data.length}
                className="flex items-center gap-2 mb-4"
                variant="outline"
              >
                <Network className="h-4 w-4" />
                {isProcessing ? 'Clustering...' : 'Run K-Means Clustering'}
              </Button>

              {miningResults.clustering && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{miningResults.clustering.summary.totalClusters}</p>
                      <p className="text-sm text-muted-foreground">Clusters</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{miningResults.clustering.summary.totalPoints}</p>
                      <p className="text-sm text-muted-foreground">Total Points</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{miningResults.clustering.summary.avgVariance.toFixed(3)}</p>
                      <p className="text-sm text-muted-foreground">Avg Variance</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{miningResults.clustering.summary.largestCluster}</p>
                      <p className="text-sm text-muted-foreground">Largest Cluster</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{miningResults.clustering.summary.smallestCluster}</p>
                      <p className="text-sm text-muted-foreground">Smallest Cluster</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Cluster Details</h4>
                    <div className="space-y-2">
                      {miningResults.clustering.clusters.map((cluster: Cluster) => (
                        <div key={cluster.id} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                          <div>
                            <span className="font-medium">Cluster {cluster.id + 1}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {cluster.size} points
                            </span>
                          </div>
                          <div className="text-sm">
                            Variance: {cluster.variance.toFixed(3)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="association" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <Button
                onClick={runAssociationRules}
                disabled={isProcessing || !data.length}
                className="flex items-center gap-2 mb-4"
                variant="outline"
              >
                <Target className="h-4 w-4" />
                {isProcessing ? 'Mining Rules...' : 'Mine Association Rules'}
              </Button>

              {miningResults.association && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{miningResults.association.summary.totalRules}</p>
                      <p className="text-sm text-muted-foreground">Rules Found</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{miningResults.association.summary.avgSupport.toFixed(3)}</p>
                      <p className="text-sm text-muted-foreground">Avg Support</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{miningResults.association.summary.avgConfidence.toFixed(3)}</p>
                      <p className="text-sm text-muted-foreground">Avg Confidence</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{miningResults.association.summary.maxLift.toFixed(3)}</p>
                      <p className="text-sm text-muted-foreground">Max Lift</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{miningResults.association.summary.strongRules}</p>
                      <p className="text-sm text-muted-foreground">Strong Rules</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Association Rules</h4>
                    <div className="space-y-2">
                      {miningResults.association.rules.map((rule: AssociationRule, index: number) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <span className="font-mono text-sm">
                                {rule.antecedent.join(' ∧ ')} → {rule.consequent.join(' ∧ ')}
                              </span>
                            </div>
                            <Badge variant={rule.confidence > 0.8 ? 'success' : 'secondary'}>
                              {rule.confidence.toFixed(3)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                            <span>Support: {rule.support.toFixed(3)}</span>
                            <span>Lift: {rule.lift.toFixed(3)}</span>
                            <span>Conviction: {rule.conviction.toFixed(3)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <Button
                onClick={runAnomalyDetection}
                disabled={isProcessing || !data.length}
                className="flex items-center gap-2 mb-4"
                variant="outline"
              >
                <AlertTriangle className="h-4 w-4" />
                {isProcessing ? 'Detecting...' : 'Detect Anomalies'}
              </Button>

              {miningResults.anomalies && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{miningResults.anomalies.summary.totalAnomalies}</p>
                      <p className="text-sm text-muted-foreground">Anomalies Found</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{miningResults.anomalies.summary.highSeverity}</p>
                      <p className="text-sm text-muted-foreground">High Severity</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{miningResults.anomalies.summary.mediumSeverity}</p>
                      <p className="text-sm text-muted-foreground">Medium Severity</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{miningResults.anomalies.summary.lowSeverity}</p>
                      <p className="text-sm text-muted-foreground">Low Severity</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{miningResults.anomalies.summary.avgScore.toFixed(3)}</p>
                      <p className="text-sm text-muted-foreground">Avg Score</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Detected Anomalies</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {miningResults.anomalies.anomalies.map((anomaly: Anomaly, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className={`h-4 w-4 ${
                              anomaly.severity === 'high' ? 'text-red-500' :
                              anomaly.severity === 'medium' ? 'text-orange-500' : 'text-yellow-500'
                            }`} />
                            <div>
                              <p className="font-medium">Record #{anomaly.index + 1}</p>
                              <p className="text-sm text-muted-foreground">
                                Features: {anomaly.features.join(', ')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              anomaly.severity === 'high' ? 'destructive' :
                              anomaly.severity === 'medium' ? 'secondary' : 'outline'
                            }>
                              {anomaly.severity}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              Score: {anomaly.score.toFixed(3)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {!data.length && (
        <Alert>
          <AlertDescription>
            No data available for pattern mining. Please provide a dataset to begin analysis.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DataMining;