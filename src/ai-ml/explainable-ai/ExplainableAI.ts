// Explainable AI System with SHAP and LIME
export class ExplainableAI {
  private static readonly MAX_EVALUATIONS = 1000;
  private static readonly LIME_SAMPLES = 5000;
  private static readonly SHAP_BACKGROUND_SIZE = 100;

  // Model registry for explainability
  private static modelRegistry = new Map<string, ExplainableModel>();
  private static explanationCache = new Map<string, ExplanationResult>();

  // Register a model for explainability
  static registerModel(modelId: string, model: any, metadata: ModelMetadata): void {
    const explainableModel: ExplainableModel = {
      id: modelId,
      model,
      metadata,
      featureNames: metadata.featureNames,
      lastExplained: new Date(),
      explanationCount: 0,
    };

    this.modelRegistry.set(modelId, explainableModel);
    console.log(`Model registered for explainability: ${modelId}`);
  }

  // Generate SHAP explanations
  static async explainWithSHAP(
    modelId: string,
    inputData: number[][],
    backgroundData?: number[][]
  ): Promise<SHAPExplanation> {
    const model = this.modelRegistry.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // Use provided background data or sample from training data
    const background = backgroundData || this.sampleBackgroundData(model, inputData);

    const explanations: SHAPValue[] = [];

    for (const instance of inputData) {
      const shapValues = await this.computeSHAPValues(model, instance, background);
      explanations.push(shapValues);
    }

    const result: SHAPExplanation = {
      modelId,
      explanations,
      featureImportance: this.computeFeatureImportance(explanations, model.featureNames),
      metadata: {
        method: 'shap',
        backgroundSize: background.length,
        inputSize: inputData.length,
        computedAt: new Date(),
      },
    };

    // Cache the explanation
    this.cacheExplanation(`${modelId}_shap_${Date.now()}`, result);

    return result;
  }

  // Generate LIME explanations
  static async explainWithLIME(
    modelId: string,
    inputData: number[][],
    numFeatures: number = 10
  ): Promise<LIMEExplanation> {
    const model = this.modelRegistry.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    const explanations: LIMEExplanationResult[] = [];

    for (const instance of inputData) {
      const limeResult = await this.computeLIMEExplanation(model, instance, numFeatures);
      explanations.push(limeResult);
    }

    const result: LIMEExplanation = {
      modelId,
      explanations,
      metadata: {
        method: 'lime',
        numSamples: this.LIME_SAMPLES,
        numFeatures,
        inputSize: inputData.length,
        computedAt: new Date(),
      },
    };

    // Cache the explanation
    this.cacheExplanation(`${modelId}_lime_${Date.now()}`, result);

    return result;
  }

  // Compute SHAP values using Kernel SHAP
  private static async computeSHAPValues(
    model: ExplainableModel,
    instance: number[],
    background: number[][]
  ): Promise<SHAPValue> {
    const numFeatures = instance.length;
    const numBackground = background.length;

    // Generate all possible feature subsets (simplified for performance)
    const subsets = this.generateFeatureSubsets(numFeatures, Math.min(2 ** numFeatures, this.MAX_EVALUATIONS));

    const shapValues: number[] = new Array(numFeatures).fill(0);
    const weights: number[] = [];

    for (const subset of subsets) {
      const weight = this.computeSubsetWeight(subset, numFeatures);
      weights.push(weight);

      // Compute marginal contribution for each feature
      for (let feature = 0; feature < numFeatures; feature++) {
        const withFeature = this.evaluateSubset(model, instance, background, subset.concat(feature));
        const withoutFeature = this.evaluateSubset(model, instance, background, subset);

        const marginalContribution = withFeature - withoutFeature;
        shapValues[feature] += weight * marginalContribution;
      }
    }

    return {
      instance,
      shapValues,
      baseValue: this.computeBaseValue(model, background),
      featureContributions: this.createFeatureContributions(shapValues, model.featureNames),
    };
  }

  // Compute LIME explanation
  private static async computeLIMEExplanation(
    model: ExplainableModel,
    instance: number[],
    numFeatures: number
  ): Promise<LIMEExplanationResult> {
    // Generate perturbed samples around the instance
    const perturbedSamples = this.generatePerturbedSamples(instance, this.LIME_SAMPLES);
    const predictions = await this.batchPredict(model, perturbedSamples);

    // Train a linear model on the perturbed samples
    const linearModel = this.trainLinearModel(perturbedSamples, predictions, instance);

    // Extract feature importance
    const featureImportance = this.extractFeatureImportance(linearModel, model.featureNames);

    // Select top features
    const topFeatures = featureImportance
      .sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance))
      .slice(0, numFeatures);

    return {
      instance,
      prediction: await this.predict(model, instance),
      featureImportance: topFeatures,
      localModel: linearModel,
      fidelity: this.computeFidelity(linearModel, perturbedSamples, predictions),
    };
  }

  // Feature importance computation
  private static computeFeatureImportance(
    explanations: SHAPValue[],
    featureNames: string[]
  ): FeatureImportance[] {
    const numFeatures = featureNames.length;
    const totalSHAP: number[] = new Array(numFeatures).fill(0);

    // Aggregate SHAP values across all instances
    for (const explanation of explanations) {
      for (let i = 0; i < numFeatures; i++) {
        totalSHAP[i] += Math.abs(explanation.shapValues[i]);
      }
    }

    // Create feature importance ranking
    const featureImportance: FeatureImportance[] = [];
    for (let i = 0; i < numFeatures; i++) {
      featureImportance.push({
        feature: featureNames[i],
        importance: totalSHAP[i] / explanations.length,
        rank: 0, // Will be set after sorting
      });
    }

    // Sort by importance and assign ranks
    featureImportance.sort((a, b) => b.importance - a.importance);
    featureImportance.forEach((feature, index) => {
      feature.rank = index + 1;
    });

    return featureImportance;
  }

  // Bias detection and mitigation
  static async detectBias(
    modelId: string,
    testData: number[][],
    sensitiveFeatures: string[],
    labels: number[]
  ): Promise<BiasAnalysis> {
    const model = this.modelRegistry.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    const predictions = await this.batchPredict(model, testData);

    const biasMetrics: BiasMetric[] = [];

    // Analyze bias for each sensitive feature
    for (const sensitiveFeature of sensitiveFeatures) {
      const featureIndex = model.featureNames.indexOf(sensitiveFeature);
      if (featureIndex === -1) continue;

      const biasMetric = this.computeBiasMetric(
        testData,
        predictions,
        labels,
        featureIndex,
        sensitiveFeature
      );

      biasMetrics.push(biasMetric);
    }

    // Overall bias assessment
    const overallBias = this.computeOverallBias(biasMetrics);

    return {
      modelId,
      biasMetrics,
      overallBias,
      recommendations: this.generateBiasRecommendations(biasMetrics),
      metadata: {
        testDataSize: testData.length,
        sensitiveFeatures,
        computedAt: new Date(),
      },
    };
  }

  // Model fairness assessment
  static async assessFairness(
    modelId: string,
    testData: number[][],
    protectedGroups: ProtectedGroup[]
  ): Promise<FairnessAssessment> {
    const model = this.modelRegistry.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    const predictions = await this.batchPredict(model, testData);

    const fairnessMetrics: FairnessMetric[] = [];

    for (const protectedGroup of protectedGroups) {
      const groupMetrics = this.computeFairnessMetrics(
        testData,
        predictions,
        protectedGroup
      );

      fairnessMetrics.push(groupMetrics);
    }

    const overallFairness = this.assessOverallFairness(fairnessMetrics);

    return {
      modelId,
      fairnessMetrics,
      overallFairness,
      mitigationStrategies: this.suggestMitigationStrategies(fairnessMetrics),
      metadata: {
        testDataSize: testData.length,
        protectedGroups: protectedGroups.length,
        computedAt: new Date(),
      },
    };
  }

  // Helper methods for SHAP computation
  private static generateFeatureSubsets(numFeatures: number, maxSubsets: number): number[][] {
    const subsets: number[][] = [[]]; // Start with empty subset

    for (let i = 0; i < numFeatures && subsets.length < maxSubsets; i++) {
      const newSubsets: number[][] = [];
      for (const subset of subsets) {
        newSubsets.push([...subset]); // Without current feature
        newSubsets.push([...subset, i]); // With current feature
      }
      subsets.push(...newSubsets.slice(subsets.length));
    }

    return subsets.slice(0, maxSubsets);
  }

  private static computeSubsetWeight(subset: number[], numFeatures: number): number {
    const subsetSize = subset.length;
    const weight = (numFeatures - 1) / (this.binomial(numFeatures, subsetSize) * numFeatures);
    return weight;
  }

  private static evaluateSubset(
    model: ExplainableModel,
    instance: number[],
    background: number[][],
    subset: number[]
  ): number {
    // Create masked instance (features not in subset are replaced with background values)
    const maskedInstance = [...instance];

    for (let i = 0; i < instance.length; i++) {
      if (!subset.includes(i)) {
        // Sample from background data for this feature
        const backgroundValues = background.map(bg => bg[i]);
        maskedInstance[i] = backgroundValues[Math.floor(Math.random() * backgroundValues.length)];
      }
    }

    // Get model prediction for masked instance
    return this.predictSync(model, maskedInstance);
  }

  private static computeBaseValue(model: ExplainableModel, background: number[][]): number {
    // Average prediction on background data
    const predictions = background.map(instance => this.predictSync(model, instance));
    return predictions.reduce((sum, pred) => sum + pred, 0) / predictions.length;
  }

  private static sampleBackgroundData(model: ExplainableModel, inputData: number[][]): number[][] {
    // Sample background data from model training data (simplified)
    // In practice, this would come from the model's training dataset
    const background: number[][] = [];
    for (let i = 0; i < this.SHAP_BACKGROUND_SIZE; i++) {
      const sample = inputData[Math.floor(Math.random() * inputData.length)];
      background.push([...sample]);
    }
    return background;
  }

  // Helper methods for LIME computation
  private static generatePerturbedSamples(instance: number[], numSamples: number): number[][] {
    const samples: number[][] = [];

    for (let i = 0; i < numSamples; i++) {
      const perturbed = [...instance];

      // Perturb each feature with some probability
      for (let j = 0; j < instance.length; j++) {
        if (Math.random() < 0.5) { // 50% chance to perturb
          // Add Gaussian noise
          perturbed[j] += this.generateGaussianNoise(0.1 * Math.abs(instance[j]));
        }
      }

      samples.push(perturbed);
    }

    return samples;
  }

  private static trainLinearModel(
    samples: number[][],
    predictions: number[],
    instance: number[]
  ): LinearModel {
    // Simplified linear regression training
    const numFeatures = samples[0].length;
    const weights = new Array(numFeatures).fill(0);
    const bias = 0;

    // Simple gradient descent (simplified implementation)
    const learningRate = 0.01;
    const epochs = 100;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let biasGradient = 0;
      const weightGradients = new Array(numFeatures).fill(0);

      for (let i = 0; i < samples.length; i++) {
        const prediction = this.predictLinear(samples[i], weights, bias);
        const error = predictions[i] - prediction;

        biasGradient += error;
        for (let j = 0; j < numFeatures; j++) {
          weightGradients[j] += error * samples[i][j];
        }
      }

      // Update parameters
      bias += learningRate * biasGradient / samples.length;
      for (let j = 0; j < numFeatures; j++) {
        weights[j] += learningRate * weightGradients[j] / samples.length;
      }
    }

    return { weights, bias };
  }

  private static predictLinear(instance: number[], weights: number[], bias: number): number {
    let prediction = bias;
    for (let i = 0; i < instance.length; i++) {
      prediction += weights[i] * instance[i];
    }
    return prediction;
  }

  private static extractFeatureImportance(
    linearModel: LinearModel,
    featureNames: string[]
  ): FeatureImportance[] {
    return linearModel.weights.map((weight, index) => ({
      feature: featureNames[index],
      importance: Math.abs(weight),
      rank: 0, // Will be set by sorting
    }));
  }

  private static computeFidelity(
    linearModel: LinearModel,
    samples: number[][],
    originalPredictions: number[]
  ): number {
    let totalError = 0;

    for (let i = 0; i < samples.length; i++) {
      const linearPrediction = this.predictLinear(samples[i], linearModel.weights, linearModel.bias);
      const error = Math.abs(linearPrediction - originalPredictions[i]);
      totalError += error;
    }

    return 1 - (totalError / samples.length); // Higher fidelity = lower average error
  }

  // Utility methods
  private static async predict(model: ExplainableModel, instance: number[]): Promise<number> {
    // In practice, this would call the actual model prediction
    return Math.random(); // Placeholder
  }

  private static predictSync(model: ExplainableModel, instance: number[]): number {
    // Synchronous prediction for SHAP calculations
    return Math.random(); // Placeholder
  }

  private static async batchPredict(model: ExplainableModel, instances: number[][]): Promise<number[]> {
    // In practice, this would batch predict using the model
    return instances.map(() => Math.random()); // Placeholder
  }

  private static createFeatureContributions(shapValues: number[], featureNames: string[]): FeatureContribution[] {
    return shapValues.map((value, index) => ({
      feature: featureNames[index],
      contribution: value,
    }));
  }

  private static generateGaussianNoise(std: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * std;
  }

  private static binomial(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;

    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - k + i) / i;
    }
    return result;
  }

  private static cacheExplanation(key: string, result: ExplanationResult): void {
    this.explanationCache.set(key, result);

    // Clean up old explanations (keep last 1000)
    if (this.explanationCache.size > 1000) {
      const keys = Array.from(this.explanationCache.keys());
      for (let i = 0; i < 100 - keys.length; i++) {
        this.explanationCache.delete(keys[i]);
      }
    }
  }

  // Bias detection methods
  private static computeBiasMetric(
    testData: number[][],
    predictions: number[],
    labels: number[],
    featureIndex: number,
    featureName: string
  ): BiasMetric {
    // Separate data by protected attribute
    const group1Data: number[][] = [];
    const group2Data: number[][] = [];
    const group1Predictions: number[] = [];
    const group2Predictions: number[] = [];
    const group1Labels: number[] = [];
    const group2Labels: number[] = [];

    for (let i = 0; i < testData.length; i++) {
      if (testData[i][featureIndex] === 0) {
        group1Data.push(testData[i]);
        group1Predictions.push(predictions[i]);
        group1Labels.push(labels[i]);
      } else {
        group2Data.push(testData[i]);
        group2Predictions.push(predictions[i]);
        group2Labels.push(labels[i]);
      }
    }

    // Compute fairness metrics
    const group1Accuracy = this.computeAccuracy(group1Predictions, group1Labels);
    const group2Accuracy = this.computeAccuracy(group2Predictions, group2Labels);
    const disparateImpact = group2Accuracy / (group1Accuracy || 1);

    return {
      protectedAttribute: featureName,
      group1Size: group1Data.length,
      group2Size: group2Data.length,
      group1Accuracy,
      group2Accuracy,
      disparateImpact,
      biasDetected: Math.abs(disparateImpact - 1) > 0.1, // 10% threshold
    };
  }

  private static computeOverallBias(biasMetrics: BiasMetric[]): BiasAssessment {
    const significantBiases = biasMetrics.filter(m => m.biasDetected);
    const averageDisparateImpact = biasMetrics.reduce((sum, m) => sum + m.disparateImpact, 0) / biasMetrics.length;

    return {
      hasBias: significantBiases.length > 0,
      significantBiases: significantBiases.length,
      averageDisparateImpact,
      severity: significantBiases.length > 2 ? 'high' :
               significantBiases.length > 0 ? 'medium' : 'low',
    };
  }

  private static generateBiasRecommendations(biasMetrics: BiasMetric[]): string[] {
    const recommendations: string[] = [];

    const biasedAttributes = biasMetrics.filter(m => m.biasDetected);
    if (biasedAttributes.length > 0) {
      recommendations.push(`Address bias in attributes: ${biasedAttributes.map(m => m.protectedAttribute).join(', ')}`);
      recommendations.push('Consider rebalancing training data or using fairness-aware algorithms');
      recommendations.push('Implement bias detection in production monitoring');
    }

    return recommendations;
  }

  private static computeAccuracy(predictions: number[], labels: number[]): number {
    let correct = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (Math.round(predictions[i]) === labels[i]) {
        correct++;
      }
    }
    return correct / predictions.length;
  }

  // Fairness assessment methods
  private static computeFairnessMetrics(
    testData: number[][],
    predictions: number[],
    protectedGroup: ProtectedGroup
  ): FairnessMetric {
    // Implement various fairness metrics
    return {
      protectedGroup: protectedGroup.name,
      statisticalParity: 0, // Placeholder
      equalOpportunity: 0, // Placeholder
      predictiveEquality: 0, // Placeholder
      overallFairness: 0, // Placeholder
    };
  }

  private static assessOverallFairness(fairnessMetrics: FairnessMetric[]): FairnessAssessment {
    return {
      isFair: true, // Placeholder
      fairnessScore: 0.9, // Placeholder
      issues: [], // Placeholder
    };
  }

  private static suggestMitigationStrategies(fairnessMetrics: FairnessMetric[]): string[] {
    return [
      'Implement fairness-aware training algorithms',
      'Regular fairness audits in production',
      'Consider reweighting training data',
    ];
  }
}

// Interface definitions
interface ExplainableModel {
  id: string;
  model: any;
  metadata: ModelMetadata;
  featureNames: string[];
  lastExplained: Date;
  explanationCount: number;
}

interface ModelMetadata {
  name: string;
  version: string;
  type: string;
  framework: string;
  featureNames: string[];
  targetNames?: string[];
  trainingDate: Date;
  accuracy?: number;
}

interface ExplanationResult {
  modelId: string;
  metadata: {
    method: string;
    computedAt: Date;
    [key: string]: any;
  };
}

interface SHAPExplanation extends ExplanationResult {
  explanations: SHAPValue[];
  featureImportance: FeatureImportance[];
  metadata: {
    method: 'shap';
    backgroundSize: number;
    inputSize: number;
    computedAt: Date;
  };
}

interface SHAPValue {
  instance: number[];
  shapValues: number[];
  baseValue: number;
  featureContributions: FeatureContribution[];
}

interface FeatureContribution {
  feature: string;
  contribution: number;
}

interface LIMEExplanation extends ExplanationResult {
  explanations: LIMEExplanationResult[];
  metadata: {
    method: 'lime';
    numSamples: number;
    numFeatures: number;
    inputSize: number;
    computedAt: Date;
  };
}

interface LIMEExplanationResult {
  instance: number[];
  prediction: number;
  featureImportance: FeatureImportance[];
  localModel: LinearModel;
  fidelity: number;
}

interface LinearModel {
  weights: number[];
  bias: number;
}

interface FeatureImportance {
  feature: string;
  importance: number;
  rank: number;
}

interface BiasAnalysis {
  modelId: string;
  biasMetrics: BiasMetric[];
  overallBias: BiasAssessment;
  recommendations: string[];
  metadata: {
    testDataSize: number;
    sensitiveFeatures: string[];
    computedAt: Date;
  };
}

interface BiasMetric {
  protectedAttribute: string;
  group1Size: number;
  group2Size: number;
  group1Accuracy: number;
  group2Accuracy: number;
  disparateImpact: number;
  biasDetected: boolean;
}

interface BiasAssessment {
  hasBias: boolean;
  significantBiases: number;
  averageDisparateImpact: number;
  severity: 'low' | 'medium' | 'high';
}

interface FairnessAssessment {
  modelId: string;
  fairnessMetrics: FairnessMetric[];
  overallFairness: FairnessAssessment;
  mitigationStrategies: string[];
  metadata: {
    testDataSize: number;
    protectedGroups: number;
    computedAt: Date;
  };
}

interface FairnessMetric {
  protectedGroup: string;
  statisticalParity: number;
  equalOpportunity: number;
  predictiveEquality: number;
  overallFairness: number;
}

interface FairnessAssessment {
  isFair: boolean;
  fairnessScore: number;
  issues: string[];
}

interface ProtectedGroup {
  name: string;
  attribute: string;
  values: number[];
}

export default ExplainableAI;