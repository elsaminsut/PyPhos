from dotenv import load_dotenv
from fastapi import HTTPException
import os
from pvgis_api import PVGISClient
import requests
import time

client = PVGISClient()

load_dotenv()
API_URL = "https://api.api-ninjas.com/v1/geocoding?city=CITY"
LOCATION_API_KEY = os.getenv("API_KEY")
# modules = pd.read_csv("modules/CEC Modules_noheaders.csv")

# calculation 
def get_location_data(city_name: str) -> dict:
    location_response = requests.get(API_URL.replace("CITY", city_name), headers={"X-Api-Key": LOCATION_API_KEY})
    location_name = location_response.json()[0]["name"]
    latitude = location_response.json()[0]["latitude"]
    longitude = location_response.json()[0]["longitude"]
    return {"name": location_name, "latitude": latitude, "longitude": longitude}


def pv_calculation(latitude: float, longitude: float, installed_power: float, tilt: float, azimuth: float, losses: float) -> dict:
    max_retries = 3
    for attempt in range(max_retries):
        try:
            result = client.pv_calculation(
                lat=latitude, lon=longitude,
                peakpower=installed_power,
                loss=losses,
                angle=tilt,
                aspect=azimuth
            )
            break
        except Exception as e:
            if attempt == max_retries - 1:
                raise HTTPException(status_code=503, detail="PVGIS unavailable")
            time.sleep(2 ** attempt)

    radiation = result["outputs"]["totals"]["fixed"]["H(i)_y"]
    energy_yield = round(result["outputs"]["totals"]["fixed"]["E_y"] / 1000, 2) # convert to kWh
    monthly_results = result["outputs"]["monthly"]["fixed"]
    monthly_energy_yield = [round(monthly_results[i]["E_m"] / 1000, 2) for i in range(len(monthly_results))] # convert to kWh
    spec_yield = round(energy_yield * 1000 / installed_power, 2)

    return {"radiation": radiation, "energy_yield": energy_yield, 
            "monthly_energy_yield": monthly_energy_yield, "spec_yield": spec_yield}