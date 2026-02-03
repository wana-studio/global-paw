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
const WEATHER_MESSAGE_SYSTEM_PROMPT = `You are a weather assistant generating ultra-short weather status messages for a mobile app.

RULES:
1. Generate 15-20 unique messages per request
2. Each message must be bilingual (Arabic and English)
3. Messages MUST be exactly 2-3 words only - no more!
4. Include relevant emoji for each message
5. Be creative and varied (poetic, playful, descriptive)

EXAMPLES of correct length:
- "آسمان صاف ☀️" / "Clear skies"
- "باد خنک 🌬️" / "Cool breeze"
- "روز عالی ✨" / "Perfect day"
- "هوا دلپذیر 🌤️" / "Lovely weather"

NEVER:
- Use more than 3 words per message
- Write full sentences
- Give advice or suggestions`

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
      ar: 'جو حار',
      en: 'Hot day',
      emoji: '☀️',
    }
  }
  if (temp < 5) {
    return {
      ar: 'جو بارد',
      en: 'Cold day',
      emoji: '❄️',
    }
  }
  if (condition === 'Rain' || condition === 'Drizzle') {
    return {
      ar: 'يوم ماطر',
      en: 'Rainy day',
      emoji: '🌧️',
    }
  }
  if (condition === 'Snow') {
    return {
      ar: 'ثلج جميل',
      en: 'Snowy day',
      emoji: '🌨️',
    }
  }
  if (condition === 'Clouds') {
    return {
      ar: 'غائم جزئياً',
      en: 'Partly cloudy',
      emoji: '☁️',
    }
  }

  return {
    ar: 'طقس رائع',
    en: 'Nice weather',
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
