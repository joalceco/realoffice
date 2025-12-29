from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.core.redis import close_redis
from app.api import workspaces, users, zones_objects, websocket

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="RealOffice API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(workspaces.router)
app.include_router(users.router)
app.include_router(zones_objects.router)
app.include_router(websocket.router)


@app.get("/")
async def root():
    return {"message": "RealOffice API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.on_event("shutdown")
async def shutdown_event():
    await close_redis()
