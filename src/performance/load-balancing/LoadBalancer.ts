import { NextRequest, NextResponse } from 'next/server';

// Load Balancing and Intelligent Routing System
export class LoadBalancer {
  private static readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  private static readonly FAILOVER_THRESHOLD = 3; // consecutive failures
  private static readonly RECOVERY_TIME = 60000; // 1 minute recovery time

  // Backend servers configuration
  private static backends: BackendServer[] = [
    {
      id: 'us-east-1',
      url: 'https://api-us-east.garlaws.com',
      region: 'us-east-1',
      weight: 100,
      health: 'healthy',
      responseTime: 0,
      failureCount: 0,
      lastHealthCheck: Date.now(),
      capacity: 1000, // concurrent requests
      currentLoad: 0,
    },
    {
      id: 'us-west-2',
      url: 'https://api-us-west.garlaws.com',
      region: 'us-west-2',
      weight: 80,
      health: 'healthy',
      responseTime: 0,
      failureCount: 0,
      lastHealthCheck: Date.now(),
      capacity: 800,
      currentLoad: 0,
    },
    {
      id: 'eu-west-1',
      url: 'https://api-eu-west.garlaws.com',
      region: 'eu-west-1',
      weight: 90,
      health: 'healthy',
      responseTime: 0,
      failureCount: 0,
      lastHealthCheck: Date.now(),
      capacity: 900,
      currentLoad: 0,
    },
    {
      id: 'ap-southeast-1',
      url: 'https://api-ap-southeast.garlaws.com',
      region: 'ap-southeast-1',
      weight: 70,
      health: 'healthy',
      responseTime: 0,
      failureCount: 0,
      lastHealthCheck: Date.now(),
      capacity: 700,
      currentLoad: 0,
    },
  ];

  private static loadBalancingAlgorithm: LoadBalancingAlgorithm = 'weighted_round_robin';
  private static isInitialized = false;

  // Initialize load balancer
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load backend configuration from environment
      await this.loadBackendConfiguration();

      // Start health checks
      this.startHealthChecks();

      // Initialize routing algorithms
      this.initializeAlgorithms();

      this.isInitialized = true;
      console.log('Load balancer initialized successfully');
    } catch (error) {
      console.error('Load balancer initialization failed:', error);
      throw error;
    }
  }

  // Route request to appropriate backend
  static async routeRequest(request: NextRequest): Promise<NextResponse> {
    if (!this.isInitialized) await this.initialize();

    const clientIP = this.getClientIP(request);
    const geolocation = await this.getGeolocation(clientIP);
    const userId = request.headers.get('x-user-id');
    const sessionId = request.headers.get('x-session-id');

    // Select backend based on algorithm and context
    const backend = this.selectBackend(request, geolocation, userId, sessionId);

    if (!backend) {
      return new NextResponse('No available backend servers', { status: 503 });
    }

    // Increment load counter
    backend.currentLoad++;

    try {
      // Forward request to selected backend
      const response = await this.forwardRequest(request, backend);

      // Update backend metrics
      this.updateBackendMetrics(backend, response);

      return response;
    } catch (error) {
      // Handle backend failure
      await this.handleBackendFailure(backend, error);
      throw error;
    } finally {
      // Decrement load counter
      backend.currentLoad--;
    }
  }

  // Backend selection algorithms
  private static selectBackend(
    request: NextRequest,
    geolocation: GeolocationData,
    userId?: string | null,
    sessionId?: string | null
  ): BackendServer | null {
    const healthyBackends = this.backends.filter(b => b.health === 'healthy');

    if (healthyBackends.length === 0) {
      return null;
    }

    switch (this.loadBalancingAlgorithm) {
      case 'geographic':
        return this.selectGeographicBackend(healthyBackends, geolocation);

      case 'weighted_round_robin':
        return this.selectWeightedRoundRobinBackend(healthyBackends);

      case 'least_connections':
        return this.selectLeastConnectionsBackend(healthyBackends);

      case 'performance_based':
        return this.selectPerformanceBasedBackend(healthyBackends);

      case 'session_sticky':
        return this.selectSessionStickyBackend(healthyBackends, sessionId);

      case 'user_sticky':
        return this.selectUserStickyBackend(healthyBackends, userId);

      default:
        return healthyBackends[0];
    }
  }

  // Geographic load balancing
  private static selectGeographicBackend(backends: BackendServer[], geolocation: GeolocationData): BackendServer {
    // Find backend in same region
    const regionalBackend = backends.find(b => b.region === geolocation.region);
    if (regionalBackend) return regionalBackend;

    // Find backend in same continent
    const continentMap: Record<string, string[]> = {
      'North America': ['us-east-1', 'us-west-2'],
      'Europe': ['eu-west-1'],
      'Asia': ['ap-southeast-1'],
    };

    const clientContinent = this.getContinentFromCountry(geolocation.country);
    const continentRegions = continentMap[clientContinent] || [];

    const continentBackend = backends.find(b => continentRegions.includes(b.region));
    if (continentBackend) return continentBackend;

    // Fallback to any healthy backend
    return backends[0];
  }

  // Weighted round-robin algorithm
  private static selectWeightedRoundRobinBackend(backends: BackendServer[]): BackendServer {
    // Simple round-robin with weights (simplified implementation)
    const totalWeight = backends.reduce((sum, backend) => sum + backend.weight, 0);
    let random = Math.random() * totalWeight;

    for (const backend of backends) {
      random -= backend.weight;
      if (random <= 0) {
        return backend;
      }
    }

    return backends[0];
  }

  // Least connections algorithm
  private static selectLeastConnectionsBackend(backends: BackendServer[]): BackendServer {
    return backends.reduce((selected, current) => {
      const selectedLoadRatio = selected.currentLoad / selected.capacity;
      const currentLoadRatio = current.currentLoad / current.capacity;
      return currentLoadRatio < selectedLoadRatio ? current : selected;
    });
  }

  // Performance-based algorithm
  private static selectPerformanceBasedBackend(backends: BackendServer[]): BackendServer {
    return backends.reduce((selected, current) => {
      // Prefer backend with lower response time and higher availability
      const selectedScore = selected.responseTime + (selected.currentLoad / selected.capacity) * 1000;
      const currentScore = current.responseTime + (current.currentLoad / current.capacity) * 1000;
      return currentScore < selectedScore ? current : selected;
    });
  }

  // Session sticky routing
  private static selectSessionStickyBackend(backends: BackendServer[], sessionId?: string | null): BackendServer {
    if (!sessionId) return this.selectWeightedRoundRobinBackend(backends);

    // Hash session ID to backend (simplified sticky routing)
    const hash = this.hashString(sessionId);
    const index = hash % backends.length;

    return backends[index];
  }

  // User sticky routing
  private static selectUserStickyBackend(backends: BackendServer[], userId?: string | null): BackendServer {
    if (!userId) return this.selectWeightedRoundRobinBackend(backends);

    // Hash user ID to backend for consistency
    const hash = this.hashString(userId);
    const index = hash % backends.length;

    return backends[index];
  }

  // Health checks and monitoring
  private static startHealthChecks(): void {
    setInterval(async () => {
      await this.performHealthChecks();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  private static async performHealthChecks(): Promise<void> {
    const healthCheckPromises = this.backends.map(async (backend) => {
      try {
        const startTime = Date.now();
        const response = await fetch(`${backend.url}/health`, {
          timeout: 5000,
          headers: { 'User-Agent': 'LoadBalancer-HealthCheck' }
        });
        const responseTime = Date.now() - startTime;

        if (response.ok) {
          // Backend is healthy
          backend.health = 'healthy';
          backend.responseTime = responseTime;
          backend.failureCount = 0;
          backend.lastHealthCheck = Date.now();
        } else {
          throw new Error(`Health check failed with status: ${response.status}`);
        }
      } catch (error) {
        // Backend is unhealthy
        backend.failureCount++;
        backend.lastHealthCheck = Date.now();

        if (backend.failureCount >= this.FAILOVER_THRESHOLD) {
          backend.health = 'unhealthy';
          console.warn(`Backend ${backend.id} marked as unhealthy after ${backend.failureCount} failures`);
        }
      }
    });

    await Promise.allSettled(healthCheckPromises);
  }

  // Request forwarding
  private static async forwardRequest(request: NextRequest, backend: BackendServer): Promise<NextResponse> {
    const backendUrl = new URL(backend.url);
    backendUrl.pathname = request.nextUrl.pathname;
    backendUrl.search = request.nextUrl.search;

    // Create headers for backend request
    const headers = new Headers();
    for (const [key, value] of request.headers.entries()) {
      // Skip hop-by-hop headers
      if (!['connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'transfer-encoding', 'upgrade'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    }

    // Add load balancer headers
    headers.set('X-Forwarded-For', this.getClientIP(request));
    headers.set('X-Forwarded-Host', request.headers.get('host') || '');
    headers.set('X-Forwarded-Proto', request.nextUrl.protocol.replace(':', ''));
    headers.set('X-Load-Balancer', backend.id);

    try {
      const response = await fetch(backendUrl.toString(), {
        method: request.method,
        headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      // Create NextResponse from fetch response
      const responseBody = await response.text();
      const nextResponse = new NextResponse(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      return nextResponse;
    } catch (error) {
      console.error(`Request forwarding failed to backend ${backend.id}:`, error);
      throw error;
    }
  }

  // Backend failure handling
  private static async handleBackendFailure(backend: BackendServer, error: any): Promise<void> {
    backend.failureCount++;
    backend.health = backend.failureCount >= this.FAILOVER_THRESHOLD ? 'unhealthy' : 'degraded';

    console.error(`Backend ${backend.id} failure:`, error);

    // Implement circuit breaker pattern
    if (backend.failureCount >= this.FAILOVER_THRESHOLD) {
      // Mark backend as unhealthy and start recovery timer
      backend.health = 'unhealthy';
      setTimeout(() => {
        backend.failureCount = 0;
        backend.health = 'healthy';
        console.log(`Backend ${backend.id} recovery initiated`);
      }, this.RECOVERY_TIME);
    }
  }

  // Backend metrics update
  private static updateBackendMetrics(backend: BackendServer, response: NextResponse): void {
    // Update response time (moving average)
    const responseTime = Date.now() - Date.now(); // Would need actual timing
    backend.responseTime = (backend.responseTime + responseTime) / 2;

    // Update success/failure rates
    if (response.status >= 200 && response.status < 400) {
      backend.successCount = (backend.successCount || 0) + 1;
    } else {
      backend.failureCount++;
    }
  }

  // Configuration management
  private static async loadBackendConfiguration(): Promise<void> {
    // Load backend configuration from environment or config service
    const configString = process.env.LOAD_BALANCER_BACKENDS;
    if (configString) {
      try {
        const config = JSON.parse(configString);
        this.backends = config.backends || this.backends;
        this.loadBalancingAlgorithm = config.algorithm || this.loadBalancingAlgorithm;
      } catch (error) {
        console.error('Failed to parse backend configuration:', error);
      }
    }
  }

  private static initializeAlgorithms(): void {
    // Initialize algorithm-specific data structures
    console.log(`Load balancing algorithm: ${this.loadBalancingAlgorithm}`);
  }

  // Utility methods
  private static getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for') ||
           request.headers.get('x-real-ip') ||
           request.ip ||
           'unknown';
  }

  private static async getGeolocation(ip: string): Promise<GeolocationData> {
    // In production, use a geolocation service
    // For demo, return mock data based on IP
    return {
      ip,
      country: 'US',
      region: 'us-east-1',
      city: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
      riskScore: 10,
    };
  }

  private static getContinentFromCountry(country: string): string {
    const continentMap: Record<string, string> = {
      'US': 'North America',
      'CA': 'North America',
      'GB': 'Europe',
      'DE': 'Europe',
      'FR': 'Europe',
      'JP': 'Asia',
      'KR': 'Asia',
      'SG': 'Asia',
      'AU': 'Australia',
      'BR': 'South America',
    };

    return continentMap[country] || 'Unknown';
  }

  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Monitoring and analytics
  static getLoadBalancerStats(): LoadBalancerStats {
    const healthyBackends = this.backends.filter(b => b.health === 'healthy');
    const totalCapacity = this.backends.reduce((sum, b) => sum + b.capacity, 0);
    const totalLoad = this.backends.reduce((sum, b) => sum + b.currentLoad, 0);

    return {
      totalBackends: this.backends.length,
      healthyBackends: healthyBackends.length,
      totalCapacity,
      currentLoad: totalLoad,
      loadPercentage: totalCapacity > 0 ? (totalLoad / totalCapacity) * 100 : 0,
      algorithm: this.loadBalancingAlgorithm,
      backends: this.backends.map(b => ({
        id: b.id,
        region: b.region,
        health: b.health,
        currentLoad: b.currentLoad,
        capacity: b.capacity,
        responseTime: b.responseTime,
      })),
      timestamp: new Date().toISOString(),
    };
  }

  // Dynamic algorithm switching
  static setLoadBalancingAlgorithm(algorithm: LoadBalancingAlgorithm): void {
    this.loadBalancingAlgorithm = algorithm;
    console.log(`Load balancing algorithm changed to: ${algorithm}`);
  }

  // Backend management
  static addBackend(backend: BackendServer): void {
    this.backends.push(backend);
    console.log(`Backend added: ${backend.id}`);
  }

  static removeBackend(backendId: string): void {
    const index = this.backends.findIndex(b => b.id === backendId);
    if (index !== -1) {
      this.backends.splice(index, 1);
      console.log(`Backend removed: ${backendId}`);
    }
  }

  static updateBackend(backendId: string, updates: Partial<BackendServer>): void {
    const backend = this.backends.find(b => b.id === backendId);
    if (backend) {
      Object.assign(backend, updates);
      console.log(`Backend updated: ${backendId}`);
    }
  }
}

// Interface definitions
interface BackendServer {
  id: string;
  url: string;
  region: string;
  weight: number;
  health: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  failureCount: number;
  lastHealthCheck: number;
  capacity: number;
  currentLoad: number;
  successCount?: number;
}

type LoadBalancingAlgorithm =
  | 'geographic'
  | 'weighted_round_robin'
  | 'least_connections'
  | 'performance_based'
  | 'session_sticky'
  | 'user_sticky';

interface GeolocationData {
  ip: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  riskScore: number;
}

interface LoadBalancerStats {
  totalBackends: number;
  healthyBackends: number;
  totalCapacity: number;
  currentLoad: number;
  loadPercentage: number;
  algorithm: LoadBalancingAlgorithm;
  backends: Array<{
    id: string;
    region: string;
    health: string;
    currentLoad: number;
    capacity: number;
    responseTime: number;
  }>;
  timestamp: string;
}

export default LoadBalancer;