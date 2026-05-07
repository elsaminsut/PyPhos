import app.models
from app.routers import auth
from app.routers import projects
from app.routers import users
from app.routers import scenarios
from app.routers import reports
from app.utils.database import lifespan
from fastapi import FastAPI

app = FastAPI(lifespan=lifespan)

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(scenarios.router)
app.include_router(reports.router)