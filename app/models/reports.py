from app.models.modules import ModulePublic
from app.models.projects import ProjectPublic
from app.models.scenarios import ScenarioPublic
from datetime import datetime
from sqlmodel import Field, SQLModel, Index
from typing import TYPE_CHECKING
import json

if TYPE_CHECKING:
    from app.models.users import User
    from app.models.scenarios import Scenario

class ReportBase(SQLModel): # data model
    energy_yield: float
    monthly_yield: str # json string to be parsed into a dictionary {month: yield}
    radiation: float
    specific_yield: float


class Report(ReportBase, table=True): # table model
    __tablename__ = "reports"
    
    __table_args__ = (Index("ix_reports_scenario_id_unique", "scenario_id", unique=True),) # unique constraint: one report per scenario

    id: int | None = Field(default=None, primary_key=True)

    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    scenario_id: int = Field(foreign_key="scenarios.id", index=True) # indexing for faster lookups

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
