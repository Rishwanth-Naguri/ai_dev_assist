"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Github,
  Star,
  GitFork,
  Eye,
  CircleDot,
  ExternalLink,
  Wrench,
  Plug,
  Search,
  AlertTriangle,
  GitCommit,
  Scale,
  Clock,
  Code2,
  RefreshCw,
  KeyRound,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type RepoData = {
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

type ToolsResponse = {
  connected: boolean
  server?: string
  transport?: string
  authenticatedAs?: string
  count?: number
  tools?: { name: string; description: string }[]
  kind?: "missing_token" | "invalid_token" | "mcp_forbidden" | "mcp_unreachable"
  error?: string
  hint?: string
}

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json())

const EXAMPLES = ["vercel/next.js", "facebook/react", "expressjs/express", "mongodb/node-mongodb-native"]

export function MCPViewer() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<RepoData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastInput, setLastInput] = useState<string | null>(null)

  const {
    data: toolsData,
    isLoading: toolsLoading,
    mutate: refetchTools,
  } = useSWR<ToolsResponse>("/api/mcp/tools", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const fetchRepo = async (value?: string) => {
    const target = (value ?? input).trim()
    if (!target) return
    setLoading(true)
    setError(null)
    setResult(null)
    setLastInput(target)

    try {
      const res = await fetch("/api/github-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: target }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Request failed with ${res.status}`)
      }

      const data: RepoData = await res.json()
      setResult(data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "GitHub API request failed"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const retryRepo = () => fetchRepo(lastInput || input)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 lg:px-8 lg:py-10">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tools</p>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight">MCP Data Viewer</h1>
          <ConnectionBadge tools={toolsData} loading={toolsLoading} />
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Repository data is fetched live from the GitHub REST API on the server using a secure{" "}
          <code className="rounded border border-border bg-card px-1 font-mono text-[11px]">GITHUB_TOKEN</code>.
          The connection badge reflects the live{" "}
          <a
            href="https://github.com/github/github-mcp-server"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-2 hover:underline"
          >
            GitHub MCP server
          </a>{" "}
          tool list.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-medium">Fetch repo data</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Enter a GitHub URL or{" "}
              <code className="rounded border border-border bg-background px-1 font-mono text-[10px]">owner/repo</code>.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                fetchRepo()
              }}
              className="mt-3 flex flex-col gap-2 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="https://github.com/vercel/next.js"
                  className="h-9 pl-9 font-mono text-sm"
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading || !input.trim()} size="sm" className="h-9">
                {loading ? (
                  <>
                    <Spinner className="size-3.5" />
                    Fetching…
                  </>
                ) : (
                  <>
                    <Github className="size-3.5" />
                    Fetch
                  </>
                )}
              </Button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">Try:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setInput(ex)
                    fetchRepo(ex)
                  }}
                  disabled={loading}
                  className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {loading && <RepoSkeleton />}

          {error && !loading && (
            <RepoError error={error} onRetry={retryRepo} />
          )}

          {result && !loading && <RepoCard data={result} />}

          {!result && !loading && !error && <EmptyRepo />}
        </div>

        <ToolsPanel tools={toolsData} loading={toolsLoading} onRetry={() => refetchTools()} />
      </div>
    </div>
  )
}

function ConnectionBadge({
  tools,
  loading,
}: {
  tools: ToolsResponse | undefined
  loading: boolean
}) {
  if (loading) {
    return (
      <Badge variant="outline" className="gap-1.5 border-border bg-card font-mono text-[10px]">
        <Spinner className="size-2.5" />
        Connecting
      </Badge>
    )
  }
  if (!tools || tools.connected === false) {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-amber-500/30 bg-amber-500/10 font-mono text-[10px] text-amber-500"
      >
        <Plug className="size-2.5" />
        Offline
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-500"
    >
      <span className="size-1.5 rounded-full bg-emerald-500" />
      Connected · {tools.count} tools
    </Badge>
  )
}

function EmptyRepo() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 p-10 text-center">
      <div className="flex size-9 items-center justify-center rounded-md border border-border bg-background">
        <Github className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">No repository loaded</p>
      <p className="max-w-xs text-xs text-muted-foreground leading-relaxed">
        Enter a GitHub repository above or pick one of the suggestions to see live stars, language, license,
        and recent commits.
      </p>
    </div>
  )
}

function RepoError({ error, onRetry }: { error: string; onRetry: () => void }) {
  const isAuth = /401|403|token|unauthor|forbidden/i.test(error)
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        {isAuth ? (
          <KeyRound className="mt-0.5 size-4 shrink-0 text-destructive" />
        ) : (
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
        )}
        <div className="flex-1 space-y-1.5">
          <p className="text-sm font-medium">
            {isAuth ? "GitHub rejected the request" : "Could not fetch repository"}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>
          {isAuth && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verify that{" "}
              <code className="rounded border border-border bg-background px-1 font-mono text-[10px]">
                GITHUB_TOKEN
              </code>{" "}
              is set with{" "}
              <code className="rounded border border-border bg-background px-1 font-mono text-[10px]">
                public_repo
              </code>{" "}
              scope.
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={onRetry}>
          <RefreshCw className="size-3" />
          Retry
        </Button>
      </div>
    </div>
  )
}

function RepoCard({ data }: { data: RepoData }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Header */}
      <header className="border-b border-border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <a
              href={data.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 text-base font-semibold tracking-tight hover:text-primary"
            >
              <Github className="size-4 text-muted-foreground" />
              {data.fullName}
              <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
            {data.description && (
              <p className="max-w-2xl text-xs text-muted-foreground leading-relaxed">{data.description}</p>
            )}
          </div>
          {data.language && (
            <Badge variant="outline" className="border-border bg-background font-mono text-[10px]">
              {data.language}
            </Badge>
          )}
        </div>
        {data.topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.topics.slice(0, 8).map((t) => (
              <span
                key={t}
                className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Stats grid */}
      <div className="grid grid-cols-2 divide-x divide-border border-b border-border sm:grid-cols-3 lg:grid-cols-6">
        <Stat icon={Star} label="Stars" value={data.stars.toLocaleString()} />
        <Stat icon={GitFork} label="Forks" value={data.forks.toLocaleString()} />
        <Stat icon={Eye} label="Watchers" value={data.watchers.toLocaleString()} />
        <Stat icon={CircleDot} label="Issues" value={data.openIssues.toLocaleString()} />
        <Stat icon={Code2} label="Language" value={data.language || "—"} />
        <Stat icon={Scale} label="License" value={data.license || "—"} />
      </div>

      {/* Timestamps */}
      {(data.pushedAt || data.updatedAt) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-4 py-2 font-mono text-[10px] text-muted-foreground">
          {data.pushedAt && (
            <span className="flex items-center gap-1.5">
              <GitCommit className="size-3" />
              Pushed <time dateTime={data.pushedAt}>{formatDateTime(data.pushedAt)}</time>
            </span>
          )}
          {data.updatedAt && (
            <span className="flex items-center gap-1.5">
              <Clock className="size-3" />
              Updated <time dateTime={data.updatedAt}>{formatDateTime(data.updatedAt)}</time>
            </span>
          )}
        </div>
      )}

      {/* Recent commits */}
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-xs font-medium">
            <GitCommit className="size-3.5 text-muted-foreground" />
            Recent commits
            {data.defaultBranch && (
              <span className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {data.defaultBranch}
              </span>
            )}
          </h3>
        </div>
        {data.recentCommits.length === 0 ? (
          <p className="text-xs text-muted-foreground">No commits returned by the GitHub API.</p>
        ) : (
          <ul className="space-y-1.5">
            {data.recentCommits.map((c) => (
              <li
                key={c.sha}
                className="group flex items-start gap-3 rounded-md border border-border bg-background px-3 py-2 transition-colors hover:bg-accent"
              >
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] text-primary hover:underline"
                  title={c.sha}
                >
                  {c.sha.slice(0, 7)}
                </a>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs">{c.message}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {c.author}
                    {c.date ? ` · ${formatDateTime(c.date)}` : ""}
                  </p>
                </div>
                <ExternalLink className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <p className="mt-1 truncate font-mono text-sm font-semibold tabular-nums" title={value}>
        {value}
      </p>
    </div>
  )
}

function ToolsPanel({
  tools,
  loading,
  onRetry,
}: {
  tools: ToolsResponse | undefined
  loading: boolean
  onRetry: () => void
}) {
  return (
    <aside className="h-fit rounded-lg border border-border bg-card lg:sticky lg:top-16">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Wrench className="size-3.5 text-muted-foreground" />
          <span className="text-sm font-medium">MCP Tools</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onRetry}
          disabled={loading}
          title="Refresh"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>
      <p className="border-b border-border px-4 py-2 font-mono text-[10px] text-muted-foreground">
        live tools/list
      </p>

      {loading ? (
        <div className="space-y-1.5 p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : !tools?.connected ? (
        <ToolsErrorState tools={tools} onRetry={onRetry} />
      ) : (
        <ScrollArea className="h-[420px]">
          <ul className="divide-y divide-border">
            {tools.tools?.map((t) => (
              <li
                key={t.name}
                className="px-4 py-2.5 transition-colors hover:bg-accent"
              >
                <p className="font-mono text-[11px] font-medium text-foreground">{t.name}</p>
                {t.description && (
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                    {t.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </aside>
  )
}

function ToolsErrorState({
  tools,
  onRetry,
}: {
  tools: ToolsResponse | undefined
  onRetry: () => void
}) {
  const kind = tools?.kind
  const error = tools?.error || "Could not connect to the MCP server."
  const hint =
    tools?.hint ||
    "Set GITHUB_TOKEN with at least the public_repo scope, then retry."

  const Icon = kind === "missing_token" || kind === "invalid_token" ? KeyRound : AlertTriangle
  const tone =
    kind === "missing_token" || kind === "invalid_token"
      ? "border-amber-500/30 bg-amber-500/5 text-amber-500"
      : "border-destructive/30 bg-destructive/5 text-destructive"

  return (
    <div className="space-y-3 p-4">
      <div className={cn("flex items-start gap-2.5 rounded-md border p-3", tone)}>
        <Icon className="mt-0.5 size-4 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground">{titleFor(kind)}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{error}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{hint}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={onRetry}>
        <RefreshCw className="size-3" />
        Retry connection
      </Button>
      {(kind === "missing_token" || kind === "invalid_token") && (
        <a
          href="https://github.com/settings/tokens?type=beta"
          target="_blank"
          rel="noreferrer"
          className="block text-center text-[11px] font-medium text-primary hover:underline"
        >
          Generate a new token →
        </a>
      )}
    </div>
  )
}

function titleFor(kind: ToolsResponse["kind"]) {
  switch (kind) {
    case "missing_token":
      return "Token not configured"
    case "invalid_token":
      return "Token rejected by GitHub"
    case "mcp_forbidden":
      return "Insufficient permissions"
    case "mcp_unreachable":
      return "MCP server unreachable"
    default:
      return "MCP unavailable"
  }
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function RepoSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="space-y-2 border-b border-border p-4">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-3 w-full max-w-md" />
      </div>
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2 p-3">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
      <div className="space-y-2 p-4">
        <Skeleton className="h-3.5 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  )
}
