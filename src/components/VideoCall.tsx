"use client";

import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "@/lib/use-websocket";

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string;
  isInitiator?: boolean;
}

export function VideoCall({ isOpen, onClose, roomId = "default-room", isInitiator = false }: VideoCallProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const { sendMessage: sendWSMessage } = useWebSocket(
    `ws://localhost:8080?token=${typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''}`,
    handleWebSocketMessage
  );

  // WebRTC configuration
  const rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // Add TURN servers for production
      // { urls: 'turn:your-turn-server.com', username: 'user', credential: 'pass' }
    ],
  };

  const initializeCall = async () => {
    try {
      setError(null);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);

      // Create peer connection
      const pc = new RTCPeerConnection(rtcConfiguration);
      setPeerConnection(pc);

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendWSMessage({
            type: 'ice_candidate',
            payload: {
              roomId,
              candidate: event.candidate,
            },
          });
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        switch (pc.connectionState) {
          case 'connected':
            setIsConnected(true);
            setIsInCall(true);
            break;
          case 'connecting':
            setIsConnected(false);
            setIsInCall(true);
            break;
          case 'disconnected':
          case 'failed':
            setError('Connection lost. Please try again.');
            setIsConnected(false);
            setIsInCall(false);
            break;
          case 'closed':
            setIsConnected(false);
            setIsInCall(false);
            break;
        }
      };

      // Handle ICE connection state
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
      };

      // Join room
      sendWSMessage({
        type: 'join_video_room',
        payload: { roomId },
      });

      // If initiator, create offer
      if (isInitiator) {
        setTimeout(async () => {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            sendWSMessage({
              type: 'video_offer',
              payload: {
                roomId,
                offer: offer,
              },
            });
          } catch (error) {
            console.error('Failed to create offer:', error);
            setError('Failed to start call');
          }
        }, 1000);
      }

    } catch (error) {
      console.error('Failed to initialize call:', error);
      setError('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }

    setRemoteStream(null);
    setIsConnected(false);
    setIsInCall(false);

    sendWSMessage({
      type: 'end_call',
      payload: { roomId },
    });
  };

  useEffect(() => {
    let mounted = true;

    const handleCallLifecycle = async () => {
      if (isOpen && mounted) {
        await initializeCall();
      } else if (!isOpen && mounted) {
        endCall();
      }
    };

    handleCallLifecycle();

    return () => {
      mounted = false;
      endCall();
    };
  }, [isOpen, initializeCall, endCall]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  function handleWebSocketMessage(message: any) {
    switch (message.type) {
      case 'video_offer':
        handleVideoOffer(message.payload);
        break;
      case 'video_answer':
        handleVideoAnswer(message.payload);
        break;
      case 'ice_candidate':
        handleIceCandidate(message.payload);
        break;
      case 'call_ended':
        endCall();
        break;
    }
  }



  async function handleVideoOffer(payload: any) {
    if (!peerConnection || payload.roomId !== roomId) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      sendWSMessage({
        type: 'video_answer',
        payload: {
          roomId,
          answer: answer,
        },
      });
    } catch (error) {
      console.error('Failed to handle offer:', error);
      setError('Failed to join call');
    }
  }

  async function handleVideoAnswer(payload: any) {
    if (!peerConnection || payload.roomId !== roomId) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer));
    } catch (error) {
      console.error('Failed to handle answer:', error);
    }
  }

  async function handleIceCandidate(payload: any) {
    if (!peerConnection || payload.roomId !== roomId) return;

    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
    } catch (error) {
      console.error('Failed to add ICE candidate:', error);
    }
  }

  function toggleAudio() {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }

  function toggleVideo() {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 w-full max-w-4xl h-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#45a29e]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📹</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">Video Call</h3>
              <p className="text-[#45a29e] text-xs">
                {isInCall ? 'Connected' : isConnected ? 'Connecting...' : 'Initializing...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#45a29e] hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/20 border-b border-red-500/40">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Video Area */}
        <div className="flex-1 p-4 relative">
          {/* Remote Video */}
          <div className="w-full h-full bg-[#0b0c10] rounded-lg overflow-hidden relative">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-[#45a29e]">
                  <div className="text-6xl mb-4">📹</div>
                  <p className="text-lg">Waiting for other participant...</p>
                </div>
              </div>
            )}

            {/* Local Video (Picture-in-Picture) */}
            {localStream && (
              <div className="absolute bottom-4 right-4 w-32 h-24 bg-[#0b0c10] rounded-lg overflow-hidden border border-[#45a29e]/20">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-[#45a29e]/20 flex items-center justify-center gap-4">
          <button
            onClick={toggleAudio}
            className="w-12 h-12 bg-[#2d3b2d] hover:bg-[#3d4b3d] rounded-full flex items-center justify-center transition-colors"
            title="Toggle Audio"
          >
            <span className="text-white text-lg">🎤</span>
          </button>

          <button
            onClick={toggleVideo}
            className="w-12 h-12 bg-[#2d3b2d] hover:bg-[#3d4b3d] rounded-full flex items-center justify-center transition-colors"
            title="Toggle Video"
          >
            <span className="text-white text-lg">📹</span>
          </button>

          <button
            onClick={endCall}
            className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
            title="End Call"
          >
            <span className="text-white text-lg">📞</span>
          </button>
        </div>
      </div>
    </div>
  );
}