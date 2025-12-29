from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User as UserModel
from app.services.websocket import manager
from app.services.signaling import signaling_manager
from datetime import datetime
import json

router = APIRouter()


@router.websocket("/ws/{workspace_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, workspace_id: int, user_id: int):
    await manager.connect(websocket, workspace_id, user_id)
    
    # Register for signaling
    signaling_manager.connections.setdefault(workspace_id, {})[user_id] = websocket
    
    # Notify others that user joined
    await manager.broadcast_to_workspace(workspace_id, {
        "type": "user_joined",
        "data": {
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    })
    
    try:
        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")
            
            if message_type == "position":
                # Update position
                position_data = data.get("data", {})
                x = position_data.get("x")
                y = position_data.get("y")
                
                if x is not None and y is not None:
                    manager.update_user_position(user_id, workspace_id, x, y)
                    
                    # Broadcast position to all users in workspace
                    await manager.broadcast_to_workspace(workspace_id, {
                        "type": "position",
                        "data": {
                            "user_id": user_id,
                            "x": x,
                            "y": y,
                            "timestamp": datetime.utcnow().isoformat()
                        }
                    })
            
            elif message_type == "chat":
                # Handle chat message
                chat_data = data.get("data", {})
                message = chat_data.get("message")
                chat_type = chat_data.get("chat_type", "global")
                username = chat_data.get("username", f"User {user_id}")
                
                if message:
                    chat_message = {
                        "type": "chat",
                        "data": {
                            "user_id": user_id,
                            "username": username,
                            "message": message,
                            "chat_type": chat_type,
                            "timestamp": datetime.utcnow().isoformat()
                        }
                    }
                    
                    if chat_type == "proximity":
                        # Send to nearby users only
                        await manager.broadcast_proximity_message(
                            workspace_id, user_id, message, username
                        )
                    else:
                        # Global chat - broadcast to all
                        await manager.broadcast_to_workspace(workspace_id, chat_message)
            
            elif message_type == "webrtc_signal":
                # Handle WebRTC signaling (offer, answer, ICE candidates)
                signal_data = data.get("data", {})
                target_user = signal_data.get("target_user_id")
                
                if target_user:
                    await signaling_manager.send_signal(workspace_id, target_user, {
                        "from_user_id": user_id,
                        "signal_type": signal_data.get("signal_type"),
                        "signal": signal_data.get("signal")
                    })
            
            elif message_type == "voice_join":
                # User joined voice chat
                signaling_manager.add_to_voice(workspace_id, user_id)
                
                # Notify all users that someone joined voice
                await manager.broadcast_to_workspace(workspace_id, {
                    "type": "voice_joined",
                    "data": {
                        "user_id": user_id,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                })
            
            elif message_type == "voice_leave":
                # User left voice chat
                signaling_manager.remove_from_voice(workspace_id, user_id)
                
                await manager.broadcast_to_workspace(workspace_id, {
                    "type": "voice_left",
                    "data": {
                        "user_id": user_id,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                })
            
            elif message_type == "voice_state":
                # User is speaking/muted
                is_speaking = data.get("data", {}).get("is_speaking", False)
                await signaling_manager.broadcast_voice_state(workspace_id, user_id, is_speaking)
            
            elif message_type == "screen_share_start":
                # User started screen sharing
                await manager.broadcast_to_workspace(workspace_id, {
                    "type": "screen_share_started",
                    "data": {
                        "user_id": user_id,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                })
            
            elif message_type == "screen_share_stop":
                # User stopped screen sharing
                await manager.broadcast_to_workspace(workspace_id, {
                    "type": "screen_share_stopped",
                    "data": {
                        "user_id": user_id,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                })
            
            elif message_type == "request_state":
                # Send current positions of all users
                positions = []
                for uid, pos in manager.user_positions.items():
                    if pos["workspace_id"] == workspace_id:
                        positions.append({
                            "user_id": uid,
                            "x": pos["x"],
                            "y": pos["y"]
                        })
                
                await manager.send_to_user(workspace_id, user_id, {
                    "type": "state_update",
                    "data": {
                        "positions": positions
                    }
                })
    
    except WebSocketDisconnect:
        pass
    finally:
        # Always cleanup on disconnect
        manager.disconnect(workspace_id, user_id)
        
        # Clean up signaling
        if workspace_id in signaling_manager.connections:
            signaling_manager.connections[workspace_id].pop(user_id, None)
        signaling_manager.remove_from_voice(workspace_id, user_id)
        
        # Notify others that user left
        await manager.broadcast_to_workspace(workspace_id, {
            "type": "user_left",
            "data": {
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        })
