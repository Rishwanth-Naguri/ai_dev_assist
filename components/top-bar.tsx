"use client"

import Link from "next/link"
import { Search, UserRound } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import { useCommandPalette } from "@/components/command-palette"
import { cn } from "@/lib/utils"

export function TopBar() {
  const { setOpen } = useCommandPalette()

  return (
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-3 border-b border-border/80 bg-background/70 px-3 backdrop-blur-md sm:px-4">
      <SidebarTrigger className="-ml-1 size-7" />
      <Separator orientation="vertical" className="h-4" />
      <DashboardBreadcrumb />

      <div className="ml-auto flex items-center gap-2">
        {/* Command palette trigger — looks like a search field. */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "group inline-flex h-8 items-center gap-2 rounded-md border border-border bg-card px-2.5 text-xs",
            "text-muted-foreground transition-colors duration-150",
            "hover:border-border hover:bg-accent hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          )}
          aria-label="Open command palette"
        >
          <Search className="size-3.5" />
          <span className="hidden md:inline">Search or jump to…</span>
          <span className="inline md:hidden">Search</span>
          <kbd className="ml-2 hidden items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
            <span className="text-[11px]">⌘</span>K
          </kbd>
        </button>

        <Separator orientation="vertical" className="hidden h-4 sm:block" />

        <span className="hidden items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 font-mono text-[10px] text-muted-foreground sm:inline-flex">
          <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
          gpt-5-mini
        </span>

        <Link
          href="/account"
          aria-label="View GitHub account"
          title="GitHub account"
          className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground"
        >
          <UserRound className="size-3.5" />
        </Link>
      </div>
    </header>
  )
}
