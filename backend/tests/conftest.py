"""Test fixtures and configuration."""

import os
from collections.abc import Generator

import psycopg
import pytest
from fastapi.testclient import TestClient
from psycopg.errors import DuplicateDatabase
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database import Base, get_db
from app.main import app

# Test database connection parameters, falling back to local dev defaults
DB_USER = os.getenv("TEST_DB_USER", "darukaa")
DB_PASSWORD = os.getenv("TEST_DB_PASSWORD", "darukaa_dev")
DB_HOST = os.getenv("TEST_DB_HOST", "localhost")
DB_PORT = os.getenv("TEST_DB_PORT", "5432")
DB_DEFAULT_NAME = os.getenv("TEST_DB_DEFAULT", "darukaa")
DB_TEST_NAME = os.getenv("TEST_DB_NAME", "darukaa_test")

TEST_DB_DSN_DEFAULT = f"dbname={DB_DEFAULT_NAME} user={DB_USER} password={DB_PASSWORD} host={DB_HOST} port={DB_PORT}"
TEST_DB_DSN_TEST = f"dbname={DB_TEST_NAME} user={DB_USER} password={DB_PASSWORD} host={DB_HOST} port={DB_PORT}"
SQLALCHEMY_DATABASE_URL = (
    f"postgresql+psycopg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_TEST_NAME}"
)


def setup_test_database():
    """Create the test database and postgis extension if they don't exist."""
    try:
        with psycopg.connect(TEST_DB_DSN_DEFAULT, autocommit=True) as conn:
            conn.execute(f"CREATE DATABASE {DB_TEST_NAME}")
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
