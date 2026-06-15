import pytest
import backend.utils.pv_calcs as pv_calcs

def test_location_smoke():
    location = pv_calcs.get_location_data("Berlin")
    assert location["name"] == "Berlin"
    assert location["latitude"] - 52.510885 < 0.00001
    assert location["longitude"] - 13.3989367 < 0.00001

def test_location_name_different_cases():
    city_name_lower = "berlin"
    location = pv_calcs.get_location_data(city_name_lower)
    assert location["name"] == "Berlin"

    city_name_upper = "BERLIN"
    location = pv_calcs.get_location_data(city_name_upper)
    assert location["name"] == "Berlin"

    city_name_mixed = "bERliN"
    location = pv_calcs.get_location_data(city_name_mixed)
    assert location["name"] == "Berlin"

def test_pv_calcs():
    # calculate for Berlin, 10 modules á 140Wp, 90deg South
    calc_results = pv_calcs.pv_calculation(52.510885, 13.3989367, 1400, 90, 0, 0.13)

    assert calc_results is not None
    assert calc_results["radiation"] == 959.83
    assert calc_results["energy_yield"] == 1239.11
    assert len(calc_results["monthly_energy_yield"]) == 12
    assert calc_results["monthly_energy_yield"] == [58.24, 90.98, 124.11, 135.27, 121.69, 110.89, 113.4, 125.34, 131.38, 109.58, 67.66, 50.57]
    assert calc_results["spec_yield"] == 885.08

def test_from_city_name_to_calc_results():
    # calculate for Berlin (via API), 10 modules á 140Wp, 90deg South
    location = pv_calcs.get_location_data("Berlin")
    calc_results = pv_calcs.pv_calculation(location["latitude"], location["longitude"], 1400, 90, 0, 0.13)

    assert calc_results is not None
    assert calc_results["radiation"] == 959.83
    assert calc_results["energy_yield"] == 1239.11
    assert len(calc_results["monthly_energy_yield"]) == 12
    assert calc_results["monthly_energy_yield"] == [58.24, 90.98, 124.11, 135.27, 121.69, 110.89, 113.4, 125.34, 131.38, 109.58, 67.66, 50.57]
    assert calc_results["spec_yield"] == 885.08
