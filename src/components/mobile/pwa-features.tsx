'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// PWA Hook for installation
export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if app is already installed
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);

      // Listen for install prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setIsInstallable(false);

    return outcome === 'accepted';
  }, [deferredPrompt]);

  return {
    isInstallable,
    isInstalled,
    install,
  };
}

// PWA Install Prompt Component
interface PWAInstallPromptProps {
  className?: string;
  onInstall?: () => void;
  onDismiss?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  className,
  onInstall,
  onDismiss,
}) => {
  const { isInstallable, install } = usePWA();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInstallable) {
      // Show prompt after a delay to avoid being too aggressive
      const timer = setTimeout(() => setIsVisible(true), 30000); // 30 seconds
      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      onInstall?.();
    }
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || !isInstallable) return null;

  return (
    <div className={cn(
      'fixed bottom-4 left-4 right-4 z-50 bg-background border border-border rounded-lg p-4 shadow-lg',
      'animate-in slide-in-from-bottom duration-300 md:left-auto md:right-4 md:max-w-sm',
      className
    )}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            📱
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">Install App</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Install Garlaws for a better experience with offline access and push notifications.
          </p>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Offline Status Hook
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Show "back online" notification
        console.log('Back online!');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

// Offline Status Indicator
const OfflineIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const { isOnline } = useOfflineStatus();

  if (isOnline) return null;

  return (
    <div className={cn(
      'fixed top-4 left-4 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg',
      'animate-in slide-in-from-top duration-300 md:left-auto md:right-4 md:max-w-sm',
      className
    )}>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse" />
        <span className="text-sm font-medium">You're offline</span>
      </div>
      <p className="text-xs mt-1 opacity-90">
        Some features may not be available. We'll sync when you're back online.
      </p>
    </div>
  );
};

// Push Notification Hook
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  const subscribe = useCallback(async (vapidPublicKey?: string) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        setSubscription(existingSubscription);
        return existingSubscription;
      }

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey ? urlBase64ToUint8Array(vapidPublicKey) : undefined,
      });

      setSubscription(newSubscription);
      return newSubscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }
  }, [subscription]);

  const sendTestNotification = useCallback(() => {
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test push notification from Garlaws!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  }, [permission]);

  return {
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    isSupported: 'Notification' in window && 'serviceWorker' in navigator,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Push Notification Manager Component
interface PushNotificationManagerProps {
  vapidPublicKey?: string;
  onSubscriptionChange?: (subscription: PushSubscription | null) => void;
  className?: string;
}

const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({
  vapidPublicKey,
  onSubscriptionChange,
  className,
}) => {
  const {
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    isSupported,
  } = usePushNotifications();

  useEffect(() => {
    onSubscriptionChange?.(subscription);
  }, [subscription, onSubscriptionChange]);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      await subscribe(vapidPublicKey);
    }
  };

  const handleDisableNotifications = async () => {
    await unsubscribe();
  };

  if (!isSupported) {
    return (
      <div className={cn('p-4 bg-muted rounded-lg', className)}>
        <p className="text-sm text-muted-foreground">
          Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Push Notifications</h3>
          <p className="text-sm text-muted-foreground">
            {permission === 'granted'
              ? 'Notifications are enabled'
              : permission === 'denied'
              ? 'Notifications are blocked'
              : 'Enable notifications for important updates'
            }
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {permission === 'granted' && subscription && (
            <button
              onClick={sendTestNotification}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Test
            </button>
          )}

          {permission === 'granted' ? (
            <button
              onClick={handleDisableNotifications}
              className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
            >
              Disable
            </button>
          ) : (
            <button
              onClick={handleEnableNotifications}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Enable
            </button>
          )}
        </div>
      </div>

      {permission === 'denied' && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded">
          <p className="text-sm text-destructive">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        </div>
      )}

      {subscription && (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-700">
            ✅ Successfully subscribed to push notifications
          </p>
        </div>
      )}
    </div>
  );
};

// Service Worker Registration Hook
export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          setRegistration(reg);
          setIsRegistered(true);

          // Listen for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });
    }
  }, []);

  const updateServiceWorker = useCallback(() => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  return {
    isRegistered,
    updateAvailable,
    updateServiceWorker,
    registration,
  };
};

// Offline Data Manager
export class OfflineDataManager {
  private static dbName = 'garlaws-offline-db';
  private static version = 1;

  static async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores for different data types
        if (!db.objectStoreNames.contains('forms')) {
          db.createObjectStore('forms', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'url' });
        }
        if (!db.objectStoreNames.contains('sync-queue')) {
          db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  static async saveFormData(formId: string, data: any): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction(['forms'], 'readwrite');
    const store = transaction.objectStore('forms');

    await new Promise<void>((resolve, reject) => {
      const request = store.put({ id: formId, data, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  }

  static async getFormData(formId: string): Promise<any | null> {
    const db = await this.openDB();
    const transaction = db.transaction(['forms'], 'readonly');
    const store = transaction.objectStore('forms');

    return new Promise((resolve, reject) => {
      const request = store.get(formId);
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  }

  static async getAllUnsyncedData(): Promise<any[]> {
    const db = await this.openDB();
    const transaction = db.transaction(['sync-queue'], 'readonly');
    const store = transaction.objectStore('sync-queue');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  static async addToSyncQueue(data: any): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction(['sync-queue'], 'readwrite');
    const store = transaction.objectStore('sync-queue');

    await new Promise<void>((resolve, reject) => {
      const request = store.add({ ...data, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  }

  static async clearSyncQueue(): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction(['sync-queue'], 'readwrite');
    const store = transaction.objectStore('sync-queue');

    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  }
}

// Background Sync Hook
export function useBackgroundSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);

      // Sync pending data when back online
      try {
        const pendingData = await OfflineDataManager.getAllUnsyncedData();
        if (pendingData.length > 0) {
          console.log(`Syncing ${pendingData.length} items...`);
          // Implement sync logic here
          await OfflineDataManager.clearSyncQueue();
        }
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveForLaterSync = useCallback(async (data: any) => {
    await OfflineDataManager.addToSyncQueue(data);
  }, []);

  return {
    isOnline,
    saveForLaterSync,
  };
}

export {
  PWAInstallPrompt,
  OfflineIndicator,
  PushNotificationManager,
};