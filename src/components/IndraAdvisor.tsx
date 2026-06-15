import React, { useState, useRef, useEffect } from "react";
import { AdviceMessage, TacticalTrack, TacticalNode, TacticalLog, CommandSystem } from "../types";
import { Brain, Send, HelpCircle, Loader, Terminal, Radio } from "lucide-react";

interface IndraAdvisorProps {
  tracks: TacticalTrack[];
  nodes: TacticalNode[];
  logs: TacticalLog[];
  himalayanOps: boolean;
  systems?: CommandSystem[];
}


const PRESET_QUERIES = [
  { label: "Conduct High-Altitude Hazard Review", query: "Give a full tactical analysis of high-altitude mountain warfare threats, high-relief terrain dead angles, and battery cold-degradation hazards for the Heron drone fleet on our Ladakh Common Operational Picture." },
  { label: "Analyze Target Vulnerabilities", query: "Compile a strategic audit of the hostile tracks currently targeted on our map. Assess target value and map them to the priority weapons in our arsenal: Pinaka Guided Rockets vs BrahMos precision vs Kamikaze FPV Swarms." },
  { label: "Simulate EW Spectrum Fallbacks", query: "Analyze the Digital Spine Nodes. If SATCOM or Edge services are jammed by enemy intervention, what is the automated cognitive frequency-switching protocol to preserve data flow across our theater?" }
];

export default function IndraAdvisor({ tracks, nodes, logs, himalayanOps, systems = [] }: IndraAdvisorProps) {
  const [messages, setMessages] = useState<AdviceMessage[]>([
    {
      id: "init",
      role: "model",
      text: "Sovereign INDRA-C2 Intelligent Tactical Decisions Online. Awaiting sector parameters. I am prepared to process weapon allocation matrices, provide mountain terrain analysis, or draft tactical strike estimates.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle calling Express endpoint
  const handleSendMessage = async (customQueryText?: string) => {
    const query = customQueryText || inputVal.trim();
    if (!query) return;

    if (!customQueryText) {
      setInputVal("");
    }

    const userMsg: AdviceMessage = {
      id: Math.random().toString(),
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString(),
      isQuickPrompt: !!customQueryText
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const resp = await fetch("/api/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: {
            tracks,
            nodes,
            logs,
            systems
          },
          messageHistory: messages.slice(-6), // Send last 6 messages as context
          userQuery: query
        })
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Tactical report connection interrupted.");
      }

      const modelMsg: AdviceMessage = {
        id: Math.random().toString(),
        role: "model",
        text: data.response,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "system",
          text: `⚠️ TRANSMISSION LOSS: ${err.message || "Failed to reach INDRA-C2 tactical decision server."}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Ultra-robust beautiful text formatting to parse basic markdown lists, headings and bold lines
  const parseTacticalText = (txt: string) => {
    const lines = txt.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      
      // Check for headings
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="text-cyan-400 font-mono font-bold text-xs uppercase mt-3 mb-1 border-b border-cyan-950 pb-0.5 tracking-wide">
            {trimmed.replace(/^###\s*/, "")}
          </h4>
        );
      }
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={idx} className="text-white font-mono font-bold text-xs uppercase mt-4 mb-2 tracking-widest border-l-2 border-cyan-500 pl-1.5">
            {trimmed.replace(/^##\s*/, "")}
          </h3>
        );
      }
      if (trimmed.startsWith("#")) {
        return (
          <h2 key={idx} className="text-white font-mono font-black text-sm uppercase mt-4 mb-2 pb-1 border-b border-slate-800 tracking-wider">
            {trimmed.replace(/^#\s*/, "")}
          </h2>
        );
      }

      // Check for lists
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const itemText = trimmed.replace(/^[-*]\s*/, "");
        return (
          <li key={idx} className="text-[10px] font-mono text-slate-300 ml-4 list-disc mt-1 leading-relaxed">
            {renderBoldText(itemText)}
          </li>
        );
      }

      // Default paragraph line
      if (trimmed === "") return <div key={idx} className="h-2"></div>;

      return (
        <p key={idx} className="text-[10px] font-mono text-slate-300 leading-normal mb-1.5">
          {renderBoldText(trimmed)}
        </p>
      );
    });
  };

  const renderBoldText = (text: string) => {
    // Regex replace **word** to bold spans
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-yellow-400 font-semibold font-mono">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col h-[525px] shadow-2xl overflow-hidden">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-yellow-400 animate-pulse" />
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              INDRA BRAIN: TACTICAL DECISION SUPPORT
            </h2>
            <div className="text-[8px] text-slate-500 font-mono">SERVER-SIDE SECURE COGNITIVE RECON</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[8px] font-mono bg-cyan-950/40 border border-cyan-900 text-cyan-400 px-2 py-0.5 rounded">
          <Radio className="h-3 w-3 animate-spin" />
          <span>GEMINI MODEL: 3.5-FLASH</span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto pr-1 py-3 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => {
          const isModel = msg.role === "model";
          const isSystem = msg.role === "system";
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[90%] ${
                isUser ? "self-end items-end" : "self-start items-start"
              }`}
            >
              <div className="text-[7px] text-slate-500 font-mono mb-0.5 px-1 uppercase">
                {isModel ? "INDRA SOVEREIGN INTEL" : isUser ? "COMMANDER ACCESS PATH" : "BACKBONE CONSOLE"} • {msg.timestamp}
              </div>
              <div
                className={`p-3 rounded-lg border font-mono text-[10px] shadow-sm ${
                  isUser
                    ? "bg-cyan-950/40 border-cyan-800 text-cyan-300 rounded-br-none"
                    : isSystem
                      ? "bg-red-950/20 border-red-900 text-red-400"
                      : "bg-slate-950 border-slate-800 text-slate-300 rounded-bl-none"
                }`}
              >
                {isModel ? parseTacticalText(msg.text) : <p className="leading-relaxed">{msg.text}</p>}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="self-start flex flex-col items-start max-w-[80%]">
            <div className="text-[7px] text-slate-500 font-mono mb-0.5 px-1 uppercase">
              INDRA CORE ENGINE PROCESSING...
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 flex items-center gap-2 font-mono text-[10px] shadow">
              <Loader className="h-4 w-4 animate-spin text-cyan-400" />
              <span>Analyzing Ladakh grid overlays, target positions, and weapon status models...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Preset fast prompt queries */}
      <div className="mt-2 flex flex-col gap-1 border-t border-slate-800/60 pt-2 shrink-0">
        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
          EXECUTE PRESET COGNITIVE ACTIONS:
        </span>
        <div className="grid grid-cols-1 gap-1.5">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSendMessage(preset.query)}
              className="text-left py-1 px-2 border border-slate-800 bg-slate-950 hover:bg-slate-9ml text-[8.5px] font-mono rounded text-slate-400 hover:text-cyan-400 hover:border-cyan-800 transition-all truncate"
            >
              🚀 {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Form Input */}
      <div className="mt-3 flex gap-2 shrink-0">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Query strategic battlespace advisor (e.g. recommend optimal strikes)"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) {
              handleSendMessage();
            }
          }}
          disabled={isLoading}
          className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-700 focus:ring-1 focus:ring-cyan-700 disabled:opacity-50"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputVal.trim()}
          className="bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 hover:border-cyan-600 rounded px-3 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
}
