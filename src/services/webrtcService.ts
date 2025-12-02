import { socketService } from './socketService';

interface CallParticipant {
  userId: string;
  username: string;
  stream?: MediaStream;
  connection?: RTCPeerConnection;
}

interface CallSession {
  id: string;
  participants: CallParticipant[];
  isActive: boolean;
  startTime: Date;
  type: 'audio' | 'video';
  initiator: string;
}

type CallEventCallback = (event: any) => void;

class WebRTCService {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private currentCall: CallSession | null = null;
  private eventListeners: Map<string, CallEventCallback[]> = new Map();
  
  private rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // Add TURN servers for production
      // {
      //   urls: 'turn:your-turn-server.com:3478',
      //   username: 'username',
      //   credential: 'password'
      // }
    ]
  };

  constructor() {
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    socketService.on('webrtc_offer', async (data: { senderId: string; offer: RTCSessionDescriptionInit }) => {
      await this.handleOffer(data.senderId, data.offer);
    });

    socketService.on('webrtc_answer', async (data: { senderId: string; answer: RTCSessionDescriptionInit }) => {
      await this.handleAnswer(data.senderId, data.answer);
    });

    socketService.on('webrtc_ice_candidate', async (data: { senderId: string; candidate: RTCIceCandidateInit }) => {
      await this.handleIceCandidate(data.senderId, data.candidate);
    });
  }

  // Public methods
  public async startCall(recipientId: string, type: 'audio' | 'video' = 'audio'): Promise<boolean> {
    try {
      // Get user media
      this.localStream = await this.getUserMedia(type === 'video');
      
      // Create peer connection
      const peerConnection = this.createPeerConnection(recipientId);
      
      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send offer through socket
      socketService.sendWebRTCOffer(recipientId, offer);

      // Create call session
      this.currentCall = {
        id: `call_${Date.now()}`,
        participants: [
          { userId: this.getCurrentUserId(), username: 'You' },
          { userId: recipientId, username: 'User' } // Should get actual username
        ],
        isActive: true,
        startTime: new Date(),
        type,
        initiator: this.getCurrentUserId()
      };

      this.emit('call_started', this.currentCall);
      return true;
    } catch (error) {
      console.error('Failed to start call:', error);
      this.emit('call_error', { error: 'Failed to start call' });
      return false;
    }
  }

  public async answerCall(callerId: string, accept: boolean): Promise<boolean> {
    if (!accept) {
      this.emit('call_rejected', { callerId });
      return true;
    }

    try {
      // Get user media
      this.localStream = await this.getUserMedia(true); // Assume video for now
      
      const peerConnection = this.peerConnections.get(callerId);
      if (!peerConnection) {
        throw new Error('No peer connection found');
      }

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });

      // Create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send answer through socket
      socketService.sendWebRTCAnswer(callerId, answer);

      this.emit('call_answered', { callerId });
      return true;
    } catch (error) {
      console.error('Failed to answer call:', error);
      this.emit('call_error', { error: 'Failed to answer call' });
      return false;
    }
  }

  public endCall(): void {
    if (this.currentCall) {
      this.currentCall.isActive = false;
      this.emit('call_ended', this.currentCall);
    }

    // Close all peer connections
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.currentCall = null;
  }

  public toggleMute(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.emit('audio_toggled', { muted: !audioTrack.enabled });
      return !audioTrack.enabled;
    }
    return false;
  }

  public toggleVideo(): boolean {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.emit('video_toggled', { disabled: !videoTrack.enabled });
      return !videoTrack.enabled;
    }
    return false;
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public getCurrentCall(): CallSession | null {
    return this.currentCall;
  }

  public isInCall(): boolean {
    return this.currentCall?.isActive || false;
  }

  // Event management
  public on(event: string, callback: CallEventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback?: CallEventCallback): void {
    if (!callback) {
      this.eventListeners.delete(event);
      return;
    }

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebRTC event listener for ${event}:`, error);
        }
      });
    }
  }

  // Private methods
  private async getUserMedia(video: boolean): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: video ? {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      } : false
    };

    return await navigator.mediaDevices.getUserMedia(constraints);
  }

  private createPeerConnection(userId: string): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection(this.rtcConfiguration);
    this.peerConnections.set(userId, peerConnection);

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.sendWebRTCIceCandidate(userId, event.candidate);
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      this.emit('remote_stream', { userId, stream: remoteStream });
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${userId}:`, peerConnection.connectionState);
      
      if (peerConnection.connectionState === 'connected') {
        this.emit('peer_connected', { userId });
      } else if (peerConnection.connectionState === 'disconnected' || 
                 peerConnection.connectionState === 'failed') {
        this.emit('peer_disconnected', { userId });
        this.peerConnections.delete(userId);
      }
    };

    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state with ${userId}:`, peerConnection.iceConnectionState);
    };

    return peerConnection;
  }

  private async handleOffer(senderId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      // Create peer connection if it doesn't exist
      let peerConnection = this.peerConnections.get(senderId);
      if (!peerConnection) {
        peerConnection = this.createPeerConnection(senderId);
      }

      // Set remote description
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      // Emit incoming call event
      this.emit('incoming_call', { 
        callerId: senderId,
        offer,
        accept: () => this.answerCall(senderId, true),
        reject: () => this.answerCall(senderId, false)
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  private async handleAnswer(senderId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      const peerConnection = this.peerConnections.get(senderId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        this.emit('call_connected', { userId: senderId });
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  private async handleIceCandidate(senderId: string, candidate: RTCIceCandidateInit): Promise<void> {
    try {
      const peerConnection = this.peerConnections.get(senderId);
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  private getCurrentUserId(): string {
    // This should get the current user ID from auth service
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
}

export const webrtcService = new WebRTCService();
export default webrtcService;