import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  ShieldAlert, 
  Send, 
  Radio, 
  Lock, 
  Wifi, 
  AlertCircle,
  Menu,
  Paperclip,
  Check,
  CheckCheck,
  Volume2,
  Trash2,
  LockKeyhole,
  Clock,
  EyeOff,
  Image as ImageIcon,
  Video as VideoIcon,
  Mic as MicIcon,
  FileText as FileIcon,
  CornerUpLeft,
  Smile,
  X,
  Sparkles
} from "lucide-react";

interface TelegramMessage {
  id: string;
  sender: string;
  role: "HQ" | "COMMAND" | "RECON_UNIT" | "ARTILLERY_FIRE" | "AIR_PILOT" | "USER";
  text: string;
  timestamp: string;
  encryptionStrength: string;
  coordinates?: string;
  attachmentType?: "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
  attachmentLabel?: string;
  attachmentUrl?: string; // or mockup UI elements
  reactions: Record<string, number>;
  replyToId?: string;
  replyToText?: string;
  selfDestructIn?: number; // seconds
}

interface ChatRoom {
  id: string;
  name: string;
  type: "GROUP" | "DIRECT" | "CHANNEL";
  unreadCount: number;
  lastMsg: string;
  iconInitials: string;
}

export default function DeltaElement({ 
  onAddLog, 
  onSelectCoordinate 
}: { 
  onAddLog?: (log: { source: string; type: "ALERT" | "INFO" | "SUCCESS" | "WARNING"; message: string }) => void;
  onSelectCoordinate?: (coords: string) => void;
}) {
  // Navigation lists representing Telegram sidebar
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    { id: "r1", name: "JOINT THEATER COMMAND", type: "GROUP", unreadCount: 2, lastMsg: "Awaiting final high altitude flight clearances...", iconInitials: "JC" },
    { id: "r2", name: "STRIX DRONELINKS CH", type: "CHANNEL", unreadCount: 0, lastMsg: "[CLIP ENCLOSED] Live visual of Sector 4 Canyon.", iconInitials: "SD" },
    { id: "r3", name: "ARTILLERY SHAKTI NETWORK", type: "GROUP", unreadCount: 1, lastMsg: "Rocket launcher bays primed and locked on Grid.", iconInitials: "SN" },
    { id: "r4", name: "HQ DEFENSE INTEL DESK", type: "DIRECT", unreadCount: 0, lastMsg: "All spectrum anomalies cleared for Ladakh.", iconInitials: "HI" }
  ]);

  const [activeRoomId, setActiveRoomId] = useState("r1");
  const [inputText, setInputText] = useState("");
  const [signalStrength, setSignalStrength] = useState(98);
  const [isHamOpen, setIsHamOpen] = useState(false);

  // Advanced Messenger Features States
  const [selfDestructTimer, setSelfDestructTimer] = useState<number | null>(null); // null = off, or 5, 15, 30s
  const [replyMessage, setReplyMessage] = useState<TelegramMessage | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [unlockedE2E, setUnlockedE2E] = useState(true);

  // Message store mapped per room
  const [messages, setMessages] = useState<Record<string, TelegramMessage[]>>({
    r1: [
      {
        id: "m1",
        sender: "Sectors HQ Ladakh Commandant",
        role: "HQ",
        text: "Commanders: All forward units are now synchronized with Storm Fire C2 interface. Track real-time coordinates.",
        timestamp: "08:14:10",
        encryptionStrength: "ASCON-256 E2E",
        reactions: { "👍": 4, "🔥": 2 },
      },
      {
        id: "m2",
        sender: "Strix Aerial Scout 01",
        role: "RECON_UNIT",
        text: "Confirmed visual detection inside Canyon: Hostile logistics carrier vehicles moving along coordination grid. Pin coordinate below.",
        timestamp: "08:16:30",
        encryptionStrength: "ASCON-256 E2E",
        coordinates: "43Q LD 51928 12845",
        reactions: { "🚀": 3, "🚨": 5 },
      },
      {
        id: "m3",
        sender: "Sovereign Advise Intelligence",
        role: "COMMAND",
        text: "Shakti Rocket batteries are deployed in firing trenches, awaiting authorized targets.",
        timestamp: "08:17:15",
        encryptionStrength: "ASCON-256 E2E",
        reactions: { "👍": 2 },
      }
    ],
    r2: [
      {
        id: "m_ch1",
        sender: "STRIX UAV MONITOR FEED",
        role: "RECON_UNIT",
        text: "Visual update compiled. Embedded video file of Sector 4 canyon shows clear thermal profile. Deploying decoy phantoms.",
        timestamp: "08:05:00",
        encryptionStrength: "ASCON-256 E2E",
        attachmentType: "VIDEO",
        attachmentLabel: "Drone_Valley_Scan_L4.mp4",
        reactions: { "🔥": 8, "🚀": 4 }
      }
    ],
    r3: [
      {
        id: "m_art1",
        sender: "Artillery Officer (ACCCS)",
        role: "ARTILLERY_FIRE",
        text: "Fire solutions are loaded for howitzers in Sector 4. High-altitude atmospheric drift calibrated.",
        timestamp: "07:50:11",
        encryptionStrength: "ASCON-256 E2E",
        reactions: { "👍": 5 }
      }
    ],
    r4: [
      {
        id: "m_int1",
        sender: "HQ Intel Director",
        role: "HQ",
        text: "Secure ASCON tunnels are fully established. No signal leakage or packet loss detected across our borders.",
        timestamp: "08:00:22",
        encryptionStrength: "ASCON-256 E2E",
        reactions: { "👍": 3 }
      }
    ]
  });

  // Simulated signal drift
  useEffect(() => {
    const timer = setInterval(() => {
      setSignalStrength((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return next > 100 ? 100 : next < 85 ? 88 : next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Self-destruct message ticking countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prevStores) => {
        const nextStores = { ...prevStores };
        let changed = false;

        Object.keys(nextStores).forEach((roomId) => {
          let updatedMsgs = nextStores[roomId].map((msg) => {
            if (msg.selfDestructIn !== undefined) {
              changed = true;
              const nextSec = msg.selfDestructIn - 1;
              if (nextSec <= 0) {
                return null; // Will filter out
              }
              return { ...msg, selfDestructIn: nextSec };
            }
            return msg;
          }).filter(Boolean) as TelegramMessage[];

          if (updatedMsgs.length !== nextStores[roomId].length) {
            changed = true;
          }
          nextStores[roomId] = updatedMsgs;
        });

        return changed ? nextStores : prevStores;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e?: React.FormEvent, attachedMedia?: { type: "IMAGE" | "VIDEO" | "AUDIO" | "FILE", label: string }) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedMedia) return;

    const roomId = activeRoomId;
    const timestamp = new Date().toLocaleTimeString();
    
    const newMsg: TelegramMessage = {
      id: `m-tg-${Date.now()}`,
      sender: "Theatre Commandant (User)",
      role: "USER",
      text: inputText,
      timestamp,
      encryptionStrength: unlockedE2E ? "ASCON-256 E2E" : "PUBLIC UNCLASSIFIED",
      reactions: {},
    };

    if (selfDestructTimer) {
      newMsg.selfDestructIn = selfDestructTimer;
    }

    if (replyMessage) {
      newMsg.replyToId = replyMessage.id;
      newMsg.replyToText = replyMessage.text.slice(0, 30) + "...";
    }

    if (attachedMedia) {
      newMsg.attachmentType = attachedMedia.type;
      newMsg.attachmentLabel = attachedMedia.label;
      if (!newMsg.text) {
        newMsg.text = `Sent attachment: ${attachedMedia.label}`;
      }
    }

    // Capture coordinate pins
    const coordRegex = /([0-9]{2}[Q-R]\s[A-Z]{2}\s[0-9]{4,5}\s[0-9]{4,5})/gi;
    const match = inputText.match(coordRegex);
    if (match) {
      newMsg.coordinates = match[0];
      if (onAddLog) {
        onAddLog({
          source: "KAVACH COMMS",
          type: "SUCCESS",
          message: `STRIX COMMS: Discovered target grid pin: ${match[0]}. Anchor attached.`
        });
      }
    }

    // Save Message
    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMsg]
    }));

    // Update unread count for other rooms
    setChatRooms((prevList) =>
      prevList.map((room) => {
        if (room.id === roomId) {
          return { ...room, lastMsg: newMsg.text.slice(0, 40) };
        }
        return room;
      })
    );

    setInputText("");
    setReplyMessage(null);
    setShowAttachmentMenu(false);

    if (onAddLog) {
      onAddLog({
        source: "STRIX MESGR",
        type: "INFO",
        message: `STRIX TELEGRAM: Secure ASCON radio trace dispatched to room ${roomId}.`
      });
    }

    // Auto chatbot replies representing remote officers
    setTimeout(() => {
      const isFire = inputText.toLowerCase().includes("fire") || inputText.toLowerCase().includes("strike");
      const isPlan = inputText.toLowerCase().includes("route") || inputText.toLowerCase().includes("waypoint");

      let autoText = "";
      let responder: string = "HQ Artillery Officer";
      let resRole: TelegramMessage["role"] = "ARTILLERY_FIRE";

      if (isFire) {
        autoText = "Copy that. Rocket launchers primed. Targets verification complete.";
      } else if (isPlan) {
        autoText = "Flight corridor updated. Autopilot trace upload synchronized with Strix UAVs.";
        responder = "Strix Avionics Center";
        resRole = "RECON_UNIT";
      }

      if (autoText) {
        const botMsg: TelegramMessage = {
          id: `bot-${Date.now()}`,
          sender: responder,
          role: resRole,
          text: autoText,
          timestamp: new Date().toLocaleTimeString(),
          encryptionStrength: "ASCON-255 PROTECTED",
          reactions: {},
        };
        setMessages((prev) => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), botMsg]
        }));
      }
    }, 1500);
  };

  const addReaction = (msgId: string, emoji: string) => {
    const roomId = activeRoomId;
    setMessages((prev) => {
      const roomMsgs = prev[roomId] || [];
      const updated = roomMsgs.map((m) => {
        if (m.id === msgId) {
          const rx = { ...m.reactions };
          rx[emoji] = (rx[emoji] || 0) + 1;
          return { ...m, reactions: rx };
        }
        return m;
      });
      return { ...prev, [roomId]: updated };
    });
  };

  const handleAttachImage = () => {
    handleSendMessage(undefined, {
      type: "IMAGE",
      label: "Theater_Map_Snapshot_LADAKH4.png"
    });
  };

  const handleAttachVideo = () => {
    handleSendMessage(undefined, {
      type: "VIDEO",
      label: "UAV_Thermal_TargetStream_Sector4.avi"
    });
  };

  const handleAttachAudio = () => {
    handleSendMessage(undefined, {
      type: "AUDIO",
      label: "Voice_RadioComm_CommandHQ.wav"
    });
  };

  const activeMessages = messages[activeRoomId] || [];
  const currentRoom = chatRooms.find((r) => r.id === activeRoomId) || chatRooms[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-xl select-none flex flex-col h-[420px] font-mono text-xs relative overflow-hidden">
      
      {/* 1. SECURE MESSENGER TOP WORK BAR */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0">
        <div className="flex items-center gap-2">
          {/* Hamburger toggle button Inside Comms Module */}
          <button
            onClick={() => setIsHamOpen(!isHamOpen)}
            className="p-1 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-emerald-400 rounded transition-all"
            title="Kavach Chat Menu"
          >
            <Menu className="h-3.5 w-3.5" />
          </button>
          
          <div>
            <h3 className="font-extrabold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              STRIX KAVACH MESSENGER
            </h3>
            <span className="text-[7.5px] text-slate-500 block uppercase">SECURE MILITARY TELEGRAM CLONE // END-TO-END CRYPTO</span>
          </div>
        </div>

        {/* Telegram Top Stats Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[9px] text-slate-400">
            <Wifi className="h-3 w-3 text-emerald-400" />
            <span>CHANNEL QUALITY: <span className="text-emerald-400 font-bold">{signalStrength}%</span></span>
          </div>
          <div className="flex items-center gap-1 text-[8px] bg-slate-950 border border-slate-850 text-emerald-400 px-1.5 py-0.5 rounded">
            <Lock className="h-2.5 w-2.5 text-emerald-400" />
            <span>ASCON-256 E2E</span>
          </div>
        </div>
      </div>

      {/* Hamburger Options Drawer */}
      {isHamOpen && (
        <div className="absolute left-3 top-11 shadow-2xl w-52 bg-slate-950 border border-slate-850 p-2 rounded-md z-40 flex flex-col gap-2">
          <div className="flex justify-between items-center border-b border-slate-900 pb-1">
            <span className="text-[7.5px] text-slate-400 font-bold uppercase">COMMS CONTROLS</span>
            <button onClick={() => setIsHamOpen(false)} className="text-red-500 hover:text-red-400 text-[10px]"><X className="h-3.5 w-3.5" /></button>
          </div>

          <div className="flex flex-col gap-1.5 text-[8.5px] text-slate-300">
            <label className="flex items-center justify-between cursor-pointer">
              <span>ASCON ENCRYPTION</span>
              <input 
                type="checkbox" 
                checked={unlockedE2E} 
                onChange={(e) => {
                  setUnlockedE2E(e.target.checked);
                  onAddLog?.({
                    source: "KAVACH COMMS",
                    type: e.target.checked ? "SUCCESS" : "WARNING",
                    message: `E2E ENCRYPTION: ASCON status toggled ${e.target.checked ? "ON" : "OFF"}`
                  });
                }} 
                className="rounded border-slate-800 bg-slate-900 accent-emerald-500 h-3 w-3" 
              />
            </label>

            <button 
              onClick={() => {
                setMessages((prev) => ({ ...prev, [activeRoomId]: [] }));
                setIsHamOpen(false);
              }}
              className="w-full bg-red-950 hover:bg-red-900 text-red-400 hover:text-white py-1 rounded text-[7.5px] border border-red-900 uppercase"
            >
              Clear Current Chat History
            </button>

            <button 
              onClick={() => {
                onAddLog?.({
                  source: "KAVACH CRYPTO",
                  type: "SUCCESS",
                  message: "ASCON PIN ENGINE: Re-generated transient private authentication blocks."
                });
                setIsHamOpen(false);
              }}
              className="w-full bg-slate-900 hover:bg-slate-850 text-[#38bdf8] py-1 rounded border border-slate-800 text-[7.5px] uppercase"
            >
              Rotate ASCON-256 Key
            </button>
          </div>
        </div>
      )}

      {/* 2. CHAT DRAWERS WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2.5 py-2 overflow-hidden items-stretch">
        
        {/* Left Aspect Side: Chat rooms layout stack like Telegram side-pane */}
        <div className="md:col-span-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto border-b md:border-b-0 md:border-r border-slate-800/80 pr-1.5 shrink-0 scrollbar-none select-none">
          {chatRooms.map((room) => {
            const isActive = room.id === activeRoomId;
            return (
              <button
                key={room.id}
                onClick={() => {
                  setActiveRoomId(room.id);
                  // Mark as read
                  setChatRooms(prev => prev.map(r => r.id === room.id ? { ...r, unreadCount: 0 } : r));
                }}
                className={`w-[120px] md:w-full p-2 rounded-md border flex items-center justify-between text-left transition-all shrink-0 font-mono text-[10px] ${
                  isActive
                    ? "bg-emerald-950/40 border-emerald-800/80 text-white shadow-md"
                    : "bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-800 hover:text-slate-350"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {/* Avatar Sphere */}
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 border ${
                    isActive ? "bg-emerald-900 border-emerald-500 text-emerald-200" : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}>
                    {room.iconInitials}
                  </div>
                  
                  <div className="flex flex-col truncate min-w-0">
                    <span className="font-extrabold tracking-wide text-[9.5px] text-slate-200 truncate">{room.name}</span>
                    <span className="text-[7.5px] text-slate-500 truncate mt-0.5 font-sans italic">{room.lastMsg}</span>
                  </div>
                </div>

                {room.unreadCount > 0 && !isActive && (
                  <span className="ml-1 bg-emerald-500 text-slate-950 font-black text-[7.5px] px-1 rounded-full text-center min-w-[14px]">
                    {room.unreadCount}
                  </span>
                )}
              </button>
            );
          })}

          <div className="hidden md:block mt-auto bg-slate-950/40 border border-slate-900/60 rounded p-1.5 text-[7.5px] text-slate-500 uppercase leading-relaxed">
            <LockKeyhole className="h-4 w-4 text-emerald-500 mb-1" />
            Classified security seals are verified by STRIX C2 network node authentication.
          </div>
        </div>

        {/* Right Aspect Side: Messaging Chat Area with full bubbles stream */}
        <div className="md:col-span-8 flex flex-col justify-between overflow-hidden gap-2 h-full">
          
          {/* Messages Feed View */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 scrollbar-thin scrollbar-thumb-slate-800 p-1.5 bg-slate-950/30 rounded border border-slate-950">
            {activeMessages.length === 0 ? (
              <div className="text-slate-600 text-center py-10 text-[8.5px]">
                SECURE DIALOGUE THREAD EMPTY. START ENCRYPTED EMISSION...
              </div>
            ) : (
              activeMessages.map((m) => {
                const isUser = m.role === "USER";
                const roleColors = {
                  HQ: "border-sky-900 text-sky-400 bg-sky-950/35",
                  COMMAND: "border-purple-900 text-purple-400 bg-purple-950/35",
                  RECON_UNIT: "border-emerald-900 text-emerald-400 bg-emerald-950/35",
                  AIR_PILOT: "border-pink-900 text-pink-400 bg-pink-950/35",
                  ARTILLERY_FIRE: "border-amber-900 text-amber-400 bg-amber-950/35",
                  USER: "border-emerald-800 text-emerald-400 bg-emerald-950/35"
                };

                return (
                  <div 
                    key={m.id} 
                    className={`flex flex-col max-w-[85%] ${isUser ? "self-end items-end" : "self-start items-start"}`}
                  >
                    {/* Header line metadata */}
                    <div className="flex items-center gap-1.5 mb-0.5 text-[8.5px]">
                      <span className="font-extrabold text-slate-300">{m.sender}</span>
                      <span className={`px-1 text-[7px] border uppercase rounded-sm scale-90 font-black ${roleColors[m.role]}`}>
                        {m.role}
                      </span>
                      <span className="text-slate-650 text-[7px]">{m.timestamp}</span>
                    </div>

                    {/* Chat messaging bubble container */}
                    <div className={`p-2 rounded-lg border flex flex-col gap-1.5 relative group leading-normal ${
                      isUser
                        ? "bg-slate-900 border-slate-800 text-slate-200"
                        : "bg-slate-900/60 border-slate-850 text-slate-300"
                    }`}>
                      {/* Self destructing indicator */}
                      {m.selfDestructIn !== undefined && (
                        <div className="flex items-center gap-1 text-[7.5px] text-rose-500 font-extrabold uppercase animate-pulse border border-red-950 bg-red-950/20 px-1 rounded-sm">
                          <Clock className="h-2.5 w-2.5" />
                          <span>VANISHES IN: {m.selfDestructIn}s</span>
                        </div>
                      )}

                      {/* Reply header trace preview */}
                      {m.replyToText && (
                        <div className="border-l-2 border-emerald-600 bg-black/40 p-1 rounded-r text-[7.5px] text-slate-500 font-sans italic">
                          Reply: {m.replyToText}
                        </div>
                      )}

                      {/* Actual Message Line Text */}
                      <span className="font-sans text-[10px] break-words text-slate-200 select-text font-medium leading-relaxed">{m.text}</span>

                      {/* Coordinates trigger link button */}
                      {m.coordinates && (
                        <div className="flex items-center gap-1 mt-1 font-mono shrink-0 select-none">
                          <button
                            type="button"
                            onClick={() => onSelectCoordinate && onSelectCoordinate(m.coordinates!)}
                            className="px-2 py-0.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 text-[8.5px] font-black rounded flex items-center gap-1 transition-all active:scale-95"
                          >
                            <Radio className="h-3 w-3 text-emerald-400 shrink-0" />
                            PIN CORNER {m.coordinates} TO MAP
                          </button>
                        </div>
                      )}

                      {/* Renders Attachment Media Objects If Enriched */}
                      {m.attachmentType === "IMAGE" && (
                        <div className="border border-slate-800 bg-slate-950 p-1 rounded-md mt-1 shrink-0 select-none">
                          <div className="relative h-20 w-36 bg-slate-900 flex flex-col items-center justify-center border border-slate-850 rounded">
                            <ImageIcon className="h-6 w-6 text-emerald-400 animate-pulse mt-1" />
                            <span className="text-[7px] text-slate-400 uppercase mt-1 truncate max-w-[130px] font-mono px-1 font-bold">
                              {m.attachmentLabel}
                            </span>
                            <span className="text-[5.5px] font-black text-emerald-400 tracking-wider absolute bottom-1 uppercase bg-emerald-950/70 border border-emerald-900 scale-90 rounded px-1">
                              MAP SECTOR GRAPHICS
                            </span>
                          </div>
                        </div>
                      )}

                      {m.attachmentType === "VIDEO" && (
                        <div className="border border-slate-800 bg-slate-950 p-1 rounded-md mt-1 shrink-0 select-none">
                          <div className="relative h-24 w-44 bg-slate-900 flex flex-col items-center justify-center border border-slate-850 rounded overflow-hidden">
                            {/* Looping wireframe scanning frame decoration */}
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-955/20 to-transparent pointer-events-none animate-pulse" />
                            <VideoIcon className="h-6 w-6 text-sky-400 animate-bounce mt-1.5" />
                            <span className="text-[7.5px] text-slate-400 mt-1 truncate max-w-[150px] font-mono px-1 font-bold">
                              {m.attachmentLabel}
                            </span>
                            {/* Scanning line indicator */}
                            <div className="absolute top-0 left-0 w-full h-px bg-red-500/60 animate-bounce" />
                            <span className="text-[6px] font-black text-sky-400 tracking-wider absolute bottom-1.5 uppercase bg-sky-950/70 border border-sky-900 scale-90 rounded px-1 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                              LIVE STREAM RECON DECIPHER
                            </span>
                          </div>
                        </div>
                      )}

                      {m.attachmentType === "AUDIO" && (
                        <div className="border border-slate-800 bg-slate-950 p-1.5 rounded-md mt-1 select-none flex items-center gap-2 shrink-0">
                          <MicIcon className="h-5 w-5 text-indigo-400 animate-pulse" />
                          <div className="flex-1">
                            <span className="text-[7.5px] text-slate-300 block font-bold truncate max-w-[150px]">{m.attachmentLabel}</span>
                            {/* Vector visual audio wave */}
                            <div className="flex items-end gap-0.5 h-3 mt-1 bg-black/40 rounded px-1 select-none py-0.5">
                              {[3, 8, 11, 4, 12, 6, 14, 5, 10, 3, 7].map((h, i) => (
                                <span key={i} className="flex-1 bg-indigo-500 rounded-sm" style={{ height: `${h * 6}%` }}></span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Hover Emojis reactions panel container */}
                      <div className="flex items-center gap-1.5 mt-1 border-t border-slate-950 pt-1">
                        {/* Render existing react counters */}
                        {Object.entries(m.reactions).map(([emo, val]) => (
                          <button
                            key={emo}
                            onClick={() => addReaction(m.id, emo)}
                            className="bg-black/40 hover:bg-black border border-slate-850 px-1 py-0.1 rounded text-[7.5px] flex items-center gap-1 font-bold"
                          >
                            <span>{emo}</span>
                            <span className="text-emerald-400 scale-[0.9]">{val}</span>
                          </button>
                        ))}

                        {/* Interactive reaction pickers on bubble */}
                        <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-1 bg-slate-950 border border-slate-850 rounded px-1.5 scale-90 py-0.2 ml-auto">
                          {["👍", "🔥", "🚀", "🚨", "🤯"].map((emo) => (
                            <button
                              key={emo}
                              onClick={() => addReaction(m.id, emo)}
                              className="hover:scale-125 transition-transform"
                              type="button"
                            >
                              {emo}
                            </button>
                          ))}
                          <button
                            onClick={() => setReplyMessage(m)}
                            className="hover:scale-125 transition-transform text-slate-500 hover:text-emerald-400 ml-1 border-l border-slate-800 pl-1"
                            title="Reply to message"
                            type="button"
                          >
                            <CornerUpLeft className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 3. RICH TEXTAREA ENTRY DRAWER */}
          <div className="border-t border-slate-800 pt-1.5 shrink-0 select-none flex flex-col gap-1.5">
            {/* Active self destruct status and reply preview indicators */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 px-1 bg-slate-950/40 border border-slate-900 rounded p-1">
              {/* Self-destruct setting clicker */}
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-rose-500" />
                <span className="text-[7.5px] text-slate-500 font-bold uppercase">SELF-DESTRUCT THREAD:</span>
                <div className="flex gap-1">
                  {([null, 5, 10, 30] as const).map((secs) => (
                    <button
                      key={secs || "off"}
                      onClick={() => setSelfDestructTimer(secs)}
                      className={`px-1 py-0.1 border rounded text-[6.5px] uppercase font-bold leading-none scale-95 ${
                        selfDestructTimer === secs
                          ? "bg-rose-950 text-rose-400 border-rose-900"
                          : "bg-slate-900 text-slate-600 border-transparent hover:border-slate-800"
                      }`}
                    >
                      {secs ? `${secs}s` : "OFF"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active reply to indicator */}
              {replyMessage && (
                <div className="flex items-center gap-1.5 text-[8px] bg-slate-920 border border-emerald-950 px-1 rounded transition-all">
                  <span className="text-emerald-400 uppercase font-black">REPLYING To:</span>
                  <span className="text-slate-400 truncate max-w-[130px] italic font-sans">{replyMessage.text}</span>
                  <button onClick={() => setReplyMessage(null)} className="text-red-500 ml-1 font-bold">✕</button>
                </div>
              )}
            </div>

            {/* Form messaging lines */}
            <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-1.5 items-center relative">
              {/* Attachment clips directory picker */}
              <button
                type="button"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className={`p-2 rounded border border-slate-850 hover:border-slate-700 hover:text-emerald-400 transition-all ${showAttachmentMenu ? "bg-emerald-950 text-emerald-400" : "bg-slate-955 text-slate-500"}`}
                title="Send multimedia file"
              >
                <Paperclip className="h-3.5 w-3.5" />
              </button>

              {showAttachmentMenu && (
                <div className="absolute bottom-10 left-0 bg-slate-950 border border-slate-850 rounded-md p-1.5 z-50 flex gap-2 shadow-2xl">
                  <button onClick={handleAttachImage} type="button" className="p-1.5 bg-slate-900 hover:bg-emerald-950 border border-slate-850 rounded flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-400 w-16">
                    <ImageIcon className="h-4 w-4" />
                    <span className="text-[6px] uppercase font-bold">Map Image</span>
                  </button>
                  <button onClick={handleAttachVideo} type="button" className="p-1.5 bg-slate-900 hover:bg-emerald-950 border border-slate-850 rounded flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-400 w-16">
                    <VideoIcon className="h-4 w-4" />
                    <span className="text-[6px] uppercase font-bold">Drone Clip</span>
                  </button>
                  <button onClick={handleAttachAudio} type="button" className="p-1.5 bg-slate-900 hover:bg-emerald-950 border border-slate-850 rounded flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-400 w-16">
                    <MicIcon className="h-4 w-4" />
                    <span className="text-[6px] uppercase font-bold">Voice Note</span>
                  </button>
                </div>
              )}

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Secure cipher message... (e.g. 43Q LD 51928 12845)"
                className="flex-1 bg-slate-950 border border-slate-850 text-white rounded px-2.5 py-1.5 text-[10px] focus:border-emerald-500 outline-none uppercase font-mono tracking-wide"
              />

              <button
                type="submit"
                className="p-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 rounded hover:text-white transition-all flex items-center justify-center shrink-0 w-10 active:scale-95 shadow-md"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
