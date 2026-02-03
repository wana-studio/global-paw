/**
 * Weather API Types
 */

// Query parameters for weather endpoint
export interface WeatherQueryByCity {
  city: string
  theme?: 'light' | 'dark'
}

export interface WeatherQueryByGeo {
  lat: number
  lng: number
  theme?: 'light' | 'dark'
}

export type WeatherQuery = WeatherQueryByCity | WeatherQueryByGeo

// OpenWeatherMap API response types
export interface OpenWeatherCondition {
  id: number
  main: string
  description: string
  icon: string
}

export interface OpenWeatherMain {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  pressure: number
  humidity: number
}

export interface OpenWeatherWind {
  speed: number
  deg: number
  gust?: number
}

export interface OpenWeatherCurrentResponse {
  coord: { lat: number; lon: number }
  weather: OpenWeatherCondition[]
  main: OpenWeatherMain
  wind: OpenWeatherWind
  clouds: { all: number }
  dt: number
  name: string
}

export interface OpenWeatherForecastItem {
  dt: number
  dt_txt: string
  main: OpenWeatherMain
  weather: OpenWeatherCondition[]
  wind: OpenWeatherWind
  clouds: { all: number }
}

export interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastItem[]
  city: {
    name: string
    coord: { lat: number; lon: number }
  }
}

// Processed weather data types
export interface WeatherMessage {
  ar: string
  en: string
  emoji: string
}

export interface DayWeather {
  date: string
  dateTitle: string
  current: number | undefined
  min: number
  max: number
  weather: OpenWeatherCondition[]
  backgroundColor?: string
  textColor?: string
  customDescription?: {
    text: string
    emoji: string
  }
}

// City type from Payload
export interface City {
  id: number
  name: string
  country: string
  latitude: number
  longitude: number
}

export type SupportedLanguage = 'en' | 'ar'
