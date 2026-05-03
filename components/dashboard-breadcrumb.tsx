"use client"

import { usePathname } from "next/navigation"

const TITLES: Record<string, string> = {
  "/chat": "Chat",
  "/analyzer": "Code Analyzer",
  "/mcp": "MCP Viewer",
  "/account": "Account",
}

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  const current =
    pathname === "/"
      ? "Dashboard"
      : (Object.entries(TITLES).find(
          ([href]) => pathname === href || pathname.startsWith(href + "/"),
        )?.[1] ?? "Dashboard")

  return (
    <nav className="flex min-w-0 items-center gap-1.5 text-xs" aria-label="Breadcrumb">
      <span className="hidden text-muted-foreground sm:inline">DevAssist</span>
      <span className="hidden text-border sm:inline" aria-hidden>
        /
      </span>
      <span className="truncate font-medium text-foreground">{current}</span>
    </nav>
  )
}
