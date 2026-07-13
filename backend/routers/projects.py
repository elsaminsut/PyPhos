from backend.utils.auth import get_current_user
from backend.utils.database import SessionDep
from backend.utils.utils import validate_user_owns_project
from backend.models.projects import Project, ProjectPublic, ProjectCreate, ProjectUpdate
from backend.models.users import User
from backend.utils.pv_calcs import get_location_data
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
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
    Takes a project name and a city where the project is located.
    Uses the city input to get location data (lat, lon) from the geocoding API and stores it in the database.
    """
    try:
        location_data = get_location_data(project.city_input)
    except HTTPException:
        # Re-raise HTTP exceptions from get_location_data
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving location data"
        )
    
    try:
        db_project = Project(
            name=project.name,
            city_input=project.city_input,
            location=location_data["name"],
            lat=location_data["latitude"],
            lon=location_data["longitude"],
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

@router.get("", response_model=list[ProjectPublic])
def read_projects(current_user: CurrentUser, session: SessionDep):
    """Get a list of all projects owned by the current user."""
    try:
        projects = session.exec(
            select(Project).where(Project.user_id == current_user.id).order_by(Project.created_at)
        ).all()
        return projects
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
    
    # If city_input is being updated, fetch new location data
    if project.city_input is not None:
        try:
            location_data = get_location_data(project.city_input)
            project.city_input = project.city_input  # Keep the city_input as is
            # Add location fields to update
            project_dict = project.model_dump(exclude_unset=True)
            project_dict["location"] = location_data["name"]
            project_dict["lat"] = location_data["latitude"]
            project_dict["lon"] = location_data["longitude"]
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error retrieving location data"
            )
    else:
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
