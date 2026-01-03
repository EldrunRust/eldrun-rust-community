// Voice Chat System for Eldrun
// Spatial audio with proximity detection

'use client';

import { useEffect, useRef, useState } from 'react';

export interface VoiceUser {
  id: string;
  username: string;
  position: { x: number; y: number; z: number };
  isSpeaking: boolean;
  volume: number;
}

export interface VoiceChatConfig {
  enabled: boolean;
  proximity: number;
  volume: number;
  noiseSuppression: boolean;
  echoCancellation: boolean;
}

class VoiceChatManager {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private users: Map<string, VoiceUser> = new Map();
  private config: VoiceChatConfig = {
    enabled: false,
    proximity: 50,
    volume: 0.8,
    noiseSuppression: true,
    echoCancellation: true
  };
  private listeners: Set<(users: VoiceUser[]) => void> = new Set();

  constructor() {
    this.setupAudioContext();
  }

  private setupAudioContext() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
    }
  }

  async initialize(): Promise<boolean> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: this.config.noiseSuppression,
          echoCancellation: this.config.echoCancellation,
          autoGainControl: true
        }
      });
      this.config.enabled = true;
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to initialize voice chat:', error);
      return false;
    }
  }

  async connectToUser(userId: string): Promise<void> {
    if (this.peerConnections.has(userId)) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    // Add local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      this.handleRemoteStream(userId, event.streams[0]);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send candidate to signaling server
        this.sendSignalingMessage(userId, {
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };

    this.peerConnections.set(userId, pc);

    // Create offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    this.sendSignalingMessage(userId, {
      type: 'offer',
      offer: offer
    });
  }

  private async handleRemoteStream(userId: string, stream: MediaStream) {
    const audio = new Audio();
    audio.srcObject = stream;
    audio.play();

    // Add spatial audio processing
    if (this.audioContext && this.analyser) {
      const source = this.audioContext.createMediaStreamSource(stream);
      const gainNode = this.audioContext.createGain();
      const pannerNode = this.audioContext.createPanner();
      
      pannerNode.panningModel = 'HRTF';
      pannerNode.distanceModel = 'inverse';
      pannerNode.refDistance = 1;
      pannerNode.maxDistance = this.config.proximity;
      pannerNode.rolloffFactor = 1;
      pannerNode.coneInnerAngle = 360;
      pannerNode.coneOuterAngle = 0;
      pannerNode.coneOuterGain = 0;

      source.connect(gainNode);
      gainNode.connect(pannerNode);
      pannerNode.connect(this.audioContext.destination);
      
      // Update user with audio nodes
      const user = this.users.get(userId);
      if (user) {
        (user as any).gainNode = gainNode;
        (user as any).pannerNode = pannerNode;
        this.updateUserPosition(userId, user.position);
      }
    }
  }

  updateUserPosition(userId: string, position: { x: number; y: number; z: number }) {
    const user = this.users.get(userId);
    if (!user) return;

    user.position = position;
    
    // Update spatial audio
    const pannerNode = (user as any).pannerNode;
    if (pannerNode) {
      const distance = Math.sqrt(
        Math.pow(position.x, 2) + 
        Math.pow(position.y, 2) + 
        Math.pow(position.z, 2)
      );
      
      pannerNode.setPosition(position.x, position.y, position.z);
      
      // Adjust volume based on distance
      const gainNode = (user as any).gainNode;
      if (gainNode) {
        const volume = Math.max(0, 1 - distance / this.config.proximity) * this.config.volume;
        gainNode.gain.value = volume;
        user.volume = volume;
      }
    }

    this.notifyListeners();
  }

  private sendSignalingMessage(userId: string, message: any) {
    // WebSocket signaling implementation
    if (typeof window !== 'undefined' && (window as any).voiceChatSocket) {
      const socket = (window as any).voiceChatSocket;
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'signaling',
          targetUserId: userId,
          payload: message
        }));
      }
    } else {
      // Fallback: Store message for later delivery
      // console.log('Signaling message to', userId, message);
      this.storePendingMessage(userId, message);
    }
  }

  private storePendingMessage(userId: string, message: any) {
    if (!(window as any).pendingVoiceMessages) {
      (window as any).pendingVoiceMessages = new Map();
    }
    const pending = (window as any).pendingVoiceMessages;
    if (!pending.has(userId)) {
      pending.set(userId, []);
    }
    pending.get(userId).push(message);
  }

  private notifyListeners() {
    const users = Array.from(this.users.values());
    this.listeners.forEach(listener => listener(users));
  }

  setSpeaking(userId: string, isSpeaking: boolean) {
    const user = this.users.get(userId);
    if (user) {
      user.isSpeaking = isSpeaking;
      this.notifyListeners();
    }
  }

  addUser(user: VoiceUser) {
    this.users.set(user.id, user);
    this.notifyListeners();
  }

  removeUser(userId: string) {
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(userId);
    }
    this.users.delete(userId);
    this.notifyListeners();
  }

  updateConfig(config: Partial<VoiceChatConfig>) {
    this.config = { ...this.config, ...config };
    this.notifyListeners();
  }

  getConfig(): VoiceChatConfig {
    return { ...this.config };
  }

  getUsers(): VoiceUser[] {
    return Array.from(this.users.values());
  }

  subscribe(listener: (users: VoiceUser[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  disconnect() {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.users.clear();
    this.config.enabled = false;
    this.notifyListeners();
  }
}

// Singleton instance
export const voiceChatManager = new VoiceChatManager();

// React hook
export function useVoiceChat() {
  const [users, setUsers] = useState<VoiceUser[]>([]);
  const [config, setConfig] = useState<VoiceChatConfig>(voiceChatManager.getConfig());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = voiceChatManager.subscribe(setUsers);
    const configInterval = setInterval(() => {
      setConfig(voiceChatManager.getConfig());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(configInterval);
    };
  }, []);

  const initialize = async () => {
    const success = await voiceChatManager.initialize();
    setIsInitialized(success);
    return success;
  };

  const connectToUser = (userId: string) => voiceChatManager.connectToUser(userId);
  const updatePosition = (userId: string, position: { x: number; y: number; z: number }) => 
    voiceChatManager.updateUserPosition(userId, position);
  const setSpeaking = (userId: string, isSpeaking: boolean) => 
    voiceChatManager.setSpeaking(userId, isSpeaking);
  const updateConfig = (newConfig: Partial<VoiceChatConfig>) => 
    voiceChatManager.updateConfig(newConfig);
  const disconnect = () => voiceChatManager.disconnect();

  return {
    users,
    config,
    isInitialized,
    initialize,
    connectToUser,
    updatePosition,
    setSpeaking,
    updateConfig,
    disconnect
  };
}
