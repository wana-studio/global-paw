import { NextResponse, NextRequest } from 'next/server'

const SUPPORTED_LOCALES = ['en', 'ar', 'fa']
const DEFAULT_LOCALE = 'en'

/**
 * Middleware to handle CORS and detect locale from request headers
 * This allows using X-User-Language or Accept-Language headers instead of ?locale=
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Only apply to /api routes (excluding /api/chat which has its own handling)
  if (!pathname.startsWith('/api/') || pathname.startsWith('/api/chat')) {
    return NextResponse.next()
  }

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, x-user-language, X-User-Language',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Skip if locale is already in query params
  if (searchParams.has('locale')) {
    return NextResponse.next()
  }

  // 1. Check custom header first (X-User-Language)
  let locale = request.headers.get('X-User-Language') || request.headers.get('x-user-language')

  // 2. Fallback to Accept-Language header
  if (!locale || !SUPPORTED_LOCALES.includes(locale)) {
    const acceptLanguage = request.headers.get('Accept-Language')
    if (acceptLanguage) {
      // Parse "ar,en;q=0.9,fa;q=0.8" format
      const primaryLang = acceptLanguage.split(',')[0]?.split('-')[0]?.trim()
      if (primaryLang && SUPPORTED_LOCALES.includes(primaryLang)) {
        locale = primaryLang
      }
    }
  }

  // 3. Apply detected locale
  if (locale && SUPPORTED_LOCALES.includes(locale) && locale !== DEFAULT_LOCALE) {
    const url = request.nextUrl.clone()
    url.searchParams.set('locale', locale)
    const response = NextResponse.rewrite(url)
    addCorsHeaders(response)
    return response
  }

  const response = NextResponse.next()
  addCorsHeaders(response)
  return response
}

// Helper function to add CORS headers to response
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-user-language, X-User-Language',
  )
}

export const config = {
  matcher: '/api/:path*',
}
