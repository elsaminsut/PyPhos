from backend.utils.auth import get_current_user
from backend.utils.database import SessionDep
from backend.utils.pv_calcs import pv_calculation
from backend.utils.utils import validate_user_owns_project, validate_scenario_belongs_to_project
from backend.models.scenarios import Scenario
from backend.models.reports import Report, ReportPublic
from backend.models.users import User
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from typing import Annotated
import json

router = APIRouter(
    tags=["Reports"]
)

CurrentUser = Annotated[User, Depends(get_current_user)]

@router.post("/projects/{project_id}/scenarios/{scenario_id}/calculate", response_model=ReportPublic)
def calculate_results(current_user: CurrentUser, project_id: int, scenario_id: int, session: SessionDep):
    """
    Trigger a yield calculation for a scenario.
    
    Calls the PVGIS API with the scenario's module specs and orientation,
    estimates system losses, and stores the results as a report.
    Note: If concurrent requests are made for the same scenario, the last one will update the report.
    """
    project = validate_user_owns_project(project_id, current_user, session)
    scenario = validate_scenario_belongs_to_project(scenario_id, project_id, session)
    
    # Call PVGIS calculation
    results = pv_calculation(
        latitude=project.lat,
        longitude=project.lon,
        installed_power=scenario.installed_power,
        tilt=scenario.tilt,
        azimuth=scenario.azimuth,
        losses=0.13
    )

    # Check if report already exists for this scenario
    existing_report = session.exec(select(Report).where(Report.scenario_id == scenario_id)).first()
    
    if existing_report:
        # Update existing report, preserving created_at
        existing_report.energy_yield = results["energy_yield"]
        existing_report.monthly_yield = results["monthly_energy_yield"]
        existing_report.radiation = results["radiation"]
        existing_report.monthly_radiation = results["monthly_radiation"]
        existing_report.specific_yield = results["spec_yield"]
        existing_report.perf_ratio = results["perf_ratio"]
        existing_report.updated_at = datetime.now()
        session.add(existing_report)
        session.commit()
        session.refresh(existing_report)
        return existing_report
    else:
        db_report = Report(
            scenario_id=scenario.id,
            energy_yield=results["energy_yield"],
            monthly_yield=results["monthly_energy_yield"],
            radiation=results["radiation"],
            monthly_radiation=results["monthly_radiation"],
            specific_yield=results["spec_yield"],
            perf_ratio=results["perf_ratio"]
        )
        try:
            session.add(db_report)
            session.commit()
            session.refresh(db_report)
            return db_report
        except Exception as e:
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create report"
            )

@router.get("/projects/{project_id}/reports", response_model=list[ReportPublic])
def get_all_reports(current_user: CurrentUser, project_id: int, session: SessionDep):
    """Get all reports for a project. Only returns reports for projects owned by the current user."""
    try:
        validate_user_owns_project(project_id, current_user, session)
        reports = session.exec(select(Report)
                               .join(Scenario, Report.scenario_id == Scenario.id)
                               .where(Scenario.project_id == project_id)).all()
        return reports
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving reports"
        )

@router.get("/projects/{project_id}/scenarios/{scenario_id}/report", response_model=ReportPublic)
def get_report_by_scenario(current_user: CurrentUser, project_id: int, scenario_id: int, session: SessionDep):
    """Get the report for a specific scenario. Returns a single report or 404 if not found."""
    try:
        validate_user_owns_project(project_id, current_user, session)
        validate_scenario_belongs_to_project(scenario_id, project_id, session)
        
        report = session.exec(select(Report).where(Report.scenario_id == scenario_id)).first()
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No report found for this scenario"
            )
        return report
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving report"
        )
    