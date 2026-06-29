from backend.utils.auth import get_current_user
from backend.models.users import User, UserPublic, UserUpdate
from backend.utils.database import SessionDep
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from typing import Annotated

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

CurrentUser = Annotated[User, Depends(get_current_user)]

@router.get("/", response_model=list[UserPublic])
def read_users(session: SessionDep) -> list[User]:
    """Get a list of all users."""
    users = session.exec(select(User)).all()
    return users

@router.patch("/{user_id}", response_model=UserPublic)
def update_user(current_user: CurrentUser, user: UserUpdate, session: SessionDep):
    """Update the current user's email and/or password. Updates the updated_at timestamp to the current time."""
    user_db = session.get(User, current_user.id)
    user_data = user.model_dump(exclude_unset=True) # fields in UserUpdate, except those that are not set
    user_db.sqlmodel_update(user_data)
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    return user_db

@router.delete("/{user_id}")
def delete_user(current_user: CurrentUser, session: SessionDep):
    """Delete the current user's account."""
    user_db = session.get(User, current_user.id)
    session.delete(user_db)
    session.commit()
    return {"ok": True}
