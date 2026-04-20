// Advanced Logging Infrastructure
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export enum LogCategory {
  API = 'api',
  DATABASE = 'database',
  AUTH = 'auth',
  BUSINESS = 'business',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  USER_INTERACTION = 'user_interaction',
  SYSTEM = 'system'
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  error?: Error;
  stackTrace?: string;
}

export interface LogTransport {
  log(entry: LogEntry): void;
  flush?(): Promise<void>;
}

class ConsoleTransport implements LogTransport {
  log(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${levelName}] [${entry.category}]`;

    const message = entry.data
      ? `${prefix} ${entry.message} ${JSON.stringify(entry.data)}`
      : `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, entry.error);
        break;
    }
  }
}

class MemoryTransport implements LogTransport {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  log(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

class AnalyticsTransport implements LogTransport {
  log(entry: LogEntry): void {
    // Send to analytics service (could be Segment, Mixpanel, etc.)
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Log Event', {
        level: LogLevel[entry.level],
        category: entry.category,
        message: entry.message,
        timestamp: entry.timestamp.toISOString(),
        userId: entry.userId,
        sessionId: entry.sessionId
      });
    }
  }
}

export class Logger {
  private static instance: Logger;
  private transports: LogTransport[] = [];
  private minLevel: LogLevel = LogLevel.INFO;
  private sessionId: string;
  private requestId: string | null = null;

  private constructor() {
    this.sessionId = this.generateSessionId();

    // Add default transports
    this.addTransport(new ConsoleTransport());

    if (process.env.NODE_ENV === 'production') {
      this.addTransport(new AnalyticsTransport());
    }

    // Add memory transport for development
    if (process.env.NODE_ENV === 'development') {
      this.addTransport(new MemoryTransport());
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      data,
      sessionId: this.sessionId,
      requestId: this.requestId || undefined
    };

    if (error) {
      entry.error = error;
      entry.stackTrace = error.stack;
    }

    return entry;
  }

  private log(level: LogLevel, category: LogCategory, message: string, data?: any, error?: Error): void {
    if (level < this.minLevel) return;

    const entry = this.createLogEntry(level, category, message, data, error);

    // Send to all transports
    this.transports.forEach(transport => {
      try {
        transport.log(entry);
      } catch (err) {
        console.error('Logging transport failed:', err);
      }
    });
  }

  debug(category: LogCategory, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: LogCategory, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: LogCategory, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: LogCategory, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data, error);
  }

  fatal(category: LogCategory, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.FATAL, category, message, data, error);
  }

  // Business-specific logging methods
  logUserAction(action: string, userId: string, data?: any): void {
    this.info(LogCategory.USER_INTERACTION, `User action: ${action}`, {
      userId,
      action,
      ...data
    });
  }

  logApiCall(endpoint: string, method: string, statusCode: number, duration: number, userId?: string): void {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, LogCategory.API, `API call: ${method} ${endpoint}`, {
      endpoint,
      method,
      statusCode,
      duration,
      userId
    });
  }

  logDatabaseQuery(query: string, duration: number, success: boolean): void {
    const level = success ? LogLevel.DEBUG : LogLevel.ERROR;
    this.log(level, LogCategory.DATABASE, `Database query executed`, {
      query: query.substring(0, 200), // Truncate long queries
      duration,
      success
    });
  }

  logBusinessEvent(event: string, data: any): void {
    this.info(LogCategory.BUSINESS, `Business event: ${event}`, data);
  }

  logSecurityEvent(event: string, userId?: string, data?: any): void {
    this.warn(LogCategory.SECURITY, `Security event: ${event}`, {
      userId,
      ...data
    });
  }

  logPerformanceMetric(metric: string, value: number, context?: any): void {
    this.info(LogCategory.PERFORMANCE, `Performance metric: ${metric}`, {
      metric,
      value,
      ...context
    });
  }

  async flush(): Promise<void> {
    const flushPromises = this.transports
      .filter(transport => transport.flush)
      .map(transport => transport.flush!());

    await Promise.all(flushPromises);
  }
}

// Global logger instance
export const logger = Logger.getInstance();