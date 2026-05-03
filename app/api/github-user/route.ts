// Server-only route handler. This file runs exclusively on the server,
// so `process.env.GITHUB_TOKEN` is never bundled into client-side code.
// Do NOT add a "use client" directive here, and do NOT import this file
// from any client component.

export const runtime = "nodejs"
// Always execute on each request — never cache the authenticated response.
export const dynamic = "force-dynamic"

export async function GET() {
  const token = process.env.GITHUB_TOKEN

  // Fail fast with a generic message. Never echo the token (or its absence
  // details) back to the client beyond what's needed to debug configuration.
  if (!token) {
    return Response.json(
      { error: "Server is not configured: missing GITHUB_TOKEN." },
      { status: 500 },
    )
  }

  try {
    const ghRes = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        // GitHub accepts `Bearer <token>` for both classic PATs and
        // fine-grained tokens, as well as OAuth/installation tokens.
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        // GitHub requires a User-Agent header on all API requests.
        "User-Agent": "devassist-app",
      },
      // Avoid Next.js's data cache for an authenticated, user-specific call.
      cache: "no-store",
    })

    // Try to parse the body as JSON; fall back to text for non-JSON errors.
    const contentType = ghRes.headers.get("content-type") ?? ""
    const payload = contentType.includes("application/json")
      ? await ghRes.json()
      : { message: await ghRes.text() }

    if (!ghRes.ok) {
      // Forward GitHub's status code so clients can react appropriately,
      // but only return a sanitized error body — never the token or headers.
      return Response.json(
        {
          error: "GitHub API request failed.",
          status: ghRes.status,
          details:
            typeof payload === "object" && payload && "message" in payload
              ? (payload as { message: unknown }).message
              : undefined,
        },
        { status: ghRes.status },
      )
    }

    // Success: return the JSON payload directly to the caller.
    return Response.json(payload, { status: 200 })
  } catch (err) {
    console.error("[v0] /api/github-user fetch failed:", err)
    return Response.json(
      { error: "Failed to reach the GitHub API." },
      { status: 502 },
    )
  }
}
