'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Hand, MousePointer, Eye, Volume2, VolumeX, Settings, Play, Square, RotateCcw, Clock } from 'lucide-react';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface HandData {
  landmarks: HandLandmark[];
  handedness: 'Left' | 'Right';
  confidence: number;
  gestures: DetectedGesture[];
}

export interface DetectedGesture {
  name: string;
  confidence: number;
  timestamp: Date;
  parameters?: Record<string, any>;
}

export interface GestureMapping {
  id: string;
  gesture: string;
  action: string;
  parameters: Record<string, any>;
  enabled: boolean;
  cooldown: number; // ms
  lastTriggered?: Date;
}

export interface GestureSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  gesturesDetected: number;
  actionsTriggered: number;
  accuracy: number;
  handTracking: boolean;
  voiceEnabled: boolean;
}

const DEFAULT_GESTURES: GestureMapping[] = [
  {
    id: 'pinch-zoom',
    gesture: 'pinch',
    action: 'zoom',
    parameters: { sensitivity: 0.5, minScale: 0.1, maxScale: 5.0 },
    enabled: true,
    cooldown: 100
  },
  {
    id: 'swipe-navigate',
    gesture: 'swipe',
    action: 'navigate',
    parameters: { direction: 'horizontal', sensitivity: 0.3 },
    enabled: true,
    cooldown: 200
  },
  {
    id: 'tap-select',
    gesture: 'tap',
    action: 'select',
    parameters: { maxDistance: 50, doubleTapEnabled: true },
    enabled: true,
    cooldown: 300
  },
  {
    id: 'rotate-view',
    gesture: 'rotate',
    action: 'rotate',
    parameters: { axis: 'y', sensitivity: 0.01 },
    enabled: true,
    cooldown: 50
  },
  {
    id: 'fist-grab',
    gesture: 'fist',
    action: 'grab',
    parameters: { holdThreshold: 1000 },
    enabled: true,
    cooldown: 500
  },
  {
    id: 'open-hand-release',
    gesture: 'open_palm',
    action: 'release',
    parameters: {},
    enabled: true,
    cooldown: 300
  },
  {
    id: 'peace-sign-pause',
    gesture: 'peace',
    action: 'pause',
    parameters: {},
    enabled: true,
    cooldown: 1000
  },
  {
    id: 'thumbs-up-confirm',
    gesture: 'thumbs_up',
    action: 'confirm',
    parameters: {},
    enabled: true,
    cooldown: 800
  }
];

export const GestureInterface: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [handData, setHandData] = useState<HandData | null>(null);
  const [gestureMappings, setGestureMappings] = useState<GestureMapping[]>(DEFAULT_GESTURES);
  const [currentSession, setCurrentSession] = useState<GestureSession | null>(null);
  const [detectedGestures, setDetectedGestures] = useState<DetectedGesture[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [selectedGesture, setSelectedGesture] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Mock hand tracking (in real implementation, this would use MediaPipe or similar)
  const mockHandTracking = useCallback(() => {
    if (!isTracking) return;

    // Simulate hand detection
    const mockHandData: HandData = {
      landmarks: Array.from({ length: 21 }, (_, i) => ({
        x: Math.random(),
        y: Math.random(),
        z: Math.random() * 0.1,
        visibility: Math.random()
      })),
      handedness: Math.random() > 0.5 ? 'Right' : 'Left',
      confidence: 0.85 + Math.random() * 0.15,
      gestures: []
    };

    // Simulate gesture detection
    const possibleGestures = ['pinch', 'swipe', 'tap', 'rotate', 'fist', 'open_palm', 'peace', 'thumbs_up'];
    if (Math.random() < 0.3) { // 30% chance of gesture detection
      const gestureName = possibleGestures[Math.floor(Math.random() * possibleGestures.length)];
      const gesture: DetectedGesture = {
        name: gestureName,
        confidence: 0.7 + Math.random() * 0.3,
        timestamp: new Date(),
        parameters: {
          position: { x: Math.random(), y: Math.random() },
          velocity: Math.random() * 10
        }
      };

      mockHandData.gestures.push(gesture);
      setDetectedGestures(prev => [gesture, ...prev.slice(0, 9)]); // Keep last 10
    }

    setHandData(mockHandData);

    // Trigger mapped actions
    mockHandData.gestures.forEach(gesture => {
      const mapping = gestureMappings.find(m => m.gesture === gesture.name && m.enabled);
      if (mapping) {
        const now = Date.now();
        const lastTriggered = mapping.lastTriggered?.getTime() || 0;

        if (now - lastTriggered > mapping.cooldown) {
          executeGestureAction(mapping, gesture);
          setGestureMappings(prev => prev.map(m =>
            m.id === mapping.id ? { ...m, lastTriggered: new Date() } : m
          ));
        }
      }
    });

    animationRef.current = requestAnimationFrame(mockHandTracking);
  }, [isTracking, gestureMappings]);

  // Execute gesture action
  const executeGestureAction = useCallback((mapping: GestureMapping, gesture: DetectedGesture) => {
    console.log(`Executing ${mapping.action} for gesture ${gesture.name}`);

    // In real implementation, this would trigger actual UI actions
    switch (mapping.action) {
      case 'zoom':
        console.log('Zoom gesture detected, parameters:', gesture.parameters);
        break;
      case 'navigate':
        console.log('Navigate gesture detected, direction:', mapping.parameters.direction);
        break;
      case 'select':
        console.log('Select gesture detected at position:', gesture.parameters?.position);
        break;
      case 'rotate':
        console.log('Rotate gesture detected, axis:', mapping.parameters.axis);
        break;
      case 'grab':
        console.log('Grab gesture detected');
        break;
      case 'release':
        console.log('Release gesture detected');
        break;
      case 'pause':
        console.log('Pause gesture detected');
        break;
      case 'confirm':
        console.log('Confirm gesture detected');
        break;
    }

    // Update session stats
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        gesturesDetected: prev.gesturesDetected + 1,
        actionsTriggered: prev.actionsTriggered + 1
      } : null);
    }
  }, [currentSession]);

  // Start hand tracking
  const startTracking = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      setIsTracking(true);

      // Start session
      const session: GestureSession = {
        id: `gesture-session-${Date.now()}`,
        startTime: new Date(),
        gesturesDetected: 0,
        actionsTriggered: 0,
        accuracy: 0,
        handTracking: true,
        voiceEnabled
      };

      setCurrentSession(session);

      // Start mock tracking
      mockHandTracking();

    } catch (error) {
      console.error('Failed to start hand tracking:', error);
      alert('Camera access required for hand tracking');
    }
  }, [voiceEnabled, mockHandTracking]);

  // Stop hand tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // End session
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        endTime: new Date(),
        duration: Date.now() - prev.startTime.getTime()
      } : null);
    }
  }, [currentSession]);

  // Toggle gesture mapping
  const toggleGestureMapping = useCallback((mappingId: string) => {
    setGestureMappings(prev => prev.map(mapping =>
      mapping.id === mappingId ? { ...mapping, enabled: !mapping.enabled } : mapping
    ));
  }, []);

  // Draw hand landmarks on canvas
  const drawHandLandmarks = useCallback(() => {
    if (!canvasRef.current || !handData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections between landmarks (simplified hand skeleton)
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // index finger
      [0, 9], [9, 10], [10, 11], [11, 12], // middle finger
      [0, 13], [13, 14], [14, 15], [15, 16], // ring finger
      [0, 17], [17, 18], [18, 19], [19, 20]  // pinky
    ];

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;

    connections.forEach(([start, end]) => {
      const startPoint = handData.landmarks[start];
      const endPoint = handData.landmarks[end];

      ctx.beginPath();
      ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
      ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
      ctx.stroke();
    });

    // Draw landmarks
    handData.landmarks.forEach((landmark, index) => {
      ctx.fillStyle = index === 0 ? '#ff0000' : '#00ff00'; // Wrist in red, others green
      ctx.beginPath();
      ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [handData]);

  useEffect(() => {
    drawHandLandmarks();
  }, [drawHandLandmarks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const activeMappings = gestureMappings.filter(m => m.enabled).length;
  const recentGestures = detectedGestures.slice(0, 5);
  const sessionDuration = currentSession?.duration || (currentSession ? Date.now() - currentSession.startTime.getTime() : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Hand className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gesture-Based Interface</h1>
              <p className="text-gray-600">Hand tracking and gesture recognition for immersive interactions</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={isTracking ? stopTracking : startTracking}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                isTracking
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isTracking ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isTracking ? 'Stop Tracking' : 'Start Tracking'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Mappings</p>
              <p className="text-2xl font-bold text-gray-900">{activeMappings}</p>
            </div>
            <Settings className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gestures Detected</p>
              <p className="text-2xl font-bold text-gray-900">{detectedGestures.length}</p>
            </div>
            <MousePointer className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Session Duration</p>
              <p className="text-2xl font-bold text-gray-900">{Math.floor(sessionDuration / 1000)}s</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hand Confidence</p>
              <p className="text-2xl font-bold text-gray-900">
                {handData ? `${Math.round(handData.confidence * 100)}%` : 'N/A'}
              </p>
            </div>
            <Eye className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Camera Feed and Hand Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera Feed</h3>
          <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '300px' }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              width={640}
              height={480}
            />
            {!isTracking && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Hand className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">Hand Tracking Inactive</p>
                  <p className="text-sm opacity-75">Click "Start Tracking" to begin</p>
                </div>
              </div>
            )}
          </div>
          {handData && (
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Hand:</span>
                <span className="ml-2 font-medium">{handData.handedness}</span>
              </div>
              <div>
                <span className="text-gray-600">Confidence:</span>
                <span className="ml-2 font-medium">{Math.round(handData.confidence * 100)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Gestures</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentGestures.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MousePointer className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No gestures detected yet</p>
                <p className="text-sm">Start tracking to see gestures</p>
              </div>
            ) : (
              recentGestures.map((gesture, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MousePointer className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {gesture.name.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-600">
                        {gesture.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {Math.round(gesture.confidence * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">confidence</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Gesture Mappings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gesture Mappings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gestureMappings.map((mapping) => (
            <div key={mapping.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    mapping.enabled ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {mapping.gesture.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-600">→ {mapping.action}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mapping.enabled}
                    onChange={() => toggleGestureMapping(mapping.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="text-sm text-gray-600">
                <div>Cooldown: {mapping.cooldown}ms</div>
                {mapping.lastTriggered && (
                  <div>Last triggered: {mapping.lastTriggered.toLocaleTimeString()}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Integration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Voice Commands</h3>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
              voiceEnabled
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{voiceEnabled ? 'Voice Enabled' : 'Voice Disabled'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">12</div>
            <div className="text-sm text-gray-600">Voice Commands</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">94%</div>
            <div className="text-sm text-gray-600">Recognition Accuracy</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">45ms</div>
            <div className="text-sm text-gray-600">Response Time</div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-md font-medium text-gray-900 mb-2">Available Voice Commands:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {['"zoom in"', '"zoom out"', '"rotate left"', '"rotate right"', '"select"', '"confirm"', '"cancel"', '"help"'].map((command, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded">
                {command}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Session Summary */}
      {currentSession && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Session</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentSession.gesturesDetected}</div>
              <div className="text-sm text-gray-600">Gestures Detected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{currentSession.actionsTriggered}</div>
              <div className="text-sm text-gray-600">Actions Triggered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.floor(sessionDuration / 1000)}</div>
              <div className="text-sm text-gray-600">Duration (sec)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {currentSession.gesturesDetected > 0 ? Math.round((currentSession.actionsTriggered / currentSession.gesturesDetected) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestureInterface;