# PyPhos ☀️

A backend REST API for solar energy yield estimation which generates energy production reports.

Built for anyone who needs to quickly estimate how much energy a solar installation will produce and generate a report ready to be shared

## How it works

1. A user creates a **project** for a specified location
2. They add one or more **scenarios** to the project, each with a different module type, quantity, and orientation
3. The API fetches irradiance data from [PVGIS]([https://re.jrc.ec.europa.eu/pvg_tools/en/](https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis_en)) and calculates the estimated annual and monthly energy yield
4. A **report** is generated with the results, ready to share

## Stack

- **FastAPI**: REST API framework
- **PostgreSQL**: database
- **SQLModel**: ORM and data validation
- **Alembic**: database migrations
- **JWT**: authentication
- **PVGIS API**: solar irradiance data (European Commission)

## Data model

| Entity | Description |
|---|---|
| `User` | Registered user account |
| `Project` | Prospective project with location |
| `Scenario` | Specific configuration within a project: module type, quantity, tilt, azimuth |
| `Module` | PV module database seeded from CEC data |
| `Report` | Calculation output: annual yield, monthly breakdown, radiation |

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/login` | Login and receive JWT |
| `POST` | `/register  ` | Register a new user |
| `GET`/`POST` | `/projects/` | List or create projects |
| `GET`/`PATCH`/`DELETE` | `/projects/{project_id}` | Read, update or delete a project |
| `GET`/`POST` | `/projects/{project_id}/scenarios/` | List or create scenarios |
| `GET`/`PATCH`/`DELETE` | `/projects/{project_id}/scenarios/{scenario_id}` | Read, update or delete a scenario |
| `POST` | `/projects/{project_id}/scenarios/{scenario_id}/calculate` | Run yield calculation |
| `GET` | `/projects/{project_id}/reports` | Fetch all calculation reports |
| `GET` | `/projects/{project_id}/scenarios/{scenario_id}/report` | Fetch calculation report for specific scenario |

## Setup

**Requirements:** Python 3.11+, PostgreSQL

```bash
# clone and install
git clone https://github.com/elsaminsut/pyphos.git
cd pyphos
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r backend/requirements.txt

# configure environment
cp backend/.env.example backend/.env
# edit backend/.env with your database credentials and secret key

# run migrations (always from the repo root — see DATABASE_SETUP.md)
alembic -c backend/alembic.ini upgrade head

# start the server
python -m uvicorn backend.app:app --reload
```

All commands run from the repo root, not from inside `backend/` — every import in this codebase
is the absolute form `backend.xxx`, which only resolves when `backend` is importable as a package
(i.e. the repo root is the current working directory).

The API will be available at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`


## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret |
| `ALGORITHM` | JWT algorithm (e.g. `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry time |
| `API_KEY` | Ninja geocoding API key |
