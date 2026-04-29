from app.utils.auth import (DUMMY_HASH, Token, create_access_token, get_current_user,
                        get_password_hash, password_hash, verify_password)
from app.utils.database import SessionDep, lifespan
from datetime import timedelta
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models import User, UserCreate, UserPublic, UserUpdate
import os
from sqlmodel import create_engine, select
from typing import Annotated

app = FastAPI(lifespan=lifespan)

CurrentUser = Annotated[User, Depends(get_current_user)]

@app.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDep) -> Token:

    user = session.exec(select(User).where(User.username == form_data.username)).first()
    password_to_check = user.hashed_password if user else DUMMY_HASH
    password_valid = verify_password(form_data.password, password_to_check)

    if not user or not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=(int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))))
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

@app.get("/users/me", response_model=UserPublic)
def read_users_me(current_user: CurrentUser):
    return "patata"

@app.get("/")
def index():
    return {"message": "Hello World"}

@app.post("/users/", response_model=UserPublic) # instead of using type annotation, response_model to specify the output model (which doesn't show password)
def create_user(user: UserCreate, session: SessionDep):
    # valid_user = User.model_validate(user)
    db_user = User(
            username=user.username,
            hashed_password=get_password_hash(user.password)
        )    
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
