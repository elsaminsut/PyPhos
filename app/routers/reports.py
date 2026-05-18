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
    return project


@router.post("/projects/{project_id}/scenarios/{scenario_id}/calculate")
def calculate_results(current_user: CurrentUser, project_id: int, scenario_id: int, session: SessionDep):
    """
    Trigger a yield calculation for a scenario.
    
    Calls the PVGIS API with the scenario's module specs and orientation,
    estimates system losses, and stores the results as a report.
    If a report already exists for this scenario it will be overwritten.
    """
    project = validate_user_owns_project(project_id, current_user, session)
    scenario = validate_scenario_exists(scenario_id, project_id, session)
    results = pv_calculation(
        latitude=project.lat,
        longitude=project.lon,
        installed_power=scenario.installed_power,
        tilt=scenario.tilt,
        azimuth=scenario.azimuth,
        losses=0.13
    )

    existing_report = session.exec(select(Report).where(Report.scenario_id == scenario_id)).first()
    if existing_report:
        existing_report.energy_yield = results["energy_yield"]
        existing_report.monthly_yield = str(results["monthly_energy_yield"])
        existing_report.radiation = results["radiation"]
        existing_report.specific_yield = results["spec_yield"]
        existing_report.updated_at = datetime.now()
        session.commit()
        session.refresh(existing_report)
        return existing_report
    else:
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

@router.get("/projects/{project_id}/reports", response_model=list[Report])
def get_all_reports(current_user: CurrentUser, project_id: int, session: SessionDep):
    """
    Get all reports for a project."""
    validate_user_owns_project(project_id, current_user, session)
    reports = session.exec(select(Report)
                           .join(Scenario, Report.scenario_id == Scenario.id)
                           .where(Scenario.project_id == project_id)).all()
    return reports

@router.get("/projects/{project_id}/scenarios/{scenario_id}/report", response_model=list[Report])
def get_report_by_scenario(current_user: CurrentUser, project_id: int, scenario_id: int, session: SessionDep):
    """
    Get the report for a specific scenario.
    """
    validate_user_owns_project(project_id, current_user, session)
    validate_scenario_exists(scenario_id, project_id, session)
    reports = session.exec(select(Report).where(Report.scenario_id == scenario_id)).all()
    return reports