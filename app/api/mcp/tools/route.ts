import {
  createGitHubMCPClient,
  validateGitHubToken,
  MCPAuthError,
  MCPTokenMissingError,
} from "@/lib/mcp-client"

export const maxDuration = 30
export const dynamic = "force-dynamic"

/**
 * Lists the tools exposed by the connected GitHub MCP server.
 * This is a real MCP `tools/list` call over Streamable HTTP transport.
 *
 * Strategy:
 *   1. Pre-validate GITHUB_TOKEN with a cheap REST call (api.github.com/user).
 *      This gives us a deterministic, well-classified auth error before we
 *      ever hit the MCP transport.
 *   2. Open the MCP client with `Authorization: Bearer ${GITHUB_TOKEN}`.
 *   3. Call `tools/list` and return the real tool descriptors.
 */
export async function GET() {
  // Step 1 — token sanity check.
  const tokenCheck = await validateGitHubToken()
  if (!tokenCheck.ok) {
    const err = tokenCheck.error
    return Response.json(
      {
        connected: false,
        kind: err.name === "MCPTokenMissingError" ? "missing_token" : "invalid_token",
        error: err.message,
        hint: err.hint,
      },
      { status: 200 }, // 200 so SWR doesn't throw — the UI handles `connected: false`.
    )
  }

  // Step 2/3 — connect to MCP and list tools.
  let client: Awaited<ReturnType<typeof createGitHubMCPClient>> | null = null
  try {
    client = await createGitHubMCPClient()
    const tools = await client.tools()
    const toolList = Object.entries(tools).map(([name, tool]) => ({
      name,
      description: (tool as { description?: string }).description ?? "",
    }))

    return Response.json({
      connected: true,
      server: "github-mcp-server (remote)",
      transport: "streamable-http",
      authenticatedAs: tokenCheck.login,
      count: toolList.length,
      tools: toolList,
    })
  } catch (error) {
    console.error("[mcp/tools] error:", error)

    if (error instanceof MCPTokenMissingError) {
      return Response.json(
        { connected: false, kind: "missing_token", error: error.message, hint: error.hint },
        { status: 200 },
      )
    }
    if (error instanceof MCPAuthError) {
      return Response.json(
        {
          connected: false,
          kind: error.status === 401 ? "invalid_token" : "mcp_forbidden",
          error: error.message,
          hint: error.hint,
        },
        { status: 200 },
      )
    }
    return Response.json(
      {
        connected: false,
        kind: "mcp_unreachable",
        error: error instanceof Error ? error.message : "Failed to connect to MCP server.",
        hint: "The MCP endpoint may be temporarily unavailable. Try again shortly.",
      },
      { status: 200 },
    )
  } finally {
    try {
      await client?.close()
    } catch {
      /* ignore close errors */
    }
  }
}
