import { Access } from 'payload'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isAuthenticatedWithSupabase: Access = async ({ req }) => {
  // 1. If Payload Admin, allow
  if (req.user) return true

  // 2. Check for Supabase Token in Headers
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return false

  const token = authHeader.replace('Bearer ', '')

  // Initialize Supabase Client (Lazy or new instance)
  // Note: Creating a client every request is overhead, but acceptable for this scope.
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) return false

  // Attach Supabase User to Request for usage in hooks/fields?
  // req.payload.customState = { supabaseUser: user }
  // (req as any).supabaseUser = user // Typescript might complain

  return true
}

export const isSupabaseOwner: Access = async ({ req, data }) => {
  // Similar logic but checks if data.userId === supabaseUser.id
  // This is harder because 'access' runs before we fully have the user context without re-fetching.
  // For 'conversations', we can filter by userId.

  if (req.user) return true

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) return false

  return {
    userId: {
      equals: user.id,
    },
  }
}
