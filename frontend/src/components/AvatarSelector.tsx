import React, { useState } from 'react';

interface AvatarSelectorProps {
  onSelect: (avatar: string) => void;
}

const AVATARS = [
  { id: 'avatar1', color: '#FF6B6B', name: 'Red' },
  { id: 'avatar2', color: '#4ECDC4', name: 'Teal' },
  { id: 'avatar3', color: '#45B7D1', name: 'Blue' },
  { id: 'avatar4', color: '#FFA07A', name: 'Orange' },
  { id: 'avatar5', color: '#98D8C8', name: 'Green' },
];

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState('avatar1');

  const handleSelect = (avatarId: string) => {
    setSelected(avatarId);
    onSelect(avatarId);
  };

  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {AVATARS.map(avatar => (
        <div
          key={avatar.id}
          onClick={() => handleSelect(avatar.id)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            background: selected === avatar.id ? '#E3F2FD' : 'transparent',
            border: selected === avatar.id ? '2px solid #2196F3' : '2px solid transparent',
          }}
        >
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: avatar.color,
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }} />
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            fontWeight: selected === avatar.id ? 'bold' : 'normal',
            color: '#333',
          }}>
            {avatar.name}
          </div>
        </div>
      ))}
    </div>
  );
};
