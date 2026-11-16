import { CityData, GeocodingResponse, GeocodingResult, WeatherApiResponse, WeatherCache } from '../../shared/types';

export async function fetchWeatherData(cityData: CityData): Promise<WeatherApiResponse | null> {
  const cacheKey = 'ent_weather_cache';
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${cityData.lat}&longitude=${cityData.lon}&current_weather=true`;
  try {
    const response = await fetch(url);
    const data = (await response.json()) as WeatherApiResponse;
    if (data && data.current_weather) {
      try {
        const cacheData: WeatherCache = {
          timestamp: Date.now(),
          lat: cityData.lat,
          lon: cityData.lon,
          data,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (error) {
        console.error('Error writing weather cache:', error);
      }
    }
    return data;
  } catch (error) {
    console.error('Weather API error:', error);
    return null;
  }
}

export async function fetchCitySuggestions(query: string): Promise<GeocodingResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=3&language=en&format=json`;
  const response = await fetch(url);
  const data = (await response.json()) as GeocodingResponse;
  return data.results ?? [];
}
