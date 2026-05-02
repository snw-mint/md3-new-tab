/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { CityData, GeocodingResponse, WeatherApiResponse } from './types';

export async function checkPermission(origins: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const chromeApi = (window as any).chrome;
    if (!chromeApi?.permissions?.contains) return resolve(false);

    chromeApi.permissions.contains({ origins }, (result: boolean) => {
      resolve(Boolean(result));
    });
  });
}

export async function requestPermission(origins: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const chromeApi = (window as any).chrome;
    if (!chromeApi?.permissions?.request) return resolve(false);

    chromeApi.permissions.request({ origins }, (granted: boolean) => {
      resolve(Boolean(granted));
    });
  });
}

export async function fetchCityData(query: string): Promise<CityData | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
  try {
    const response = await fetch(url);
    const data = (await response.json()) as GeocodingResponse;
    if (data.results && data.results.length > 0) {
      const res = data.results[0];
      return {
        name: res.name,
        lat: res.latitude,
        lon: res.longitude,
        country: res.country,
      };
    }
  } catch (error) {
    console.error('Geocoding fetch error:', error);
  }
  return null;
}

export async function fetchWeatherData(
  cityData: CityData,
): Promise<WeatherApiResponse | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${cityData.lat}&longitude=${cityData.lon}&current_weather=true`;
  try {
    const response = await fetch(url);
    return (await response.json()) as WeatherApiResponse;
  } catch (error) {
    console.error('Weather API error:', error);
    return null;
  }
}
