"use client";

import { useState, useRef, useEffect } from 'react';

interface ARPropertyInspectorProps {
  propertyId: string;
  onInspectionComplete?: (results: any) => void;
  className?: string;
}

export function ARPropertyInspector({
  propertyId,
  onInspectionComplete,
  className = ""
}: ARPropertyInspectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentMode, setCurrentMode] = useState<'scan' | 'inspect' | 'measure'>('scan');
  const [detectedFeatures, setDetectedFeatures] = useState<any[]>([]);

  useEffect(() => {
    // Check for AR/VR support
    const checkSupport = async () => {
      const arSupported = !!(navigator as any).xr;
      const cameraSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

      setIsSupported(arSupported && cameraSupported);
    };

    checkSupport();
  }, []);

  const startInspection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (error) {
      console.error('Failed to start AR inspection:', error);
    }
  };

  const stopInspection = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  const captureFeature = () => {
    // Simulate feature detection and capture
    const mockFeature = {
      id: `feature_${Date.now()}`,
      type: 'crack',
      position: { x: Math.random(), y: Math.random(), z: 0 },
      severity: Math.random() > 0.7 ? 'high' : 'medium',
      timestamp: new Date(),
      notes: 'Detected via AR inspection'
    };

    setDetectedFeatures(prev => [...prev, mockFeature]);
  };

  const completeInspection = () => {
    const results = {
      propertyId,
      timestamp: new Date(),
      features: detectedFeatures,
      summary: {
        totalFeatures: detectedFeatures.length,
        criticalIssues: detectedFeatures.filter(f => f.severity === 'high').length,
        recommendations: [
          'Schedule professional inspection for critical issues',
          'Document all findings in maintenance records',
          'Implement preventive maintenance program'
        ]
      }
    };

    onInspectionComplete?.(results);
    stopInspection();
  };

  if (!isSupported) {
    return (
      <div className={`bg-[#1f2833] rounded-lg p-6 text-center ${className}`}>
        <div className="text-4xl mb-4">📱</div>
        <h3 className="text-xl font-bold text-white mb-2">AR/VR Not Supported</h3>
        <p className="text-[#45a29e]">
          Your device does not support AR/VR inspection features.
          Please use a compatible mobile device with camera access.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-[#1f2833] rounded-lg overflow-hidden ${className}`}>
      {/* Camera View */}
      <div className="relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-64"
          style={{ display: isActive ? 'block' : 'none' }}
        />

        {/* AR Overlay */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Simulated AR elements */}
            <div className="absolute top-4 left-4 bg-red-500/80 text-white px-2 py-1 rounded text-xs">
              🔍 AR Active
            </div>

            {detectedFeatures.map((feature, index) => (
              <div
                key={feature.id}
                className={`absolute w-4 h-4 rounded-full border-2 ${
                  feature.severity === 'high' ? 'border-red-500 bg-red-500/50' : 'border-yellow-500 bg-yellow-500/50'
                }`}
                style={{
                  left: `${feature.position.x * 100}%`,
                  top: `${feature.position.y * 100}%`,
                }}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/80 px-1 rounded">
                  {feature.type}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4">
        {/* Mode Selection */}
        <div className="flex space-x-2 mb-4">
          {[
            { id: 'scan', label: 'Scan', icon: '🔍' },
            { id: 'inspect', label: 'Inspect', icon: '👁️' },
            { id: 'measure', label: 'Measure', icon: '📏' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setCurrentMode(mode.id as any)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                currentMode === mode.id
                  ? 'bg-[#c5a059] text-[#0b0c10]'
                  : 'bg-[#0b0c10] border border-[#45a29e]/30 text-[#45a29e] hover:border-[#c5a059]'
              }`}
            >
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-4">
          {!isActive ? (
            <button
              onClick={startInspection}
              className="flex-1 px-4 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors font-bold"
            >
              🚀 Start AR Inspection
            </button>
          ) : (
            <>
              <button
                onClick={captureFeature}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                📸 Capture Feature
              </button>
              <button
                onClick={stopInspection}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                ⏹️ Stop
              </button>
            </>
          )}
        </div>

        {/* Detected Features */}
        {detectedFeatures.length > 0 && (
          <div className="mb-4">
            <h4 className="text-white font-semibold mb-2">Detected Features ({detectedFeatures.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {detectedFeatures.map((feature) => (
                <div key={feature.id} className="flex justify-between items-center bg-[#0b0c10] p-2 rounded text-sm">
                  <span className="text-white capitalize">{feature.type}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    feature.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {feature.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Inspection */}
        {detectedFeatures.length > 0 && (
          <button
            onClick={completeInspection}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
          >
            ✅ Complete Inspection
          </button>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 bg-[#0b0c10] rounded-lg">
          <h4 className="text-[#c5a059] font-semibold mb-2">How to Use:</h4>
          <ul className="text-xs text-[#45a29e] space-y-1">
            <li>• Point camera at property features to scan</li>
            <li>• Tap "Capture Feature" when you find issues</li>
            <li>• Switch modes to inspect or measure elements</li>
            <li>• Complete inspection to save results</li>
          </ul>
        </div>
      </div>
    </div>
  );
}