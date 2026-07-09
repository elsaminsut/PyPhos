from backend.utils.auth import get_current_user
from backend.utils.database import SessionDep
from backend.utils.utils import validate_user_owns_project, validate_scenario_belongs_to_project
from backend.models.modules import Module
from backend.models.scenarios import Scenario, ScenarioPublic, ScenarioCreate, ScenarioUpdate
from backend.models.users import User
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from typing import Annotated

router = APIRouter(
    tags=["Scenarios"]
)

CurrentUser = Annotated[User, Depends(get_current_user)]

@router.post("/projects/{project_id}/scenarios", response_model=ScenarioPublic)
def create_scenario(current_user: CurrentUser, project_id: int, scenario: ScenarioCreate, session: SessionDep):
    """
    Create a new scenario for a project, only if the project exists and belongs to the current user.
    Takes a scenario name, a module, the amount of modules, and the system's tilt and azimuth.
    Calculates the installed power based on the module amount and nominal power of the selected module.
    """
    try:
        validate_user_owns_project(project_id, current_user, session)
        
        # Validate that module exists
        module = session.get(Module, scenario.module_id)
        if not module:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
        
        # Calculate installed power
        installed_power = round(scenario.module_amount * module.nominal_power, 2)
        
        db_scenario = Scenario(
            name=scenario.name,
            project_id=project_id,
            module_id=scenario.module_id,
            module_amount=scenario.module_amount,
            tilt=scenario.tilt,
            azimuth=scenario.azimuth,
            installed_power=installed_power,
            losses=0.13 # default losses, to be updated later
        )
        session.add(db_scenario)
        session.commit()
        session.refresh(db_scenario)
        return db_scenario
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create scenario"
        )

@router.get("/projects/{project_id}/scenarios", response_model=list[ScenarioPublic])
def read_scenarios(current_user: CurrentUser, project_id: int, session: SessionDep):
    """Get a list of all scenarios for a project, only if the project exists and belongs to the current user."""
    try:
        validate_user_owns_project(project_id, current_user, session)
        scenarios = session.exec(select(Scenario).where(Scenario.project_id == project_id)).all()
        return scenarios
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving scenarios"
        )

@router.get("/projects/{project_id}/scenarios/{scenario_id}", response_model=ScenarioPublic)
def read_scenario(current_user: CurrentUser, project_id: int, scenario_id: int, session: SessionDep) -> Scenario:
    """Get a single scenario by ID, only if the project exists and belongs to the current user."""
    try:
        validate_user_owns_project(project_id, current_user, session)
        scenario = validate_scenario_belongs_to_project(scenario_id, project_id, session)
        session.refresh(scenario, ["module"])  # explicitly load the relationship
        return scenario
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving scenario"
        )

@router.patch("/projects/{project_id}/scenarios/{scenario_id}", response_model=ScenarioPublic)
def update_scenario(current_user: CurrentUser, project_id: int, scenario_id: int, scenario: ScenarioUpdate, session: SessionDep):
    """Update a scenario by ID, only if the project exists and belongs to the current user. Updates the updated_at timestamp to the current time."""
    try:
        validate_user_owns_project(project_id, current_user, session)
        scenario_db = validate_scenario_belongs_to_project(scenario_id, project_id, session)
        
        # If module_id is being updated, validate that the module exists
        if scenario.module_id is not None:
            module = session.get(Module, scenario.module_id)
            if not module:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
        
        scenario_data = scenario.model_dump(exclude_unset=True)
        scenario_data["updated_at"] = datetime.now()
        scenario_db.sqlmodel_update(scenario_data)
        session.add(scenario_db)
        session.commit()
        session.refresh(scenario_db)
        return scenario_db
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update scenario"
        )

@router.delete("/projects/{project_id}/scenarios/{scenario_id}")
def delete_scenario(current_user: CurrentUser, project_id: int, scenario_id: int, session: SessionDep):
    """Delete a scenario by ID, only if the project exists and belongs to the current user. Cascades to reports."""
    try:
        validate_user_owns_project(project_id, current_user, session)
        scenario = validate_scenario_belongs_to_project(scenario_id, project_id, session)
        session.delete(scenario)
        session.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete scenario"
        )
