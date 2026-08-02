from backend.utils.auth import get_current_user, oauth2_scheme
from backend.utils.database import SessionDep
from backend.utils.pv_calcs import pv_calculation
from backend.utils.utils import validate_user_owns_project, validate_scenario_belongs_to_project, validate_project_is_demo
from backend.models.scenarios import Scenario
from backend.models.reports import Report, ReportBase, ReportPublic, CalculationRequest
from backend.models.users import User
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Response, status
from playwright.sync_api import sync_playwright
from sqlmodel import select
from starlette.concurrency import run_in_threadpool
from typing import Annotated
import json
import logging
import os

logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["Reports"]
)

CurrentUser = Annotated[User, Depends(get_current_user)]
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

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
        existing_report.chart_data = results["chart_data"]
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
            perf_ratio=results["perf_ratio"],
            chart_data=results["chart_data"]
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

@router.get("/projects/demo/{project_id}/scenarios/{scenario_id}/report", response_model=ReportPublic)
def get_demo_report_by_scenario(project_id: int, scenario_id: int, session: SessionDep):
    """Get the report for a specific scenario. Returns a single report or 404 if not found."""
    try:
        validate_project_is_demo(project_id, session)
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

def _render_report_pdf(url: str, token: str) -> bytes:
    """
    Runs on a worker thread via run_in_threadpool.

    Windows note: uvicorn's --reload / multi-worker supervisor forces a
    SelectorEventLoop on the request-handling loop, which can't spawn
    subprocesses (Chromium) on Windows. The sync API runs in this plain
    thread instead, which is unaffected by that loop's policy.
    """
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        # Seed localStorage before any page script runs, so the frontend's
        # AuthContext picks up the token on its very first render.
        context.add_init_script(
            f"window.localStorage.setItem('token', {json.dumps(token)});"
        )
        page = context.new_page()
        page.goto(url)
        page.wait_for_load_state("networkidle")
        pdf = page.pdf(format="A4")
        browser.close()
        return pdf


@router.get("/projects/{project_id}/scenarios/{scenario_id}/report/pdf")
async def export_pdf(current_user: CurrentUser, project_id: int, scenario_id: int, session: SessionDep,
                     token: Annotated[str, Depends(oauth2_scheme)]):
    """Export the report for a specific scenario as a PDF."""
    try:
        validate_user_owns_project(project_id, current_user, session)
        validate_scenario_belongs_to_project(scenario_id, project_id, session)

        pdf = await run_in_threadpool(
            _render_report_pdf, f"{FRONTEND_URL}/projects/{project_id}/scenarios/{scenario_id}/report", token
        )

        return Response(content=pdf, media_type="application/pdf",
                        headers={"Content-Disposition": f"attachment; filename=report.pdf"})
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to generate PDF report for scenario %s", scenario_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating PDF report"
        )

@router.post("/calculate", response_model=ReportBase)
def calculate_results_local(payload: CalculationRequest):
    """
    Stateless yield calculation for guest mode: no auth, no project/scenario
    lookup, nothing persisted. Takes system specs directly and hands back the
    result for the caller to store wherever it likes (localStorage for guests).
    """
    results = pv_calculation(
        latitude=payload.lat,
        longitude=payload.lon,
        installed_power=payload.installed_power,
        tilt=payload.tilt,
        azimuth=payload.azimuth,
        losses=0.13
    )

    return {
        "energy_yield": results["energy_yield"],
        "monthly_yield": results["monthly_energy_yield"],
        "radiation": results["radiation"],
        "monthly_radiation": results["monthly_radiation"],
        "specific_yield": results["spec_yield"],
        "perf_ratio": results["perf_ratio"],
        "chart_data": results["chart_data"],
    }