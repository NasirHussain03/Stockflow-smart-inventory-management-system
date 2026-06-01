from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Create engine with pool_pre_ping to check connection health
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# Create session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()

def get_db():
    """
    Dependency generator that yields a database session and ensures
    it is closed after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
