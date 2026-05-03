"use client"

import { usePathname } from "next/navigation"

const TITLES: Record<string, string> = {
  "/chat": "Chat",
  "/analyzer": "Code Analyzer",
  "/mcp": "MCP Data Viewer",
  "/account": "GitHub Account",
}

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  const current =
    pathname === "/"
      ? "Overview"
      : Object.entries(TITLES).find(([href]) => pathname === href || pathname.startsWith(href + "/"))?.[1] ??
        "Dashboard"

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted-foreground sm:inline">DevAssist</span>
      <span className="hidden text-muted-foreground/40 sm:inline">/</span>
      <span className="font-medium">{current}</span>
    </div>
  )
}
