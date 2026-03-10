# OverSite Visualizations Reference

Quick reference for all architecture diagrams.

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     OVERSITE SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  👷 User with Glasses                                           │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐     │
│  │   iOS App   │◄────►│   Vercel    │◄────►│  Supabase   │     │
│  │  (Swift)    │      │  (Next.js)  │      │  (Postgres) │     │
│  └──────┬──────┘      └──────┬──────┘      └─────────────┘     │
│         │                    │                                  │
│         ▼                    ▼                                  │
│  ┌─────────────┐      ┌─────────────┐                          │
│  │   Gemini    │      │    E2B      │                          │
│  │   Live      │      │  Sandboxes  │                          │
│  └─────────────┘      └─────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Four Layers

```
┌────────────────────────────────────────────┐
│ L1: PERCEPTION    │ Gemini Live            │
│                   │ Voice + Vision AI      │
├───────────────────┼────────────────────────┤
│ L2: ACTION        │ ToolCallRouter         │
│                   │ Local vs Remote        │
├───────────────────┼────────────────────────┤
│ L3: OBSERVATION   │ EventStore + Dashboard │
│                   │ Record everything      │
├───────────────────┼────────────────────────┤
│ L4: AGENT         │ Claude + E2B           │
│                   │ Async task execution   │
└───────────────────┴────────────────────────┘
```

## 3. Tool Call Flow

```
              Gemini emits tool_call
                      │
                      ▼
              ┌───────────────┐
              │ ToolCallRouter│
              └───────┬───────┘
                      │
           ┌─────────┴─────────┐
           ▼                   ▼
    ┌─────────────┐     ┌─────────────┐
    │   LOCAL     │     │   REMOTE    │
    │  (instant)  │     │  (async)    │
    │             │     │             │
    │ flag_issue  │     │  execute    │
    │ end_walk    │     │  send_email │
    └──────┬──────┘     └──────┬──────┘
           │                   │
           ▼                   ▼
    Return to Gemini     Fire to Agent
      (<100ms)          (fire-and-forget)
```

## 4. Event Pipeline

```
iOS ──► EventClient ──► POST /api/events ──► Supabase ──► Dashboard
         (batch 20)
```

## 5. Session Lifecycle

```
START ──► Setup ──► Streaming ──► STOP
           │           │            │
           │           │            └── Auto-end walkthrough
           │           │                Generate report
           │           │                Flush events
           │           │
           │           └── Tool calls
           │               Transcriptions
           │               Issue flags
           │
           └── Connect Gemini
               Load system prompt
               Start audio/video
```

## 6. E2B Sandbox Architecture

```
┌─────────────────────────────────────────────┐
│              E2B Platform                    │
│  ┌─────────────────────────────────────┐    │
│  │         Firecracker microVM         │    │
│  │  ┌───────────────────────────────┐  │    │
│  │  │      Ubuntu 24.04 + Node      │  │    │
│  │  │  ┌─────────────────────────┐  │  │    │
│  │  │  │    Claude Agent SDK     │  │  │    │
│  │  │  │  ┌───────────────────┐  │  │  │    │
│  │  │  │  │ Tools:            │  │  │  │    │
│  │  │  │  │ • Read/Write/Edit │  │  │  │    │
│  │  │  │  │ • Bash            │  │  │  │    │
│  │  │  │  │ • WebSearch       │  │  │  │    │
│  │  │  │  │ • WebFetch        │  │  │  │    │
│  │  │  │  └───────────────────┘  │  │  │    │
│  │  │  └─────────────────────────┘  │  │    │
│  │  └───────────────────────────────┘  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Session A    Session B    Session C        │
│  (isolated)   (isolated)   (isolated)       │
└─────────────────────────────────────────────┘
```

## 7. Data Flow Diagram

```
                    ┌──────────────┐
                    │   Glasses    │
                    │  (camera +   │
                    │   mic)       │
                    └──────┬───────┘
                           │ audio + video
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                        iOS App                                │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│  │  Audio   │    │  Video   │    │  Session │               │
│  │ Capture  │    │ Capture  │    │ Manager  │               │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘               │
│       │               │               │                      │
│       └───────┬───────┘               │                      │
│               │                       │                      │
│               ▼                       │                      │
│        ┌─────────────┐               │                      │
│        │GeminiLive   │◄──────────────┘                      │
│        │Service      │                                       │
│        └──────┬──────┘                                       │
│               │                                              │
│               │ tool calls                                   │
│               ▼                                              │
│        ┌─────────────┐    events    ┌─────────────┐         │
│        │ToolCall     │─────────────►│ EventClient │         │
│        │Router       │              └──────┬──────┘         │
│        └──────┬──────┘                     │                │
│               │                            │                │
└───────────────┼────────────────────────────┼────────────────┘
                │                            │
                │ delegate                   │ POST
                ▼                            ▼
         ┌─────────────┐              ┌─────────────┐
         │   Agent     │              │   Vercel    │
         │   (E2B)     │              │   API       │
         └─────────────┘              └──────┬──────┘
                                             │
                                             ▼
                                      ┌─────────────┐
                                      │  Supabase   │
                                      │  (events)   │
                                      └──────┬──────┘
                                             │
                                             ▼
                                      ┌─────────────┐
                                      │  Dashboard  │
                                      └─────────────┘
```

## 8. Repository Structure

```
oversite/
├── src/                    # Next.js web app
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── dashboard/      # Observability UI
│   │   └── api/            # API routes
│   ├── components/
│   └── lib/
├── e2b/                    # Agent sandbox
│   └── agent/
│       ├── server.mjs      # Agent orchestrator
│       └── run.mjs         # One-shot runner
├── ios/                    # iOS app (subtree)
│   └── samples/CameraAccess/CameraAccess/
│       ├── Gemini/         # Gemini Live
│       ├── Agent/          # Tool routing
│       ├── Core/           # Business logic
│       ├── Verticals/      # Configurations
│       └── EventStore/     # Event system
└── supabase/
    └── migrations/         # DB schema
```
