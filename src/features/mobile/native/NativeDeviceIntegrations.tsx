'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface DevicePermissions {
  camera: PermissionState;
  microphone: PermissionState;
  geolocation: PermissionState;
  notifications: PermissionState;
  accelerometer: PermissionState;
  gyroscope: PermissionState;
  magnetometer: PermissionState;
}

interface DeviceCapabilities {
  hasCamera: boolean;
  hasMicrophone: boolean;
  hasGeolocation: boolean;
  hasBiometric: boolean;
  hasNFC: boolean;
  hasBluetooth: boolean;
  hasVibration: boolean;
  touchSupport: boolean;
  maxTouchPoints: number;
  screenResolution: { width: number; height: number };
  pixelRatio: number;
  colorDepth: number;
  orientation: 'portrait' | 'landscape';
}

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

interface CameraSettings {
  facingMode: 'user' | 'environment';
  width: number;
  height: number;
  frameRate: number;
}

interface BiometricCredentials {
  id: string;
  name: string;
  type: 'fingerprint' | 'face' | 'voice';
  lastUsed: string;
  createdAt: string;
}

interface DeviceSensorData {
  accelerometer?: { x: number; y: number; z: number };
  gyroscope?: { x: number; y: number; z: number };
  magnetometer?: { x: number; y: number; z: number };
  lightLevel?: number;
  proximity?: number;
  timestamp: number;
}

interface NativeDeviceIntegrationsProps {
  tenantId?: string;
}

export default function NativeDeviceIntegrations({ tenantId = 'default' }: NativeDeviceIntegrationsProps) {
  const [permissions, setPermissions] = useState<DevicePermissions | null>(null);
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [geolocation, setGeolocation] = useState<GeolocationData | null>(null);
  const [biometricCredentials, setBiometricCredentials] = useState<BiometricCredentials[]>([]);
  const [sensorData, setSensorData] = useState<DeviceSensorData | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>({
    facingMode: 'environment',
    width: 640,
    height: 480,
    frameRate: 30
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [deviceOrientation, setDeviceOrientation] = useState<{ alpha: number; beta: number; gamma: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const sensorWatchIdRef = useRef<number | null>(null);

  const checkDeviceCapabilities = useCallback(() => {
    const caps: DeviceCapabilities = {
      hasCamera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      hasMicrophone: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      hasGeolocation: !!navigator.geolocation,
      hasBiometric: !!(window.PublicKeyCredential && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable),
      hasNFC: 'NDEFReader' in window,
      hasBluetooth: 'bluetooth' in navigator,
      hasVibration: 'vibrate' in navigator,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      screenResolution: { width: screen.width, height: screen.height },
      pixelRatio: window.devicePixelRatio || 1,
      colorDepth: screen.colorDepth || 24,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    };

    setCapabilities(caps);
  }, []);

  const checkPermissions = useCallback(async () => {
    if (!navigator.permissions) return;

    try {
      const [cameraPerm, micPerm, geoPerm, notifPerm] = await Promise.all([
        navigator.permissions.query({ name: 'camera' as PermissionName }),
        navigator.permissions.query({ name: 'microphone' as PermissionName }),
        navigator.permissions.query({ name: 'geolocation' as PermissionName }),
        'Notification' in window ? navigator.permissions.query({ name: 'notifications' as PermissionName }) : Promise.resolve({ state: 'denied' as PermissionState })
      ]);

      const perms: DevicePermissions = {
        camera: cameraPerm.state,
        microphone: micPerm.state,
        geolocation: geoPerm.state,
        notifications: notifPerm.state,
        accelerometer: 'denied',
        gyroscope: 'denied',
        magnetometer: 'denied'
      };

      // Check sensor permissions if available
      if ('Accelerometer' in window) {
        try {
          const accelPerm = await navigator.permissions.query({ name: 'accelerometer' as PermissionName });
          perms.accelerometer = accelPerm.state;
        } catch {}
      }

      if ('Gyroscope' in window) {
        try {
          const gyroPerm = await navigator.permissions.query({ name: 'gyroscope' as PermissionName });
          perms.gyroscope = gyroPerm.state;
        } catch {}
      }

      if ('Magnetometer' in window) {
        try {
          const magPerm = await navigator.permissions.query({ name: 'magnetometer' as PermissionName });
          perms.magnetometer = magPerm.state;
        } catch {}
      }

      setPermissions(perms);
    } catch (error) {
      console.error('Failed to check permissions:', error);
    }
  }, []);

  const requestPermission = async (permission: keyof DevicePermissions) => {
    try {
      let result: PermissionState = 'denied';

      switch (permission) {
        case 'camera':
          if (capabilities?.hasCamera) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            result = 'granted';
          }
          break;
        case 'microphone':
          if (capabilities?.hasMicrophone) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            result = 'granted';
          }
          break;
        case 'geolocation':
          if (capabilities?.hasGeolocation) {
            await new Promise<void>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                () => resolve(),
                () => reject(),
                { timeout: 10000 }
              );
            });
            result = 'granted';
          }
          break;
        case 'notifications':
          if ('Notification' in window) {
            const perm = await Notification.requestPermission();
            result = perm === 'granted' ? 'granted' : 'denied';
          }
          break;
      }

      setPermissions(prev => prev ? { ...prev, [permission]: result } : null);
    } catch (error) {
      console.error(`Failed to request ${permission} permission:`, error);
    }
  };

  const startGeolocationTracking = useCallback(() => {
    if (!navigator.geolocation || permissions?.geolocation !== 'granted') return;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const geoData: GeolocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp
        };
        setGeolocation(geoData);
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      options
    );
  }, [permissions]);

  const stopGeolocationTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const startCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraSettings.facingMode,
          width: { ideal: cameraSettings.width },
          height: { ideal: cameraSettings.height },
          frameRate: { ideal: cameraSettings.frameRate }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const switchCamera = () => {
    if (cameraStream) {
      stopCamera();
      setCameraSettings(prev => ({
        ...prev,
        facingMode: prev.facingMode === 'user' ? 'environment' : 'user'
      }));
      setTimeout(startCamera, 100);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        // Here you would typically upload the photo or save it
        console.log('Photo taken:', url);
      }
    });
  };

  const startRecording = () => {
    if (!cameraStream) return;

    const mediaRecorder = new MediaRecorder(cameraStream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorderRef.current = mediaRecorder;
    setRecordedChunks([]);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks(prev => [...prev, event.data]);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      // Here you would typically upload the video or save it
      console.log('Video recorded:', url);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const checkBiometricSupport = async () => {
    if (!capabilities?.hasBiometric) return;

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (available) {
        // Fetch existing biometric credentials
        const response = await fetch(`/api/mobile?action=biometric-credentials&tenantId=${tenantId}`);
        const data = await response.json();
        if (data.success) {
          setBiometricCredentials(data.data);
        }
      }
    } catch (error) {
      console.error('Biometric check failed:', error);
    }
  };

  const authenticateWithBiometric = async (credentialId?: string) => {
    if (!capabilities?.hasBiometric) return false;

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: credentialId ? [{
            id: Uint8Array.from(credentialId, c => c.charCodeAt(0)),
            type: 'public-key'
          }] : undefined,
          userVerification: 'required'
        }
      });

      return !!credential;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  const startSensorMonitoring = useCallback(() => {
    if (!permissions || permissions.accelerometer !== 'granted') return;

    try {
      // @ts-ignore - Web APIs not fully typed
      const accelerometer = new Accelerometer({ frequency: 10 });
      // @ts-ignore
      const gyroscope = new Gyroscope({ frequency: 10 });
      // @ts-ignore
      const magnetometer = new Magnetometer({ frequency: 10 });

      const updateSensors = () => {
        setSensorData({
          accelerometer: accelerometer ? {
            x: accelerometer.x || 0,
            y: accelerometer.y || 0,
            z: accelerometer.z || 0
          } : undefined,
          gyroscope: gyroscope ? {
            x: gyroscope.x || 0,
            y: gyroscope.y || 0,
            z: gyroscope.z || 0
          } : undefined,
          magnetometer: magnetometer ? {
            x: magnetometer.x || 0,
            y: magnetometer.y || 0,
            z: magnetometer.z || 0
          } : undefined,
          timestamp: Date.now()
        });
      };

      accelerometer.addEventListener('reading', updateSensors);
      gyroscope.addEventListener('reading', updateSensors);
      magnetometer.addEventListener('reading', updateSensors);

      accelerometer.start();
      gyroscope.start();
      magnetometer.start();

      sensorWatchIdRef.current = Date.now(); // Simple ID for cleanup
    } catch (error) {
      console.error('Failed to start sensor monitoring:', error);
    }
  }, [permissions]);

  const stopSensorMonitoring = useCallback(() => {
    // In a real implementation, you'd properly stop the sensors
    setSensorData(null);
    sensorWatchIdRef.current = null;
  }, []);

  const vibrateDevice = (pattern: number | number[]) => {
    if (capabilities?.hasVibration && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const getDeviceOrientation = useCallback(() => {
    if (window.DeviceOrientationEvent) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        setDeviceOrientation({
          alpha: event.alpha || 0,
          beta: event.beta || 0,
          gamma: event.gamma || 0
        });
      };

      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, []);

  const shareContent = async (data: any, title?: string) => {
    if ('share' in navigator) {
      try {
        await (navigator as any).share({
          title: title || 'Shared from Garlaws Platform',
          text: typeof data === 'string' ? data : JSON.stringify(data),
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  useEffect(() => {
    checkDeviceCapabilities();
    checkPermissions();
    checkBiometricSupport();
    getDeviceOrientation();

    return () => {
      stopCamera();
      stopGeolocationTracking();
      stopSensorMonitoring();
    };
  }, [checkDeviceCapabilities, checkPermissions, checkBiometricSupport, getDeviceOrientation, stopGeolocationTracking, stopSensorMonitoring]);

  const getPermissionStatusColor = (status: PermissionState) => {
    switch (status) {
      case 'granted': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'prompt': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Native Device Integrations</h2>
        <div className="flex space-x-2">
          <button
            onClick={checkPermissions}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Check Permissions
          </button>
          <button
            onClick={vibrateDevice.bind(null, [200, 100, 200])}
            disabled={!capabilities?.hasVibration}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
          >
            Vibrate
          </button>
        </div>
      </div>

      {/* Device Capabilities */}
      {capabilities && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Device Capabilities</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${capabilities.hasCamera ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Camera</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${capabilities.hasMicrophone ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Microphone</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${capabilities.hasGeolocation ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Geolocation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${capabilities.hasBiometric ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Biometric</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${capabilities.hasNFC ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">NFC</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${capabilities.hasBluetooth ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Bluetooth</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${capabilities.hasVibration ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Vibration</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${capabilities.touchSupport ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Touch ({capabilities.maxTouchPoints})</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>Screen: {capabilities.screenResolution.width}×{capabilities.screenResolution.height}</div>
            <div>Pixel Ratio: {capabilities.pixelRatio}</div>
            <div>Orientation: {capabilities.orientation}</div>
            <div>Color Depth: {capabilities.colorDepth}-bit</div>
          </div>
        </div>
      )}

      {/* Permissions */}
      {permissions && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(permissions).map(([permission, status]) => (
              <div key={permission} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium capitalize">{permission.replace('_', ' ')}</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPermissionStatusColor(status)}`}>
                    {status}
                  </span>
                  {status !== 'granted' && (
                    <button
                      onClick={() => requestPermission(permission as keyof DevicePermissions)}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Geolocation */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Geolocation</h3>
          <div className="flex space-x-2">
            <button
              onClick={startGeolocationTracking}
              disabled={!capabilities?.hasGeolocation || permissions?.geolocation !== 'granted'}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              Start Tracking
            </button>
            <button
              onClick={stopGeolocationTracking}
              className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
            >
              Stop Tracking
            </button>
          </div>
        </div>

        {geolocation && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Latitude:</span>
              <div className="font-mono">{geolocation.latitude.toFixed(6)}</div>
            </div>
            <div>
              <span className="text-gray-600">Longitude:</span>
              <div className="font-mono">{geolocation.longitude.toFixed(6)}</div>
            </div>
            <div>
              <span className="text-gray-600">Accuracy:</span>
              <div className="font-mono">±{geolocation.accuracy.toFixed(1)}m</div>
            </div>
            <div>
              <span className="text-gray-600">Speed:</span>
              <div className="font-mono">{geolocation.speed ? `${(geolocation.speed * 3.6).toFixed(1)} km/h` : 'N/A'}</div>
            </div>
          </div>
        )}

        {!geolocation && (
          <p className="text-gray-500 text-sm">No location data available. Start tracking to get current position.</p>
        )}
      </div>

      {/* Camera */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Camera</h3>
          <div className="flex space-x-2">
            {!cameraStream ? (
              <button
                onClick={startCamera}
                disabled={!capabilities?.hasCamera || permissions?.camera !== 'granted'}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                Start Camera
              </button>
            ) : (
              <>
                <button
                  onClick={takePhoto}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  📸 Take Photo
                </button>
                <button
                  onClick={switchCamera}
                  className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                >
                  🔄 Switch
                </button>
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    ⏺️ Record
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-3 py-2 bg-red-800 text-white text-sm rounded-md hover:bg-red-900 transition-colors"
                  >
                    ⏹️ Stop
                  </button>
                )}
                <button
                  onClick={stopCamera}
                  className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                >
                  Stop Camera
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 bg-gray-100 rounded-lg object-cover"
            />
          </div>
          <div>
            <canvas
              ref={canvasRef}
              className="w-full h-64 bg-gray-100 rounded-lg"
            />
            {isRecording && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-600 font-medium">Recording...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Biometric Authentication */}
      {capabilities?.hasBiometric && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Biometric Authentication</h3>

          <div className="mb-4">
            <button
              onClick={() => authenticateWithBiometric()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              🔐 Authenticate
            </button>
          </div>

          {biometricCredentials.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Registered Credentials</h4>
              <div className="space-y-2">
                {biometricCredentials.map((cred) => (
                  <div key={cred.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{cred.name}</div>
                      <div className="text-sm text-gray-600">{cred.type} • Last used: {new Date(cred.lastUsed).toLocaleDateString()}</div>
                    </div>
                    <button
                      onClick={() => authenticateWithBiometric(cred.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Device Sensors */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Device Sensors</h3>
          <div className="flex space-x-2">
            {!sensorData ? (
              <button
                onClick={startSensorMonitoring}
                disabled={permissions?.accelerometer !== 'granted'}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                Start Monitoring
              </button>
            ) : (
              <button
                onClick={stopSensorMonitoring}
                className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                Stop Monitoring
              </button>
            )}
          </div>
        </div>

        {sensorData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sensorData.accelerometer && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Accelerometer</h4>
                <div className="text-sm space-y-1">
                  <div>X: {sensorData.accelerometer.x.toFixed(3)}</div>
                  <div>Y: {sensorData.accelerometer.y.toFixed(3)}</div>
                  <div>Z: {sensorData.accelerometer.z.toFixed(3)}</div>
                </div>
              </div>
            )}

            {sensorData.gyroscope && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Gyroscope</h4>
                <div className="text-sm space-y-1">
                  <div>X: {sensorData.gyroscope.x.toFixed(3)}</div>
                  <div>Y: {sensorData.gyroscope.y.toFixed(3)}</div>
                  <div>Z: {sensorData.gyroscope.z.toFixed(3)}</div>
                </div>
              </div>
            )}

            {deviceOrientation && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Device Orientation</h4>
                <div className="text-sm space-y-1">
                  <div>Alpha: {deviceOrientation.alpha.toFixed(1)}°</div>
                  <div>Beta: {deviceOrientation.beta.toFixed(1)}°</div>
                  <div>Gamma: {deviceOrientation.gamma.toFixed(1)}°</div>
                </div>
              </div>
            )}
          </div>
        )}

        {!sensorData && (
          <p className="text-gray-500 text-sm">Start sensor monitoring to view real-time device sensor data.</p>
        )}
      </div>

      {/* Device Sharing */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Device Sharing</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => shareContent('Check out this amazing platform!', 'Garlaws Platform')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            📤 Share Platform
          </button>
          <button
            onClick={() => shareContent(geolocation ? `My location: ${geolocation.latitude}, ${geolocation.longitude}` : 'Location data not available')}
            disabled={!geolocation}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            📍 Share Location
          </button>
        </div>
      </div>
    </div>
  );
}