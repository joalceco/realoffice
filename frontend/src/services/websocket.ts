import { WSMessage, ChatMessage } from '../types';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private workspaceId: number;
  private userId: number;
  private messageHandlers: ((message: WSMessage) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(workspaceId: number, userId: number) {
    this.workspaceId = workspaceId;
    this.userId = userId;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${WS_URL}/${this.workspaceId}/${this.userId}`);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(message));
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        this.connect().catch(() => {
          console.error('Reconnection attempt failed');
        });
      }, 2000 * this.reconnectAttempts);
    }
  }

  onMessage(handler: (message: WSMessage) => void) {
    this.messageHandlers.push(handler);
  }

  sendPosition(x: number, y: number) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'position',
        data: { x, y }
      }));
    }
  }

  sendChat(message: string, chatType: 'global' | 'proximity' = 'global', username: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'chat',
        data: { message, chat_type: chatType, username }
      }));
    }
  }

  requestState() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'request_state',
        data: {}
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers = [];
  }
}
