# Local Development Setup

## Prerequisites

- Node.js 20+
- pnpm
- Git
- Access to Parallax-Innovation GitHub org

## Clone the Repository

```bash
git clone https://github.com/Parallax-Innovation/oversite.git
cd oversite
```

## Install Dependencies

```bash
pnpm install
```

## Environment Variables

Create `.env.local` with the following (ask team for values):

```bash
# Supabase
SUPABASE_URL=https://emdbafuwkxzlxtppjizz.supabase.co
SUPABASE_SERVICE_KEY=<ask Sean>

# E2B (for agent layer)
E2B_API_KEY=<ask Sean>
E2B_TEMPLATE_ID=14c2zvxv6w8jm6wq6xbv

# Anthropic (for agent)
ANTHROPIC_API_KEY=<ask Sean>
```

## Run Development Server

```bash
pnpm dev
```

Visit:
- Landing page: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard

## iOS Development

iOS is handled by Sean. Do NOT run Xcode build commands.

If you need to test iOS changes:
1. Make code changes
2. Commit and push
3. Ask Sean to pull and test on device

## Useful Commands

```bash
# Lint
pnpm lint

# Type check
npx tsc --noEmit

# Build (requires env vars)
pnpm build
```
