import React, { useRef, useEffect, useState } from 'react';
import { PlayerState, Zone, InteractiveObject } from '../types';

interface GameCanvasProps {
  currentUser: PlayerState;
  players: Map<number, PlayerState>;
  zones: Zone[];
  objects: InteractiveObject[];
  onMove: (x: number, y: number) => void;
  mapWidth: number;
  mapHeight: number;
}

const TILE_SIZE = 32;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const AVATAR_COLORS: { [key: string]: string } = {
  avatar1: '#FF6B6B',
  avatar2: '#4ECDC4',
  avatar3: '#45B7D1',
  avatar4: '#FFA07A',
  avatar5: '#98D8C8',
};

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentUser,
  players,
  zones,
  objects,
  onMove,
  mapWidth,
  mapHeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const animationFrameRef = useRef<number>();

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
        setKeys(prev => new Set(prev).add(e.key));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const next = new Set(prev);
        next.delete(e.key);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = Date.now();
    const speed = 3;

    const gameLoop = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 16.67; // Normalize to 60fps
      lastTime = now;

      // Update position based on keys
      let newX = currentUser.x;
      let newY = currentUser.y;

      if (keys.has('ArrowUp') || keys.has('w')) newY -= speed * delta;
      if (keys.has('ArrowDown') || keys.has('s')) newY += speed * delta;
      if (keys.has('ArrowLeft') || keys.has('a')) newX -= speed * delta;
      if (keys.has('ArrowRight') || keys.has('d')) newX += speed * delta;

      // Clamp to map bounds
      newX = Math.max(1, Math.min(mapWidth - 1, newX));
      newY = Math.max(1, Math.min(mapHeight - 1, newY));

      // Update if changed
      if (newX !== currentUser.x || newY !== currentUser.y) {
        onMove(newX, newY);
      }

      // Render
      render(ctx, { ...currentUser, x: newX, y: newY });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [keys, currentUser, players, zones, objects, mapWidth, mapHeight, onMove]);

  const render = (ctx: CanvasRenderingContext2D, currentPlayerState: PlayerState) => {
    // Clear canvas
    ctx.fillStyle = '#F0F0F0';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Calculate camera offset (center on current user)
    const cameraX = currentPlayerState.x * TILE_SIZE - CANVAS_WIDTH / 2;
    const cameraY = currentPlayerState.y * TILE_SIZE - CANVAS_HEIGHT / 2;

    // Draw grid
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    for (let x = 0; x < mapWidth; x++) {
      for (let y = 0; y < mapHeight; y++) {
        const screenX = x * TILE_SIZE - cameraX;
        const screenY = y * TILE_SIZE - cameraY;
        ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
      }
    }

    // Draw zones
    zones.forEach(zone => {
      const screenX = zone.x * TILE_SIZE - cameraX;
      const screenY = zone.y * TILE_SIZE - cameraY;
      ctx.fillStyle = 'rgba(100, 150, 255, 0.2)';
      ctx.fillRect(screenX, screenY, zone.width * TILE_SIZE, zone.height * TILE_SIZE);
      ctx.strokeStyle = '#6496FF';
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, screenY, zone.width * TILE_SIZE, zone.height * TILE_SIZE);
      
      // Draw zone name
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.fillText(zone.name, screenX + 5, screenY + 15);
    });

    // Draw objects
    objects.forEach(obj => {
      const screenX = obj.x * TILE_SIZE - cameraX;
      const screenY = obj.y * TILE_SIZE - cameraY;
      
      if (obj.object_type === 'desk') {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(screenX + 4, screenY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      } else if (obj.object_type === 'chair') {
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(screenX + 8, screenY + 8, TILE_SIZE - 16, TILE_SIZE - 16);
      } else {
        ctx.fillStyle = '#999';
        ctx.fillRect(screenX + 6, screenY + 6, TILE_SIZE - 12, TILE_SIZE - 12);
      }
    });

    // Draw other players
    players.forEach((player, id) => {
      if (id !== currentUser.userId) {
        drawPlayer(ctx, player, cameraX, cameraY, false);
      }
    });

    // Draw current user (on top)
    drawPlayer(ctx, currentPlayerState, cameraX, cameraY, true);
  };

  const drawPlayer = (
    ctx: CanvasRenderingContext2D,
    player: PlayerState,
    cameraX: number,
    cameraY: number,
    isCurrent: boolean
  ) => {
    const screenX = player.x * TILE_SIZE - cameraX;
    const screenY = player.y * TILE_SIZE - cameraY;

    // Draw avatar circle
    const color = AVATAR_COLORS[player.avatar] || '#999';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2, 12, 0, Math.PI * 2);
    ctx.fill();

    // Draw outline for current user
    if (isCurrent) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Draw username
    ctx.fillStyle = '#333';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.username, screenX + TILE_SIZE / 2, screenY - 5);
  };

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          border: '2px solid #333',
          borderRadius: '8px',
          display: 'block',
        }}
      />
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
      }}>
        Use Arrow Keys or WASD to move
      </div>
    </div>
  );
};
