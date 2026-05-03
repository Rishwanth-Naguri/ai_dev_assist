import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RepoPayload = {
  name: string
  fullName: string
  description: string | null
  htmlUrl: string
  stars: number
  forks: number
  watchers: number
  openIssues: number
  language: string | null
  defaultBranch: string | null
  topics: string[]
  license: string | null
  pushedAt: string | null
  updatedAt: string | null
  recentCommits: {
    sha: string
    message: string
    author: string
    date: string
    url: string
  }[]
}

/**
 * Parses any of the following inputs into { owner, repo }:
 *   - https://github.com/vercel/next.js
 *   - http://github.com/vercel/next.js.git
 *   - github.com/vercel/next.js/tree/canary
 *   - git@github.com:vercel/next.js.git
 *   - vercel/next.js
 */
function parseRepoInput(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // SSH form: git@github.com:owner/repo(.git)
  const ssh = /^git@github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?$/i.exec(trimmed)
  if (ssh) return { owner: ssh[1], repo: ssh[2] }

  // URL forms
  const urlLike = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const u = new URL(urlLike)
    if (u.hostname.replace(/^www\./, "") === "github.com") {
      const parts = u.pathname.split("/").filter(Boolean)
      if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1].replace(/\.git$/i, "") }
      }
    }
  } catch {
    // Fall through to owner/repo parsing
  }

  // Plain "owner/repo"
  const slug = /^([^/\s]+)\/([^/\s]+?)(?:\.git)?$/.exec(trimmed)
  if (slug) return { owner: slug[1], repo: slug[2] }

  return null
}

const GITHUB_API = "https://api.github.com"

function ghHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "devassist-dashboard",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function POST(req: Request) {
  if (!process.env.GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN environment variable is not configured." },
      { status: 500 },
    )
  }

  let body: { input?: string; url?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const raw = body.input ?? body.url ?? ""
  const parsed = parseRepoInput(raw)
  if (!parsed) {
    return NextResponse.json(
      {
        error:
          "Could not parse a GitHub repository from the input. Provide a URL like https://github.com/owner/repo or 'owner/repo'.",
      },
      { status: 400 },
    )
  }

  const { owner, repo } = parsed

  try {
    // 1) Repo metadata
    const repoRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
      headers: ghHeaders(),
      cache: "no-store",
    })

    if (!repoRes.ok) {
      const detail = await repoRes.text().catch(() => "")
      const status = repoRes.status
      const message =
        status === 404
          ? `Repository ${owner}/${repo} not found.`
          : status === 401 || status === 403
            ? "GitHub rejected the token. Check that GITHUB_TOKEN is valid and has repo read access."
            : `GitHub API request failed (${status}).`
      console.error("[github-repo] repo fetch failed", { status, detail: detail.slice(0, 200) })
      return NextResponse.json({ error: message }, { status })
    }

    const r = await repoRes.json()

    // 2) Recent commits on the default branch (best effort — don't fail the whole request)
    let commits: RepoPayload["recentCommits"] = []
    try {
      const commitsRes = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(r.default_branch)}&per_page=5`,
        { headers: ghHeaders(), cache: "no-store" },
      )
      if (commitsRes.ok) {
        const list = (await commitsRes.json()) as Array<{
          sha: string
          html_url: string
          commit: {
            message: string
            author: { name?: string; date?: string } | null
          }
          author: { login?: string } | null
        }>
        commits = list.map((c) => ({
          sha: c.sha,
          message: (c.commit?.message ?? "").split("\n")[0],
          author: c.author?.login || c.commit?.author?.name || "unknown",
          date: c.commit?.author?.date || "",
          url: c.html_url,
        }))
      }
    } catch (e) {
      console.error("[github-repo] commits fetch failed", e)
    }

    const payload: RepoPayload = {
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      htmlUrl: r.html_url,
      stars: r.stargazers_count ?? 0,
      forks: r.forks_count ?? 0,
      watchers: r.subscribers_count ?? r.watchers_count ?? 0,
      openIssues: r.open_issues_count ?? 0,
      language: r.language ?? null,
      defaultBranch: r.default_branch ?? null,
      topics: Array.isArray(r.topics) ? r.topics : [],
      license: r.license?.spdx_id || r.license?.name || null,
      pushedAt: r.pushed_at ?? null,
      updatedAt: r.updated_at ?? null,
      recentCommits: commits,
    }

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (e) {
    console.error("[github-repo] unexpected error", e)
    return NextResponse.json(
      { error: "Unexpected server error while contacting the GitHub API." },
      { status: 502 },
    )
  }
}
