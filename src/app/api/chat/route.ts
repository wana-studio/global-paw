import { createClient } from '@supabase/supabase-js'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import config from '@payload-config'
import { getPayload } from 'payload'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, prompt, conversationId } = await req.json()
  let _messages = messages
  if (!_messages?.length && prompt) {
    _messages = [{ role: 'user', content: prompt }]
  }
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

  // 3. Lookup or Create AppUser
  let appUser = await payload.find({
    collection: 'app-users',
    where: {
      supabaseId: {
        equals: user.id,
      },
    },
    limit: 1,
  })

  let appUserId: number

  if (appUser.docs.length === 0) {
    // Create new AppUser if not found (fallback if trigger didn't fire)
    const newAppUser = await payload.create({
      collection: 'app-users',
      data: {
        supabaseId: user.id,
        email: user.email || '',
      },
    })
    appUserId = newAppUser.id
  } else {
    appUserId = appUser.docs[0].id
  }

  // 4. Ensure Conversation Exists or Create New
  let activeConversationId = conversationId

  if (!activeConversationId) {
    const newConv = await payload.create({
      collection: 'conversations',
      data: {
        appUser: appUserId,
        title: _messages[0]?.content.slice(0, 50) || 'New Chat',
      },
    })
    activeConversationId = newConv.id
  }

  // 4. Save User Message
  const lastUserMessage = _messages[_messages.length - 1]
  if (lastUserMessage?.role === 'user') {
    await payload.create({
      collection: 'messages',
      data: {
        conversation: activeConversationId,
        role: 'user',
        content: lastUserMessage.content,
      },
    })
  }

  // 5. Call AI with Gemini 2.5 Flash and Google Search tool
  const result = streamText({
    model: google('gemini-2.5-flash'),
    tools: {
      google_search: google.tools.googleSearch({}),
    },
    messages: _messages,
    onFinish: async ({ text }) => {
      // 6. Save Assistant Message
      await payload.create({
        collection: 'messages',
        data: {
          conversation: activeConversationId,
          role: 'assistant',
          content: text || '',
        },
      })
    },
  })

  return result.toTextStreamResponse({
    headers: {
      'x-conversation-id': activeConversationId,
    },
  })
}
