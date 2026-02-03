import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { unstable_cache } from 'next/cache'
import type {
  OpenWeatherCondition,
  WeatherMessage,
  OpenWeatherMain,
  OpenWeatherWind,
} from './types'
import { getSeason, getWeekdayInfo } from './utils'

// System prompt for weather message generation
const WEATHER_MESSAGE_SYSTEM_PROMPT = `You are a friendly, creative weather assistant that generates short, engaging weather messages for a mobile app.

RULES:
1. Generate 15-20 unique messages per request
2. Each message must be bilingual (Arabic and English)
3. Messages should be casual, fun, and helpful
4. Include relevant emoji for each message
5. Focus on practical advice based on weather conditions
6. Consider the time of day, season, and weekday context
7. Avoid work-related messages - keep it personal and lifestyle-focused
8. Keep messages under 100 characters each
9. Be creative and vary the tone (humorous, poetic, practical, etc.)

NEVER:
- Mention specific brands or products
- Give medical advice beyond "stay hydrated" type suggestions
- Be negative or alarming unless weather is truly severe
- Repeat similar messages`

interface WeatherData {
  temp?: number
  humidity?: number
  wind_speed?: number
  wind_deg?: number
  wind_gust?: number
  pressure?: number
  clouds?: number
  weather?: OpenWeatherCondition[]
  main?: OpenWeatherMain
  wind?: OpenWeatherWind
}

/**
 * Get a simple fallback message based on weather conditions
 */
function getFallbackMessage(weather: WeatherData): WeatherMessage {
  const temp = weather.temp ?? weather.main?.temp ?? 20
  const condition = weather.weather?.[0]?.main || 'Clear'

  if (temp > 30) {
    return {
      ar: 'الجو حار جداً! اشرب الكثير من الماء 💧',
      en: "It's hot out there! Stay hydrated 💧",
      emoji: '☀️',
    }
  }
  if (temp < 5) {
    return {
      ar: 'الجو بارد! ارتدِ ملابس دافئة 🧥',
      en: "Bundle up, it's cold outside! 🧥",
      emoji: '❄️',
    }
  }
  if (condition === 'Rain' || condition === 'Drizzle') {
    return {
      ar: 'المطر قادم، لا تنسَ المظلة! ☔',
      en: "Don't forget your umbrella! ☔",
      emoji: '🌧️',
    }
  }
  if (condition === 'Snow') {
    return {
      ar: 'الثلج يتساقط! استمتع بمشروب ساخن ☕',
      en: 'Snow is falling! Enjoy a warm drink ☕',
      emoji: '🌨️',
    }
  }
  if (condition === 'Clouds') {
    return {
      ar: 'الجو غائم ولطيف 🌥️',
      en: 'Cloudy but pleasant weather 🌥️',
      emoji: '☁️',
    }
  }

  return {
    ar: 'طقس جميل اليوم! أتمنى لك يوماً رائعاً ✨',
    en: 'Beautiful weather today! Have a great day ✨',
    emoji: '🌤️',
  }
}

/**
 * Generate weather messages using AI with caching
 */
async function generateWeatherMessagesWithAI(
  weather: WeatherData,
  city: string,
): Promise<WeatherMessage[]> {
  const season = getSeason()
  const weekday = getWeekdayInfo()

  const now = new Date()
  const tehranTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    hour: 'numeric',
    hour12: true,
  }).format(now)

  // Build weekday context
  let weekdayContext = ''
  if (weekday.isWeekend) {
    weekdayContext = '🏖️ WEEKEND (الجمعة): Relaxed, focus on rest/leisure.'
  } else if (weekday.dayOfWeek === 4) {
    weekdayContext = '😌 THURSDAY: Pre-weekend, relaxed tone.'
  } else if (weekday.isWeekStart) {
    weekdayContext = '✨ WEEK START (السبت): Positive, energizing tone.'
  } else {
    weekdayContext = `🌤️ WEEKDAY (${weekday.nameEn}): Normal day, keep it fun.`
  }

  const temp = weather.temp ?? weather.main?.temp ?? 20
  const humidity = weather.humidity ?? weather.main?.humidity ?? 50
  const windSpeed = weather.wind_speed ?? weather.wind?.speed ?? 0
  const condition = weather.weather?.[0]?.description || 'clear sky'

  const userPrompt = `
City: ${city}
Weekday: ${weekday.nameAr} (${weekday.nameEn}) - ${weekdayContext}
Temperature: ${temp.toFixed(0)}°C
Weather Condition: ${condition}
Day time: ${tehranTime}
Season: ${season}
Humidity: ${humidity}%
Wind Speed: ${windSpeed.toFixed(1)} m/s

Generate fun, engaging weather messages for this city.`

  const { object: messages } = await generateObject({
    model: google('gemini-2.5-flash'),
    prompt: userPrompt,
    system: WEATHER_MESSAGE_SYSTEM_PROMPT,
    schema: z
      .array(
        z.object({
          ar: z.string().describe('Arabic message'),
          en: z.string().describe('English message'),
          emoji: z.string().describe('Relevant emoji'),
        }),
      )
      .min(15)
      .max(20),
    temperature: 0.8,
  })

  return messages
}

/**
 * Cached function to get weather messages
 * Messages are cached for 2.5 hours per city
 */
const getCachedWeatherMessages = unstable_cache(
  async (city: string, weatherJson: string): Promise<WeatherMessage[]> => {
    const weather: WeatherData = JSON.parse(weatherJson)
    return generateWeatherMessagesWithAI(weather, city)
  },
  ['weather-messages'],
  {
    revalidate: 9000, // 2.5 hours in seconds
    tags: ['weather-messages'],
  },
)

/**
 * Generate a weather message for the given conditions
 * Returns a random message from cached AI-generated messages,
 * or a fallback if generation fails
 */
export async function generateWeatherMessage(
  weather: WeatherData,
  city: string,
): Promise<WeatherMessage> {
  try {
    // Serialize weather data for cache key
    const weatherJson = JSON.stringify({
      temp: weather.temp ?? weather.main?.temp,
      condition: weather.weather?.[0]?.main,
    })

    const messages = await getCachedWeatherMessages(city, weatherJson)

    if (messages && messages.length > 0) {
      // Return a random message
      return messages[Math.floor(Math.random() * messages.length)]
    }

    return getFallbackMessage(weather)
  } catch (error) {
    console.error('Error generating weather message:', error)
    return getFallbackMessage(weather)
  }
}
