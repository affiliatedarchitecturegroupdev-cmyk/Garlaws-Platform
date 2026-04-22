'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Enhanced PWA Hook with Advanced Features
export function useAdvancedPWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [shareSupported, setShareSupported] = useState(false);
  const [wakeLockSupported, setWakeLockSupported] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);

      setShareSupported('share' in navigator);
      setWakeLockSupported('wakeLock' in navigator);

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

  const requestWakeLock = useCallback(async () => {
    if (!wakeLockSupported) return null;

    try {
      const lock = await (navigator as any).wakeLock.request('screen');
      setWakeLock(lock);

      lock.addEventListener('release', () => {
        setWakeLock(null);
      });

      return lock;
    } catch (error) {
      console.error('Wake lock request failed:', error);
      return null;
    }
  }, [wakeLockSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
    }
  }, [wakeLock]);

  const shareContent = useCallback(async (data: ShareData) => {
    if (!shareSupported) return false;

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('Share failed:', error);
      return false;
    }
  }, [shareSupported]);

  return {
    isInstallable,
    isInstalled,
    install,
    shareSupported,
    shareContent,
    wakeLockSupported,
    wakeLock,
    requestWakeLock,
    releaseWakeLock,
  };
}

// Advanced Install Prompt Component
interface AdvancedInstallPromptProps {
  className?: string;
  onInstall?: () => void;
  onDismiss?: () => void;
}

const AdvancedInstallPrompt: React.FC<AdvancedInstallPromptProps> = ({
  className,
  onInstall,
  onDismiss,
}) => {
  const { isInstallable, install } = useAdvancedPWA();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInstallable) {
      const timer = setTimeout(() => setIsVisible(true), 30000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  const handleInstall = async () => {
    const success = await install();
    if (success) onInstall?.();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || !isInstallable) return null;

  return (
    <div className={cn(
      'fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 border border-white/20 rounded-xl p-4 shadow-2xl backdrop-blur-xl',
      'animate-in slide-in-from-bottom duration-500 md:left-auto md:right-4 md:max-w-md',
      className
    )}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <span className="text-2xl">📱</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg">Install Garlaws Pro</h3>
          <p className="text-white/90 text-sm mt-2 leading-relaxed">
            Get the full experience with offline access, push notifications, and native app performance.
          </p>
          <div className="flex items-center space-x-3 mt-4">
            <div className="flex items-center space-x-1 text-white/80 text-xs">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Offline Ready</span>
            </div>
            <div className="flex items-center space-x-1 text-white/80 text-xs">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>Push Notifications</span>
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleInstall}
              className="flex-1 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold text-sm hover:bg-white/90 transition-all duration-200 transform hover:scale-105"
            >
              Install Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-white/80 hover:text-white transition-colors text-sm"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wake Lock Manager Component
const WakeLockManager: React.FC<{ className?: string }> = ({ className }) => {
  const { wakeLockSupported, wakeLock, requestWakeLock, releaseWakeLock } = useAdvancedPWA();

  if (!wakeLockSupported) {
    return (
      <div className={cn('p-4 bg-muted rounded-lg', className)}>
        <p className="text-sm text-muted-foreground">
          Screen wake lock is not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Screen Wake Lock</h3>
          <p className="text-sm text-muted-foreground">
            Keep screen awake during important tasks
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {wakeLock ? (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600 font-medium">Active</span>
              <button
                onClick={releaseWakeLock}
                className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm hover:bg-destructive/90"
              >
                Release
              </button>
            </div>
          ) : (
            <button
              onClick={requestWakeLock}
              className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
            >
              Activate
            </button>
          )}
        </div>
      </div>

      {wakeLock && (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-700">
            ✅ Screen will stay awake. Perfect for presentations or important work.
          </p>
        </div>
      )}
    </div>
  );
};

export {
  AdvancedInstallPrompt,
  WakeLockManager,
};