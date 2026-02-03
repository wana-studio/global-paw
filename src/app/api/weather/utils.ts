import type { City, DayWeather, OpenWeatherCondition, SupportedLanguage } from './types'

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Find the closest city from a list of cities given coordinates
 */
export function getClosestCity(lat: number, lng: number, cities: City[]): City | null {
  return cities.reduce(
    (nearest: { city: City | null; distance: number }, city) => {
      const distance = calculateDistance(lat, lng, city.latitude, city.longitude)
      if (distance < nearest.distance) {
        return { city, distance }
      }
      return nearest
    },
    { city: null, distance: Infinity },
  ).city
}

/**
 * Get background color based on weather condition and theme
 */
export function getWeatherBg(weather: OpenWeatherCondition, theme: 'light' | 'dark'): string {
  const id = weather.id
  const isLight = theme === 'light'

  // Thunderstorm (2xx)
  if (id >= 200 && id < 300) {
    return isLight ? '#4A5568' : '#2D3748'
  }
  // Drizzle (3xx) or Rain (5xx)
  if ((id >= 300 && id < 400) || (id >= 500 && id < 600)) {
    return isLight ? '#63B3ED' : '#2B6CB0'
  }
  // Snow (6xx)
  if (id >= 600 && id < 700) {
    return isLight ? '#E2E8F0' : '#4A5568'
  }
  // Atmosphere - fog, mist, etc (7xx)
  if (id >= 700 && id < 800) {
    return isLight ? '#A0AEC0' : '#4A5568'
  }
  // Clear (800)
  if (id === 800) {
    return isLight ? '#87CEEB' : '#1A365D'
  }
  // Clouds (80x)
  if (id > 800) {
    return isLight ? '#CBD5E0' : '#2D3748'
  }

  return isLight ? '#87CEEB' : '#1A365D'
}

/**
 * Get text color based on weather condition and theme
 */
export function getWeatherColor(weather: OpenWeatherCondition, theme: 'light' | 'dark'): string {
  const id = weather.id
  const isLight = theme === 'light'

  // Snow or light backgrounds need dark text in light mode
  if ((id >= 600 && id < 700) || id === 800) {
    return isLight ? '#1A202C' : '#F7FAFC'
  }

  return isLight ? '#1A202C' : '#F7FAFC'
}

/**
 * Convert Unix timestamp to localized day title
 */
export function dateToLocalizedTitle(timestamp: number, language: SupportedLanguage): string {
  const date = new Date(timestamp * 1000)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dateStr = date.toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  if (dateStr === todayStr) {
    return language === 'ar' ? 'اليوم' : 'Today'
  }
  if (dateStr === tomorrowStr) {
    return language === 'ar' ? 'غداً' : 'Tomorrow'
  }

  // Return localized weekday name
  const weekdaysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const dayIndex = date.getDay()
  if (language === 'ar') return weekdaysAr[dayIndex]
  return weekdaysEn[dayIndex]
}

/**
 * Aggregate weather conditions to find most appearing weather per day
 */
export function mapMostAppearingWeather(days: DayWeather[]): DayWeather[] {
  return days.map((day) => {
    if (day.weather.length <= 1) return day

    // Count occurrences of each weather condition by main type
    const counts = new Map<string, { count: number; weather: OpenWeatherCondition }>()
    for (const w of day.weather) {
      const existing = counts.get(w.main)
      if (existing) {
        existing.count++
      } else {
        counts.set(w.main, { count: 1, weather: w })
      }
    }

    // Find the most common weather condition
    let maxCount = 0
    let mostCommon: OpenWeatherCondition | null = null
    for (const { count, weather } of counts.values()) {
      if (count > maxCount) {
        maxCount = count
        mostCommon = weather
      }
    }

    return {
      ...day,
      weather: mostCommon ? [mostCommon] : day.weather.slice(0, 1),
    }
  })
}

/**
 * Get current season based on month
 */
export function getSeason(): string {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'Spring'
  if (month >= 5 && month <= 7) return 'Summer'
  if (month >= 8 && month <= 10) return 'Autumn'
  return 'Winter'
}

/**
 * Get weekday info for weather messages
 */
export function getWeekdayInfo(): {
  dayOfWeek: number
  isWeekend: boolean
  isWeekStart: boolean
  nameAr: string
  nameEn: string
} {
  const now = new Date()
  const dayOfWeek = now.getDay()

  // In Iran, Friday is weekend (dayOfWeek = 5)
  const isWeekend = dayOfWeek === 5
  // Saturday is week start in Iran (dayOfWeek = 6)
  const isWeekStart = dayOfWeek === 6

  const weekdaysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return {
    dayOfWeek,
    isWeekend,
    isWeekStart,
    nameAr: weekdaysAr[dayOfWeek],
    nameEn: weekdaysEn[dayOfWeek],
  }
}
