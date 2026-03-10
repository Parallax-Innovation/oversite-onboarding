#!/usr/bin/env node

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const anthropic = new Anthropic();

// Load all knowledge base files
function loadKnowledgeBase(): string {
  const kbDir = path.join(__dirname, "..", "knowledge-base");
  const guidesDir = path.join(__dirname, "..", "guides");

  let content = "# OVERSITE KNOWLEDGE BASE\n\n";

  // Load knowledge base
  if (fs.existsSync(kbDir)) {
    const kbFiles = fs.readdirSync(kbDir).filter((f) => f.endsWith(".md"));
    for (const file of kbFiles) {
      const filePath = path.join(kbDir, file);
      content += `\n---\n## ${file}\n\n`;
      content += fs.readFileSync(filePath, "utf-8");
    }
  }

  // Load guides
  if (fs.existsSync(guidesDir)) {
    const guideFiles = fs.readdirSync(guidesDir).filter((f) => f.endsWith(".md"));
    content += "\n\n# GUIDES\n";
    for (const file of guideFiles) {
      const filePath = path.join(guidesDir, file);
      content += `\n---\n## ${file}\n\n`;
      content += fs.readFileSync(filePath, "utf-8");
    }
  }

  return content;
}

const SYSTEM_PROMPT = `You are the OverSite Onboarding Assistant. Your job is to train new engineers on the OverSite codebase so they can ship features independently.

${loadKnowledgeBase()}

# YOUR ROLE

You are a patient, knowledgeable mentor who helps engineers understand:
1. The overall architecture (4 layers: Perception, Action, Observation, Agent)
2. How the iOS app, web app, and agent layer work together
3. Key files and where to make changes
4. Development rules and conventions
5. Common workflows (deploying, adding features, etc.)

# TRAINING APPROACH

- Start by understanding what the engineer already knows
- Explain concepts from high-level to detailed
- Use diagrams and code examples when helpful
- Quiz the engineer to ensure understanding
- Provide hands-on exercises when appropriate
- Reference specific files and line numbers

# INTERACTION STYLE

- Be conversational but efficient
- Break complex topics into digestible pieces
- Validate understanding before moving on
- Encourage questions
- When explaining code, always reference the actual file paths

# COMMON TRAINING PATHS

1. **Quick Overview** (15 min): High-level architecture, key concepts
2. **Web Development** (30 min): Dashboard, API routes, deployment
3. **Agent Layer** (30 min): E2B, Claude Agent SDK, MCP tools
4. **Full Deep Dive** (60+ min): Complete architecture walkthrough

Ask the engineer which path they want, or adapt based on their questions.

Remember: The goal is for the engineer to be able to ship features independently after this training.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

const conversationHistory: Message[] = [];

async function chat(userMessage: string): Promise<string> {
  conversationHistory.push({
    role: "user",
    content: userMessage,
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

  return assistantMessage;
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n===========================================");
  console.log("  OVERSITE ONBOARDING ASSISTANT");
  console.log("===========================================\n");
  console.log("Welcome! I'm here to help you learn the OverSite codebase.");
  console.log("Type 'quit' or 'exit' to end the session.\n");

  // Initial greeting
  const greeting = await chat(
    "Hi! I'm a new engineer joining the team. I need to learn the OverSite codebase so I can start shipping features."
  );
  console.log(`Assistant: ${greeting}\n`);

  const prompt = () => {
    rl.question("You: ", async (input) => {
      const trimmed = input.trim();

      if (trimmed.toLowerCase() === "quit" || trimmed.toLowerCase() === "exit") {
        console.log("\nGoodbye! Happy coding!\n");
        rl.close();
        return;
      }

      if (!trimmed) {
        prompt();
        return;
      }

      try {
        const response = await chat(trimmed);
        console.log(`\nAssistant: ${response}\n`);
      } catch (error) {
        console.error("Error:", error);
      }

      prompt();
    });
  };

  prompt();
}

main().catch(console.error);
