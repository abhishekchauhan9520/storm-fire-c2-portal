import React, { useEffect, useRef, useState } from "react";
import type { AdviceMessage } from "../types";
import { Brain, Send, Loader, Radio } from "lucide-react";

interface IndraAdvisorProps {
  /** Legacy props remain accepted during consumer migration; they are no longer sent to the AI boundary. */
  tracks?: unknown[];
  nodes?: unknown[];
  logs?: unknown[];
  himalayanOps?: boolean;
  systems?: unknown[];
  participantId?: string;
}

const PRESET_QUERIES = [
  { label: "Summarize authorized operational information", query: "Summarize the information currently available in my authorized operational environment and identify important freshness or provenance considerations." },
  { label: "Review unresolved alerts", query: "Review unresolved alerts in my authorized projection and explain what information context should be checked before operator acknowledgement." },
  { label: "Explain information relationships", query: "Explain how the current information environment is connected through authorized relationships, services, geography, and policy." },
];

export default function IndraAdvisor({ participantId = "operator-command" }: IndraAdvisorProps) {
  const [messages, setMessages] = useState<AdviceMessage[]>([
    {
      id: "init",
      role: "model",
      text: "STRIX decision-support boundary online. I receive only the authenticated participant's authorized Dynamic COP context. I do not receive arbitrary frontend operational state and I do not issue operational commands.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (customQueryText?: string) => {
    const query = customQueryText || inputVal.trim();
    if (!query) return;
    if (!customQueryText) setInputVal("");

    const userMsg: AdviceMessage = {
      id: Math.random().toString(),
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString(),
      isQuickPrompt: Boolean(customQueryText),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          userQuery: query,
          messageHistory: messages.slice(-6),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Decision-support context unavailable.");

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "model",
          text: data.response,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "system",
          text: `Decision-support request rejected: ${error instanceof Error ? error.message : "unknown error"}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col h-[525px] shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-violet-400" />
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">STRIX DECISION SUPPORT</h2>
            <div className="text-[8px] text-slate-500 font-mono">PARTICIPANT-CONTEXT-GATED COGNITIVE SERVICE</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[8px] font-mono bg-violet-950/40 border border-violet-900 text-violet-400 px-2 py-0.5 rounded">
          <Radio className="h-3 w-3" />
          <span>AUTHORIZED CONTEXT ONLY</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 py-3 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((message) => {
          const isUser = message.role === "user";
          const isSystem = message.role === "system";
          return (
            <div key={message.id} className={`flex flex-col max-w-[90%] ${isUser ? "self-end items-end" : "self-start items-start"}`}>
              <div className="text-[7px] text-slate-500 font-mono mb-0.5 px-1 uppercase">
                {message.role === "model" ? "STRIX" : isUser ? "OPERATOR" : "PLATFORM"} • {message.timestamp}
              </div>
              <div className={`p-3 rounded-lg border font-mono text-[10px] shadow-sm ${isUser ? "bg-cyan-950/40 border-cyan-800 text-cyan-300 rounded-br-none" : isSystem ? "bg-red-950/20 border-red-900 text-red-400" : "bg-slate-950 border-slate-800 text-slate-300 rounded-bl-none"}`}>
                <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="self-start flex flex-col items-start max-w-[80%]">
            <div className="text-[7px] text-slate-500 font-mono mb-0.5 px-1 uppercase">STRIX PROCESSING...</div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 flex items-center gap-2 font-mono text-[10px] shadow">
              <Loader className="h-4 w-4 animate-spin text-violet-400" />
              <span>Resolving authorized participant context and information projection...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="mt-2 flex flex-col gap-1 border-t border-slate-800/60 pt-2 shrink-0">
        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block mb-1">AUTHORIZED CONTEXT QUERIES</span>
        <div className="grid grid-cols-1 gap-1.5">
          {PRESET_QUERIES.map((preset) => (
            <button key={preset.label} disabled={isLoading} onClick={() => handleSendMessage(preset.query)} className="text-left py-1 px-2 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-[8.5px] font-mono rounded text-slate-400 hover:text-violet-400 hover:border-violet-800 transition-all truncate">
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex gap-2 shrink-0">
        <input
          type="text"
          value={inputVal}
          onChange={(event) => setInputVal(event.target.value)}
          placeholder="Ask about authorized information, provenance, alerts, relationships, or context"
          onKeyDown={(event) => { if (event.key === "Enter" && !isLoading) void handleSendMessage(); }}
          disabled={isLoading}
          className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-violet-700 focus:ring-1 focus:ring-violet-700 disabled:opacity-50"
        />
        <button onClick={() => void handleSendMessage()} disabled={isLoading || !inputVal.trim()} className="bg-violet-950 hover:bg-violet-900 text-violet-400 border border-violet-800 hover:border-violet-600 rounded px-3 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
