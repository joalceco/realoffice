export interface User {
  id: number;
  username: string;
  avatar: string;
  workspace_id: number;
  position_x: number;
  position_y: number;
  is_online: boolean;
  last_seen: string;
}

export interface Workspace {
  id: number;
  name: string;
  map_width: number;
  map_height: number;
  created_at: string;
}

export interface Zone {
  id: number;
  name: string;
  workspace_id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  zone_type: string;
}

export interface InteractiveObject {
  id: number;
  name: string;
  workspace_id: number;
  x: number;
  y: number;
  object_type: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface ChatMessage {
  user_id: number;
  username: string;
  message: string;
  timestamp: string;
  chat_type: 'global' | 'proximity';
  zone_id?: number;
}

export interface WSMessage {
  type: 'position' | 'chat' | 'user_joined' | 'user_left' | 'state_update';
  data: any;
}

export interface PlayerState {
  userId: number;
  username: string;
  x: number;
  y: number;
  avatar: string;
}
