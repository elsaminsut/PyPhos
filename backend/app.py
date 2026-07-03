import backend.models
import backend.utils.docs_metadata as docs_metadata
from backend.routers import auth
from backend.routers import projects
from backend.routers import users
from backend.routers import scenarios
from backend.routers import reports
from backend.routers import modules
from backend.utils.database import lifespan
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    lifespan=lifespan,
    title="PyPhos",
    description=docs_metadata.description,
    version="0.2.0",
    contact={
        "name": "PyPhos",
        "url": "https://github.com/elsaminsut/pyphos"
    },
    openapi_tags=docs_metadata.tags_metadata
)

@app.get("/", tags=["General"])
def index():
    return docs_metadata.index_response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(users.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(scenarios.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(modules.router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
