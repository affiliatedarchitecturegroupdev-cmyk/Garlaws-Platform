// Distributed Data Processing Engine for Edge Computing
export interface DataPartition {
  id: string;
  data: any;
  size: number; // bytes
  checksum: string;
  dependencies: string[]; // partition IDs this depends on
  processedBy?: string; // device ID that processed this partition
  processingTime?: number; // milliseconds
  result?: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retries: number;
  maxRetries: number;
  priority: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface ProcessingTask {
  id: string;
  name: string;
  type: 'map_reduce' | 'parallel_processing' | 'federated_learning' | 'distributed_analytics' | 'data_aggregation';
  algorithm: string; // specific algorithm implementation
  partitions: DataPartition[];
  coordinator: string; // device ID of coordinator
  workers: string[]; // device IDs of workers
  status: 'initializing' | 'partitioning' | 'processing' | 'aggregating' | 'completed' | 'failed';
  progress: number; // 0-100
  configuration: {
    maxWorkers?: number;
    timeout?: number; // milliseconds
    faultTolerance?: number; // percentage of failures allowed
    dataLocality?: boolean; // prefer local data processing
    loadBalancing?: 'round_robin' | 'least_loaded' | 'adaptive';
  };
  results: {
    aggregatedData?: any;
    statistics: {
      totalPartitions: number;
      completedPartitions: number;
      failedPartitions: number;
      averageProcessingTime: number;
      totalDataProcessed: number; // bytes
      networkOverhead: number; // bytes
    };
    performance: {
      totalTime: number;
      efficiency: number; // 0-1, processing efficiency
      scalability: number; // 0-1, how well it scales
    };
  };
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface ProcessingNode {
  deviceId: string;
  capabilities: {
    processingPower: number;
    memory: number;
    networkBandwidth: number;
    supportedAlgorithms: string[];
    currentLoad: number; // 0-1
  };
  status: 'available' | 'busy' | 'offline' | 'maintenance';
  assignedTasks: string[]; // task IDs
  completedTasks: number;
  failedTasks: number;
  performance: {
    averageTaskTime: number;
    successRate: number;
    lastActive: Date;
  };
  location: {
    zone: string;
    dataLocality: string[]; // data partitions available locally
  };
}

export interface DistributedAlgorithm {
  name: string;
  type: ProcessingTask['type'];
  implementation: {
    partitioner: (data: any, numPartitions: number) => DataPartition[];
    processor: (partition: DataPartition) => Promise<any>;
    aggregator: (results: any[]) => any;
    validator?: (result: any) => boolean;
  };
  requirements: {
    minWorkers: number;
    maxWorkers: number;
    dataSizePerWorker: number; // bytes
    memoryPerWorker: number; // MB
    networkRequirements: 'low' | 'medium' | 'high';
  };
  performance: {
    scalability: number; // 0-1
    efficiency: number; // 0-1
    faultTolerance: number; // 0-1
  };
}

class DistributedProcessingEngine {
  private tasks: Map<string, ProcessingTask> = new Map();
  private nodes: Map<string, ProcessingNode> = new Map();
  private algorithms: Map<string, DistributedAlgorithm> = new Map();
  private activePartitions: Map<string, DataPartition> = new Map();

  constructor() {
    this.initializeAlgorithms();
    this.initializeNodes();
    this.startTaskScheduler();
    this.startHealthMonitoring();
  }

  private initializeAlgorithms(): void {
    // Map-Reduce Algorithm
    this.algorithms.set('word_count', {
      name: 'Word Count',
      type: 'map_reduce',
      implementation: {
        partitioner: (data: string, numPartitions: number) => {
          const words = data.split(/\s+/);
          const partitions: DataPartition[] = [];
          const wordsPerPartition = Math.ceil(words.length / numPartitions);

          for (let i = 0; i < numPartitions; i++) {
            const start = i * wordsPerPartition;
            const end = Math.min((i + 1) * wordsPerPartition, words.length);
            const partitionData = words.slice(start, end);

            partitions.push({
              id: `partition_${i}`,
              data: partitionData,
              size: JSON.stringify(partitionData).length,
              checksum: this.calculateChecksum(partitionData),
              dependencies: [],
              status: 'pending',
              retries: 0,
              maxRetries: 3,
              priority: 1,
              createdAt: new Date()
            });
          }

          return partitions;
        },
        processor: async (partition: DataPartition) => {
          const words = partition.data as string[];
          const wordCount: { [key: string]: number } = {};

          words.forEach(word => {
            const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
            if (cleanWord) {
              wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
            }
          });

          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

          return wordCount;
        },
        aggregator: (results: any[]) => {
          const finalCount: { [key: string]: number } = {};

          results.forEach(result => {
            Object.entries(result).forEach(([word, count]) => {
              finalCount[word] = (finalCount[word] || 0) + (count as number);
            });
          });

          return finalCount;
        }
      },
      requirements: {
        minWorkers: 1,
        maxWorkers: 10,
        dataSizePerWorker: 1000,
        memoryPerWorker: 50,
        networkRequirements: 'low'
      },
      performance: {
        scalability: 0.9,
        efficiency: 0.85,
        faultTolerance: 0.8
      }
    });

    // Parallel Data Processing Algorithm
    this.algorithms.set('parallel_sort', {
      name: 'Parallel Sort',
      type: 'parallel_processing',
      implementation: {
        partitioner: (data: number[], numPartitions: number) => {
          const partitions: DataPartition[] = [];
          const itemsPerPartition = Math.ceil(data.length / numPartitions);

          for (let i = 0; i < numPartitions; i++) {
            const start = i * itemsPerPartition;
            const end = Math.min((i + 1) * itemsPerPartition, data.length);
            const partitionData = data.slice(start, end);

            partitions.push({
              id: `sort_partition_${i}`,
              data: partitionData,
              size: partitionData.length * 8, // 8 bytes per number
              checksum: this.calculateChecksum(partitionData),
              dependencies: [],
              status: 'pending',
              retries: 0,
              maxRetries: 3,
              priority: 1,
              createdAt: new Date()
            });
          }

          return partitions;
        },
        processor: async (partition: DataPartition) => {
          const data = partition.data as number[];
          // Simple bubble sort for demonstration
          const sorted = [...data].sort((a, b) => a - b);

          // Simulate processing time based on data size
          await new Promise(resolve => setTimeout(resolve, data.length * 0.1));

          return sorted;
        },
        aggregator: (results: any[]) => {
          // Merge sorted arrays using merge sort approach
          const merge = (left: number[], right: number[]): number[] => {
            const result: number[] = [];
            let leftIndex = 0;
            let rightIndex = 0;

            while (leftIndex < left.length && rightIndex < right.length) {
              if (left[leftIndex] < right[rightIndex]) {
                result.push(left[leftIndex]);
                leftIndex++;
              } else {
                result.push(right[rightIndex]);
                rightIndex++;
              }
            }

            return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
          };

          return results.reduce((merged, current) => merge(merged, current), []);
        }
      },
      requirements: {
        minWorkers: 2,
        maxWorkers: 8,
        dataSizePerWorker: 5000,
        memoryPerWorker: 100,
        networkRequirements: 'medium'
      },
      performance: {
        scalability: 0.8,
        efficiency: 0.9,
        faultTolerance: 0.7
      }
    });

    // Federated Learning Algorithm
    this.algorithms.set('federated_avg', {
      name: 'Federated Averaging',
      type: 'federated_learning',
      implementation: {
        partitioner: (data: any, numPartitions: number) => {
          // In federated learning, each partition represents a client's local data
          const partitions: DataPartition[] = [];

          for (let i = 0; i < numPartitions; i++) {
            partitions.push({
              id: `client_${i}`,
              data: data, // Same global data for each client (in practice, each would have different data)
              size: JSON.stringify(data).length,
              checksum: this.calculateChecksum(data),
              dependencies: [],
              status: 'pending',
              retries: 0,
              maxRetries: 3,
              priority: 2,
              createdAt: new Date()
            });
          }

          return partitions;
        },
        processor: async (partition: DataPartition) => {
          // Simulate local model training
          const localModel = {
            weights: Array.from({ length: 10 }, () => Math.random()),
            bias: Math.random()
          };

          // Simulate training time
          await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

          return {
            modelUpdate: localModel,
            numSamples: Math.floor(Math.random() * 1000 + 500)
          };
        },
        aggregator: (results: any[]) => {
          // Federated averaging
          const totalSamples = results.reduce((sum, result) => sum + result.numSamples, 0);
          const averagedModel = {
            weights: results[0].modelUpdate.weights.map((_: any, i: number) =>
              results.reduce((sum, result) =>
                sum + (result.modelUpdate.weights[i] * result.numSamples), 0
              ) / totalSamples
            ),
            bias: results.reduce((sum, result) =>
              sum + (result.modelUpdate.bias * result.numSamples), 0
            ) / totalSamples
          };

          return {
            globalModel: averagedModel,
            totalClients: results.length,
            totalSamples,
            aggregationRound: Date.now()
          };
        }
      },
      requirements: {
        minWorkers: 3,
        maxWorkers: 50,
        dataSizePerWorker: 10000,
        memoryPerWorker: 200,
        networkRequirements: 'high'
      },
      performance: {
        scalability: 0.95,
        efficiency: 0.75,
        faultTolerance: 0.9
      }
    });
  }

  private initializeNodes(): void {
    // Initialize processing nodes (edge devices)
    const nodeIds = ['edge_gateway_main', 'edge_sensor_hub_001', 'edge_ai_node_001'];

    nodeIds.forEach((deviceId, index) => {
      const node: ProcessingNode = {
        deviceId,
        capabilities: {
          processingPower: 50 + index * 25, // Increasing power
          memory: 2 + index * 2, // GB
          networkBandwidth: 100 + index * 50, // Mbps
          supportedAlgorithms: ['word_count', 'parallel_sort', 'federated_avg'],
          currentLoad: 0
        },
        status: 'available',
        assignedTasks: [],
        completedTasks: 0,
        failedTasks: 0,
        performance: {
          averageTaskTime: 1000 + index * 500,
          successRate: 0.95 + index * 0.02,
          lastActive: new Date()
        },
        location: {
          zone: ['central', 'living_area', 'basement'][index],
          dataLocality: [`data_partition_${index}`]
        }
      };

      this.nodes.set(deviceId, node);
    });
  }

  async createTask(
    name: string,
    algorithmName: string,
    data: any,
    configuration: Partial<ProcessingTask['configuration']> = {}
  ): Promise<string> {
    const algorithm = this.algorithms.get(algorithmName);
    if (!algorithm) {
      throw new Error(`Algorithm ${algorithmName} not found`);
    }

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Determine number of partitions based on data size and algorithm requirements
    const dataSize = JSON.stringify(data).length;
    const maxWorkers = Math.min(
      configuration.maxWorkers || 5,
      Math.max(algorithm.requirements.minWorkers,
        Math.floor(dataSize / algorithm.requirements.dataSizePerWorker))
    );
    const numPartitions = Math.max(algorithm.requirements.minWorkers, maxWorkers);

    // Create partitions
    const partitions = algorithm.implementation.partitioner(data, numPartitions);

    // Select coordinator and workers
    const availableNodes = Array.from(this.nodes.values())
      .filter(node => node.status === 'available')
      .sort((a, b) => b.capabilities.processingPower - a.capabilities.processingPower);

    if (availableNodes.length < algorithm.requirements.minWorkers) {
      throw new Error('Insufficient available processing nodes');
    }

    const coordinator = availableNodes[0].deviceId;
    const workers = availableNodes.slice(0, numPartitions).map(node => node.deviceId);

    const task: ProcessingTask = {
      id: taskId,
      name,
      type: algorithm.type,
      algorithm: algorithmName,
      partitions,
      coordinator,
      workers,
      status: 'initializing',
      progress: 0,
      configuration: {
        maxWorkers: maxWorkers,
        timeout: 300000, // 5 minutes
        faultTolerance: 0.2,
        dataLocality: configuration.dataLocality ?? false,
        loadBalancing: configuration.loadBalancing ?? 'adaptive',
        ...configuration
      },
      results: {
        statistics: {
          totalPartitions: partitions.length,
          completedPartitions: 0,
          failedPartitions: 0,
          averageProcessingTime: 0,
          totalDataProcessed: dataSize,
          networkOverhead: 0
        },
        performance: {
          totalTime: 0,
          efficiency: 0,
          scalability: 0
        }
      },
      createdAt: new Date()
    };

    this.tasks.set(taskId, task);

    // Start task execution
    this.executeTask(task);

    return taskId;
  }

  private async executeTask(task: ProcessingTask): Promise<void> {
    const algorithm = this.algorithms.get(task.algorithm);
    if (!algorithm) return;

    task.status = 'partitioning';
    task.startedAt = new Date();

    // Assign partitions to workers
    for (let i = 0; i < task.partitions.length; i++) {
      const partition = task.partitions[i];
      const workerId = task.workers[i % task.workers.length];

      partition.processedBy = workerId;
      this.activePartitions.set(partition.id, partition);

      // Update worker load
      const worker = this.nodes.get(workerId);
      if (worker) {
        worker.assignedTasks.push(task.id);
        worker.capabilities.currentLoad += 0.2; // Assume 20% load per task
      }
    }

    task.status = 'processing';

    // Process partitions in parallel
    const processingPromises = task.partitions.map(async (partition) => {
      try {
        partition.status = 'processing';
        const startTime = Date.now();

        const result = await algorithm.implementation.processor(partition);

        partition.result = result;
        partition.status = 'completed';
        partition.processingTime = Date.now() - startTime;
        partition.completedAt = new Date();

        task.results.statistics.completedPartitions++;

      } catch (error) {
        partition.status = 'failed';
        partition.retries++;

        if (partition.retries < partition.maxRetries) {
          // Retry with different worker
          partition.status = 'pending';
        } else {
          task.results.statistics.failedPartitions++;
        }
      }
    });

    await Promise.all(processingPromises);

    // Check fault tolerance
    const failureRate = task.results.statistics.failedPartitions / task.results.statistics.totalPartitions;
    if (failureRate > (task.configuration.faultTolerance || 0.2)) {
      task.status = 'failed';
      task.error = `Failure rate ${failureRate.toFixed(2)} exceeds tolerance`;
    } else {
      // Aggregate results
      task.status = 'aggregating';

      const validResults = task.partitions
        .filter(p => p.status === 'completed')
        .map(p => p.result);

      if (validResults.length > 0) {
        task.results.aggregatedData = algorithm.implementation.aggregator(validResults);
      }

      task.status = 'completed';
    }

    // Calculate performance metrics
    const totalProcessingTime = task.partitions
      .filter(p => p.processingTime)
      .reduce((sum, p) => sum + (p.processingTime || 0), 0);

    task.results.statistics.averageProcessingTime = totalProcessingTime / task.results.statistics.completedPartitions;
    task.results.performance.totalTime = Date.now() - (task.startedAt?.getTime() || Date.now());
    task.results.performance.efficiency = task.results.statistics.completedPartitions / task.partitions.length;
    task.results.performance.scalability = Math.min(1, task.workers.length / Math.log(task.partitions.length + 1));

    task.completedAt = new Date();
    task.progress = 100;

    // Clean up worker assignments
    task.workers.forEach(workerId => {
      const worker = this.nodes.get(workerId);
      if (worker) {
        worker.assignedTasks = worker.assignedTasks.filter(t => t !== task.id);
        worker.capabilities.currentLoad = Math.max(0, worker.capabilities.currentLoad - 0.2);
        if (task.status === 'completed') {
          worker.completedTasks++;
        } else {
          worker.failedTasks++;
        }
      }
    });
  }

  getTaskStatus(taskId: string): ProcessingTask | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): ProcessingTask[] {
    return Array.from(this.tasks.values());
  }

  getNodeStatus(nodeId: string): ProcessingNode | undefined {
    return this.nodes.get(nodeId);
  }

  getAllNodes(): ProcessingNode[] {
    return Array.from(this.nodes.values());
  }

  getAlgorithm(algorithmName: string): DistributedAlgorithm | undefined {
    return this.algorithms.get(algorithmName);
  }

  getAllAlgorithms(): DistributedAlgorithm[] {
    return Array.from(this.algorithms.values());
  }

  // Load balancing
  async rebalanceWorkload(): Promise<{
    rebalancedTasks: number;
    improvedEfficiency: number;
  }> {
    let rebalancedTasks = 0;
    let totalEfficiencyGain = 0;

    // Find overloaded nodes
    const overloadedNodes = Array.from(this.nodes.values())
      .filter(node => node.capabilities.currentLoad > 0.8);

    // Find underloaded nodes
    const underloadedNodes = Array.from(this.nodes.values())
      .filter(node => node.capabilities.currentLoad < 0.3 && node.status === 'available');

    for (const overloadedNode of overloadedNodes) {
      for (const underloadedNode of underloadedNodes) {
        // Check if we can move tasks
        const tasksToMove = overloadedNode.assignedTasks.slice(0, 1); // Move one task

        for (const taskId of tasksToMove) {
          const task = this.tasks.get(taskId);
          if (task && task.status === 'processing') {
            // Update task assignment
            const partitionIndex = task.workers.indexOf(overloadedNode.deviceId);
            if (partitionIndex !== -1) {
              task.workers[partitionIndex] = underloadedNode.deviceId;

              // Update loads
              overloadedNode.capabilities.currentLoad -= 0.2;
              underloadedNode.capabilities.currentLoad += 0.2;
              underloadedNode.assignedTasks.push(taskId);

              rebalancedTasks++;
              totalEfficiencyGain += 0.1; // Assume 10% efficiency gain per rebalance
            }
          }
        }
      }
    }

    return {
      rebalancedTasks,
      improvedEfficiency: totalEfficiencyGain
    };
  }

  // Utility functions
  private calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Monitoring and maintenance
  private startTaskScheduler(): void {
    setInterval(() => {
      // Check for timed out tasks
      const now = Date.now();
      this.tasks.forEach(task => {
        if (task.status === 'processing' && task.startedAt) {
          const elapsed = now - task.startedAt.getTime();
          if (elapsed > (task.configuration.timeout || 300000)) {
            task.status = 'failed';
            task.error = 'Task timeout';
          }
        }
      });

      // Process pending tasks
      const pendingTasks = Array.from(this.tasks.values())
        .filter(task => task.status === 'initializing')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // FIFO

      pendingTasks.slice(0, 3).forEach(task => {
        if (task.status === 'initializing') {
          this.executeTask(task);
        }
      });
    }, 10000); // Check every 10 seconds
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      // Update node health
      this.nodes.forEach(node => {
        // Simulate occasional node failures
        if (Math.random() < 0.01) { // 1% chance per check
          node.status = 'offline';
        } else if (node.status === 'offline' && Math.random() < 0.1) { // 10% chance to recover
          node.status = 'available';
        }

        node.performance.lastActive = new Date();
      });

      // Update task progress
      this.tasks.forEach(task => {
        if (task.status === 'processing') {
          const completedPartitions = task.partitions.filter(p => p.status === 'completed').length;
          task.progress = (completedPartitions / task.partitions.length) * 100;
        }
      });
    }, 30000); // Update every 30 seconds
  }

  // Analytics
  getSystemAnalytics(): {
    totalTasks: number;
    activeTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageProcessingTime: number;
    systemEfficiency: number;
    nodeUtilization: number;
  } {
    const tasks = this.getAllTasks();
    const nodes = this.getAllNodes();

    const totalTasks = tasks.length;
    const activeTasks = tasks.filter(t => ['processing', 'partitioning', 'aggregating'].includes(t.status)).length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const failedTasks = tasks.filter(t => t.status === 'failed').length;

    const completedTaskTimes = tasks
      .filter(t => t.status === 'completed' && t.results.performance.totalTime)
      .map(t => t.results.performance.totalTime);

    const averageProcessingTime = completedTaskTimes.length > 0
      ? completedTaskTimes.reduce((a, b) => a + b, 0) / completedTaskTimes.length
      : 0;

    const systemEfficiency = completedTasks / Math.max(totalTasks, 1);

    const nodeUtilization = nodes.length > 0
      ? nodes.reduce((sum, node) => sum + node.capabilities.currentLoad, 0) / nodes.length
      : 0;

    return {
      totalTasks,
      activeTasks,
      completedTasks,
      failedTasks,
      averageProcessingTime,
      systemEfficiency,
      nodeUtilization
    };
  }
}

export const distributedProcessingEngine = new DistributedProcessingEngine();