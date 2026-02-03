import type {
  OpenWeatherCurrentResponse,
  OpenWeatherForecastItem,
  OpenWeatherForecastResponse,
} from './types'

const OPENWEATHERMAP_API_URL = 'https://api.openweathermap.org/data/2.5'

/**
 * Fetch current weather data from OpenWeatherMap
 * Uses Next.js fetch with revalidation for caching
 */
export async function getCurrentWeather(
  lat: number,
  lng: number,
): Promise<OpenWeatherCurrentResponse> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY
  if (!apiKey) {
    throw new Error('OPENWEATHERMAP_API_KEY is not configured')
  }

  const url = `${OPENWEATHERMAP_API_URL}/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`

  const response = await fetch(url, {
    next: { revalidate: 600 }, // Cache for 10 minutes
  })

  if (!response.ok) {
    throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch 5-day forecast from OpenWeatherMap
 * Uses Next.js fetch with revalidation for caching
 */
export async function getForecastWeather(
  lat: number,
  lng: number,
): Promise<OpenWeatherForecastItem[]> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY
  if (!apiKey) {
    throw new Error('OPENWEATHERMAP_API_KEY is not configured')
  }

  const url = `${OPENWEATHERMAP_API_URL}/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`

  const response = await fetch(url, {
    next: { revalidate: 600 }, // Cache for 10 minutes
  })

  if (!response.ok) {
    throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`)
  }

  const data: OpenWeatherForecastResponse = await response.json()
  return data.list
}
