// Real-Time Collaboration System with Presence and Awareness
export class RealTimeCollaboration {
  private static readonly PRESENCE_UPDATE_INTERVAL = 30000; // 30 seconds
  private static readonly ACTIVITY_TIMEOUT = 300000; // 5 minutes
  private static readonly MAX_COLLABORATORS = 50;

  // Collaboration state
  private static activeSessions = new Map<string, CollaborationSession>();
  private static userPresence = new Map<string, UserPresence>();
  private static activityFeed = new Map<string, ActivityEvent[]>();
  private static collaborationSpaces = new Map<string, CollaborationSpace>();

  private static isInitialized = false;

  // Initialize collaboration system
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set up presence tracking
      this.initializePresenceTracking();

      // Initialize collaboration spaces
      await this.initializeCollaborationSpaces();

      // Set up activity monitoring
      this.initializeActivityMonitoring();

      // Start presence broadcasting
      this.startPresenceBroadcasting();

      this.isInitialized = true;
      console.log('Real-time collaboration system initialized');
    } catch (error) {
      console.error('Collaboration system initialization failed:', error);
      throw error;
    }
  }

  // Join collaboration session
  static async joinSession(
    sessionId: string,
    userId: string,
    userInfo: UserInfo
  ): Promise<SessionJoinResult> {
    if (!this.isInitialized) await this.initialize();

    let session = this.activeSessions.get(sessionId);
    if (!session) {
      // Create new session
      session = {
        id: sessionId,
        participants: new Map(),
        createdAt: new Date(),
        lastActivity: new Date(),
        settings: {
          maxParticipants: this.MAX_COLLABORATORS,
          allowAnonymous: false,
          requireApproval: false,
        },
      };
      this.activeSessions.set(sessionId, session);
    }

    // Check session capacity
    if (session.participants.size >= session.settings.maxParticipants) {
      throw new Error('Session is at maximum capacity');
    }

    // Add participant
    const participant: SessionParticipant = {
      userId,
      userInfo,
      joinedAt: new Date(),
      lastActivity: new Date(),
      role: 'participant',
      permissions: ['read', 'write'],
      status: 'active',
    };

    session.participants.set(userId, participant);
    session.lastActivity = new Date();

    // Update user presence
    this.updateUserPresence(userId, {
      userId,
      status: 'online',
      currentSession: sessionId,
      lastSeen: new Date(),
      activities: [],
    });

    // Broadcast join event
    await this.broadcastToSession(sessionId, {
      type: 'participant_joined',
      participant,
      timestamp: new Date(),
    });

    // Add to activity feed
    await this.addToActivityFeed(sessionId, {
      id: `activity-${Date.now()}`,
      type: 'user_joined',
      userId,
      sessionId,
      timestamp: new Date(),
      data: { userInfo },
    });

    console.log(`User ${userId} joined session: ${sessionId}`);

    return {
      session,
      participant,
      success: true,
    };
  }

  // Leave collaboration session
  static async leaveSession(sessionId: string, userId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.get(userId);
    if (!participant) return;

    // Remove participant
    session.participants.delete(userId);

    // Update presence
    const presence = this.userPresence.get(userId);
    if (presence) {
      presence.status = 'offline';
      presence.lastSeen = new Date();
      presence.currentSession = undefined;
    }

    // Broadcast leave event
    await this.broadcastToSession(sessionId, {
      type: 'participant_left',
      userId,
      timestamp: new Date(),
    });

    // Add to activity feed
    await this.addToActivityFeed(sessionId, {
      id: `activity-${Date.now()}`,
      type: 'user_left',
      userId,
      sessionId,
      timestamp: new Date(),
    });

    // Clean up empty sessions
    if (session.participants.size === 0) {
      this.activeSessions.delete(sessionId);
      console.log(`Session cleaned up: ${sessionId}`);
    }

    console.log(`User ${userId} left session: ${sessionId}`);
  }

  // Update user presence
  static async updatePresence(userId: string, presence: Partial<UserPresence>): Promise<void> {
    const currentPresence = this.userPresence.get(userId);
    if (!currentPresence) return;

    // Update presence
    Object.assign(currentPresence, presence);
    currentPresence.lastSeen = new Date();

    // Broadcast presence update
    const sessionId = currentPresence.currentSession;
    if (sessionId) {
      await this.broadcastToSession(sessionId, {
        type: 'presence_updated',
        userId,
        presence: currentPresence,
        timestamp: new Date(),
      });
    }

    console.log(`Presence updated for user: ${userId}`);
  }

  // Send collaborative action
  static async sendAction(
    sessionId: string,
    userId: string,
    action: CollaborativeAction
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const participant = session.participants.get(userId);
    if (!participant) {
      throw new Error(`Participant not found: ${userId}`);
    }

    // Update participant activity
    participant.lastActivity = new Date();
    session.lastActivity = new Date();

    // Add action to participant activities
    const presence = this.userPresence.get(userId);
    if (presence) {
      presence.activities.unshift({
        type: action.type,
        timestamp: new Date(),
        data: action.data,
      });

      // Keep only recent activities
      presence.activities = presence.activities.slice(0, 10);
    }

    // Broadcast action to session
    await this.broadcastToSession(sessionId, {
      type: 'action_performed',
      userId,
      action,
      timestamp: new Date(),
    });

    // Add to activity feed
    await this.addToActivityFeed(sessionId, {
      id: `activity-${Date.now()}`,
      type: 'action_performed',
      userId,
      sessionId,
      timestamp: new Date(),
      data: action,
    });

    console.log(`Action sent in session ${sessionId} by ${userId}: ${action.type}`);
  }

  // Get session awareness information
  static getSessionAwareness(sessionId: string): SessionAwareness | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    const participants = Array.from(session.participants.values());
    const presence = participants.map(p => this.userPresence.get(p.userId)).filter(Boolean);

    return {
      sessionId,
      participants: participants.map(p => ({
        userId: p.userId,
        userInfo: p.userInfo,
        status: p.status,
        lastActivity: p.lastActivity,
        role: p.role,
      })),
      presence: presence.map(p => ({
        userId: p!.userId,
        status: p!.status,
        lastSeen: p!.lastSeen,
        activities: p!.activities.slice(0, 5), // Recent activities
      })),
      activityFeed: this.activityFeed.get(sessionId) || [],
      sessionStats: {
        participantCount: participants.length,
        activeUsers: participants.filter(p => p.status === 'active').length,
        lastActivity: session.lastActivity,
        createdAt: session.createdAt,
      },
    };
  }

  // Create collaboration space
  static async createSpace(spaceConfig: SpaceConfig): Promise<CollaborationSpace> {
    const spaceId = `space-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const space: CollaborationSpace = {
      id: spaceId,
      name: spaceConfig.name,
      description: spaceConfig.description,
      type: spaceConfig.type,
      settings: spaceConfig.settings,
      sessions: new Map(),
      createdAt: new Date(),
      lastActivity: new Date(),
      participants: new Set(),
    };

    this.collaborationSpaces.set(spaceId, space);

    console.log(`Collaboration space created: ${spaceId}`);
    return space;
  }

  // Join collaboration space
  static async joinSpace(spaceId: string, userId: string): Promise<void> {
    const space = this.collaborationSpaces.get(spaceId);
    if (!space) {
      throw new Error(`Space not found: ${spaceId}`);
    }

    space.participants.add(userId);
    space.lastActivity = new Date();

    console.log(`User ${userId} joined space: ${spaceId}`);
  }

  // Collaborative document editing
  static async applyDocumentEdit(
    sessionId: string,
    userId: string,
    edit: DocumentEdit
  ): Promise<void> {
    // Apply operational transformation for collaborative editing
    await this.sendAction(sessionId, userId, {
      type: 'document_edit',
      data: edit,
      timestamp: new Date(),
    });
  }

  // Real-time notifications
  static async sendNotification(
    sessionId: string,
    notification: CollaborationNotification
  ): Promise<void> {
    await this.broadcastToSession(sessionId, {
      type: 'notification',
      notification,
      timestamp: new Date(),
    });

    console.log(`Notification sent to session: ${sessionId}`);
  }

  // Get user activity summary
  static getUserActivitySummary(userId: string, timeRange: TimeRange): UserActivitySummary {
    const presence = this.userPresence.get(userId);
    if (!presence) {
      return {
        userId,
        totalSessions: 0,
        totalActions: 0,
        activeTime: 0,
        collaborations: [],
      };
    }

    // Calculate activity metrics
    const sessions = Array.from(this.activeSessions.values())
      .filter(session => session.participants.has(userId));

    const totalActions = presence.activities.length;
    const activeTime = this.calculateActiveTime(userId, timeRange);

    return {
      userId,
      totalSessions: sessions.length,
      totalActions,
      activeTime,
      collaborations: sessions.map(session => ({
        sessionId: session.id,
        joinedAt: session.participants.get(userId)?.joinedAt,
        lastActivity: session.participants.get(userId)?.lastActivity,
      })),
    };
  }

  // Helper methods
  private static initializePresenceTracking(): void {
    // Set up presence tracking timers
    setInterval(() => {
      this.updatePresenceStatuses();
    }, this.PRESENCE_UPDATE_INTERVAL);
  }

  private static async initializeCollaborationSpaces(): Promise<void> {
    // Create default collaboration spaces
    const defaultSpaces = [
      {
        name: 'General Collaboration',
        description: 'General purpose collaboration space',
        type: 'general',
        settings: {
          maxParticipants: 100,
          allowAnonymous: false,
          autoCleanup: true,
        },
      },
      {
        name: 'Document Editing',
        description: 'Collaborative document editing space',
        type: 'document',
        settings: {
          maxParticipants: 20,
          allowAnonymous: false,
          versionControl: true,
        },
      },
    ];

    for (const spaceConfig of defaultSpaces) {
      await this.createSpace(spaceConfig);
    }

    console.log(`Initialized ${defaultSpaces.length} default collaboration spaces`);
  }

  private static initializeActivityMonitoring(): void {
    // Set up activity monitoring
    setInterval(() => {
      this.monitorSessionActivity();
    }, 60000); // Every minute
  }

  private static startPresenceBroadcasting(): void {
    // Broadcast presence updates
    setInterval(async () => {
      await this.broadcastPresenceUpdates();
    }, 10000); // Every 10 seconds
  }

  private static async broadcastToSession(sessionId: string, event: CollaborationEvent): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // Broadcast to all session participants (would use WebSocket/SSE in real implementation)
    for (const participant of session.participants.values()) {
      try {
        // Send event to participant
        console.log(`Event sent to ${participant.userId}: ${event.type}`);
      } catch (error) {
        console.error(`Failed to send event to ${participant.userId}:`, error);
      }
    }
  }

  private static async addToActivityFeed(sessionId: string, activity: ActivityEvent): Promise<void> {
    if (!this.activityFeed.has(sessionId)) {
      this.activityFeed.set(sessionId, []);
    }

    const feed = this.activityFeed.get(sessionId)!;
    feed.unshift(activity);

    // Keep only recent activities (last 100)
    if (feed.length > 100) {
      feed.splice(100);
    }
  }

  private static updateUserPresence(userId: string, presence: UserPresence): void {
    this.userPresence.set(userId, presence);
  }

  private static updatePresenceStatuses(): void {
    const now = Date.now();

    for (const [userId, presence] of this.userPresence) {
      const timeSinceLastSeen = now - presence.lastSeen.getTime();

      if (timeSinceLastSeen > this.ACTIVITY_TIMEOUT) {
        presence.status = 'away';
      }

      // Clean up offline users after extended period
      if (presence.status === 'offline' && timeSinceLastSeen > 24 * 60 * 60 * 1000) {
        this.userPresence.delete(userId);
      }
    }
  }

  private static monitorSessionActivity(): void {
    const now = Date.now();
    const inactivityTimeout = 2 * 60 * 60 * 1000; // 2 hours

    for (const [sessionId, session] of this.activeSessions) {
      const timeSinceLastActivity = now - session.lastActivity.getTime();

      if (timeSinceLastActivity > inactivityTimeout && session.settings.autoCleanup) {
        // Clean up inactive session
        this.activeSessions.delete(sessionId);
        console.log(`Inactive session cleaned up: ${sessionId}`);
      }
    }
  }

  private static async broadcastPresenceUpdates(): Promise<void> {
    // Broadcast presence updates to all active sessions
    for (const session of this.activeSessions.values()) {
      const awareness = this.getSessionAwareness(session.id);
      if (awareness) {
        await this.broadcastToSession(session.id, {
          type: 'awareness_update',
          awareness,
          timestamp: new Date(),
        });
      }
    }
  }

  private static calculateActiveTime(userId: string, timeRange: TimeRange): number {
    // Calculate total active time for user in time range
    let activeTime = 0;

    for (const session of this.activeSessions.values()) {
      const participant = session.participants.get(userId);
      if (participant) {
        const sessionStart = Math.max(participant.joinedAt.getTime(), timeRange.start.getTime());
        const sessionEnd = Math.min(participant.lastActivity.getTime(), timeRange.end.getTime());
        activeTime += Math.max(0, sessionEnd - sessionStart);
      }
    }

    return activeTime;
  }
}

// Interface definitions
interface CollaborationSession {
  id: string;
  participants: Map<string, SessionParticipant>;
  createdAt: Date;
  lastActivity: Date;
  settings: SessionSettings;
}

interface SessionParticipant {
  userId: string;
  userInfo: UserInfo;
  joinedAt: Date;
  lastActivity: Date;
  role: 'owner' | 'moderator' | 'participant' | 'observer';
  permissions: string[];
  status: 'active' | 'inactive' | 'away';
}

interface SessionSettings {
  maxParticipants: number;
  allowAnonymous: boolean;
  requireApproval: boolean;
  autoCleanup: boolean;
}

interface UserInfo {
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'offline';
  currentSession?: string;
  lastSeen: Date;
  activities: UserActivity[];
}

interface UserActivity {
  type: string;
  timestamp: Date;
  data?: any;
}

interface SessionJoinResult {
  session: CollaborationSession;
  participant: SessionParticipant;
  success: boolean;
}

interface CollaborativeAction {
  type: string;
  data: any;
  timestamp: Date;
}

interface CollaborationEvent {
  type: string;
  participant?: SessionParticipant;
  userId?: string;
  presence?: UserPresence;
  action?: CollaborativeAction;
  awareness?: SessionAwareness;
  notification?: CollaborationNotification;
  timestamp: Date;
}

interface SessionAwareness {
  sessionId: string;
  participants: Array<{
    userId: string;
    userInfo: UserInfo;
    status: string;
    lastActivity: Date;
    role: string;
  }>;
  presence: Array<{
    userId: string;
    status: string;
    lastSeen: Date;
    activities: UserActivity[];
  }>;
  activityFeed: ActivityEvent[];
  sessionStats: {
    participantCount: number;
    activeUsers: number;
    lastActivity: Date;
    createdAt: Date;
  };
}

interface ActivityEvent {
  id: string;
  type: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  data?: any;
}

interface CollaborationSpace {
  id: string;
  name: string;
  description: string;
  type: string;
  settings: SpaceSettings;
  sessions: Map<string, CollaborationSession>;
  createdAt: Date;
  lastActivity: Date;
  participants: Set<string>;
}

interface SpaceConfig {
  name: string;
  description: string;
  type: string;
  settings: SpaceSettings;
}

interface SpaceSettings {
  maxParticipants: number;
  allowAnonymous: boolean;
  autoCleanup: boolean;
  versionControl?: boolean;
}

interface DocumentEdit {
  operation: 'insert' | 'delete' | 'update';
  position: number;
  content: string;
  userId: string;
}

interface CollaborationNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  userId?: string;
  data?: any;
}

interface UserActivitySummary {
  userId: string;
  totalSessions: number;
  totalActions: number;
  activeTime: number;
  collaborations: Array<{
    sessionId: string;
    joinedAt?: Date;
    lastActivity?: Date;
  }>;
}

interface TimeRange {
  start: Date;
  end: Date;
}

export default RealTimeCollaboration;