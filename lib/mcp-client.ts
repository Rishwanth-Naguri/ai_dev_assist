import { createMCPClient, type MCPClient } from "@ai-sdk/mcp"

/**
 * The official GitHub remote MCP server.
 * Docs: https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md
 *
 * Requires a GitHub Personal Access Token (classic or fine-grained) with at
 * least the `public_repo` scope (or `repo` for private repositories) — set as
 * the `GITHUB_TOKEN` environment variable.
 *
 * Note: this endpoint is hosted by GitHub and may require a Copilot-enabled
 * account.  If the connection fails with 401, that's almost always because
 * the token is missing, malformed, or lacks the required scopes.
 */
export const GITHUB_MCP_URL = "https://api.githubcopilot.com/mcp/"

export type { MCPClient }

export class MCPAuthError extends Error {
  status: number
  hint: string
  constructor(message: string, status: number, hint: string) {
    super(message)
    this.name = "MCPAuthError"
    this.status = status
    this.hint = hint
  }
}

export class MCPTokenMissingError extends MCPAuthError {
  constructor() {
    super(
      "GITHUB_TOKEN environment variable is not set.",
      401,
      "Add a GitHub Personal Access Token with `public_repo` (and optionally `read:user`) scope as GITHUB_TOKEN in your project settings.",
    )
    this.name = "MCPTokenMissingError"
  }
}

/**
 * Validate the configured GITHUB_TOKEN by hitting the GitHub REST API.
 * This gives us a fast, deterministic auth check independent of the MCP
 * transport — so the UI can show a precise error instead of a generic 401.
 */
export async function validateGitHubToken(): Promise<{ ok: true; login: string } | { ok: false; error: MCPAuthError }> {
  const token = process.env.GITHUB_TOKEN
  if (!token || !token.trim()) {
    return { ok: false, error: new MCPTokenMissingError() }
  }

  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token.trim()}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "devassist-dashboard",
      },
      cache: "no-store",
    })

    if (res.status === 401) {
      return {
        ok: false,
        error: new MCPAuthError(
          "GitHub rejected the token (401).",
          401,
          "Your GITHUB_TOKEN is invalid or expired. Generate a new Personal Access Token at github.com/settings/tokens.",
        ),
      }
    }
    if (res.status === 403) {
      return {
        ok: false,
        error: new MCPAuthError(
          "GitHub forbade the request (403).",
          403,
          "The token is valid but lacks the required scopes. Grant at least `read:user` and `public_repo`.",
        ),
      }
    }
    if (!res.ok) {
      return {
        ok: false,
        error: new MCPAuthError(
          `GitHub responded with ${res.status}.`,
          res.status,
          "The GitHub REST API is temporarily unavailable. Try again in a moment.",
        ),
      }
    }

    const user = (await res.json()) as { login: string }
    return { ok: true, login: user.login }
  } catch (e) {
    return {
      ok: false,
      error: new MCPAuthError(
        e instanceof Error ? e.message : "Network error while contacting GitHub.",
        0,
        "Could not reach api.github.com. Check the deployment's outbound network.",
      ),
    }
  }
}

/**
 * Create the MCP client with explicit Bearer auth.  Headers are forwarded
 * by the AI SDK MCP HTTP transport on every JSON-RPC request.
 */
export async function createGitHubMCPClient(): Promise<MCPClient> {
  const token = process.env.GITHUB_TOKEN?.trim()
  if (!token) {
    throw new MCPTokenMissingError()
  }

  try {
    const client = await createMCPClient({
      transport: {
        type: "http",
        url: GITHUB_MCP_URL,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json, text/event-stream",
          "User-Agent": "devassist-dashboard",
        },
      },
      name: "devassist-github-mcp",
    })
    return client
  } catch (e) {
    // Classify the error so the UI can surface an actionable message.
    const message = e instanceof Error ? e.message : String(e)

    if (/401|unauthor/i.test(message)) {
      throw new MCPAuthError(
        "MCP server rejected the token (401).",
        401,
        "The MCP endpoint requires a valid GitHub Personal Access Token. Verify GITHUB_TOKEN and that your account can access the GitHub Copilot MCP server.",
      )
    }
    if (/403|forbidden/i.test(message)) {
      throw new MCPAuthError(
        "MCP server forbade the request (403).",
        403,
        "Your token lacks the required scopes for this MCP server. Grant at least `repo` and `read:user`.",
      )
    }
    if (/404/i.test(message)) {
      throw new MCPAuthError(
        "MCP endpoint not found (404).",
        404,
        "The GitHub MCP endpoint URL is incorrect or the service is unavailable.",
      )
    }
    throw e
  }
}

/**
 * Parse a GitHub URL or "owner/repo" string into its parts.
 */
export function parseGitHubInput(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim().replace(/\.git$/, "").replace(/\/$/, "")

  const urlMatch = trimmed.match(/github\.com[/:]([^/]+)\/([^/?#]+)/i)
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] }
  }

  const shortMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/)
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] }
  }

  return null
}
