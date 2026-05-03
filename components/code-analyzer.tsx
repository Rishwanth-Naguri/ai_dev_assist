"use client"

import { useState } from "react"
import { Code2, Bug, Lightbulb, Copy, Check, Wand2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  high: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  critical: "bg-destructive/15 text-destructive border-destructive/40",
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
    toast.success("Improved code copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Code Analyzer</h1>
        <p className="text-sm text-muted-foreground">
          Paste JavaScript, TypeScript, or MERN-stack code and get bugs, suggestions, and an improved version.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="size-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Your Code</CardTitle>
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
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code here…"
              spellCheck={false}
              className="min-h-[360px] resize-none rounded-none border-0 bg-transparent font-mono text-xs leading-relaxed shadow-none focus-visible:ring-0"
              disabled={loading}
            />
            <div className="flex items-center justify-between border-t border-border px-3 py-2">
              <span className="text-xs text-muted-foreground">{code.length.toLocaleString()} characters</span>
              <Button onClick={analyze} disabled={!code.trim() || loading} size="sm">
                {loading ? (
                  <>
                    <Spinner className="size-3.5" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Wand2 className="size-3.5" />
                    Analyze Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <AnalysisSkeleton />
          ) : error ? (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertTriangle className="mt-0.5 size-4 text-destructive" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Analysis failed</p>
                  <p className="text-xs text-muted-foreground">{error}</p>
                </div>
              </CardContent>
            </Card>
          ) : analysis ? (
            <AnalysisResult analysis={analysis} onCopy={copyImproved} copied={copied} />
          ) : (
            <Card className="border-dashed bg-card/50">
              <CardContent className="flex min-h-[360px] flex-col items-center justify-center gap-2 text-center">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Wand2 className="size-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No analysis yet</p>
                <p className="max-w-xs text-xs text-muted-foreground">
                  Paste your code on the left and click Analyze Code to get bugs, suggestions, and an improved version.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
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
    <Card className="border-border bg-card">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Analysis</CardTitle>
          <Badge variant="secondary" className="font-mono text-[10px]">
            {analysis.language}
          </Badge>
        </div>
        <CardDescription className="text-pretty">{analysis.summary}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="bugs" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger value="bugs" className="rounded-none border-r border-border data-[state=active]:bg-muted/40">
              Bugs
              {analysis.bugs.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                  {analysis.bugs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="rounded-none border-r border-border data-[state=active]:bg-muted/40">
              Suggestions
              {analysis.suggestions.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                  {analysis.suggestions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="improved" className="rounded-none data-[state=active]:bg-muted/40">
              Improved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bugs" className="m-0 p-4">
            {analysis.bugs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Check className="mb-2 size-5 text-primary" />
                <p className="text-sm font-medium">No bugs found</p>
                <p className="text-xs text-muted-foreground">The code looks correct.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {analysis.bugs.map((bug, i) => (
                  <li key={i} className="rounded-md border border-border bg-muted/30 p-3">
                    <div className="flex items-start gap-2">
                      <Bug className="mt-0.5 size-4 shrink-0 text-destructive" />
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{bug.title}</p>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                              SEVERITY_STYLES[bug.severity],
                            )}
                          >
                            {bug.severity}
                          </span>
                          {bug.line ? (
                            <span className="font-mono text-[10px] text-muted-foreground">line {bug.line}</span>
                          ) : null}
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
              <p className="py-8 text-center text-sm text-muted-foreground">No suggestions.</p>
            ) : (
              <ul className="space-y-3">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="rounded-md border border-border bg-muted/30 p-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
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
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onCopy}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre className="max-h-[440px] overflow-auto p-4 font-mono text-xs leading-relaxed">
              <code>{analysis.improvedCode}</code>
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function AnalysisSkeleton() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="space-y-2 border-b border-border pb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  )
}
