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
All endpoints except `/register` and `/login` require a Bearer JWT token.
Obtain a token via `POST /login`.
    """