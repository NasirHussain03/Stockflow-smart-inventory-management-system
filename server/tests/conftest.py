import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database.session import Base, get_db
from app.main import app
from fastapi.testclient import TestClient

# Use an in-memory SQLite database for fast unit testing execution
DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    """
    Creates and drops tables for each test function to guarantee a clean slate,
    running within a rollback-isolated transaction.
    """
    Base.metadata.create_all(bind=engine)
    db_session = TestingSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    """
    TestClient fixture that overrides get_db dependency to point to our test database.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
