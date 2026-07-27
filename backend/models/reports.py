from backend.models.modules import ModulePublic
from backend.models.projects import ProjectPublic
from backend.models.scenarios import ScenarioPublic
from backend.utils.validators import validate_tilt, validate_azimuth
from datetime import datetime
from pydantic import field_validator
from sqlmodel import Field, SQLModel, Index, Relationship, JSON
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from backend.models.users import User
    from backend.models.scenarios import Scenario

class ReportBase(SQLModel): # data model
    energy_yield: float
    monthly_yield: list[float] = Field(default=None, sa_type=JSON)
    radiation: float
    monthly_radiation: list[float] | None = Field(default=None, sa_type=JSON)
    specific_yield: float
    perf_ratio: float | None
    chart_data: list[dict] | None = Field(default=None, sa_type=JSON)


class Report(ReportBase, table=True): # table model
    __tablename__ = "reports"
    
    __table_args__ = (Index("ix_reports_scenario_id_unique", "scenario_id", unique=True),) # unique constraint: one report per scenario

    id: int | None = Field(default=None, primary_key=True)

    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    scenario_id: int = Field(foreign_key="scenarios.id", index=True) # indexing for faster lookups
    scenario: Optional["Scenario"] = Relationship(back_populates="reports")

class ReportPublic(ReportBase):
    id: int # redeclares id to be an integer (and not None)
    scenario_id: int
    created_at: datetime
    updated_at: datetime

class ReportCreate(ReportBase):
    scenario_id: int

class ReportDetail(ReportPublic):
    scenario: ScenarioPublic
    project: ProjectPublic
    module: ModulePublic


class CalculationRequest(SQLModel):
    """Raw inputs for a stateless (no DB, no auth) yield calculation, used by guest mode."""
    lat: float
    lon: float
    installed_power: float
    tilt: float
    azimuth: float

    @field_validator('lat')
    @classmethod
    def check_lat(cls, v: float) -> float:
        if not -90 <= v <= 90:
            raise ValueError("Latitude must be between -90 and 90")
        return v

    @field_validator('lon')
    @classmethod
    def check_lon(cls, v: float) -> float:
        if not -180 <= v <= 180:
            raise ValueError("Longitude must be between -180 and 180")
        return v

    @field_validator('installed_power')
    @classmethod
    def check_installed_power(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Installed power must be greater than 0")
        return v

    @field_validator('tilt', mode='before')
    @classmethod
    def check_tilt(cls, v) -> float:
        return validate_tilt(str(v))

    @field_validator('azimuth', mode='before')
    @classmethod
    def check_azimuth(cls, v) -> float:
        return validate_azimuth(str(v))
