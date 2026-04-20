// Advanced Workflow & Automation System

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'webhook' | 'email' | 'api_call' | 'database' | 'approval' | 'notification';
  name: string;
  description?: string;
  position: {
    x: number;
    y: number;
  };
  config: NodeConfig;
  connections: {
    inputs: string[];  // Node IDs that connect to this node
    outputs: string[]; // Node IDs that this node connects to
  };
  status: 'idle' | 'running' | 'completed' | 'failed' | 'waiting';
  executionData?: any;
  executedAt?: Date;
  errorMessage?: string;
}

export interface NodeConfig {
  // Trigger-specific config
  triggerType?: 'manual' | 'schedule' | 'event' | 'webhook' | 'api';
  triggerCondition?: Record<string, any>;

  // Action-specific config
  actionType?: 'send_email' | 'create_record' | 'update_record' | 'api_call' | 'notification' | 'approval';
  actionConfig?: Record<string, any>;

  // Condition-specific config
  conditionType?: 'if_else' | 'switch' | 'filter';
  conditionRules?: ConditionRule[];

  // Delay-specific config
  delayType?: 'fixed' | 'dynamic';
  delayValue?: number; // seconds
  delayUntil?: Date;

  // Webhook-specific config
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  webhookHeaders?: Record<string, string>;
  webhookBody?: any;

  // Email-specific config
  emailTemplate?: string;
  emailRecipients?: string[];
  emailSubject?: string;
  emailBody?: string;

  // API-specific config
  apiUrl?: string;
  apiMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  apiHeaders?: Record<string, string>;
  apiBody?: any;
  apiAuth?: {
    type: 'none' | 'basic' | 'bearer' | 'api_key';
    credentials?: Record<string, string>;
  };

  // Database-specific config
  databaseOperation?: 'select' | 'insert' | 'update' | 'delete';
  tableName?: string;
  query?: string;
  parameters?: Record<string, any>;

  // Approval-specific config
  approvers?: string[];
  approvalType?: 'single' | 'majority' | 'unanimous';
  timeout?: number; // hours

  // Notification-specific config
  notificationType?: 'email' | 'sms' | 'push' | 'in_app';
  notificationTemplate?: string;
  notificationRecipients?: string[];
}

export interface ConditionRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'regex' | 'is_empty' | 'is_not_empty';
  value: any;
  logic?: 'AND' | 'OR';
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  category: 'automation' | 'approval' | 'integration' | 'notification' | 'custom';
  version: number;
  status: 'draft' | 'active' | 'paused' | 'archived';

  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  variables: WorkflowVariable[];

  triggers: WorkflowTrigger[];
  settings: WorkflowSettings;

  executionStats: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageExecutionTime: number;
    lastExecutedAt?: Date;
  };

  permissions: {
    ownerId: string;
    editors: string[];
    viewers: string[];
    executors: string[];
  };

  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePort?: string;
  targetPort?: string;
  condition?: ConditionRule; // For conditional connections
  label?: string;
}

export interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  scope: 'workflow' | 'execution';
  defaultValue?: any;
  description?: string;
  required: boolean;
}

export interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'schedule' | 'event' | 'webhook' | 'api';
  config: {
    // Schedule config
    cronExpression?: string;
    timezone?: string;

    // Event config
    eventType?: string;
    eventFilters?: Record<string, any>;

    // Webhook config
    webhookPath?: string;
    webhookSecret?: string;

    // API config
    apiEndpoint?: string;
  };
  enabled: boolean;
  lastTriggeredAt?: Date;
}

export interface WorkflowSettings {
  timeout: number; // seconds
  maxRetries: number;
  retryDelay: number; // seconds
  errorHandling: 'stop' | 'continue' | 'retry';
  loggingLevel: 'none' | 'basic' | 'detailed';
  notifications: {
    onStart: boolean;
    onComplete: boolean;
    onError: boolean;
    recipients: string[];
  };
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowVersion: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
  trigger: WorkflowTrigger;
  triggerData?: any;

  startedAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds

  nodeExecutions: NodeExecution[];
  variables: Record<string, any>;
  logs: ExecutionLog[];

  error?: {
    message: string;
    nodeId?: string;
    stackTrace?: string;
  };

  performance: {
    totalNodes: number;
    executedNodes: number;
    failedNodes: number;
    skippedNodes: number;
  };
}

export interface NodeExecution {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  inputData?: any;
  outputData?: any;
  error?: string;
  retries: number;
}

export interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  nodeId?: string;
  data?: any;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tags: string[];
  workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>;
  usageCount: number;
  rating: {
    average: number;
    count: number;
  };
  createdBy: string;
  isPublic: boolean;
}

// Workflow Context for execution
export interface WorkflowContext {
  executionId: string;
  workflowId: string;
  variables: Record<string, any>;
  triggerData?: any;
  currentNode?: WorkflowNode;
  executionHistory: NodeExecution[];
  startTime: Date;
  timeout: number;
}

// Workflow Engine Events
export interface WorkflowEvent {
  type: 'workflow_started' | 'workflow_completed' | 'workflow_failed' | 'node_started' | 'node_completed' | 'node_failed' | 'node_skipped';
  workflowId: string;
  executionId: string;
  nodeId?: string;
  data?: any;
  timestamp: Date;
}

// Decision Engine Rules
export interface DecisionRule {
  id: string;
  name: string;
  description?: string;
  conditions: ConditionRule[];
  actions: DecisionAction[];
  priority: number;
  enabled: boolean;
  category: string;
  tags: string[];
}

export interface DecisionAction {
  type: 'set_variable' | 'send_notification' | 'trigger_workflow' | 'update_record' | 'create_task' | 'approve_request' | 'reject_request';
  config: Record<string, any>;
}

// Document Processing
export interface DocumentProcessingRequest {
  id: string;
  documentUrl: string;
  documentType: 'pdf' | 'image' | 'docx' | 'xlsx';
  processingType: 'ocr' | 'data_extraction' | 'classification' | 'signature_detection';
  config: {
    language?: string;
    extractFields?: string[];
    confidenceThreshold?: number;
    regionsOfInterest?: Array<{
      name: string;
      coordinates: [number, number, number, number]; // x1, y1, x2, y2
    }>;
  };
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface DocumentProcessingResult {
  id: string;
  requestId: string;
  status: 'processing' | 'completed' | 'failed';
  extractedData?: Record<string, any>;
  textContent?: string;
  confidence: number;
  processingTime: number;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}