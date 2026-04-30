from app.utils.database import lifespan
from routers import auth, users
from fastapi import FastAPI

app = FastAPI(lifespan=lifespan)

app.include_router(users.router)
app.include_router(auth.router)