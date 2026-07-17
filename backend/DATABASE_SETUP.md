# Database Setup & Seeding Guide

All commands below are run from the **repo root** (not from inside `backend/`) — the codebase's
`backend.xxx` absolute imports only resolve when `backend` is importable as a package, which
requires the repo root to be the current working directory.

After pulling changes or setting up a fresh database, follow these steps:

## 1. Apply Migrations

Run all pending alembic migrations:

```powershell
alembic -c backend/alembic.ini upgrade head
```

This will:
- Create all tables (users, projects, scenarios, modules, reports)
- Fix the ENUM duplicate issue (if it exists)
- Create all indexes and foreign keys

## 2. Seed Default Modules

After migrations, seed the database with the CEC PV modules database:

```powershell
python -m backend.utils.seed_modules
```

The script checks for duplicates and won't re-insert if they already exist.

## 3. Verify Setup

You can verify modules were added:

```powershell
# Open database shell
psql $DATABASE_URL

# List modules
SELECT * FROM modules;
```

## When Creating New Migrations

After making model changes:

```powershell
alembic -c backend/alembic.ini revision --autogenerate -m "description of changes"
alembic -c backend/alembic.ini upgrade head
python -m backend.utils.seed_modules  # Re-seed if needed
```

## Troubleshooting

### "ENUM already exists" error
Run the fix migration:
```powershell
alembic -c backend/alembic.ini upgrade head
```

### Modules not found
Make sure you ran the seed script:
```powershell
python -m backend.utils.seed_modules
```

### Database out of sync
Downgrade and upgrade:
```powershell
alembic -c backend/alembic.ini downgrade base
alembic -c backend/alembic.ini upgrade head
python -m backend.utils.seed_modules
```

### `ModuleNotFoundError: No module named 'backend'`
You ran a command with `backend/` as the working directory (e.g. `cd backend` first, or a Render
"Root Directory" set to `backend`). Every import in this codebase is the absolute form
`backend.xxx`, so it only resolves with the **repo root** as cwd. Re-run from the repo root using
the `-c backend/alembic.ini` / `python -m backend.xxx` forms shown above instead of `cd`-ing in.
