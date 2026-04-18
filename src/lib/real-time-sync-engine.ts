// Advanced Real-Time Synchronization Engine
export interface SyncEndpoint {
  id: string;
  name: string;
  type: 'websocket' | 'sse' | 'mqtt' | 'webhook' | 'polling';
  url: string;
  protocol: string;
  authentication: {
    type: 'none' | 'basic' | 'bearer' | 'api_key';
    credentials?: any;
  };
  dataFormat: 'json' | 'protobuf' | 'msgpack' | 'csv';
  filters: {
    topics?: string[];
    dataTypes?: string[];
    sourceIds?: string[];
  };
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  lastConnected?: Date;
  connectionAttempts: number;
  messageCount: number;
  errorCount: number;
}

export interface DataSync {
  id: string;
  sourceType: 'iot_sensor' | 'digital_twin' | 'blockchain' | 'external_api' | 'user_input';
  sourceId: string;
  dataType: 'sensor_reading' | 'system_status' | 'transaction' | 'maintenance' | 'environmental';
  payload: any;
  timestamp: Date;
  sequenceNumber: number;
  checksum: string;
  metadata: {
    priority: 'low' | 'normal' | 'high' | 'critical';
    ttl?: number; // time to live in seconds
    retryCount: number;
    maxRetries: number;
  };
}

export interface SyncSubscription {
  id: string;
  subscriberId: string;
  subscriberType: 'digital_twin' | 'dashboard' | 'mobile_app' | 'external_system';
  filters: {
    dataTypes?: string[];
    sourceIds?: string[];
    propertyIds?: string[];
    priority?: ('low' | 'normal' | 'high' | 'critical')[];
  };
  deliveryMethod: 'push' | 'pull';
  endpoint?: string;
  lastDelivered?: Date;
  messageCount: number;
  status: 'active' | 'paused' | 'error';
}

export interface SyncQueue {
  id: string;
  name: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  items: DataSync[];
  processingRate: number; // items per second
  errorRate: number;
  lastProcessed?: Date;
  status: 'active' | 'paused' | 'backlogged';
}

export interface RealTimeMetrics {
  totalConnections: number;
  activeConnections: number;
  messagesPerSecond: number;
  averageLatency: number; // milliseconds
  dataThroughput: number; // bytes per second
  errorRate: number;
  queueDepth: number;
  uptime: number; // percentage
  lastUpdated: Date;
}

export interface ConflictResolution {
  id: string;
  dataType: string;
  sourceIds: string[];
  conflictingValues: any[];
  resolutionStrategy: 'latest_wins' | 'merge' | 'manual' | 'source_priority';
  resolvedValue?: any;
  resolvedAt?: Date;
  status: 'pending' | 'resolved' | 'failed';
}

class RealTimeSyncEngine {
  private endpoints: Map<string, SyncEndpoint> = new Map();
  private subscriptions: Map<string, SyncSubscription> = new Map();
  private queues: Map<string, SyncQueue> = new Map();
  private conflicts: Map<string, ConflictResolution> = new Map();
  private connections: Map<string, WebSocket | EventSource> = new Map();

  // In-memory data store for sync state
  private syncState: Map<string, any> = new Map();
  private sequenceCounter = 0;

  constructor() {
    this.initializeQueues();
    this.initializeEndpoints();
    this.startMetricsCollection();
  }

  private initializeQueues(): void {
    // Create priority queues for different data types
    const priorities: Array<'low' | 'normal' | 'high' | 'critical'> = ['low', 'normal', 'high', 'critical'];

    priorities.forEach(priority => {
      this.queues.set(priority, {
        id: `queue_${priority}`,
        name: `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Queue`,
        priority,
        items: [],
        processingRate: 0,
        errorRate: 0,
        status: 'active'
      });
    });
  }

  private initializeEndpoints(): void {
    // Initialize default endpoints
    this.registerEndpoint({
      id: 'iot_sensor_feed',
      name: 'IoT Sensor Data Feed',
      type: 'websocket',
      url: 'ws://localhost:8080/iot',
      protocol: 'ws',
      authentication: { type: 'bearer', credentials: { token: 'iot_token_123' } },
      dataFormat: 'json',
      filters: { dataTypes: ['sensor_reading'] },
      status: 'disconnected',
      connectionAttempts: 0,
      messageCount: 0,
      errorCount: 0
    });

    this.registerEndpoint({
      id: 'blockchain_updates',
      name: 'Blockchain Transaction Updates',
      type: 'webhook',
      url: 'https://api.garlaws.com/webhooks/blockchain',
      protocol: 'https',
      authentication: { type: 'api_key', credentials: { key: 'blockchain_api_key' } },
      dataFormat: 'json',
      filters: { dataTypes: ['transaction'] },
      status: 'disconnected',
      connectionAttempts: 0,
      messageCount: 0,
      errorCount: 0
    });

    this.registerEndpoint({
      id: 'digital_twin_sync',
      name: 'Digital Twin Synchronization',
      type: 'sse',
      url: 'https://api.garlaws.com/sse/digital-twin',
      protocol: 'https',
      authentication: { type: 'bearer', credentials: { token: 'dt_token_456' } },
      dataFormat: 'json',
      filters: { dataTypes: ['system_status', 'sensor_reading'] },
      status: 'disconnected',
      connectionAttempts: 0,
      messageCount: 0,
      errorCount: 0
    });
  }

  async registerEndpoint(endpoint: SyncEndpoint): Promise<void> {
    this.endpoints.set(endpoint.id, endpoint);
  }

  async connectEndpoint(endpointId: string): Promise<void> {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) {
      throw new Error(`Endpoint ${endpointId} not found`);
    }

    try {
      endpoint.status = 'connecting';
      endpoint.connectionAttempts++;

      switch (endpoint.type) {
        case 'websocket':
          await this.connectWebSocket(endpoint);
          break;
        case 'sse':
          await this.connectSSE(endpoint);
          break;
        case 'mqtt':
          await this.connectMQTT(endpoint);
          break;
        default:
          throw new Error(`Unsupported endpoint type: ${endpoint.type}`);
      }

      endpoint.status = 'connected';
      endpoint.lastConnected = new Date();
    } catch (error) {
      endpoint.status = 'error';
      endpoint.errorCount++;
      throw error;
    }
  }

  private async connectWebSocket(endpoint: SyncEndpoint): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(endpoint.url);

        ws.onopen = () => {
          console.log(`Connected to WebSocket: ${endpoint.name}`);
          this.connections.set(endpoint.id, ws);
          resolve();
        };

        ws.onmessage = (event) => {
          this.handleIncomingData(endpoint.id, JSON.parse(event.data));
        };

        ws.onerror = (error) => {
          console.error(`WebSocket error for ${endpoint.name}:`, error);
          reject(error);
        };

        ws.onclose = () => {
          console.log(`WebSocket closed: ${endpoint.name}`);
          this.connections.delete(endpoint.id);
          endpoint.status = 'disconnected';
        };

        // Timeout after 10 seconds
        setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            ws.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  private async connectSSE(endpoint: SyncEndpoint): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const eventSource = new EventSource(endpoint.url);

        eventSource.onopen = () => {
          console.log(`Connected to SSE: ${endpoint.name}`);
          this.connections.set(endpoint.id, eventSource);
          resolve();
        };

        eventSource.onmessage = (event) => {
          this.handleIncomingData(endpoint.id, JSON.parse(event.data));
        };

        eventSource.onerror = (error) => {
          console.error(`SSE error for ${endpoint.name}:`, error);
          eventSource.close();
          this.connections.delete(endpoint.id);
          endpoint.status = 'error';
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private async connectMQTT(endpoint: SyncEndpoint): Promise<void> {
    // MQTT connection would be implemented here
    // For demo purposes, we'll simulate a connection
    console.log(`Connecting to MQTT: ${endpoint.name}`);
    // In real implementation, would use MQTT.js or similar
    throw new Error('MQTT connection not implemented in demo');
  }

  async disconnectEndpoint(endpointId: string): Promise<void> {
    const connection = this.connections.get(endpointId);
    if (connection) {
      if (connection instanceof WebSocket) {
        connection.close();
      } else if (connection instanceof EventSource) {
        connection.close();
      }
      this.connections.delete(endpointId);
    }

    const endpoint = this.endpoints.get(endpointId);
    if (endpoint) {
      endpoint.status = 'disconnected';
    }
  }

  async publishData(dataSync: Omit<DataSync, 'id' | 'sequenceNumber' | 'checksum'>): Promise<void> {
    const sync: DataSync = {
      ...dataSync,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sequenceNumber: ++this.sequenceCounter,
      checksum: this.calculateChecksum(dataSync.payload)
    };

    // Add to appropriate queue based on priority
    const queue = this.queues.get(dataSync.metadata.priority);
    if (queue) {
      queue.items.push(sync);
      await this.processQueue(queue.id);
    }

    // Notify subscribers
    await this.notifySubscribers(sync);
  }

  private async processQueue(queueId: string): Promise<void> {
    const queue = this.queues.get(queueId);
    if (!queue || queue.status !== 'active') return;

    const startTime = Date.now();
    let processedCount = 0;
    let errorCount = 0;

    // Process up to 10 items at a time
    const itemsToProcess = queue.items.splice(0, 10);

    for (const item of itemsToProcess) {
      try {
        await this.deliverData(item);
        processedCount++;
      } catch (error) {
        console.error(`Failed to process sync item ${item.id}:`, error);
        errorCount++;

        // Re-queue with reduced priority if retries remain
        if (item.metadata.retryCount < item.metadata.maxRetries) {
          item.metadata.retryCount++;
          queue.items.push(item);
        }
      }
    }

    // Update queue metrics
    const processingTime = Date.now() - startTime;
    queue.processingRate = processedCount / (processingTime / 1000);
    queue.errorRate = errorCount / itemsToProcess.length;
    queue.lastProcessed = new Date();
  }

  private async deliverData(sync: DataSync): Promise<void> {
    // Store in sync state
    const key = `${sync.sourceType}_${sync.sourceId}_${sync.dataType}`;
    this.syncState.set(key, {
      data: sync.payload,
      timestamp: sync.timestamp,
      sequenceNumber: sync.sequenceNumber
    });

    // Check for conflicts
    await this.checkForConflicts(sync);

    // Update digital twin or other systems
    if (sync.sourceType === 'iot_sensor') {
      // Update digital twin with sensor data
      // This would integrate with digitalTwinEngine
    } else if (sync.sourceType === 'blockchain') {
      // Update with blockchain data
      // This would integrate with blockchainEngine
    }
  }

  private async checkForConflicts(sync: DataSync): Promise<void> {
    const conflictKey = `${sync.dataType}_${sync.sourceId}`;
    const existingData = this.syncState.get(`${sync.sourceType}_${sync.sourceId}_${sync.dataType}`);

    if (existingData && existingData.sequenceNumber > sync.sequenceNumber) {
      // Create conflict resolution
      const conflict: ConflictResolution = {
        id: `conflict_${Date.now()}`,
        dataType: sync.dataType,
        sourceIds: [sync.sourceId],
        conflictingValues: [existingData.data, sync.payload],
        resolutionStrategy: 'latest_wins',
        status: 'pending'
      };

      this.conflicts.set(conflict.id, conflict);

      // Auto-resolve with latest wins strategy
      if (conflict.resolutionStrategy === 'latest_wins') {
        conflict.resolvedValue = sync.payload;
        conflict.resolvedAt = new Date();
        conflict.status = 'resolved';
      }
    }
  }

  async createSubscription(subscription: Omit<SyncSubscription, 'id' | 'lastDelivered' | 'messageCount'>): Promise<void> {
    const sub: SyncSubscription = {
      ...subscription,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastDelivered: undefined,
      messageCount: 0
    };

    this.subscriptions.set(sub.id, sub);
  }

  private async notifySubscribers(sync: DataSync): Promise<void> {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.status !== 'active') continue;

      // Check if sync matches subscription filters
      if (this.matchesFilters(sync, subscription.filters)) {
        try {
          if (subscription.deliveryMethod === 'push') {
            await this.deliverToSubscriber(sync, subscription);
          }
          subscription.messageCount++;
          subscription.lastDelivered = new Date();
        } catch (error) {
          console.error(`Failed to deliver to subscriber ${subscription.id}:`, error);
          subscription.status = 'error';
        }
      }
    }
  }

  private matchesFilters(sync: DataSync, filters: SyncSubscription['filters']): boolean {
    if (filters.dataTypes && !filters.dataTypes.includes(sync.dataType)) return false;
    if (filters.sourceIds && !filters.sourceIds.includes(sync.sourceId)) return false;
    if (filters.priority && !filters.priority.includes(sync.metadata.priority)) return false;

    return true;
  }

  private async deliverToSubscriber(sync: DataSync, subscription: SyncSubscription): Promise<void> {
    // In real implementation, this would send data to subscriber endpoint
    // For demo, we'll simulate delivery
    console.log(`Delivering sync ${sync.id} to subscriber ${subscription.subscriberId}`);

    if (subscription.endpoint) {
      // Simulate HTTP POST to endpoint
      // await fetch(subscription.endpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(sync)
      // });
    }
  }

  private handleIncomingData(endpointId: string, data: any): void {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) return;

    endpoint.messageCount++;

    // Convert incoming data to DataSync format
    const sync: DataSync = {
      id: `incoming_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceType: this.getSourceTypeFromEndpoint(endpoint),
      sourceId: endpointId,
      dataType: data.type || 'unknown',
      payload: data,
      timestamp: new Date(),
      sequenceNumber: ++this.sequenceCounter,
      checksum: this.calculateChecksum(data),
      metadata: {
        priority: data.priority || 'normal',
        retryCount: 0,
        maxRetries: 3
      }
    };

    // Publish the incoming data
    this.publishData(sync);
  }

  private getSourceTypeFromEndpoint(endpoint: SyncEndpoint): DataSync['sourceType'] {
    if (endpoint.name.includes('IoT') || endpoint.name.includes('sensor')) return 'iot_sensor';
    if (endpoint.name.includes('blockchain')) return 'blockchain';
    if (endpoint.name.includes('digital') || endpoint.name.includes('twin')) return 'digital_twin';
    return 'external_api';
  }

  private calculateChecksum(data: any): string {
    // Simple checksum calculation
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  getMetrics(): RealTimeMetrics {
    const connections = Array.from(this.connections.values());
    const queues = Array.from(this.queues.values());

    const totalQueueDepth = queues.reduce((sum, queue) => sum + queue.items.length, 0);
    const errorRate = queues.reduce((sum, queue) => sum + queue.errorRate, 0) / queues.length;

    return {
      totalConnections: this.endpoints.size,
      activeConnections: connections.length,
      messagesPerSecond: 0, // Would be calculated from actual metrics
      averageLatency: 50, // Mock value
      dataThroughput: 1024, // Mock value
      errorRate,
      queueDepth: totalQueueDepth,
      uptime: 99.5,
      lastUpdated: new Date()
    };
  }

  getEndpointStatus(): Array<{ id: string; name: string; status: string; messageCount: number }> {
    return Array.from(this.endpoints.values()).map(endpoint => ({
      id: endpoint.id,
      name: endpoint.name,
      status: endpoint.status,
      messageCount: endpoint.messageCount
    }));
  }

  getQueueStatus(): Array<{ id: string; name: string; depth: number; processingRate: number; status: string }> {
    return Array.from(this.queues.values()).map(queue => ({
      id: queue.id,
      name: queue.name,
      depth: queue.items.length,
      processingRate: queue.processingRate,
      status: queue.status
    }));
  }

  getConflicts(): ConflictResolution[] {
    return Array.from(this.conflicts.values()).filter(c => c.status === 'pending');
  }

  // Start metrics collection
  private startMetricsCollection(): void {
    setInterval(() => {
      // Update connection statuses
      this.endpoints.forEach(endpoint => {
        if (endpoint.status === 'connected') {
          const connection = this.connections.get(endpoint.id);
          if (!connection) {
            endpoint.status = 'disconnected';
          }
        }
      });

      // Process queues
      this.queues.forEach(queue => {
        if (queue.items.length > 0) {
          this.processQueue(queue.id);
        }
      });
    }, 5000); // Every 5 seconds
  }
}

export const realTimeSyncEngine = new RealTimeSyncEngine();