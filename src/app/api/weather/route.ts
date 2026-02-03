import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { City, DayWeather, SupportedLanguage } from './types'
import { getCurrentWeather, getForecastWeather } from './weather-service'
import { generateWeatherMessage } from './message-generator'
import {
  getClosestCity,
  getWeatherBg,
  getWeatherColor,
  dateToLocalizedTitle,
  mapMostAppearingWeather,
} from './utils'

export const dynamic = 'force-dynamic'

/**
 * GET /api/weather
 *
 * Query by city name: ?city=Tehran&theme=light
 * Query by geolocation: ?lat=35.6892&lng=51.389&theme=dark
 *
 * Uses X-User-Language header for localization (set by middleware)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const cityName = searchParams.get('city')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const theme = (searchParams.get('theme') || 'light') as 'light' | 'dark'
    const locale = (searchParams.get('locale') || 'ar') as SupportedLanguage

    // Validate query params
    if (!cityName && (!lat || !lng)) {
      return NextResponse.json(
        { error: 'Either city name or lat/lng coordinates are required' },
        { status: 400 },
      )
    }

    // Initialize Payload
    const payload = await getPayload({ config })

    // Find city
    let city: City | null = null

    if (cityName) {
      // Search by city name
      const cities = await payload.find({
        collection: 'cities',
        where: {
          name: {
            contains: cityName,
          },
        },
        locale,
        limit: 1,
      })

      if (cities.docs.length > 0) {
        const doc = cities.docs[0]
        city = {
          id: doc.id,
          name: doc.name,
          country: doc.country,
          latitude: doc.latitude,
          longitude: doc.longitude,
        }
      }
    } else if (lat && lng) {
      // Find closest city by coordinates
      const allCities = await payload.find({
        collection: 'cities',
        locale,
        limit: 1000, // Get all cities for distance calculation
      })

      const cityDocs: City[] = allCities.docs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        country: doc.country,
        latitude: doc.latitude,
        longitude: doc.longitude,
      }))

      city = getClosestCity(parseFloat(lat), parseFloat(lng), cityDocs)
    }

    if (!city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 })
    }

    // Fetch weather data
    const [currentData, forecastData] = await Promise.all([
      getCurrentWeather(city.latitude, city.longitude),
      getForecastWeather(city.latitude, city.longitude),
    ])

    const current = forecastData[0]

    // Generate weather message
    const weatherMessage = await generateWeatherMessage(
      {
        temp: currentData.main.temp,
        humidity: currentData.main.humidity,
        wind_speed: currentData.wind.speed,
        wind_deg: currentData.wind.deg,
        wind_gust: currentData.wind.gust,
        pressure: currentData.main.pressure,
        weather: current.weather,
      },
      city.name,
    )

    // Build current day weather
    const currentDate: DayWeather = {
      date: new Date().toISOString().split('T')[0],
      dateTitle: locale === 'ar' ? 'اليوم' : 'Today',
      current: currentData.main.temp,
      min: current.main.temp_min,
      max:
        current.main.temp_max > current.main.temp_min
          ? current.main.temp_max
          : current.main.temp_min + 1,
      weather: current.weather,
      backgroundColor: getWeatherBg(currentData.weather[0], theme),
      textColor: getWeatherColor(currentData.weather[0], theme),
      customDescription: {
        text: locale === 'ar' ? weatherMessage.ar : weatherMessage.en,
        emoji: weatherMessage.emoji,
      },
    }

    // Aggregate forecast data by day
    const dates: DayWeather[] = [currentDate]
    for (const weather of forecastData) {
      const date = weather.dt_txt.split(' ')[0]
      const existing = dates.find((d) => d.date === date)

      if (existing) {
        existing.min = Math.min(existing.min, weather.main.temp_min)
        existing.max = Math.max(existing.max, weather.main.temp_max)
        if (currentDate.date !== date) {
          existing.weather.push(...weather.weather)
        }
      } else {
        dates.push({
          min: weather.main.temp_min,
          max: weather.main.temp_max,
          date,
          weather: [...weather.weather],
          current: undefined,
          dateTitle: dateToLocalizedTitle(weather.dt, locale),
        })
      }
    }

    // Map to most appearing weather per day
    const filtered = mapMostAppearingWeather(dates)

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Weather API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
