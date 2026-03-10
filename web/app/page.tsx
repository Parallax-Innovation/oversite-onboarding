"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Progress {
  currentModule: number;
  currentLesson: number;
  completed: string[];
  userName: string;
}

const CURRICULUM = [
  {
    module: 1,
    title: "The Big Picture",
    lessons: ["What is OverSite?", "4-Layer Architecture", "User Journey"],
  },
  {
    module: 2,
    title: "Perception Layer",
    lessons: ["Gemini Live API", "Audio/Video Streaming", "Key iOS Files"],
  },
  {
    module: 3,
    title: "Action Layer",
    lessons: ["Tool Call Flow", "Local-First Pattern", "Async Fan-Out"],
  },
  {
    module: 4,
    title: "Observation Layer",
    lessons: ["Event System", "Supabase Integration", "Dashboard Components"],
  },
  {
    module: 5,
    title: "Agent Layer",
    lessons: ["E2B Sandboxes", "Claude Agent SDK", "Session Isolation"],
  },
  {
    module: 6,
    title: "Shipping Features",
    lessons: ["Dev Workflow", "Git Conventions", "Deployment"],
  },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [showNameModal, setShowNameModal] = useState(true);
  const [progress, setProgress] = useState<Progress>({
    currentModule: 1,
    currentLesson: 1,
    completed: [],
    userName: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("oversite-training");
    if (saved) {
      const data = JSON.parse(saved);
      setProgress(data);
      setUserName(data.userName || "");
      if (data.userName) {
        setShowNameModal(false);
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveProgress = (p: Progress) => {
    localStorage.setItem("oversite-training", JSON.stringify(p));
    setProgress(p);
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    const newProgress = { ...progress, userName: userName.trim() };
    saveProgress(newProgress);
    setShowNameModal(false);

    // Start the conversation
    await sendMessage(
      `Hi, I'm ${userName.trim()}. I'm ready to learn the OverSite codebase.`,
      newProgress
    );
  };

  const sendMessage = async (text: string, currentProgress?: Progress) => {
    const p = currentProgress || progress;
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          progress: p,
        }),
      });

      const data = await res.json();

      if (data.content) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.content },
        ]);
      }

      // Update progress if lesson advanced
      if (text.toLowerCase() === "next") {
        const newProgress = { ...p };
        const lessonKey = `${p.currentModule}.${p.currentLesson}`;
        if (!newProgress.completed.includes(lessonKey)) {
          newProgress.completed.push(lessonKey);
        }
        newProgress.currentLesson++;
        if (newProgress.currentLesson > 3) {
          newProgress.currentModule++;
          newProgress.currentLesson = 1;
        }
        saveProgress(newProgress);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    await sendMessage(input.trim());
  };

  const completedCount = progress.completed.length;
  const totalLessons = 18;
  const progressPct = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-72 bg-[#1a1918] border-r border-[#333] flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-[#333]">
          <h1 className="text-xl font-bold text-[#FF3E1A]">OverSite</h1>
          <p className="text-sm text-[#888]">Engineer Training</p>
        </div>

        {/* Progress */}
        <div className="p-4 border-b border-[#333]">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#888]">Progress</span>
            <span className="text-[#FF3E1A]">{progressPct}%</span>
          </div>
          <div className="h-2 bg-[#333] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF3E1A] progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-[#666] mt-2">
            {completedCount}/{totalLessons} lessons
          </p>
        </div>

        {/* Curriculum */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xs font-semibold text-[#666] uppercase tracking-wider mb-3">
            Curriculum
          </h2>
          {CURRICULUM.map((mod) => (
            <div key={mod.module} className="mb-4">
              <div
                className={`text-sm font-medium mb-2 ${
                  progress.currentModule === mod.module
                    ? "text-[#FF3E1A]"
                    : "text-[#888]"
                }`}
              >
                {mod.module}. {mod.title}
              </div>
              <div className="ml-3 space-y-1">
                {mod.lessons.map((lesson, i) => {
                  const lessonNum = i + 1;
                  const lessonKey = `${mod.module}.${lessonNum}`;
                  const isCompleted = progress.completed.includes(lessonKey);
                  const isCurrent =
                    progress.currentModule === mod.module &&
                    progress.currentLesson === lessonNum;

                  return (
                    <div
                      key={lessonKey}
                      className={`text-xs flex items-center gap-2 ${
                        isCurrent
                          ? "text-[#fcfcfc]"
                          : isCompleted
                          ? "text-[#666]"
                          : "text-[#555]"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          isCompleted
                            ? "bg-[#FF3E1A] text-white"
                            : isCurrent
                            ? "border border-[#FF3E1A] text-[#FF3E1A]"
                            : "border border-[#444]"
                        }`}
                      >
                        {isCompleted ? "✓" : lessonNum}
                      </span>
                      <span className={isCompleted ? "line-through" : ""}>
                        {lesson}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User */}
        {userName && (
          <div className="p-4 border-t border-[#333]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF3E1A] flex items-center justify-center text-sm font-medium">
                {userName[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-[#666]">Student</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !showNameModal && (
            <div className="text-center text-[#666] mt-20">
              <p className="text-lg mb-2">Welcome, {userName}!</p>
              <p>Type &quot;start&quot; to begin your training.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`message-enter flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3xl rounded-lg p-4 ${
                  msg.role === "user"
                    ? "bg-[#FF3E1A] text-white"
                    : "bg-[#1a1918] border border-[#333]"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#1a1918] border border-[#333] rounded-lg p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#FF3E1A] rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-[#FF3E1A] rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-[#FF3E1A] rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#333] p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-[#1a1918] border border-[#333] rounded-lg px-4 py-3 text-[#fcfcfc] placeholder-[#666] focus:outline-none focus:border-[#FF3E1A]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-[#FF3E1A] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#e63612] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
          <div className="flex gap-2 mt-3">
            {["start", "next", "progress", "checkpoint"].map((cmd) => (
              <button
                key={cmd}
                onClick={() => sendMessage(cmd)}
                className="text-xs px-3 py-1 bg-[#1a1918] border border-[#333] rounded hover:border-[#FF3E1A] transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1a1918] border border-[#333] rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-[#FF3E1A] mb-2">
              Welcome to OverSite Training
            </h2>
            <p className="text-[#888] mb-6">
              Learn the codebase through interactive lessons, visualizations,
              and hands-on exercises.
            </p>
            <form onSubmit={handleNameSubmit}>
              <label className="block text-sm text-[#888] mb-2">
                What&apos;s your name?
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-[#0e0d0c] border border-[#333] rounded-lg px-4 py-3 text-[#fcfcfc] placeholder-[#666] focus:outline-none focus:border-[#FF3E1A] mb-4"
                autoFocus
              />
              <button
                type="submit"
                className="w-full bg-[#FF3E1A] text-white py-3 rounded-lg font-medium hover:bg-[#e63612] transition-colors"
              >
                Start Training
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
