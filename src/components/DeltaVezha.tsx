import React, { useState, useEffect, useRef } from "react";
import { 
  Compass, 
  Play, 
  ShieldAlert, 
  Cpu, 
  RefreshCw, 
  RotateCcw, 
  AlertTriangle,
  Menu,
  X,
  Volume2,
  Mic,
  MicOff,
  Tv,
  MessageSquare,
  Users,
  Grid as GridIcon,
  Video as VideoIcon,
  Activity,
  UserCheck,
  Plus
} from "lucide-react";

interface DroneFeedNode {
  id: string;
  name: string;
  level: "PLATOON" | "COMPANY" | "BATTALION" | "BRIGADE" | "DIVISION";
  channelName: string;
  battery: number;
  temperature: number;
  rangeKm: number;
  altitudeM: number;
  opticalStreamStatus: "LIVE" | "STATIC_EMI" | "OFFLINE";
  operator: string;
  latLong: string;
  thermalContrastPct: number;
}

interface DiscordVoiceMember {
  name: string;
  rank: string;
  isSpeaking: boolean;
  isMuted: boolean;
}

export default function DeltaVezha({ 
  onAddLog, 
  himalayanOps = false 
}: { 
  onAddLog?: (log: { source: string; type: "ALERT" | "INFO" | "SUCCESS" | "WARNING"; message: string }) => void;
  himalayanOps?: boolean;
}) {
  // 1. ASTA-S Discord Style Hierarchical channels list representing Platoon up to Division level
  const [channels, setChannels] = useState<DroneFeedNode[]>([
    // DIVISION HQ
    { id: "feed-div-1", name: "STRIX-V4 STRATO VISION", level: "DIVISION", channelName: "div-recon-core", battery: 94, temperature: 18, rangeKm: 320, altitudeM: 6200, opticalStreamStatus: "LIVE", operator: "Gen. R. Iyer (DIV HQ)", latLong: "34.2255° N, 77.4201° E", thermalContrastPct: 82 },
    { id: "feed-div-2", name: "COGNITIVE RADAR SWIFT", level: "DIVISION", channelName: "div-radar-correlator", battery: 85, temperature: 22, rangeKm: 180, altitudeM: 4500, opticalStreamStatus: "LIVE", operator: "Capt. Vyas (ISR DESK)", latLong: "34.1920° N, 77.3101° E", thermalContrastPct: 70 },
    
    // BRIGADE
    { id: "feed-bde-1", name: "GHATAK WINGMAN SCORER", level: "BRIGADE", channelName: "bde-heavy-artillery-scout", battery: 100, temperature: 25, rangeKm: 210, altitudeM: 3500, opticalStreamStatus: "LIVE", operator: "Col. K. Singh (14 BDE)", latLong: "34.1522° N, 77.5756° E", thermalContrastPct: 75 },
    { id: "feed-bde-2", name: "HERON-TACTICAL-47 Patrol", level: "BRIGADE", channelName: "bde-scout-climb", battery: 72, temperature: 15, rangeKm: 250, altitudeM: 4100, opticalStreamStatus: "LIVE", operator: "Sub-Lt. Amit Sharma", latLong: "34.1352° N, 77.6102° E", thermalContrastPct: 65 },

    // BATTALION
    { id: "feed-bn-1", name: "NISHANT ALTITUDE PATROL", level: "BATTALION", channelName: "bn-recon-infantry", battery: 78, temperature: 30, rangeKm: 90, altitudeM: 2800, opticalStreamStatus: "LIVE", operator: "Autonomous AI loop", latLong: "34.1802° N, 77.4988° E", thermalContrastPct: 58 },

    // PLATOON LEVEL
    { id: "feed-plat-1", name: "VAJRA KAMIKAZE-09 PIN", level: "PLATOON", channelName: "plat-frontline-kamikaze", battery: 100, temperature: 28, rangeKm: 15, altitudeM: 850, opticalStreamStatus: "LIVE", operator: "Sgt. Raghav", latLong: "34.1102° N, 77.6599° E", thermalContrastPct: 90 },
    { id: "feed-plat-2", name: "THERMAL EDGE SNIPER", level: "PLATOON", channelName: "plat-border-patrol", battery: 60, temperature: 32, rangeKm: 10, altitudeM: 450, opticalStreamStatus: "STATIC_EMI", operator: "Field Pvt. Naidu", latLong: "34.0950° N, 77.7122° E", thermalContrastPct: 40 }
  ]);

  // Audio & layout customization status
  const [activeChannelId, setActiveChannelId] = useState("feed-div-1");
  const [isSplitScreenView, setIsSplitScreenView] = useState(false); // Discord multipanel video wall
  const [thermalContrast, setThermalContrast] = useState(80);
  const [activeLayoutZoom, setActiveLayoutZoom] = useState(1);
  const [isHamMenuOpen, setIsHamMenuOpen] = useState(false);

  // Simulated live voice lobby states
  const [inVoiceRoom, setInVoiceRoom] = useState(true);
  const [userMuted, setUserMuted] = useState(false);
  const [voiceMembers, setVoiceMembers] = useState<DiscordVoiceMember[]>([
    { name: "Commandant Hawk", rank: "General", isSpeaking: true, isMuted: false },
    { name: "Sgt. Amit Sharma", rank: "Lieutenant", isSpeaking: false, isMuted: false },
    { name: "Field Pvt. Naidu", rank: "Forward Lookout", isSpeaking: false, isMuted: true },
    { name: "Autopilot AI Envoy", rank: "Drone Core", isSpeaking: false, isMuted: false }
  ]);

  // Chat comments log box mapped inside the active Discord channel
  const [chatInputs, setChatInputs] = useState<Record<string, Array<{ text: string; sender: string; time: string }>>>({
    "feed-div-1": [
      { text: "Division Recon Drone is on station. Standard orbital sweep initiated.", sender: "Admin Officer", time: "08:15" },
      { text: "Copied. Visuals aligned with Storm Fire common image maps.", sender: "General Hawk", time: "08:16" }
    ],
    "feed-bde-1": [
      { text: "Ghatak tracking has targeted a cold lock signal in Canyon.", sender: "Scout Leader", time: "08:02" }
    ]
  });

  const [currentTextMsgInput, setCurrentTextMsgInput] = useState("");

  const selectedNode = channels.find((f) => f.id === activeChannelId) || channels[0];

  // Battery and status telemetry drift loops
  useEffect(() => {
    const timer = setInterval(() => {
      setChannels((prevList) =>
        prevList.map((f) => {
          const drain = himalayanOps ? 3 : 1;
          const nextBat = f.battery - drain;
          const nextTemp = f.temperature + (Math.random() > 0.5 ? 1 : -1);
          return {
            ...f,
            battery: nextBat <= 5 ? 100 : nextBat, // recharge simulation at 5%
            temperature: nextTemp > 45 ? 20 : nextTemp < 10 ? 15 : nextTemp
          };
        })
      );
    }, 8000);
    return () => clearInterval(timer);
  }, [himalayanOps]);

  // Voice Lobby speaker activities simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setVoiceMembers((prevList) =>
        prevList.map((m) => {
          if (m.name === "Autopilot AI Envoy") return m;
          // Random check for speaking state
          const chance = Math.random() > 0.7;
          return {
            ...m,
            isSpeaking: m.isMuted ? false : chance
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePostCommentMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTextMsgInput.trim()) return;

    const streamId = selectedNode.id;
    const time = new Date().toLocaleTimeString().slice(0, 5);

    setChatInputs((prev) => ({
      ...prev,
      [streamId]: [
        ...(prev[streamId] || []),
        { text: currentTextMsgInput, sender: "Commandant (You)", time }
      ]
    }));

    setCurrentTextMsgInput("");
    if (onAddLog) {
      onAddLog({
        source: "ASTA DISCORD",
        type: "INFO",
        message: `STRIX DISCORD: Dispatched communication chat inside channel #${selectedNode.channelName}.`
      });
    }
  };

  const handleTriggerVoiceToggle = () => {
    setInVoiceRoom(!inVoiceRoom);
    if (onAddLog) {
      onAddLog({
        source: "ASTA COMMS",
        type: "SUCCESS",
        message: inVoiceRoom ? "DISCONNECTED Voice Link from Russian Asta UAV lobby." : "CONNECTED Voice Link to Russian Asta UAV squad lobby."
      });
    }
  };

  const handleDiagnosticSweep = () => {
    setIsHamMenuOpen(false);
    if (onAddLog) {
      onAddLog({
        source: "ASTA-S DIAG",
        type: "SUCCESS",
        message: "DISCORD VIDEO SWEEP: Triggered thermal pixel calibration across all 7 tactical levels feeds."
      });
    }
  };

  return (
    <div className="bg-black border border-slate-900 rounded-lg p-3 shadow-2xl select-none flex flex-col h-[420px] font-mono text-[9px] text-slate-300 relative overflow-hidden">
      
      {/* 1. DISCORD HEADER BAR */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 shrink-0 bg-slate-950/20">
        <div className="flex items-center gap-2">
          {/* Hamburger control button Inside Discord UAV center */}
          <button
            onClick={() => setIsHamMenuOpen(!isHamMenuOpen)}
            className="p-1 px-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-teal-400 rounded-md font-extrabold flex items-center gap-1.5 transition-all"
            title="Asta-S Options Menu"
          >
            <Menu className="h-4 w-4" />
            <span className="text-[7.5px] uppercase">ASTA CONFIG</span>
          </button>

          <div className="h-5 w-px bg-slate-800" />

          <div>
            <h3 className="font-extrabold text-white uppercase text-[11px] tracking-wider flex items-center gap-1">
              <Tv className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
              STRIX ASTA-S UAV DISCORD CORE
            </h3>
            <span className="text-[7px] text-slate-500 block uppercase">Russian design Multi-Tier Drone feeds wall (#Platoon to Division Level)</span>
          </div>
        </div>

        {/* Discord top indicators */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSplitScreenView(!isSplitScreenView)}
            className={`px-2 py-0.5 border rounded-sm font-bold text-[7.5px] flex items-center gap-1 uppercase transition-all ${
              isSplitScreenView
                ? "bg-teal-950 border-teal-500 text-teal-400 font-extrabold"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <GridIcon className="h-3 w-3" />
            {isSplitScreenView ? "Focus View" : "Split Video Wall Grid"}
          </button>
        </div>
      </div>

      {/* Local Options Hamburger Menu Dropdown */}
      {isHamMenuOpen && (
        <div className="absolute left-3 top-11 shadow-2xl w-52 bg-slate-950 border border-slate-850 p-2 rounded-md z-40 flex flex-col gap-2">
          <div className="flex justify-between items-center border-b border-slate-900 pb-1">
            <span className="text-[7.5px] text-slate-400 font-bold uppercase">ASTA FEEDS DIAL</span>
            <button onClick={() => setIsHamMenuOpen(false)} className="text-red-500 hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
          </div>

          <div className="flex flex-col gap-1.5 text-[8.5px]">
            <button 
              onClick={handleDiagnosticSweep}
              className="w-full bg-slate-900 hover:bg-slate-850 text-slate-200 py-1.5 rounded border border-slate-800 text-left px-2 font-bold uppercase text-[7.5px]"
            >
              🚀 Fire Video Decoders Tuning
            </button>

            <button 
              onClick={() => {
                setChannels((prev) => prev.map(f => ({ ...f, opticalStreamStatus: "LIVE" })));
                setIsHamMenuOpen(false);
                onAddLog?.({ source: "ASTA CORE", type: "SUCCESS", message: "EMI NOISE DISMISSED: Cleared electromagnetic jamming on channels." });
              }}
              className="w-full bg-slate-900 hover:bg-slate-850 text-emerald-400 py-1.5 rounded border border-slate-800 text-left px-2 font-bold uppercase text-[7.5px]"
            >
              ⚡ Fix Electro-Magnetic EMI Jam
            </button>

            <div className="border-t border-slate-940 my-0.5" />
            
            <div className="flex items-center justify-between text-[7.5px] text-slate-500 px-1 font-bold">
              <span>ASTA APP VERSION:</span>
              <span>L4ST-V2.19</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHANNELS SPLIT LAYOUT DESK */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2.5 py-1.5 overflow-hidden items-stretch">
        
        {/* Aspect A: DISCORD CHANNELS SIDEBAR (md:col-span-3) */}
        <div className="md:col-span-3 flex flex-row md:flex-col gap-2 border-b md:border-b-0 md:border-r border-slate-900 pr-1.5 overflow-x-auto md:overflow-y-auto shrink-0 scrollbar-none select-none text-[8.8px]">
          
          {/* Discord Guilds title header */}
          <div className="hidden md:flex items-center justify-between text-[7px] text-slate-550 border-b border-slate-900 pb-1.5">
            <span className="font-extrabold uppercase tracking-widest text-slate-500">STRIX ASTA GUILDS</span>
            <Users className="h-3 w-3 text-slate-600" />
          </div>

          {/* Division Channels */}
          <div className="flex flex-col gap-1 md:max-w-none">
            <span className="hidden md:block text-[7px] text-slate-450 font-black tracking-wider uppercase px-1">🗂️ DIVISION COREGROUND</span>
            {channels.filter(f => f.level === "DIVISION" || f.level === "BRIGADE").map((f) => {
              const isActive = f.id === activeChannelId;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setActiveChannelId(f.id);
                    setIsSplitScreenView(false); // reset split on click for easy work
                  }}
                  className={`w-[110px] md:w-full px-2 py-1 border rounded text-left transition-all shrink-0 uppercase font-black truncate flex items-center justify-between ${
                    isActive && !isSplitScreenView
                      ? "bg-teal-950/40 border-teal-800 text-teal-400 font-extrabold"
                      : "bg-slate-950 border-transparent text-slate-500 hover:text-slate-350"
                  }`}
                >
                  <span className="truncate"># {f.channelName}</span>
                  <span className="text-[5.5px] scale-90 border font-bold px-0.5 rounded text-indigo-400 bg-slate-900 select-none">{f.level[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Battalion and Platoon stream channels */}
          <div className="flex flex-col gap-1 md:max-w-none">
            <span className="hidden md:block text-[7px] text-slate-450 font-black tracking-wider uppercase px-1 mt-1">🗂️ BATTALION & PLATS</span>
            {channels.filter(f => f.level !== "DIVISION" && f.level !== "BRIGADE").map((f) => {
              const isActive = f.id === activeChannelId;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setActiveChannelId(f.id);
                    setIsSplitScreenView(false);
                  }}
                  className={`w-[110px] md:w-full px-2 py-1 border rounded text-left transition-all shrink-0 uppercase font-black truncate flex items-center justify-between ${
                    isActive && !isSplitScreenView
                      ? "bg-teal-950/40 border-teal-800 text-teal-400 font-extrabold"
                      : "bg-slate-950 border-transparent text-slate-500 hover:text-slate-350"
                  }`}
                >
                  <span className="truncate"># {f.channelName}</span>
                  <span className="text-[5.5px] scale-90 border font-bold px-0.5 rounded text-sky-400 bg-slate-900 select-none">{f.level[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Discord Active Voice Lobby widget under Channels list */}
          <div className="hidden md:flex flex-col bg-slate-955/60 border border-slate-900 rounded p-1.5 mt-auto gap-1.5">
            <div className="flex items-center justify-between border-b border-slate-900 pb-1">
              <div className="flex items-center gap-1 text-emerald-400 text-[7.5px] font-black uppercase">
                <Volume2 className="h-3 w-3 text-emerald-400 animate-pulse" />
                <span>VOICE CONNECTED</span>
              </div>
              <button 
                onClick={handleTriggerVoiceToggle}
                className={`p-0.5 rounded scale-90 ${inVoiceRoom ? "text-red-500 hover:text-red-400" : "text-emerald-500 hover:text-emerald-400"}`}
                title={inVoiceRoom ? "Join Voice" : "Disconnect Voice"}
              >
                {inVoiceRoom ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
              </button>
            </div>

            {inVoiceRoom && (
              <div className="flex flex-col gap-1 max-h-[50px] overflow-y-auto scrollbar-none text-[6.5px]">
                {voiceMembers.map((m, i) => (
                  <div key={i} className="flex items-center justify-between px-0.5">
                    <div className="flex items-center gap-1 truncate text-slate-350 font-bold">
                      <span className={`h-1.2 w-1.2 rounded-full ${m.isSpeaking ? "bg-emerald-500 animate-ping" : "bg-slate-650"}`} />
                      <span className="truncate">{m.name}</span>
                    </div>
                    <span className="text-slate-600 scale-[0.85] origin-right uppercase">{m.isMuted ? "MUTED" : m.isSpeaking ? "SPEAKING" : "IDLE"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Aspect B: STREAM FEED VISUALS WALL (md:col-span-9) */}
        <div className="md:col-span-9 flex flex-col justify-between overflow-hidden gap-2 h-full">
          
          {/* Renders split screen grid or focusing layout */}
          {isSplitScreenView ? (
            /* Split Screen Video Grid - Showing 4 channels simultaneously */
            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1.5 overflow-hidden">
              {channels.slice(0, 4).map((f) => (
                <div key={f.id} className="bg-slate-950 border border-slate-900 rounded p-1 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none opacity-40" />
                  
                  {/* Top Feed Stats tag */}
                  <div className="flex justify-between items-center bg-black/60 z-10 p-0.5 text-[6px]">
                    <span className="font-extrabold text-teal-400 uppercase tracking-widest">{f.name}</span>
                    <span className="text-emerald-450 font-extrabold bg-emerald-950/20 border border-emerald-900 px-1 rounded">LIVE</span>
                  </div>

                  {/* Visual simulated spectrum scan */}
                  <div className="flex-1 flex flex-col items-center justify-center py-2 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-teal-950/10 to-transparent pointer-events-none" />
                    <VideoIcon className="h-5 w-5 text-teal-500 animate-pulse mb-1.5" />
                    <span className="text-[6.5px] text-slate-500 max-w-[120px] truncate block font-sans font-extrabold">ALT: {f.altitudeM}m | BAT: {f.battery}%</span>
                    <div className="absolute top-0 left-0 w-full h-px bg-teal-500/30 animate-bounce" />
                  </div>

                  {/* Node footer indices */}
                  <div className="flex justify-between items-center text-[5.8px] bg-black/45 z-10 px-0.5">
                    <span className="text-slate-400 font-bold truncate max-w-[100px]">{f.latLong}</span>
                    <span className="text-slate-600">// OPERATOR: {f.operator[0]}....</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Focus single screen feed view */
            <div className="flex-1 flex flex-col md:flex-row gap-2 overflow-hidden">
              
              {/* Drone visual telemetry decoders panel */}
              <div className="flex-1 bg-slate-950 border border-slate-900 rounded-md p-2 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none" />
                
                {/* Top feed parameters bar */}
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 z-10 bg-black/50 p-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <span className="font-extrabold text-[#51e2f5] uppercase tracking-wider">{selectedNode.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">OPERATOR:</span>
                    <span className="text-white font-bold">{selectedNode.operator}</span>
                  </div>
                </div>

                {/* Main animated graphical frame */}
                <div className="flex-grow flex flex-col items-center justify-center p-4 relative py-6">
                  {selectedNode.opticalStreamStatus === "STATIC_EMI" ? (
                    <div className="flex flex-col items-center justify-center text-center gap-1">
                      <AlertTriangle className="h-8 w-8 text-amber-500 animate-bounce" />
                      <span className="text-amber-500 font-black uppercase text-[10px] tracking-wide">Optical feed loss - High static interference</span>
                      <span className="text-slate-650 text-[6.5px]">RE-TUNING FREQUENCY DECODERS TRUNK...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center relative select-none">
                      {/* Looping crosshair target overlay wrapper */}
                      <div className="absolute border border-teal-500/20 h-28 w-28 rounded-full pointer-events-none animate-spin" />
                      <div className="absolute border border-teal-500/30 h-16 w-16 rounded-full pointer-events-none" />
                      
                      <VideoIcon className="h-7 w-7 text-teal-400 animate-pulse mb-2 z-10" />
                      <span className="text-[10px] font-sans font-black text-white text-center leading-normal z-10 uppercase">{selectedNode.channelName} Stream</span>
                      <span className="text-slate-400 text-[7px] block max-w-sm mt-0.5 z-10 leading-relaxed font-sans">{selectedNode.latLong} • Range: {selectedNode.rangeKm}km</span>

                      {/* Moving coordinate tickers */}
                      <span className="absolute top-2 left-2 text-slate-600 text-[6.5px]">AZIMUTH: 284.15°  •  ELEV: +12.44°</span>
                      <span className="absolute bottom-2 right-2 text-[#38bdf8] text-[7.5px] font-black uppercase bg-slate-950 px-1 border border-slate-900 rounded">TARGET GRID SECURE ✔</span>
                    </div>
                  )}

                  {/* Horizontal visual line scan */}
                  {selectedNode.opticalStreamStatus === "LIVE" && (
                    <div className="absolute top-0 left-0 w-full h-[1.5px] bg-teal-500/20 animate-bounce" />
                  )}
                </div>

                {/* Video controls dashboard slider */}
                <div className="bg-black/60 p-1.5 border-t border-slate-900/65 z-10 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-3 text-[7px] text-slate-400">
                    <div><span>CORE BATTERY:</span> <span className="text-teal-400 font-black">{selectedNode.battery}%</span></div>
                    <div><span>ALTITUDE:</span> <span className="text-emerald-400 font-bold">{selectedNode.altitudeM}m</span></div>
                    <div><span>TEMP:</span> <span className={selectedNode.temperature > 30 ? "text-red-400" : "text-sky-400"}>{selectedNode.temperature}°C</span></div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[6.5px] text-slate-500 font-bold uppercase">THERMAL CONTRAST:</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={thermalContrast}
                      onChange={(e) => setThermalContrast(parseInt(e.target.value))}
                      className="accent-teal-500 bg-slate-800 h-1 w-20 rounded"
                    />
                    <span className="text-white text-[7px] font-black">{thermalContrast}%</span>
                  </div>
                </div>
              </div>

              {/* Discord Interactive channel comment chat column side panel */}
              <div className="w-[155px] bg-slate-950 border border-slate-900 rounded-md p-1.5 flex flex-col justify-between overflow-hidden gap-1.5 shrink-0 h-full">
                <div className="flex items-center gap-1 border-b border-slate-900 pb-1.5">
                  <MessageSquare className="h-3 w-3 text-slate-500" />
                  <span className="text-[7.5px] text-slate-400 font-extrabold uppercase truncate">💬 #{selectedNode.channelName} CHAT</span>
                </div>

                {/* Channel Comments Feed stream */}
                <div className="flex-grow overflow-y-auto pr-0.5 flex flex-col gap-1.5 text-[6.8px] leading-relaxed select-text scrollbar-none py-1">
                  {(chatInputs[selectedNode.id] || []).length === 0 ? (
                    <div className="text-slate-650 text-center py-6 font-sans italic">No tactical comments inside this level yet. Dispatch coordinates.</div>
                  ) : (
                    (chatInputs[selectedNode.id] || []).map((cmt, index) => (
                      <div key={index} className="flex flex-col border-b border-slate-900/40 pb-1 mb-0.5 font-sans">
                        <div className="flex justify-between items-center gap-1">
                          <span className="font-extrabold text-teal-400">{cmt.sender}</span>
                          <span className="text-slate-600 scale-[0.9] text-[6px]">{cmt.time}</span>
                        </div>
                        <span className="text-slate-350 mt-0.5 text-[8.2px] font-sans break-words">{cmt.text}</span>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handlePostCommentMessage} className="flex gap-1 border-t border-slate-900 pt-1 shrink-0">
                  <input
                    type="text"
                    value={currentTextMsgInput}
                    onChange={(e) => setCurrentTextMsgInput(e.target.value)}
                    placeholder="Chat in channels..."
                    className="flex-grow bg-slate-900 border border-slate-850 text-white rounded px-1.5 py-0.5 text-[7px] outline-none placeholder-slate-650 uppercase"
                  />
                  <button type="submit" className="px-1.5 bg-teal-950 border border-teal-900 text-teal-400 rounded hover:text-white transition-all text-center font-bold">▶</button>
                </form>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
