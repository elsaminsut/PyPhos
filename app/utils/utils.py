from app.utils.database import SessionDep
from app.models.projects import Project
from app.models.scenarios import Scenario
from app.models.users import User
from fastapi import HTTPException


def validate_user_owns_project(project_id: int, user: User, session: SessionDep) -> Project:
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return project


def validate_scenario_belongs_to_project(scenario_id: int, project_id: int, session: SessionDep) -> Scenario:
    scenario = session.get(Scenario, scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    if scenario.project_id != project_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return scenario