import { jwtVerify } from 'jose'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import config from '@payload-config'
import { getPayload } from 'payload'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, prompt, conversationId } = await req.json()

  // Convert AI SDK v5 message format (parts[].text) to standard format (content)
  let _messages = messages?.map((msg: any) => ({
    role: msg.role,
    content: msg.parts?.map((p: any) => p.text).join('') || msg.content || '',
  }))

  if (!_messages?.length && prompt) {
    _messages = [{ role: 'user', content: prompt }]
  }

  // 1. Authenticate User via local JWT verification (faster than Supabase API call)
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthenticated', { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')

  let userId: string
  let userEmail: string | undefined

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET),
    )
    userId = payload.sub as string
    userEmail = payload.email as string | undefined
  } catch {
    return new Response('Unauthorized', { status: 403 })
  }

  // 2. Initialize Payload
  const payload = await getPayload({ config })

  // 3. Lookup or Create AppUser
  let appUser = await payload.find({
    collection: 'app-users',
    where: {
      supabaseId: {
        equals: userId,
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
        supabaseId: userId,
        email: userEmail || '',
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

  return result.toUIMessageStreamResponse({
    headers: {
      'x-conversation-id': activeConversationId,
    },
  })
}
