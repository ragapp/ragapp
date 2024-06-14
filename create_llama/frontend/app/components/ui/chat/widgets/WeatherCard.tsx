export interface WeatherData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    weather_code: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    weather_code: number;
  };
  hourly_units: {
    time: string;
    temperature_2m: string;
    weather_code: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily_units: {
    time: string;
    weather_code: string;
  };
  daily: {
    time: string[];
    weather_code: number[];
  };
}

// Follow WMO Weather interpretation codes (WW)
const weatherCodeDisplayMap: Record<
  string,
  {
    icon: JSX.Element;
    status: string;
  }
> = {
  "0": {
    icon: <span>☀️</span>,
    status: "Clear sky",
  },
  "1": {
    icon: <span>🌤️</span>,
    status: "Mainly clear",
  },
  "2": {
    icon: <span>☁️</span>,
    status: "Partly cloudy",
  },
  "3": {
    icon: <span>☁️</span>,
    status: "Overcast",
  },
  "45": {
    icon: <span>🌫️</span>,
    status: "Fog",
  },
  "48": {
    icon: <span>🌫️</span>,
    status: "Depositing rime fog",
  },
  "51": {
    icon: <span>🌧️</span>,
    status: "Drizzle",
  },
  "53": {
    icon: <span>🌧️</span>,
    status: "Drizzle",
  },
  "55": {
    icon: <span>🌧️</span>,
    status: "Drizzle",
  },
  "56": {
    icon: <span>🌧️</span>,
    status: "Freezing Drizzle",
  },
  "57": {
    icon: <span>🌧️</span>,
    status: "Freezing Drizzle",
  },
  "61": {
    icon: <span>🌧️</span>,
    status: "Rain",
  },
  "63": {
    icon: <span>🌧️</span>,
    status: "Rain",
  },
  "65": {
    icon: <span>🌧️</span>,
    status: "Rain",
  },
  "66": {
    icon: <span>🌧️</span>,
    status: "Freezing Rain",
  },
  "67": {
    icon: <span>🌧️</span>,
    status: "Freezing Rain",
  },
  "71": {
    icon: <span>❄️</span>,
    status: "Snow fall",
  },
  "73": {
    icon: <span>❄️</span>,
    status: "Snow fall",
  },
  "75": {
    icon: <span>❄️</span>,
    status: "Snow fall",
  },
  "77": {
    icon: <span>❄️</span>,
    status: "Snow grains",
  },
  "80": {
    icon: <span>🌧️</span>,
    status: "Rain showers",
  },
  "81": {
    icon: <span>🌧️</span>,
    status: "Rain showers",
  },
  "82": {
    icon: <span>🌧️</span>,
    status: "Rain showers",
  },
  "85": {
    icon: <span>❄️</span>,
    status: "Snow showers",
  },
  "86": {
    icon: <span>❄️</span>,
    status: "Snow showers",
  },
  "95": {
    icon: <span>⛈️</span>,
    status: "Thunderstorm",
  },
  "96": {
    icon: <span>⛈️</span>,
    status: "Thunderstorm",
  },
  "99": {
    icon: <span>⛈️</span>,
    status: "Thunderstorm",
  },
};

const displayDay = (time: string) => {
  return new Date(time).toLocaleDateString("en-US", {
    weekday: "long",
  });
};

export function WeatherCard({ data }: { data: WeatherData }) {
  const currentDayString = new Date(data.current.time).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="bg-[#61B9F2] rounded-2xl shadow-xl p-5 space-y-4 text-white w-fit">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="text-xl">{currentDayString}</div>
          <div className="text-5xl font-semibold flex gap-4">
            <span>
              {data.current.temperature_2m} {data.current_units.temperature_2m}
            </span>
            {weatherCodeDisplayMap[data.current.weather_code].icon}
          </div>
        </div>
        <span className="text-xl">
          {weatherCodeDisplayMap[data.current.weather_code].status}
        </span>
      </div>
      <div className="gap-2 grid grid-cols-6">
        {data.daily.time.map((time, index) => {
          if (index === 0) return null; // skip the current day
          return (
            <div key={time} className="flex flex-col items-center gap-4">
              <span>{displayDay(time)}</span>
              <div className="text-4xl">
                {weatherCodeDisplayMap[data.daily.weather_code[index]].icon}
              </div>
              <span className="text-sm">
                {weatherCodeDisplayMap[data.daily.weather_code[index]].status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
