"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare, Code2, Github, Sparkles, Activity, UserRound } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Chat",
    href: "/chat",
    icon: MessageSquare,
    description: "AI assistant",
  },
  {
    title: "Code Analyzer",
    href: "/analyzer",
    icon: Code2,
    description: "Bugs & suggestions",
  },
  {
    title: "MCP Data Viewer",
    href: "/mcp",
    icon: Github,
    description: "Live MCP tools",
  },
  {
    title: "GitHub Account",
    href: "/account",
    icon: UserRound,
    description: "Your authenticated user",
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight">DevAssist</span>
            <span className="text-xs text-muted-foreground">AI + MCP Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "relative h-11 overflow-hidden transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                      )}
                    >
                      <Link href={item.href}>
                        <span
                          className={cn(
                            "absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-primary transition-all duration-200",
                            isActive ? "opacity-100" : "opacity-0",
                          )}
                          aria-hidden
                        />
                        <item.icon
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm font-medium">{item.title}</span>
                          <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                            {item.description}
                          </span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 rounded-md bg-sidebar-accent/50 px-2 py-2 text-xs group-data-[collapsible=icon]:hidden">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-medium">MCP Bridge</span>
            <span className="text-muted-foreground">github-mcp · streamable-http</span>
          </div>
          <Activity className="ml-auto size-3.5 text-muted-foreground" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
