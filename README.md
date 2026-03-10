# OverSite Engineer Training System

A curriculum-driven AI training system that teaches engineers the OverSite codebase through structured lessons, visualizations, and checkpoints.

## What You'll Learn

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRAINING CURRICULUM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MODULE 1: The Big Picture                          [30 min]   │
│  ├── 1.1 What is OverSite?                                     │
│  ├── 1.2 The 4-Layer Architecture                              │
│  └── 1.3 User Journey Walkthrough                              │
│                                                                 │
│  MODULE 2: Perception Layer (Gemini)                [20 min]   │
│  ├── 2.1 Gemini Live API                                       │
│  ├── 2.2 Audio/Video Streaming                                 │
│  └── 2.3 Key iOS Files                                         │
│                                                                 │
│  MODULE 3: Action Layer (Tool Routing)              [25 min]   │
│  MODULE 4: Observation Layer (Dashboard)            [30 min]   │
│  MODULE 5: Agent Layer (E2B + Claude)               [30 min]   │
│  MODULE 6: Shipping Features                        [20 min]   │
│                                                                 │
│  Total: ~2.5 hours                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Clone
git clone https://github.com/Parallax-Innovation/oversite-onboarding.git
cd oversite-onboarding

# Install
npm install

# Set your API key
export ANTHROPIC_API_KEY=your_key

# Start training
npm run dev
```

## Features

### Structured Curriculum
6 modules with 18 lessons covering the entire OverSite architecture.

### ASCII Visualizations
Every concept includes diagrams:
```
┌─────────────────────────────────────────────────────────────────┐
│                     OVERSITE ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│  L1: PERCEPTION    │ Gemini Live - Voice + Vision AI            │
│  L2: ACTION        │ ToolCallRouter - Local vs Remote           │
│  L3: OBSERVATION   │ EventStore + Dashboard                     │
│  L4: AGENT         │ Claude + E2B Sandboxes                     │
└─────────────────────────────────────────────────────────────────┘
```

### Progress Tracking
Your progress is saved locally in `~/.oversite-training/progress.json`.

### Interactive Commands
- `start` - Begin training
- `next` - Continue to next lesson
- `back` - Go to previous lesson
- `progress` - See your progress bar
- `quiz` - Take the module quiz
- `visualize [topic]` - Show a diagram
- `files` - List relevant files
- `reset` - Start over

## Example Session

```
╔═══════════════════════════════════════════════════════════════╗
║                   ENGINEER TRAINING SYSTEM                    ║
╚═══════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════╗
║           TRAINING PROGRESS                 ║
╠════════════════════════════════════════════╣
║  Current: Module 1, Lesson 1               ║
║  Completed: 0/18 lessons (0%)              ║
║  [░░░░░░░░░░░░░░░░░░░░]                    ║
╚════════════════════════════════════════════╝

You: start

# Module 1.1: What is OverSite?

**Learning Objective:** Understand the problem OverSite solves.

Construction projects are chaotic:
- 80% run over schedule
- 14+ hours lost per worker per week to miscommunication

OverSite solves this with AI glasses...

[ASCII diagram of architecture]

**Checkpoint:** What problem does OverSite solve?

You: It helps site managers capture issues and coordinate contractors
    using AI glasses.

Correct! You understand the core value prop. Let's continue...

You: next

# Module 1.2: The 4-Layer Architecture
...
```

## Repository Structure

```
oversite-onboarding/
├── curriculum/
│   ├── 00-overview.md
│   ├── module-1/
│   │   ├── 1.1-what-is-oversite.md
│   │   ├── 1.2-four-layer-architecture.md
│   │   └── 1.3-user-journey.md
│   ├── module-2/
│   │   └── ...
│   └── visualizations.md
├── knowledge-base/
│   ├── ARCHITECTURE.md
│   ├── RULES.md
│   └── KEY-FILES.md
├── guides/
│   ├── 01-local-setup.md
│   ├── 02-deploying-web-changes.md
│   └── ...
└── src/
    └── index.ts
```

## After Training

After completing the curriculum, you should be able to:

1. **Explain** the 4-layer architecture to a teammate
2. **Navigate** the codebase and find relevant files
3. **Add** a new API route or dashboard feature
4. **Deploy** changes to production
5. **Modify** the E2B agent
6. **Follow** Git and code conventions

## Contributing

To add or update curriculum content:

1. Edit files in `curriculum/` or `knowledge-base/`
2. The chatbot automatically loads all `.md` files
3. Push changes to GitHub

## License

MIT
