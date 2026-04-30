from app.routers import users
from app.utils.database import lifespan
from app.routers import auth
from fastapi import FastAPI

app = FastAPI(lifespan=lifespan)

app.include_router(users.router)
app.include_router(auth.router)