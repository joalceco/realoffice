from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Zone as ZoneModel, InteractiveObject as ObjectModel
from app.schemas.schemas import Zone, ZoneCreate, InteractiveObject, InteractiveObjectCreate

router = APIRouter(prefix="/api", tags=["zones_objects"])


@router.post("/zones", response_model=Zone)
def create_zone(zone: ZoneCreate, db: Session = Depends(get_db)):
    db_zone = ZoneModel(**zone.dict())
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone


@router.get("/zones", response_model=List[Zone])
def list_zones(workspace_id: int = None, db: Session = Depends(get_db)):
    query = db.query(ZoneModel)
    if workspace_id:
        query = query.filter(ZoneModel.workspace_id == workspace_id)
    return query.all()


@router.post("/objects", response_model=InteractiveObject)
def create_object(obj: InteractiveObjectCreate, db: Session = Depends(get_db)):
    db_obj = ObjectModel(**obj.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.get("/objects", response_model=List[InteractiveObject])
def list_objects(workspace_id: int = None, db: Session = Depends(get_db)):
    query = db.query(ObjectModel)
    if workspace_id:
        query = query.filter(ObjectModel.workspace_id == workspace_id)
    return query.all()
