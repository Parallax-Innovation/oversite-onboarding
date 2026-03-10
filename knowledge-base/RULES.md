# OverSite Development Rules

## Git Rules

- **NEVER** use `git add .` or `git add -A` -- only add files you explicitly changed
- Commit and push after every change
- Don't mention Claude Code in commit messages

## iOS / Swift Rules

- **Sean builds on Xcode manually** -- NEVER run xcode build commands
- New Swift files must be added to the Xcode project manually by Sean
- `tsconfig.json` excludes `ios/` and `claude-talk-to-figma-mcp/` directories

## Code Separation (VisionClaw vs OverSite)

The `ios/` directory is a **git subtree** from VisionClaw (open-source smart glasses platform).

### VisionClaw (upstream) -- Generic platform only:
- `Gemini/` -- Gemini Live integration
- `Agent/` -- AgentBridge, ToolCallRouter
- `WebRTC/` -- WebRTC connections
- `Settings/` -- App settings

### OverSite (private) -- Business code layered on top:
- `Core/` -- VerticalConfiguration, SessionManager, WalkthroughSession
- `Verticals/` -- ConstructionConfig, GeneralConfig
- `EventStore/` -- EventClient, EventTypes, EventStoreConfig

**NEVER push business code to VisionClaw upstream!**

Sync from upstream:
```bash
git subtree pull --prefix=ios upstream-ios main --squash
```

## E2B Agent Rules

After changing `server.mjs`, you must rebuild the E2B template for changes to take effect:

```bash
E2B_ACCESS_TOKEN=... E2B_API_KEY=... npx tsx e2b/build.prod.ts
```

- Template ID: `14c2zvxv6w8jm6wq6xbv` (alias: `oversite-agent`)
- Free tier: 20 concurrent sandboxes, 30-min timeout
- Kill all sandboxes: `e2b sandbox kill`

## Style Rules

- No emoji in code, logs, or UI
- No colored gradients in UI elements
- Don't run `npm run build:mac` automatically

## Team

- **Sean** (CEO/CTO) -- builds the product, operates Xcode manually
- **Ahsan** (CPO) -- product/UX
- **Spencer** (CBO) -- sales/content
