export class VoiceService {
  private peerConnections: Map<number, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private onSignalCallback: ((signal: any) => void) | null = null;
  private audioElements: Map<number, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;
  private isInVoiceChat: boolean = false;

  // STUN servers for NAT traversal
  private iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  async joinVoiceChat(): Promise<void> {
    try {
      // Request microphone permission
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false
      });
      
      this.isInVoiceChat = true;
      console.log('Joined voice chat successfully');
    } catch (error) {
      console.error('Failed to access microphone:', error);
      throw new Error('Microphone access denied');
    }
  }

  leaveVoiceChat(): void {
    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close all peer connections
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    // Remove all audio elements
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.srcObject = null;
    });
    this.audioElements.clear();

    this.isInVoiceChat = false;
    console.log('Left voice chat');
  }

  async createOffer(targetUserId: number): Promise<void> {
    if (!this.localStream) {
      console.error('No local stream available');
      return;
    }

    const peerConnection = new RTCPeerConnection(this.iceServers);
    this.peerConnections.set(targetUserId, peerConnection);

    // Add local stream tracks
    this.localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, this.localStream!);
    });

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
      this.handleRemoteStream(targetUserId, event.streams[0]);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onSignalCallback) {
        this.onSignalCallback({
          target_user_id: targetUserId,
          signal_type: 'ice_candidate',
          signal: {
            candidate: event.candidate.toJSON()
          }
        });
      }
    };

    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    if (this.onSignalCallback) {
      this.onSignalCallback({
        target_user_id: targetUserId,
        signal_type: 'offer',
        signal: {
          sdp: offer.sdp,
          type: offer.type
        }
      });
    }
  }

  async handleSignal(fromUserId: number, signalType: string, signal: any): Promise<void> {
    let peerConnection = this.peerConnections.get(fromUserId);

    if (signalType === 'offer') {
      // Create peer connection if it doesn't exist
      if (!peerConnection) {
        peerConnection = new RTCPeerConnection(this.iceServers);
        this.peerConnections.set(fromUserId, peerConnection);

        // Add local stream tracks
        if (this.localStream) {
          this.localStream.getTracks().forEach(track => {
            peerConnection!.addTrack(track, this.localStream!);
          });
        }

        // Handle incoming stream
        peerConnection.ontrack = (event) => {
          this.handleRemoteStream(fromUserId, event.streams[0]);
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate && this.onSignalCallback) {
            this.onSignalCallback({
              target_user_id: fromUserId,
              signal_type: 'ice_candidate',
              signal: {
                candidate: event.candidate.toJSON()
              }
            });
          }
        };
      }

      // Set remote description
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription({ type: 'offer', sdp: signal.sdp })
      );

      // Create and send answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (this.onSignalCallback) {
        this.onSignalCallback({
          target_user_id: fromUserId,
          signal_type: 'answer',
          signal: {
            sdp: answer.sdp,
            type: answer.type
          }
        });
      }
    } else if (signalType === 'answer') {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription({ type: 'answer', sdp: signal.sdp })
        );
      }
    } else if (signalType === 'ice_candidate') {
      if (peerConnection && signal.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    }
  }

  private handleRemoteStream(userId: number, stream: MediaStream): void {
    // Create or get audio element for this user
    let audioElement = this.audioElements.get(userId);
    
    if (!audioElement) {
      audioElement = new Audio();
      audioElement.autoplay = true;
      this.audioElements.set(userId, audioElement);
    }

    audioElement.srcObject = stream;
  }

  onSignal(callback: (signal: any) => void): void {
    this.onSignalCallback = callback;
  }

  toggleMute(): boolean {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = this.isMuted;
      });
      this.isMuted = !this.isMuted;
    }
    return this.isMuted;
  }

  isMicMuted(): boolean {
    return this.isMuted;
  }

  isActive(): boolean {
    return this.isInVoiceChat;
  }

  disconnectPeer(userId: number): void {
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(userId);
    }

    const audio = this.audioElements.get(userId);
    if (audio) {
      audio.pause();
      audio.srcObject = null;
      this.audioElements.delete(userId);
    }
  }

  // Get audio level for visualization
  getAudioLevel(): number {
    if (!this.localStream) return 0;
    
    // This is a simplified version - in production, use Web Audio API's AnalyserNode
    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length > 0 && audioTracks[0].enabled) {
      return Math.random(); // Placeholder - implement proper audio analysis
    }
    return 0;
  }
}
