import { createGitHubMCPClient } from "@/lib/mcp-client"

export const maxDuration = 30

/**
 * Lists the tools exposed by the connected GitHub MCP server.
 * This is a real MCP `tools/list` call over Streamable HTTP transport.
 */
export async function GET() {
  let client: Awaited<ReturnType<typeof createGitHubMCPClient>> | null = null

  try {
    client = await createGitHubMCPClient()
    const tools = await client.tools()

    const toolList = Object.entries(tools).map(([name, tool]) => ({
      name,
      description:
        // AI SDK tool objects expose their description on `.description`
        (tool as { description?: string }).description ?? "",
    }))

    return Response.json({
      connected: true,
      server: "github-mcp-server (remote)",
      transport: "streamable-http",
      count: toolList.length,
      tools: toolList,
    })
  } catch (error) {
    console.log("[v0] MCP tools/list error:", error)
    return new Response(
      JSON.stringify({
        connected: false,
        error: error instanceof Error ? error.message : "Failed to connect to MCP server",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  } finally {
    try {
      await client?.close()
    } catch {
      /* ignore close errors */
    }
  }
}
