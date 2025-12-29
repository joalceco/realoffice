from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    username: str
    avatar: str = "avatar1"


class UserCreate(UserBase):
    workspace_id: int


class UserUpdate(BaseModel):
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    avatar: Optional[str] = None


class User(UserBase):
    id: int
    workspace_id: int
    position_x: float
    position_y: float
    is_online: bool
    last_seen: datetime

    class Config:
        from_attributes = True


class WorkspaceBase(BaseModel):
    name: str
    map_width: int = 50
    map_height: int = 50


class WorkspaceCreate(WorkspaceBase):
    pass


class Workspace(WorkspaceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ZoneBase(BaseModel):
    name: str
    x: float
    y: float
    width: float
    height: float
    zone_type: str = "room"


class ZoneCreate(ZoneBase):
    workspace_id: int


class Zone(ZoneBase):
    id: int
    workspace_id: int

    class Config:
        from_attributes = True


class InteractiveObjectBase(BaseModel):
    name: str
    x: float
    y: float
    object_type: str


class InteractiveObjectCreate(InteractiveObjectBase):
    workspace_id: int


class InteractiveObject(InteractiveObjectBase):
    id: int
    workspace_id: int

    class Config:
        from_attributes = True


class Position(BaseModel):
    x: float
    y: float


class ChatMessage(BaseModel):
    user_id: int
    username: str
    message: str
    timestamp: datetime
    chat_type: str  # "global" or "proximity"
    zone_id: Optional[int] = None


class WSMessage(BaseModel):
    type: str  # "position", "chat", "user_joined", "user_left"
    data: dict
