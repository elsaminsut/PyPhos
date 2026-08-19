import backend.models
import backend.utils.docs_metadata as docs_metadata
from backend.routers import auth
from backend.routers import locations
from backend.routers import projects
from backend.routers import users
from backend.routers import scenarios
from backend.routers import reports
from backend.routers import modules
from backend.utils.database import lifespan, SessionDep
from backend.utils.pv_calcs import client as pvgis_client
from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pathlib import Path
from sqlmodel import text
import logging
import requests
import uvicorn

logger = logging.getLogger(__name__)

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

@app.get("/api", tags=["General"])
def index():
    return docs_metadata.index_response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CSP is skipped for the docs routes: Swagger UI loads its JS/CSS from a CDN
# and bootstraps itself with an inline <script>, both of which a strict CSP
# would block.
DOCS_PATHS = {"/docs", "/redoc", "/openapi.json"}

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"

    if request.url.path not in DOCS_PATHS:
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https://*.basemaps.cartocdn.com; "
            "font-src 'self'; "
            "connect-src 'self'; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "frame-ancestors 'none'"
        )

    return response

@app.get("/api/health", tags=["General"])
def health_check(response: Response, session: SessionDep):
    checks = {}
    healthy = True

    try:
        session.exec(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception:
        logger.exception("Health check: database is unreachable")
        checks["database"] = "unreachable"
        healthy = False

    response.status_code = status.HTTP_200_OK if healthy else status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ok" if healthy else "error",
        "checks": checks,
    }

@app.get("/api/health/pvgis", tags=["General"])
def health_check_pvgis(response: Response):
    """
    Separate from /api/health on purpose: PVGIS is a third-party dependency
    with its own latency, so a slow or briefly-down PVGIS shouldn't flip the
    main liveness/readiness check (used by things like container restarts)
    to unhealthy. Poll this one independently if you care about it.
    """
    checks = {}
    healthy = True

    try:
        # HEAD request against the API root: cheap, network-only reachability
        # check, deliberately not a real calculation call (which does real
        # server-side work on PVGIS's end and shouldn't be triggered by a
        # health poll).
        requests.head(pvgis_client.BASE_URL, timeout=5)
        checks["pvgis"] = "ok"
    except requests.exceptions.RequestException:
        logger.exception("Health check: PVGIS is unreachable")
        checks["pvgis"] = "unreachable"
        healthy = False

    response.status_code = status.HTTP_200_OK if healthy else status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ok" if healthy else "error",
        "checks": checks,
    }


app.include_router(users.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(locations.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(scenarios.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(modules.router, prefix="/api")

# Serves the built frontend when present (baked into the Docker image by the
# frontend build stage). Absent in local dev, where Vite's own dev server
# handles the frontend and proxies /api to this backend instead.
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
if STATIC_DIR.is_dir(): # only runs in Docker image
    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend(full_path: str):
        candidate = (STATIC_DIR / full_path).resolve()
        if full_path and candidate.is_file() and candidate.is_relative_to(STATIC_DIR):
            return FileResponse(candidate)
        return FileResponse(STATIC_DIR / "index.html")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
