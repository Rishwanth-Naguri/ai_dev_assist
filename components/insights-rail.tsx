"use client"

import Link from "next/link"
import useSWR from "swr"
import { Activity, Bot, Github, Sparkles, ArrowUpRight, Wrench, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type ToolsResponse = { connected: boolean; count: number }

const SHORTCUTS = [
  { href: "/chat", label: "AI Chat", hint: "Ask anything" },
  { href: "/analyzer", label: "Code Analyzer", hint: "Paste code" },
  { href: "/mcp", label: "MCP Viewer", hint: "Inspect repo" },
  { href: "/account", label: "Account", hint: "GitHub user" },
]

export function InsightsRail() {
  const { data: tools, isLoading } = useSWR<ToolsResponse>("/api/mcp/tools", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  return (
    <aside className="hidden xl:block w-72 shrink-0">
      <div className="sticky top-20 flex flex-col gap-3 p-4 pt-2 pr-6">
        {/* System status */}
        <RailCard>
          <RailHeader icon={Activity} label="System" />
          <ul className="space-y-2 text-xs">
            <StatusRow
              icon={Bot}
              label="Model"
              value="gpt-5-mini"
              tone="online"
            />
            <StatusRow
              icon={Github}
              label="MCP"
              value={isLoading ? "…" : tools?.connected ? "Connected" : "Offline"}
              tone={tools?.connected ? "online" : isLoading ? "neutral" : "offline"}
            />
            <StatusRow
              icon={Wrench}
              label="Tools"
              value={isLoading ? "—" : String(tools?.count ?? 0)}
              tone="neutral"
            />
            <StatusRow icon={Cpu} label="Runtime" value="Node · Edge-safe" tone="neutral" />
          </ul>
        </RailCard>

        {/* Shortcuts */}
        <RailCard>
          <RailHeader icon={Sparkles} label="Shortcuts" />
          <ul className="space-y-1">
            {SHORTCUTS.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="group flex items-center justify-between rounded-md px-2 py-2 text-xs transition-colors hover:bg-white/5"
                >
                  <span className="flex flex-col leading-tight">
                    <span className="font-medium text-foreground">{s.label}</span>
                    <span className="text-[10px] text-muted-foreground">{s.hint}</span>
                  </span>
                  <ArrowUpRight className="size-3.5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        </RailCard>

        {/* Tip */}
        <RailCard glow>
          <p className="text-[11px] uppercase tracking-wider text-primary/80">Tip</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Press <kbd className="rounded border border-border bg-white/5 px-1 font-mono text-[10px]">⌘K</kbd> from
            anywhere to jump into a quick chat with the assistant.
          </p>
        </RailCard>
      </div>
    </aside>
  )
}

function RailCard({ children, glow = false }: { children: React.ReactNode; glow?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl glass-card p-4",
        glow && "bg-gradient-to-br from-violet-500/10 via-card/30 to-transparent",
      )}
    >
      {children}
    </div>
  )
}

function RailHeader({ icon: Icon, label }: { icon: typeof Activity; label: string }) {
  return (
    <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon className="size-3.5" />
      {label}
    </div>
  )
}

function StatusRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Activity
  label: string
  value: string
  tone: "online" | "offline" | "neutral"
}) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </span>
      <span
        className={cn(
          "flex items-center gap-1.5 font-mono text-[11px]",
          tone === "online" && "text-emerald-400",
          tone === "offline" && "text-muted-foreground",
          tone === "neutral" && "text-foreground/90",
        )}
      >
        {tone !== "neutral" && (
          <span
            className={cn(
              "size-1.5 rounded-full",
              tone === "online" ? "bg-emerald-400 shadow-[0_0_6px_oklch(0.7_0.18_150)]" : "bg-muted-foreground",
            )}
          />
        )}
        {value}
      </span>
    </li>
  )
}
