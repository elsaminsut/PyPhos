from backend.utils.validators import validate_password
from sqlmodel import Field, SQLModel, Relationship
from pydantic import field_validator, EmailStr
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from backend.models.projects import Project


class UserBase(SQLModel): # data model
    email: EmailStr = Field(index=True)


class User(UserBase, table=True): # table model
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str
    disabled: bool = False

    projects: List["Project"] = Relationship(back_populates="owner")


class UserPublic(UserBase):
    id: int # redeclares id to be an integer (and not None), doesn't show pwd


class UserCreate(UserBase):
    email: EmailStr
    password: str # plain text password

    @field_validator('password')
    @classmethod
    def check_password(cls, v: str) -> str:
        return validate_password(v)


class UserUpdate(SQLModel):
    email: EmailStr | None = None
    password: str | None = None # plain text password

    @field_validator('password', mode='before')
    @classmethod
    def check_password(cls, v: str | None) -> str | None:
        """Validate password if provided during update"""
        if v is None:
            return v
        return validate_password(v)