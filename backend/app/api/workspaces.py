from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Workspace as WorkspaceModel
from app.schemas.schemas import Workspace, WorkspaceCreate

router = APIRouter(prefix="/api/workspaces", tags=["workspaces"])


@router.post("/", response_model=Workspace)
def create_workspace(workspace: WorkspaceCreate, db: Session = Depends(get_db)):
    db_workspace = WorkspaceModel(**workspace.dict())
    db.add(db_workspace)
    db.commit()
    db.refresh(db_workspace)
    return db_workspace


@router.get("/", response_model=List[Workspace])
def list_workspaces(db: Session = Depends(get_db)):
    return db.query(WorkspaceModel).all()


@router.get("/{workspace_id}", response_model=Workspace)
def get_workspace(workspace_id: int, db: Session = Depends(get_db)):
    workspace = db.query(WorkspaceModel).filter(WorkspaceModel.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace
