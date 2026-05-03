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
    Object.entries(TITLES).find(([href]) => pathname === href || pathname.startsWith(href + "/"))?.[1] ?? "Dashboard"

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">DevAssist</span>
      <span className="text-muted-foreground/40">/</span>
      <span className="font-medium">{current}</span>
    </div>
  )
}
