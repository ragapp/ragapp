"""Open Meteo weather map tool spec."""

import logging
import requests
import pytz
from llama_index.core.tools import FunctionTool

logger = logging.getLogger(__name__)


class OpenMeteoWeather:
    geo_api = "https://geocoding-api.open-meteo.com/v1"
    weather_api = "https://api.open-meteo.com/v1"

    @classmethod
    def _get_geo_location(cls, location: str) -> dict:
        """Get geo location from location name."""
        params = {"name": location, "count": 10, "language": "en", "format": "json"}
        response = requests.get(f"{cls.geo_api}/search", params=params)
        if response.status_code != 200:
            raise Exception(f"Failed to fetch geo location: {response.status_code}")
        else:
            data = response.json()
            result = data["results"][0]
            geo_location = {
                "id": result["id"],
                "name": result["name"],
                "latitude": result["latitude"],
                "longitude": result["longitude"],
            }
            return geo_location

    @classmethod
    def get_weather_information(cls, location: str) -> dict:
        """Use this function to get the weather of any given location.
        Note that the weather code should follow WMO Weather interpretation codes (WW):
        0: Clear sky
        1, 2, 3: Mainly clear, partly cloudy, and overcast
        45, 48: Fog and depositing rime fog
        51, 53, 55: Drizzle: Light, moderate, and dense intensity
        56, 57: Freezing Drizzle: Light and dense intensity
        61, 63, 65: Rain: Slight, moderate and heavy intensity
        66, 67: Freezing Rain: Light and heavy intensity
        71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
        77: Snow grains
        80, 81, 82: Rain showers: Slight, moderate, and violent
        85, 86: Snow showers slight and heavy
        95: Thunderstorm: Slight or moderate
        96, 99: Thunderstorm with slight and heavy hail
        """
        logger.info(
            f"Calling open-meteo api to get weather information of location: {location}"
        )
        geo_location = cls._get_geo_location(location)
        timezone = pytz.timezone("UTC").zone
        params = {
            "latitude": geo_location["latitude"],
            "longitude": geo_location["longitude"],
            "current": "temperature_2m,weather_code",
            "hourly": "temperature_2m,weather_code",
            "daily": "weather_code",
            "timezone": timezone,
        }
        response = requests.get(f"{cls.weather_api}/forecast", params=params)
        if response.status_code != 200:
            raise Exception(
                f"Failed to fetch weather information: {response.status_code}"
            )
        return response.json()


tools = [FunctionTool.from_defaults(OpenMeteoWeather.get_weather_information)]
