from backend.utils.auth import get_current_user, get_password_hash
from backend.models.users import User, UserPublic, UserUpdate
from backend.utils.database import SessionDep
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from typing import Annotated

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

CurrentUser = Annotated[User, Depends(get_current_user)]

@router.get("/me", response_model=UserPublic)
def read_current_user(current_user: CurrentUser) -> User:
    """Get the currently authenticated user."""
    return current_user

@router.patch("", response_model=UserPublic)
def update_user(current_user: CurrentUser, user: UserUpdate, session: SessionDep):
    """Update the current user's email and/or password."""
    try:
        user_db = session.get(User, current_user.id)
        user_data = user.model_dump(exclude_unset=True) # fields in UserUpdate, except those that are not set

        if "email" in user_data and user_data["email"] != user_db.email:
            existing = session.exec(
                select(User).where(User.email == user_data["email"])
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )

        if "password" in user_data:
            password = user_data.pop("password")
            user_data["hashed_password"] = get_password_hash(password)

        user_db.sqlmodel_update(user_data)
        session.add(user_db)
        session.commit()
        session.refresh(user_db)
        return user_db
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )

@router.delete("")
def delete_user(current_user: CurrentUser, session: SessionDep):
    """Delete the current user's account, along with all of their projects, scenarios, and reports."""
    try:
        user_db = session.get(User, current_user.id)
        for project in user_db.projects:
            session.delete(project)
        session.delete(user_db)
        session.commit()
        return {"ok": True}
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )
