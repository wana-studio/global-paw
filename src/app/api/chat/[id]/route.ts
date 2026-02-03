import { createClient } from '@supabase/supabase-js'
import config from '@payload-config'
import { getPayload } from 'payload'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

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

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
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
    return new Response('User not found', { status: 404 })
  }

  const appUserId = appUser.docs[0].id

  // 4. Fetch the conversation
  const conversation = await payload.findByID({
    collection: 'conversations',
    id,
  })

  if (!conversation) {
    return new Response('Conversation not found', { status: 404 })
  }

  // 5. Verify ownership
  const conversationOwnerId =
    typeof conversation.appUser === 'object' ? conversation.appUser.id : conversation.appUser

  if (conversationOwnerId !== appUserId) {
    return new Response('Forbidden', { status: 403 })
  }

  // 6. Fetch all messages for this conversation
  const messages = await payload.find({
    collection: 'messages',
    where: {
      conversation: {
        equals: id,
      },
    },
    sort: 'createdAt',
    limit: 1000,
  })

  // 7. Return formatted response
  return Response.json({
    id: conversation.id,
    title: conversation.title,
    messages: messages.docs.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
    })),
  })
}
