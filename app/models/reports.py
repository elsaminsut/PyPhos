from datetime import datetime
from sqlmodel import Field, SQLModel
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.users import User
    from app.models.scenarios import Scenario

class ReportBase(SQLModel): # data model
    energy_yield: float
    monthly_yield: float
    radiation: float
    specific_yield: float


class Report(ReportBase, table=True): # table model
    __tablename__ = "reports"

    id: int | None = Field(default=None, primary_key=True)

    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    scenario_id: int = Field(foreign_key="scenarios.id", index=True) # indexing for faster lookups

class ReportPublic(ReportBase):
    id: int # redeclares id to be an integer (and not None), doesn't show pwd
    created_at: datetime
    updated_at: datetime

class ReportCreate(ReportBase):
    scenario_id: int


class ReportUpdate(SQLModel):
    energy_yield: float | None = None
    monthly_yield: float | None = None
    radiation: float | None = None
    specific_yield: float | None = None