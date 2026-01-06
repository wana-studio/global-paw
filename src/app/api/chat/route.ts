import { createClient } from '@supabase/supabase-js'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import config from '@payload-config'
import { getPayload } from 'payload'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, conversationId } = await req.json()

  // 1. Authenticate User with Supabase
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 })
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
    return new Response('Unauthorized', { status: 401 })
  }

  // 2. Initialize Payload
  const payload = await getPayload({ config })

  // 3. Ensure Conversation Exists or Create New
  let activeConversationId = conversationId

  if (!activeConversationId) {
    const newConv = await payload.create({
      collection: 'conversations',
      data: {
        userId: user.id,
        title: messages[0]?.content.slice(0, 50) || 'New Chat',
      },
    })
    activeConversationId = newConv.id
  }

  // 4. Save User Message
  const lastUserMessage = messages[messages.length - 1]
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
    model: google('gemini-2.5-flash-preview-05-20'),
    tools: {
      google_search: google.tools.googleSearch({}),
    },
    messages,
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
