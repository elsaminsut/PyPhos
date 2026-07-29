from backend.utils.auth import get_current_user
from backend.utils.pv_calcs import search_locations
from backend.models.users import User
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import Annotated

router = APIRouter(
    prefix="/locations",
    tags=["Locations"]
)

CurrentUser = Annotated[User, Depends(get_current_user)]


class LocationCandidate(BaseModel):
    name: str
    country_code: str
    admin1: str | None = None
    lat: float
    lon: float


@router.get("/search", response_model=list[LocationCandidate])
def search(q: Annotated[str, Query(min_length=1, max_length=20)]):
    """
    Search for cities matching `q`, for use in a location picker.
    Returns multiple candidates (with country code and region) so same-named
    cities in different countries can be told apart, instead of guessing one.
    """
    results = search_locations(q)
    return [
        LocationCandidate(
            name=result["name"],
            country_code=result["country_code"],
            admin1=result["admin1"],
            lat=result["latitude"],
            lon=result["longitude"]
        )
        for result in results
    ]