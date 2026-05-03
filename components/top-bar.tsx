"use client"

import Link from "next/link"
import { Sparkles, Bot, Zap } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import { Badge } from "@/components/ui/badge"

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-white/5 glass px-3 sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <DashboardBreadcrumb />

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/chat"
          className="hidden md:inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          title="Quick ask"
        >
          <Zap className="size-3.5 text-primary" />
          <span>Quick ask</span>
          <kbd className="ml-2 hidden lg:inline-flex items-center gap-0.5 rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </Link>

        <Badge
          variant="outline"
          className="hidden sm:inline-flex h-7 items-center gap-1.5 rounded-full border-border bg-card/60 px-2.5 font-mono text-[10px] text-muted-foreground"
        >
          <Bot className="size-3 text-primary" />
          gpt-5-mini
        </Badge>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="hidden sm:inline">Live</span>
        </div>

        <div
          className="ml-1 flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 ring-1 ring-primary/30"
          aria-hidden
        >
          <Sparkles className="size-3.5 text-primary" />
        </div>
      </div>
    </header>
  )
}
