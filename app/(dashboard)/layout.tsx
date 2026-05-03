import type React from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { TopBar } from "@/components/top-bar"
import { InsightsRail } from "@/components/insights-rail"
import { CommandPaletteProvider } from "@/components/command-palette"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CommandPaletteProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "15rem",
            "--sidebar-width-icon": "3rem",
          } as React.CSSProperties
        }
      >
        <DashboardSidebar />
        <SidebarInset className="bg-background">
          <TopBar />
          <div className="flex flex-1 min-h-0">
            <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
            <InsightsRail />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </CommandPaletteProvider>
  )
}
