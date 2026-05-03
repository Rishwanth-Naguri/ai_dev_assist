# 🚀 DevAssist  
### AI-Powered Developer Workspace with MCP Integration

DevAssist is a modern, production-ready AI developer platform that unifies code assistance, debugging, and real-time external data into a single intelligent workspace.

Instead of switching between tools like ChatGPT, GitHub, and documentation, DevAssist enables developers to **build, debug, and analyze faster with context-aware AI**.

---

## 🌟 Key Highlights

- 🧠 AI + Real-time Data (via MCP)
- ⚡ Developer-first UX (SaaS-grade UI)
- 🔐 Secure server-side integrations
- 🚀 Built for speed, clarity, and productivity

---

## ✨ Features

### 🤖 AI Chat Assistant
- Context-aware developer Q&A
- Supports React, Node.js, MongoDB, Express, Next.js
- Streaming responses (real-time)
- Clean, modern chat interface

---

### 🧠 Code Analyzer
- Detect bugs and anti-patterns
- Suggest improvements
- Generate fixed code instantly
- Structured output:
  - ❌ Bugs
  - ⚠️ Warnings
  - 🚀 Suggestions
  - 💡 Optimized Code

---

### 🔗 MCP Data Viewer (Model Context Protocol)
- Fetch real-time GitHub repository data
- No mock data — fully live API integration

Displays:
- 📦 Repository Name  
- ⭐ Stars  
- 🧑‍💻 Language  
- 🕒 Last Updated  

> Powered by secure server-side GitHub API integration

---

### 🎛️ Unified SaaS Dashboard
- Sidebar + multi-panel layout
- Chat + Code Analyzer + MCP tools in one workspace
- Inspired by Linear / Vercel / Stripe UI systems
- Clean, minimal, high-performance UX

---

## 🧱 Tech Stack

| Layer        | Technology |
|-------------|-----------|
| Frontend    | Next.js (App Router), React |
| Styling     | Tailwind CSS |
| AI Layer    | Vercel AI SDK |
| Backend     | Server Actions / API Routes |
| Data Layer  | GitHub REST API |
| Protocol    | MCP (Model Context Protocol) |
| Deployment  | Vercel |

---

## 🏗️ Architecture Overview

```text
                ┌───────────────────────────┐
                │        Frontend UI        │
                │   (Next.js + Tailwind)   │
                │                           │
                │  - Chat Interface         │
                │  - Code Analyzer          │
                │  - MCP Dashboard          │
                └────────────┬──────────────┘
                             │
                             ▼
                ┌───────────────────────────┐
                │      Backend Layer        │
                │ (API Routes / Server)     │
                │                           │
                │  - AI Processing          │
                │  - GitHub API Calls       │
                │  - MCP Integration        │
                └────────────┬──────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────┐    ┌────────────────┐    ┌────────────────┐
│  Vercel AI   │    │ GitHub REST API│    │ MCP Server      │
│   SDK        │    │ (Repo Data)    │    │ (Tools Layer)   │
└──────────────┘    └────────────────┘    └────────────────┘
