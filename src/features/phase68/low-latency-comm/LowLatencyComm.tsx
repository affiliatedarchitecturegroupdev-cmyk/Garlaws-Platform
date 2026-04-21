'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Radio, Wifi, Zap, Activity, Clock, BarChart3, Settings, Play, Square, Volume2 } from 'lucide-react';

export interface CommunicationChannel {
  id: string;
  type: 'webrtc' | 'webtransport' | 'websocket' | 'sse';
  name: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  latency: number;
  throughput: number; // Mbps
  packetLoss: number; // percentage
  jitter: number; // ms
  lastMessage: Date;
  protocol: string;
  encryption: boolean;
}

export interface RealTimeSession {
  id: string;
  type: 'voice' | 'video' | 'screen-share' | 'data-stream';
  participants: string[];
  status: 'active' | 'connecting' | 'ended' | 'error';
  startTime: Date;
  endTime?: Date;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  channelId: string;
  bitrate: number; // kbps
  framesPerSecond?: number;
}

export interface NetworkOptimization {
  id: string;
  name: string;
  type: 'compression' | 'prioritization' | 'congestion-control' | 'error-correction';
  enabled: boolean;
  effectiveness: number; // percentage improvement
  cpuImpact: number; // percentage
  lastOptimized: Date;
}

const COMMUNICATION_CHANNELS: CommunicationChannel[] = [
  {
    id: 'webrtc-audio',
    type: 'webrtc',
    name: 'WebRTC Audio Channel',
    status: 'connected',
    latency: 25,
    throughput: 128,
    packetLoss: 0.1,
    jitter: 2,
    lastMessage: new Date(),
    protocol: 'UDP/TCP',
    encryption: true
  },
  {
    id: 'webrtc-video',
    type: 'webrtc',
    name: 'WebRTC Video Channel',
    status: 'connected',
    latency: 35,
    throughput: 2048,
    packetLoss: 0.05,
    jitter: 3,
    lastMessage: new Date(),
    protocol: 'UDP',
    encryption: true
  },
  {
    id: 'webtransport-data',
    type: 'webtransport',
    name: 'WebTransport Data Stream',
    status: 'connecting',
    latency: 15,
    throughput: 512,
    packetLoss: 0.01,
    jitter: 1,
    lastMessage: new Date(Date.now() - 5000),
    protocol: 'QUIC',
    encryption: true
  },
  {
    id: 'websocket-control',
    type: 'websocket',
    name: 'WebSocket Control Channel',
    status: 'connected',
    latency: 45,
    throughput: 64,
    packetLoss: 0.2,
    jitter: 5,
    lastMessage: new Date(),
    protocol: 'TCP',
    encryption: true
  },
];

const NETWORK_OPTIMIZATIONS: NetworkOptimization[] = [
  {
    id: 'packet-compression',
    name: 'Packet Compression',
    type: 'compression',
    enabled: true,
    effectiveness: 35,
    cpuImpact: 5,
    lastOptimized: new Date()
  },
  {
    id: 'traffic-prioritization',
    name: 'Traffic Prioritization',
    type: 'prioritization',
    enabled: true,
    effectiveness: 28,
    cpuImpact: 2,
    lastOptimized: new Date()
  },
  {
    id: 'congestion-control',
    name: 'Adaptive Congestion Control',
    type: 'congestion-control',
    enabled: true,
    effectiveness: 42,
    cpuImpact: 8,
    lastOptimized: new Date()
  },
  {
    id: 'fec-error-correction',
    name: 'Forward Error Correction',
    type: 'error-correction',
    enabled: false,
    effectiveness: 15,
    cpuImpact: 12,
    lastOptimized: new Date(Date.now() - 86400000)
  },
];

export const LowLatencyComm: React.FC = () => {
  const [channels, setChannels] = useState<CommunicationChannel[]>(COMMUNICATION_CHANNELS);
  const [sessions, setSessions] = useState<RealTimeSession[]>([]);
  const [optimizations, setOptimizations] = useState<NetworkOptimization[]>(NETWORK_OPTIMIZATIONS);
  const [selectedTab, setSelectedTab] = useState<'channels' | 'sessions' | 'optimizations' | 'diagnostics'>('channels');
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setChannels(prev => prev.map(channel => ({
        ...channel,
        latency: Math.max(10, channel.latency + (Math.random() - 0.5) * 10),
        throughput: Math.max(32, channel.throughput + (Math.random() - 0.5) * 100),
        packetLoss: Math.max(0, Math.min(5, channel.packetLoss + (Math.random() - 0.5) * 0.1)),
        jitter: Math.max(0, channel.jitter + (Math.random() - 0.5) * 2),
        lastMessage: new Date()
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Audio level monitoring
  const startAudioMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(Math.round((average / 255) * 100));
          requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();
    } catch (error) {
      console.error('Failed to start audio monitoring:', error);
    }
  }, []);

  const stopAudioMonitoring = useCallback(() => {
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopAudioMonitoring();
      setIsRecording(false);
    } else {
      startAudioMonitoring();
      setIsRecording(true);

      // Create a demo session
      const session: RealTimeSession = {
        id: `session-${Date.now()}`,
        type: 'voice',
        participants: ['user1', 'user2'],
        status: 'active',
        startTime: new Date(),
        quality: 'excellent',
        channelId: 'webrtc-audio',
        bitrate: 128
      };

      setSessions(prev => [session, ...prev]);

      // End session after 10 seconds
      setTimeout(() => {
        setSessions(prev => prev.map(s =>
          s.id === session.id
            ? { ...s, status: 'ended', endTime: new Date() }
            : s
        ));
      }, 10000);
    }
  }, [isRecording, startAudioMonitoring, stopAudioMonitoring]);

  const toggleOptimization = useCallback((optimizationId: string) => {
    setOptimizations(prev => prev.map(opt =>
      opt.id === optimizationId
        ? { ...opt, enabled: !opt.enabled, lastOptimized: new Date() }
        : opt
    ));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'connecting':
        return 'text-yellow-600 bg-yellow-100';
      case 'disconnected':
      case 'ended':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'fair':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const connectedChannels = channels.filter(c => c.status === 'connected').length;
  const activeSessions = sessions.filter(s => s.status === 'active').length;
  const avgLatency = channels.filter(c => c.status === 'connected').reduce((sum, c) => sum + c.latency, 0) / connectedChannels;
  const totalThroughput = channels.reduce((sum, c) => sum + c.throughput, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Radio className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Low Latency Communication</h1>
              <p className="text-gray-600">Optimized WebRTC and WebTransport protocols</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleRecording}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connected Channels</p>
              <p className="text-2xl font-bold text-gray-900">{connectedChannels}/{channels.length}</p>
            </div>
            <Wifi className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Latency</p>
              <p className="text-2xl font-bold text-gray-900">{avgLatency.toFixed(0)}ms</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Throughput</p>
              <p className="text-2xl font-bold text-gray-900">{totalThroughput.toFixed(0)} Mbps</p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{activeSessions}</p>
            </div>
            <Volume2 className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Audio Level Indicator */}
      {isRecording && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Audio Level</span>
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-200"
                  style={{ width: `${audioLevel}%` }}
                ></div>
              </div>
            </div>
            <span className="text-sm text-gray-600">{audioLevel}%</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('channels')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'channels'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Communication Channels
            </button>
            <button
              onClick={() => setSelectedTab('sessions')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'sessions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Real-Time Sessions
            </button>
            <button
              onClick={() => setSelectedTab('optimizations')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'optimizations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Network Optimizations
            </button>
            <button
              onClick={() => setSelectedTab('diagnostics')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'diagnostics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Diagnostics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'channels' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Communication Channels</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Channel
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {channels.map((channel) => (
                  <div key={channel.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          channel.status === 'connected' ? 'bg-green-500' :
                          channel.status === 'connecting' ? 'bg-yellow-500' :
                          channel.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                        }`}></div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{channel.name}</h4>
                          <p className="text-sm text-gray-600">{channel.protocol} • {channel.encryption ? 'Encrypted' : 'Unencrypted'}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(channel.status)}`}>
                        {channel.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Latency</span>
                          <span className="text-sm font-medium">{channel.latency}ms</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              channel.latency < 30 ? 'bg-green-600' :
                              channel.latency < 60 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${Math.min(100, (100 - channel.latency))}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Throughput</span>
                          <span className="text-sm font-medium">{channel.throughput} Mbps</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, channel.throughput / 20 * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Packet Loss:</span>
                        <span className="ml-2 font-medium">{channel.packetLoss.toFixed(2)}%</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Jitter:</span>
                        <span className="ml-2 font-medium">{channel.jitter}ms</span>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                      Last message: {channel.lastMessage.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Real-Time Sessions</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Start New Session
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participants
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quality
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bitrate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sessions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          No active sessions. Start recording to create a demo session.
                        </td>
                      </tr>
                    ) : (
                      sessions.map((session) => (
                        <tr key={session.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {session.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              {session.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.participants.length} users
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityColor(session.quality)}`}>
                              {session.quality}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                              {session.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.bitrate} kbps
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {session.endTime
                              ? `${((session.endTime.getTime() - session.startTime.getTime()) / 1000).toFixed(0)}s`
                              : 'Active'
                            }
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'optimizations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Network Optimizations</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Run Optimization
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {optimizations.map((opt) => (
                  <div key={opt.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{opt.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{opt.type.replace('-', ' ')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={opt.enabled}
                          onChange={() => toggleOptimization(opt.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Effectiveness</span>
                          <span className="text-sm font-medium">{opt.effectiveness}% improvement</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${opt.effectiveness}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">CPU Impact</span>
                          <span className="text-sm font-medium">{opt.cpuImpact}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              opt.cpuImpact < 5 ? 'bg-green-600' :
                              opt.cpuImpact < 10 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${opt.cpuImpact * 2}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Last optimized: {opt.lastOptimized.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'diagnostics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Network Diagnostics</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Connection Quality</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Latency</span>
                      <span className="text-sm font-medium text-gray-900">{avgLatency.toFixed(1)}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Packet Loss Rate</span>
                      <span className="text-sm font-medium text-gray-900">
                        {(channels.reduce((sum, c) => sum + c.packetLoss, 0) / channels.length).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Jitter Average</span>
                      <span className="text-sm font-medium text-gray-900">
                        {(channels.reduce((sum, c) => sum + c.jitter, 0) / channels.length).toFixed(1)}ms
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Connection Stability</span>
                      <span className="text-sm font-medium text-green-600">98.5%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Throughput</span>
                      <span className="text-sm font-medium text-gray-900">{totalThroughput.toFixed(0)} Mbps</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Channels</span>
                      <span className="text-sm font-medium text-gray-900">{connectedChannels}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Optimization Savings</span>
                      <span className="text-sm font-medium text-green-600">
                        {optimizations.filter(o => o.enabled).reduce((sum, o) => sum + o.effectiveness, 0)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">CPU Overhead</span>
                      <span className="text-sm font-medium text-yellow-600">
                        {optimizations.filter(o => o.enabled).reduce((sum, o) => sum + o.cpuImpact, 0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Real-Time Monitoring</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{connectedChannels}</div>
                    <div className="text-sm text-gray-600">Active Channels</div>
                  </div>
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{avgLatency.toFixed(0)}ms</div>
                    <div className="text-sm text-gray-600">Avg Latency</div>
                  </div>
                  <div className="text-center">
                    <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{totalThroughput.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Mbps Throughput</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LowLatencyComm;