"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { Send, Sparkles, User, Bot, ArrowDown, RotateCcw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
  const parts = text.split(/(```[\s\S]*?```)/g)
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const match = part.match(/```(\w+)?\n?([\s\S]*?)```/)
      if (match) {
        const [, lang, code] = match
        return (
          <pre
            key={i}
            className="my-3 overflow-x-auto rounded-md border border-border bg-background/60 p-3 font-mono text-[12px] leading-relaxed"
          >
            {lang && (
              <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {lang}
              </div>
            )}
            <code>{code.trim()}</code>
          </pre>
        )
      }
    }
    const inlineParts = part.split(/(`[^`]+`)/g)
    return (
      <span key={i} className="whitespace-pre-wrap leading-relaxed">
        {inlineParts.map((ip, j) =>
          ip.startsWith("`") && ip.endsWith("`") ? (
            <code
              key={j}
              className="rounded border border-border bg-background/60 px-1 py-0.5 font-mono text-[0.85em]"
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
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <div ref={scrollRef} onScroll={onScroll} className="relative flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto max-w-3xl">
          {messages.length === 0 ? (
            <EmptyState onPick={(prompt) => sendMessage({ text: prompt })} />
          ) : (
            <div className="space-y-5">
              {messages.map((message) => (
                <MessageBubble key={message.id} role={message.role} content={getMessageText(message)} />
              ))}
              {status === "submitted" && <MessageBubble role="assistant" content="" loading />}
              {error && (
                <div className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-3.5 text-sm">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Something went wrong</p>
                    <p className="text-xs text-muted-foreground">{error.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {showScroll && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-4 right-6 size-8 rounded-full border border-border bg-card"
            onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })}
          >
            <ArrowDown className="size-3.5" />
            <span className="sr-only">Scroll to bottom</span>
          </Button>
        )}
      </div>

      <div className="border-t border-border bg-background">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl px-4 py-4 md:px-8">
          <div className="flex items-end gap-2 rounded-lg border border-border bg-card p-2 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring/30">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about React, Mongo, Next.js…"
              rows={1}
              className="min-h-[40px] max-h-48 resize-none border-0 bg-transparent px-2 py-1.5 text-sm shadow-none focus-visible:ring-0"
              disabled={isLoading}
            />
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  onClick={() => setMessages([])}
                  title="Clear chat"
                >
                  <RotateCcw className="size-4" />
                  <span className="sr-only">Clear chat</span>
                </Button>
              )}
              <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="size-8">
                {isLoading ? <Spinner className="size-3.5" /> : <Send className="size-3.5" />}
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
          <p className="mt-2 px-1 text-[10px] text-muted-foreground">
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
      <div className="mb-4 flex size-10 items-center justify-center rounded-md border border-border bg-card text-foreground">
        <Sparkles className="size-4" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">How can I help with your code today?</h2>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
        Ask about React, Node, MongoDB, Express, Next.js, or paste an error and I&apos;ll help you debug it.
      </p>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">
        {EXAMPLE_PROMPTS.map((p) => (
          <button
            key={p.title}
            type="button"
            onClick={() => onPick(p.prompt)}
            className="group flex flex-col gap-1 rounded-md border border-border bg-card p-3.5 text-left transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <p className="text-sm font-medium tracking-tight">{p.title}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">{p.prompt}</p>
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
    <div className={cn("flex gap-2.5", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-foreground">
          <Bot className="size-3.5" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm",
          isUser
            ? "rounded-tr-sm border border-border bg-accent text-foreground"
            : "rounded-tl-sm border border-border bg-card text-card-foreground",
        )}
      >
        {loading ? <TypingDots /> : <div className="space-y-1">{formatMessage(content)}</div>}
      </div>
      {isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-foreground">
          <User className="size-3.5" />
        </div>
      )}
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1" aria-label="Assistant is typing">
      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70" style={{ animationDelay: "0ms" }} />
      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70" style={{ animationDelay: "150ms" }} />
      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70" style={{ animationDelay: "300ms" }} />
    </div>
  )
}
