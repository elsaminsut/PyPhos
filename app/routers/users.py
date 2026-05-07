from app.utils.auth import get_current_user, get_password_hash
from app.models.users import User, UserCreate, UserPublic, UserUpdate
from app.utils.database import SessionDep
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from typing import Annotated

router = APIRouter()

CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("/users/me", response_model=UserPublic)
def read_users_me(current_user: CurrentUser):
    return current_user

@router.get("/")
def index():
    return {"message": "Hello World"}

@router.post("/users/", response_model=UserPublic) # instead of using type annotation, response_model to specify the output model (which doesn't show password)
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

@router.get("/users/", response_model=list[UserPublic])
def read_users(session: SessionDep) -> list[User]:
    users = session.exec(select(User)).all()
    return users

@router.get("/users/{user_id}", response_model=UserPublic)
def read_user(user_id: int, session: SessionDep) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/users/{user_id}", response_model=UserPublic)
def update_user(user_id: int, user: UserUpdate, session: SessionDep):
    user_db = session.get(User, user_id)
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")
    user_data = user.model_dump(exclude_unset=True) # fields in UserUpdate, except those that are not set
    user_db.sqlmodel_update(user_data)
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    return user_db

@router.delete("/users/{user_id}")
def delete_user(user_id: int, session: SessionDep):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return {"ok": True}
