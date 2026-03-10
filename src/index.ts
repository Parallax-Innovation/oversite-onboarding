#!/usr/bin/env node

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import * as os from "os";

const anthropic = new Anthropic();

// Progress tracking
interface Progress {
  currentModule: number;
  currentLesson: number;
  completed: string[];
  quizScores: Record<string, number>;
  startedAt: string;
}

const PROGRESS_DIR = path.join(os.homedir(), ".oversite-training");
const PROGRESS_FILE = path.join(PROGRESS_DIR, "progress.json");

function loadProgress(): Progress {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
    }
  } catch (e) {
    // Ignore
  }
  return {
    currentModule: 1,
    currentLesson: 1,
    completed: [],
    quizScores: {},
    startedAt: new Date().toISOString(),
  };
}

function saveProgress(progress: Progress) {
  if (!fs.existsSync(PROGRESS_DIR)) {
    fs.mkdirSync(PROGRESS_DIR, { recursive: true });
  }
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Load curriculum
function loadCurriculum(): string {
  const curriculumDir = path.join(__dirname, "..", "curriculum");
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
  const kbDir = path.join(__dirname, "..", "knowledge-base");
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

const SYSTEM_PROMPT = `You are the OverSite Training System. Your job is to guide engineers through a structured curriculum to learn the OverSite codebase.

# CURRICULUM
${loadCurriculum()}

# KNOWLEDGE BASE
${loadKnowledgeBase()}

# YOUR ROLE

You are a patient, structured instructor who:
1. Follows the curriculum in order (Module 1 → Module 2 → etc.)
2. Uses the visualizations provided (ASCII diagrams)
3. Checks understanding with checkpoint questions
4. Adapts pace based on the learner's responses
5. Answers questions but gently guides back to the curriculum

# CURRENT SESSION

The learner's progress is tracked. When they say:
- "next" → Move to the next lesson
- "back" → Go to previous lesson
- "progress" → Show current progress
- "quiz" → Give the module quiz
- "visualize X" → Show the relevant ASCII diagram
- "files" → List key files for current topic
- Any question → Answer it, then guide back to curriculum

# TEACHING STYLE

1. **Start each lesson** by stating the learning objective
2. **Use visualizations** - Always show ASCII diagrams when explaining architecture
3. **Check understanding** - Ask checkpoint questions before moving on
4. **Be encouraging** - Celebrate progress, normalize confusion
5. **Stay structured** - Don't skip ahead unless asked

# VISUALIZATION RULES

When explaining architecture, ALWAYS include ASCII diagrams. Use the ones from the curriculum or create similar ones. Visual learners need these.

Example response when starting Module 1:
"""
# Module 1.1: What is OverSite?

**Learning Objective:** Understand the problem OverSite solves and its high-level architecture.

[Include the ASCII diagram from the curriculum]

[Explain the concept]

**Checkpoint:** Before we continue, can you tell me...
"""

Remember: Your goal is for this engineer to be able to ship features independently after completing the curriculum.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

const conversationHistory: Message[] = [];
let progress = loadProgress();

async function chat(userMessage: string): Promise<string> {
  // Handle special commands
  const lower = userMessage.toLowerCase().trim();

  if (lower === "progress") {
    return formatProgress();
  }

  if (lower === "reset") {
    progress = {
      currentModule: 1,
      currentLesson: 1,
      completed: [],
      quizScores: {},
      startedAt: new Date().toISOString(),
    };
    saveProgress(progress);
    return "Progress reset. Starting from Module 1.1.";
  }

  // Add context about current position
  const contextMessage = `[SYSTEM: Learner is on Module ${progress.currentModule}, Lesson ${progress.currentLesson}. Completed: ${progress.completed.length} lessons. Command: "${userMessage}"]

${userMessage}`;

  conversationHistory.push({
    role: "user",
    content: contextMessage,
  });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8096,
    system: SYSTEM_PROMPT,
    messages: conversationHistory,
  });

  const assistantMessage =
    response.content[0].type === "text" ? response.content[0].text : "";

  conversationHistory.push({
    role: "assistant",
    content: assistantMessage,
  });

  // Update progress based on "next" command
  if (lower === "next") {
    const lessonKey = `${progress.currentModule}.${progress.currentLesson}`;
    if (!progress.completed.includes(lessonKey)) {
      progress.completed.push(lessonKey);
    }
    progress.currentLesson++;
    // Simple module progression (3 lessons per module)
    if (progress.currentLesson > 3) {
      progress.currentModule++;
      progress.currentLesson = 1;
    }
    saveProgress(progress);
  }

  if (lower === "back" && (progress.currentLesson > 1 || progress.currentModule > 1)) {
    progress.currentLesson--;
    if (progress.currentLesson < 1) {
      progress.currentModule--;
      progress.currentLesson = 3;
    }
    saveProgress(progress);
  }

  return assistantMessage;
}

function formatProgress(): string {
  const totalLessons = 18; // 6 modules × 3 lessons
  const pct = Math.round((progress.completed.length / totalLessons) * 100);

  return `
╔════════════════════════════════════════════╗
║           TRAINING PROGRESS                 ║
╠════════════════════════════════════════════╣
║                                            ║
║  Current: Module ${progress.currentModule}, Lesson ${progress.currentLesson}             ║
║  Completed: ${progress.completed.length}/${totalLessons} lessons (${pct}%)            ║
║                                            ║
║  [${"█".repeat(Math.floor(pct / 5))}${"░".repeat(20 - Math.floor(pct / 5))}]  ║
║                                            ║
║  Started: ${progress.startedAt.split("T")[0]}                    ║
║                                            ║
╚════════════════════════════════════════════╝

Commands:
  next     - Continue to next lesson
  back     - Go to previous lesson
  quiz     - Take module quiz
  reset    - Start over
  visualize [topic] - Show diagram
`;
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     ██████╗ ██╗   ██╗███████╗██████╗ ███████╗██╗████████╗    ║
║    ██╔═══██╗██║   ██║██╔════╝██╔══██╗██╔════╝██║╚══██╔══╝    ║
║    ██║   ██║██║   ██║█████╗  ██████╔╝███████╗██║   ██║       ║
║    ██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██║   ██║       ║
║    ╚██████╔╝ ╚████╔╝ ███████╗██║  ██║███████║██║   ██║       ║
║     ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝   ╚═╝       ║
║                                                               ║
║                   ENGINEER TRAINING SYSTEM                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

  console.log(formatProgress());
  console.log("\nType 'start' to begin or ask any question.\n");

  const prompt = () => {
    rl.question("You: ", async (input) => {
      const trimmed = input.trim();

      if (
        trimmed.toLowerCase() === "quit" ||
        trimmed.toLowerCase() === "exit"
      ) {
        console.log("\nProgress saved. See you next time!\n");
        rl.close();
        return;
      }

      if (!trimmed) {
        prompt();
        return;
      }

      try {
        console.log("\n");
        const response = await chat(trimmed);
        console.log(`${response}\n`);
      } catch (error) {
        console.error("Error:", error);
      }

      prompt();
    });
  };

  prompt();
}

main().catch(console.error);
