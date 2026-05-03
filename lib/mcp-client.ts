import { createMCPClient, type MCPClient } from "@ai-sdk/mcp"

/**
 * The official GitHub remote MCP server.
 * Docs: https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md
 *
 * Requires a GitHub Personal Access Token (classic or fine-grained) with at
 * least the `public_repo` scope (or `repo` for private repositories) — set as
 * the `GITHUB_TOKEN` environment variable.
 */
export const GITHUB_MCP_URL = "https://api.githubcopilot.com/mcp/"

export type { MCPClient }

export async function createGitHubMCPClient(): Promise<MCPClient> {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN is not set. Add a GitHub Personal Access Token (with 'public_repo' scope) as an environment variable.",
    )
  }

  // Streamable HTTP transport with Bearer auth header.
  const client = await createMCPClient({
    transport: {
      type: "http",
      url: GITHUB_MCP_URL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    name: "devassist-github-mcp",
  })

  return client
}

/**
 * Parse a GitHub URL or "owner/repo" string into its parts.
 */
export function parseGitHubInput(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim().replace(/\.git$/, "").replace(/\/$/, "")

  // Full URL: https://github.com/owner/repo
  const urlMatch = trimmed.match(/github\.com[/:]([^/]+)\/([^/?#]+)/i)
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] }
  }

  // Short form: owner/repo
  const shortMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/)
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] }
  }

  return null
}
