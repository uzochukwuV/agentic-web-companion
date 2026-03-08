# DevAgent — Autonomous Web Agent Platform

> **AI that actually works the web.** Not another chatbot — DevAgent sends autonomous AI agents into live websites to research companies, analyze competitors, extract data, and execute multi-step workflows.

Powered by the [TinyFish Web Agent API](https://tinyfish.ai).

---

## 🚀 What It Does

DevAgent is a full-stack autonomous web agent platform that performs **real labor on the live web**. Each agent navigates real websites, handles dynamic UIs, manages sessions, pagination, pop-ups, and form fills — then returns structured, actionable data.

### Agent Capabilities

| Agent | What It Does | Business Value |
|-------|-------------|----------------|
| **Lead Research** | Researches companies across their website, LinkedIn, Crunchbase — extracts team, tech stack, funding, news | Sales teams save hours of manual research per lead |
| **Competitive Intel** | Visits competitor websites, pricing pages, feature lists — generates positioning analysis | Product teams get real-time competitive intelligence |
| **Data Extractor** | Scrapes structured data from any website with pagination — products, jobs, reviews, directories | Data teams eliminate manual copy-paste workflows |
| **Workflow Builder** | Chains multi-step web tasks into automated sequences with context carry-forward | Operations teams automate complex web-based processes |
| **DevCopilot** | Extracts documentation, code examples, and bug fixes from live developer sites | Developers get structured reference material instantly |
| **QA Tester** | Executes E2E tests described in plain English on real websites | QA teams run tests without writing code |

---

## 🏗️ Architecture

```
┌─────────────────────────┐
│   React Frontend (Vite) │
│   - 6 Agent UIs         │
│   - Real-time stream log│
│   - Structured results  │
└──────────┬──────────────┘
           │ supabase.functions.invoke()
┌──────────▼──────────────┐
│  Edge Function Proxy    │
│  (tinyfish-proxy)       │
│  - Secure API key mgmt  │
│  - SSE stream parsing   │
│  - 300s timeout          │
└──────────┬──────────────┘
           │ HTTPS + SSE
┌──────────▼──────────────┐
│  TinyFish Agent API     │
│  - Real browser sessions│
│  - Multi-step navigation│
│  - Dynamic UI handling  │
└─────────────────────────┘
```

### Key Design Decisions

- **Secure Proxy**: The TinyFish API key never touches the frontend. All requests route through a Supabase Edge Function.
- **SSE Stream Parsing**: The proxy consumes TinyFish's Server-Sent Events stream, extracting agent activity logs and final results.
- **300s Timeout**: Long-running agent tasks (multi-page scraping, deep research) are supported with extended timeouts.
- **Structured Output**: Each agent requests JSON-structured responses from TinyFish, then renders them with purpose-built UI components.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **UI**: shadcn/ui components, JetBrains Mono + Space Grotesk fonts
- **Backend**: Supabase Edge Functions (Deno)
- **Agent API**: TinyFish Web Agent API (SSE streaming)
- **Design**: Terminal-inspired dark theme with neon accent system

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── Index.tsx           # Landing page with all agents
│   ├── LeadResearch.tsx    # Company research agent
│   ├── CompetitiveIntel.tsx# Competitor analysis agent
│   ├── DataExtractor.tsx   # Structured data scraping
│   ├── WorkflowBuilder.tsx # Multi-step workflow engine
│   ├── DevCopilot.tsx      # Documentation extraction
│   └── QATester.tsx        # E2E testing agent
├── hooks/
│   └── useTinyFishAgent.ts # Shared agent hook
├── components/
│   ├── AgentStreamLog.tsx  # Real-time activity display
│   └── Navbar.tsx          # Navigation with mobile support
supabase/
└── functions/
    └── tinyfish-proxy/     # Secure API proxy
```

---

## 🔑 Why This Isn't Just Another Wrapper

1. **Real web navigation**: Every agent opens actual browser sessions and navigates live websites — not API calls to databases.
2. **Multi-step workflows**: The Workflow Builder chains sequential web tasks with context carry-forward between steps.
3. **Handles web complexity**: Pagination, pop-ups, dynamic content, session management — the agents deal with all of it.
4. **Structured output**: Raw web content is transformed into actionable structured data (JSON/CSV) with purpose-built UIs.
5. **Business-ready**: Each agent solves a real pain point — lead research, competitive intelligence, data extraction — that currently costs companies hours of manual labor.

---

## License

MIT
