export async function fetchOpenMeteo(lat: number, lon: number) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl");
  url.searchParams.set("hourly", "temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m");
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("timezone", "UTC");
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  return res.json() as Promise<{
    current: {
      time: string;
      temperature_2m: number;
      wind_speed_10m: number;
      wind_direction_10m: number;
      wind_gusts_10m: number;
      pressure_msl: number;
    };
    hourly: {
      time: string[];
      temperature_2m: number[];
      wind_speed_10m: number[];
      wind_direction_10m: number[];
      wind_gusts_10m: number[];
    };
  }>;
}
