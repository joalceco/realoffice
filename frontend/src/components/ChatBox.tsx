import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, chatType: 'global' | 'proximity') => void;
  currentUserId: number;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, currentUserId }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [chatType, setChatType] = useState<'global' | 'proximity'>('global');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage, chatType);
      setInputMessage('');
    }
  };

  return (
    <div style={{
      width: '350px',
      height: '500px',
      display: 'flex',
      flexDirection: 'column',
      background: 'white',
      border: '2px solid #333',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px',
        background: '#333',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
      }}>
        Chat
      </div>

      {/* Chat type toggle */}
      <div style={{
        padding: '8px',
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #ddd',
      }}>
        <button
          onClick={() => setChatType('global')}
          style={{
            flex: 1,
            padding: '6px',
            background: chatType === 'global' ? '#4ECDC4' : '#f0f0f0',
            color: chatType === 'global' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          Global
        </button>
        <button
          onClick={() => setChatType('proximity')}
          style={{
            flex: 1,
            padding: '6px',
            background: chatType === 'proximity' ? '#FF6B6B' : '#f0f0f0',
            color: chatType === 'proximity' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          Proximity
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            padding: '8px',
            borderRadius: '6px',
            background: msg.user_id === currentUserId ? '#E3F2FD' : '#F5F5F5',
            alignSelf: msg.user_id === currentUserId ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
          }}>
            <div style={{
              fontSize: '11px',
              color: '#666',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{ fontWeight: 'bold' }}>{msg.username}</span>
              <span style={{
                fontSize: '9px',
                background: msg.chat_type === 'proximity' ? '#FFE0E0' : '#E0F0FF',
                padding: '2px 6px',
                borderRadius: '3px',
              }}>
                {msg.chat_type}
              </span>
            </div>
            <div style={{
              fontSize: '13px',
              color: '#333',
              wordWrap: 'break-word',
            }}>
              {msg.message}
            </div>
            <div style={{
              fontSize: '9px',
              color: '#999',
              marginTop: '4px',
              textAlign: 'right',
            }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{
        padding: '12px',
        borderTop: '1px solid #ddd',
        display: 'flex',
        gap: '8px',
      }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Type a ${chatType} message...`}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          style={{
            padding: '8px 16px',
            background: '#4ECDC4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
            fontSize: '13px',
            fontWeight: 'bold',
            opacity: inputMessage.trim() ? 1 : 0.5,
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};
