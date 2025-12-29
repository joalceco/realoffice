from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    map_width = Column(Integer, default=50)
    map_height = Column(Integer, default=50)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="workspace")
    zones = relationship("Zone", back_populates="workspace")
    objects = relationship("InteractiveObject", back_populates="workspace")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    avatar = Column(String, default="avatar1")
    workspace_id = Column(Integer, ForeignKey("workspaces.id"))
    position_x = Column(Float, default=5.0)
    position_y = Column(Float, default=5.0)
    is_online = Column(Boolean, default=False)
    last_seen = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    workspace = relationship("Workspace", back_populates="users")


class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"))
    x = Column(Float)
    y = Column(Float)
    width = Column(Float)
    height = Column(Float)
    zone_type = Column(String, default="room")  # room, desk, meeting_area, etc.

    workspace = relationship("Workspace", back_populates="zones")


class InteractiveObject(Base):
    __tablename__ = "interactive_objects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"))
    x = Column(Float)
    y = Column(Float)
    object_type = Column(String)  # desk, chair, door, etc.
    
    workspace = relationship("Workspace", back_populates="objects")
