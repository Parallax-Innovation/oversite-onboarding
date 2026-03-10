# OverSite Architecture

## Overview

OverSite is an AI copilot for field workers. A site manager wears smart glasses (Meta Ray-Ban), talks to a real-time AI (Gemini Live), and the AI can see through the camera, flag issues, and delegate actions to a background agent that connects to digital platforms (MS Planner, Excel, Slack, etc.).

```
Smart Glasses (Meta Ray-Ban)
       |
       | video + audio
       v
iOS App (VisionClaw platform)
       |
       ├── Gemini Live (real-time voice + vision AI)
       |       |
       |       ├── flag_issue ──> Local capture (instant)
       |       |                       |
       |       |                       ├── SessionManager (in-memory flags + photos)
       |       |                       ├── EventClient ──> Supabase ──> Dashboard
       |       |                       └── Agent fan-out (async platform actions)
       |       |
       |       └── execute ────> Agent (general agent tasks)
       |
       └── WebRTC (glasses camera stream)
```

## Four Layers

### 1. Perception Layer -- Gemini Live

Gemini Live provides real-time multimodal AI: voice conversation + camera vision. The user speaks naturally ("flag this", "what's that material?"), and Gemini sees through the glasses camera.

**Model:** `gemini-2.5-flash-native-audio-preview-12-2025`

**Key files:**
- `ios/.../Gemini/GeminiLiveService.swift` -- WebSocket connection to Gemini Live API, handles audio/video streaming, transcription callbacks, tool calls
- `ios/.../Gemini/GeminiSessionViewModel.swift` -- Orchestrates a session: wires audio, video, tool calls, transcription events; manages session lifecycle (start/stop)
- `ios/.../Gemini/GeminiConfig.swift` -- API key, model selection, frame rate, JPEG quality

**Data flow:**
```
User speaks ──> Audio chunks ──> Gemini Live API
Camera frames ──> JPEG at 1fps ──> Gemini Live API
Gemini responds ──> Audio playback to user
Gemini tool call ──> ToolCallRouter
```

### 2. Action Layer -- Tool Call Routing

When Gemini decides to act (flag an issue, execute a task), it emits a tool call. The `ToolCallRouter` implements a two-tier dispatch:

```
Gemini tool call
       |
       v
ToolCallRouter.handleToolCall()
       |
       ├── Try vertical's local handler first
       |   (ConstructionConfig.handleToolCall)
       |       |
       |       ├── flag_issue ──> SessionManager.flagIssue() [instant]
       |       |                       + asyncFanOutTask() ──> Agent [fire-and-forget]
       |       |
       |       └── end_walkthrough ──> SessionManager.endWalkthrough()
       |
       └── If local returns nil ──> Agent (remote agent)
           (execute tool, general tasks)
```

**Key files:**
- `ios/.../Agent/ToolCallRouter.swift` -- Two-tier dispatch + async fan-out
- `ios/.../Core/VerticalConfiguration.swift` -- Protocol: `handleToolCall()`, `asyncFanOutTask()`, `systemPrompt`, `toolDeclarations`, `generateReport()`
- `ios/.../Verticals/ConstructionConfig.swift` -- Construction vertical: flag_issue, end_walkthrough, CSV reports, fan-out to Agent

**Local-first + async fan-out pattern:**

When `flag_issue` is called, three things happen from one tool call:

1. **Local capture (instant)** -- `SessionManager.flagIssue()` saves the flag + camera photo in-memory. Returns result to Gemini in <100ms. User hears confirmation immediately.
2. **Event emission (async)** -- `EventClient` queues an `issue_flagged` event to Supabase. The dashboard sees it.
3. **Agent dispatch (fire-and-forget)** -- `asyncFanOutTask()` returns a task description. `ToolCallRouter` fires it to Agent via `Task.detached`. Agent creates tickets, updates trackers, sends notifications. User never waits for this.

### 3. Observation Layer -- EventStore + Dashboard

Every significant action emits an event to `EventClient`, which batches and flushes to the server API, which writes to Supabase. The dashboard reads from Supabase.

```
iOS App
  EventClient (actor, batches of 20)
       |
       | POST /api/events (JSON array)
       v
Next.js API Route (src/app/api/events/route.ts)
       |
       v
Supabase (events table)
       |
       v
Dashboard (src/app/dashboard/)
  - Sessions list (oversite.so/dashboard)
  - Session detail (oversite.so/dashboard/[sessionId])
  - Event timeline with consolidated transcripts
```

**Event types:**

| Event | When |
|-------|------|
| `session_started` | Walkthrough begins |
| `session_ended` | Stream stops (auto-ends walkthrough) |
| `gemini_connected` / `gemini_disconnected` | Gemini WebSocket lifecycle |
| `user_transcription` / `ai_transcription` | Each speech chunk |
| `tool_call_received` | Gemini emits a tool call |
| `tool_call_routed_local` / `tool_call_routed_remote` | Dispatched to vertical or Agent |
| `tool_call_completed` / `tool_call_failed` / `tool_call_cancelled` | Tool call result |
| `issue_flagged` | flag_issue captured (includes photo blob URL) |
| `walkthrough_started` / `walkthrough_ended` | Walkthrough lifecycle |
| `report_generated` | CSV report created |

### 4. Agent Layer -- Claude Agent SDK + E2B Sandboxes

The agent layer handles async tasks delegated from the iOS app. It runs the **Claude Agent SDK** inside **E2B sandboxes** (Firecracker microVMs) for per-session isolation.

```
iOS App (AgentBridge)
       |
       | POST /api/agent/chat
       | Header: x-agent-session-key
       v
oversite.so (Vercel)
  src/app/api/agent/chat/route.ts
       |
       ├── E2B mode (E2B_API_KEY set):
       |     1. Look up session_key in Supabase agent_sandboxes
       |     2. If found + active: Sandbox.connect(sandboxId)
       |     3. If not found: Sandbox.create('oversite-agent')
       |     4. sandbox.commands.run('node /home/user/agent/run.mjs')
       |     5. Parse JSON result from stdout
       |     6. Return OpenAI-compatible response
```

**How it works:**

Each session key gets its own E2B sandbox (Firecracker microVM). Inside the sandbox, `run.mjs` runs the Claude Agent SDK's `query()` function with full tool capabilities. The agent processes the prompt, uses tools as needed, and outputs a JSON result to stdout.

**Per-session isolation:**

Each customer gets their own E2B sandbox. Files written in one session are invisible to other sessions. The `ANTHROPIC_API_KEY` is injected at sandbox creation, so no credentials leak between sessions.

## Infrastructure

| Service | Purpose | Config |
|---------|---------|--------|
| **Vercel** | Hosts Next.js (oversite.so) | Auto-deploy from `main` |
| **Supabase** | Events database + blob storage | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` |
| **Gemini Live API** | Real-time multimodal AI | API key in `GeminiConfig.swift` |
| **E2B** | Sandboxed agent execution | `E2B_API_KEY`, `E2B_TEMPLATE_ID` |
| **Claude Agent SDK** | Agentic LLM inside E2B sandboxes | `ANTHROPIC_API_KEY` |

## Repository Structure

```
oversite/
  src/                             # Next.js web app (oversite.so)
    app/
      page.tsx                     # Landing page
      dashboard/                   # Observability dashboard
      api/
        events/route.ts            # Event ingestion endpoint
        agent/chat/route.ts        # Agent chat endpoint
    components/dashboard/          # Dashboard UI components
    lib/
      queries.ts                   # Supabase query functions
      supabase.ts                  # Supabase client
      sandbox.ts                   # E2B sandbox manager
  e2b/                             # E2B sandbox template
    agent/
      run.mjs                      # Agent runner script
      server.mjs                   # Unified agent orchestrator
  ios/                             # Git subtree from VisionClaw
    samples/CameraAccess/CameraAccess/
      Gemini/                      # Gemini Live integration
      Agent/                       # AgentBridge, ToolCallRouter
      Core/                        # SessionManager (oversite-only)
      Verticals/                   # ConstructionConfig (oversite-only)
      EventStore/                  # EventClient (oversite-only)
```
