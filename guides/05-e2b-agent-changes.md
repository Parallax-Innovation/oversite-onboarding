# Making Changes to the E2B Agent

## Understanding the Agent Layer

The agent runs inside E2B sandboxes (Firecracker microVMs). Each session gets isolated execution.

**Key files:**
- `e2b/agent/server.mjs` -- Unified agent orchestrator (handles both iOS and web)
- `e2b/agent/run.mjs` -- One-shot agent runner (legacy fallback)
- `e2b/template.ts` -- E2B template definition
- `e2b/build.prod.ts` -- Production build script

## Making Changes

1. Edit the agent code in `e2b/agent/server.mjs`

2. **CRITICAL:** Rebuild the E2B template:

```bash
E2B_ACCESS_TOKEN=<token> E2B_API_KEY=<key> npx tsx e2b/build.prod.ts
```

3. The rebuild uploads a new template to E2B. Changes take effect for new sandboxes.

## Template Details

- **Template ID:** `14c2zvxv6w8jm6wq6xbv`
- **Alias:** `oversite-agent`
- **Base:** Ubuntu 24.04 + Node.js 22
- **Timeout:** 30 minutes
- **Concurrent limit:** 20 sandboxes (free tier)

## Testing Agent Changes Locally

You can test the agent script locally before deploying:

```bash
cd e2b/agent
ANTHROPIC_API_KEY=<key> AGENT_PROMPT="What is 2+2?" node run.mjs
```

## Adding Custom MCP Tools

To add OverSite-specific tools, modify `server.mjs`:

```javascript
import { createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";

const options = {
  mcpServers: {
    "oversite-tools": {
      type: "sdk",
      instance: createSdkMcpServer({
        tools: [
          {
            name: "lookup_contractor",
            description: "Look up contractor by trade",
            parameters: {
              type: "object",
              properties: {
                trade: { type: "string" }
              },
              required: ["trade"]
            },
            handler: async ({ trade }) => {
              // Implementation
              return { name: "ACME HVAC", phone: "555-1234" };
            }
          }
        ]
      })
    }
  }
};
```

## Debugging Sandboxes

```bash
# List active sandboxes
e2b sandbox list

# Kill all sandboxes (useful when testing)
e2b sandbox kill

# View sandbox logs (requires sandbox ID)
e2b sandbox logs <sandbox-id>
```

## Common Issues

**Sandbox OOM:** The sandbox has 1GB RAM. If the agent uses too much memory:
- Check for memory leaks in your code
- Consider splitting large operations

**Sandbox timeout:** Default timeout is 30 minutes. For long-running operations:
- Use async patterns
- Consider chunking the work

**Changes not taking effect:** Did you rebuild the template? Changes to `server.mjs` require a template rebuild.
