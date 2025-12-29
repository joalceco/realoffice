import React, { useState, useEffect, useCallback } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { GameCanvas } from './components/GameCanvas';
import { ChatBox } from './components/ChatBox';
import { VoiceControls } from './components/VoiceControls';
import { api } from './services/api';
import { WebSocketService } from './services/websocket';
import { VoiceService } from './services/voice';
import { PlayerState, ChatMessage, Zone, InteractiveObject, Workspace } from './types';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<PlayerState | null>(null);
  const [players, setPlayers] = useState<Map<number, PlayerState>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [objects, setObjects] = useState<InteractiveObject[]>([]);
  const [wsService, setWsService] = useState<WebSocketService | null>(null);
  const [voiceService] = useState<VoiceService>(() => new VoiceService());
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [isInVoiceChat, setIsInVoiceChat] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState<Set<number>>(new Set());

  const handleJoin = async (username: string, avatar: string) => {
    setLoading(true);
    try {
      // Get or create default workspace
      let workspaces = await api.getWorkspaces();
      let currentWorkspace: Workspace;
      
      if (workspaces.length === 0) {
        currentWorkspace = await api.createWorkspace('Default Office', 50, 50);
        
        // Create some zones and objects for the workspace
        await api.createZone({
          name: 'Meeting Room',
          workspace_id: currentWorkspace.id,
          x: 10,
          y: 10,
          width: 8,
          height: 6,
          zone_type: 'meeting_area'
        });
        
        await api.createZone({
          name: 'Lounge',
          workspace_id: currentWorkspace.id,
          x: 30,
          y: 10,
          width: 10,
          height: 8,
          zone_type: 'lounge'
        });

        // Add some desks
        for (let i = 0; i < 5; i++) {
          await api.createObject({
            name: `Desk ${i + 1}`,
            workspace_id: currentWorkspace.id,
            x: 5 + i * 3,
            y: 25,
            object_type: 'desk'
          });
        }
      } else {
        currentWorkspace = workspaces[0];
      }

      setWorkspace(currentWorkspace);

      // Load zones and objects
      const [loadedZones, loadedObjects] = await Promise.all([
        api.getZones(currentWorkspace.id),
        api.getObjects(currentWorkspace.id)
      ]);
      
      setZones(loadedZones);
      setObjects(loadedObjects);

      // Create user
      const user = await api.createUser(username, currentWorkspace.id, avatar);

      // Set up current user state
      const userState: PlayerState = {
        userId: user.id,
        username: user.username,
        x: user.position_x,
        y: user.position_y,
        avatar: user.avatar,
      };
      setCurrentUser(userState);

      // Connect to WebSocket
      const ws = new WebSocketService(currentWorkspace.id, user.id);
      await ws.connect();
      
      // Set up voice service signaling
      voiceService.onSignal((signal) => {
        if (ws) {
          ws.send({
            type: 'webrtc_signal',
            data: signal
          });
        }
      });
      
      ws.onMessage((message) => {
        if (message.type === 'position') {
          const data = message.data;
          if (data.user_id !== user.id) {
            // Update other player position
            setPlayers(prev => {
              const updated = new Map(prev);
              const existing = updated.get(data.user_id);
              if (existing) {
                updated.set(data.user_id, { ...existing, x: data.x, y: data.y });
              } else {
                // Fetch user info if we don't have it
                api.getUsers(currentWorkspace.id).then(users => {
                  const foundUser = users.find(u => u.id === data.user_id);
                  if (foundUser) {
                    setPlayers(p => {
                      const u = new Map(p);
                      u.set(foundUser.id, {
                        userId: foundUser.id,
                        username: foundUser.username,
                        x: data.x,
                        y: data.y,
                        avatar: foundUser.avatar,
                      });
                      return u;
                    });
                  }
                });
              }
              return updated;
            });
          }
        } else if (message.type === 'chat') {
          setChatMessages(prev => [...prev, message.data as ChatMessage]);
        } else if (message.type === 'user_joined') {
          // Fetch and add new user
          api.getUsers(currentWorkspace.id).then(users => {
            const joinedUser = users.find(u => u.id === message.data.user_id);
            if (joinedUser && joinedUser.id !== user.id) {
              setPlayers(prev => {
                const updated = new Map(prev);
                updated.set(joinedUser.id, {
                  userId: joinedUser.id,
                  username: joinedUser.username,
                  x: joinedUser.position_x,
                  y: joinedUser.position_y,
                  avatar: joinedUser.avatar,
                });
                return updated;
              });
            }
          });
        } else if (message.type === 'user_left') {
          setPlayers(prev => {
            const updated = new Map(prev);
            updated.delete(message.data.user_id);
            return updated;
          });
        } else if (message.type === 'state_update') {
          // Initial state sync
          const positions = message.data.positions || [];
          api.getUsers(currentWorkspace.id).then(users => {
            const userMap = new Map<number, typeof users[0]>();
            users.forEach(u => userMap.set(u.id, u));
            
            const newPlayers = new Map<number, PlayerState>();
            positions.forEach((pos: any) => {
              if (pos.user_id !== user.id) {
                const u = userMap.get(pos.user_id);
                if (u) {
                  newPlayers.set(u.id, {
                    userId: u.id,
                    username: u.username,
                    x: pos.x,
                    y: pos.y,
                    avatar: u.avatar,
                  });
                }
              }
            });
            setPlayers(newPlayers);
          });
        }
      });

      // Request initial state
      ws.requestState();
      
      setWsService(ws);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error joining workspace:', error);
      alert('Failed to join workspace. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMove = useCallback((x: number, y: number) => {
    if (currentUser && wsService) {
      setCurrentUser(prev => prev ? { ...prev, x, y } : null);
      wsService.sendPosition(x, y);
    }
  }, [currentUser, wsService]);

  const handleSendMessage = useCallback((message: string, chatType: 'global' | 'proximity') => {
    if (wsService && currentUser) {
      wsService.sendChat(message, chatType, currentUser.username);
    }
  }, [wsService, currentUser]);

  const handleJoinVoice = useCallback(async () => {
    try {
      await voiceService.joinVoiceChat();
      setIsInVoiceChat(true);
      
      // Notify server
      if (wsService) {
        wsService.send({ type: 'voice_join', data: {} });
      }
    } catch (error) {
      console.error('Failed to join voice:', error);
      throw error;
    }
  }, [voiceService, wsService]);

  const handleLeaveVoice = useCallback(() => {
    voiceService.leaveVoiceChat();
    setIsInVoiceChat(false);
    setIsMuted(false);
    
    // Notify server
    if (wsService) {
      wsService.send({ type: 'voice_leave', data: {} });
    }
  }, [voiceService, wsService]);

  const handleToggleMute = useCallback(() => {
    const newMutedState = voiceService.toggleMute();
    setIsMuted(newMutedState);
    
    // Notify server about voice state
    if (wsService) {
      wsService.send({
        type: 'voice_state',
        data: { is_speaking: !newMutedState }
      });
    }
  }, [voiceService, wsService]);

  // Update online users count
  useEffect(() => {
    setOnlineUsers(players.size + (currentUser ? 1 : 0));
  }, [players, currentUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsService) {
        wsService.disconnect();
      }
      if (voiceService.isActive()) {
        voiceService.leaveVoiceChat();
      }
    };
  }, [wsService, voiceService]);

  if (!isLoggedIn) {
    return <LoginScreen onJoin={handleJoin} loading={loading} />;
  }

  if (!currentUser || !workspace) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f0f0',
      }}>
        <div>Loading workspace...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '16px 24px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
            RealOffice - {workspace.name}
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
            Welcome, {currentUser.username}!
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            padding: '8px 16px',
            background: '#4ECDC4',
            color: 'white',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
          }}>
            {onlineUsers} online
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
      }}>
        <GameCanvas
          currentUser={currentUser}
          players={players}
          zones={zones}
          objects={objects}
          onMove={handleMove}
          mapWidth={workspace.map_width}
          mapHeight={workspace.map_height}
          speakingUsers={speakingUsers}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ChatBox
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            currentUserId={currentUser.userId}
          />
          <VoiceControls
            isInVoiceChat={isInVoiceChat}
            isMuted={isMuted}
            onJoinVoice={handleJoinVoice}
            onLeaveVoice={handleLeaveVoice}
            onToggleMute={handleToggleMute}
            speakingUsers={speakingUsers}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
