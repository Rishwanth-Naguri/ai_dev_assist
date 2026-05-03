import { generateText, Output, stepCountIs } from "ai"
import { z } from "zod"
import { createGitHubMCPClient, parseGitHubInput } from "@/lib/mcp-client"

export const maxDuration = 60

const RepoDataSchema = z.object({
  fullName: z.string().describe("owner/repo"),
  description: z.string().nullable(),
  htmlUrl: z.string().describe("Public web URL of the repository"),
  stars: z.number().describe("Stargazer count"),
  forks: z.number().describe("Fork count"),
  watchers: z.number().describe("Watcher count"),
  openIssues: z.number().describe("Open issues count"),
  language: z.string().nullable().describe("Primary programming language"),
  defaultBranch: z.string().nullable(),
  topics: z.array(z.string()).describe("Topic tags"),
  license: z.string().nullable().describe("License SPDX id, e.g. 'MIT', or null"),
  pushedAt: z.string().nullable().describe("ISO timestamp of the last push"),
  recentCommits: z
    .array(
      z.object({
        sha: z.string(),
        message: z.string().describe("First line of the commit message"),
        author: z.string().describe("Commit author name or login"),
        date: z.string().describe("ISO timestamp of the commit"),
        url: z.string().describe("Public URL of the commit"),
      }),
    )
    .describe("The 5 most recent commits on the default branch."),
})

export type RepoData = z.infer<typeof RepoDataSchema>

export async function POST(req: Request) {
  let client: Awaited<ReturnType<typeof createGitHubMCPClient>> | null = null

  try {
    const { input } = (await req.json()) as { input: string }
    const parsed = parseGitHubInput(input ?? "")
    if (!parsed) {
      return new Response(
        JSON.stringify({
          error: "Could not parse GitHub URL. Use a full URL (https://github.com/owner/repo) or 'owner/repo'.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    const { owner, repo } = parsed

    client = await createGitHubMCPClient()
    const tools = await client.tools()

    // Let the model orchestrate the real GitHub MCP tools to fetch the data.
    const { experimental_output, steps } = await generateText({
      model: "openai/gpt-5-mini",
      tools,
      stopWhen: stepCountIs(8),
      system:
        "You are a tool-using agent. Use the connected GitHub MCP tools to fetch repository metadata and the 5 most recent commits on the default branch. Make as few tool calls as possible. Do not invent any values — only use data returned by the MCP tools. If a field is unavailable, return null (or an empty array).",
      prompt: `Repository: ${owner}/${repo}\n\n1) Fetch the repository's metadata.\n2) Fetch the 5 most recent commits on its default branch.\n3) Return the structured output.`,
      experimental_output: Output.object({ schema: RepoDataSchema }),
    })

    const toolCalls = steps
      .flatMap((s) => s.toolCalls ?? [])
      .map((c) => ({ toolName: c.toolName, input: c.input }))

    return Response.json({
      data: experimental_output,
      meta: {
        owner,
        repo,
        toolCalls,
        steps: steps.length,
      },
    })
  } catch (error) {
    console.log("[v0] MCP repo route error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "MCP request failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  } finally {
    try {
      await client?.close()
    } catch {
      /* ignore */
    }
  }
}
