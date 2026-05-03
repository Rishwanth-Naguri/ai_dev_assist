import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { AnimatedBackground } from "@/components/animated-background"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "DevAssist — AI Developer Workspace",
  description:
    "An AI-native developer workspace. Chat with a streaming model, analyze code, and inspect GitHub repositories through the Model Context Protocol.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#07060e",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased text-foreground">
        <AnimatedBackground />
        <div className="relative isolate min-h-svh">{children}</div>
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "border border-white/10 bg-card/80 backdrop-blur-md text-foreground",
            },
          }}
        />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
