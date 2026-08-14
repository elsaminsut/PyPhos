# ---- Frontend build stage ----
FROM node:22-slim AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# ---- Backend + final image ----
FROM python:3.11-slim

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Playwright (used by reports.py to render PDF exports) needs its browser
# binary and OS-level dependencies installed explicitly.
RUN playwright install --with-deps chromium

# Backend source (imports are absolute as backend.xxx, so /app must stay the
# working directory both here and at runtime)
COPY backend/ backend/

# Built frontend, served directly by FastAPI (see STATIC_DIR in backend/app.py)
COPY --from=frontend-builder /app/frontend/dist ./static

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["./docker-entrypoint.sh"]
