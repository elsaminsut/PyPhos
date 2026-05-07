from app.models.modules import ModulePublic
from app.models.projects import ProjectPublic
from app.models.scenarios import ScenarioPublic
from datetime import datetime
from sqlmodel import Field, SQLModel
from typing import TYPE_CHECKING

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
