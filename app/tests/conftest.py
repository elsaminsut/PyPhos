import datetime
import pytest
from sqlalchemy import create_engine
from sqlmodel import Session, SQLModel
from fastapi.testclient import TestClient
from app.utils.database import SessionDep
from app.app import app

BASE_URL = "http://localhost:8000"

@pytest.fixture(scope="session")
def test_engine():
    """Create an in-memory SQLite database for all tests."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture
def test_session(test_engine):
    """Create a new database session for each test."""
    with Session(test_engine) as session:
        yield session


@pytest.fixture(autouse=True)
def override_session(test_session):
    """Override the SessionDep dependency to use test session."""
    def get_test_session():
        yield test_session
    
    app.dependency_overrides[SessionDep] = get_test_session
    yield

    # Clean up after test
    app.dependency_overrides.clear()


@pytest.fixture
def create_user():
    current_time = int(datetime.datetime.now().timestamp())
    new_user = {
        "username": f"user_{current_time}",
        "password": "password"
    }
    return new_user

@pytest.fixture
def client(override_session):
    """Create TestClient with overridden dependencies."""
    return TestClient(app)


@pytest.fixture
def register_user(client, create_user):
    return client.post("/register/", json=create_user)


@pytest.fixture
def login_user(client, create_user, register_user):
    return client.post("/login/", data=create_user)


@pytest.fixture
def auth_token(register_user, login_user):
    token = login_user.json().get("access_token")
    return token