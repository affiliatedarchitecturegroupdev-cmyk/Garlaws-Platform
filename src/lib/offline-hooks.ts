"use client";

import { useState, useEffect } from 'react';

interface OfflineData {
  messages: any[];
  bookings: any[];
  lastSync: Date | null;
}

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);

      // Trigger sync when coming back online
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          if ('sync' in (registration as any)) {
            (registration as any).sync.register('background-sync-data');
          }
        });
      }

      // Dispatch custom event for components to react
      window.dispatchEvent(new CustomEvent('online-status-changed', {
        detail: { isOnline: true, wasOffline: true }
      }));
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(false);

      window.dispatchEvent(new CustomEvent('online-status-changed', {
        detail: { isOnline: false, wasOffline: false }
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}

export function useOfflineStorage() {
  const [offlineData, setOfflineData] = useState<OfflineData>({
    messages: [],
    bookings: [],
    lastSync: null,
  });

  useEffect(() => {
    // Load offline data from localStorage or IndexedDB
    loadOfflineData();

    // Listen for sync completion
    const handleSyncComplete = () => {
      loadOfflineData();
    };

    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data.type === 'SYNC_COMPLETE') {
        handleSyncComplete();
      }
    });

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleSyncComplete);
    };
  }, []);

  const loadOfflineData = async () => {
    try {
      // Load from localStorage for simplicity
      // In production, consider IndexedDB for larger datasets
      const messages = JSON.parse(localStorage.getItem('offline_messages') || '[]');
      const bookings = JSON.parse(localStorage.getItem('offline_bookings') || '[]');
      const lastSync = localStorage.getItem('last_sync') ? new Date(localStorage.getItem('last_sync')!) : null;

      setOfflineData({ messages, bookings, lastSync });
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const saveOfflineData = (type: 'messages' | 'bookings', data: any) => {
    try {
      const key = `offline_${type}`;
      const existingData = JSON.parse(localStorage.getItem(key) || '[]');

      // Add timestamp for sync tracking
      const dataWithTimestamp = {
        ...data,
        offlineTimestamp: Date.now(),
        synced: false,
      };

      existingData.push(dataWithTimestamp);
      localStorage.setItem(key, JSON.stringify(existingData));

      // Update state
      setOfflineData(prev => ({
        ...prev,
        [type]: existingData,
      }));

      // Register background sync
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          if ('sync' in (registration as any)) {
            (registration as any).sync.register(`background-sync-${type}`);
          }
        });
      }
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  };

  const clearOfflineData = (type?: 'messages' | 'bookings') => {
    try {
      if (type) {
        localStorage.removeItem(`offline_${type}`);
        setOfflineData(prev => ({
          ...prev,
          [type]: [],
        }));
      } else {
        localStorage.removeItem('offline_messages');
        localStorage.removeItem('offline_bookings');
        setOfflineData(prev => ({
          messages: [],
          bookings: [],
          lastSync: prev.lastSync,
        }));
      }
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  };

  return {
    offlineData,
    saveOfflineData,
    clearOfflineData,
    loadOfflineData,
  };
}

export function useNetworkStatus() {
  const { isOnline } = useOfflineStatus();

  const checkConnection = async (): Promise<boolean> => {
    if (!navigator.onLine) return false;

    try {
      // Try to fetch a small endpoint to verify connection
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const getConnectionInfo = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }
    return null;
  };

  return {
    isOnline,
    checkConnection,
    getConnectionInfo,
  };
}