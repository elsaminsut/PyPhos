from dotenv import load_dotenv
from fastapi import HTTPException
from pvgis_api import PVGISClient
import requests
import time

client = PVGISClient()

load_dotenv()
API_URL = "https://geocoding-api.open-meteo.com/v1/search?name=CITY&count=1&language=en&format=json"
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

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
                timeout=5
            )
            location_response.raise_for_status()

            data = location_response.json()
            results = data.get("results") or []
            if not results:
                raise ValueError(f"No location found for city: {city_name}")

            location_data = results[0]
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
        monthly_results = result["outputs"]["monthly"]["fixed"]
        monthly_radiation = [round(monthly_results[i]["H(i)_m"], 1) for i in range(len(monthly_results))]
        energy_yield = round(result["outputs"]["totals"]["fixed"]["E_y"] / 1000, 1) # convert to kWh
        monthly_energy_yield = [round(monthly_results[i]["E_m"] / 1000, 2) for i in range(len(monthly_results))] # convert to kWh
        spec_yield = round(energy_yield / (installed_power / 1000), 2)
        perf_ratio = round(energy_yield / (radiation * (installed_power / 1000)) * 100, 1)
        chart_data = [
            {"month": MONTHS[i], "yield": monthly_energy_yield[i], "radiation": monthly_radiation[i]}
            for i in range(len(monthly_results))
        ]

    return {"radiation": radiation, "monthly_radiation": monthly_radiation, "energy_yield": energy_yield, 
            "monthly_energy_yield": monthly_energy_yield, "spec_yield": spec_yield, "perf_ratio": perf_ratio, "chart_data": chart_data}

# print(pv_calculation(get_location_data("Berlin")["latitude"], get_location_data("Berlin")["longitude"], 1000, 90, 0, 0.13))
