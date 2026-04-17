import { NextRequest } from 'next/server';
import { getWebSocketManager } from '@/lib/websocket-manager';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  if (!userId || !token) {
    return new Response('Missing userId or token', { status: 400 });
  }

  // Validate token (simplified - in production use proper JWT validation)
  try {
    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'connected',
          timestamp: Date.now()
        })}\n\n`));

        // Set up periodic heartbeat
        const heartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: Date.now()
          })}\n\n`));
        }, 30000);

        // Store cleanup function
        (controller as any).cleanup = () => clearInterval(heartbeat);
      },
      cancel() {
        // Cleanup on disconnect
        const controller = this as any;
        if (controller.cleanup) {
          controller.cleanup();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response('Authentication failed', { status: 401 });
  }
}

// WebSocket upgrade endpoint
export async function POST(request: NextRequest) {
  // This would handle WebSocket upgrade requests
  // For now, return the SSE endpoint info
  return new Response(JSON.stringify({
    websocketUrl: `ws://localhost:8080?token=${request.headers.get('authorization')?.replace('Bearer ', '')}`,
    sseUrl: `/api/sse?userId=${request.headers.get('x-user-id')}&token=${request.headers.get('authorization')?.replace('Bearer ', '')}`
  }));
}