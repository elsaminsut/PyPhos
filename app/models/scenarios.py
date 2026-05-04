from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.projects import Project


class ScenarioBase(SQLModel): # data model
    name: str = Field(index=True)
    module_id: int
    module_amount: int
    tilt: float
    azimuth: float

class Scenario(ScenarioBase, table=True): # table model
    __tablename__ = "scenarios"

    id: int | None = Field(default=None, primary_key=True)
    installed_power: float | None = None # optional at first
    losses: float | None = None # optional at first
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    project_id: int = Field(foreign_key="projects.id", index=True) # indexing for faster lookups
    project: Optional["Project"] = Relationship(back_populates="scenarios") 


class ScenarioPublic(ScenarioBase):
    id: int # redeclares id to be an integer (and not None)
    project_id: int
    installed_power: float
    losses: float
    created_at: datetime


class ScenarioCreate(ScenarioBase):
    name: str
    project_id: int


class ScenarioUpdate(SQLModel):
    name: str | None = None
    module_id: int | None = None
    module_amount: int | None = None
    tilt: float | None = None
    azimuth: float | None = None