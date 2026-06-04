from app.utils.validators import validate_username, validate_password
from sqlmodel import Field, SQLModel, Relationship
from pydantic import field_validator, EmailStr
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.projects import Project


class UserBase(SQLModel): # data model
    username: str = Field(index=True)
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
    username: str
    email: EmailStr
    password: str # plain text password

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        return validate_username(v)

    @field_validator('password')
    @classmethod
    def validate_pwd(cls, v: str) -> str:
        return validate_password(v)


class UserUpdate(SQLModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None # plain text password

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        return validate_username(v)

    @field_validator('password', mode='before')
    @classmethod
    def validate_pwd(cls, v: str) -> str:
        """Validate password if provided during update"""
        if v is None:
            return v
        return validate_password(v)