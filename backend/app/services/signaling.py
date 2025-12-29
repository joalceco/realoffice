from typing import Dict, Set
from fastapi import WebSocket
from datetime import datetime


class SignalingManager:
    """Manages WebRTC signaling for peer-to-peer voice connections"""
    
    def __init__(self):
        # workspace_id -> {user_id -> websocket}
        self.connections: Dict[int, Dict[int, WebSocket]] = {}
        # Track which users are in voice chat
        self.voice_active: Dict[int, Set[int]] = {}  # workspace_id -> set of user_ids
    
    async def send_signal(self, workspace_id: int, target_user_id: int, signal: dict):
        """Send WebRTC signal to a specific user"""
        if workspace_id in self.connections:
            if target_user_id in self.connections[workspace_id]:
                try:
                    await self.connections[workspace_id][target_user_id].send_json({
                        "type": "webrtc_signal",
                        "data": signal
                    })
                except Exception:
                    pass
    
    async def broadcast_voice_state(self, workspace_id: int, user_id: int, is_speaking: bool):
        """Broadcast when a user starts/stops speaking"""
        if workspace_id in self.connections:
            message = {
                "type": "voice_state",
                "data": {
                    "user_id": user_id,
                    "is_speaking": is_speaking,
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
            for uid, ws in self.connections[workspace_id].items():
                if uid != user_id:
                    try:
                        await ws.send_json(message)
                    except Exception:
                        pass
    
    def add_to_voice(self, workspace_id: int, user_id: int):
        """Mark user as active in voice chat"""
        if workspace_id not in self.voice_active:
            self.voice_active[workspace_id] = set()
        self.voice_active[workspace_id].add(user_id)
    
    def remove_from_voice(self, workspace_id: int, user_id: int):
        """Remove user from voice chat"""
        if workspace_id in self.voice_active:
            self.voice_active[workspace_id].discard(user_id)
    
    def get_voice_users(self, workspace_id: int) -> Set[int]:
        """Get all users currently in voice chat for a workspace"""
        return self.voice_active.get(workspace_id, set())


signaling_manager = SignalingManager()
