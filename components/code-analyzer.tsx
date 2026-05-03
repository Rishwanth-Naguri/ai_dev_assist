"use client"

import { useState } from "react"
import { Code2, Bug as BugIcon, Lightbulb, Copy, Check, Wand2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Bug = {
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  line: number | null
}

type Suggestion = {
  title: string
  description: string
}

type Analysis = {
  language: string
  summary: string
  bugs: Bug[]
  suggestions: Suggestion[]
  improvedCode: string
}

const SAMPLE_CODE = `// Express endpoint - what's wrong here?
app.get('/users/:id', (req, res) => {
  db.query('SELECT * FROM users WHERE id = ' + req.params.id, (err, rows) => {
    if (err) console.log(err)
    res.send(rows[0])
  })
})`

const SEVERITY_STYLES: Record<Bug["severity"], string> = {
  low: "border-border bg-muted text-muted-foreground",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-500",
  critical: "border-destructive/40 bg-destructive/10 text-destructive",
}

export function CodeAnalyzer() {
  const [code, setCode] = useState("")
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const analyze = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Request failed with ${res.status}`)
      }

      const data: Analysis = await res.json()
      setAnalysis(data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to analyze code"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const copyImproved = async () => {
    if (!analysis?.improvedCode) return
    await navigator.clipboard.writeText(analysis.improvedCode)
    setCopied(true)
    toast.success("Improved code copied")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 lg:px-8 lg:py-10">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tools</p>
        <h1 className="text-2xl font-semibold tracking-tight">Code Analyzer</h1>
        <p className="text-sm text-muted-foreground">
          Paste JavaScript, TypeScript, or MERN-stack code and get bugs, suggestions, and an improved version.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Input */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Code2 className="size-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">Your code</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setCode(SAMPLE_CODE)}
              disabled={loading}
            >
              Load sample
            </Button>
          </div>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste your code here…"
            spellCheck={false}
            className="min-h-[360px] resize-none rounded-none border-0 bg-transparent px-4 py-3 font-mono text-[12px] leading-relaxed shadow-none focus-visible:ring-0"
            disabled={loading}
          />
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
            <span className="font-mono text-[11px] text-muted-foreground">
              {code.length.toLocaleString()} chars
            </span>
            <Button onClick={analyze} disabled={!code.trim() || loading} size="sm" className="h-8">
              {loading ? (
                <>
                  <Spinner className="size-3.5" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Wand2 className="size-3.5" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Output */}
        <div>
          {loading ? (
            <AnalysisSkeleton />
          ) : error ? (
            <ErrorState error={error} onRetry={analyze} />
          ) : analysis ? (
            <AnalysisResult analysis={analysis} onCopy={copyImproved} copied={copied} />
          ) : (
            <EmptyAnalysis />
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyAnalysis() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 p-6 text-center">
      <div className="flex size-9 items-center justify-center rounded-md border border-border bg-background">
        <Wand2 className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">No analysis yet</p>
      <p className="max-w-xs text-xs text-muted-foreground leading-relaxed">
        Paste your code on the left and click Analyze to get bugs, suggestions, and a fixed version.
      </p>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">Analysis failed</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  )
}

function AnalysisResult({
  analysis,
  onCopy,
  copied,
}: {
  analysis: Analysis
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Analysis</span>
          <Badge variant="outline" className="border-border bg-background font-mono text-[10px]">
            {analysis.language}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{analysis.summary}</p>
      </div>

      <Tabs defaultValue="bugs" className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="bugs"
            className="rounded-none border-r border-border data-[state=active]:bg-accent data-[state=active]:shadow-none"
          >
            Bugs
            {analysis.bugs.length > 0 && (
              <span className="ml-2 rounded-full bg-destructive/10 px-1.5 font-mono text-[10px] text-destructive">
                {analysis.bugs.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="suggestions"
            className="rounded-none border-r border-border data-[state=active]:bg-accent data-[state=active]:shadow-none"
          >
            Suggestions
            {analysis.suggestions.length > 0 && (
              <span className="ml-2 rounded-full bg-primary/10 px-1.5 font-mono text-[10px] text-primary">
                {analysis.suggestions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="improved"
            className="rounded-none data-[state=active]:bg-accent data-[state=active]:shadow-none"
          >
            Improved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bugs" className="m-0 p-4">
          {analysis.bugs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1 py-10 text-center">
              <Check className="size-4 text-emerald-500" />
              <p className="text-sm font-medium">No bugs found</p>
              <p className="text-xs text-muted-foreground">The code looks correct.</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {analysis.bugs.map((bug, i) => (
                <li key={i} className="rounded-md border border-border bg-background/40 p-3">
                  <div className="flex items-start gap-2.5">
                    <BugIcon className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{bug.title}</p>
                        <span
                          className={cn(
                            "rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                            SEVERITY_STYLES[bug.severity],
                          )}
                        >
                          {bug.severity}
                        </span>
                        {bug.line && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            line {bug.line}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{bug.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="m-0 p-4">
          {analysis.suggestions.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No suggestions.</p>
          ) : (
            <ul className="space-y-2.5">
              {analysis.suggestions.map((s, i) => (
                <li key={i} className="rounded-md border border-border bg-background/40 p-3">
                  <div className="flex items-start gap-2.5">
                    <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="improved" className="m-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <span className="text-xs text-muted-foreground">Improved version</span>
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={onCopy}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="max-h-[440px] overflow-auto p-4 font-mono text-[12px] leading-relaxed">
            <code>{analysis.improvedCode}</code>
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AnalysisSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="space-y-2 border-b border-border px-4 py-3">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  )
}
