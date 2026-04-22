// Natural Language Query Processing for Business Intelligence
export class NaturalLanguageQuery {
  private static readonly QUERY_PATTERNS = {
    AGGREGATION: /(?:show|give|tell|get)\s+(?:me\s+)?(?:the\s+)?(?:(sum|total|count|average|avg|max|min|mean)\s+)?(.+?)(?:\s+(?:by|grouped by|per|for each)\s+(.+?))?(?:\s+(?:where|when|if)\s+(.+?))?(?:\s+(?:in|during|for)\s+(.+?))?/i,
    TREND: /(?:what|show)\s+(?:is|are|was|were)\s+(?:the\s+)?trend(?:s)?(?:\s+(?:of|for|in))?\s+(.+?)(?:\s+(?:over|during|in)\s+(.+?))?/i,
    COMPARISON: /(?:compare|comparison|versus|vs)\s+(.+?)(?:\s+(?:with|to|against)\s+(.+?))?(?:\s+(?:by|for|in)\s+(.+?))?/i,
    CORRELATION: /(?:correlation|relationship|relation)\s+(?:between|among)\s+(.+?)(?:\s+(?:and|with)\s+(.+?))?/i,
    PREDICTION: /(?:predict|forecast|estimate|project)\s+(.+?)(?:\s+(?:for|in)\s+(.+?))?/i,
    ANOMALY: /(?:anomalies|outliers|unusual|abnormal)\s+(?:in|for|of)\s+(.+?)(?:\s+(?:during|in|over)\s+(.+?))?/i,
  };

  private static readonly ENTITY_MAPPINGS = {
    metrics: {
      'revenue': 'total_revenue',
      'sales': 'total_sales',
      'profit': 'net_profit',
      'cost': 'total_cost',
      'margin': 'profit_margin',
      'users': 'active_users',
      'customers': 'total_customers',
      'orders': 'total_orders',
      'conversion': 'conversion_rate',
    },
    dimensions: {
      'time': 'date',
      'date': 'transaction_date',
      'month': 'month',
      'quarter': 'quarter',
      'year': 'year',
      'region': 'geographic_region',
      'country': 'country',
      'city': 'city',
      'product': 'product_name',
      'category': 'product_category',
      'customer': 'customer_segment',
      'channel': 'sales_channel',
    },
    timeExpressions: {
      'today': 'CURRENT_DATE',
      'yesterday': 'CURRENT_DATE - INTERVAL \'1 day\'',
      'this week': 'date_trunc(\'week\', CURRENT_DATE)',
      'last week': 'date_trunc(\'week\', CURRENT_DATE - INTERVAL \'1 week\')',
      'this month': 'date_trunc(\'month\', CURRENT_DATE)',
      'last month': 'date_trunc(\'month\', CURRENT_DATE - INTERVAL \'1 month\')',
      'this quarter': 'date_trunc(\'quarter\', CURRENT_DATE)',
      'last quarter': 'date_trunc(\'quarter\', CURRENT_DATE - INTERVAL \'3 months\')',
      'this year': 'date_trunc(\'year\', CURRENT_DATE)',
      'last year': 'date_trunc(\'year\', CURRENT_DATE - INTERVAL \'1 year\')',
    },
  };

  // Process natural language query
  static async processQuery(
    naturalLanguageQuery: string,
    context?: QueryContext
  ): Promise<QueryResult> {
    console.log(`Processing natural language query: "${naturalLanguageQuery}"`);

    const result: QueryResult = {
      originalQuery: naturalLanguageQuery,
      intent: 'unknown',
      entities: [],
      generatedSQL: '',
      confidence: 0,
      processingTime: 0,
      timestamp: new Date(),
    };

    const startTime = Date.now();

    try {
      // Preprocess query
      const processedQuery = this.preprocessQuery(naturalLanguageQuery);

      // Classify intent
      result.intent = this.classifyIntent(processedQuery);

      // Extract entities
      result.entities = this.extractEntities(processedQuery);

      // Generate SQL
      result.generatedSQL = await this.generateSQL(result.intent, result.entities, context);

      // Validate and optimize SQL
      result.generatedSQL = this.optimizeSQL(result.generatedSQL);

      // Calculate confidence
      result.confidence = this.calculateConfidence(result.intent, result.entities);

      // Add processing time
      result.processingTime = Date.now() - startTime;

      console.log(`Query processed successfully: ${result.intent} (confidence: ${result.confidence.toFixed(2)})`);

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.processingTime = Date.now() - startTime;
      console.error(`Query processing failed:`, error);
    }

    return result;
  }

  // Classify query intent
  private static classifyIntent(query: string): QueryIntent {
    for (const [intent, pattern] of Object.entries(this.QUERY_PATTERNS)) {
      if (pattern.test(query)) {
        return intent.toLowerCase() as QueryIntent;
      }
    }

    // Default intent based on keywords
    if (query.includes('predict') || query.includes('forecast')) return 'prediction';
    if (query.includes('compare') || query.includes('versus')) return 'comparison';
    if (query.includes('trend') || query.includes('over time')) return 'trend';
    if (query.includes('correlation') || query.includes('relationship')) return 'correlation';
    if (query.includes('anomaly') || query.includes('outlier')) return 'anomaly';

    return 'aggregation';
  }

  // Extract entities from query
  private static extractEntities(query: string): QueryEntity[] {
    const entities: QueryEntity[] = [];

    // Extract metrics
    for (const [alias, field] of Object.entries(this.ENTITY_MAPPINGS.metrics)) {
      if (query.toLowerCase().includes(alias)) {
        entities.push({
          type: 'metric',
          value: alias,
          mappedValue: field,
          confidence: 0.9,
        });
      }
    }

    // Extract dimensions
    for (const [alias, field] of Object.entries(this.ENTITY_MAPPINGS.dimensions)) {
      if (query.toLowerCase().includes(alias)) {
        entities.push({
          type: 'dimension',
          value: alias,
          mappedValue: field,
          confidence: 0.8,
        });
      }
    }

    // Extract time expressions
    for (const [expression, sql] of Object.entries(this.ENTITY_MAPPINGS.timeExpressions)) {
      if (query.toLowerCase().includes(expression)) {
        entities.push({
          type: 'time',
          value: expression,
          mappedValue: sql,
          confidence: 0.95,
        });
      }
    }

    // Extract numbers and operators
    const numberMatches = query.match(/\b\d+(\.\d+)?\b/g);
    if (numberMatches) {
      numberMatches.forEach(match => {
        entities.push({
          type: 'number',
          value: match,
          mappedValue: match,
          confidence: 1.0,
        });
      });
    }

    return entities;
  }

  // Generate SQL from intent and entities
  private static async generateSQL(
    intent: QueryIntent,
    entities: QueryEntity[],
    context?: QueryContext
  ): Promise<string> {
    const metrics = entities.filter(e => e.type === 'metric');
    const dimensions = entities.filter(e => e.type === 'dimension');
    const timeEntities = entities.filter(e => e.type === 'time');

    switch (intent) {
      case 'aggregation':
        return this.generateAggregationSQL(metrics, dimensions, timeEntities, context);

      case 'trend':
        return this.generateTrendSQL(metrics, dimensions, timeEntities, context);

      case 'comparison':
        return this.generateComparisonSQL(metrics, dimensions, timeEntities, context);

      case 'correlation':
        return this.generateCorrelationSQL(metrics, dimensions, context);

      case 'prediction':
        return this.generatePredictionSQL(metrics, dimensions, context);

      case 'anomaly':
        return this.generateAnomalySQL(metrics, dimensions, timeEntities, context);

      default:
        return this.generateDefaultSQL(metrics, dimensions, context);
    }
  }

  // Generate aggregation SQL
  private static generateAggregationSQL(
    metrics: QueryEntity[],
    dimensions: QueryEntity[],
    timeEntities: QueryEntity[],
    context?: QueryContext
  ): string {
    const selectFields = metrics.map(m => m.mappedValue).join(', ') || '*';
    const tableName = context?.tableName || 'analytics_data';
    const groupBy = dimensions.length > 0 ? `GROUP BY ${dimensions.map(d => d.mappedValue).join(', ')}` : '';
    const timeFilter = timeEntities.length > 0 ?
      `WHERE ${timeEntities[0].mappedValue}` : '';

    return `
      SELECT ${selectFields}
      FROM ${tableName}
      ${timeFilter}
      ${groupBy}
      ORDER BY ${dimensions.length > 0 ? dimensions[0].mappedValue : '1'}
    `.trim();
  }

  // Generate trend SQL
  private static generateTrendSQL(
    metrics: QueryEntity[],
    dimensions: QueryEntity[],
    timeEntities: QueryEntity[],
    context?: QueryContext
  ): string {
    const metric = metrics[0]?.mappedValue || 'value';
    const timeField = dimensions.find(d => d.mappedValue.includes('date'))?.mappedValue || 'date';
    const tableName = context?.tableName || 'time_series_data';

    return `
      SELECT
        DATE_TRUNC('day', ${timeField}) as period,
        AVG(${metric}) as average_value,
        MIN(${metric}) as min_value,
        MAX(${metric}) as max_value,
        COUNT(*) as data_points
      FROM ${tableName}
      ${timeEntities.length > 0 ? `WHERE ${timeEntities[0].mappedValue}` : ''}
      GROUP BY DATE_TRUNC('day', ${timeField})
      ORDER BY period
    `.trim();
  }

  // Generate comparison SQL
  private static generateComparisonSQL(
    metrics: QueryEntity[],
    dimensions: QueryEntity[],
    timeEntities: QueryEntity[],
    context?: QueryContext
  ): string {
    const metric = metrics[0]?.mappedValue || 'value';
    const dimension = dimensions[0]?.mappedValue || 'category';
    const tableName = context?.tableName || 'comparison_data';

    return `
      SELECT
        ${dimension},
        AVG(${metric}) as average_value,
        STDDEV(${metric}) as standard_deviation,
        COUNT(*) as sample_size
      FROM ${tableName}
      ${timeEntities.length > 0 ? `WHERE ${timeEntities[0].mappedValue}` : ''}
      GROUP BY ${dimension}
      ORDER BY average_value DESC
    `.trim();
  }

  // Generate correlation SQL
  private static generateCorrelationSQL(
    metrics: QueryEntity[],
    dimensions: QueryEntity[],
    context?: QueryContext
  ): string {
    if (metrics.length < 2) {
      throw new Error('Correlation requires at least two metrics');
    }

    const metric1 = metrics[0].mappedValue;
    const metric2 = metrics[1].mappedValue;
    const tableName = context?.tableName || 'correlation_data';

    return `
      SELECT
        CORR(${metric1}, ${metric2}) as correlation_coefficient,
        COUNT(*) as sample_size,
        AVG(${metric1}) as avg_metric1,
        AVG(${metric2}) as avg_metric2
      FROM ${tableName}
      WHERE ${metric1} IS NOT NULL AND ${metric2} IS NOT NULL
    `.trim();
  }

  // Generate prediction SQL (placeholder - would integrate with ML models)
  private static generatePredictionSQL(
    metrics: QueryEntity[],
    dimensions: QueryEntity[],
    context?: QueryContext
  ): string {
    // This would integrate with predictive models
    return `
      -- Prediction query would integrate with ML models
      SELECT 'Prediction functionality requires ML model integration' as note
    `.trim();
  }

  // Generate anomaly SQL
  private static generateAnomalySQL(
    metrics: QueryEntity[],
    dimensions: QueryEntity[],
    timeEntities: QueryEntity[],
    context?: QueryContext
  ): string {
    const metric = metrics[0]?.mappedValue || 'value';
    const tableName = context?.tableName || 'anomaly_data';

    return `
      WITH stats AS (
        SELECT
          AVG(${metric}) as mean_value,
          STDDEV(${metric}) as std_dev
        FROM ${tableName}
        ${timeEntities.length > 0 ? `WHERE ${timeEntities[0].mappedValue}` : ''}
      )
      SELECT
        *,
        (${metric} - mean_value) / NULLIF(std_dev, 0) as z_score,
        CASE
          WHEN ABS((${metric} - mean_value) / NULLIF(std_dev, 0)) > 3 THEN 'critical'
          WHEN ABS((${metric} - mean_value) / NULLIF(std_dev, 0)) > 2 THEN 'high'
          WHEN ABS((${metric} - mean_value) / NULLIF(std_dev, 0)) > 1.5 THEN 'medium'
          ELSE 'normal'
        END as anomaly_level
      FROM ${tableName}, stats
      ${timeEntities.length > 0 ? `WHERE ${timeEntities[0].mappedValue}` : ''}
      ORDER BY ABS((${metric} - mean_value) / NULLIF(std_dev, 0)) DESC
    `.trim();
  }

  // Generate default SQL
  private static generateDefaultSQL(
    metrics: QueryEntity[],
    dimensions: QueryEntity[],
    context?: QueryContext
  ): string {
    const selectFields = metrics.map(m => m.mappedValue).join(', ') || '*';
    const tableName = context?.tableName || 'default_data';

    return `SELECT ${selectFields} FROM ${tableName} LIMIT 100`;
  }

  // Optimize generated SQL
  private static optimizeSQL(sql: string): string {
    // Basic SQL optimization
    let optimized = sql;

    // Remove unnecessary whitespace
    optimized = optimized.replace(/\s+/g, ' ').trim();

    // Add LIMIT if not present for safety
    if (!optimized.toUpperCase().includes('LIMIT') && optimized.toUpperCase().includes('SELECT')) {
      optimized += ' LIMIT 1000';
    }

    // Add ORDER BY if GROUP BY is present without ORDER BY
    if (optimized.toUpperCase().includes('GROUP BY') && !optimized.toUpperCase().includes('ORDER BY')) {
      const groupByMatch = optimized.match(/GROUP BY\s+([^;]+)/i);
      if (groupByMatch) {
        optimized += ` ORDER BY ${groupByMatch[1].split(',')[0].trim()}`;
      }
    }

    return optimized;
  }

  // Calculate query confidence
  private static calculateConfidence(intent: QueryIntent, entities: QueryEntity[]): number {
    let confidence = 0.5; // Base confidence

    // Intent recognition confidence
    if (intent !== 'unknown') confidence += 0.2;

    // Entity extraction confidence
    if (entities.length > 0) {
      const avgEntityConfidence = entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length;
      confidence += avgEntityConfidence * 0.3;
    }

    // Query complexity bonus
    if (entities.length > 2) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  // Preprocess query
  private static preprocessQuery(query: string): string {
    let processed = query.toLowerCase();

    // Remove punctuation
    processed = processed.replace(/[.,!?;:]/g, '');

    // Normalize whitespace
    processed = processed.replace(/\s+/g, ' ').trim();

    // Expand common abbreviations
    const abbreviations: Record<string, string> = {
      'avg': 'average',
      'max': 'maximum',
      'min': 'minimum',
      'tot': 'total',
      'rev': 'revenue',
      'cust': 'customer',
      'prod': 'product',
    };

    for (const [abbr, full] of Object.entries(abbreviations)) {
      processed = processed.replace(new RegExp(`\\b${abbr}\\b`, 'g'), full);
    }

    return processed;
  }

  // Query validation
  static validateQuery(query: string): QueryValidation {
    const validation: QueryValidation = {
      isValid: true,
      issues: [],
      suggestions: [],
    };

    // Check for dangerous operations
    if (query.toLowerCase().includes('drop') || query.toLowerCase().includes('delete') || query.toLowerCase().includes('truncate')) {
      validation.isValid = false;
      validation.issues.push('Query contains potentially dangerous operations');
    }

    // Check for incomplete queries
    if (!query.toLowerCase().includes('show') && !query.toLowerCase().includes('get') &&
        !query.toLowerCase().includes('what') && !query.toLowerCase().includes('how')) {
      validation.issues.push('Query appears incomplete - missing action verb');
      validation.suggestions.push('Try adding words like "show", "get", or "what"');
    }

    // Check for ambiguous terms
    const ambiguousTerms = ['it', 'that', 'this', 'those', 'these'];
    for (const term of ambiguousTerms) {
      if (query.toLowerCase().includes(term)) {
        validation.suggestions.push(`Consider being more specific instead of "${term}"`);
      }
    }

    return validation;
  }

  // Query suggestions
  static generateSuggestions(partialQuery: string): QuerySuggestion[] {
    const suggestions: QuerySuggestion[] = [];

    // Common query patterns
    const commonPatterns = [
      'Show me the total revenue',
      'What is the trend of sales over time',
      'Compare revenue by region',
      'Find anomalies in user activity',
      'Predict next month sales',
    ];

    // Filter based on partial query
    const matchingPatterns = commonPatterns.filter(pattern =>
      pattern.toLowerCase().includes(partialQuery.toLowerCase())
    );

    suggestions.push(...matchingPatterns.map(pattern => ({
      text: pattern,
      type: 'pattern',
      confidence: 0.8,
    })));

    // Add entity suggestions
    const availableMetrics = Object.keys(this.ENTITY_MAPPINGS.metrics);
    const availableDimensions = Object.keys(this.ENTITY_MAPPINGS.dimensions);

    if (partialQuery.toLowerCase().includes('revenue') || partialQuery.toLowerCase().includes('sales')) {
      suggestions.push({
        text: `Compare ${partialQuery} by region`,
        type: 'completion',
        confidence: 0.7,
      });
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  // Multi-language support
  static async translateQuery(query: string, targetLanguage: string): Promise<string> {
    // Placeholder for multi-language support
    // In production, this would integrate with translation services
    return query;
  }
}

// Interface definitions
interface QueryResult {
  originalQuery: string;
  intent: QueryIntent;
  entities: QueryEntity[];
  generatedSQL: string;
  confidence: number;
  processingTime: number;
  timestamp: Date;
  error?: string;
}

type QueryIntent =
  | 'aggregation'
  | 'trend'
  | 'comparison'
  | 'correlation'
  | 'prediction'
  | 'anomaly'
  | 'unknown';

interface QueryEntity {
  type: 'metric' | 'dimension' | 'time' | 'number' | 'operator';
  value: string;
  mappedValue: string;
  confidence: number;
}

interface QueryContext {
  tableName?: string;
  schema?: Record<string, any>;
  userPermissions?: string[];
  timeZone?: string;
}

interface QueryValidation {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}

interface QuerySuggestion {
  text: string;
  type: 'pattern' | 'completion' | 'correction';
  confidence: number;
}

export default NaturalLanguageQuery;