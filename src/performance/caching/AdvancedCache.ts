import { createClient, RedisClientType } from 'redis';

// Advanced Caching Layer with Redis Clusters
export class AdvancedCache {
  private static readonly CACHE_TTL = {
    L1: 300,    // 5 minutes - Hot data
    L2: 3600,   // 1 hour - Warm data
    L3: 86400,  // 24 hours - Cold data
  };

  private static readonly CACHE_KEYS = {
    USER_SESSIONS: 'user_sessions',
    API_RESPONSES: 'api_responses',
    DATABASE_QUERIES: 'db_queries',
    STATIC_CONTENT: 'static_content',
    USER_PROFILES: 'user_profiles',
    ANALYTICS_DATA: 'analytics_data',
  };

  // Redis cluster clients for different cache levels
  private static l1Client: RedisClientType; // Hot data - Redis instance
  private static l2Client: RedisClientType; // Warm data - Redis cluster
  private static l3Client: RedisClientType; // Cold data - Redis cluster with persistence

  private static isInitialized = false;

  // Initialize cache layer
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // L1 Cache - Hot data (in-memory Redis)
      this.l1Client = createClient({
        url: process.env.REDIS_L1_URL || 'redis://localhost:6379/0',
        socket: {
          connectTimeout: 5000,
          lazyConnect: true,
        },
      });

      // L2 Cache - Warm data (Redis cluster)
      this.l2Client = createClient({
        url: process.env.REDIS_L2_URL || 'redis://localhost:6379/1',
        socket: {
          connectTimeout: 5000,
          lazyConnect: true,
        },
      });

      // L3 Cache - Cold data (Redis cluster with persistence)
      this.l3Client = createClient({
        url: process.env.REDIS_L3_URL || 'redis://localhost:6379/2',
        socket: {
          connectTimeout: 5000,
          lazyConnect: true,
        },
      });

      // Connect all clients
      await Promise.all([
        this.l1Client.connect(),
        this.l2Client.connect(),
        this.l3Client.connect(),
      ]);

      // Set up event handlers
      this.setupEventHandlers();

      // Initialize cache warming
      await this.warmCache();

      this.isInitialized = true;
      console.log('Advanced cache layer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize cache layer:', error);
      throw error;
    }
  }

  // Multi-level cache retrieval
  static async get(key: string): Promise<any | null> {
    if (!this.isInitialized) await this.initialize();

    try {
      // Try L1 cache first (hot data)
      const l1Data = await this.l1Client.get(key);
      if (l1Data) {
        console.log(`Cache hit L1 for key: ${key}`);
        return JSON.parse(l1Data);
      }

      // Try L2 cache (warm data)
      const l2Data = await this.l2Client.get(key);
      if (l2Data) {
        console.log(`Cache hit L2 for key: ${key}`);
        const parsedData = JSON.parse(l2Data);

        // Promote to L1 cache
        await this.l1Client.setEx(key, this.CACHE_TTL.L1, JSON.stringify(parsedData));
        return parsedData;
      }

      // Try L3 cache (cold data)
      const l3Data = await this.l3Client.get(key);
      if (l3Data) {
        console.log(`Cache hit L3 for key: ${key}`);
        const parsedData = JSON.parse(l3Data);

        // Promote to L1 and L2 caches
        await Promise.all([
          this.l1Client.setEx(key, this.CACHE_TTL.L1, JSON.stringify(parsedData)),
          this.l2Client.setEx(key, this.CACHE_TTL.L2, JSON.stringify(parsedData)),
        ]);
        return parsedData;
      }

      console.log(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      console.error(`Cache retrieval error for key ${key}:`, error);
      return null;
    }
  }

  // Multi-level cache storage
  static async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    if (!this.isInitialized) await this.initialize();

    try {
      const serializedValue = JSON.stringify(value);
      const { ttl = this.CACHE_TTL.L1, levels = ['L1', 'L2', 'L3'] } = options;

      const operations = [];

      if (levels.includes('L1')) {
        operations.push(
          this.l1Client.setEx(key, Math.min(ttl, this.CACHE_TTL.L1), serializedValue)
        );
      }

      if (levels.includes('L2')) {
        operations.push(
          this.l2Client.setEx(key, Math.min(ttl, this.CACHE_TTL.L2), serializedValue)
        );
      }

      if (levels.includes('L3')) {
        operations.push(
          this.l3Client.setEx(key, Math.min(ttl, this.CACHE_TTL.L3), serializedValue)
        );
      }

      await Promise.all(operations);
      console.log(`Cached key: ${key} in levels: ${levels.join(', ')}`);
    } catch (error) {
      console.error(`Cache storage error for key ${key}:`, error);
    }
  }

  // Cache invalidation strategies
  static async invalidate(pattern: string): Promise<void> {
    if (!this.isInitialized) await this.initialize();

    try {
      const operations = [];

      // Invalidate L1 cache
      const l1Keys = await this.l1Client.keys(pattern);
      if (l1Keys.length > 0) {
        operations.push(this.l1Client.del(l1Keys));
      }

      // Invalidate L2 cache
      const l2Keys = await this.l2Client.keys(pattern);
      if (l2Keys.length > 0) {
        operations.push(this.l2Client.del(l2Keys));
      }

      // Invalidate L3 cache
      const l3Keys = await this.l3Client.keys(pattern);
      if (l3Keys.length > 0) {
        operations.push(this.l3Client.del(l3Keys));
      }

      await Promise.all(operations);
      console.log(`Invalidated cache pattern: ${pattern}`);
    } catch (error) {
      console.error(`Cache invalidation error for pattern ${pattern}:`, error);
    }
  }

  // Intelligent cache warming
  private static async warmCache(): Promise<void> {
    console.log('Starting cache warming process...');

    try {
      // Warm frequently accessed data
      const warmKeys = [
        `${this.CACHE_KEYS.USER_PROFILES}:*`,
        `${this.CACHE_KEYS.API_RESPONSES}:popular:*`,
        `${this.CACHE_KEYS.STATIC_CONTENT}:*`,
      ];

      for (const pattern of warmKeys) {
        const keys = await this.l3Client.keys(pattern);
        for (const key of keys.slice(0, 100)) { // Limit to prevent overload
          const data = await this.l3Client.get(key);
          if (data) {
            // Promote to L1 and L2
            await Promise.all([
              this.l1Client.setEx(key, this.CACHE_TTL.L1, data),
              this.l2Client.setEx(key, this.CACHE_TTL.L2, data),
            ]);
          }
        }
      }

      console.log('Cache warming completed');
    } catch (error) {
      console.error('Cache warming failed:', error);
    }
  }

  // Cache analytics and monitoring
  static async getCacheStats(): Promise<CacheStats> {
    if (!this.isInitialized) await this.initialize();

    try {
      const [l1Info, l2Info, l3Info] = await Promise.all([
        this.l1Client.info('stats'),
        this.l2Client.info('stats'),
        this.l3Client.info('stats'),
      ]);

      return {
        l1: this.parseRedisStats(l1Info),
        l2: this.parseRedisStats(l2Info),
        l3: this.parseRedisStats(l3Info),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        l1: { hits: 0, misses: 0, keys: 0, memory: 0 },
        l2: { hits: 0, misses: 0, keys: 0, memory: 0 },
        l3: { hits: 0, misses: 0, keys: 0, memory: 0 },
        timestamp: new Date().toISOString(),
      };
    }
  }

  private static parseRedisStats(info: string): CacheLevelStats {
    const stats: Record<string, string> = {};
    info.split('\r\n').forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        stats[key] = value;
      }
    });

    return {
      hits: parseInt(stats['keyspace_hits'] || '0'),
      misses: parseInt(stats['keyspace_misses'] || '0'),
      keys: parseInt(stats['db0']?.split(',')[0]?.split('=')[1] || '0'),
      memory: parseInt(stats['used_memory'] || '0'),
    };
  }

  // Event handlers for cache monitoring
  private static setupEventHandlers(): void {
    const clients = [this.l1Client, this.l2Client, this.l3Client];

    clients.forEach((client, index) => {
      const level = ['L1', 'L2', 'L3'][index];

      client.on('error', (error) => {
        console.error(`Redis ${level} client error:`, error);
      });

      client.on('connect', () => {
        console.log(`Redis ${level} client connected`);
      });

      client.on('ready', () => {
        console.log(`Redis ${level} client ready`);
      });

      client.on('end', () => {
        console.log(`Redis ${level} client connection ended`);
      });
    });
  }

  // Graceful shutdown
  static async shutdown(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      await Promise.all([
        this.l1Client.quit(),
        this.l2Client.quit(),
        this.l3Client.quit(),
      ]);

      this.isInitialized = false;
      console.log('Advanced cache layer shut down successfully');
    } catch (error) {
      console.error('Error during cache shutdown:', error);
    }
  }
}

// Cache configuration interfaces
interface CacheOptions {
  ttl?: number;
  levels?: ('L1' | 'L2' | 'L3')[];
  tags?: string[];
}

interface CacheStats {
  l1: CacheLevelStats;
  l2: CacheLevelStats;
  l3: CacheLevelStats;
  timestamp: string;
}

interface CacheLevelStats {
  hits: number;
  misses: number;
  keys: number;
  memory: number;
}

// Cache warming utilities
export class CacheWarmer {
  private static warmingJobs = new Map<string, NodeJS.Timeout>();

  // Schedule periodic cache warming
  static scheduleWarming(jobId: string, interval: number, warmer: () => Promise<void>): void {
    // Clear existing job if any
    if (this.warmingJobs.has(jobId)) {
      clearInterval(this.warmingJobs.get(jobId)!);
    }

    // Schedule new warming job
    const job = setInterval(async () => {
      try {
        console.log(`Running cache warming job: ${jobId}`);
        await warmer();
      } catch (error) {
        console.error(`Cache warming job ${jobId} failed:`, error);
      }
    }, interval);

    this.warmingJobs.set(jobId, job);
    console.log(`Scheduled cache warming job: ${jobId} (every ${interval}ms)`);
  }

  // Stop warming job
  static stopWarming(jobId: string): void {
    const job = this.warmingJobs.get(jobId);
    if (job) {
      clearInterval(job);
      this.warmingJobs.delete(jobId);
      console.log(`Stopped cache warming job: ${jobId}`);
    }
  }

  // Get active warming jobs
  static getActiveJobs(): string[] {
    return Array.from(this.warmingJobs.keys());
  }
}

export default AdvancedCache;