"""
Seed script for default PV modules.
Run after alembic migrations: python seed_modules.py
"""
from app.utils.database import engine
from app.models.modules import Module, PVTech
from sqlmodel import Session, select


MODULES_DATA = [
    {
        "manufacturer": "SunPower",
        "model": "SPR-MAX3-400",
        "technology": PVTech.mono_c_Si,
        "area": 1.73,
        "nominal_power": 400,
        "temp_coeff_pmax": -0.29,
        "noct": 45.0,
        "ptc": 379.4,
    },
    {
        "manufacturer": "Canadian Solar",
        "model": "CS6R-370MS",
        "technology": PVTech.mono_c_Si,
        "area": 1.87,
        "nominal_power": 370,
        "temp_coeff_pmax": -0.35,
        "noct": 43.0,
        "ptc": 351.2,
    },
    {
        "manufacturer": "First Solar",
        "model": "FS-6420A",
        "technology": PVTech.thin_film,
        "area": 2.00,
        "nominal_power": 420,
        "temp_coeff_pmax": -0.27,
        "noct": 47.0,
        "ptc": None,
    },
]


def seed_modules():
    """Seed the database with default PV modules."""
    with Session(engine) as session:
        for module_data in MODULES_DATA:
            # Check if module already exists
            existing = session.exec(
                select(Module).where(
                    (Module.manufacturer == module_data["manufacturer"])
                    & (Module.model == module_data["model"])
                )
            ).first()
            
            if existing:
                print(f"Module {module_data['manufacturer']} {module_data['model']} already exists, skipping...")
                continue
            
            module = Module(**module_data)
            session.add(module)
            print(f"Added module: {module_data['manufacturer']} {module_data['model']}")
        
        session.commit()
        print("✓ Seeding complete!")


if __name__ == "__main__":
    seed_modules()
