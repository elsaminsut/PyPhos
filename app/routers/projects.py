from app.utils.auth import get_current_user
from app.utils.database import SessionDep
from app.models.projects import Project, ProjectPublic, ProjectCreate, ProjectUpdate
from app.models.users import User
from app.utils.pv_calcs import get_location_data
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated

router = APIRouter()

CurrentUser = Annotated[User, Depends(get_current_user)]

def validate_project_exists(project_id: int, session: SessionDep) -> Project:
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def validate_project_ownership(project: Project, user: User):
    if project.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")


@router.post("/projects/", response_model=ProjectPublic)
def create_project(current_user: CurrentUser, project: ProjectCreate, session: SessionDep):
    """
    Create a new project for the current user.
    Takes a project name and a city where the project is located.
    Uses the city input to get location data (lat, lon) from the PVGIS API and stores it in the database."""
    location, lat, lon = get_location_data(project.city_input).values()
    db_project = Project(
            name=project.name,
            city_input=project.city_input,
            location=location,
            lat=lat,
            lon=lon,
            user_id=current_user.id
        )
    session.add(db_project)
    session.commit()
    session.refresh(db_project)
    return db_project

@router.get("/projects/", response_model=list[ProjectPublic])
def read_projects(current_user: CurrentUser):
    """Get a list of all projects owned by the current user."""
    return current_user.projects

@router.get("/projects/{project_id}", response_model=ProjectPublic)
def read_project(current_user: CurrentUser, project_id: int, session: SessionDep) -> Project:
    """Get a single project by ID, only if it exists and belongs to the current user."""
    project = validate_project_exists(project_id, session)
    validate_project_ownership(project, current_user)
    return project

@router.patch("/projects/{project_id}", response_model=ProjectPublic)
def update_project(current_user: CurrentUser, project_id: int, project: ProjectUpdate, session: SessionDep):
    """Update a project by ID, only if it exists and belongs to the current user. Updates the updated_at timestamp to the current time."""
    project_db = validate_project_exists(project_id, session)
    validate_project_ownership(project_db, current_user)
    project_data = project.model_dump(exclude_unset=True)
    project_data["updated_at"] = datetime.now()
    project_db.sqlmodel_update(project_data)
    session.add(project_db)
    session.commit()
    session.refresh(project_db)
    return project_db

@router.delete("/projects/{project_id}")
def delete_project(current_user: CurrentUser, project_id: int, session: SessionDep):
    """Delete a project by ID, only if it exists and belongs to the current user."""
    project = validate_project_exists(project_id, session)
    validate_project_ownership(project, current_user)
    session.delete(project)
    session.commit()
    return {"ok": True}
