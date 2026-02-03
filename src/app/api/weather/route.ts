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
      locale, // Pass language for cache key
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
      weather: current.weather[0],
      backgroundColor: getWeatherBg(currentData.weather[0], theme),
      textColor: getWeatherColor(currentData.weather[0], theme),
      customDescription: {
        text: locale === 'ar' ? weatherMessage.ar : weatherMessage.en,
        emoji: weatherMessage.emoji,
      },
    }

    // Aggregate forecast data by day
    // Track weather counts per day to find most common
    const dayWeatherCounts = new Map<
      string,
      Map<string, { count: number; weather: (typeof current.weather)[0] }>
    >()
    const dates: DayWeather[] = [currentDate]

    for (const forecast of forecastData) {
      const date = forecast.dt_txt.split(' ')[0]

      // Skip today's date as we already have it
      if (date === currentDate.date) continue

      const existing = dates.find((d) => d.date === date)

      if (existing) {
        existing.min = Math.min(existing.min, forecast.main.temp_min)
        existing.max = Math.max(existing.max, forecast.main.temp_max)

        // Track weather condition counts
        let counts = dayWeatherCounts.get(date)
        if (!counts) {
          counts = new Map()
          dayWeatherCounts.set(date, counts)
        }
        const weatherMain = forecast.weather[0].main
        const existingCount = counts.get(weatherMain)
        if (existingCount) {
          existingCount.count++
        } else {
          counts.set(weatherMain, { count: 1, weather: forecast.weather[0] })
        }

        // Update to most common weather
        let maxCount = 0
        for (const { count, weather } of counts.values()) {
          if (count > maxCount) {
            maxCount = count
            existing.weather = weather
          }
        }
      } else {
        // Initialize weather counts for new day
        const counts = new Map<string, { count: number; weather: (typeof forecast.weather)[0] }>()
        counts.set(forecast.weather[0].main, { count: 1, weather: forecast.weather[0] })
        dayWeatherCounts.set(date, counts)

        dates.push({
          min: forecast.main.temp_min,
          max: forecast.main.temp_max,
          date,
          weather: forecast.weather[0],
          dateTitle: dateToLocalizedTitle(forecast.dt, locale),
        })
      }
    }

    // Map to most appearing weather per day (already done inline above)
    const filtered = mapMostAppearingWeather(dates)

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Weather API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
