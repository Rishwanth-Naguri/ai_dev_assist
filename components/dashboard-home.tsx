"use client"

import Link from "next/link"
import useSWR from "swr"
import {
  ArrowRight,
  MessageSquare,
  Code2,
  Github,
  UserRound,
  Sparkles,
  Wrench,
  Star,
  Users,
  BookOpen,
  Bot,
  Activity,
  TrendingUp,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type GithubUser = {
  login?: string
  name?: string | null
  avatar_url?: string
  public_repos?: number
  followers?: number
  following?: number
  public_gists?: number
}

type ToolsResponse = {
  connected: boolean
  count: number
}

const QUICK_LINKS = [
  {
    href: "/chat",
    title: "AI Chat",
    description: "Stream answers from gpt-5-mini with code-aware formatting.",
    icon: MessageSquare,
    cta: "Start chatting",
  },
  {
    href: "/analyzer",
    title: "Code Analyzer",
    description: "Detect bugs, get suggestions, and ship a fixed version of your code.",
    icon: Code2,
    cta: "Analyze code",
  },
  {
    href: "/mcp",
    title: "MCP Data Viewer",
    description: "Inspect any GitHub repo via the official MCP server and live REST API.",
    icon: Github,
    cta: "Connect a repo",
  },
  {
    href: "/account",
    title: "GitHub Account",
    description: "Securely fetch your authenticated GitHub user via a server route.",
    icon: UserRound,
    cta: "View profile",
  },
]

export function DashboardHome() {
  const { data: user, isLoading: userLoading } = useSWR<GithubUser>("/api/github-user", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })
  const { data: tools, isLoading: toolsLoading } = useSWR<ToolsResponse>("/api/mcp/tools", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border/60 glass p-6 md:p-10 glow-card animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, oklch(0.78 0.14 195 / 0.35), transparent 70%)",
          }}
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-4 inline-flex items-center gap-1.5 rounded-full border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
            >
              <Sparkles className="size-3" />
              Powered by AI SDK 6 · MCP · GitHub
            </Badge>
            <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              Your <span className="gradient-text">AI-native</span> developer workspace.
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-sm text-muted-foreground md:text-base">
              Chat with a streaming model, analyze MERN code for real bugs, and pipe live GitHub data through the
              Model Context Protocol — all from one premium dashboard.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:translate-y-0"
            >
              <MessageSquare className="size-4" />
              Start a chat
            </Link>
            <Link
              href="/analyzer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card active:translate-y-0"
            >
              <Code2 className="size-4" />
              Analyze code
            </Link>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          icon={BookOpen}
          label="Public repos"
          value={user?.public_repos}
          loading={userLoading}
          accent="cyan"
        />
        <KpiCard
          icon={Users}
          label="Followers"
          value={user?.followers}
          loading={userLoading}
          accent="cyan"
        />
        <KpiCard
          icon={Wrench}
          label="MCP tools"
          value={tools?.count}
          loading={toolsLoading}
          accent="blue"
          status={tools?.connected ? "online" : tools ? "offline" : undefined}
        />
        <KpiCard
          icon={Bot}
          label="Models online"
          value={1}
          loading={false}
          accent="blue"
          status="online"
          suffix="gpt-5-mini"
        />
      </section>

      {/* Main + insights */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Quick start */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader
            title="Quick start"
            description="Jump straight into a workflow."
            icon={Sparkles}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {QUICK_LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20">
                    <link.icon className="size-5" />
                  </div>
                  <h3 className="text-base font-semibold tracking-tight">{link.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{link.description}</p>
                <div className="mt-auto flex items-center gap-1.5 text-xs font-medium text-primary">
                  <span>{link.cta}</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Insights rail */}
        <aside className="space-y-4">
          <SectionHeader
            title="Insights"
            description="Live signals from your workspace."
            icon={Activity}
          />

          {/* Profile snapshot */}
          <Card className="overflow-hidden border-border bg-card/70 backdrop-blur-sm">
            <div className="flex items-center gap-3 border-b border-border bg-gradient-to-br from-primary/10 to-transparent p-4">
              {userLoading ? (
                <Skeleton className="size-10 rounded-full" />
              ) : user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url || "/placeholder.svg"}
                  alt={user.login ? `@${user.login}` : "GitHub avatar"}
                  className="size-10 rounded-full ring-2 ring-primary/30"
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <UserRound className="size-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                {userLoading ? (
                  <>
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="mt-1.5 h-3 w-16" />
                  </>
                ) : user?.login ? (
                  <>
                    <p className="truncate text-sm font-medium leading-tight">
                      {user.name || user.login}
                    </p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      @{user.login}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium leading-tight">Not connected</p>
                    <p className="text-xs text-muted-foreground">Configure GITHUB_TOKEN</p>
                  </>
                )}
              </div>
              <Link
                href="/account"
                className="text-[11px] font-medium text-primary opacity-80 transition-opacity hover:opacity-100"
              >
                View
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-px bg-border">
              <MiniStat icon={BookOpen} label="Repos" value={user?.public_repos} loading={userLoading} />
              <MiniStat icon={Users} label="Followers" value={user?.followers} loading={userLoading} />
              <MiniStat icon={Star} label="Gists" value={user?.public_gists} loading={userLoading} />
            </div>
          </Card>

          {/* MCP status */}
          <Card className="border-border bg-card/70 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">MCP Bridge</span>
              </div>
              {toolsLoading ? (
                <Skeleton className="h-5 w-14 rounded-full" />
              ) : (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    tools?.connected
                      ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border border-border bg-muted/40 text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      tools?.connected ? "bg-emerald-400" : "bg-muted-foreground",
                    )}
                  />
                  {tools?.connected ? "Connected" : "Offline"}
                </span>
              )}
            </div>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              github-mcp · streamable-http
            </p>
            <div className="mt-3 flex items-baseline gap-1.5">
              {toolsLoading ? (
                <Skeleton className="h-7 w-10" />
              ) : (
                <span className="text-2xl font-semibold tabular-nums">{tools?.count ?? "—"}</span>
              )}
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">live tools</span>
            </div>
            <Link
              href="/mcp"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              Open viewer
              <ArrowRight className="size-3" />
            </Link>
          </Card>

          {/* Tip card */}
          <Card className="border-border bg-gradient-to-br from-primary/10 via-card/70 to-card/70 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <span className="text-sm font-medium">Pro tip</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Paste any GitHub repo URL into the MCP viewer. Stars, forks, language, license, and the latest 5
              commits stream back from the official REST API — no scraping, no mocks.
            </p>
          </Card>
        </aside>
      </section>
    </div>
  )
}

function SectionHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: typeof Sparkles
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground" />
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      <span className="text-xs text-muted-foreground">— {description}</span>
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  loading,
  accent,
  status,
  suffix,
}: {
  icon: typeof Sparkles
  label: string
  value: number | undefined
  loading: boolean
  accent: "cyan" | "blue"
  status?: "online" | "offline"
  suffix?: string
}) {
  const accentClass =
    accent === "cyan"
      ? "from-primary/15 to-transparent ring-primary/20 text-primary"
      : "from-blue-500/15 to-transparent ring-blue-500/20 text-blue-400"

  return (
    <Card className="group relative overflow-hidden border-border bg-card/70 p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={cn("flex size-7 items-center justify-center rounded-md bg-gradient-to-br ring-1", accentClass)}>
          <Icon className="size-3.5" />
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        {loading ? (
          <Skeleton className="h-7 w-14" />
        ) : (
          <span className="text-2xl font-semibold tabular-nums">
            {value === undefined ? "—" : value.toLocaleString()}
          </span>
        )}
        {status && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider",
              status === "online"
                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border border-border bg-muted/40 text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "size-1 rounded-full",
                status === "online" ? "bg-emerald-400" : "bg-muted-foreground",
              )}
            />
            {status}
          </span>
        )}
      </div>
      {suffix && <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{suffix}</p>}
    </Card>
  )
}

function MiniStat({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Sparkles
  label: string
  value: number | undefined
  loading: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5 bg-card p-3">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      {loading ? (
        <Skeleton className="h-5 w-10" />
      ) : (
        <span className="text-sm font-semibold tabular-nums">{value ?? "—"}</span>
      )}
    </div>
  )
}
