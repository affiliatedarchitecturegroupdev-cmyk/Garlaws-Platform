'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Progressive enhancement utilities
export function useProgressiveEnhancement() {
  const [capabilities, setCapabilities] = useState({
    // Core features (always available)
    basic: true,

    // Progressive enhancements
    advancedGestures: false,
    hapticFeedback: false,
    biometricAuth: false,
    offlineAI: false,
    edgeComputing: false,
    advancedPWA: false,
    wakeLock: false,
    contentSharing: false,
    motionSensors: false,

    // Network capabilities
    serviceWorker: false,
    backgroundSync: false,
    pushNotifications: false,
    webShare: false,

    // Hardware capabilities
    camera: false,
    microphone: false,
    geolocation: false,
    accelerometer: false,
    gyroscope: false,
    magnetometer: false,

    // Performance capabilities
    webGL: false,
    webNN: false,
    webAssembly: false,
  });

  const [enhancementLevel, setEnhancementLevel] = useState<'basic' | 'enhanced' | 'advanced'>('basic');

  useEffect(() => {
    const detectCapabilities = async () => {
      const newCapabilities = { ...capabilities };

      // Service Worker & PWA
      newCapabilities.serviceWorker = 'serviceWorker' in navigator;
      newCapabilities.backgroundSync = 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
      newCapabilities.pushNotifications = 'Notification' in window && 'serviceWorker' in navigator;

      // Web APIs
      newCapabilities.webShare = 'share' in navigator;
      newCapabilities.wakeLock = 'wakeLock' in navigator;

      // Hardware APIs
      newCapabilities.camera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      newCapabilities.microphone = newCapabilities.camera;
      newCapabilities.geolocation = 'geolocation' in navigator;

      // Sensors
      newCapabilities.accelerometer = 'Accelerometer' in window;
      newCapabilities.gyroscope = 'Gyroscope' in window;
      newCapabilities.magnetometer = 'Magnetometer' in window;

      // Performance APIs
      newCapabilities.webGL = (() => {
        try {
          const canvas = document.createElement('canvas');
          return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch (e) {
          return false;
        }
      })();

      newCapabilities.webNN = 'ml' in navigator;
      newCapabilities.webAssembly = typeof WebAssembly === 'object' && WebAssembly.validate;

      // Advanced features
      newCapabilities.advancedGestures = 'ontouchstart' in window || 'PointerEvent' in window;
      newCapabilities.hapticFeedback = 'vibrate' in navigator;
      newCapabilities.biometricAuth = 'credentials' in navigator && 'PublicKeyCredential' in window;

      setCapabilities(newCapabilities);

      // Determine enhancement level
      const advancedCount = Object.entries(newCapabilities).filter(([key, value]) =>
        key !== 'basic' && value === true
      ).length;

      if (advancedCount >= 8) {
        setEnhancementLevel('advanced');
      } else if (advancedCount >= 4) {
        setEnhancementLevel('enhanced');
      } else {
        setEnhancementLevel('basic');
      }
    };

    detectCapabilities();
  }, []);

  const getEnhancementLevel = useCallback(() => enhancementLevel, [enhancementLevel]);

  const isFeatureSupported = useCallback((feature: keyof typeof capabilities) => {
    return capabilities[feature];
  }, [capabilities]);

  const getSupportedFeatures = useCallback(() => {
    return Object.entries(capabilities).filter(([_, supported]) => supported);
  }, [capabilities]);

  return {
    capabilities,
    enhancementLevel,
    getEnhancementLevel,
    isFeatureSupported,
    getSupportedFeatures,
  };
}

// Progressive enhancement wrapper component
interface ProgressiveEnhancementProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredCapabilities?: (keyof ReturnType<typeof useProgressiveEnhancement>['capabilities'])[];
  enhancementLevel?: 'basic' | 'enhanced' | 'advanced';
  className?: string;
}

export const ProgressiveEnhancement: React.FC<ProgressiveEnhancementProps> = ({
  children,
  fallback,
  requiredCapabilities = [],
  enhancementLevel,
  className,
}) => {
  const { capabilities, getEnhancementLevel } = useProgressiveEnhancement();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate capability detection delay
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check required capabilities
  const hasRequiredCapabilities = requiredCapabilities.every(cap => capabilities[cap]);

  // Check enhancement level
  const currentLevel = getEnhancementLevel();
  const levelOrder = { basic: 0, enhanced: 1, advanced: 2 };
  const meetsLevelRequirement = !enhancementLevel ||
    levelOrder[currentLevel] >= levelOrder[enhancementLevel];

  if (!hasRequiredCapabilities || !meetsLevelRequirement) {
    return fallback ? <>{fallback}</> : (
      <div className={cn('p-4 bg-muted rounded-lg', className)}>
        <div className="text-center">
          <span className="text-2xl mb-2 block">⚡</span>
          <h3 className="font-semibold">Enhanced Features</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Some advanced features are not available on this device.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Current level: {currentLevel}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Feature detection display component
interface FeatureDetectionDisplayProps {
  className?: string;
  showDetails?: boolean;
}

export const FeatureDetectionDisplay: React.FC<FeatureDetectionDisplayProps> = ({
  className,
  showDetails = false,
}) => {
  const { capabilities, enhancementLevel, getSupportedFeatures } = useProgressiveEnhancement();
  const supportedFeatures = getSupportedFeatures();

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'camera': return '📷';
      case 'microphone': return '🎤';
      case 'geolocation': return '📍';
      case 'hapticFeedback': return '📳';
      case 'biometricAuth': return '🔐';
      case 'webGL': return '🎮';
      case 'webShare': return '📤';
      case 'wakeLock': return '🌙';
      case 'serviceWorker': return '⚙️';
      case 'pushNotifications': return '🔔';
      case 'advancedGestures': return '👆';
      default: return '✅';
    }
  };

  const getFeatureCategory = (feature: string) => {
    if (['camera', 'microphone', 'geolocation', 'accelerometer', 'gyroscope', 'magnetometer'].includes(feature)) {
      return 'Hardware';
    }
    if (['serviceWorker', 'backgroundSync', 'pushNotifications', 'webShare', 'wakeLock'].includes(feature)) {
      return 'Platform';
    }
    if (['webGL', 'webNN', 'webAssembly'].includes(feature)) {
      return 'Performance';
    }
    if (['advancedGestures', 'hapticFeedback', 'biometricAuth', 'offlineAI', 'edgeComputing'].includes(feature)) {
      return 'Advanced';
    }
    return 'Basic';
  };

  const categories = ['Basic', 'Hardware', 'Platform', 'Performance', 'Advanced'];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full">
          <span className="text-lg">
            {enhancementLevel === 'advanced' ? '🚀' : enhancementLevel === 'enhanced' ? '⚡' : '📱'}
          </span>
          <span className="font-semibold capitalize">{enhancementLevel} Mode</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {supportedFeatures.length} features supported
        </p>
      </div>

      {showDetails && (
        <div className="space-y-4">
          {categories.map(category => {
            const categoryFeatures = supportedFeatures.filter(([feature]) =>
              getFeatureCategory(feature) === category
            );

            if (categoryFeatures.length === 0) return null;

            return (
              <div key={category} className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {category}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categoryFeatures.map(([feature, supported]) => (
                    <div
                      key={feature}
                      className={cn(
                        'flex items-center space-x-2 p-2 rounded text-sm',
                        supported ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      )}
                    >
                      <span>{getFeatureIcon(feature)}</span>
                      <span className="capitalize">
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Enhanced mobile component with progressive enhancement
interface EnhancedMobileComponentProps {
  children: React.ReactNode;
  className?: string;
  enableGestures?: boolean;
  enableHaptics?: boolean;
  enableBiometrics?: boolean;
  onFeatureNotSupported?: (feature: string) => void;
}

export const EnhancedMobileComponent: React.FC<EnhancedMobileComponentProps> = ({
  children,
  className,
  enableGestures = false,
  enableHaptics = false,
  enableBiometrics = false,
  onFeatureNotSupported,
}) => {
  const { isFeatureSupported } = useProgressiveEnhancement();

  // Check for requested features
  const missingFeatures = [];
  if (enableGestures && !isFeatureSupported('advancedGestures')) {
    missingFeatures.push('advancedGestures');
  }
  if (enableHaptics && !isFeatureSupported('hapticFeedback')) {
    missingFeatures.push('hapticFeedback');
  }
  if (enableBiometrics && !isFeatureSupported('biometricAuth')) {
    missingFeatures.push('biometricAuth');
  }

  useEffect(() => {
    missingFeatures.forEach(feature => {
      onFeatureNotSupported?.(feature);
    });
  }, [missingFeatures, onFeatureNotSupported]);

  return (
    <div className={className}>
      {children}

      {/* Feature availability indicators */}
      {missingFeatures.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg max-w-xs">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600">⚠️</span>
            <div>
              <p className="text-sm font-medium text-yellow-800">Limited Features</p>
              <p className="text-xs text-yellow-700 mt-1">
                Some advanced features are not available on this device.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Progressive feature loader
interface ProgressiveFeatureLoaderProps {
  features: {
    name: string;
    component: React.ComponentType;
    requiredCapabilities?: (keyof ReturnType<typeof useProgressiveEnhancement>['capabilities'])[];
    fallback?: React.ComponentType;
  }[];
  className?: string;
}

export const ProgressiveFeatureLoader: React.FC<ProgressiveFeatureLoaderProps> = ({
  features,
  className,
}) => {
  const { isFeatureSupported } = useProgressiveEnhancement();
  const [loadedFeatures, setLoadedFeatures] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Dynamically load features based on capabilities
    features.forEach(async (feature) => {
      const hasCapabilities = !feature.requiredCapabilities ||
        feature.requiredCapabilities.every(cap => isFeatureSupported(cap));

      if (hasCapabilities) {
        // Simulate dynamic import (in real implementation, use actual dynamic imports)
        setLoadedFeatures(prev => new Set([...prev, feature.name]));
      }
    });
  }, [features, isFeatureSupported]);

  return (
    <div className={className}>
      {features.map(feature => {
        const Component = loadedFeatures.has(feature.name) ? feature.component : feature.fallback;

        if (!Component) return null;

        return (
          <div key={feature.name} className="mb-4">
            <Component />
          </div>
        );
      })}
    </div>
  );
};

// Performance monitoring for progressive enhancement
export function useProgressivePerformance() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    featureDetectionTime: 0,
    enhancementLevel: 'basic' as 'basic' | 'enhanced' | 'advanced',
    supportedFeatures: 0,
    memoryUsage: 0,
  });

  useEffect(() => {
    const startTime = performance.now();

    // Monitor feature detection performance
    const featureDetectionTimer = setTimeout(() => {
      const detectionTime = performance.now() - startTime;

      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          featureDetectionTime: detectionTime,
          memoryUsage: memory.usedJSHeapSize / memory.totalJSHeapSize,
        }));
      }
    }, 100);

    return () => clearTimeout(featureDetectionTimer);
  }, []);

  const updateMetrics = useCallback((updates: Partial<typeof metrics>) => {
    setMetrics(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    metrics,
    updateMetrics,
  };
}

// Progressive enhancement context provider
interface ProgressiveEnhancementProviderProps {
  children: React.ReactNode;
  onCapabilityChange?: (capabilities: ReturnType<typeof useProgressiveEnhancement>['capabilities']) => void;
}

export const ProgressiveEnhancementProvider: React.FC<ProgressiveEnhancementProviderProps> = ({
  children,
  onCapabilityChange,
}) => {
  const { capabilities, enhancementLevel } = useProgressiveEnhancement();

  useEffect(() => {
    onCapabilityChange?.(capabilities);
  }, [capabilities, onCapabilityChange]);

  return (
    <div data-enhancement-level={enhancementLevel}>
      {children}
    </div>
  );
};