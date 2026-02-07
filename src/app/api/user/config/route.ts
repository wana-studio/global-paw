import { jwtVerify, createRemoteJWKSet } from 'jose'
import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

// Cache the JWKS to avoid fetching on every request
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
)

interface UserConfigBody {
  selectedLanguage?: 'en' | 'ar' | 'fa'
  selectedTheme?: 'light' | 'dark' | 'system'
  selectedBackground?: number // wallpaper ID
}

export async function PATCH(req: Request) {
  // 1. Authenticate User via local JWT verification using JWKS
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')

  let userId: string
  let userEmail: string | undefined

  try {
    const { payload: jwtPayload } = await jwtVerify(token, JWKS, {
      issuer: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    })
    userId = jwtPayload.sub as string
    userEmail = jwtPayload.email as string | undefined
  } catch (err) {
    console.error('JWT verification failed:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // 2. Parse request body
  const body: UserConfigBody = await req.json()
  const { selectedLanguage, selectedTheme, selectedBackground } = body

  // Validate at least one field is provided
  if (
    selectedLanguage === undefined &&
    selectedTheme === undefined &&
    selectedBackground === undefined
  ) {
    return NextResponse.json(
      { error: 'At least one config field must be provided' },
      { status: 400 },
    )
  }

  // 3. Initialize Payload
  const payload = await getPayload({ config })

  // 4. Lookup AppUser
  const appUserResult = await payload.find({
    collection: 'app-users',
    where: {
      supabaseId: {
        equals: userId,
      },
    },
    limit: 1,
  })

  if (appUserResult.docs.length === 0) {
    // Create new AppUser if not found (fallback if trigger didn't fire)
    const newAppUser = await payload.create({
      collection: 'app-users',
      data: {
        supabaseId: userId,
        email: userEmail || '',
        ...(selectedLanguage && { selectedLanguage }),
        ...(selectedTheme && { selectedTheme }),
        ...(selectedBackground && { selectedBackground }),
      },
    })

    return NextResponse.json({
      success: true,
      config: {
        selectedLanguage: newAppUser.selectedLanguage,
        selectedTheme: newAppUser.selectedTheme,
        selectedBackground: newAppUser.selectedBackground,
      },
    })
  }

  // 5. Build update data (only include provided fields with valid values)
  const updateData: Record<string, any> = {}

  const validLanguages = ['en', 'ar', 'fa']

  if (selectedLanguage && validLanguages.includes(selectedLanguage)) {
    updateData.selectedLanguage = selectedLanguage
  }
  if (selectedTheme) {
    updateData.selectedTheme = selectedTheme
  }
  if (selectedBackground !== undefined && selectedBackground !== null) {
    updateData.selectedBackground = selectedBackground
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid config fields provided' }, { status: 400 })
  }

  // 6. Update AppUser
  const updatedUser = await payload.update({
    collection: 'app-users',
    id: appUserResult.docs[0].id,
    data: updateData,
  })

  return NextResponse.json({
    success: true,
    config: {
      selectedLanguage: updatedUser.selectedLanguage,
      selectedTheme: updatedUser.selectedTheme,
      selectedBackground: updatedUser.selectedBackground,
    },
  })
}

// GET endpoint to retrieve current user config
export async function GET(req: Request) {
  // 1. Authenticate User
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')

  let userId: string

  try {
    const { payload: jwtPayload } = await jwtVerify(token, JWKS, {
      issuer: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    })
    userId = jwtPayload.sub as string
  } catch (err) {
    console.error('JWT verification failed:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // 2. Initialize Payload
  const payload = await getPayload({ config })

  // 3. Lookup AppUser
  const appUserResult = await payload.find({
    collection: 'app-users',
    where: {
      supabaseId: {
        equals: userId,
      },
    },
    limit: 1,
    depth: 1, // Include related wallpaper data
  })

  if (appUserResult.docs.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const user = appUserResult.docs[0]

  return NextResponse.json({
    selectedLanguage: user.selectedLanguage,
    selectedTheme: user.selectedTheme,
    selectedBackground: user.selectedBackground,
  })
}
