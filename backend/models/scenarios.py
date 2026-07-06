from backend.models.modules import ModulePublic
from backend.utils.validators import validate_azimuth, validate_name, validate_module_amount, validate_tilt
from datetime import datetime
from pydantic import field_validator
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from backend.models.projects import Project
    from backend.models.modules import Module
    from backend.models.reports import Report


def apply_scenario_validators(validator_name: str, value):
    """Apply scenario field validators. Pass None through for optional fields."""
    if value is None:
        return None
    
    if validator_name == 'name':
        return validate_name(value)
    elif validator_name == 'module_amount':
        return validate_module_amount(str(value))
    elif validator_name == 'tilt':
        return validate_tilt(str(value))
    elif validator_name == 'azimuth':
        return validate_azimuth(str(value))
    
    return value


class ScenarioBase(SQLModel): # data model
    name: str = Field(index=True)  # Required, not optional
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

    module_id: int = Field(foreign_key="modules.id", index=True)
    module: Optional["Module"] = Relationship(back_populates="scenarios")

    reports: list["Report"] = Relationship(back_populates="scenario", cascade_delete=True)


class ScenarioPublic(ScenarioBase):
    id: int # redeclares id to be an integer (and not None)
    project_id: int
    module_id: int
    module: ModulePublic | None = None
    installed_power: float | None
    losses: float | None
    created_at: datetime


class ScenarioCreate(ScenarioBase):
    name: str
    project_id: int
    module_id: int

    @field_validator('name')
    @classmethod
    def check_name(cls, v: str) -> str:
        return apply_scenario_validators('name', v)

    @field_validator('module_amount')
    @classmethod
    def check_module_amount(cls, v: int) -> int:
        return apply_scenario_validators('module_amount', v)
    
    @field_validator('tilt')
    @classmethod
    def check_tilt(cls, v: float) -> float:
        return apply_scenario_validators('tilt', v)
    
    @field_validator('azimuth')
    @classmethod
    def check_azimuth(cls, v: float) -> float:
        return apply_scenario_validators('azimuth', v)


class ScenarioUpdate(SQLModel):
    name: str | None = None
    module_id: int | None = None
    module_amount: int | None = None
    tilt: float | None = None
    azimuth: float | None = None

    @field_validator('name', mode='before')
    @classmethod
    def check_name(cls, v: str | None) -> str | None:
        return apply_scenario_validators('name', v)

    @field_validator('module_amount', mode='before')
    @classmethod
    def check_module_amount(cls, v: int | None) -> int | None:
        return apply_scenario_validators('module_amount', v)

    @field_validator('tilt', mode='before')
    @classmethod
    def check_tilt(cls, v: float | None) -> float | None:
        return apply_scenario_validators('tilt', v)

    @field_validator('azimuth', mode='before')
    @classmethod
    def check_azimuth(cls, v: float | None) -> float | None:
        return apply_scenario_validators('azimuth', v)