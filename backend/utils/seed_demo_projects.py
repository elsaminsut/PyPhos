"""
Seed script to save a few demo projects in the database.
"""
from backend.models.projects import Project
from backend.models.reports import Report
from backend.models.scenarios import Scenario
from backend.utils.database import engine
from backend.utils.pv_calcs import pv_calculation
from sqlmodel import Session, select


DEMO_PROJECTS = [
    {
        "name": "Villa del Sol",
        "location": "Seville",
        "country_code": "ES",
        "lat": 37.3891,
        "lon": -5.9845,
        "is_demo": True,
    },
    {
        "name": "Amsterdam Office Park",
        "location": "Amsterdam",
        "country_code": "NL",
        "lat": 52.3676,
        "lon": 4.9041,
        "is_demo": True,
    },
    {
        "name": "Alpine Chalet",
        "location": "Innsbruck",
        "country_code": "AT",
        "lat": 47.2692,
        "lon": 11.4041,
        "is_demo": True,
    },
]

DEMO_SCENARIOS = [
    # Villa del Sol - residential rooftop, high irradiance location
    {
        "name": "South roof",
        "project_index": 0,  # index into DEMO_PROJECTS
        "module_amount": 20,
        "tilt": 30,
        "azimuth": 0,
        "module_id": 16651, # ONYX G/G M06666
        "installed_power": 5873.0,
        "losses": 0.13,
    },
    {
        "name": "West facing facade",
        "project_index": 0,
        "module_amount": 24,
        "tilt": 15,
        "azimuth": 90,
        "module_id": 16651,
        "installed_power": 7047.6,
        "losses": 0.13,
    },

    # Amsterdam Office Park - commercial flat roof, northern Europe
    {
        "name": "Optimal tilt",
        "project_index": 1,
        "module_amount": 120,
        "tilt": 35,
        "azimuth": 0,
        "module_id": 14111, # Jinko JKM295M-60-V
        "installed_power": 35380.8,
        "losses": 0.13,
    },
    {
        "name": "Low tilt - reduced shading",
        "project_index": 1,
        "module_amount": 160,
        "tilt": 10,
        "azimuth": 0,
        "module_id": 14111,
        "installed_power": 47174.4,
        "losses": 0.13,
    },
    {
        "name": "Facade BIPV",
        "project_index": 1,
        "module_amount": 80,
        "tilt": 90,
        "azimuth": 0,
        "module_id": 14111,
        "installed_power": 23587.2,
        "losses": 0.13,
    },

    # Alpine Chalet - mountain location, steep roof
    {
        "name": "South steep roof",
        "project_index": 2,
        "module_amount": 12,
        "tilt": 45,
        "azimuth": 0,
        "module_id": 16106, # Meyer Burger Black 380W
        "installed_power": 4584.0,
        "losses": 0.13,
    },
]

def seed_demos():
    with Session(engine) as session:
        project_ids = []

        for p in DEMO_PROJECTS:
            existing = session.exec(
                select(Project).where(Project.name == p["name"], Project.is_demo == True)
            ).first()

            if existing:
                print(f"Demo project '{p['name']}' already exists - skipping")
                project_ids.append(existing.id)
                continue

            project = Project(**p)
            session.add(project)
            session.flush()  # flush to get the generated id
            project_ids.append(project.id)

        for s in DEMO_SCENARIOS:
            idx = s.pop("project_index")
            project_id = project_ids[idx]

            scenario = session.exec(
                select(Scenario).where(Scenario.project_id == project_id, Scenario.name == s["name"])
            ).first()

            if not scenario:
                scenario = Scenario(**s, project_id=project_id)
                session.add(scenario)
                session.flush()

            existing_report = session.exec(select(Report).where(Report.scenario_id == scenario.id)).first()
            if existing_report:
                print(f"Report for scenario '{scenario.name}' already exists - skipping")
                continue

            project_row = session.get(Project, project_id)
            print(f"Calculating report for scenario '{scenario.name}'...")
            results = pv_calculation(
                latitude=project_row.lat,
                longitude=project_row.lon,
                installed_power=scenario.installed_power,
                tilt=scenario.tilt,
                azimuth=scenario.azimuth,
                losses=scenario.losses,
            )

            session.add(Report(
                scenario_id=scenario.id,
                energy_yield=results["energy_yield"],
                monthly_yield=results["monthly_energy_yield"],
                radiation=results["radiation"],
                monthly_radiation=results["monthly_radiation"],
                specific_yield=results["spec_yield"],
                perf_ratio=results["perf_ratio"],
                chart_data=results["chart_data"],
            ))

        session.commit()

if __name__ == "__main__":
    seed_demos()
