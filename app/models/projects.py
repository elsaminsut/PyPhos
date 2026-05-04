from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.users import User
    from app.models.scenarios import Scenario

class ProjectBase(SQLModel): # data model
    name: str = Field(index=True)


class Project(ProjectBase, table=True): # table model
    __tablename__ = "projects"

    id: int | None = Field(default=None, primary_key=True)
    location: str # from API call from user input, will be used to get lat and long
    lat: float
    long: float
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    user_id: int = Field(foreign_key="users.id", index=True) # indexing for faster lookups
    owner: Optional["User"] = Relationship(back_populates="projects")

    scenarios: list["Scenario"] = Relationship(back_populates="project")


class ProjectPublic(ProjectBase):
    id: int # redeclares id to be an integer (and not None), doesn't show pwd
    location: str
    user_id: int


class ProjectCreate(ProjectBase):
    name: str
    city_input: str # from user input


class ProjectUpdate(SQLModel):
    name: str | None = None
    location: str | None = None