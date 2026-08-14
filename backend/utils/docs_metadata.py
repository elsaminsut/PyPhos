tags_metadata = [
    {
        "name": "General",
        "description": "General endpoints and information about the API."
    },
    {
        "name": "Authentication",
        "description": "Register and obtain JWT tokens."
    },
    {
        "name": "Users",
        "description": "Manage user accounts."
    },
    {
        "name": "Locations",
        "description": "Search for cities to resolve a project's location (coordinates and country)."
    },
    {
        "name": "Projects",
        "description": "Create and manage projects. Each project has a location and belongs to a user."
    },
    {
        "name": "Scenarios",
        "description": "Add different configurations to a project for later comparison. Each one has module type, quantity, tilt, and azimuth."
    },
    {
        "name": "Reports",
        "description": "Trigger yield calculations via PVGIS and retrieve results."
    },
]

description="""
A REST API for solar energy yield estimation.

## How it works
Create a project for a location, add scenarios with different module configurations,
trigger a yield calculation, and retrieve the results as a report.

## Authentication
Most endpoints require a Bearer JWT token. A few are public to support guest access: `/api/register` and `/api/login`, location search, PV modules, the stateless guest yield calculation (`/api/calculate`), and the read-only demo project routes (`/api/projects/demo/...`).
Obtain a token via `POST /api/login`.
    """

index_response = {
        "name": "PyPhos API",
        "version": "0.2.0",
        "description": "A FastAPI-based REST API for solar photovoltaic system calculations and project management",
        "documentation": {
            "swagger_ui": "/docs",
            "openapi_spec": "/openapi.json"
        },
        "endpoints": {
            "auth": {
                "register": "/api/register",
                "login": "/api/login"
            },
            "projects": {
                "create": "/api/projects/",
                "list": "/api/projects/",
                "get": "/api/projects/{project_id}",
                "update": "/api/projects/{project_id}",
                "delete": "/api/projects/{project_id}",
            },
            "scenarios": {
                "create": "/api/projects/{project_id}/scenarios/",
                "list": "/api/projects/{project_id}/scenarios/",
                "get": "/api/projects/{project_id}/scenarios/{scenario_id}",
                "update": "/api/projects/{project_id}/scenarios/{scenario_id}",
                "delete": "/api/projects/{project_id}/scenarios/{scenario_id}",
            },
            "reports": {
                "create": "/api/projects/{project_id}/scenarios/{scenario_id}/calculate",
                "list": "/api/projects/{project_id}/reports",
                "get": "/api/projects/{project_id}/scenarios/{scenario_id}/report",
            },
            "users": {
                "create": "/api/users/",
                "list": "/api/users/",
                "update": "/api/users/{user_id}",
                "delete": "/api/users/{user_id}"
            }
        }
    }