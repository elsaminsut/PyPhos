from backend.models.modules import ModulePublic
from backend.models.projects import ProjectPublic
from backend.models.scenarios import ScenarioPublic
from datetime import datetime
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
