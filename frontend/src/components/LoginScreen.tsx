import React, { useState } from 'react';
import { AvatarSelector } from './AvatarSelector';

interface LoginScreenProps {
  onJoin: (username: string, avatar: string) => void;
  loading: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onJoin, loading }) => {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onJoin(username.trim(), selectedAvatar);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '600px',
        width: '100%',
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '8px',
          textAlign: 'center',
        }}>
          Welcome to RealOffice
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '32px',
          textAlign: 'center',
        }}>
          A virtual office where you can collaborate with your team in real-time
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '8px',
            }}>
              Choose your username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '16px',
              textAlign: 'center',
            }}>
              Choose your avatar
            </label>
            <AvatarSelector onSelect={setSelectedAvatar} />
          </div>

          <button
            type="submit"
            disabled={!username.trim() || loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              background: username.trim() && !loading ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc',
              border: 'none',
              borderRadius: '8px',
              cursor: username.trim() && !loading ? 'pointer' : 'not-allowed',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              if (username.trim() && !loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {loading ? 'Joining...' : 'Join Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
};
