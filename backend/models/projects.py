from backend.utils.validators import validate_name
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from pydantic import field_validator, model_validator
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from backend.models.users import User
    from backend.models.scenarios import Scenario

class ProjectBase(SQLModel): # data model
    name: str = Field(index=True)


class Project(ProjectBase, table=True): # table model
    __tablename__ = "projects"

    id: int | None = Field(default=None, primary_key=True)
    location: str # resolved city name, chosen by the user from location search results
    country_code: str | None # ISO-2 country code of the resolved location, e.g. "CL"
    lat: float
    lon: float
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    is_demo: bool = Field(default=False)

    user_id: int | None = Field(foreign_key="users.id", index=True) # indexing for faster lookups
    owner: Optional["User"] = Relationship(back_populates="projects")

    scenarios: list["Scenario"] = Relationship(back_populates="project", cascade_delete=True)


class ProjectPublic(ProjectBase):
    id: int # redeclares id to be an integer (and not None)
    location: str
    country_code: str | None # nullable: None for projects created before this field existed
    lat: float
    lon: float
    user_id: int | None # nullable: demo projects (is_demo=True) have no owner
    is_demo: bool


class ProjectListItem(ProjectPublic):
    scenario_count: int


def validate_country_code(v: str) -> str:
    v = v.strip().upper()
    if len(v) != 2 or not v.isalpha():
        raise ValueError("Country code must be a 2-letter ISO code")
    return v


class ProjectCreate(ProjectBase):
    name: str
    city_input: str # raw text the user searched for
    location: str # resolved city name, from the location the user picked
    country_code: str # resolved location's ISO-2 country code, from the same pick
    lat: float
    lon: float

    @field_validator('name', 'city_input', 'location')
    @classmethod
    def check_name(cls, v: str) -> str:
        return validate_name(v)

    @field_validator('country_code')
    @classmethod
    def check_country_code(cls, v: str) -> str:
        return validate_country_code(v)

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


class ProjectUpdate(SQLModel):
    name: str | None = None
    city_input: str | None = None
    location: str | None = None
    country_code: str | None = None
    lat: float | None = None
    lon: float | None = None

    @field_validator('name', 'city_input', 'location', mode='before')
    @classmethod
    def check_name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return validate_name(v)

    @field_validator('country_code', mode='before')
    @classmethod
    def check_country_code(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return validate_country_code(v)

    @field_validator('lat')
    @classmethod
    def check_lat(cls, v: float | None) -> float | None:
        if v is not None and not -90 <= v <= 90:
            raise ValueError("Latitude must be between -90 and 90")
        return v

    @field_validator('lon')
    @classmethod
    def check_lon(cls, v: float | None) -> float | None:
        if v is not None and not -180 <= v <= 180:
            raise ValueError("Longitude must be between -180 and 180")
        return v

    @model_validator(mode='after')
    def check_location_fields_complete(self) -> "ProjectUpdate":
        location_fields = (self.location, self.country_code, self.lat, self.lon)
        provided = [f is not None for f in location_fields]
        if any(provided) and not all(provided):
            raise ValueError("location, country_code, lat and lon must all be provided together")
        return self