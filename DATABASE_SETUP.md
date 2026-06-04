# Database Setup & Seeding Guide

After pulling changes or setting up a fresh database, follow these steps:

## 1. Apply Migrations

Run all pending alembic migrations:

```powershell
alembic upgrade head
```

This will:
- Create all tables (users, projects, scenarios, modules, reports)
- Fix the ENUM duplicate issue (if it exists)
- Create all indexes and foreign keys

## 2. Seed Default Modules

After migrations, seed the database with default PV modules:

```powershell
python seed_modules.py
```

This will insert 3 standard modules:
- SunPower SPR-MAX3-400 (Mono-c-Si)
- Canadian Solar CS6R-370MS (Mono-c-Si)
- First Solar FS-6420A (Thin Film)

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
alembic revision --autogenerate -m "description of changes"
alembic upgrade head
python seed_modules.py  # Re-seed if needed
```

## Troubleshooting

### "ENUM already exists" error
Run the fix migration:
```powershell
alembic upgrade head
```

### Modules not found
Make sure you ran the seed script:
```powershell
python seed_modules.py
```

### Database out of sync
Downgrade and upgrade:
```powershell
alembic downgrade base
alembic upgrade head
python seed_modules.py
```
