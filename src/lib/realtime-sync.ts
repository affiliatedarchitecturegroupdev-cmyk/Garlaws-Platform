import React, { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store/app-store';

export function useRealtimeSync() {
  const { syncModuleData, addNotification } = useAppStore();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connectWebSocket = () => {
    try {
      // In a real app, this would connect to your WebSocket server
      // For demo purposes, we'll simulate real-time updates with polling
      console.log('Connecting to real-time sync...');

      // Simulate WebSocket connection
      wsRef.current = {
        send: () => {},
        close: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      } as any;

      // Simulate real-time updates every 30 seconds
      const interval = setInterval(async () => {
        // Randomly sync different modules to simulate real-time updates
        const modules = ['financial', 'inventory', 'orders', 'projects'];
        const randomModule = modules[Math.floor(Math.random() * modules.length)];

        try {
          await syncModuleData(randomModule);

          // Add notification for real-time update
          addNotification({
            id: `realtime-${Date.now()}`,
            type: 'info',
            title: 'Data Updated',
            message: `${randomModule.charAt(0).toUpperCase() + randomModule.slice(1)} data synchronized`,
            timestamp: new Date(),
            read: false
          });
        } catch (error) {
          console.error('Real-time sync failed:', error);
        }
      }, 30000);

      // Clean up interval on disconnect
      wsRef.current.addEventListener('close', () => {
        clearInterval(interval);
      });

      reconnectAttempts.current = 0;
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      addNotification({
        id: `reconnect-failed-${Date.now()}`,
        type: 'error',
        title: 'Connection Lost',
        message: 'Unable to reconnect to real-time updates. Please refresh the page.',
        timestamp: new Date(),
        read: false
      });
      return;
    }

    reconnectAttempts.current++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
      connectWebSocket();
    }, delay);
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    connectWebSocket();

    // Listen for visibility change to reconnect when tab becomes active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !wsRef.current) {
        connectWebSocket();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    isConnected: !!wsRef.current,
    reconnectAttempts: reconnectAttempts.current
  };
}

// Hook for module-specific real-time updates
export function useModuleSync(moduleName: string) {
  const { syncModuleData, addNotification } = useAppStore();

  const forceSync = async () => {
    try {
      await syncModuleData(moduleName);
      addNotification({
        id: `manual-sync-${Date.now()}`,
        type: 'success',
        title: 'Sync Complete',
        message: `${moduleName} data synchronized successfully`,
        timestamp: new Date(),
        read: false
      });
    } catch (error) {
      addNotification({
        id: `manual-sync-error-${Date.now()}`,
        type: 'error',
        title: 'Sync Failed',
        message: `Failed to synchronize ${moduleName} data`,
        timestamp: new Date(),
        read: false
      });
    }
  };

  return { forceSync };
}

// Real-time sync provider component (to be used in a React component)
export function useRealtimeSyncProvider() {
  return useRealtimeSync();
}