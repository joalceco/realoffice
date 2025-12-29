import React, { useEffect, useRef } from 'react';

interface ScreenViewerProps {
  userId: number;
  username: string;
  videoElement: HTMLVideoElement;
  onClose: () => void;
}

export const ScreenViewer: React.FC<ScreenViewerProps> = ({
  userId,
  username,
  videoElement,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && videoElement) {
      // Append video element to container
      containerRef.current.appendChild(videoElement);
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'contain';
      videoElement.style.borderRadius = '8px';

      return () => {
        // Clean up
        if (videoElement.parentElement === containerRef.current) {
          containerRef.current?.removeChild(videoElement);
        }
      };
    }
  }, [videoElement]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '90vw',
        maxHeight: '90vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
        }}>
          <div style={{
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>🖥️</span>
            {username}'s Screen
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#FF6B6B',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ff5252';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FF6B6B';
            }}
          >
            Close (Esc)
          </button>
        </div>

        {/* Video container */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            background: '#000',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />

        {/* Instructions */}
        <div style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '12px',
          textAlign: 'center',
          padding: '8px',
        }}>
          Press ESC or click Close to exit fullscreen view
        </div>
      </div>
    </div>
  );
};
