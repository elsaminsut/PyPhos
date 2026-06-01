from app.utils.database import SessionDep
from app.models.projects import Project
from app.models.scenarios import Scenario
from app.models.users import User
from fastapi import HTTPException
import re


def validate_username(username: str) -> str:
    """
    Validate username requirements:
    - Between 5 and 20 characters
    - Only alphanumeric characters and underscores
    """
    if len(username) < 5 or len(username) > 20:
        raise ValueError('Username must be between 5 and 20 characters')
    
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        raise ValueError('Username can only contain alphanumeric characters and underscores')
    
    return username


def validate_password(password: str) -> str:
    """
    Validate password requirements:
    - Between 8 and 16 characters
    - At least one uppercase letter
    - At least one number
    - At least one symbol
    """
    if len(password) < 8 or len(password) > 16:
        raise ValueError('Password must be between 8 and 16 characters')
    
    if not re.search(r'[A-Z]', password):
        raise ValueError('Password must contain at least one uppercase letter')
    
    if not re.search(r'[0-9]', password):
        raise ValueError('Password must contain at least one number')
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise ValueError('Password must contain at least one symbol (!@#$%^&*(),.?":{}|<>)')
    
    return password


def validate_name(name: str) -> str:
    """
    Validate name (project or scenario) requirements:
    - Between 5 and 20 characters
    - Only alphanumeric characters and underscores
    """
    if len(name) < 5 or len(name) > 50:
        raise ValueError('Name must be between 5 and 50 characters')
    
    return name


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


