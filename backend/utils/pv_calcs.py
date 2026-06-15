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
    """
    Get location data (latitude, longitude) from geocoding API.
    Retries up to 3 times with exponential backoff on failure.
    """
    max_retries = 3
    for attempt in range(max_retries):
        try:
            location_response = requests.get(
                API_URL.replace("CITY", city_name),
                headers={"X-Api-Key": LOCATION_API_KEY},
                timeout=5
            )
            location_response.raise_for_status()
            
            data = location_response.json()
            if not data or len(data) == 0:
                raise ValueError(f"No location found for city: {city_name}")
            
            location_data = data[0]
            return {
                "name": location_data.get("name", city_name),
                "latitude": location_data.get("latitude"),
                "longitude": location_data.get("longitude")
            }
        except requests.exceptions.Timeout:
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=504,
                    detail="Location service timeout. Please try again."
                )
            time.sleep(2 ** attempt)
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=503,
                    detail="Location service unavailable. Please try again later."
                )
            time.sleep(2 ** attempt)
        except (ValueError, KeyError) as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid location: {city_name}. Please check the spelling."
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail="Error processing location data."
            )


def pv_calculation(latitude: float, longitude: float, installed_power: float, tilt: float, azimuth: float, losses: float) -> dict:
    """
     Call the PVGIS API to calculate energy yield based on location, system specs and losses.
     Retries up to 3 times with exponential backoff on failure.
    """
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

    if result:
        radiation = result["outputs"]["totals"]["fixed"]["H(i)_y"]
        energy_yield = round(result["outputs"]["totals"]["fixed"]["E_y"] / 1000, 2) # convert to kWh
        monthly_results = result["outputs"]["monthly"]["fixed"]
        monthly_energy_yield = [round(monthly_results[i]["E_m"] / 1000, 2) for i in range(len(monthly_results))] # convert to kWh
        spec_yield = round(energy_yield * 1000 / installed_power, 2)

    return {"radiation": radiation, "energy_yield": energy_yield, 
            "monthly_energy_yield": monthly_energy_yield, "spec_yield": spec_yield}

