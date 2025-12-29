import { User, Workspace, Zone, InteractiveObject } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = {
  // Workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await fetch(`${API_URL}/api/workspaces`);
    return response.json();
  },

  async getWorkspace(id: number): Promise<Workspace> {
    const response = await fetch(`${API_URL}/api/workspaces/${id}`);
    return response.json();
  },

  async createWorkspace(name: string, width: number = 50, height: number = 50): Promise<Workspace> {
    const response = await fetch(`${API_URL}/api/workspaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, map_width: width, map_height: height }),
    });
    return response.json();
  },

  // Users
  async getUsers(workspaceId?: number): Promise<User[]> {
    const url = workspaceId 
      ? `${API_URL}/api/users?workspace_id=${workspaceId}`
      : `${API_URL}/api/users`;
    const response = await fetch(url);
    return response.json();
  },

  async createUser(username: string, workspaceId: number, avatar: string = 'avatar1'): Promise<User> {
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, workspace_id: workspaceId, avatar }),
    });
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    return response.json();
  },

  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Zones
  async getZones(workspaceId?: number): Promise<Zone[]> {
    const url = workspaceId 
      ? `${API_URL}/api/zones?workspace_id=${workspaceId}`
      : `${API_URL}/api/zones`;
    const response = await fetch(url);
    return response.json();
  },

  // Objects
  async getObjects(workspaceId?: number): Promise<InteractiveObject[]> {
    const url = workspaceId 
      ? `${API_URL}/api/objects?workspace_id=${workspaceId}`
      : `${API_URL}/api/objects`;
    const response = await fetch(url);
    return response.json();
  },
};
