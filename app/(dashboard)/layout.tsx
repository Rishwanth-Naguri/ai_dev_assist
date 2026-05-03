import type React from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { TopBar } from "@/components/top-bar"
import { InsightsRail } from "@/components/insights-rail"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="bg-transparent">
        <TopBar />
        <div className="flex flex-1">
          <main className="flex-1 min-w-0">{children}</main>
          <InsightsRail />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
