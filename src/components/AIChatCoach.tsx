import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, Topic } from "../types";
import { MessageSquare, Send, Sparkles, Loader2, HelpCircle, Terminal } from "lucide-react";
import Markdown from "react-markdown";

interface AIChatCoachProps {
  activeTopic: Topic;
  sandboxCode: string;
  sandboxOutput: string;
  onSendMessage?: (msg: string) => void;
}

export const AIChatCoach: React.FC<AIChatCoachProps> = ({
  activeTopic,
  sandboxCode,
  sandboxOutput,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! I am **Professor Sigma**, your descriptive statistics tutor. 📚\n\nI can help you understand statistical concepts, double-check your R code, or provide helpful pointers about our current curriculum on **${activeTopic.title}**.\n\nTry clicking one of the quick-questions below, or ask me anything!`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const rawText = textToSend || input;
    if (!rawText.trim() || isLoading) return;

    if (!textToSend) setInput("");

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: rawText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          currentTopic: `${activeTopic.title}: ${activeTopic.subtitle}`,
          sandboxCode,
          sandboxOutput,
        }),
      });

      if (!res.ok) {
        throw new Error("Tutor API failed");
      }

      const data = await res.json();

      const coachMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.text || "I apologize, I could not generate a response. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: `⚠️ Failed to reach Prof. Sigma. Ensure your GEMINI_API_KEY is configured in the Secrets panel.\n\n*(Failure detail: ${e.message})*`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    {
      label: "Explain standard deviation Simply",
      prompt: "Can you explain the baseline concept of Standard Deviation using an easy, intuitive analogy?",
    },
    {
      label: "Give me a Hint for the Challenge",
      prompt: `Can you give me a friendly statistical hint on how to complete the coding challenge for: "${activeTopic.title}"?`,
    },
    {
      label: "Explain my terminal code",
      prompt: sandboxCode.trim() 
        ? `Can you analyze my current terminal code? Here it is:\n\n${sandboxCode}\n\nAnd here is the output:\n\n${sandboxOutput}`
        : "Explain how vector assignments and computing functions work in R.",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full absolute -top-0.5 -right-0.5 animate-pulse" />
            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-805 flex items-center gap-1.5">
              <span>Prof. Sigma</span>
              <span className="text-[9px] bg-indigo-100 px-1.5 py-0.5 rounded-full text-indigo-700 font-mono tracking-wider">AI STATS COACH</span>
            </h3>
            <p className="text-[10px] text-slate-500">Context: {activeTopic.title}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm bg-white">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            <div className="text-[10px] text-slate-400 mb-1 font-mono uppercase tracking-wider">
              {m.role === "user" ? "You" : "Professor Sigma"} • {m.timestamp}
            </div>
            <div
              className={`max-w-[90%] rounded-xl px-3.5 py-2.5 leading-relaxed text-xs ${
                m.role === "user"
                  ? "bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-100"
                  : "bg-slate-50 border border-slate-200 text-slate-805"
              }`}
            >
              {/* Markdown wrapper */}
              <div className={`prose prose-xs max-w-none space-y-1.5 ${m.role === "user" ? "text-white" : "text-slate-800"}`}>
                <Markdown>{m.content}</Markdown>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="text-[10px] text-slate-400 mb-1 font-mono uppercase tracking-wider">
              Professor Sigma is writing...
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              <span>Analyzing formula matrices & R outputs...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Presets Grid */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 grid grid-cols-1 gap-1.5 shrink-0">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => handleSend(q.prompt)}
            className="text-left bg-white hover:bg-slate-100 border border-slate-200 hover:border-indigo-300 text-[10px] rounded p-1.5 text-indigo-600 font-medium transition-all flex items-center gap-1.5 truncate cursor-pointer disabled:opacity-50 w-full shadow-xs"
          >
            {idx === 1 ? <HelpCircle className="h-3 w-3 text-indigo-500 shrink-0" /> : idx === 2 ? <Terminal className="h-3 w-3 text-emerald-600 shrink-0" /> : <MessageSquare className="h-3 w-3 text-indigo-500 shrink-0" />}
            <span className="truncate">{q.label}</span>
          </button>
        ))}
      </div>

      {/* Input controls */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          disabled={isLoading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask Prof. Sigma about statistics or R code..."
          className="flex-1 bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-all focus:ring-1 focus:ring-indigo-600/20"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className={`flex items-center justify-center p-2 rounded-lg transition-all ${
            input.trim() && !isLoading
              ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm shadow-indigo-100"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
