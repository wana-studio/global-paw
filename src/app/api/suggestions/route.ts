import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

export async function POST(req: Request) {
  const { query } = await req.json()

  if (!query || typeof query !== 'string') {
    return new Response(JSON.stringify({ error: 'Query is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Generate search suggestions using AI
  const systemPrompt = `you're an expert search assistant.
With every query I give you, you give me 3 similar queries (follow-up questions).
# Rules:
 - Only send 3 queries.
 - Each query must be at most 80 characters.
 - based on query's language, ALWAYS respond in PERSIAN or ENGLISH.
# Guidelines:
 - If the query violates the rules, you should return an empty array.
 - If the query is not clear, you should return an empty array.
 - If the query contains hate speech, offensive language, or any other inappropriate content, you should return an empty array.
Your output:
["query1", "query2", "query3"]`

  try {
    const result = await generateText({
      model: google('gemma-3n-e4b-it'), // Using a lighter model for faster suggestions
      messages: [
        {
          role: 'user',
          content: `query: ${query}`,
        },
      ],
      system: systemPrompt,
      temperature: 0.7,
    })

    // Parse the response to extract the array of suggestions
    let suggestions: string[] = []
    try {
      // Try to parse as JSON array
      suggestions = JSON.parse(result.text)

      // Validate that it's an array of strings
      if (!Array.isArray(suggestions) || suggestions.length !== 3) {
        suggestions = []
      }
    } catch {
      // If parsing fails, return empty array
      suggestions = []
    }

    return new Response(JSON.stringify({ suggestions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate suggestions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
