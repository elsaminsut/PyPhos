from app.utils.validators import validate_name
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from pydantic import field_validator
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.users import User
    from app.models.scenarios import Scenario

class ProjectBase(SQLModel): # data model
    name: str = Field(index=True)


class Project(ProjectBase, table=True): # table model
    __tablename__ = "projects"

    id: int | None = Field(default=None, primary_key=True)
    location: str # from API call from user input, will be used to get lat and lon
    lat: float
    lon: float
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    user_id: int = Field(foreign_key="users.id", index=True) # indexing for faster lookups
    owner: Optional["User"] = Relationship(back_populates="projects")

    scenarios: list["Scenario"] = Relationship(back_populates="project", cascade_delete=True)


class ProjectPublic(ProjectBase):
    id: int # redeclares id to be an integer (and not None)
    location: str
    user_id: int


class ProjectCreate(ProjectBase):
    name: str
    city_input: str # from user input

    @field_validator('name', 'city_input')
    @classmethod
    def validate_name(cls, v: str) -> str:
        return validate_name(v)


class ProjectUpdate(SQLModel):
    name: str | None = None
    city_input: str | None = None

    @field_validator('name', mode='before')
    @classmethod
    def check_name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return validate_name(v)

    @field_validator('city_input', mode='before')
    @classmethod
    def check_city_input(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return validate_name(v)