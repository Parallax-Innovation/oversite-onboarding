import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const anthropic = new Anthropic();

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

// Load curriculum from files
function loadCurriculum(): string {
  const curriculumDir = path.join(process.cwd(), "..", "curriculum");
  let content = "";

  const walkDir = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files.sort()) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith(".md")) {
        content += `\n\n---\n# FILE: ${file}\n\n`;
        content += fs.readFileSync(filePath, "utf-8");
      }
    }
  };

  walkDir(curriculumDir);
  return content;
}

// Load knowledge base
function loadKnowledgeBase(): string {
  const kbDir = path.join(process.cwd(), "..", "knowledge-base");
  let content = "";

  if (fs.existsSync(kbDir)) {
    const files = fs.readdirSync(kbDir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      content += `\n\n---\n# ${file}\n\n`;
      content += fs.readFileSync(path.join(kbDir, file), "utf-8");
    }
  }

  return content;
}

function buildSystemPrompt(userName: string, progress: Progress): string {
  return `You are the OverSite Training System. You're training ${userName || "an engineer"} on the OverSite codebase.

# CURRICULUM
${loadCurriculum()}

# KNOWLEDGE BASE
${loadKnowledgeBase()}

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
Good: "Before I tell you the architecture, what layers would YOU design if you were building an AI copilot for glasses? Think about what needs to happen..."

**Use Socratic questioning:**
- "Why do you think they chose that approach?"
- "What would break if we removed this layer?"
- "How would you solve this differently?"
- "What's the tradeoff here?"

**Probe for deep understanding:**
- Don't accept surface-level answers
- Ask follow-up questions
- Challenge assumptions
- Explore edge cases together

# CREATIVE THINKING PROMPTS

At the end of each concept, ask ONE of these:
1. "If you were redesigning this, what would you change?"
2. "What's the biggest weakness of this approach?"
3. "How would this break at 10x scale?"
4. "What would this look like in [different industry]?"
5. "If you had to explain this to a 5-year-old, what would you say?"

# VISUALIZATION RULES

ALWAYS use ASCII diagrams. Never explain architecture without a visual.

Example:
\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    PERCEPTION LAYER                         │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │   Camera    │───▶│  Gemini Live │───▶│  Tool Router  │  │
│  │   + Mic     │    │     API      │    │               │  │
│  └─────────────┘    └──────────────┘    └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
\`\`\`

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

Remember: Your goal is for ${userName || "this engineer"} to DEEPLY UNDERSTAND the system, not just memorize facts. They should be able to ship features AND explain WHY the system is designed this way.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, progress } = body as {
      messages: Message[];
      progress: Progress;
    };

    const systemPrompt = buildSystemPrompt(progress.userName, progress);

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8096,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
