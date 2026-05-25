import app.models
import app.utils.docs_metadata as docs_metadata
from app.routers import auth
from app.routers import projects
from app.routers import users
from app.routers import scenarios
from app.routers import reports
from app.utils.database import lifespan
from fastapi import FastAPI
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

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(scenarios.router)
app.include_router(reports.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
