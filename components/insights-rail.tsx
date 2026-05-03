"use client"

import Link from "next/link"
import useSWR from "swr"
import {
  Activity,
  Bot,
  Github,
  Sparkles,
  ArrowUpRight,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type ToolsResponse = {
  connected: boolean
  count?: number
  error?: string
}

const SHORTCUTS: { href: string; label: string; hint: string }[] = [
  { href: "/chat", label: "AI Chat", hint: "Ask anything" },
  { href: "/analyzer", label: "Analyzer", hint: "Paste code" },
  { href: "/mcp", label: "MCP Viewer", hint: "Inspect repo" },
  { href: "/account", label: "Account", hint: "GitHub user" },
]

export function InsightsRail() {
  const { data: tools, isLoading } = useSWR<ToolsResponse>("/api/mcp/tools", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  return (
    <aside className="hidden xl:block w-80 shrink-0 border-l border-border/80 bg-background/70 backdrop-blur-md">
      <div className="sticky top-12 flex flex-col gap-4 p-5">
        <RailSection title="Status" icon={Activity}>
          <ul className="space-y-2.5 text-xs">
            <StatusRow
              icon={Bot}
              label="Model"
              value="gpt-5-mini"
              tone="online"
            />
            <StatusRow
              icon={Github}
              label="MCP Server"
              value={isLoading ? "Connecting…" : tools?.connected ? "Connected" : "Offline"}
              tone={isLoading ? "neutral" : tools?.connected ? "online" : "offline"}
            />
            <StatusRow
              icon={Wrench}
              label="Tools available"
              value={isLoading ? "—" : tools?.connected ? String(tools?.count ?? 0) : "—"}
              tone="neutral"
            />
          </ul>
        </RailSection>

        <RailSection title="Shortcuts" icon={Sparkles}>
          <ul className="-mx-1.5 space-y-0.5">
            {SHORTCUTS.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="group flex items-center justify-between rounded-md px-1.5 py-1.5 text-xs transition-colors hover:bg-accent"
                >
                  <span className="flex flex-col leading-tight">
                    <span className="font-medium text-foreground">{s.label}</span>
                    <span className="text-[10px] text-muted-foreground">{s.hint}</span>
                  </span>
                  <ArrowUpRight className="size-3.5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </RailSection>

        <div className="rounded-md border border-border bg-card p-3.5">
          <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <CheckCircle2 className="size-3" />
            Tip
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Press{" "}
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-foreground">
              ⌘K
            </kbd>{" "}
            to open the command palette and jump anywhere.
          </p>
        </div>

        {!isLoading && tools?.connected === false && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3.5">
            <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-amber-500">
              <AlertTriangle className="size-3" />
              MCP Offline
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Configure{" "}
              <code className="rounded border border-border bg-background px-1 font-mono text-[10px]">
                GITHUB_TOKEN
              </code>{" "}
              to bring the MCP server online.
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}

function RailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" />
        {title}
      </h3>
      {children}
    </section>
  )
}

function StatusRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: string
  tone: "online" | "offline" | "neutral"
}) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </span>
      <span
        className={cn(
          "flex items-center gap-1.5 font-mono text-[11px]",
          tone === "online" && "text-emerald-500",
          tone === "offline" && "text-muted-foreground",
          tone === "neutral" && "text-foreground",
        )}
      >
        {tone !== "neutral" && (
          <span
            className={cn(
              "size-1.5 rounded-full",
              tone === "online" ? "bg-emerald-500" : "bg-muted-foreground",
            )}
          />
        )}
        {value}
      </span>
    </li>
  )
}
