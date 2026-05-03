"use client"

import { useState } from "react"
import Image from "next/image"
import {
  UserRound,
  RefreshCw,
  ExternalLink,
  MapPin,
  Building2,
  Link as LinkIcon,
  Mail,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  KeyRound,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

type GithubUser = {
  login: string
  id: number
  avatar_url: string
  html_url: string
  name: string | null
  company: string | null
  blog: string | null
  location: string | null
  email: string | null
  bio: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  type: string
}

export function AccountCard() {
  const [user, setUser] = useState<GithubUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/github-user", { cache: "no-store" })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || `Request failed with ${res.status}`)
      }

      setUser(json as GithubUser)
      setFetchedAt(new Date())
      toast.success(`Loaded GitHub profile for @${json.login}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to fetch GitHub user"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8 lg:px-8 lg:py-10">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Settings</p>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight">GitHub Account</h1>
          <Badge
            variant="outline"
            className="gap-1.5 border-border bg-card font-mono text-[10px] text-muted-foreground"
          >
            <ShieldCheck className="size-3 text-primary" />
            server-side fetch
          </Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Fetches the authenticated user from{" "}
          <code className="rounded border border-border bg-card px-1 font-mono text-[11px]">/api/github-user</code>.
          Your <code className="rounded border border-border bg-card px-1 font-mono text-[11px]">GITHUB_TOKEN</code>{" "}
          never leaves the server.
        </p>
      </header>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-row items-start justify-between gap-3 border-b border-border p-4">
          <div className="space-y-0.5">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <UserRound className="size-3.5 text-muted-foreground" />
              Authenticated user
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">
              {fetchedAt
                ? `Last fetched ${fetchedAt.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}`
                : "GET /api/github-user"}
            </p>
          </div>
          <Button onClick={load} disabled={loading} size="sm" className="h-8 shrink-0">
            {loading ? (
              <>
                <Spinner className="size-3.5" />
                Fetching…
              </>
            ) : (
              <>
                <RefreshCw className="size-3.5" />
                {user ? "Refresh" : "Fetch user"}
              </>
            )}
          </Button>
        </div>

        {loading && !user ? (
          <UserSkeleton />
        ) : error ? (
          <ErrorState error={error} onRetry={load} />
        ) : user ? (
          <UserDetails user={user} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  const isAuth = /401|403|token|unauthor|forbidden/i.test(error)
  return (
    <div className="space-y-3 p-5">
      <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3">
        {isAuth ? (
          <KeyRound className="mt-0.5 size-4 shrink-0 text-destructive" />
        ) : (
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
        )}
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isAuth ? "GitHub rejected the token" : "Could not fetch GitHub user"}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>
          {isAuth && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Confirm{" "}
              <code className="rounded border border-border bg-background px-1 font-mono text-[10px]">
                GITHUB_TOKEN
              </code>{" "}
              is set on the server with at least{" "}
              <code className="rounded border border-border bg-background px-1 font-mono text-[10px]">
                read:user
              </code>{" "}
              scope.
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={onRetry}>
          <RefreshCw className="size-3" />
          Retry
        </Button>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 p-10 text-center">
      <div className="flex size-9 items-center justify-center rounded-md border border-border bg-background">
        <UserRound className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">No data yet</p>
      <p className="max-w-xs text-xs text-muted-foreground leading-relaxed">
        Click <span className="font-medium text-foreground">Fetch user</span> to call the secure API route and
        display the response.
      </p>
    </div>
  )
}

function UserDetails({ user }: { user: GithubUser }) {
  const created = new Date(user.created_at)
  const stats: { label: string; value: string }[] = [
    { label: "Repos", value: user.public_repos.toLocaleString() },
    { label: "Followers", value: user.followers.toLocaleString() },
    { label: "Following", value: user.following.toLocaleString() },
    { label: "Gists", value: user.public_gists.toLocaleString() },
  ]

  return (
    <div>
      <div className="flex flex-col items-start gap-4 p-5 sm:flex-row">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
          <Image
            src={user.avatar_url || "/placeholder.svg"}
            alt={`${user.login} avatar`}
            fill
            sizes="64px"
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">{user.name || user.login}</h2>
            <a
              href={user.html_url}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              @{user.login}
              <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
            <Badge variant="outline" className="border-border bg-background font-mono text-[10px]">
              {user.type}
            </Badge>
          </div>
          {user.bio ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground">No bio.</p>
          )}

          <div className="grid grid-cols-1 gap-1.5 pt-1 sm:grid-cols-2">
            {user.company && <Meta icon={Building2} value={user.company.replace(/^@/, "")} />}
            {user.location && <Meta icon={MapPin} value={user.location} />}
            {user.email && <Meta icon={Mail} value={user.email} />}
            {user.blog && (
              <Meta
                icon={LinkIcon}
                value={
                  <a
                    href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:underline"
                  >
                    {user.blog}
                  </a>
                }
              />
            )}
            <Meta
              icon={Calendar}
              value={`Joined ${created.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border border-t border-border sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="p-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Meta({ icon: Icon, value }: { icon: LucideIcon; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Icon className="size-3.5 shrink-0" />
      <span className="min-w-0 truncate">{value}</span>
    </div>
  )
}

function UserSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="size-16 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-72" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
      <div className="grid grid-cols-4 divide-x divide-border border-t border-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 p-4">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

