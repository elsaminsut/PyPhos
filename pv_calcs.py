from dotenv import load_dotenv
import json
import os
from pvgis_api import PVGISClient
import requests


client = PVGISClient()

# Load environment variables from .env file
load_dotenv()

API_URL = "https://api.api-ninjas.com/v1/geocoding?city=CITY"
LOCATION_API_KEY = os.getenv("API_KEY")

# inputs
city_name = "Berlin"
nominal_power = 140 # Wp
module_amount = 10
azimuth = 0
tilt = 90

# calculation 
location_response = requests.get(API_URL.replace("CITY", city_name), headers={"X-Api-Key": LOCATION_API_KEY})
location_name = location_response.json()[0]["name"]
latitude = location_response.json()[0]["latitude"]
longitude = location_response.json()[0]["longitude"]

installed_power = nominal_power * module_amount / 1000 # kWp

result = client.pv_calculation(
    lat=latitude, lon=longitude,
    peakpower=installed_power,
    loss=14,
    angle=tilt,
    aspect=azimuth
)


# results
radiation = result["outputs"]["totals"]["fixed"]["H(i)_y"]
energy_yield = result["outputs"]["totals"]["fixed"]["E_y"]
monthly_results = result["outputs"]["monthly"]["fixed"]
monthly_energy_yield = [monthly_results[i]["E_m"] for i in range(len(monthly_results))]

spec_yield = round(energy_yield / installed_power, 2)

print("Location: ", location_name)
print("Latitude: ", latitude)
print("Longitude: ", longitude)
print("---")
print(f"Energy yield: {energy_yield} (kWh/year)")
print(f"Monthly energy yield: {monthly_energy_yield} (kWh/month)")
print(f"Radiation: {radiation} (kWh/m²/year)")
print(f"Specific yield: {spec_yield} (kWh/kWp/year)")