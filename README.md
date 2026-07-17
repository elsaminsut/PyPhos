# PyPhos ☀️

A web app for solar energy yield estimation. Create a project for a specific location, configure one or more scenarios with different configurations, and generate an energy production report ready to share.

## How it works

1. A user signs up and creates a **project** for a specified location
2. They add one or more **scenarios** to the project, each with a different module type, quantity, tilt, and azimuth
3. The app fetches irradiance data from [PVGIS](https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis_en) and calculates the estimated annual and monthly energy yield
4. A **report** is generated with the results, ready to share

## Structure

This is a monorepo with two independently deployed pieces:

| Directory | What | Docs |
|---|---|---|
| [`backend/`](backend/README.md) | FastAPI REST API - auth, data model, calculations | [backend/README.md](backend/README.md) |
| [`frontend/`](frontend/README.md) | React + Vite web client | [frontend/README.md](frontend/README.md) |

## Stack

- **Backend**: FastAPI, PostgreSQL, SQLModel, Alembic, JWT
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **External data**: PVGIS API (solar irradiance, European Commission)

## Getting started

Run both pieces locally. See each README for full details.

```bash
# 1. backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env  # edit with your DB credentials and secret key
alembic -c backend/alembic.ini upgrade head
python -m backend.utils.seed_modules  # required - scenarios need modules to reference
python -m uvicorn backend.app:app --reload
# -> http://localhost:8000 (docs at /docs)

# 2. frontend (separate terminal tab)
cd frontend
npm install
npm run dev
# -> http://localhost:5173, proxies /api to the backend above
```

For database setup details, see [backend/DATABASE_SETUP.md](backend/DATABASE_SETUP.md).