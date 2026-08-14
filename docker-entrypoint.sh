#!/bin/sh
set -e

echo "Applying database migrations..."
alembic -c backend/alembic.ini upgrade head

echo "Seeding modules..."
python -m backend.utils.seed_modules

echo "Seeding demo projects..."
python -m backend.utils.seed_demo_projects

echo "Starting server..."
exec python -m uvicorn backend.app:app --host 0.0.0.0 --port 8000
