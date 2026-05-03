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
  Users,
  BookOpen,
  Bot,
  type LucideIcon,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
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
  count?: number
}

const QUICK_LINKS: { href: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    href: "/chat",
    title: "AI Chat",
    description: "Stream answers with code-aware formatting.",
    icon: MessageSquare,
  },
  {
    href: "/analyzer",
    title: "Code Analyzer",
    description: "Find bugs, get suggestions, ship fixed code.",
    icon: Code2,
  },
  {
    href: "/mcp",
    title: "MCP Viewer",
    description: "Inspect any GitHub repo via the MCP server.",
    icon: Github,
  },
  {
    href: "/account",
    title: "Account",
    description: "Securely fetch your authenticated GitHub user.",
    icon: UserRound,
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
    <div className="mx-auto w-full max-w-5xl px-6 py-8 lg:px-8 lg:py-10">
      {/* Page heading */}
      <header className="mb-8 flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back{user?.login ? <span className="text-muted-foreground">, @{user.login}</span> : null}
        </h1>
        <p className="text-sm text-muted-foreground">
          Your AI-native developer workspace — chat, analyze, and inspect repos in one place.
        </p>
      </header>

      {/* KPI strip */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={BookOpen} label="Public repos" value={user?.public_repos} loading={userLoading} />
        <Stat icon={Users} label="Followers" value={user?.followers} loading={userLoading} />
        <Stat
          icon={Wrench}
          label="MCP tools"
          value={tools?.count}
          loading={toolsLoading}
          status={tools?.connected ? "online" : tools ? "offline" : undefined}
        />
        <Stat
          icon={Bot}
          label="Active model"
          value={1}
          loading={false}
          status="online"
          suffix="gpt-5-mini"
        />
      </section>

      {/* Quick start grid */}
      <section className="mt-10">
        <SectionHeader title="Quick start" hint="Jump into a workflow" icon={Sparkles} />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group flex flex-col gap-3 rounded-lg border border-border bg-card p-4",
                "transition-colors duration-150 hover:border-primary/40 hover:bg-accent",
              )}
            >
              <div className="flex size-8 items-center justify-center rounded-md border border-border bg-background text-foreground">
                <link.icon className="size-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold tracking-tight">{link.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {link.description}
                </p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
                Open
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Profile + MCP strip */}
      <section className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Profile */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border p-4">
            {userLoading ? (
              <Skeleton className="size-10 rounded-full" />
            ) : user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url || "/placeholder.svg"}
                alt={user.login ? `@${user.login}` : "GitHub avatar"}
                className="size-10 rounded-full border border-border"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                <UserRound className="size-4" />
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
                  <p className="truncate text-sm font-medium leading-tight">{user.name || user.login}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">@{user.login}</p>
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
              className="text-xs font-medium text-primary transition-opacity hover:opacity-80"
            >
              View
            </Link>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border">
            <MiniStat label="Repos" value={user?.public_repos} loading={userLoading} />
            <MiniStat label="Followers" value={user?.followers} loading={userLoading} />
            <MiniStat label="Gists" value={user?.public_gists} loading={userLoading} />
          </div>
        </div>

        {/* MCP */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Github className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">MCP Bridge</span>
            </div>
            {toolsLoading ? (
              <Skeleton className="h-5 w-16 rounded-full" />
            ) : (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px]",
                  tools?.connected
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                    : "border-border bg-muted text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    tools?.connected ? "bg-emerald-500" : "bg-muted-foreground",
                  )}
                />
                {tools?.connected ? "Connected" : "Offline"}
              </span>
            )}
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">github-mcp · streamable-http</p>
          <div className="mt-4 flex items-baseline gap-2">
            {toolsLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <span className="text-2xl font-semibold tabular-nums tracking-tight">
                {tools?.count ?? "—"}
              </span>
            )}
            <span className="text-xs text-muted-foreground">live tools</span>
          </div>
          <Link
            href="/mcp"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Open viewer
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </section>
    </div>
  )
}

function SectionHeader({
  title,
  hint,
  icon: Icon,
}: {
  title: string
  hint: string
  icon: LucideIcon
}) {
  return (
    <div className="flex items-baseline justify-between">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-muted-foreground" />
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      </div>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  loading,
  status,
  suffix,
}: {
  icon: LucideIcon
  label: string
  value: number | undefined
  loading: boolean
  status?: "online" | "offline"
  suffix?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        {loading ? (
          <Skeleton className="h-7 w-14" />
        ) : (
          <span className="text-2xl font-semibold tabular-nums tracking-tight">
            {value === undefined ? "—" : value.toLocaleString()}
          </span>
        )}
        {status && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
              status === "online"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "size-1 rounded-full",
                status === "online" ? "bg-emerald-500" : "bg-muted-foreground",
              )}
            />
            {status}
          </span>
        )}
      </div>
      {suffix && (
        <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{suffix}</p>
      )}
    </div>
  )
}

function MiniStat({
  label,
  value,
  loading,
}: {
  label: string
  value: number | undefined
  loading: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5 p-3">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {loading ? (
        <Skeleton className="h-5 w-10" />
      ) : (
        <span className="text-sm font-semibold tabular-nums">{value ?? "—"}</span>
      )}
    </div>
  )
}
