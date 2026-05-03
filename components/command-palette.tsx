"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  MessageSquare,
  Code2,
  Github,
  UserRound,
  Search,
  ArrowRight,
  ExternalLink,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

type CommandPaletteContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const CommandPaletteContext = React.createContext<CommandPaletteContextValue | null>(null)

export function useCommandPalette() {
  const ctx = React.useContext(CommandPaletteContext)
  if (!ctx) {
    throw new Error("useCommandPalette must be used inside <CommandPaletteProvider />")
  }
  return ctx
}

type NavCommand = {
  id: string
  label: string
  description: string
  href: string
  icon: LucideIcon
  shortcut?: string
}

type ActionCommand = {
  id: string
  label: string
  description: string
  icon: LucideIcon
  run: (router: ReturnType<typeof useRouter>) => void | Promise<void>
}

const NAV_COMMANDS: NavCommand[] = [
  {
    id: "nav.dashboard",
    label: "Dashboard",
    description: "Overview and live status",
    href: "/",
    icon: LayoutDashboard,
    shortcut: "G D",
  },
  {
    id: "nav.chat",
    label: "AI Chat",
    description: "Stream answers from gpt-5-mini",
    href: "/chat",
    icon: MessageSquare,
    shortcut: "G C",
  },
  {
    id: "nav.analyzer",
    label: "Code Analyzer",
    description: "Bugs, suggestions, fixed code",
    href: "/analyzer",
    icon: Code2,
    shortcut: "G A",
  },
  {
    id: "nav.mcp",
    label: "MCP Data Viewer",
    description: "Inspect any GitHub repo",
    href: "/mcp",
    icon: Github,
    shortcut: "G M",
  },
  {
    id: "nav.account",
    label: "GitHub Account",
    description: "Authenticated user profile",
    href: "/account",
    icon: UserRound,
    shortcut: "G U",
  },
]

const ACTIONS: ActionCommand[] = [
  {
    id: "action.new-chat",
    label: "Start new chat",
    description: "Open a fresh conversation",
    icon: MessageSquare,
    run: (router) => router.push("/chat"),
  },
  {
    id: "action.analyze",
    label: "Analyze code snippet",
    description: "Open the code analyzer",
    icon: Code2,
    run: (router) => router.push("/analyzer"),
  },
  {
    id: "action.fetch-repo",
    label: "Fetch repository data",
    description: "Open the MCP viewer",
    icon: Github,
    run: (router) => router.push("/mcp"),
  },
  {
    id: "action.refresh-tools",
    label: "Refresh MCP tools",
    description: "Re-list tools from the MCP server",
    icon: Wrench,
    run: async () => {
      try {
        await fetch("/api/mcp/tools", { cache: "no-store" })
      } catch {
        /* silent */
      }
    },
  },
]

const EXTERNAL = [
  {
    id: "ext.mcp-spec",
    label: "MCP specification",
    href: "https://modelcontextprotocol.io",
  },
  {
    id: "ext.github-mcp",
    label: "GitHub MCP server",
    href: "https://github.com/github/github-mcp-server",
  },
  {
    id: "ext.ai-sdk",
    label: "Vercel AI SDK",
    href: "https://sdk.vercel.ai",
  },
]

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  // Global Cmd/Ctrl+K — works from anywhere, won't fire while typing in an input.
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const ctx = React.useMemo<CommandPaletteContextValue>(
    () => ({ open, setOpen, toggle: () => setOpen((v) => !v) }),
    [open],
  )

  const runAndClose = React.useCallback(
    (fn: () => void | Promise<void>) => {
      setOpen(false)
      // Defer so the dialog close animation isn't blocked by a route push.
      requestAnimationFrame(() => {
        void fn()
      })
    },
    [setOpen],
  )

  return (
    <CommandPaletteContext.Provider value={ctx}>
      {children}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Command palette"
        description="Search pages, trigger actions, and jump anywhere."
        className="border border-border bg-card/95 glass-overlay sm:max-w-xl"
      >
        <CommandInput placeholder="Search pages, actions..." />
        <CommandList className="max-h-[420px]">
          <CommandEmpty>
            <div className="flex flex-col items-center gap-1 py-6 text-center">
              <Search className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium">No matches</p>
              <p className="text-xs text-muted-foreground">Try a different keyword.</p>
            </div>
          </CommandEmpty>

          <CommandGroup heading="Navigate">
            {NAV_COMMANDS.map((c) => (
              <CommandItem
                key={c.id}
                value={`${c.label} ${c.description}`}
                onSelect={() => runAndClose(() => router.push(c.href))}
                className="gap-2.5"
              >
                <c.icon className="size-4 text-muted-foreground" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm">{c.label}</span>
                  <span className="text-[11px] text-muted-foreground">{c.description}</span>
                </div>
                {c.shortcut && <CommandShortcut>{c.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions">
            {ACTIONS.map((a) => (
              <CommandItem
                key={a.id}
                value={`${a.label} ${a.description}`}
                onSelect={() => runAndClose(() => a.run(router))}
                className="gap-2.5"
              >
                <a.icon className="size-4 text-muted-foreground" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm">{a.label}</span>
                  <span className="text-[11px] text-muted-foreground">{a.description}</span>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Documentation">
            {EXTERNAL.map((e) => (
              <CommandItem
                key={e.id}
                value={`${e.label} docs documentation external`}
                onSelect={() =>
                  runAndClose(() => {
                    window.open(e.href, "_blank", "noopener,noreferrer")
                  })
                }
                className="gap-2.5"
              >
                <ExternalLink className="size-4 text-muted-foreground" />
                <span className="flex-1 text-sm">{e.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground">↗</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </CommandPaletteContext.Provider>
  )
}
