import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Minimize2 } from 'lucide-react';
import { webrtcService } from '../../services/webrtcService';

interface CallSession {
  id: string;
  participants: {
    userId: string;
    username: string;
    stream?: MediaStream;
  }[];
  isActive: boolean;
  startTime: Date;
  type: 'audio' | 'video';
  initiator: string;
}

interface CallWindowProps {
  onClose?: () => void;
}

const CallWindow: React.FC<CallWindowProps> = ({ onClose }) => {
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState<any>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const callTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Set up WebRTC event listeners
    const setupEventListeners = () => {
      webrtcService.on('call_started', (call: CallSession) => {
        setCurrentCall(call);
        setLocalStream(webrtcService.getLocalStream());
        startCallTimer();
      });

      webrtcService.on('call_connected', () => {
        console.log('Call connected');
      });

      webrtcService.on('call_ended', () => {
        handleCallEnd();
      });

      webrtcService.on('incoming_call', (data: any) => {
        setIncomingCall(data);
      });

      webrtcService.on('remote_stream', (data: { userId: string; stream: MediaStream }) => {
        setRemoteStreams(prev => new Map(prev.set(data.userId, data.stream)));
      });

      webrtcService.on('peer_disconnected', (data: { userId: string }) => {
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
      });

      webrtcService.on('audio_toggled', (data: { muted: boolean }) => {
        setIsMuted(data.muted);
      });

      webrtcService.on('video_toggled', (data: { disabled: boolean }) => {
        setIsVideoDisabled(data.disabled);
      });

      webrtcService.on('call_error', (data: { error: string }) => {
        console.error('Call error:', data.error);
        // Could show error notification here
      });
    };

    setupEventListeners();

    // Check if there's an active call
    const activeCall = webrtcService.getCurrentCall();
    if (activeCall) {
      setCurrentCall(activeCall);
      setLocalStream(webrtcService.getLocalStream());
      startCallTimer();
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Update local video element
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    // Update remote video elements
    remoteStreams.forEach((stream, userId) => {
      const videoElement = remoteVideoRefs.current.get(userId);
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    });
  }, [remoteStreams]);

  const startCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const handleCallEnd = () => {
    webrtcService.endCall();
    setCurrentCall(null);
    setLocalStream(null);
    setRemoteStreams(new Map());
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoDisabled(false);
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    if (onClose) {
      onClose();
    }
  };

  const handleToggleMute = () => {
    webrtcService.toggleMute();
  };

  const handleToggleVideo = () => {
    webrtcService.toggleVideo();
  };

  const handleAnswerCall = () => {
    if (incomingCall) {
      incomingCall.accept();
      setIncomingCall(null);
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      incomingCall.reject();
      setIncomingCall(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Incoming call modal
  if (incomingCall) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Incoming Call
            </h3>
            <p className="text-gray-600 mb-6">
              {incomingCall.callerName || 'Unknown caller'} is calling...
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleRejectCall}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
              >
                <PhoneOff className="w-5 h-5" />
                <span>Decline</span>
              </button>
              <button
                onClick={handleAnswerCall}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
              >
                <Phone className="w-5 h-5" />
                <span>Answer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No active call
  if (!currentCall) {
    return null;
  }

  // Minimized call window
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-900 text-white rounded-lg p-4 shadow-lg z-40">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">
            Call in progress - {formatDuration(callDuration)}
          </span>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-gray-300 hover:text-white"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleCallEnd}
            className="text-red-400 hover:text-red-300"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Full call window
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-medium">
            {currentCall.participants.find(p => p.userId !== getCurrentUserId())?.username || 'Call'}
          </span>
          <span className="text-gray-300">
            {formatDuration(callDuration)}
          </span>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-gray-300 hover:text-white"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-black">
        {/* Remote video streams */}
        <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
          {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
            <div key={userId} className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={(el) => {
                  if (el) {
                    remoteVideoRefs.current.set(userId, el);
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {currentCall.participants.find(p => p.userId === userId)?.username || 'User'}
              </div>
            </div>
          ))}
          
          {/* Show placeholder if no remote streams */}
          {remoteStreams.size === 0 && (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-10 h-10" />
                </div>
                <p>Connecting...</p>
              </div>
            </div>
          )}
        </div>

        {/* Local video (picture-in-picture) */}
        {localStream && currentCall.type === 'video' && (
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white px-1 py-0.5 rounded text-xs">
              You
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={handleToggleMute}
            className={`p-4 rounded-full ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
            } text-white transition-colors`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {currentCall.type === 'video' && (
            <button
              onClick={handleToggleVideo}
              className={`p-4 rounded-full ${
                isVideoDisabled ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
              } text-white transition-colors`}
              title={isVideoDisabled ? 'Enable video' : 'Disable video'}
            >
              {isVideoDisabled ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
          )}

          <button
            onClick={handleCallEnd}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
            title="End call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get current user ID
function getCurrentUserId(): string {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }
  return '';
}

export default CallWindow;