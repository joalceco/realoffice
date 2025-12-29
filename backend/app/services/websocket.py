from typing import Dict, List, Set
from fastapi import WebSocket
import json
from datetime import datetime


class ConnectionManager:
    def __init__(self):
        # workspace_id -> {user_id -> websocket}
        self.active_connections: Dict[int, Dict[int, WebSocket]] = {}
        # user_id -> {workspace_id, position}
        self.user_positions: Dict[int, dict] = {}

    async def connect(self, websocket: WebSocket, workspace_id: int, user_id: int):
        await websocket.accept()
        if workspace_id not in self.active_connections:
            self.active_connections[workspace_id] = {}
        self.active_connections[workspace_id][user_id] = websocket

    def disconnect(self, workspace_id: int, user_id: int):
        if workspace_id in self.active_connections:
            if user_id in self.active_connections[workspace_id]:
                del self.active_connections[workspace_id][user_id]
            if not self.active_connections[workspace_id]:
                del self.active_connections[workspace_id]
        if user_id in self.user_positions:
            del self.user_positions[user_id]

    async def broadcast_to_workspace(self, workspace_id: int, message: dict):
        if workspace_id in self.active_connections:
            disconnected = []
            for user_id, connection in self.active_connections[workspace_id].items():
                try:
                    await connection.send_json(message)
                except Exception:
                    # Connection failed, mark for cleanup
                    disconnected.append(user_id)
            
            # Clean up disconnected users
            for user_id in disconnected:
                self.disconnect(workspace_id, user_id)

    async def send_to_user(self, workspace_id: int, user_id: int, message: dict):
        if workspace_id in self.active_connections:
            if user_id in self.active_connections[workspace_id]:
                try:
                    await self.active_connections[workspace_id][user_id].send_json(message)
                except Exception:
                    # Connection failed, clean up
                    self.disconnect(workspace_id, user_id)

    def update_user_position(self, user_id: int, workspace_id: int, x: float, y: float):
        self.user_positions[user_id] = {
            "workspace_id": workspace_id,
            "x": x,
            "y": y
        }

    def get_nearby_users(self, workspace_id: int, x: float, y: float, radius: float = 5.0) -> List[int]:
        """Get users within proximity radius for proximity-based chat"""
        nearby = []
        for user_id, pos in self.user_positions.items():
            if pos["workspace_id"] == workspace_id:
                distance = ((pos["x"] - x) ** 2 + (pos["y"] - y) ** 2) ** 0.5
                if distance <= radius:
                    nearby.append(user_id)
        return nearby

    async def broadcast_proximity_message(self, workspace_id: int, sender_id: int, message: str, sender_username: str):
        """Send message only to nearby users"""
        if sender_id in self.user_positions:
            sender_pos = self.user_positions[sender_id]
            nearby_users = self.get_nearby_users(workspace_id, sender_pos["x"], sender_pos["y"])
            
            chat_message = {
                "type": "chat",
                "data": {
                    "user_id": sender_id,
                    "username": sender_username,
                    "message": message,
                    "chat_type": "proximity",
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
            
            for user_id in nearby_users:
                await self.send_to_user(workspace_id, user_id, chat_message)


manager = ConnectionManager()
