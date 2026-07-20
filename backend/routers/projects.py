from backend.utils.auth import get_current_user
from backend.utils.database import SessionDep
from backend.utils.utils import validate_user_owns_project
from backend.models.projects import Project, ProjectListItem, ProjectPublic, ProjectCreate, ProjectUpdate
from backend.models.scenarios import Scenario
from backend.models.users import User
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import func, select
from typing import Annotated

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)

CurrentUser = Annotated[User, Depends(get_current_user)]

@router.post("", response_model=ProjectPublic)
def create_project(current_user: CurrentUser, project: ProjectCreate, session: SessionDep):
    """
    Create a new project for the current user.
    Takes a project name and a location the user picked from /locations/search results
    (city name, country code, and coordinates) and stores it directly.
    """
    try:
        db_project = Project(
            name=project.name,
            city_input=project.city_input,
            location=project.location,
            country_code=project.country_code,
            lat=project.lat,
            lon=project.lon,
            user_id=current_user.id
        )
        session.add(db_project)
        session.commit()
        session.refresh(db_project)
        return db_project
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create project"
        )

@router.get("", response_model=list[ProjectListItem])
def read_projects(current_user: CurrentUser, session: SessionDep):
    """Get a list of all projects owned by the current user, including each project's scenario count."""
    try:
        results = session.exec(
            select(Project, func.count(Scenario.id))
            .join(Scenario, Scenario.project_id == Project.id, isouter=True)
            .where(Project.user_id == current_user.id)
            .group_by(Project.id)
            .order_by(Project.created_at)
        ).all()

        return [
            ProjectListItem(**project.model_dump(), scenario_count=scenario_count)
            for project, scenario_count in results
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving projects"
        )

@router.get("/{project_id}", response_model=ProjectPublic)
def read_project(current_user: CurrentUser, project_id: int, session: SessionDep) -> Project:
    """Get a single project by ID, only if it exists and belongs to the current user."""
    try:
        project = validate_user_owns_project(project_id, current_user, session)
        return project
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving project"
        )

@router.patch("/{project_id}", response_model=ProjectPublic)
def update_project(current_user: CurrentUser, project_id: int, project: ProjectUpdate, session: SessionDep):
    """Update a project by ID, only if it exists and belongs to the current user. Updates the updated_at timestamp to the current time."""
    project_db = validate_user_owns_project(project_id, current_user, session)

    # location, country_code, lat and lon arrive together (enforced by ProjectUpdate),
    # already resolved from a /locations/search pick, so no re-geocoding is needed here.
    project_dict = project.model_dump(exclude_unset=True)
    project_dict["updated_at"] = datetime.now()
    project_db.sqlmodel_update(project_dict)
    
    try:
        session.add(project_db)
        session.commit()
        session.refresh(project_db)
        return project_db
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update project"
        )

@router.delete("/{project_id}")
def delete_project(current_user: CurrentUser, project_id: int, session: SessionDep):
    """Delete a project by ID, only if it exists and belongs to the current user. Cascades to all scenarios and reports."""
    try:
        project = validate_user_owns_project(project_id, current_user, session)
        session.delete(project)
        session.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete project"
        )
