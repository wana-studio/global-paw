import { Access } from 'payload'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Helper to get Supabase user from request headers
 */
async function getSupabaseUser(req: any) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null

  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) return null
  return user
}

/**
 * Check if request is authenticated with Supabase
 */
export const isAuthenticatedWithSupabase: Access = async ({ req }) => {
  // 1. If Payload Admin, allow
  if (req.user) return true

  // 2. Check for Supabase Token
  const supabaseUser = await getSupabaseUser(req)
  return !!supabaseUser
}

/**
 * Check if user owns the resource (via appUser.supabaseId)
 * Used for Conversations and related collections
 */
export const isSupabaseOwner: Access = async ({ req }) => {
  // Payload Admin can access everything
  if (req.user) return true

  const supabaseUser = await getSupabaseUser(req)
  if (!supabaseUser) return false

  // Return a query constraint that filters by appUser.supabaseId
  return {
    'appUser.supabaseId': {
      equals: supabaseUser.id,
    },
  }
}

/**
 * Check if user owns the AppUser record (by supabaseId)
 */
export const isAppUserOwner: Access = async ({ req }) => {
  if (req.user) return true

  const supabaseUser = await getSupabaseUser(req)
  if (!supabaseUser) return false

  return {
    supabaseId: {
      equals: supabaseUser.id,
    },
  }
}
