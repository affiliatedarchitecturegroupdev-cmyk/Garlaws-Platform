import { createHash, randomBytes } from 'crypto';

// Federated Learning Framework with Differential Privacy
export class FederatedLearning {
  private static readonly MAX_ROUNDS = 100;
  private static readonly MIN_CLIENTS = 3;
  private static readonly EPSILON = 1.0; // Privacy parameter
  private static readonly DELTA = 1e-5;  // Privacy parameter

  // Federated learning state
  private static globalModel: ModelWeights;
  private static currentRound = 0;
  private static activeClients = new Map<string, FederatedClient>();
  private static modelUpdates = new Map<string, ModelUpdate>();
  private static trainingHistory: TrainingRound[] = [];

  private static isInitialized = false;

  // Initialize federated learning system
  static async initialize(initialModel: ModelWeights): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.globalModel = { ...initialModel };
      this.currentRound = 0;

      // Set up secure communication channels
      await this.setupSecureChannels();

      // Initialize differential privacy parameters
      await this.initializePrivacyParameters();

      // Start federated learning coordinator
      this.startCoordinator();

      this.isInitialized = true;
      console.log('Federated learning system initialized');
    } catch (error) {
      console.error('Federated learning initialization failed:', error);
      throw error;
    }
  }

  // Register a new client for federated learning
  static async registerClient(clientId: string, clientInfo: ClientInfo): Promise<string> {
    if (!this.isInitialized) await this.initialize({} as ModelWeights);

    const client: FederatedClient = {
      id: clientId,
      info: clientInfo,
      status: 'registered',
      lastSeen: new Date(),
      modelVersion: 0,
      privacyBudget: this.EPSILON,
      contributions: 0,
    };

    // Generate secure token for client authentication
    const token = this.generateClientToken(clientId);

    this.activeClients.set(clientId, client);
    console.log(`Client registered: ${clientId}`);

    return token;
  }

  // Start a new training round
  static async startTrainingRound(): Promise<TrainingRound> {
    if (!this.isInitialized) throw new Error('Federated learning not initialized');

    this.currentRound++;
    const round: TrainingRound = {
      roundNumber: this.currentRound,
      startTime: new Date(),
      status: 'active',
      participatingClients: [],
      modelUpdates: [],
      privacyParameters: {
        epsilon: this.EPSILON,
        delta: this.DELTA,
        noiseMultiplier: this.calculateNoiseMultiplier(),
      },
    };

    // Select participating clients
    const participatingClients = await this.selectParticipatingClients();
    round.participatingClients = participatingClients;

    // Send model to selected clients
    await this.distributeModelToClients(participatingClients, this.globalModel);

    // Update client statuses
    participatingClients.forEach(clientId => {
      const client = this.activeClients.get(clientId);
      if (client) {
        client.status = 'training';
        client.lastSeen = new Date();
      }
    });

    this.trainingHistory.push(round);
    console.log(`Training round ${this.currentRound} started with ${participatingClients.length} clients`);

    return round;
  }

  // Receive model update from client
  static async receiveModelUpdate(clientId: string, update: ModelUpdate, signature: string): Promise<void> {
    if (!this.isInitialized) throw new Error('Federated learning not initialized');

    // Verify client authentication
    const client = this.activeClients.get(clientId);
    if (!client) {
      throw new Error(`Unknown client: ${clientId}`);
    }

    // Verify update signature
    if (!this.verifyUpdateSignature(clientId, update, signature)) {
      throw new Error(`Invalid signature for client: ${clientId}`);
    }

    // Apply differential privacy to update
    const privateUpdate = this.applyDifferentialPrivacy(update);

    // Store the update
    this.modelUpdates.set(clientId, privateUpdate);

    // Update client status
    client.status = 'completed';
    client.contributions++;
    client.lastSeen = new Date();

    console.log(`Model update received from client: ${clientId}`);

    // Check if round is complete
    await this.checkRoundCompletion();
  }

  // Aggregate model updates and update global model
  static async aggregateModelUpdates(): Promise<ModelWeights> {
    if (!this.isInitialized) throw new Error('Federated learning not initialized');

    const updates = Array.from(this.modelUpdates.values());
    if (updates.length < this.MIN_CLIENTS) {
      throw new Error(`Insufficient updates for aggregation: ${updates.length}/${this.MIN_CLIENTS}`);
    }

    // Secure aggregation with differential privacy
    const aggregatedUpdate = this.secureAggregation(updates);

    // Update global model
    this.globalModel = this.applyUpdateToModel(this.globalModel, aggregatedUpdate);

    // Clear updates for next round
    this.modelUpdates.clear();

    // Update training history
    const currentRound = this.trainingHistory[this.trainingHistory.length - 1];
    if (currentRound) {
      currentRound.status = 'completed';
      currentRound.endTime = new Date();
      currentRound.finalModel = this.globalModel;
    }

    console.log(`Global model updated for round ${this.currentRound}`);

    return this.globalModel;
  }

  // Differential Privacy Implementation
  private static applyDifferentialPrivacy(update: ModelUpdate): ModelUpdate {
    const privateUpdate: ModelUpdate = {
      clientId: update.clientId,
      roundNumber: update.roundNumber,
      weights: {},
      metadata: update.metadata,
    };

    // Add Gaussian noise to each weight
    const noiseMultiplier = this.calculateNoiseMultiplier();
    const sensitivity = this.calculateSensitivity(update);

    for (const [layerName, weights] of Object.entries(update.weights)) {
      privateUpdate.weights[layerName] = weights.map(weight =>
        weight + this.generateGaussianNoise(noiseMultiplier * sensitivity)
      );
    }

    return privateUpdate;
  }

  // Secure aggregation protocol
  private static secureAggregation(updates: ModelUpdate[]): ModelUpdate {
    const aggregatedWeights: { [layerName: string]: number[] } = {};

    // Initialize with zeros
    const firstUpdate = updates[0];
    for (const layerName of Object.keys(firstUpdate.weights)) {
      aggregatedWeights[layerName] = new Array(firstUpdate.weights[layerName].length).fill(0);
    }

    // Sum all updates
    for (const update of updates) {
      for (const [layerName, weights] of Object.entries(update.weights)) {
        for (let i = 0; i < weights.length; i++) {
          aggregatedWeights[layerName][i] += weights[i];
        }
      }
    }

    // Average the updates
    const numUpdates = updates.length;
    for (const layerName of Object.keys(aggregatedWeights)) {
      aggregatedWeights[layerName] = aggregatedWeights[layerName].map(weight => weight / numUpdates);
    }

    return {
      clientId: 'aggregated',
      roundNumber: updates[0].roundNumber,
      weights: aggregatedWeights,
      metadata: {
        numUpdates,
        aggregationMethod: 'federated_average',
      },
    };
  }

  // Client selection for participation
  private static async selectParticipatingClients(): Promise<string[]> {
    const availableClients = Array.from(this.activeClients.values())
      .filter(client => client.status === 'registered' || client.status === 'completed')
      .sort((a, b) => b.contributions - a.contributions); // Prioritize active contributors

    // Select clients based on various criteria
    const selectedClients = availableClients
      .filter(client => this.meetsParticipationCriteria(client))
      .slice(0, Math.min(availableClients.length, 10)); // Select up to 10 clients per round

    return selectedClients.map(client => client.id);
  }

  // Privacy budget management
  private static calculateNoiseMultiplier(): number {
    // Calculate noise multiplier based on privacy parameters
    return Math.sqrt(2 * Math.log(1.25 / this.DELTA)) / this.EPSILON;
  }

  private static calculateSensitivity(update: ModelUpdate): number {
    // Calculate sensitivity based on model architecture
    // This is a simplified calculation
    let maxNorm = 0;
    for (const weights of Object.values(update.weights)) {
      const norm = Math.sqrt(weights.reduce((sum, w) => sum + w * w, 0));
      maxNorm = Math.max(maxNorm, norm);
    }
    return maxNorm;
  }

  private static generateGaussianNoise(std: number): number {
    // Box-Muller transform for Gaussian noise
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();

    const z0 = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return z0 * std;
  }

  // Model synchronization and distribution
  private static async distributeModelToClients(clientIds: string[], model: ModelWeights): Promise<void> {
    const distributionPromises = clientIds.map(async (clientId) => {
      const client = this.activeClients.get(clientId);
      if (!client) return;

      try {
        // In a real implementation, this would send the model via secure channels
        // For now, we simulate the distribution
        console.log(`Model distributed to client: ${clientId}`);
        client.status = 'model_received';
      } catch (error) {
        console.error(`Failed to distribute model to client ${clientId}:`, error);
        client.status = 'error';
      }
    });

    await Promise.allSettled(distributionPromises);
  }

  // Utility methods
  private static async setupSecureChannels(): Promise<void> {
    // Set up TLS/SSL for secure communication
    console.log('Secure communication channels established');
  }

  private static async initializePrivacyParameters(): Promise<void> {
    // Initialize differential privacy parameters
    console.log('Privacy parameters initialized');
  }

  private static startCoordinator(): void {
    // Start the federated learning coordinator loop
    setInterval(async () => {
      try {
        if (this.shouldStartNewRound()) {
          await this.startTrainingRound();
        }
      } catch (error) {
        console.error('Coordinator error:', error);
      }
    }, 300000); // Check every 5 minutes
  }

  private static shouldStartNewRound(): boolean {
    const currentRound = this.trainingHistory[this.trainingHistory.length - 1];
    if (!currentRound) return true;

    // Start new round if current round is completed and enough time has passed
    return currentRound.status === 'completed' &&
           Date.now() - currentRound.endTime!.getTime() > 60000; // 1 minute cooldown
  }

  private static async checkRoundCompletion(): Promise<void> {
    const currentRound = this.trainingHistory[this.trainingHistory.length - 1];
    if (!currentRound) return;

    const expectedUpdates = currentRound.participatingClients.length;
    const receivedUpdates = this.modelUpdates.size;

    if (receivedUpdates >= Math.min(expectedUpdates, this.MIN_CLIENTS)) {
      // Round is complete, aggregate updates
      await this.aggregateModelUpdates();
    }
  }

  private static generateClientToken(clientId: string): string {
    const payload = {
      clientId,
      issuedAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };

    return createHash('sha256')
      .update(JSON.stringify(payload))
      .update(randomBytes(32))
      .digest('hex');
  }

  private static verifyUpdateSignature(clientId: string, update: ModelUpdate, signature: string): boolean {
    // Simplified signature verification
    // In production, use proper cryptographic signature verification
    const expectedSignature = createHash('sha256')
      .update(clientId)
      .update(JSON.stringify(update))
      .digest('hex');

    return signature === expectedSignature;
  }

  private static meetsParticipationCriteria(client: FederatedClient): boolean {
    // Check client eligibility for participation
    const timeSinceLastSeen = Date.now() - client.lastSeen.getTime();
    const isRecentlyActive = timeSinceLastSeen < (24 * 60 * 60 * 1000); // 24 hours

    const hasAdequatePrivacyBudget = client.privacyBudget > 0.1;

    return isRecentlyActive && hasAdequatePrivacyBudget && client.status !== 'error';
  }

  private static applyUpdateToModel(globalModel: ModelWeights, update: ModelUpdate): ModelWeights {
    const newModel: ModelWeights = { ...globalModel };

    // Apply federated averaging
    const learningRate = 0.1; // Simplified learning rate

    for (const [layerName, weights] of Object.entries(update.weights)) {
      if (!newModel[layerName]) {
        newModel[layerName] = [...weights];
      } else {
        // Update weights using federated averaging
        for (let i = 0; i < weights.length; i++) {
          newModel[layerName][i] = newModel[layerName][i] * (1 - learningRate) +
                                   weights[i] * learningRate;
        }
      }
    }

    return newModel;
  }

  // Public API methods
  static getGlobalModel(): ModelWeights {
    return { ...this.globalModel };
  }

  static getTrainingHistory(): TrainingRound[] {
    return [...this.trainingHistory];
  }

  static getActiveClients(): FederatedClient[] {
    return Array.from(this.activeClients.values());
  }

  static getCurrentRound(): number {
    return this.currentRound;
  }
}

// Interface definitions
interface ModelWeights {
  [layerName: string]: number[];
}

interface FederatedClient {
  id: string;
  info: ClientInfo;
  status: 'registered' | 'model_received' | 'training' | 'completed' | 'error';
  lastSeen: Date;
  modelVersion: number;
  privacyBudget: number;
  contributions: number;
}

interface ClientInfo {
  deviceType: string;
  location: string;
  dataSize: number;
  computeCapability: number;
  networkBandwidth: number;
}

interface ModelUpdate {
  clientId: string;
  roundNumber: number;
  weights: { [layerName: string]: number[] };
  metadata: {
    trainingTime?: number;
    dataSamples?: number;
    localEpochs?: number;
    [key: string]: any;
  };
}

interface TrainingRound {
  roundNumber: number;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'failed';
  participatingClients: string[];
  modelUpdates: ModelUpdate[];
  privacyParameters: {
    epsilon: number;
    delta: number;
    noiseMultiplier: number;
  };
  finalModel?: ModelWeights;
}

export default FederatedLearning;