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
  Users,
  BookOpen,
  Calendar,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
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
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">GitHub Account</h1>
          <Badge variant="secondary" className="gap-1.5 font-mono text-[10px]">
            <ShieldCheck className="size-3 text-primary" />
            server-side fetch
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground text-pretty">
          Fetches the authenticated user from{" "}
          <code className="rounded bg-muted px-1 font-mono text-[11px]">/api/github-user</code> on the server using
          your <code className="rounded bg-muted px-1 font-mono text-[11px]">GITHUB_TOKEN</code>. The token never
          leaves the server.
        </p>
      </header>

      <Card className="overflow-hidden border-border bg-card">
        <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <UserRound className="size-4 text-muted-foreground" />
              Authenticated user
            </CardTitle>
            <CardDescription className="text-xs">
              {fetchedAt
                ? `Last fetched ${fetchedAt.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}`
                : "Click the button to call GET /api/github-user."}
            </CardDescription>
          </div>
          <Button onClick={load} disabled={loading} size="sm" className="shrink-0">
            {loading ? (
              <>
                <Spinner className="size-3.5" />
                Fetching…
              </>
            ) : (
              <>
                <RefreshCw className="size-3.5" />
                {user ? "Refresh" : "Fetch GitHub user"}
              </>
            )}
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {loading && !user ? (
            <UserSkeleton />
          ) : error ? (
            <div className="flex items-start gap-3 p-5">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Could not fetch GitHub user</p>
                <p className="text-xs text-muted-foreground">{error}</p>
                <p className="text-xs text-muted-foreground">
                  Confirm <code className="rounded bg-muted px-1 font-mono">GITHUB_TOKEN</code> is set on the
                  server and has at least <code className="rounded bg-muted px-1 font-mono">read:user</code>{" "}
                  scope.
                </p>
              </div>
            </div>
          ) : user ? (
            <UserDetails user={user} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <UserRound className="size-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No data yet</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Click <span className="font-medium text-foreground">Fetch GitHub user</span> to call the secure
                API route and display the response.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function UserDetails({ user }: { user: GithubUser }) {
  const created = new Date(user.created_at)
  const stats: { label: string; value: string; icon: typeof Users }[] = [
    { label: "Repos", value: user.public_repos.toLocaleString(), icon: BookOpen },
    { label: "Followers", value: user.followers.toLocaleString(), icon: Users },
    { label: "Following", value: user.following.toLocaleString(), icon: Users },
    { label: "Gists", value: user.public_gists.toLocaleString(), icon: BookOpen },
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col items-start gap-4 p-5 sm:flex-row">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          <Image
            src={user.avatar_url || "/placeholder.svg"}
            alt={`${user.login} avatar`}
            fill
            sizes="80px"
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
            <Badge variant="secondary" className="font-mono text-[10px]">
              {user.type}
            </Badge>
          </div>
          {user.bio ? (
            <p className="text-sm text-muted-foreground text-pretty">{user.bio}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground">No bio.</p>
          )}

          <div className="grid grid-cols-1 gap-1.5 pt-1 sm:grid-cols-2">
            {user.company && (
              <Meta icon={Building2} value={user.company.replace(/^@/, "")} />
            )}
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

      <Separator />

      <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 bg-card p-4">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <s.icon className="size-3" />
              {s.label}
            </div>
            <span className="font-mono text-lg font-semibold tabular-nums">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Meta({ icon: Icon, value }: { icon: typeof Users; value: React.ReactNode }) {
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
        <Skeleton className="size-20 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-72" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-px bg-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 bg-card p-4">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
