from app.models.users import User
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional

class ProjectBase(SQLModel): # data model
    name: str = Field(index=True)
    location: str # from location we will get lan and long

class Project(ProjectBase, table=True): # table model
    __tablename__ = "projects"
    id: int | None = Field(default=None, primary_key=True)

    user_id: int = Field(foreign_key="users.id", index=True) # indexing for faster lookups
    owner: Optional[User] = Relationship(back_populates="projects")

class ProjectPublic(ProjectBase):
    id: int # redeclares id to be an integer (and not None), doesn't show pwd
    username: str

class ProjectCreate(ProjectBase):
    name: str
    location: str

class ProjectUpdate(ProjectBase):
    name: str | None = None
    location: str | None = None