import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface WSClient extends WebSocket {
  userId?: number;
  userRole?: string;
  isAlive?: boolean;
}

interface WSEvent {
  type: string;
  payload: any;
  userId?: number;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<number, WSClient> = new Map();
  private heartbeatInterval!: NodeJS.Timeout;

  constructor(port: number = 8080) {
    this.wss = new WebSocketServer({
      port,
      perMessageDeflate: false,
    });

    this.setupWebSocketServer();
    this.setupHeartbeat();
    console.log(`WebSocket server started on port ${port}`);
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WSClient, request: IncomingMessage) => {
      const url = parse(request.url || '', true);
      const token = url.query.token as string;

      // Authenticate user
      if (!token) {
        ws.close(4001, 'Authentication required');
        return;
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        ws.userId = decoded.userId;
        ws.userRole = decoded.role;
        ws.isAlive = true;

        // Store client connection
        this.clients.set(decoded.userId, ws);

        console.log(`User ${decoded.userId} connected via WebSocket`);

        // Handle incoming messages
        ws.on('message', (data: Buffer) => {
          try {
            const event: WSEvent = JSON.parse(data.toString());
            this.handleMessage(ws, event);
          } catch (error) {
            console.error('Invalid message format:', error);
          }
        });

        // Handle client disconnect
        ws.on('close', () => {
          console.log(`User ${ws.userId} disconnected`);
          if (ws.userId) {
            this.clients.delete(ws.userId);
          }
        });

        // Handle pong for heartbeat
        ws.on('pong', () => {
          ws.isAlive = true;
        });

      } catch (error) {
        ws.close(4002, 'Invalid authentication token');
      }
    });
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: WSClient) => {
        if (!ws.isAlive) {
          if (ws.userId) {
            this.clients.delete(ws.userId);
          }
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds
  }

  private handleMessage(ws: WSClient, event: WSEvent) {
    switch (event.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;

      case 'join_conversation':
        // Handle joining a conversation room
        this.joinConversation(ws, event.payload.conversationId);
        break;

      case 'leave_conversation':
        // Handle leaving a conversation room
        this.leaveConversation(ws, event.payload.conversationId);
        break;

      case 'send_message':
        // Handle sending a message to conversation
        this.handleSendMessage(ws, event.payload);
        break;

      case 'join_video_room':
        // Handle joining video room
        this.handleJoinVideoRoom(ws, event.payload);
        break;

      case 'video_offer':
        // Handle video offer
        this.handleVideoOffer(ws, event.payload);
        break;

      case 'video_answer':
        // Handle video answer
        this.handleVideoAnswer(ws, event.payload);
        break;

      case 'ice_candidate':
        // Handle ICE candidate
        this.handleIceCandidate(ws, event.payload);
        break;

      case 'end_call':
        // Handle call end
        this.handleEndCall(ws, event.payload);
        break;

      default:
        console.log('Unknown event type:', event.type);
    }
  }

  private joinConversation(ws: WSClient, conversationId: number) {
    if (!ws.userId) return;

    // In a more advanced implementation, you'd manage conversation rooms
    // For now, just acknowledge the join
    ws.send(JSON.stringify({
      type: 'conversation_joined',
      payload: { conversationId }
    }));
  }

  private leaveConversation(ws: WSClient, conversationId: number) {
    if (!ws.userId) return;

    ws.send(JSON.stringify({
      type: 'conversation_left',
      payload: { conversationId }
    }));
  }

  private async handleSendMessage(ws: WSClient, payload: any) {
    if (!ws.userId) return;

    try {
      // Get user details for the message
      const { db } = await import('@/db');
      const { users } = await import('@/db/schema');
      const { eq } = await import('drizzle-orm');

      const user = await db
        .select({ id: users.id, name: users.name, role: users.role })
        .from(users)
        .where(eq(users.id, ws.userId))
        .limit(1);

      if (user.length === 0) return;

      const sender = user[0];

      // Broadcast the message to all conversation participants
      this.broadcastToConversation(payload.conversationId, {
        type: 'new_message',
        payload: {
          conversationId: payload.conversationId,
          messageId: Date.now(), // In real app, this would be from database
          content: payload.content,
          messageType: payload.messageType,
          createdAt: new Date().toISOString(),
          senderId: sender.id,
          senderName: sender.name,
          senderRole: sender.role,
        }
      });

      // Send push notification to other participants
      await this.sendPushNotificationForMessage(payload.conversationId, sender, payload.content);

    } catch (error) {
      console.error('Failed to handle send message:', error);
    }
  }

  // Broadcast to all clients
  broadcast(event: WSEvent) {
    const message = JSON.stringify(event);
    this.wss.clients.forEach((client: WSClient) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Send to specific user
  sendToUser(userId: number, event: WSEvent) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  }

  // Send to multiple users
  sendToUsers(userIds: number[], event: WSEvent) {
    const message = JSON.stringify(event);
    userIds.forEach(userId => {
      const client = this.clients.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Broadcast to conversation participants
  async broadcastToConversation(conversationId: number, event: WSEvent) {
    try {
      // Get conversation participants from database
      const { db } = await import('@/db');
      const { conversation_participants } = await import('@/db/schema');
      const { eq } = await import('drizzle-orm');

      const participants = await db
        .select({ userId: conversation_participants.userId })
        .from(conversation_participants)
        .where(eq(conversation_participants.conversationId, conversationId));

      const userIds = participants.map(p => p.userId);
      this.sendToUsers(userIds, event);
    } catch (error) {
      console.error('Failed to broadcast to conversation:', error);
    }
  }

  // Video call room management and push notifications
  private videoRooms: Map<string, WSClient[]> = new Map();

  private async handleJoinVideoRoom(ws: WSClient, payload: any) {
    const { roomId } = payload;
    if (!ws.userId) return;

    if (!this.videoRooms.has(roomId)) {
      this.videoRooms.set(roomId, []);
    }

    const room = this.videoRooms.get(roomId)!;
    room.push(ws);

    console.log(`User ${ws.userId} joined video room ${roomId}`);

    // Notify room participants
    room.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'participant_joined',
          payload: { roomId, userId: ws.userId }
        }));
      }
    });
  }

  private handleVideoOffer(ws: WSClient, payload: any) {
    const { roomId } = payload;
    const room = this.videoRooms.get(roomId);
    if (!room) return;

    // Send offer to all other participants in the room
    room.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'video_offer',
          payload: payload
        }));
      }
    });
  }

  private handleVideoAnswer(ws: WSClient, payload: any) {
    const { roomId } = payload;
    const room = this.videoRooms.get(roomId);
    if (!room) return;

    // Send answer to all other participants in the room
    room.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'video_answer',
          payload: payload
        }));
      }
    });
  }

  private handleIceCandidate(ws: WSClient, payload: any) {
    const { roomId } = payload;
    const room = this.videoRooms.get(roomId);
    if (!room) return;

    // Send ICE candidate to all other participants in the room
    room.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'ice_candidate',
          payload: payload
        }));
      }
    });
  }

  private handleEndCall(ws: WSClient, payload: any) {
    const { roomId } = payload;
    const room = this.videoRooms.get(roomId);
    if (!room) return;

    // Notify all participants that call ended
    room.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'call_ended',
          payload: { roomId }
        }));
      }
    });

    // Remove room
    this.videoRooms.delete(roomId);
  }

  private async sendPushNotificationForMessage(conversationId: number, sender: any, content: string) {
    try {
      // Import push notification service dynamically
      const { pushNotificationService } = await import('@/lib/push-notification-service');

      // Get conversation participants (excluding sender)
      const { db } = await import('@/db');
      const { conversation_participants } = await import('@/db/schema');
      const { eq, ne } = await import('drizzle-orm');

      const participants = await db
        .select({ userId: conversation_participants.userId })
        .from(conversation_participants)
        .where(eq(conversation_participants.conversationId, conversationId));

      // Send notification to each participant
      for (const participant of participants) {
        if (participant.userId !== sender.id) {
          // Check if user is not currently connected
          const client = this.clients.get(participant.userId);
          if (!client || client.readyState !== WebSocket.OPEN) {
            await pushNotificationService.notifyNewMessage(conversationId, sender.name, content);
          }
        }
      }
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.clients.size;
  }

  // Graceful shutdown
  shutdown() {
    clearInterval(this.heartbeatInterval);
    this.wss.close();
    console.log('WebSocket server shut down');
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null;

export function getWebSocketManager(): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager();
  }
  return wsManager;
}

export { WebSocketManager };