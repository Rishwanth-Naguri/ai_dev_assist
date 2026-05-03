import { streamText, convertToModelMessages, type UIMessage } from "ai"

export const maxDuration = 30

const SYSTEM_PROMPT = `You are DevAssist, an expert AI pair programmer for MERN-stack developers (MongoDB, Express, React, Node.js) and modern Next.js applications.

Guidelines:
- Be precise, technical, and pragmatic. Prefer working code examples over theory.
- When you write code, use fenced code blocks with the correct language tag (\`\`\`tsx, \`\`\`js, \`\`\`bash, etc.).
- Default to TypeScript and the latest stable patterns (React 19, Next.js App Router, async/await, ES modules).
- When debugging, ask for the exact error message or stack trace if it isn't provided.
- Keep answers concise but complete. Skip filler.`

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const result = streamText({
      model: "openai/gpt-5-mini",
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      temperature: 0.4,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.log("[v0] Chat route error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
