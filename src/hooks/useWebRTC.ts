import { useState, useEffect, useCallback } from 'react';
import { webrtcService } from '../services/webrtcService';

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

interface IncomingCall {
  callerId: string;
  callerName?: string;
  offer: any;
  accept: () => void;
  reject: () => void;
}

interface UseWebRTCReturn {
  currentCall: CallSession | null;
  incomingCall: IncomingCall | null;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isInCall: boolean;
  isMuted: boolean;
  isVideoDisabled: boolean;
  callDuration: number;
  startCall: (recipientId: string, type?: 'audio' | 'video') => Promise<boolean>;
  answerCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => boolean;
  toggleVideo: () => boolean;
}

export const useWebRTC = (): UseWebRTCReturn => {
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Set up WebRTC event listeners
  useEffect(() => {
    const handleCallStarted = (call: CallSession) => {
      setCurrentCall(call);
      setLocalStream(webrtcService.getLocalStream());
      setIsInCall(true);
      setCallDuration(0);
    };

    const handleCallConnected = () => {
      console.log('Call connected');
    };

    const handleCallEnded = () => {
      setCurrentCall(null);
      setLocalStream(null);
      setRemoteStreams(new Map());
      setIsInCall(false);
      setIsMuted(false);
      setIsVideoDisabled(false);
      setCallDuration(0);
    };

    const handleIncomingCall = (data: any) => {
      setIncomingCall({
        callerId: data.senderId,
        callerName: data.callerName,
        offer: data.offer,
        accept: () => {
          webrtcService.answerCall(data.senderId, true);
          setIncomingCall(null);
        },
        reject: () => {
          webrtcService.answerCall(data.senderId, false);
          setIncomingCall(null);
        }
      });
    };

    const handleRemoteStream = (data: { userId: string; stream: MediaStream }) => {
      setRemoteStreams(prev => new Map(prev.set(data.userId, data.stream)));
    };

    const handlePeerDisconnected = (data: { userId: string }) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.userId);
        return newMap;
      });
    };

    const handleAudioToggled = (data: { muted: boolean }) => {
      setIsMuted(data.muted);
    };

    const handleVideoToggled = (data: { disabled: boolean }) => {
      setIsVideoDisabled(data.disabled);
    };

    const handleCallError = (data: { error: string }) => {
      console.error('Call error:', data.error);
      // Could trigger error notification here
    };

    // Register event listeners
    webrtcService.on('call_started', handleCallStarted);
    webrtcService.on('call_connected', handleCallConnected);
    webrtcService.on('call_ended', handleCallEnded);
    webrtcService.on('incoming_call', handleIncomingCall);
    webrtcService.on('remote_stream', handleRemoteStream);
    webrtcService.on('peer_disconnected', handlePeerDisconnected);
    webrtcService.on('audio_toggled', handleAudioToggled);
    webrtcService.on('video_toggled', handleVideoToggled);
    webrtcService.on('call_error', handleCallError);

    // Check if there's an active call on mount
    const activeCall = webrtcService.getCurrentCall();
    if (activeCall) {
      setCurrentCall(activeCall);
      setLocalStream(webrtcService.getLocalStream());
      setIsInCall(true);
    }

    return () => {
      // Clean up event listeners
      webrtcService.off('call_started', handleCallStarted);
      webrtcService.off('call_connected', handleCallConnected);
      webrtcService.off('call_ended', handleCallEnded);
      webrtcService.off('incoming_call', handleIncomingCall);
      webrtcService.off('remote_stream', handleRemoteStream);
      webrtcService.off('peer_disconnected', handlePeerDisconnected);
      webrtcService.off('audio_toggled', handleAudioToggled);
      webrtcService.off('video_toggled', handleVideoToggled);
      webrtcService.off('call_error', handleCallError);
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isInCall && currentCall) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - currentCall.startTime.getTime()) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isInCall, currentCall]);

  const startCall = useCallback(async (recipientId: string, type: 'audio' | 'video' = 'audio'): Promise<boolean> => {
    try {
      return await webrtcService.startCall(recipientId, type);
    } catch (error) {
      console.error('Failed to start call:', error);
      return false;
    }
  }, []);

  const answerCall = useCallback(() => {
    if (incomingCall) {
      incomingCall.accept();
    }
  }, [incomingCall]);

  const rejectCall = useCallback(() => {
    if (incomingCall) {
      incomingCall.reject();
    }
  }, [incomingCall]);

  const endCall = useCallback(() => {
    webrtcService.endCall();
  }, []);

  const toggleMute = useCallback((): boolean => {
    const muted = webrtcService.toggleMute();
    setIsMuted(muted);
    return muted;
  }, []);

  const toggleVideo = useCallback((): boolean => {
    const disabled = webrtcService.toggleVideo();
    setIsVideoDisabled(disabled);
    return disabled;
  }, []);

  return {
    currentCall,
    incomingCall,
    localStream,
    remoteStreams,
    isInCall,
    isMuted,
    isVideoDisabled,
    callDuration,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo
  };
};