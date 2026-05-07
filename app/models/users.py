from sqlmodel import Field, SQLModel, Relationship
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.projects import Project

class UserBase(SQLModel): # data model
    username: str = Field(index=True)


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
    password: str # plain text password


class UserUpdate(SQLModel):
    username: str | None = None
    password: str | None = None # plain text password