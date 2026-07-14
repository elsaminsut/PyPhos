from datetime import datetime
from enum import Enum
from pydantic import computed_field
from typing import TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from backend.models.scenarios import Scenario

class PVTech(Enum):
    mono_c_Si = "Mono-c-Si"
    multi_c_Si = "Multi-c-Si"
    thin_film = "Thin Film"
    cdte = "CdTe"
    cigs = "CIGS"

class ModuleBase(SQLModel): # data model
    manufacturer: str
    model: str
    technology: PVTech
    area: float
    nominal_power: float
    temp_coeff_pmax: float
    noct: float
    ptc: float | None = None


class Module(ModuleBase, table=True): # table model
    __tablename__ = "modules"

    id: int | None = Field(default=None, primary_key=True)

    scenarios: list["Scenario"] = Relationship(back_populates="module")


class ModulePublic(ModuleBase):
    id: int # redeclares id to be an integer (and not None)

    @computed_field
    @property
    def efficiency(self) -> float:
        """Module efficiency at STC (1000 W/m^2), as a percentage."""
        return round((self.nominal_power / (self.area * 1000)) * 100, 1)


class ModuleUpdate(SQLModel):
    manufacturer: str | None = None
    model: str | None = None
    technology: PVTech | None = None
    area: float | None = None
    nominal_power: float | None = None
    temp_coeff_pmax: float | None = None
    noct: float | None = None
    ptc: float | None = None