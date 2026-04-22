'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Biometric authentication types
export type BiometricType =
  | 'fingerprint'
  | 'face'
  | 'voice'
  | 'iris'
  | 'behavioral';

export interface BiometricAuthResult {
  success: boolean;
  type: BiometricType;
  credentialId?: string;
  error?: string;
}

// WebAuthn credential interface
interface PublicKeyCredential {
  id: string;
  rawId: ArrayBuffer;
  response: {
    clientDataJSON: ArrayBuffer;
    authenticatorData: ArrayBuffer;
    signature: ArrayBuffer;
    userHandle?: ArrayBuffer;
  };
  type: string;
}

// Biometric authentication hook
export function useBiometricAuth() {
  const [isSupported, setIsSupported] = useState(false);
  const [availableBiometrics, setAvailableBiometrics] = useState<BiometricType[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      if (!('PublicKeyCredential' in window)) {
        setIsSupported(false);
        return;
      }

      try {
        // Check if WebAuthn is available
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsSupported(available);

        // Detect available biometric types
        const biometrics: BiometricType[] = [];

        // Check for platform authenticator (usually fingerprint/face)
        if (available) {
          biometrics.push('fingerprint', 'face');
        }

        // Check for conditional mediation (user verification)
        if ('credentials' in navigator && 'get' in navigator.credentials) {
          biometrics.push('behavioral');
        }

        setAvailableBiometrics(biometrics);
      } catch (error) {
        console.error('Biometric support check failed:', error);
        setIsSupported(false);
      }
    };

    checkSupport();
  }, []);

  const authenticate = useCallback(async (
    type: BiometricType,
    options: {
      challenge?: string;
      userId?: string;
      userName?: string;
      displayName?: string;
      timeout?: number;
    } = {}
  ): Promise<BiometricAuthResult> => {
    if (!isSupported) {
      return {
        success: false,
        type,
        error: 'Biometric authentication not supported',
      };
    }

    setIsAuthenticating(true);

    try {
      const challenge = options.challenge || crypto.getRandomValues(new Uint8Array(32));

      const publicKeyCredentialCreationOptions: any = {
        challenge,
        rp: {
          name: 'Garlaws Platform',
          id: window.location.hostname,
        },
        user: {
          id: new Uint8Array(options.userId ? new TextEncoder().encode(options.userId) : crypto.getRandomValues(new Uint8Array(16))),
          name: options.userName || 'user',
          displayName: options.displayName || 'User',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          requireResidentKey: false,
        },
        timeout: options.timeout || 60000,
        attestation: 'direct',
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      setIsAuthenticating(false);

      return {
        success: true,
        type,
        credentialId: credential.id,
      };
    } catch (error: any) {
      setIsAuthenticating(false);

      let errorMessage = 'Authentication failed';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Authentication cancelled by user';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Biometric authentication not supported on this device';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Authentication failed due to security restrictions';
      }

      return {
        success: false,
        type,
        error: errorMessage,
      };
    }
  }, [isSupported]);

  const verifyBiometric = useCallback(async (
    credentialId: string,
    options: {
      challenge?: string;
      timeout?: number;
    } = {}
  ): Promise<BiometricAuthResult> => {
    if (!isSupported) {
      return {
        success: false,
        type: 'fingerprint',
        error: 'Biometric authentication not supported',
      };
    }

    setIsAuthenticating(true);

    try {
      const challenge = options.challenge || crypto.getRandomValues(new Uint8Array(32));

      const publicKeyCredentialRequestOptions: any = {
        challenge,
        allowCredentials: [{
          id: Uint8Array.from(atob(credentialId.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
          type: 'public-key',
          transports: ['internal'],
        }],
        timeout: options.timeout || 60000,
        userVerification: 'required',
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential;

      setIsAuthenticating(false);

      return {
        success: true,
        type: 'fingerprint',
        credentialId: assertion.id,
      };
    } catch (error: any) {
      setIsAuthenticating(false);

      let errorMessage = 'Verification failed';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Verification cancelled by user';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Biometric credential not found';
      }

      return {
        success: false,
        type: 'fingerprint',
        error: errorMessage,
      };
    }
  }, [isSupported]);

  return {
    isSupported,
    availableBiometrics,
    isAuthenticating,
    authenticate,
    verifyBiometric,
  };
}

// Biometric authentication component
interface BiometricAuthProps {
  onAuthSuccess?: (result: BiometricAuthResult) => void;
  onAuthFailure?: (result: BiometricAuthResult) => void;
  className?: string;
  autoPrompt?: boolean;
  title?: string;
  description?: string;
}

export const BiometricAuth: React.FC<BiometricAuthProps> = ({
  onAuthSuccess,
  onAuthFailure,
  className,
  autoPrompt = false,
  title = 'Biometric Authentication',
  description = 'Use your fingerprint or face to authenticate',
}) => {
  const { isSupported, availableBiometrics, isAuthenticating, authenticate } = useBiometricAuth();
  const [selectedType, setSelectedType] = useState<BiometricType>('fingerprint');
  const [authResult, setAuthResult] = useState<BiometricAuthResult | null>(null);

  const handleAuthenticate = useCallback(async () => {
    const result = await authenticate(selectedType, {
      userName: 'current-user',
      displayName: 'Current User',
    });

    setAuthResult(result);

    if (result.success) {
      onAuthSuccess?.(result);
    } else {
      onAuthFailure?.(result);
    }
  }, [selectedType, authenticate, onAuthSuccess, onAuthFailure]);

  useEffect(() => {
    if (autoPrompt && isSupported && availableBiometrics.length > 0 && !isAuthenticating) {
      handleAuthenticate();
    }
  }, [autoPrompt, isSupported, availableBiometrics, isAuthenticating, handleAuthenticate]);

  const getBiometricIcon = (type: BiometricType) => {
    switch (type) {
      case 'fingerprint': return '👆';
      case 'face': return '😀';
      case 'voice': return '🎤';
      case 'iris': return '👁️';
      case 'behavioral': return '🤖';
      default: return '🔐';
    }
  };

  const getBiometricLabel = (type: BiometricType) => {
    switch (type) {
      case 'fingerprint': return 'Fingerprint';
      case 'face': return 'Face ID';
      case 'voice': return 'Voice';
      case 'iris': return 'Iris Scan';
      case 'behavioral': return 'Behavioral';
      default: return 'Biometric';
    }
  };

  if (!isSupported) {
    return (
      <div className={cn('p-4 bg-muted rounded-lg', className)}>
        <div className="text-center">
          <span className="text-2xl">🔒</span>
          <h3 className="font-semibold mt-2">Biometric Authentication</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Not supported on this device or browser
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">{getBiometricIcon(selectedType)}</span>
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      {/* Biometric type selector */}
      {availableBiometrics.length > 1 && (
        <div className="flex justify-center space-x-2">
          {availableBiometrics.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {getBiometricLabel(type)}
            </button>
          ))}
        </div>
      )}

      {/* Authentication button */}
      <button
        onClick={handleAuthenticate}
        disabled={isAuthenticating}
        className={cn(
          'w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold transition-all duration-200',
          'hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isAuthenticating && 'animate-pulse'
        )}
      >
        {isAuthenticating ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            <span>Authenticating...</span>
          </div>
        ) : (
          `Authenticate with ${getBiometricLabel(selectedType)}`
        )}
      </button>

      {/* Authentication result */}
      {authResult && (
        <div className={cn(
          'p-3 rounded-lg text-center',
          authResult.success
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        )}>
          <div className="flex items-center justify-center space-x-2">
            <span className={authResult.success ? 'text-green-600' : 'text-red-600'}>
              {authResult.success ? '✅' : '❌'}
            </span>
            <span className={cn(
              'text-sm font-medium',
              authResult.success ? 'text-green-700' : 'text-red-700'
            )}>
              {authResult.success ? 'Authentication Successful' : 'Authentication Failed'}
            </span>
          </div>
          {authResult.error && (
            <p className="text-xs text-red-600 mt-1">{authResult.error}</p>
          )}
        </div>
      )}

      {/* Security note */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Your biometric data is processed locally and never stored on our servers
        </p>
      </div>
    </div>
  );
};

// Biometric settings component
interface BiometricSettingsProps {
  className?: string;
  onSettingsChange?: (settings: { enabled: boolean; preferredType: BiometricType }) => void;
}

export const BiometricSettings: React.FC<BiometricSettingsProps> = ({
  className,
  onSettingsChange,
}) => {
  const { isSupported, availableBiometrics } = useBiometricAuth();
  const [enabled, setEnabled] = useState(false);
  const [preferredType, setPreferredType] = useState<BiometricType>('fingerprint');

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem('garlaws-biometric-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setEnabled(settings.enabled || false);
        setPreferredType(settings.preferredType || 'fingerprint');
      } catch (error) {
        console.error('Failed to load biometric settings:', error);
      }
    }
  }, []);

  const handleEnabledChange = (newEnabled: boolean) => {
    setEnabled(newEnabled);
    const settings = { enabled: newEnabled, preferredType };
    localStorage.setItem('garlaws-biometric-settings', JSON.stringify(settings));
    onSettingsChange?.(settings);
  };

  const handleTypeChange = (newType: BiometricType) => {
    setPreferredType(newType);
    const settings = { enabled, preferredType: newType };
    localStorage.setItem('garlaws-biometric-settings', JSON.stringify(settings));
    onSettingsChange?.(settings);
  };

  if (!isSupported) {
    return (
      <div className={cn('p-4 bg-muted rounded-lg', className)}>
        <p className="text-sm text-muted-foreground">
          Biometric authentication is not supported on this device.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Biometric Authentication</h3>
          <p className="text-sm text-muted-foreground">
            Enable secure authentication using device biometrics
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleEnabledChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      {enabled && availableBiometrics.length > 1 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Preferred Authentication Method
          </label>
          <select
            value={preferredType}
            onChange={(e) => handleTypeChange(e.target.value as BiometricType)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          >
            {availableBiometrics.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)} Authentication
              </option>
            ))}
          </select>
        </div>
      )}

      {enabled && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600">ℹ️</span>
            <div>
              <p className="text-sm text-blue-700 font-medium">Security Note</p>
              <p className="text-xs text-blue-600 mt-1">
                Biometric data is processed locally on your device and never transmitted or stored.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};