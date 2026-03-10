# OverSite Key Files Reference

## iOS Files

### Gemini Layer
| File | Purpose |
|------|---------|
| `Gemini/GeminiLiveService.swift` | WebSocket to Gemini, audio/video streaming, `sendText()` |
| `Gemini/GeminiSessionViewModel.swift` | Session orchestration, approve/refine handlers |
| `Gemini/GeminiConfig.swift` | API key, model (`gemini-2.5-flash-native-audio-preview-12-2025`), frame rate |

### Agent Layer
| File | Purpose |
|------|---------|
| `Agent/AgentBridge.swift` | HTTP client to agent layer, smart status tracking via `activeToolName` |
| `Agent/ToolCallRouter.swift` | Two-tier dispatch + async fan-out |
| `Agent/ToolCallModels.swift` | AgentResponseData, ArtifactParser, ToolCallStatus |

### Core (OverSite-specific)
| File | Purpose |
|------|---------|
| `Core/VerticalConfiguration.swift` | Protocol for pluggable verticals |
| `Core/SessionManager.swift` | In-memory flags + walkthrough state |
| `Core/ProjectDataClient.swift` | Fetches contractor/schedule data for context injection |

### Verticals (OverSite-specific)
| File | Purpose |
|------|---------|
| `Verticals/ConstructionConfig.swift` | System prompt, flag_issue, end_walkthrough, CSV reports |
| `Verticals/GeneralConfig.swift` | Default vertical (everything goes to Agent) |

### EventStore (OverSite-specific)
| File | Purpose |
|------|---------|
| `EventStore/EventClient.swift` | Actor that queues events, auto-flushes, persists to disk |
| `EventStore/EventTypes.swift` | Event type enum |

### Views
| File | Purpose |
|------|---------|
| `Views/StreamSessionView.swift` | Main streaming view |
| `Views/NonStreamView.swift` | Pre-stream setup + vertical picker |
| `Views/AgentResponseSheet.swift` | WKWebView markdown rendering, inline images |

## Web Files

### API Routes
| File | Purpose |
|------|---------|
| `src/app/api/agent/chat/route.ts` | Routes to E2B sandbox |
| `src/app/api/agent/init/route.ts` | Creates chat session + boots sandbox |
| `src/app/api/events/route.ts` | Event ingestion |
| `src/app/api/contractors/route.ts` | Contractor CRUD + CSV upload |
| `src/app/api/schedules/route.ts` | Schedule CRUD + CSV upload |
| `src/app/api/reports/issues/route.ts` | Issue log CSV |
| `src/app/api/reports/actions/route.ts` | Action list CSV (with contractor lookup) |
| `src/app/api/reports/daily/route.ts` | Daily report text |

### Dashboard
| File | Purpose |
|------|---------|
| `src/app/dashboard/page.tsx` | Sessions list |
| `src/app/dashboard/[sessionId]/page.tsx` | Session detail + timeline |
| `src/app/dashboard/setup/page.tsx` | CSV upload for project data |

### Components
| File | Purpose |
|------|---------|
| `src/components/dashboard/event-timeline.tsx` | Timeline with transcript consolidation |
| `src/components/dashboard/event-transcript-bubble.tsx` | USER/AI chat bubbles |
| `src/components/dashboard/event-tool-call.tsx` | Tool call badges |
| `src/components/dashboard/event-flagged-issue.tsx` | Flag cards with photos |
| `src/components/dashboard/csv-upload.tsx` | Reusable drag-and-drop CSV upload |

### Library
| File | Purpose |
|------|---------|
| `src/lib/queries.ts` | Supabase query functions |
| `src/lib/supabase.ts` | Supabase client |
| `src/lib/sandbox.ts` | E2B sandbox lifecycle |

## E2B Files

| File | Purpose |
|------|---------|
| `e2b/template.ts` | E2B v2 template definition |
| `e2b/agent/run.mjs` | Agent runner script (one-shot) |
| `e2b/agent/server.mjs` | Unified agent orchestrator (iOS + web) |
| `e2b/build.prod.ts` | Production template build script |
