import datetime
import uuid

import pytest
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel
from fastapi.testclient import TestClient
from backend.utils.database import get_session
from backend.app import app

BASE_URL = "http://localhost:8000"

@pytest.fixture(scope="session")
def test_engine():
    """Create an in-memory SQLite database for all tests."""
    # StaticPool: a plain sqlite:///:memory: engine hands out a fresh, empty
    # in-memory database per connection, so the tables created below would be
    # invisible to any session opened later. StaticPool forces every
    # connection to share the same one.
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
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

    app.dependency_overrides[get_session] = get_test_session
    yield

    # Clean up after test
    app.dependency_overrides.clear()

@pytest.fixture
def client(override_session):
    """Create TestClient with overridden dependencies."""
    return TestClient(app)


@pytest.fixture
def create_user():
    unique = uuid.uuid4().hex[:8]
    new_user = {
        "email": f"user_{unique}@example.com",
        "password": "Password1!"
    }
    return new_user


@pytest.fixture
def register_user(client, create_user):
    return client.post("/api/register", json=create_user)


@pytest.fixture
def login_user(client, create_user, register_user):
    # OAuth2PasswordRequestForm requires the field to be named "username",
    # even though we're using an email as the login identifier.
    return client.post("/api/login", data={
        "username": create_user["email"],
        "password": create_user["password"],
    })


@pytest.fixture
def auth_token(register_user, login_user):
    token = login_user.json().get("access_token")
    return token


@pytest.fixture
def auth_client(client, auth_token):
    client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return client


@pytest.fixture
def new_project():
    current_time = int(datetime.datetime.now().timestamp())
    new_project = {
        "name": f"project_{current_time}",
        "city_input": "Melbourne",
        "location": "Melbourne",
        "country_code": "AU",
        "lat": -37.8136,
        "lon": 144.9631,
    }
    return new_project


@pytest.fixture
def create_project(new_project, auth_client):
    return auth_client.post("/api/projects", json=new_project)