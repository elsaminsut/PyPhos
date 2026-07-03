from backend.utils.auth import get_current_user
from backend.utils.database import SessionDep
from backend.utils.utils import validate_user_owns_project
from backend.models.modules import Module, ModulePublic
from backend.models.users import User
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from typing import Annotated

router = APIRouter(
    prefix="/modules",
    tags=["Modules"]
)

@router.get("/manufacturers", response_model=list[str])
def get_manufacturers(session: SessionDep):
    """
    Retrieves the list of unique manufactuerers.
    """
    manufacturers = session.exec(select(Module.manufacturer).distinct()).all()
    return sorted(manufacturers)

@router.get("", response_model=list[ModulePublic])
def get_modules_by_manufacturer(session: SessionDep, manufacturer: str):
    """
    Retrieves the list of modules for a specific manufacturer.
    """
    return session.exec(select(Module).where(Module.manufacturer == manufacturer)).all()