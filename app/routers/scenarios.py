from app.utils.auth import get_current_user
from app.utils.database import SessionDep
from app.models.modules import Module, ModulePublic
from app.models.scenarios import Scenario, ScenarioPublic, ScenarioCreate, ScenarioUpdate
from app.models.projects import Project
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


@router.post("/projects/{project_id}/scenarios/", response_model=ScenarioPublic)
def create_scenario(current_user: CurrentUser, project_id: int, scenario: ScenarioCreate, session: SessionDep):
    validate_user_owns_project(project_id, current_user, session)
    module = session.get(Module, scenario.module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    installed_power = scenario.module_amount * module.nominal_power
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

@router.get("/projects/{project_id}/scenarios/", response_model=list[ScenarioPublic])
def read_scenarios(current_user: CurrentUser, project_id: int, session: SessionDep):
    validate_user_owns_project(project_id, current_user, session)
    scenarios = session.exec(select(Scenario).where(Scenario.project_id == project_id)).all()
    return scenarios

@router.get("/projects/{project_id}/scenarios/{scenario_id}", response_model=ScenarioPublic)
def read_scenario(current_user: CurrentUser, project_id: int, scenario_id: int, session: SessionDep) -> Scenario:
    validate_user_owns_project(project_id, current_user, session)
    scenario = validate_scenario_exists(scenario_id, project_id, session)
    return scenario

@router.patch("/projects/{project_id}/scenarios/{scenario_id}", response_model=ScenarioPublic)
def update_scenario(current_user: CurrentUser, project_id: int, scenario_id: int, scenario: ScenarioUpdate, session: SessionDep):
    validate_user_owns_project(project_id, current_user, session)
    scenario_db = validate_scenario_exists(scenario_id, project_id, session)
    scenario_data = scenario.model_dump(exclude_unset=True)
    scenario_data["updated_at"] = datetime.now()
    scenario_db.sqlmodel_update(scenario_data)
    session.add(scenario_db)
    session.commit()
    session.refresh(scenario_db)
    return scenario_db

@router.delete("/projects/{project_id}/scenarios/{scenario_id}")
def delete_scenario(current_user: CurrentUser, project_id: int, scenario_id: int, session: SessionDep):
    validate_user_owns_project(project_id, current_user, session)
    scenario = validate_scenario_exists(scenario_id, project_id, session)
    session.delete(scenario)
    session.commit()
    return {"ok": True}
