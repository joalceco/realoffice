"""
Database initialization script
This is optional - the application will create tables on startup
"""

from app.core.database import engine, Base
from app.models.models import Workspace, Zone, InteractiveObject
from sqlalchemy.orm import sessionmaker

def init_db():
    """Initialize database with tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
