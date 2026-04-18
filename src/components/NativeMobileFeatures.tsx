"use client";

import { useState, useRef, useCallback } from 'react';
import { MobileCard, MobileCardHeader, MobileCardActions } from './MobileCard';

interface CameraCaptureProps {
  onCapture: (file: File, preview: string) => void;
  maxSize?: number; // MB
  quality?: number; // 0-1
}

export function CameraCapture({ onCapture, maxSize = 5, quality = 0.8 }: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
      }
    } catch (error) {
      console.error('Camera permission denied:', error);
      setHasPermission(false);
    }
  };

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      // Check file size
      if (blob.size > maxSize * 1024 * 1024) {
        alert(`File size too large. Maximum size is ${maxSize}MB.`);
        return;
      }

      // Create file object
      const file = new File([blob], `capture-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      // Create preview
      const preview = canvas.toDataURL('image/jpeg', quality);

      onCapture(file, preview);
      setIsCapturing(false);

      // Stop camera stream
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }, 'image/jpeg', quality);
  }, [onCapture, maxSize, quality]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size too large. Maximum size is ${maxSize}MB.`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      onCapture(file, preview);
    };
    reader.readAsDataURL(file);
  };

  if (hasPermission === null) {
    return (
      <MobileCard interactive onClick={requestCameraPermission}>
        <MobileCardHeader
          title="Camera Access"
          subtitle="Take photos for property inspections"
          avatar={<span className="text-2xl">📷</span>}
        />
        <MobileCardActions>
          <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium">
            Enable Camera
          </button>
        </MobileCardActions>
      </MobileCard>
    );
  }

  if (hasPermission === false) {
    return (
      <MobileCard>
        <MobileCardHeader
          title="Camera Not Available"
          subtitle="Please enable camera permissions or upload photos manually"
          avatar={<span className="text-2xl">📷</span>}
        />
        <MobileCardActions>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-[#45a29e] text-white rounded-lg font-medium"
          >
            Upload Photo
          </button>
        </MobileCardActions>
      </MobileCard>
    );
  }

  return (
    <div className="space-y-4">
      {!isCapturing ? (
        <MobileCard interactive onClick={() => setIsCapturing(true)}>
          <MobileCardHeader
            title="Take Photo"
            subtitle="Capture property inspection photos"
            avatar={<span className="text-2xl">📷</span>}
          />
        </MobileCard>
      ) : (
        <MobileCard>
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 bg-black rounded-lg object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <MobileCardActions>
            <button
              onClick={() => setIsCapturing(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={capturePhoto}
              className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium"
            >
              Capture
            </button>
          </MobileCardActions>
        </MobileCard>
      )}
    </div>
  );
}

interface GeolocationTrackerProps {
  onLocation: (position: GeolocationPosition) => void;
  onError?: (error: GeolocationPositionError) => void;
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function GeolocationTracker({
  onLocation,
  onError,
  enableHighAccuracy = true,
  timeout = 10000,
  maximumAge = 300000
}: GeolocationTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const checkPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(result.state);
        return result.state;
      } catch (error) {
        console.error('Permission check failed:', error);
        return 'denied';
      }
    }
    return 'unknown';
  };

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      onError?.({
        code: 2,
        message: 'Geolocation is not supported',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError);
      return;
    }

    setIsTracking(true);

    const options: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPosition(position);
        onLocation(position);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsTracking(false);
        onError?.(error);
      },
      options
    );
  }, [onLocation, onError, enableHighAccuracy, timeout, maximumAge]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Check permission on mount
  useState(() => {
    checkPermission();
  });

  return (
    <MobileCard>
      <MobileCardHeader
        title="Location Services"
        subtitle={isTracking ? "Tracking your location" : "Location tracking disabled"}
        avatar={<span className="text-2xl">{isTracking ? "📍" : "📍"}</span>}
      />

      {currentPosition && (
        <div className="mb-4 p-3 bg-[#2d3b2d] rounded-lg">
          <div className="text-sm text-[#45a29e]">
            <div>Latitude: {currentPosition.coords.latitude.toFixed(6)}</div>
            <div>Longitude: {currentPosition.coords.longitude.toFixed(6)}</div>
            <div>Accuracy: ±{Math.round(currentPosition.coords.accuracy)}m</div>
          </div>
        </div>
      )}

      <MobileCardActions>
        {!isTracking ? (
          <button
            onClick={startTracking}
            className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium"
          >
            Start Tracking
          </button>
        ) : (
          <button
            onClick={stopTracking}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium"
          >
            Stop Tracking
          </button>
        )}
      </MobileCardActions>
    </MobileCard>
  );
}