import { generateText, Output } from "ai"
import { z } from "zod"

export const maxDuration = 60

const AnalysisSchema = z.object({
  language: z.string().describe("Detected programming language, e.g. 'JavaScript', 'TypeScript', 'JSX'"),
  summary: z.string().describe("One-paragraph summary of what the code does and its overall quality."),
  bugs: z
    .array(
      z.object({
        severity: z.enum(["low", "medium", "high", "critical"]),
        title: z.string(),
        description: z.string(),
        line: z.number().nullable().describe("Approximate line number if identifiable, otherwise null."),
      }),
    )
    .describe("List of bugs, errors, and serious issues found in the code."),
  suggestions: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    )
    .describe("Actionable improvements for performance, readability, security, or best practices."),
  improvedCode: z
    .string()
    .describe("A revised version of the original code with bugs fixed and suggestions applied. Plain code only, no markdown fences."),
})

export type CodeAnalysis = z.infer<typeof AnalysisSchema>

export async function POST(req: Request) {
  try {
    const { code } = (await req.json()) as { code: string }

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Code is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (code.length > 20_000) {
      return new Response(
        JSON.stringify({ error: "Code is too long. Please keep it under 20,000 characters." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    const { experimental_output } = await generateText({
      model: "openai/gpt-5-mini",
      system:
        "You are a senior MERN-stack code reviewer. Analyze the user's code precisely. Identify real bugs (not stylistic nits), suggest concrete improvements, and rewrite the code with the fixes applied. Be honest — if there are no bugs, return an empty bugs array.",
      prompt: `Analyze the following code and respond with structured output.\n\n\`\`\`\n${code}\n\`\`\``,
      experimental_output: Output.object({ schema: AnalysisSchema }),
    })

    return Response.json(experimental_output)
  } catch (error) {
    console.log("[v0] Analyze route error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to analyze code",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
