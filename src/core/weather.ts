/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { globalState } from './state';
import { fetchWeatherData } from './services';
import { CityData } from './types';

function getFluentIconFilename(code: number, isDay: number | boolean): string {
  switch (code) {
    case 0:
      return isDay ? 'sunny.svg' : 'clear_night.svg';
    case 1:
      return isDay ? 'sunny.svg' : 'clear_night.svg';
    case 2:
      return isDay ? 'partly_cloudy_day.svg' : 'partly_cloudy_night.svg';
    case 3:
      return 'cloudy.svg';
    case 45:
    case 48:
      return 'fog.svg';
    case 51:
    case 53:
    case 55:
      return 'drizzle.svg';
    case 56:
    case 57:
    case 66:
    case 67:
      return 'rain_snow.svg';
    case 61:
    case 63:
    case 65:
      return 'rain.svg';
    case 71:
    case 73:
    case 75:
    case 77:
      return 'snow.svg';
    case 80:
    case 81:
    case 82:
      return isDay ? 'rain_showers_day.svg' : 'rain_showers_night.svg';
    case 85:
    case 86:
      return isDay ? 'snow_showers_day.svg' : 'snow_showers_night.svg';
    case 95:
      return 'thunderstorm.svg';
    case 96:
    case 99:
      return isDay ? 'hail_day.svg' : 'hail_night.svg';
    default:
      return 'cloudy.svg';
  }
}

export async function updateWeatherWidget(): Promise<void> {
  const widgetEl = document.getElementById(
    'weatherWidget',
  ) as HTMLAnchorElement | null;
  if (!widgetEl) return;

  if (!globalState.current.weatherEnabled) {
    widgetEl.style.display = 'none';
    return;
  }

  const cityString = localStorage.getItem('ent_weather_city');
  if (!cityString) {
    widgetEl.style.display = 'none';
    return;
  }

  // Mostra o widget enquanto busca para evitar pop-in tardio
  widgetEl.style.display = 'flex';

  const cityData = JSON.parse(cityString) as CityData;
  const data = await fetchWeatherData(cityData);

  if (!data?.current_weather) return;

  const cityEl = document.getElementById('weatherCity');
  const tempEl = document.getElementById('weatherTemp');
  const iconEl = document.getElementById('weatherIcon');

  const { temperature, weathercode, is_day } = data.current_weather;
  const isCelsius = globalState.current.tempUnit === 'C';
  const tempValue = isCelsius ? temperature : (temperature * 9) / 5 + 32;
  const unitSymbol = isCelsius ? '°C' : '°F';
  const filename = getFluentIconFilename(weathercode, is_day);

  if (cityEl) cityEl.textContent = cityData.name;
  if (tempEl) tempEl.textContent = `${Math.round(tempValue)}${unitSymbol}`;

  if (iconEl) {
    iconEl.innerHTML = `<img src="assets/weather/${filename}" alt="Weather Icon" class="fluent-icon" />`;
  }

  const degreeType = isCelsius ? 'C' : 'F';
  widgetEl.href = `https://www.msn.com/en-ph/weather/forecast/?weadegreetype=${degreeType}&uxmode=ruby`;
}
