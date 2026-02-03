import { createClient } from '@supabase/supabase-js'
import config from '@payload-config'
import { getPayload } from 'payload'

export async function GET(req: Request) {
  // 1. Authenticate User with Supabase
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthenticated', { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  console.log('fetching user by token', token)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    console.error('Error fetching user:', error)
    return new Response('Unauthorized', { status: 403 })
  }

  // 2. Initialize Payload
  const payload = await getPayload({ config })

  // 3. Lookup AppUser
  const appUser = await payload.find({
    collection: 'app-users',
    where: {
      supabaseId: {
        equals: user.id,
      },
    },
    limit: 1,
  })

  if (appUser.docs.length === 0) {
    return Response.json({ chats: [] })
  }

  const appUserId = appUser.docs[0].id

  // 4. Fetch all conversations for this user
  const conversations = await payload.find({
    collection: 'conversations',
    where: {
      appUser: {
        equals: appUserId,
      },
    },
    sort: '-createdAt',
    limit: 100,
  })

  // 5. Return formatted response
  const chats = conversations.docs.map((conv) => ({
    id: conv.id,
    title: conv.title || 'New Chat',
  }))

  return Response.json({ chats })
}
