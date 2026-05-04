from app.models.projects import Project
from app.models.users import User
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import Depends, FastAPI
import os
from sqlalchemy import create_engine
from sqlmodel import Session, SQLModel
from typing import Annotated

load_dotenv()
connection_string = os.getenv("DATABASE_URL")
if not connection_string:
    raise ValueError("DATABASE_URL is not set in your .env file")

engine = create_engine(connection_string, echo=True)

def create_db_and_tables():
    # SQLModel.metadata.create_all(engine)
    pass


def get_session():
    with Session(engine) as session:
        yield session

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

SessionDep = Annotated[Session, Depends(get_session)]