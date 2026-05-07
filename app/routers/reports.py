from app.utils.auth import get_current_user
from app.utils.database import SessionDep
from app.utils.pv_calcs import pv_calculation
from app.models.scenarios import Scenario, ScenarioPublic, ScenarioCreate, ScenarioUpdate
from app.models.projects import Project
from app.models.reports import Report, ReportCreate
from app.models.users import User
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from typing import Annotated

router = APIRouter()

CurrentUser = Annotated[User, Depends(get_current_user)]

def validate_scenario_exists(scenario_id: int, project_id: int, session: SessionDep) -> Scenario:
    scenario = session.get(Scenario, scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    if scenario.project_id != project_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return scenario

   
def validate_user_owns_project(project_id: int, user: User, session: SessionDep):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")


@router.post("/projects/{project_id}/scenarios/{scenario_id}/calculate")
def calculate_results(current_user: CurrentUser, project_id: int, scenario_id: int, session: SessionDep):
    validate_user_owns_project(project_id, current_user, session)
    scenario = validate_scenario_exists(scenario_id, project_id, session)
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    results = pv_calculation(
        latitude=project.lat,
        longitude=project.lon,
        installed_power=scenario.installed_power,
        tilt=scenario.tilt,
        azimuth=scenario.azimuth,
        losses=0.13
    )
    db_report = Report(
            scenario_id=scenario.id,
            energy_yield=results["energy_yield"],
            monthly_yield=str(results["monthly_energy_yield"]), # convert list to string for storage
            radiation=results["radiation"],
            specific_yield=results["spec_yield"]
        )
    session.add(db_report)
    session.commit()
    session.refresh(db_report)
    return db_report
