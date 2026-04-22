import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

// Database Optimization and Sharding System
export class DatabaseOptimizer {
  private static readonly SHARD_COUNT = parseInt(process.env.DB_SHARD_COUNT || '4');
  private static readonly READ_REPLICA_COUNT = parseInt(process.env.DB_READ_REPLICAS || '3');
  private static readonly CONNECTION_POOL_SIZE = parseInt(process.env.DB_POOL_SIZE || '20');

  // Database connections
  private static writeConnection: postgres.Sql;
  private static readConnections: postgres.Sql[] = [];
  private static shardConnections: postgres.Sql[] = [];

  private static isInitialized = false;

  // Sharding strategy
  private static readonly SHARD_STRATEGY = {
    // User data sharded by user ID
    users: (userId: string) => this.getShardIndex(userId),
    // Project data sharded by project ID
    projects: (projectId: string) => this.getShardIndex(projectId),
    // Financial data sharded by account ID
    financial: (accountId: string) => this.getShardIndex(accountId),
    // Analytics data sharded by date
    analytics: (date: Date) => this.getShardIndex(date.toISOString().split('T')[0]),
  };

  // Initialize database connections
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize write connection (primary)
      this.writeConnection = postgres(process.env.DATABASE_URL!, {
        max: this.CONNECTION_POOL_SIZE,
        idle_timeout: 20,
        connect_timeout: 10,
      });

      // Initialize read replicas
      for (let i = 0; i < this.READ_REPLICA_COUNT; i++) {
        const replicaUrl = process.env[`DATABASE_REPLICA_${i}_URL`] || process.env.DATABASE_URL!;
        const connection = postgres(replicaUrl, {
          max: this.CONNECTION_POOL_SIZE,
          idle_timeout: 20,
          connect_timeout: 10,
          readonly: true,
        });
        this.readConnections.push(connection);
      }

      // Initialize shard connections
      for (let i = 0; i < this.SHARD_COUNT; i++) {
        const shardUrl = process.env[`DATABASE_SHARD_${i}_URL`] || process.env.DATABASE_URL!;
        const connection = postgres(shardUrl, {
          max: this.CONNECTION_POOL_SIZE,
          idle_timeout: 20,
          connect_timeout: 10,
        });
        this.shardConnections.push(connection);
      }

      // Test connections
      await this.testConnections();

      // Initialize performance monitoring
      await this.initializeMonitoring();

      this.isInitialized = true;
      console.log('Database optimizer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database optimizer:', error);
      throw error;
    }
  }

  // Get appropriate database connection based on operation type
  static getConnection(operation: DatabaseOperation): postgres.Sql {
    if (!this.isInitialized) throw new Error('Database optimizer not initialized');

    switch (operation.type) {
      case 'read':
        // Use read replica for read operations
        const replicaIndex = Math.floor(Math.random() * this.readConnections.length);
        return this.readConnections[replicaIndex];

      case 'write':
        // Use primary for write operations
        return this.writeConnection;

      case 'sharded':
        // Use appropriate shard
        const shardIndex = this.getShardForOperation(operation);
        return this.shardConnections[shardIndex];

      default:
        return this.writeConnection;
    }
  }

  // Execute optimized query with connection routing
  static async executeQuery(
    operation: DatabaseOperation,
    query: string,
    params: any[] = []
  ): Promise<any> {
    const startTime = Date.now();
    const connection = this.getConnection(operation);

    try {
      const result = await connection.unsafe(query, params);
      const executionTime = Date.now() - startTime;

      // Log slow queries
      if (executionTime > 1000) { // 1 second threshold
        console.warn(`Slow query detected: ${executionTime}ms`, { query, params });
        await this.logSlowQuery(query, executionTime, params);
      }

      // Update performance metrics
      await this.updatePerformanceMetrics(operation, executionTime);

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`Query execution failed after ${executionTime}ms:`, error);
      await this.logQueryError(query, error, params);
      throw error;
    }
  }

  // Database sharding logic
  private static getShardIndex(key: string): number {
    // Simple hash-based sharding
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash) % this.SHARD_COUNT;
  }

  private static getShardForOperation(operation: DatabaseOperation): number {
    if (!operation.shardKey) {
      throw new Error('Shard key required for sharded operations');
    }

    const strategy = this.SHARD_STRATEGY[operation.table as keyof typeof this.SHARD_STRATEGY];
    if (!strategy) {
      throw new Error(`No sharding strategy defined for table: ${operation.table}`);
    }

    return strategy(operation.shardKey);
  }

  // Query optimization and analysis
  static async analyzeQuery(query: string): Promise<QueryAnalysis> {
    const analysis: QueryAnalysis = {
      query,
      estimatedCost: 0,
      executionPlan: '',
      recommendations: [],
      indexes: [],
    };

    try {
      // Use EXPLAIN to analyze query
      const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
      const result = await this.writeConnection.unsafe(explainQuery);

      if (result && result[0] && result[0]['EXPLAIN']) {
        const plan = result[0]['EXPLAIN'];
        analysis.executionPlan = JSON.stringify(plan, null, 2);
        analysis.estimatedCost = this.extractCostFromPlan(plan);

        // Analyze for optimization opportunities
        analysis.recommendations = this.analyzeExecutionPlan(plan);
        analysis.indexes = await this.suggestIndexes(plan);
      }
    } catch (error) {
      console.error('Query analysis failed:', error);
    }

    return analysis;
  }

  // Index optimization
  static async optimizeIndexes(): Promise<void> {
    console.log('Starting index optimization...');

    try {
      // Analyze index usage
      const indexUsage = await this.writeConnection.unsafe(`
        SELECT
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes
        ORDER BY idx_scan DESC;
      `);

      // Identify unused indexes
      const unusedIndexes = indexUsage.filter((row: any) => row.idx_scan === 0);

      // Suggest index optimizations
      for (const index of unusedIndexes.slice(0, 10)) { // Limit to top 10
        console.log(`Consider dropping unused index: ${index.indexname} on ${index.tablename}`);
      }

      // Analyze missing indexes from slow queries
      await this.analyzeMissingIndexes();

      console.log('Index optimization completed');
    } catch (error) {
      console.error('Index optimization failed:', error);
    }
  }

  // Connection pooling and management
  static async getConnectionStats(): Promise<ConnectionStats> {
    const stats: ConnectionStats = {
      writeConnections: {
        active: 0,
        idle: 0,
        total: 0,
      },
      readConnections: [],
      shardConnections: [],
      timestamp: new Date().toISOString(),
    };

    try {
      // Get write connection stats
      const writeStats = await this.writeConnection.unsafe(`
        SELECT
          count(*) as total,
          count(*) FILTER (WHERE state = 'active') as active,
          count(*) FILTER (WHERE state = 'idle') as idle
        FROM pg_stat_activity
        WHERE datname = current_database();
      `);

      if (writeStats[0]) {
        stats.writeConnections = {
          active: parseInt(writeStats[0].active) || 0,
          idle: parseInt(writeStats[0].idle) || 0,
          total: parseInt(writeStats[0].total) || 0,
        };
      }

      // Get read replica stats (simplified)
      for (let i = 0; i < this.readConnections.length; i++) {
        stats.readConnections.push({
          replica: i,
          active: 0, // Would need per-replica monitoring
          idle: 0,
          total: 0,
        });
      }

      // Get shard stats (simplified)
      for (let i = 0; i < this.shardConnections.length; i++) {
        stats.shardConnections.push({
          shard: i,
          active: 0, // Would need per-shard monitoring
          idle: 0,
          total: 0,
        });
      }
    } catch (error) {
      console.error('Failed to get connection stats:', error);
    }

    return stats;
  }

  // Performance monitoring
  private static async initializeMonitoring(): Promise<void> {
    // Set up performance monitoring queries
    setInterval(async () => {
      try {
        await this.collectPerformanceMetrics();
      } catch (error) {
        console.error('Performance monitoring failed:', error);
      }
    }, 60000); // Every minute
  }

  private static async collectPerformanceMetrics(): Promise<void> {
    const metrics = await this.writeConnection.unsafe(`
      SELECT
        schemaname,
        tablename,
        seq_scan,
        seq_tup_read,
        idx_scan,
        idx_tup_fetch,
        n_tup_ins,
        n_tup_upd,
        n_tup_del
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY seq_scan DESC
      LIMIT 10;
    `);

    // Log metrics for monitoring
    console.log('Database performance metrics collected:', metrics.length, 'tables analyzed');
  }

  // Helper methods
  private static async testConnections(): Promise<void> {
    const connections = [this.writeConnection, ...this.readConnections, ...this.shardConnections];

    for (let i = 0; i < connections.length; i++) {
      const connection = connections[i];
      try {
        await connection.unsafe('SELECT 1 as test');
        console.log(`Connection ${i} test successful`);
      } catch (error) {
        console.error(`Connection ${i} test failed:`, error);
        throw error;
      }
    }
  }

  private static extractCostFromPlan(plan: any): number {
    // Extract cost from PostgreSQL EXPLAIN plan
    if (plan && plan[0] && plan[0]['Plan'] && plan[0]['Plan']['Total Cost']) {
      return plan[0]['Plan']['Total Cost'];
    }
    return 0;
  }

  private static analyzeExecutionPlan(plan: any): string[] {
    const recommendations: string[] = [];

    // Analyze for sequential scans on large tables
    if (plan && plan[0] && plan[0]['Plan']) {
      const rootPlan = plan[0]['Plan'];

      if (rootPlan['Node Type'] === 'Seq Scan' && rootPlan['Plan Rows'] > 10000) {
        recommendations.push('Consider adding indexes for better query performance');
      }

      if (rootPlan['Total Cost'] > 100000) {
        recommendations.push('Query is expensive, consider optimization or caching');
      }
    }

    return recommendations;
  }

  private static async suggestIndexes(plan: any): Promise<string[]> {
    const suggestions: string[] = [];

    // Analyze plan for missing index opportunities
    if (plan && plan[0] && plan[0]['Plan']) {
      // This would require more sophisticated analysis
      // For now, return basic suggestions
      suggestions.push('Analyze query patterns to identify optimal indexes');
    }

    return suggestions;
  }

  private static async analyzeMissingIndexes(): Promise<void> {
    // Analyze pg_stat_statements for missing indexes
    try {
      const missingIndexes = await this.writeConnection.unsafe(`
        SELECT
          query,
          calls,
          total_time,
          mean_time,
          rows
        FROM pg_stat_statements
        WHERE query LIKE '%SELECT%'
        AND mean_time > 1000
        ORDER BY mean_time DESC
        LIMIT 5;
      `);

      console.log('Potential missing index candidates:', missingIndexes.length);
    } catch (error) {
      console.error('Missing index analysis failed:', error);
    }
  }

  private static async logSlowQuery(query: string, executionTime: number, params: any[]): Promise<void> {
    // Log to monitoring system
    console.log(`Slow query logged: ${executionTime}ms`);
  }

  private static async logQueryError(query: string, error: any, params: any[]): Promise<void> {
    // Log to error monitoring system
    console.error('Query error logged:', error);
  }

  private static async updatePerformanceMetrics(operation: DatabaseOperation, executionTime: number): Promise<void> {
    // Update performance metrics in monitoring system
    // This would integrate with the monitoring system
  }

  // Graceful shutdown
  static async shutdown(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      const allConnections = [
        this.writeConnection,
        ...this.readConnections,
        ...this.shardConnections
      ];

      await Promise.all(allConnections.map(conn => conn.end()));
      this.isInitialized = false;
      console.log('Database optimizer shut down successfully');
    } catch (error) {
      console.error('Error during database shutdown:', error);
    }
  }
}

// Database operation interfaces
interface DatabaseOperation {
  type: 'read' | 'write' | 'sharded';
  table?: string;
  shardKey?: string;
}

interface QueryAnalysis {
  query: string;
  estimatedCost: number;
  executionPlan: string;
  recommendations: string[];
  indexes: string[];
}

interface ConnectionStats {
  writeConnections: {
    active: number;
    idle: number;
    total: number;
  };
  readConnections: Array<{
    replica: number;
    active: number;
    idle: number;
    total: number;
  }>;
  shardConnections: Array<{
    shard: number;
    active: number;
    idle: number;
    total: number;
  }>;
  timestamp: string;
}

export default DatabaseOptimizer;