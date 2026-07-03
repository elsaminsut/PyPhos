"""
Seed script to import PV modules from CEC module database.
Run after alembic migrations: python seed_modules.py
"""
from backend.utils.database import engine
from backend.models.modules import Module, PVTech
import pandas as pd
from sqlmodel import Session, select

df = pd.read_csv("utils/modules/CEC_modules.csv", skiprows=[1, 2]) # skip units and mapping rows, keep header at [0]
tech_lookup = {t.value: t for t in PVTech}

def seed_modules():
    """Seed the database with CEC modules."""
    with Session(engine) as session:
        for _, row in df.iterrows():
            tech = tech_lookup.get(row["Technology"])
            if tech is None:
                print(f"Unknown technology: {row['Technology']} — skipping {row['Name']}")
                continue

            exists = session.exec(
                select(Module).where(Module.model == row["Name"])
            ).first()
            if not exists:
                module = Module(
                    manufacturer=row["Manufacturer"],
                    model=row["Name"],
                    technology=tech,
                    area=row["A_c"],
                    nominal_power=row["STC"],
                    temp_coeff_pmax=row["gamma_pmp"],
                    noct=row["T_NOCT"],
                    ptc=row["PTC"]
                )
                session.add(module) 

        session.commit()

if __name__ == "__main__":
    seed_modules()
