"""Test fixtures and configuration."""

from collections.abc import Generator

import psycopg
import pytest
from fastapi.testclient import TestClient
from psycopg.errors import DuplicateDatabase
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database import Base, get_db
from app.main import app

# Test database connection parameters
TEST_DB_DSN_DEFAULT = (
    "dbname=darukaa user=darukaa password=darukaa_dev host=localhost port=5432"
)
TEST_DB_DSN_TEST = (
    "dbname=darukaa_test user=darukaa password=darukaa_dev host=localhost port=5432"
)
SQLALCHEMY_DATABASE_URL = (
    "postgresql+psycopg://darukaa:darukaa_dev@localhost:5432/darukaa_test"
)


def setup_test_database():
    """Create the test database and postgis extension if they don't exist."""
    try:
        with psycopg.connect(TEST_DB_DSN_DEFAULT, autocommit=True) as conn:
            conn.execute("CREATE DATABASE darukaa_test")
    except DuplicateDatabase:
        pass
    except Exception as e:
        print(f"Warning: Failed to create test database (is Postgres running?): {e}")

    try:
        with psycopg.connect(TEST_DB_DSN_TEST, autocommit=True) as conn:
            conn.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    except Exception as e:
        print(f"Warning: Failed to create postgis extension: {e}")


# Run the setup before initializing the engine
setup_test_database()

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Create a fresh database session and schema for a test."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """Create a test client with a test database session."""

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
