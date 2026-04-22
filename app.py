from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query
import os
from sqlmodel import Field, Session, SQLModel, create_engine, select
from typing import Annotated

class UserBase(SQLModel): # data model
    name: str = Field(index=True)
    age: int | None = Field(default=None, index=True)

class User(UserBase, table=True): # table model
    id: int | None = Field(default=None, primary_key=True)
    password: str

class UserPublic(UserBase):
    id: int # redeclares id to be an integer (and not None), doesn't show pwd

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    name: str | None = None 
    age: int | None = None 
    password: str | None = None 

load_dotenv()
connection_string = os.getenv("DATABASE_URL")
if not connection_string:
    raise ValueError("DATABASE_URL is not set in your .env file")

engine = create_engine(connection_string, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

SessionDep = Annotated[Session, Depends(get_session)]

app = FastAPI(lifespan=lifespan)

@app.get("/")
def index():
    return {"message": "Hello World"}

@app.post("/users/", response_model=UserPublic) # instead of using type annotation, response_model to specify the output model (which doesn't show password)
def create_user(user: UserCreate, session: SessionDep):
    db_user = User.model_validate(user) 
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@app.get("/users/", response_model=list[UserPublic])
def read_users(session: SessionDep) -> list[User]:
    users = session.exec(select(User)).all()
    return users

@app.get("/users/{user_id}", response_model=UserPublic)
def read_user(user_id: int, session: SessionDep) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.patch("/users/{user_id}", response_model=UserPublic)
def update_user(user_id: int, user: UserUpdate, session: SessionDep):
    user_db = session.get(User, user_id)
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")
    user_data = user.model_dump(exclude_unset=True)
    user_db.sqlmodel_update(user_data)
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    return user_db

@app.delete("/users/{user_id}")
def delete_user(user_id: int, session: SessionDep):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return {"ok": True}

