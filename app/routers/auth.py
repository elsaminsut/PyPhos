from app.models.users import User
from app.utils.auth import (DUMMY_HASH, Token, create_access_token, verify_password)
from app.utils.database import SessionDep
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from sqlmodel import select
import os

router = APIRouter()

@router.post("/login")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDep) -> Token:
    """Authenticate user and return an access token."""
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