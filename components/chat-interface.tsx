"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { Send, Sparkles, User, Bot, ArrowDown, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

const EXAMPLE_PROMPTS = [
  {
    title: "Debug a React hook",
    prompt: "Why does my useEffect run twice in development with React 19, and how do I prevent infinite loops?",
  },
  {
    title: "MongoDB aggregation",
    prompt: "Write a MongoDB aggregation pipeline that returns the top 5 users by total order amount in the last 30 days.",
  },
  {
    title: "Next.js Server Action",
    prompt: "Show me a Next.js 16 Server Action that creates a user with Zod validation and returns typed errors.",
  },
  {
    title: "Express middleware",
    prompt: "Build an Express rate-limiting middleware that uses Redis and supports per-route limits.",
  },
]

function getMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

function formatMessage(text: string) {
  // Split by code blocks
  const parts = text.split(/(```[\s\S]*?```)/g)
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const match = part.match(/```(\w+)?\n?([\s\S]*?)```/)
      if (match) {
        const [, lang, code] = match
        return (
          <pre
            key={i}
            className="my-3 overflow-x-auto rounded-md border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed"
          >
            {lang ? <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">{lang}</div> : null}
            <code>{code.trim()}</code>
          </pre>
        )
      }
    }
    // Render inline code and paragraphs
    const inlineParts = part.split(/(`[^`]+`)/g)
    return (
      <span key={i} className="whitespace-pre-wrap leading-relaxed">
        {inlineParts.map((ip, j) =>
          ip.startsWith("`") && ip.endsWith("`") ? (
            <code
              key={j}
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
            >
              {ip.slice(1, -1)}
            </code>
          ) : (
            <span key={j}>{ip}</span>
          ),
        )}
      </span>
    )
  })
}

export function ChatInterface() {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScroll, setShowScroll] = useState(false)

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const isLoading = status === "submitted" || status === "streaming"

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, status])

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScroll(distance > 200)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="relative flex-1 overflow-y-auto px-4 py-6 md:px-8"
      >
        <div className="mx-auto max-w-3xl">
          {messages.length === 0 ? (
            <EmptyState
              onPick={(prompt) => {
                setInput(prompt)
              }}
            />
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  role={message.role}
                  content={getMessageText(message)}
                />
              ))}
              {status === "submitted" && (
                <MessageBubble role="assistant" content="" loading />
              )}
              {error ? (
                <Card className="border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
                  <p className="font-medium">Something went wrong</p>
                  <p className="text-xs opacity-80">{error.message}</p>
                </Card>
              ) : null}
            </div>
          )}
        </div>

        {showScroll && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-4 right-6 size-9 rounded-full shadow-lg"
            onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })}
          >
            <ArrowDown className="size-4" />
            <span className="sr-only">Scroll to bottom</span>
          </Button>
        )}
      </div>

      <div className="border-t border-border bg-background/80 backdrop-blur">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl px-4 py-4 md:px-8">
          <div className="relative flex items-end gap-2 rounded-xl border border-border bg-card p-2 shadow-sm transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about React hooks, Mongo queries, Next.js routing…"
              rows={1}
              className="min-h-[44px] resize-none border-0 bg-transparent px-2 py-2 text-sm shadow-none focus-visible:ring-0"
              disabled={isLoading}
            />
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-9"
                  onClick={() => setMessages([])}
                  title="Clear chat"
                >
                  <RotateCcw className="size-4" />
                  <span className="sr-only">Clear chat</span>
                </Button>
              )}
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="size-9 rounded-lg"
              >
                {isLoading ? <Spinner className="size-4" /> : <Send className="size-4" />}
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
          <p className="mt-2 px-2 text-[11px] text-muted-foreground">
            Shift + Enter for newline · Streaming via Vercel AI SDK
          </p>
        </form>
      </div>
    </div>
  )
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="size-6" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-balance">
        How can I help with your code today?
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground text-pretty">
        Ask about React, Node, MongoDB, Express, Next.js, or paste an error and I&apos;ll help you debug it.
      </p>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {EXAMPLE_PROMPTS.map((p) => (
          <button
            key={p.title}
            onClick={() => onPick(p.prompt)}
            className="group rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-accent/40"
          >
            <p className="text-sm font-medium">{p.title}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.prompt}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

function MessageBubble({
  role,
  content,
  loading,
}: {
  role: string
  content: string
  loading?: boolean
}) {
  const isUser = role === "user"
  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Bot className="size-4" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-card text-card-foreground",
        )}
      >
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Spinner className="size-3" />
            <span className="text-xs">Thinking…</span>
          </div>
        ) : (
          <div className="space-y-1">{formatMessage(content)}</div>
        )}
      </div>
      {isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <User className="size-4" />
        </div>
      )}
    </div>
  )
}
