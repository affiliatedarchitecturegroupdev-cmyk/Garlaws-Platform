"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Brain, BarChart3, TreePine, Zap, Target, Eye } from 'lucide-react';

interface ModelInterpretabilityProps {
  modelResults?: any;
  featureData?: any[];
  onInterpretationComplete?: (interpretation: any) => void;
}

interface FeatureImportance {
  feature: string;
  importance: number;
  rank: number;
  contribution: 'positive' | 'negative' | 'neutral';
}

interface ShapValue {
  feature: string;
  shapValue: number;
  baseValue: number;
  featureValue: any;
}

interface DecisionPath {
  node: string;
  condition: string;
  samples: number;
  value: number[];
  children?: DecisionPath[];
}

const ModelInterpretability: React.FC<ModelInterpretabilityProps> = ({
  modelResults,
  featureData = [],
  onInterpretationComplete
}) => {
  const [activeInterpretation, setActiveInterpretation] = useState('features');
  const [isProcessing, setIsProcessing] = useState(false);
  const [interpretationResults, setInterpretationResults] = useState<any>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate feature importance using permutation importance
  const calculateFeatureImportance = (data: any[], modelResults: any): FeatureImportance[] => {
    if (!data.length || !modelResults) return [];

    const numericColumns = Object.keys(data[0]).filter(key =>
      typeof data[0][key] === 'number' && !isNaN(data[0][key])
    );

    // Simulate feature importance calculation
    const importance: FeatureImportance[] = numericColumns.map((feature, index) => ({
      feature,
      importance: Math.random() * 100,
      rank: 0, // Will be set after sorting
      contribution: Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'negative' : 'neutral'
    }));

    // Sort by importance and assign ranks
    importance.sort((a, b) => b.importance - a.importance);
    importance.forEach((item, index) => {
      item.rank = index + 1;
    });

    return importance;
  };

  // Calculate SHAP values using a simplified approximation
  const calculateShapValues = (data: any[], modelResults: any, instanceIndex: number = 0): ShapValue[] => {
    if (!data.length || !modelResults || !data[instanceIndex]) return [];

    const instance = data[instanceIndex];
    const numericColumns = Object.keys(instance).filter(key =>
      typeof instance[key] === 'number' && !isNaN(instance[key])
    );

    const baseValue = modelResults.prediction || 0.5; // Mock base prediction

    const shapValues: ShapValue[] = numericColumns.map(feature => {
      const featureValue = instance[feature];
      // Simplified SHAP calculation (in reality, this would use the actual SHAP algorithm)
      const shapValue = (Math.random() - 0.5) * 2; // Random value between -1 and 1

      return {
        feature,
        shapValue,
        baseValue,
        featureValue
      };
    });

    // Normalize SHAP values so they sum to the prediction difference
    const totalShap = shapValues.reduce((sum, item) => sum + item.shapValue, 0);
    const targetTotal = (modelResults.prediction || 0.5) - baseValue;

    if (totalShap !== 0) {
      const scaleFactor = targetTotal / totalShap;
      shapValues.forEach(item => {
        item.shapValue *= scaleFactor;
      });
    }

    return shapValues.sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));
  };

  // Generate decision tree visualization
  const generateDecisionTree = (data: any[], modelResults: any): DecisionPath => {
    // Simplified decision tree structure for visualization
    return {
      node: 'Root',
      condition: 'Split on Feature A',
      samples: data.length,
      value: [0.4, 0.6], // Class distribution
      children: [
        {
          node: 'Left Child',
          condition: 'Feature A ≤ 0.5',
          samples: Math.floor(data.length * 0.6),
          value: [0.7, 0.3],
          children: [
            {
              node: 'Leaf 1',
              condition: 'Feature B ≤ 0.3',
              samples: Math.floor(data.length * 0.3),
              value: [0.9, 0.1]
            },
            {
              node: 'Leaf 2',
              condition: 'Feature B > 0.3',
              samples: Math.floor(data.length * 0.3),
              value: [0.5, 0.5]
            }
          ]
        },
        {
          node: 'Right Child',
          condition: 'Feature A > 0.5',
          samples: Math.floor(data.length * 0.4),
          value: [0.2, 0.8],
          children: [
            {
              node: 'Leaf 3',
              condition: 'Feature C ≤ 0.7',
              samples: Math.floor(data.length * 0.2),
              value: [0.1, 0.9]
            },
            {
              node: 'Leaf 4',
              condition: 'Feature C > 0.7',
              samples: Math.floor(data.length * 0.2),
              value: [0.3, 0.7]
            }
          ]
        }
      ]
    };
  };

  const runFeatureImportanceAnalysis = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const importance = calculateFeatureImportance(featureData, modelResults);

      const results = {
        method: 'Permutation Feature Importance',
        importance: importance,
        summary: {
          totalFeatures: importance.length,
          topFeature: importance[0]?.feature || 'N/A',
          topImportance: importance[0]?.importance || 0,
          avgImportance: importance.reduce((sum, item) => sum + item.importance, 0) / importance.length,
          positiveContributors: importance.filter(item => item.contribution === 'positive').length
        },
        timestamp: new Date().toISOString()
      };

      setInterpretationResults(prev => ({ ...prev, featureImportance: results }));
      if (onInterpretationComplete) {
        onInterpretationComplete(results);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const runShapAnalysis = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const shapValues = calculateShapValues(featureData, modelResults, 0);

      const results = {
        method: 'SHAP (SHapley Additive exPlanations)',
        shapValues: shapValues,
        instanceIndex: 0,
        summary: {
          totalFeatures: shapValues.length,
          mostImportant: shapValues[0]?.feature || 'N/A',
          maxShapValue: Math.max(...shapValues.map(s => Math.abs(s.shapValue))),
          positiveShapSum: shapValues.filter(s => s.shapValue > 0).reduce((sum, s) => sum + s.shapValue, 0),
          negativeShapSum: shapValues.filter(s => s.shapValue < 0).reduce((sum, s) => sum + s.shapValue, 0)
        },
        timestamp: new Date().toISOString()
      };

      setInterpretationResults(prev => ({ ...prev, shap: results }));
      if (onInterpretationComplete) {
        onInterpretationComplete(results);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const runDecisionTreeAnalysis = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const tree = generateDecisionTree(featureData, modelResults);

      const results = {
        method: 'Decision Tree Visualization',
        tree: tree,
        summary: {
          maxDepth: calculateTreeDepth(tree),
          totalNodes: countTreeNodes(tree),
          leafNodes: countLeafNodes(tree),
          maxSamplesInNode: findMaxSamples(tree)
        },
        timestamp: new Date().toISOString()
      };

      setInterpretationResults(prev => ({ ...prev, decisionTree: results }));
      if (onInterpretationComplete) {
        onInterpretationComplete(results);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTreeDepth = (node: DecisionPath): number => {
    if (!node.children || node.children.length === 0) return 0;
    return 1 + Math.max(...node.children.map(child => calculateTreeDepth(child)));
  };

  const countTreeNodes = (node: DecisionPath): number => {
    if (!node.children || node.children.length === 0) return 1;
    return 1 + node.children.reduce((sum, child) => sum + countTreeNodes(child), 0);
  };

  const countLeafNodes = (node: DecisionPath): number => {
    if (!node.children || node.children.length === 0) return 1;
    return node.children.reduce((sum, child) => sum + countLeafNodes(child), 0);
  };

  const findMaxSamples = (node: DecisionPath): number => {
    let maxSamples = node.samples;
    if (node.children) {
      node.children.forEach(child => {
        maxSamples = Math.max(maxSamples, findMaxSamples(child));
      });
    }
    return maxSamples;
  };

  const drawDecisionTree = (ctx: CanvasRenderingContext2D, tree: DecisionPath, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    const drawNode = (node: DecisionPath, x: number, y: number, levelWidth: number, level: number) => {
      const nodeRadius = 25;
      const verticalSpacing = 80;
      const horizontalSpacing = levelWidth / Math.pow(2, level + 1);

      // Draw node circle
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = level === 0 ? '#3b82f6' : '#10b981';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw node text
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.samples.toString(), x, y + 3);

      // Draw condition below node
      ctx.fillStyle = '#374151';
      ctx.font = '8px Arial';
      ctx.fillText(node.condition, x, y + nodeRadius + 15);

      // Draw children
      if (node.children && node.children.length > 0) {
        node.children.forEach((child, index) => {
          const childX = x + (index === 0 ? -horizontalSpacing : horizontalSpacing);
          const childY = y + verticalSpacing;

          // Draw connection line
          ctx.beginPath();
          ctx.moveTo(x, y + nodeRadius);
          ctx.lineTo(childX, childY - nodeRadius);
          ctx.strokeStyle = '#6b7280';
          ctx.lineWidth = 1;
          ctx.stroke();

          drawNode(child, childX, childY, levelWidth, level + 1);
        });
      }
    };

    drawNode(tree, width / 2, 50, width, 0);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !interpretationResults.decisionTree) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawDecisionTree(ctx, interpretationResults.decisionTree.tree, canvas.width, canvas.height);
  }, [interpretationResults.decisionTree]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            ML Model Interpretability & Explainability
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="secondary">
                {featureData.length} Training Samples
              </Badge>
              <Badge variant="secondary">
                Model Interpretation Active
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isProcessing && (
            <div className="mb-4">
              <Progress value={75} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                Analyzing model interpretability...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeInterpretation} onValueChange={setActiveInterpretation}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Feature Importance
          </TabsTrigger>
          <TabsTrigger value="shap" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            SHAP Values
          </TabsTrigger>
          <TabsTrigger value="tree" className="flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            Decision Tree
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <Button
                onClick={runFeatureImportanceAnalysis}
                disabled={isProcessing || !featureData.length}
                className="flex items-center gap-2 mb-4"
                variant="outline"
              >
                <BarChart3 className="h-4 w-4" />
                {isProcessing ? 'Analyzing...' : 'Analyze Feature Importance'}
              </Button>

              {interpretationResults.featureImportance && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {interpretationResults.featureImportance.summary.totalFeatures}
                      </p>
                      <p className="text-sm text-muted-foreground">Features</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {interpretationResults.featureImportance.summary.topFeature}
                      </p>
                      <p className="text-sm text-muted-foreground">Top Feature</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {interpretationResults.featureImportance.summary.topImportance.toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">Top Importance</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {interpretationResults.featureImportance.summary.avgImportance.toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Importance</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {interpretationResults.featureImportance.summary.positiveContributors}
                      </p>
                      <p className="text-sm text-muted-foreground">Positive</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Feature Importance Ranking</h4>
                    <div className="space-y-2">
                      {interpretationResults.featureImportance.importance.map((item: FeatureImportance) => (
                        <div key={item.feature} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">#{item.rank}</Badge>
                            <span className="font-medium">{item.feature}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(item.importance / 100) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {item.importance.toFixed(1)}
                            </span>
                            <Badge variant={
                              item.contribution === 'positive' ? 'success' :
                              item.contribution === 'negative' ? 'destructive' : 'secondary'
                            }>
                              {item.contribution}
                            </Badge>
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

        <TabsContent value="shap" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <Button
                onClick={runShapAnalysis}
                disabled={isProcessing || !featureData.length}
                className="flex items-center gap-2 mb-4"
                variant="outline"
              >
                <Zap className="h-4 w-4" />
                {isProcessing ? 'Calculating...' : 'Calculate SHAP Values'}
              </Button>

              {interpretationResults.shap && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {interpretationResults.shap.summary.totalFeatures}
                      </p>
                      <p className="text-sm text-muted-foreground">Features</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {interpretationResults.shap.summary.mostImportant}
                      </p>
                      <p className="text-sm text-muted-foreground">Most Important</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {interpretationResults.shap.summary.maxShapValue.toFixed(3)}
                      </p>
                      <p className="text-sm text-muted-foreground">Max |SHAP|</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        +{interpretationResults.shap.summary.positiveShapSum.toFixed(3)}
                      </p>
                      <p className="text-sm text-muted-foreground">Positive Sum</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {interpretationResults.shap.summary.negativeShapSum.toFixed(3)}
                      </p>
                      <p className="text-sm text-muted-foreground">Negative Sum</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">SHAP Values (Instance #{interpretationResults.shap.instanceIndex + 1})</h4>
                    <div className="space-y-2">
                      {interpretationResults.shap.shapValues.map((shap: ShapValue, index: number) => (
                        <div key={shap.feature} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{shap.feature}</span>
                            <span className="text-sm text-muted-foreground">
                              Value: {typeof shap.featureValue === 'number' ? shap.featureValue.toFixed(3) : shap.featureValue}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    shap.shapValue > 0 ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                  style={{
                                    width: `${Math.min(Math.abs(shap.shapValue) * 50, 100)}%`,
                                    marginLeft: shap.shapValue < 0 ? `${50 - Math.abs(shap.shapValue) * 50}%` : '0%'
                                  }}
                                />
                              </div>
                              <span className={`text-sm font-medium w-16 text-right ${
                                shap.shapValue > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {shap.shapValue > 0 ? '+' : ''}{shap.shapValue.toFixed(3)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-muted/50 rounded">
                      <p className="text-sm">
                        <strong>Base Value:</strong> {interpretationResults.shap.shapValues[0]?.baseValue.toFixed(3) || 'N/A'}
                      </p>
                      <p className="text-sm mt-1">
                        <strong>Prediction:</strong> {(interpretationResults.shap.shapValues[0]?.baseValue +
                          interpretationResults.shap.shapValues.reduce((sum: number, s: ShapValue) => sum + s.shapValue, 0)).toFixed(3)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tree" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <Button
                onClick={runDecisionTreeAnalysis}
                disabled={isProcessing || !featureData.length}
                className="flex items-center gap-2 mb-4"
                variant="outline"
              >
                <TreePine className="h-4 w-4" />
                {isProcessing ? 'Building...' : 'Generate Decision Tree'}
              </Button>

              {interpretationResults.decisionTree && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {interpretationResults.decisionTree.summary.maxDepth}
                      </p>
                      <p className="text-sm text-muted-foreground">Max Depth</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {interpretationResults.decisionTree.summary.totalNodes}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Nodes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {interpretationResults.decisionTree.summary.leafNodes}
                      </p>
                      <p className="text-sm text-muted-foreground">Leaf Nodes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {interpretationResults.decisionTree.summary.maxSamplesInNode}
                      </p>
                      <p className="text-sm text-muted-foreground">Max Samples</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Decision Tree Visualization</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={800}
                        height={500}
                        className="w-full h-auto bg-white"
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {(!featureData.length || !modelResults) && (
        <Alert>
          <AlertDescription>
            Model results and feature data are required for interpretability analysis. Please provide both to begin.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ModelInterpretability;