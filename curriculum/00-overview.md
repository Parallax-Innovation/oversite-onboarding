# OverSite Training Curriculum

## Learning Path

```
┌─────────────────────────────────────────────────────────────────┐
│                    OVERSITE ENGINEER TRAINING                   │
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
│  ├── 3.1 Tool Call Flow                                        │
│  ├── 3.2 Local-First Pattern                                   │
│  └── 3.3 Async Fan-Out                                         │
│                                                                 │
│  MODULE 4: Observation Layer (Dashboard)            [30 min]   │
│  ├── 4.1 Event System                                          │
│  ├── 4.2 Supabase Integration                                  │
│  ├── 4.3 Dashboard Components                                  │
│  └── 4.4 Hands-On: Add a Dashboard Feature                     │
│                                                                 │
│  MODULE 5: Agent Layer (E2B + Claude)               [30 min]   │
│  ├── 5.1 E2B Sandboxes                                         │
│  ├── 5.2 Claude Agent SDK                                      │
│  ├── 5.3 Session Isolation                                     │
│  └── 5.4 Hands-On: Modify the Agent                            │
│                                                                 │
│  MODULE 6: Shipping Features                        [20 min]   │
│  ├── 6.1 Development Workflow                                  │
│  ├── 6.2 Git Conventions                                       │
│  ├── 6.3 Deployment Process                                    │
│  └── 6.4 Final Project: Ship a Feature                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Total Time: ~2.5 hours (can be done in multiple sessions)
```

## How This Training Works

1. **Each module builds on the previous** - Complete them in order
2. **Visualizations included** - ASCII diagrams, flow charts, architecture maps
3. **Checkpoints** - Quiz questions verify your understanding
4. **Hands-on exercises** - Real tasks in the codebase
5. **Ask questions anytime** - The AI adapts to your pace

## Progress Tracking

Your progress is saved in `~/.oversite-training/progress.json`

```json
{
  "currentModule": 1,
  "currentLesson": 1,
  "completed": [],
  "quizScores": {}
}
```

## Commands

During training, you can say:
- `next` - Move to next lesson
- `back` - Go to previous lesson
- `quiz` - Take the module quiz
- `progress` - See your progress
- `visualize <concept>` - Show a diagram
- `files` - Show relevant files for current topic
- `exercise` - Start hands-on exercise

## Ready?

Start with Module 1: "What is OverSite?"
