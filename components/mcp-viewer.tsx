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
  Activity,
  Search,
  AlertTriangle,
  GitCommit,
  Scale,
  Clock,
  Code2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type RepoData = {
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
  recentCommits: {
    sha: string
    message: string
    author: string
    date: string
    url: string
  }[]
}

type ToolCall = { toolName: string; input: unknown }

type RepoResponse = {
  data: RepoData
  meta: {
    owner: string
    repo: string
    toolCalls: ToolCall[]
    steps: number
  }
}

type ToolsResponse = {
  connected: boolean
  server?: string
  transport?: string
  count?: number
  tools?: { name: string; description: string }[]
  error?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const EXAMPLES = ["vercel/next.js", "facebook/react", "expressjs/express", "mongodb/node-mongodb-native"]

export function MCPViewer() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<RepoResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: toolsData, isLoading: toolsLoading } = useSWR<ToolsResponse>("/api/mcp/tools", fetcher, {
    revalidateOnFocus: false,
  })

  const fetchRepo = async (value?: string) => {
    const target = (value ?? input).trim()
    if (!target) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/mcp/repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: target }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Request failed with ${res.status}`)
      }

      const data: RepoResponse = await res.json()
      setResult(data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "MCP request failed"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">MCP Data Viewer</h1>
          <ConnectionBadge tools={toolsData} loading={toolsLoading} />
        </div>
        <p className="text-sm text-muted-foreground text-pretty">
          Live connection to the official{" "}
          <a
            href="https://github.com/github/github-mcp-server"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-2 hover:underline"
          >
            GitHub MCP server
          </a>{" "}
          via Streamable HTTP. The model below uses real MCP tools — no mocks.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Fetch Repo Data</CardTitle>
              <CardDescription>
                Enter a GitHub repository URL or <code className="rounded bg-muted px-1 font-mono">owner/repo</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  fetchRepo()
                }}
                className="flex flex-col gap-2 sm:flex-row"
              >
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="https://github.com/vercel/next.js"
                    className="pl-9 font-mono text-sm"
                    disabled={loading}
                  />
                </div>
                <Button type="submit" disabled={loading || !input.trim()} className="sm:w-auto">
                  {loading ? (
                    <>
                      <Spinner className="size-4" />
                      Fetching…
                    </>
                  ) : (
                    <>
                      <Github className="size-4" />
                      Fetch Repo Data
                    </>
                  )}
                </Button>
              </form>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-muted-foreground">Try:</span>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => {
                      setInput(ex)
                      fetchRepo(ex)
                    }}
                    disabled={loading}
                    className="rounded-md border border-border bg-muted/30 px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {loading && <RepoSkeleton />}

          {error && !loading && (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertTriangle className="mt-0.5 size-4 text-destructive" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">MCP request failed</p>
                  <p className="text-xs text-muted-foreground">{error}</p>
                  <p className="text-xs text-muted-foreground">
                    Make sure <code className="rounded bg-muted px-1 font-mono">GITHUB_TOKEN</code> is configured with{" "}
                    <code className="rounded bg-muted px-1 font-mono">public_repo</code> scope.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && !loading && <RepoCard result={result} />}
        </div>

        <ToolsPanel tools={toolsData} loading={toolsLoading} />
      </div>
    </div>
  )
}

function ConnectionBadge({ tools, loading }: { tools: ToolsResponse | undefined; loading: boolean }) {
  if (loading) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <Spinner className="size-3" />
        Connecting…
      </Badge>
    )
  }
  if (!tools || tools.connected === false) {
    return (
      <Badge variant="destructive" className="gap-1.5">
        <Plug className="size-3" />
        Disconnected
      </Badge>
    )
  }
  return (
    <Badge className="gap-1.5 bg-primary/15 text-primary hover:bg-primary/15">
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-primary" />
      </span>
      Connected · {tools.count} tools
    </Badge>
  )
}

function RepoCard({ result }: { result: RepoResponse }) {
  const { data, meta } = result
  return (
    <Card className="overflow-hidden border-border bg-card animate-in fade-in slide-in-from-bottom-2 duration-300">
      <CardHeader className="border-b border-border bg-muted/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <a
              href={data.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 text-lg font-semibold tracking-tight hover:text-primary"
            >
              <Github className="size-4" />
              {data.fullName}
              <ExternalLink className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
            {data.description && (
              <p className="max-w-2xl text-sm text-muted-foreground text-pretty">{data.description}</p>
            )}
          </div>

          {data.language && (
            <Badge variant="secondary" className="font-mono text-[10px]">
              {data.language}
            </Badge>
          )}
        </div>

        {data.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {data.topics.slice(0, 8).map((t) => (
              <span
                key={t}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-px bg-border p-0 sm:grid-cols-3 lg:grid-cols-6">
        <Stat icon={Star} label="Stars" value={data.stars.toLocaleString()} />
        <Stat icon={GitFork} label="Forks" value={data.forks.toLocaleString()} />
        <Stat icon={Eye} label="Watchers" value={data.watchers.toLocaleString()} />
        <Stat icon={CircleDot} label="Open issues" value={data.openIssues.toLocaleString()} />
        <Stat icon={Code2} label="Language" value={data.language || "—"} mono={!!data.language} />
        <Stat
          icon={Scale}
          label="License"
          value={data.license || "—"}
        />
      </CardContent>
      {data.pushedAt && (
        <div className="flex items-center gap-2 border-t border-border bg-muted/10 px-5 py-2 text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          Last push{" "}
          {new Date(data.pushedAt).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}

      <Separator />

      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <GitCommit className="size-4 text-muted-foreground" />
            Recent commits
            {data.defaultBranch && (
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {data.defaultBranch}
              </span>
            )}
          </h3>
        </div>

        {data.recentCommits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No commits returned by MCP.</p>
        ) : (
          <ul className="space-y-2">
            {data.recentCommits.map((c) => (
              <li
                key={c.sha}
                className="group flex items-start gap-3 rounded-md border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
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
                  <p className="truncate text-sm">{c.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.author} ·{" "}
                    {new Date(c.date).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {meta.toolCalls.length > 0 && (
        <>
          <Separator />
          <div className="bg-muted/10 px-5 py-3">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <Activity className="size-3" />
              MCP tool calls ({meta.steps} steps)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {meta.toolCalls.map((tc, i) => (
                <span
                  key={i}
                  className="rounded border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  {tc.toolName}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  mono = true,
}: {
  icon: typeof Star
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 bg-card p-4 transition-colors hover:bg-muted/20">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <span
        className={cn(
          "truncate text-lg font-semibold tabular-nums",
          mono ? "font-mono" : "font-sans",
        )}
        title={value}
      >
        {value}
      </span>
    </div>
  )
}

function ToolsPanel({ tools, loading }: { tools: ToolsResponse | undefined; loading: boolean }) {
  return (
    <Card className="h-fit border-border bg-card lg:sticky lg:top-20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Wrench className="size-4 text-muted-foreground" />
          MCP Tools
        </CardTitle>
        <CardDescription className="text-xs">
          Live <code className="rounded bg-muted px-1 font-mono">tools/list</code> from the MCP server.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : !tools?.connected ? (
          <div className="space-y-2 p-4 text-xs">
            <div className="flex items-start gap-2 text-destructive">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <p>{tools?.error || "Could not connect to the MCP server."}</p>
            </div>
            <p className="text-muted-foreground">
              Set the <code className="rounded bg-muted px-1 font-mono">GITHUB_TOKEN</code> environment variable
              with a Personal Access Token (
              <code className="rounded bg-muted px-1 font-mono">public_repo</code> scope is enough).
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[420px]">
            <ul className="divide-y divide-border">
              {tools.tools?.map((t) => (
                <li key={t.name} className="px-4 py-2.5 text-xs transition-colors hover:bg-muted/40">
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "mt-1 inline-block size-1.5 shrink-0 rounded-full",
                        "bg-primary/70",
                      )}
                    />
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] font-medium">{t.name}</p>
                      {t.description && (
                        <p className="mt-0.5 line-clamp-2 text-muted-foreground">{t.description}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

function RepoSkeleton() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="space-y-2 border-b border-border">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-3 w-full max-w-md" />
      </CardHeader>
      <CardContent className="grid grid-cols-4 gap-px bg-border p-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 bg-card p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </CardContent>
      <div className="space-y-2 p-5">
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </Card>
  )
}
