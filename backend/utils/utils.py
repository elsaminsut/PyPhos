from backend.utils.database import SessionDep
from backend.models.projects import Project
from backend.models.scenarios import Scenario
from backend.models.users import User
from fastapi import HTTPException


def validate_user_owns_project(project_id: int, user: User, session: SessionDep) -> Project:
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.is_demo:
        raise HTTPException(status_code=400, detail="Demo projects are read-only")
    if project.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return project


def validate_project_is_demo(project_id: int, session: SessionDep) -> Project:
    project = session.get(Project, project_id)
    if not project or not project.is_demo:
        raise HTTPException(status_code=404, detail="Demo project not found")
    return project


def validate_scenario_belongs_to_project(scenario_id: int, project_id: int, session: SessionDep) -> Scenario:
    scenario = session.get(Scenario, scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    if scenario.project_id != project_id:
        raise HTTPException(status_code=400, detail="Scenario does not belong to project")
    return scenario

