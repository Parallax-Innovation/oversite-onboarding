# OverSite Onboarding

AI-powered onboarding chatbot that trains new engineers on the OverSite codebase.

## What This Does

This tool provides an interactive training session that teaches engineers:

- **Architecture**: 4-layer system (Perception, Action, Observation, Agent)
- **Key Files**: Where to find and modify code
- **Workflows**: How to deploy, add features, work with the agent layer
- **Rules**: Git conventions, iOS/Swift rules, code separation

After a training session, you should be able to ship features independently.

## Quick Start

```bash
# Clone
git clone https://github.com/Parallax-Innovation/oversite-onboarding.git
cd oversite-onboarding

# Install
npm install

# Set API key
export ANTHROPIC_API_KEY=your_key

# Run
npm run dev
```

## Training Paths

The chatbot adapts to your needs, but common paths include:

| Path | Duration | Covers |
|------|----------|--------|
| Quick Overview | 15 min | High-level architecture, key concepts |
| Web Development | 30 min | Dashboard, API routes, deployment |
| Agent Layer | 30 min | E2B, Claude Agent SDK, MCP tools |
| Full Deep Dive | 60+ min | Complete architecture walkthrough |

## Knowledge Base

The chatbot is trained on:

- `knowledge-base/ARCHITECTURE.md` - Full system architecture
- `knowledge-base/RULES.md` - Development rules and conventions
- `knowledge-base/KEY-FILES.md` - Important files reference
- `guides/*.md` - Step-by-step guides for common tasks

## Example Session

```
===========================================
  OVERSITE ONBOARDING ASSISTANT
===========================================

Welcome! I'm here to help you learn the OverSite codebase.