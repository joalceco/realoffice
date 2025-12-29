import React, { useState, useEffect } from 'react';

interface VoiceControlsProps {
  isInVoiceChat: boolean;
  isMuted: boolean;
  onJoinVoice: () => void;
  onLeaveVoice: () => void;
  onToggleMute: () => void;
  speakingUsers: Set<number>;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isInVoiceChat,
  isMuted,
  onJoinVoice,
  onLeaveVoice,
  onToggleMute,
  speakingUsers,
}) => {
  const [error, setError] = useState<string>('');

  const handleJoinVoice = async () => {
    try {
      setError('');
      await onJoinVoice();
    } catch (err: any) {
      setError(err.message || 'Failed to join voice chat');
    }
  };

  return (
    <div style={{
      background: 'white',
      border: '2px solid #333',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '16px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '18px' }}>🎤</span>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            Voice Chat
          </h3>
        </div>
        {isInVoiceChat && (
          <div style={{
            fontSize: '12px',
            color: '#4ECDC4',
            fontWeight: 'bold',
          }}>
            Connected
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          padding: '8px',
          marginBottom: '12px',
          background: '#FFE0E0',
          border: '1px solid #FF6B6B',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#D32F2F',
        }}>
          {error}
        </div>
      )}

      {/* Controls */}
      {!isInVoiceChat ? (
        <button
          onClick={handleJoinVoice}
          style={{
            width: '100%',
            padding: '12px',
            background: '#4ECDC4',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#45b7b0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#4ECDC4';
          }}
        >
          <span>🎤</span>
          Join Voice Chat
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Mute/Unmute button */}
          <button
            onClick={onToggleMute}
            style={{
              flex: 1,
              padding: '12px',
              background: isMuted ? '#FF6B6B' : '#4ECDC4',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <span>{isMuted ? '🔇' : '🎤'}</span>
            {isMuted ? 'Unmute' : 'Mute'}
          </button>

          {/* Leave voice chat button */}
          <button
            onClick={onLeaveVoice}
            style={{
              flex: 1,
              padding: '12px',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#555';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#666';
            }}
          >
            <span>📞</span>
            Leave Voice
          </button>
        </div>
      )}

      {/* Speaking indicator */}
      {isInVoiceChat && speakingUsers.size > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '8px',
          background: '#F0F0F0',
          borderRadius: '4px',
          fontSize: '12px',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#666' }}>
            Speaking: {speakingUsers.size} user{speakingUsers.size !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Info text */}
      <div style={{
        marginTop: '12px',
        fontSize: '11px',
        color: '#999',
        textAlign: 'center',
      }}>
        {isInVoiceChat 
          ? 'Voice chat is proximity-based (5 tiles)'
          : 'Join to talk with nearby teammates'}
      </div>
    </div>
  );
};
