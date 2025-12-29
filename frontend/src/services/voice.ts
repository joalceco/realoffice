export class VoiceService {
  private peerConnections: Map<number, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private onSignalCallback: ((signal: any) => void) | null = null;
  private audioElements: Map<number, HTMLAudioElement> = new Map();
  private videoElements: Map<number, HTMLVideoElement> = new Map();
  private isMuted: boolean = false;
  private isInVoiceChat: boolean = false;
  private isScreenSharing: boolean = false;
  private screenSharingSenders: Map<number, RTCRtpSender> = new Map();

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
    // Stop screen sharing if active
    if (this.isScreenSharing) {
      this.stopScreenShare();
    }

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

    // Remove all video elements
    this.videoElements.forEach(video => {
      video.pause();
      video.srcObject = null;
    });
    this.videoElements.clear();

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
    const hasVideo = stream.getVideoTracks().length > 0;
    
    if (hasVideo) {
      // Handle video stream (screen share)
      let videoElement = this.videoElements.get(userId);
      
      if (!videoElement) {
        videoElement = document.createElement('video');
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        this.videoElements.set(userId, videoElement);
      }
      
      videoElement.srcObject = stream;
    } else {
      // Handle audio stream
      let audioElement = this.audioElements.get(userId);
      
      if (!audioElement) {
        audioElement = new Audio();
        audioElement.autoplay = true;
        this.audioElements.set(userId, audioElement);
      }
      
      audioElement.srcObject = stream;
    }
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

  // Screen sharing methods
  async startScreenShare(): Promise<void> {
    if (!this.isInVoiceChat) {
      throw new Error('Must join voice chat before screen sharing');
    }

    try {
      // Request screen capture
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor'
        } as any,
        audio: false
      });

      // Handle when user stops sharing via browser UI
      this.screenStream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare();
      };

      // Add screen track to all existing peer connections
      const videoTrack = this.screenStream.getVideoTracks()[0];
      
      this.peerConnections.forEach((pc, userId) => {
        const sender = pc.addTrack(videoTrack, this.screenStream!);
        this.screenSharingSenders.set(userId, sender);
      });

      this.isScreenSharing = true;
      console.log('Started screen sharing');
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
      throw new Error('Screen sharing permission denied');
    }
  }

  stopScreenShare(): void {
    if (this.screenStream) {
      // Stop all screen tracks
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    // Remove screen track from all peer connections
    this.screenSharingSenders.forEach((sender, userId) => {
      const pc = this.peerConnections.get(userId);
      if (pc) {
        pc.removeTrack(sender);
      }
    });
    this.screenSharingSenders.clear();

    this.isScreenSharing = false;
    console.log('Stopped screen sharing');
  }

  isCurrentlyScreenSharing(): boolean {
    return this.isScreenSharing;
  }

  getVideoElement(userId: number): HTMLVideoElement | undefined {
    return this.videoElements.get(userId);
  }

  getScreenSharingUsers(): number[] {
    const users: number[] = [];
    this.videoElements.forEach((video, userId) => {
      if (video.srcObject && (video.srcObject as MediaStream).getVideoTracks().length > 0) {
        users.push(userId);
      }
    });
    return users;
  }
}
