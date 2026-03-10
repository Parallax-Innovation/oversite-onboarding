import { NextRequest, NextResponse } from "next/server";

interface Progress {
  currentModule: number;
  currentLesson: number;
  completed: string[];
  userName: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CURRICULUM = `
# OverSite Training Curriculum

## Modules Overview

MODULE 1: The Big Picture (30 min)
- 1.1 What is OverSite?
- 1.2 The 4-Layer Architecture
- 1.3 User Journey Walkthrough

MODULE 2: Perception Layer (20 min)
- 2.1 Gemini Live API
- 2.2 Audio/Video Streaming
- 2.3 Key iOS Files

MODULE 3: Action Layer (25 min)
- 3.1 Tool Call Flow
- 3.2 Local-First Pattern
- 3.3 Async Fan-Out

MODULE 4: Observation Layer (30 min)
- 4.1 Event System
- 4.2 Supabase Integration
- 4.3 Dashboard Components

MODULE 5: Agent Layer (30 min)
- 5.1 E2B Sandboxes
- 5.2 Claude Agent SDK
- 5.3 Session Isolation

MODULE 6: Shipping Features (20 min)
- 6.1 Development Workflow
- 6.2 Git Conventions
- 6.3 Deployment Process

---

# MODULE 1.1: What is OverSite?

## The Problem
Construction projects are chaotic:
- 80% of projects run over schedule (McKinsey)
- 14+ hours lost per worker per week to miscommunication
- Site managers juggle 50+ contractors, schedules, and issues

The bottleneck? **On-site oversight.** Data exists in spreadsheets and tools - but it's not where the worker is.

## The Solution

\`\`\`
👷 Site Manager
    │ wears
    ▼
┌─────────────┐
│ Meta Ray-Ban │ ◄── Smart glasses with camera + mic
│   Glasses    │
└──────┬──────┘
       │ streams video + audio
       ▼
┌─────────────┐
│   OverSite  │ ◄── AI that can SEE and HEAR
│   Copilot   │
└──────┬──────┘
       │ takes actions
       ▼
┌─────────────┐
│  MS Planner │
│    Excel    │ ◄── Existing tools
│    Slack    │
└─────────────┘
\`\`\`

## How It Works (User Perspective)

Site Manager: *walks onto site wearing glasses*
              "Start walkthrough"

OverSite:     "Good morning. I can see the site. What are we checking today?"

Site Manager: *looks at exposed wiring*
              "Flag this - exposed wiring in unit 204"

OverSite:     "Issue flagged. Photo captured. I'm notifying the electrical contractor now."

              [Behind scenes: Creates MS Planner ticket, texts contractor, logs to dashboard]

Site Manager: "Who's the HVAC contractor?"

OverSite:     "Johnson HVAC. Contact is Mike at 555-1234. Scheduled to finish Friday."

Site Manager: "End walkthrough"

OverSite:     "3 issues flagged. Daily report sent to contractors."

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Glasses | Meta Ray-Ban | Camera + mic input |
| Mobile App | iOS (Swift) | Connects glasses to cloud |
| Perception AI | Gemini Live | Real-time voice + vision |
| Agent | Claude + E2B | Background task execution |
| Dashboard | Next.js | Observability for managers |
| Database | Supabase | Events, sessions, project data |

---

# MODULE 1.2: The 4-Layer Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                     OVERSITE ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ LAYER 1: PERCEPTION                                      │   │
│  │ Technology: Gemini Live API                              │   │
│  │ Job: See and hear. Understand context. Respond.          │   │
│  │ Input:  Audio + Video frames                             │   │
│  │ Output: Speech responses + Tool calls                    │   │
│  └────────────────────────────┬────────────────────────────┘   │
│                               │ tool calls                      │
│                               ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ LAYER 2: ACTION                                          │   │
│  │ Technology: ToolCallRouter (Swift)                       │   │
│  │ Job: Decide what to do with each tool call.              │   │
│  │                                                          │   │
│  │ ┌─────────────┐     ┌─────────────┐                      │   │
│  │ │ LOCAL       │     │ REMOTE      │                      │   │
│  │ │ (instant)   │     │ (async)     │                      │   │
│  │ │ flag_issue  │     │ execute     │                      │   │
│  │ │ take_photo  │     │ send_email  │                      │   │
│  │ └──────┬──────┘     └──────┬──────┘                      │   │
│  └────────┼──────────────────┼─────────────────────────────┘   │
│           │ events           │ delegate                         │
│           ▼                  ▼                                  │
│  ┌─────────────────┐  ┌─────────────────────────────────────┐  │
│  │ LAYER 3:        │  │ LAYER 4: AGENT                      │  │
│  │ OBSERVATION     │  │ Technology: Claude + E2B            │  │
│  │ EventStore +    │  │ Job: Execute complex async tasks.   │  │
│  │ Supabase +      │  │ Runs in isolated sandbox (microVM)  │  │
│  │ Dashboard       │  │ Creates tickets, sends messages,    │  │
│  │ Job: Record all │  │ syncs data, generates reports.      │  │
│  └─────────────────┘  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

## Layer 1: Perception (Gemini Live)
- Receives audio chunks from microphone
- Receives video frames from glasses camera (1 FPS, JPEG)
- Processes in real-time via WebSocket
- Responds with audio (text-to-speech)
- Emits tool calls when action needed

Model: \`gemini-2.5-flash-native-audio-preview-12-2025\`

Key files:
- \`ios/.../Gemini/GeminiLiveService.swift\` -- WebSocket connection
- \`ios/.../Gemini/GeminiSessionViewModel.swift\` -- Session orchestration
- \`ios/.../Gemini/GeminiConfig.swift\` -- API config

## Layer 2: Action (Tool Call Router)
- Receives tool calls from Gemini
- Decides: handle locally or delegate to Agent?
- Local = instant (<100ms response)
- Remote = async (fire-and-forget)

Key files:
- \`ios/.../Agent/ToolCallRouter.swift\` -- Two-tier dispatch
- \`ios/.../Verticals/ConstructionConfig.swift\` -- Construction handlers

**The Local-First + Async Fan-Out Pattern:**
When \`flag_issue\` is called, THREE things happen:
1. **Local capture (instant)** -- Save flag + photo in-memory. Return in <100ms.
2. **Event emission (async)** -- Queue event to Supabase for dashboard.
3. **Agent dispatch (fire-and-forget)** -- Create tickets, notify contractors.

## Layer 3: Observation (EventStore + Dashboard)
- Every action emits an event to EventClient
- Events batch and flush to Supabase
- Dashboard reads and displays timeline
- **Read-only projection** - never blocks user flow

Event types: session_started, session_ended, issue_flagged, tool_call_received, etc.

## Layer 4: Agent (Claude + E2B)
- Handles async tasks delegated from iOS app
- Runs Claude Agent SDK inside E2B sandboxes (Firecracker microVMs)
- Per-session isolation - each customer gets own sandbox
- Has access to: Read, Write, Bash, WebSearch, WebFetch

---

# MODULE 1.3: User Journey Walkthrough

\`\`\`
                           USER JOURNEY: "Flag This"
═══════════════════════════════════════════════════════════════════════

TIME     USER ACTION              SYSTEM RESPONSE           LATENCY
─────────────────────────────────────────────────────────────────────
0ms      "Flag this - exposed
         wiring in 204"

50ms                              Gemini receives audio     50ms

200ms                             Gemini processes speech   150ms

300ms                             Gemini emits tool call:   100ms
                                  flag_issue(
                                    description: "exposed wiring",
                                    location: "unit 204"
                                  )

350ms                             ToolCallRouter receives   50ms
                                  → LOCAL handler

400ms                             SessionManager.flagIssue: 50ms
                                  - Captures camera frame
                                  - Stores in memory
                                  - Returns success

450ms                             Gemini receives result    50ms

500ms    USER HEARS:              Gemini speaks response    50ms
         "Issue flagged."

─────────────────────────────────────────────────────────────────────
         TOTAL USER-PERCEIVED LATENCY: ~500ms
═══════════════════════════════════════════════════════════════════════

MEANWHILE (async, user doesn't wait):

500ms+                            EventClient queues event
1000ms                            Event flushed to Supabase
1000ms                            Agent task dispatched
2000ms                            Agent creates MS Planner ticket
3000ms                            Agent sends Slack notification
5000ms                            Dashboard updated
\`\`\`

---

# MODULE 2.1: Gemini Live API

## What is Gemini Live?
Real-time multimodal AI: voice conversation + camera vision simultaneously.

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    GEMINI LIVE API                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐          ┌─────────────┐                  │
│  │   Client    │ ◄──────► │   Gemini    │                  │
│  │ (iOS App)   │  WebSocket│   Server    │                  │
│  └─────────────┘          └─────────────┘                  │
│        │                        │                          │
│        │ sends:                 │ sends:                   │
│        │ - Audio chunks         │ - Audio responses        │
│        │ - Video frames (JPEG)  │ - Tool calls             │
│        │ - Tool results         │ - Transcriptions         │
│        │                        │                          │
└─────────────────────────────────────────────────────────────┘
\`\`\`

Model: \`gemini-2.5-flash-native-audio-preview-12-2025\`

## Key Files
- \`GeminiLiveService.swift\` - WebSocket connection, message handling
- \`GeminiSessionViewModel.swift\` - Session lifecycle, wires audio/video
- \`GeminiConfig.swift\` - API key, model, frame rate (1 FPS), JPEG quality

---

# MODULE 3.1: Tool Call Flow

\`\`\`
                    TOOL CALL ROUTING
═════════════════════════════════════════════════════

Gemini emits tool call
         │
         ▼
┌─────────────────────────┐
│   ToolCallRouter        │
│   handleToolCall()      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Try LOCAL handler first │
│ (ConstructionConfig)    │
└───────────┬─────────────┘
            │
      ┌─────┴─────┐
      │           │
   handled     not handled
      │           │
      ▼           ▼
┌──────────┐  ┌──────────┐
│ Return   │  │ Send to  │
│ result   │  │ Agent    │
│ to Gemini│  │ (async)  │
└──────────┘  └──────────┘
\`\`\`

---

# MODULE 4.1: Event System

\`\`\`
iOS App                     Server                    Dashboard
   │                          │                          │
   │──event──►EventClient     │                          │
   │              │           │                          │
   │          (batches 20)    │                          │
   │              │           │                          │
   │              ├──────────►│ POST /api/events         │
   │              │           │       │                  │
   │              │           │       ▼                  │
   │              │           │   Supabase               │
   │              │           │       │                  │
   │              │           │       └─────────────────►│
   │              │           │                    useQuery()
   │              │           │                          │
\`\`\`

Event Types:
- session_started / session_ended
- gemini_connected / gemini_disconnected
- user_transcription / ai_transcription
- tool_call_received / tool_call_completed
- issue_flagged / walkthrough_ended

---

# MODULE 5.1: E2B Sandboxes

E2B = Firecracker microVMs for secure code execution.

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     E2B ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  iOS App                                                    │
│     │                                                       │
│     │ POST /api/agent/chat                                  │
│     │ x-agent-session-key: abc123                           │
│     ▼                                                       │
│  ┌──────────────────────────────────────────────┐          │
│  │ Vercel (oversite.so)                         │          │
│  │                                              │          │
│  │  1. Look up session_key in agent_sandboxes   │          │
│  │  2. If exists: Sandbox.connect(sandboxId)    │          │
│  │  3. If not: Sandbox.create('oversite-agent') │          │
│  │  4. Run: node /home/user/agent/run.mjs       │          │
│  │  5. Parse JSON result from stdout            │          │
│  └──────────────────────────────────────────────┘          │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────┐          │
│  │ E2B Sandbox (Firecracker microVM)            │          │
│  │                                              │          │
│  │  - Isolated filesystem                       │          │
│  │  - Claude Agent SDK                          │          │
│  │  - Tools: Read, Write, Bash, WebSearch       │          │
│  │  - Per-session: credentials isolated         │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

# MODULE 6.1: Development Workflow

## Local Setup
1. Clone repo: \`git clone https://github.com/Parallax-Innovation/oversite.git\`
2. Install deps: \`npm install\`
3. Copy env: \`cp .env.example .env.local\`
4. Add keys: SUPABASE_URL, SUPABASE_SERVICE_KEY, E2B_API_KEY, ANTHROPIC_API_KEY
5. Run: \`npm run dev\`

## Git Conventions
- Branch naming: \`feat/feature-name\`, \`fix/bug-description\`
- Commit format: \`feat: add dashboard filter\`, \`fix: resolve event batching\`
- PR required for all changes to main

## Deployment
- Vercel auto-deploys from \`main\` branch
- Preview deployments for PRs
- Environment variables managed in Vercel dashboard
`;

const KNOWLEDGE_BASE = `
# OverSite Architecture Reference

## Overview
OverSite is an AI copilot for field workers. A site manager wears smart glasses (Meta Ray-Ban), talks to a real-time AI (Gemini Live), and the AI can see through the camera, flag issues, and delegate actions to a background agent.

## Four Layers
1. **Perception** - Gemini Live (real-time voice + vision)
2. **Action** - ToolCallRouter (local-first + async fan-out)
3. **Observation** - EventStore + Supabase + Dashboard
4. **Agent** - Claude Agent SDK + E2B Sandboxes

## Key Files

### iOS App
- \`GeminiLiveService.swift\` - WebSocket to Gemini Live API
- \`GeminiSessionViewModel.swift\` - Session orchestration
- \`ToolCallRouter.swift\` - Two-tier tool dispatch
- \`ConstructionConfig.swift\` - Construction vertical handlers
- \`SessionManager.swift\` - In-memory state (flags, photos)
- \`EventClient.swift\` - Event batching to Supabase

### Web (Next.js)
- \`src/app/dashboard/\` - Observability dashboard
- \`src/app/api/events/route.ts\` - Event ingestion
- \`src/app/api/agent/chat/route.ts\` - Agent endpoint
- \`src/lib/queries.ts\` - Supabase queries

### E2B
- \`e2b/agent/run.mjs\` - Agent runner script
- \`e2b/agent/server.mjs\` - Unified orchestrator

## Infrastructure
| Service | Purpose |
|---------|---------|
| Vercel | Hosts Next.js |
| Supabase | Events + blob storage |
| Gemini Live | Real-time AI |
| E2B | Sandboxed agent execution |
| Claude | Agentic LLM |
`;

function buildSystemPrompt(userName: string, progress: Progress): string {
  return `You are the OverSite Training System. You're training ${userName || "an engineer"} on the OverSite codebase.

# CURRICULUM
${CURRICULUM}

# KNOWLEDGE BASE
${KNOWLEDGE_BASE}

# CURRENT PROGRESS
- Module: ${progress.currentModule}
- Lesson: ${progress.currentLesson}
- Completed lessons: ${progress.completed.length}/18

# YOUR ROLE

You are a Socratic instructor who:
1. Follows the curriculum in order
2. Uses ASCII visualizations for every concept
3. Probes the student to THINK, not just recall
4. Asks creative "what if" questions
5. Celebrates good thinking, gently corrects misconceptions

# TEACHING PHILOSOPHY

**Don't just lecture. Make them think.**

Bad: "The 4 layers are Perception, Action, Observation, Agent."
Good: "Before I tell you the architecture, what layers would YOU design if you were building an AI copilot for glasses?"

**Use Socratic questioning:**
- "Why do you think they chose that approach?"
- "What would break if we removed this layer?"
- "How would you solve this differently?"
- "What's the tradeoff here?"

# CREATIVE THINKING PROMPTS

At the end of each concept, ask ONE of these:
1. "If you were redesigning this, what would you change?"
2. "What's the biggest weakness of this approach?"
3. "How would this break at 10x scale?"
4. "What would this look like in [different industry]?"

# VISUALIZATION RULES

ALWAYS use ASCII diagrams. Never explain architecture without a visual.

# COMMANDS

- "start" - Begin from current lesson
- "next" - Move to next lesson
- "back" - Go to previous lesson
- "progress" - Show current progress
- "checkpoint" - Run module checkpoint quiz

# PERSONALIZATION

Address the student by name: ${userName || "friend"}
Remember their previous answers and refer back to them.
Adapt your pace to their understanding level.

Remember: Your goal is for ${userName || "this engineer"} to DEEPLY UNDERSTAND the system, not just memorize facts.`;
}

// OpenRouter API with free models
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, progress } = body as {
      messages: Message[];
      progress: Progress;
    };

    const systemPrompt = buildSystemPrompt(progress.userName, progress);

    // Format messages for OpenRouter (OpenAI-compatible)
    const openRouterMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://oversite-onboarding.vercel.app",
        "X-Title": "OverSite Training",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: openRouterMessages,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      return NextResponse.json(
        { error: "API request failed", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request", details: String(error) },
      { status: 500 }
    );
  }
}
