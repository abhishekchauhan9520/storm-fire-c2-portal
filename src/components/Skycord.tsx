import React, { useState, useEffect, useRef } from "react";
import { 
  Compass, 
  Play, 
  Pause,
  Tv, 
  MapPin, 
  Target, 
  Users, 
  Activity, 
  Clock, 
  Volume2, 
  Mic, 
  MicOff, 
  Radio, 
  FileText, 
  Plus, 
  ShieldAlert, 
  UserCheck, 
  Upload, 
  Edit3, 
  Bookmark, 
  Layers, 
  Share2, 
  RefreshCw, 
  Database,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Eye,
  Sliders,
  AlertTriangle,
  FolderOpen,
  Image as ImageIcon,
  Video as VideoIcon,
  CheckCircle2,
  Lock
} from "lucide-react";

interface Participant {
  name: string;
  role: "OPERATOR" | "ANALYST" | "SUPERVISOR" | "COMMANDER";
  status: "ONLINE" | "STANDBY" | "OFFLINE";
  avatar: string;
}

interface SharedAsset {
  id: string;
  name: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT" | "NOTE";
  url?: string;
  timestamp: string;
  taggedCoords?: string;
}

interface TargetTicket {
  id: string; // e.g. Target #104
  location: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  status: "DETECTED" | "TRACKING" | "CONFIRMED" | "ENGAGED";
  comments: Array<{
    author: "Operator" | "Analyst" | "Lead" | "User";
    text: string;
    timestamp: string;
  }>;
  history: string[];
}

interface ActivityEvent {
  id: string;
  time: string;
  text: string;
  type: "INFO" | "MARKER" | "ASSET" | "STATUS";
}

interface DroneFeed {
  id: string;
  name: string;
  altitude: number;
  battery: number;
  coordinates: string;
  url: string;
  isRecording: boolean;
  recordingSeconds: number;
  group: "RECON_SQUAD" | "TACTICAL_STRIKE" | "THERMAL_SURV";
}

interface Mission {
  id: string;
  name: string;
  status: "ACTIVE" | "STANDBY" | "ARCHIVED";
  location: string;
  participants: Participant[];
  assets: SharedAsset[];
  targets: TargetTicket[];
  timeline: ActivityEvent[];
  feeds: DroneFeed[];
}

export default function Skycord({
  onAddLog,
  himalayanOps = false
}: {
  onAddLog?: (log: { source: string; type: "ALERT" | "INFO" | "SUCCESS" | "WARNING"; message: string }) => void;
  himalayanOps?: boolean;
}) {
  // Preset rich database representing missions built around operations
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: "m-1",
      name: "OPERATION EAGLE",
      status: "ACTIVE",
      location: "Ladakh Glacier Sector-4",
      participants: [
        { name: "Sgt. Raghav", role: "OPERATOR", status: "ONLINE", avatar: "R" },
        { name: "Capt. Vyas", role: "ANALYST", status: "ONLINE", avatar: "V" },
        { name: "Col. K. Singh", role: "SUPERVISOR", status: "ONLINE", avatar: "S" },
        { name: "Gen. R. Iyer", role: "COMMANDER", status: "ONLINE", avatar: "I" }
      ],
      feeds: [
        { id: "feed-1", name: "STRIX SCANNER Scout 01", altitude: 4800, battery: 94, coordinates: "34.2255° N, 77.4201° E", url: "Live Stream Delta", isRecording: true, recordingSeconds: 312, group: "RECON_SQUAD" },
        { id: "feed-2", name: "GHATAK Strike Wingman", altitude: 3100, battery: 100, coordinates: "34.1522° N, 77.5756° E", url: "Live Stream Gamma", isRecording: false, recordingSeconds: 0, group: "TACTICAL_STRIKE" },
        { id: "feed-3", name: "HERON Patrol High-Alt", altitude: 6200, battery: 85, coordinates: "34.1920° N, 77.3101° E", url: "Live Sentry Alpha", isRecording: false, recordingSeconds: 0, group: "THERMAL_SURV" }
      ],
      assets: [
        { id: "as-1", name: "Pre-Strike_Recon_Sector4.png", type: "IMAGE", timestamp: "12:05:10", taggedCoords: "43Q LD 51928 12845" },
        { id: "as-2", name: "Drone_Valley_Scan_Thermal.avi", type: "VIDEO", timestamp: "12:08:45" },
        { id: "as-3", name: "Ladakh_Sector4_Atmospherics.pdf", type: "DOCUMENT", timestamp: "11:50:00" },
        { id: "as-4", name: "Forward runway camouflage detected", type: "NOTE", timestamp: "12:12:15" }
      ],
      targets: [
        {
          id: "Target #104",
          location: "43Q LD 51928 12845",
          priority: "CRITICAL",
          status: "TRACKING",
          comments: [
            { author: "Operator", text: "Possible vehicle spotted hiding behind ridge structure.", timestamp: "12:05" },
            { author: "Analyst", text: "Confirmed truck with logistical fuel supply canisters.", timestamp: "12:10" },
            { author: "Lead", text: "Continue tracking. Priming artillery battery units.", timestamp: "12:14" }
          ],
          history: [
            "12:01 - Ticket generated via automatic satellite anomaly detection",
            "12:05 - Operator Sgt. Raghav focused high-definition thermal zoom camera",
            "12:10 - Analyst Capt. Vyas annotated logistics profiles to ticket"
          ]
        },
        {
          id: "Target #105",
          location: "43Q LD 52010 12790",
          priority: "HIGH",
          status: "DETECTED",
          comments: [
            { author: "Operator", text: "Cold thermal trace from bunker ventilation shaft.", timestamp: "12:08" }
          ],
          history: ["12:08 - Sector-4 early warnings generated radar signature"]
        }
      ],
      timeline: [
        { id: "t-1", time: "12:01", text: "Operation Eagle Active Feed Started", type: "INFO" },
        { id: "t-2", time: "12:05", text: "Thermal Object Marked as Potential Threat #104", type: "MARKER" },
        { id: "t-3", time: "12:07", text: "Screenshot Saved: Sector4_ValleyScan_L4", type: "ASSET" },
        { id: "t-4", time: "12:12", text: "Analyst Comment Attached to Target #104", type: "INFO" },
        { id: "t-5", time: "12:14", text: "Shakti Battery Units Status: Standby Locks Approved", type: "STATUS" }
      ]
    },
    {
      id: "m-2",
      name: "OPERATION SNOW LEOPARD",
      status: "STANDBY",
      location: "Siachen Northern Foothills",
      participants: [
        { name: "Pvt. Naidu", role: "OPERATOR", status: "STANDBY", avatar: "N" },
        { name: "Lt. Amit", role: "ANALYST", status: "STANDBY", avatar: "A" }
      ],
      feeds: [
        { id: "feed-4", name: "THERMAL SENTRY Ridge patrol", altitude: 5100, battery: 72, coordinates: "35.1210° N, 76.8900° E", url: "Ridge Patrol Sentry", isRecording: false, recordingSeconds: 0, group: "THERMAL_SURV" }
      ],
      assets: [
        { id: "as-4", name: "Glacier_Crevasse_Chart.pdf", type: "DOCUMENT", timestamp: "10:30:00" }
      ],
      targets: [
        {
          id: "Target #98",
          location: "43R MD 12055 98120",
          priority: "MEDIUM",
          status: "DETECTED",
          comments: [{ author: "Operator", text: "Slight foot traffic footprint track.", timestamp: "10:14" }],
          history: ["10:14 - Discovered during routine border foot patrol correlation"]
        }
      ],
      timeline: [
        { id: "t-6", time: "10:00", text: "Operation Snow Leopard designated standby theater", type: "INFO" }
      ]
    }
  ]);

  const [activeMissionId, setActiveMissionId] = useState("m-1");
  const activeMission = missions.find(m => m.id === activeMissionId) || missions[0];

  const [activeFeedId, setActiveFeedId] = useState<string>("feed-1");
  const activeFeed = activeMission.feeds.find(f => f.id === activeFeedId) || activeMission.feeds[0];

  const [selectedTargetId, setSelectedTargetId] = useState<string>("Target #104");
  const activeTarget = activeMission.targets.find(t => t.id === selectedTargetId) || activeMission.targets[0] || null;

  const [feedFilter, setFeedFilter] = useState<"ALL" | "RECON_SQUAD" | "TACTICAL_STRIKE" | "THERMAL_SURV">("ALL");
  const [multiFeedGrid, setMultiFeedGrid] = useState(false);

  // Replay System States
  const [replayTime, setReplayTime] = useState<number>(100); // 100 = Live, lower = historical minutes
  const [isReplaying, setIsReplaying] = useState(false);

  // Multimedia and annotation states
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; name: string; url: string; tags: string[]; annotationPins: { x: number; y: number; label: string }[] }>>([
    {
      id: "img-ref-1",
      name: "Pre-Strike Recon.png",
      url: "pre_strike_recon",
      tags: ["Ladakh4", "Target#104"],
      annotationPins: [
        { x: 42, y: 35, label: "Hostile Truck Profile" },
        { x: 68, y: 52, label: "Camouflage Mesh Netting" }
      ]
    },
    {
      id: "img-ref-2",
      name: "BDA_Post_Strike.png",
      url: "bda_post_strike",
      tags: ["Sector4_BDA"],
      annotationPins: [
        { x: 45, y: 38, label: "Impact Crater" }
      ]
    }
  ]);

  const [activeCompareMode, setActiveCompareMode] = useState(false);
  const [annotationLabel, setAnnotationLabel] = useState("");
  const [activeUploadDrag, setActiveUploadDrag] = useState(false);

  // Voice rooms collaboration states
  const [activeVoiceRoom, setActiveVoiceRoom] = useState<"MISSION_ROOM" | "OPERATIONS_ROOM" | "COMMAND_ROOM">("MISSION_ROOM");
  const [pttActive, setPttActive] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [recordedVoiceNotes, setRecordedVoiceNotes] = useState<Array<{ id: string; duration: string; timestamp: string }>>([
    { id: "vr-1", duration: "0:14", timestamp: "11:45" },
    { id: "vr-2", duration: "0:28", timestamp: "12:02" }
  ]);

  // General Inputs
  const [generalNoteInput, setGeneralNoteInput] = useState("");
  const [targetCommentInput, setTargetCommentInput] = useState("");

  // Simulated recording clock ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setMissions(prevMissions => 
        prevMissions.map(m => {
          return {
            ...m,
            feeds: m.feeds.map(f => {
              if (f.isRecording) {
                return { ...f, recordingSeconds: f.recordingSeconds + 1 };
              }
              return f;
            })
          };
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds into MM:SS
  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Add Comment on Active target
  const handleAddTargetComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCommentInput.trim() || !activeTarget) return;

    const time = new Date().toLocaleTimeString().slice(0, 5);
    const newComment = {
      author: "User" as const,
      text: targetCommentInput,
      timestamp: time
    };

    setMissions(prevMissions => 
      prevMissions.map(m => {
        if (m.id === activeMissionId) {
          return {
            ...m,
            targets: m.targets.map(t => {
              if (t.id === selectedTargetId) {
                return {
                  ...t,
                  comments: [...t.comments, newComment],
                  history: [...t.history, `${time} - Comment added by Supervisor (You): "${targetCommentInput}"`]
                };
              }
              return t;
            })
          };
        }
        return m;
      })
    );

    setTargetCommentInput("");
    if (onAddLog) {
      onAddLog({
        source: "SKYCORD CORE",
        type: "SUCCESS",
        message: `SKYCORD TARGET WORKSPACE: Added comment to ${selectedTargetId}: "${newComment.text}"`
      });
    }
  };

  // Attach a general note to the mission assets
  const handleAddGeneralNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generalNoteInput.trim()) return;

    const time = new Date().toLocaleTimeString();
    const newNote: SharedAsset = {
      id: `as-${Date.now()}`,
      name: generalNoteInput,
      type: "NOTE",
      timestamp: time
    };

    const newTimelineEvent: ActivityEvent = {
      id: `t-${Date.now()}`,
      time: time.slice(0, 5),
      text: `General Note Attached: ${generalNoteInput.slice(0, 30)}...`,
      type: "ASSET"
    };

    setMissions(prevMissions => 
      prevMissions.map(m => {
        if (m.id === activeMissionId) {
          return {
            ...m,
            assets: [...m.assets, newNote],
            timeline: [...m.timeline, newTimelineEvent]
          };
        }
        return m;
      })
    );

    setGeneralNoteInput("");
    if (onAddLog) {
      onAddLog({
        source: "SKYCORD COMMS",
        type: "INFO",
        message: `Created notes memo inside ${activeMission.name}: "${generalNoteInput.slice(0, 40)}" attached.`
      });
    }
  };

  // Change active flight target status
  const handleChangeTargetStatus = (status: TargetTicket["status"]) => {
    if (!activeTarget) return;
    const time = new Date().toLocaleTimeString().slice(0, 5);

    const newTimelineEvent: ActivityEvent = {
      id: `t-${Date.now()}`,
      time,
      text: `Target Ticket ${activeTarget.id} status modified to: ${status}`,
      type: "STATUS"
    };

    setMissions(prevMissions => 
      prevMissions.map(m => {
        if (m.id === activeMissionId) {
          return {
            ...m,
            targets: m.targets.map(t => {
              if (t.id === selectedTargetId) {
                return {
                  ...t,
                  status,
                  history: [...t.history, `${time} - Status updated to ${status} by commandant`]
                };
              }
              return t;
            }),
            timeline: [...m.timeline, newTimelineEvent]
          };
        }
        return m;
      })
    );

    if (onAddLog) {
      onAddLog({
        source: "SKYCORD C2",
        type: "SUCCESS",
        message: `TACTICAL TICKET: target status updated -> ${selectedTargetId} state is now ${status}.`
      });
    }
  };

  // Bookmark active feed status
  const handleBookmarkCurrentFrame = () => {
    const time = new Date().toLocaleTimeString();
    const timestampTag = `Frame_Bookmark_${time.replace(/:/g, "")}`;
    const newNote: SharedAsset = {
      id: `as-${Date.now()}`,
      name: `Bookmarked live feed segment: ${activeFeed.name} at coordinates: ${activeFeed.coordinates}`,
      type: "NOTE",
      timestamp: time
    };

    setMissions(prevMissions => 
      prevMissions.map(m => {
        if (m.id === activeMissionId) {
          return {
            ...m,
            assets: [...m.assets, newNote],
            timeline: [...m.timeline, { id: `t-${Date.now()}`, time: time.slice(0, 5), text: `Feed Bookmarked: ${activeFeed.name}`, type: "ASSET" }]
          };
        }
        return m;
      })
    );

    if (onAddLog) {
      onAddLog({
        source: "SKYCORD SENTRY",
        type: "SUCCESS",
        message: `SENSORY RECORD: Bookmarked current frame of ${activeFeed.name}. Coordinates registered.`
      });
    }
  };

  // Handle local drawing on image annotations
  const handleImageAnnotationClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, imgId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const label = annotationLabel.trim() || `Marked coordinates point [X:${x} Y:${y}]`;

    setUploadedImages(prev => 
      prev.map(img => {
        if (img.id === imgId) {
          return {
            ...img,
            annotationPins: [...img.annotationPins, { x, y, label }]
          };
        }
        return img;
      })
    );

    setAnnotationLabel("");

    if (onAddLog) {
      onAddLog({
        source: "SKYCORD INTEL",
        type: "SUCCESS",
        message: `Tactical annotation pin dispatched to image matrix [Location: ${x}%, ${y}%]. Labelled: "${label}"`
      });
    }
  };

  // Simulated Voice Note Dispatch
  const handleStartVoiceRecording = () => {
    if (isVoiceRecording) {
      // stop recording and add to queue
      setIsVoiceRecording(false);
      const randSeedSecs = Math.floor(Math.random() * 25) + 5;
      const duration = `0:${randSeedSecs < 10 ? "0" : ""}${randSeedSecs}`;
      const time = new Date().toLocaleTimeString().slice(0, 5);

      setRecordedVoiceNotes(prev => [
        { id: `vr-${Date.now()}`, duration, timestamp: time },
        ...prev
      ]);

      if (onAddLog) {
        onAddLog({
          source: "VOICE ROOMS",
          type: "SUCCESS",
          message: `VOICE BRIEFING dispatch: Captured and saved vocal memo: ${duration} seconds.`
        });
      }
    } else {
      setIsVoiceRecording(true);
    }
  };

  // Toggling drone feed recording state
  const handleToggleFeedRecording = (feedId: string) => {
    setMissions(prevMissions => 
      prevMissions.map(m => {
        if (m.id === activeMissionId) {
          return {
            ...m,
            feeds: m.feeds.map(f => {
              if (f.id === feedId) {
                const nextRec = !f.isRecording;
                onAddLog?.({
                  source: "SKYCORD UAV",
                  type: nextRec ? "WARNING" : "SUCCESS",
                  message: nextRec 
                    ? `DRONE RECORDER: Started high-definition video capture transmission for ${f.name}.`
                    : `DRONE RECORDER: Finished video capture for ${f.name}. File compiled and archived.`
                });
                return {
                  ...f,
                  isRecording: nextRec,
                  recordingSeconds: nextRec ? 0 : f.recordingSeconds
                };
              }
              return f;
            })
          };
        }
        return m;
      })
    );
  };

  const filteredFeeds = activeMission.feeds.filter(f => feedFilter === "ALL" || f.group === feedFilter);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-2xl flex flex-col font-mono text-xs text-slate-350 relative min-h-[580px] overflow-hidden select-none gap-4">
      
      {/* 1. SKYCORD OPERATIONS CENTRAL CONTROLLER HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#1e1b4b] p-2 border border-indigo-800 rounded flex items-center justify-center">
            <Compass className="h-5 w-5 text-indigo-400 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-white font-black uppercase tracking-widest">
                SKYCORD OPERATIONS CORE
              </span>
              <span className="bg-indigo-950 text-indigo-400 border border-indigo-900 text-[7px] font-bold px-1.5 py-0.5 rounded uppercase">
                COORDINATION-CENTRIC C2
              </span>
            </div>
            <span className="text-[8.5px] text-slate-500 block uppercase">
              Mission Rooms • UAV Sensor Feed Center • Tactical Target Ticketing • Shared Asset Archives
            </span>
          </div>
        </div>

        {/* Global Mission Select Dashboard Toggles */}
        <div className="flex items-center gap-2">
          <span className="text-[7.5px] text-slate-500 font-bold uppercase">SELECT MISSION ROOM:</span>
          <div className="flex gap-1.5">
            {missions.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  setActiveMissionId(m.id);
                  const firstFeed = m.feeds[0];
                  if (firstFeed) setActiveFeedId(firstFeed.id);
                  const firstTarget = m.targets[0];
                  if (firstTarget) setSelectedTargetId(firstTarget.id);
                  onAddLog?.({
                    source: "SKYCORD",
                    type: "INFO",
                    message: `TACTICAL RE-ROUTE: Commandant established gateway tunnel to Room: [${m.name}]`
                  });
                }}
                className={`px-3 py-1.5 border rounded font-black text-[9px] uppercase tracking-wide transition-all ${
                  activeMissionId === m.id
                    ? "bg-indigo-955 border-[#6366f1] text-indigo-100 shadow-[0_0_8px_rgba(99,102,241,0.2)]"
                    : "bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-500 hover:text-slate-350"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CHATLESS OPERATIONS PANEL LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch overflow-hidden">
        
        {/* PANEL A: LEFT ASPECT SATELLITE (xl:col-span-3) - MISSION LIST / PARTICIPANTS / VOICE CHANNELS */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          
          {/* Section A1: Active Mission Details & Participants */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex flex-col gap-2.5">
            <div className="flex justify-between items-center border-b border-slate-850 pb-2">
              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Mission Blueprint</span>
              <span className={`text-[7px] font-black px-1.5 rounded uppercase ${activeMission.status === "ACTIVE" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900" : "bg-amber-950/45 text-amber-500"}`}>
                {activeMission.status}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">COGNITIVE AREA:</span>
                <span className="text-white uppercase font-black">{activeMission.location}</span>
              </div>
            </div>

            {/* Participants Board with precise military roles */}
            <div className="mt-1 flex flex-col gap-1.5">
              <span className="text-[7.5px] text-slate-500 font-black uppercase tracking-wider block">Authorized Session Participants</span>
              <div className="grid grid-cols-1 gap-1.5">
                {activeMission.participants.map((part, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900 border border-slate-850 rounded p-1.5">
                    <div className="flex items-center gap-2 truncate">
                      <div className="h-5 w-5 rounded bg-indigo-900 text-indigo-200 border border-indigo-750 flex items-center justify-center font-black text-[9px] uppercase">
                        {part.avatar}
                      </div>
                      <div>
                        <span className="text-slate-205 text-[9.5px] font-bold block leading-none">{part.name}</span>
                        <span className="text-[6.5px] text-slate-500 leading-none mt-1 block font-black">{part.role}</span>
                      </div>
                    </div>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" title="Secure link verified" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section A2: Voice Collaboration Command Center */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-850 pb-2">
              <span className="text-[9px] text-[#38bdf8] font-bold uppercase tracking-wider">Voice Collaboration</span>
              <Volume2 className="h-3.5 w-3.5 text-sky-400" />
            </div>

            {/* Voice room selection selectors */}
            <div className="grid grid-cols-3 gap-1">
              {(["MISSION_ROOM", "OPERATIONS_ROOM", "COMMAND_ROOM"] as const).map(vRoom => (
                <button
                  key={vRoom}
                  onClick={() => {
                    setActiveVoiceRoom(vRoom);
                    onAddLog?.({
                      source: "SKYCORD COMMS",
                      type: "SUCCESS",
                      message: `Joined voice node: ${vRoom.replace("_", " ")}`
                    });
                  }}
                  className={`py-1 rounded text-[7px] border font-black uppercase tracking-tighter text-center leading-none ${
                    activeVoiceRoom === vRoom
                      ? "bg-sky-950/30 border-sky-600 text-sky-400"
                      : "bg-slate-900 border-transparent text-slate-500 hover:text-slate-350"
                  }`}
                >
                  {vRoom.split("_")[0]}
                </button>
              ))}
            </div>

            {/* Push To Talk (PTT) interface button */}
            <div className="flex flex-col gap-2">
              <button
                onMouseDown={() => {
                  setPttActive(true);
                  onAddLog?.({ source: "COMMS TRANSMIT", type: "SUCCESS", message: "PTT: Live voice transmission active inside room." });
                }}
                onMouseUp={() => setPttActive(false)}
                className={`w-full py-2 border rounded font-black text-[10px] uppercase transition-all select-none text-center ${
                  pttActive
                    ? "bg-emerald-950/50 border-emerald-600 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.15)] scale-[0.98]"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                }`}
              >
                {pttActive ? "● PUSH-TO-TALK ACTIVE" : "HOLD TO SPEECH (PTT)"}
              </button>
              <span className="text-[6.5px] text-slate-550 block text-center leading-normal uppercase">
                PTT blocks unwanted ambient noise leakage to battle teams.
              </span>
            </div>

            {/* Voice Notes dispatchers & recording tool */}
            <div className="border-t border-slate-850 pt-2 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[7px] text-slate-500 font-bold block">
                <span>COMMS BRIEFINGS CLIPBOARD</span>
                <span className="text-slate-650 bg-slate-900 px-1 rounded">AAC COGNITIVE</span>
              </div>

              <div className="flex gap-1.5 items-center">
                <button
                  onClick={handleStartVoiceRecording}
                  className={`flex-1 py-1 px-2 border rounded font-bold text-[8.5px] uppercase flex items-center justify-center gap-1.5 ${
                    isVoiceRecording
                      ? "bg-red-950 text-red-400 border-red-800 animate-pulse"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isVoiceRecording ? "bg-red-500" : "bg-slate-500"}`} />
                  {isVoiceRecording ? "STOP RECORDING" : "RECORD BRIEFING"}
                </button>
              </div>

              {/* Playback Voice Notes waveform logs queue */}
              <div className="flex flex-col gap-1 max-h-[70px] overflow-y-auto scrollbar-none">
                {recordedVoiceNotes.map((note, idx) => (
                  <div key={note.id} className="bg-slate-900 border border-slate-850 rounded p-1 flex items-center justify-between text-[7px]">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                      <Mic className="h-3 w-3 text-indigo-400 animate-pulse" />
                      <span>BRIEFING_{note.id.split("-")[1]?.slice(-4) || idx} ({note.duration})</span>
                    </div>
                    <span className="text-slate-600 font-extrabold">{note.timestamp} PM</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* PANEL B: MIDDLE ASPECT HIGH-SPECTRUM (xl:col-span-6) - DRONE VIDEO WALLS / SHARDS MAP */}
        <div className="xl:col-span-6 flex flex-col gap-4">
          
          {/* Feed Filter groups switch bar */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-[8px] text-slate-500 font-extrabold uppercase">Drone Filters:</span>
              <div className="flex gap-1">
                {(["ALL", "RECON_SQUAD", "TACTICAL_STRIKE", "THERMAL_SURV"] as const).map(grp => (
                  <button
                    key={grp}
                    onClick={() => setFeedFilter(grp)}
                    className={`px-2 py-0.5 border rounded-sm text-[7px] font-black uppercase leading-none ${
                      feedFilter === grp
                        ? "bg-indigo-950 border-indigo-700 text-indigo-300"
                        : "bg-slate-900 border-transparent text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    {grp.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Split multi uav toggle button */}
            <button
              onClick={() => {
                setMultiFeedGrid(!multiFeedGrid);
                onAddLog?.({
                  source: "SKYCORD CORE",
                  type: "INFO",
                  message: `UAV VISUALS: Toggled video compilation to ${!multiFeedGrid ? "Grid Multi-UAV screen" : "Focused Drone Feed view"}.`
                });
              }}
              className={`px-2 py-1 border rounded-md text-[7.5px] font-black uppercase flex items-center gap-1 transition-all ${
                multiFeedGrid 
                  ? "bg-[#0f172a] border-[#6366f1] text-[#a5b4fc]"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <Tv className="h-3 w-3" />
              {multiFeedGrid ? "Focus Selected Feed" : "Grid Multi-Drone View"}
            </button>
          </div>

          {/* Renders multi grids or focused feeds */}
          {multiFeedGrid ? (
            /* Multi-UAV split layout grid */
            <div className="grid grid-cols-2 gap-3 h-[290px] overflow-hidden">
              {filteredFeeds.slice(0, 4).map(feed => (
                <div key={feed.id} className="bg-slate-950 border border-slate-850 rounded p-2 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none opacity-50" />
                  
                  <div className="flex justify-between items-center z-10 bg-black/60 p-1 rounded-sm">
                    <span className="text-[7.5px] text-white font-bold block truncate max-w-[130px]">{feed.name}</span>
                    <span className="text-[6px] text-emerald-400 font-extrabold bg-emerald-950 px-1 border border-emerald-900 rounded-sm">LIVE</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center py-4 relative bg-slate-900/40">
                    <Radio className="h-5 w-5 text-indigo-500 animate-pulse mb-1.5" />
                    <span className="text-[7px] text-slate-450 block font-bold truncate tracking-widest">{feed.coordinates}</span>
                  </div>

                  <div className="flex justify-between items-center z-10 bg-slate-950/60 p-1 text-[6.5px]">
                    <span className="text-slate-500">ALT: {feed.altitude}m</span>
                    <span className="text-slate-500">BATTERY: {feed.battery}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Focus visual camera stream */
            <div className="flex flex-col gap-3">
              
              {/* Main UAV thermal visualizer portal wrapper */}
              <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 flex flex-col h-[280px] relative overflow-hidden select-none">
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none" />
                
                {/* Visual HUD overlay diagnostics bar */}
                <div className="flex justify-between items-center bg-black/55 p-1 px-2 rounded z-10 border border-slate-900 text-[8.5px]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[#38bdf8] font-black uppercase tracking-wider">{activeFeed.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600 uppercase font-bold text-[7px]">Azimuth:</span>
                      <span className="text-emerald-400 font-semibold">284.15°</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600 uppercase font-bold text-[7px]">Elevation:</span>
                      <span className="text-emerald-400 font-semibold">+12.44°</span>
                    </div>
                  </div>
                </div>

                {/* Simulated telemetry tracking window */}
                <div className="flex-grow flex flex-col items-center justify-center py-6 relative">
                  {/* Scope graphic indicators */}
                  <div className="absolute border border-indigo-500/20 h-32 w-32 rounded-full pointer-events-none animate-spin" style={{ animationDuration: "14s" }} />
                  <div className="absolute border border-indigo-500/10 h-16 w-16 rounded-full pointer-events-none" />
                  
                  {/* Replay indicator banner */}
                  {isReplaying ? (
                    <div className="absolute top-2 left-2 bg-indigo-950 border border-indigo-800 text-indigo-400 px-2 py-0.5 rounded text-[7.5px] font-black uppercase animate-pulse flex items-center gap-1">
                      <Clock className="h-3 w-3 text-indigo-400" />
                      <span>HISTORICAL REPLAY: -{100 - replayTime} MINS</span>
                    </div>
                  ) : (
                    <div className="absolute top-2 left-2 bg-slate-900/80 border border-slate-850 text-slate-500 px-2 py-0.5 rounded text-[7px] font-medium uppercase">
                      <span>STABLE COMMS LINK (LIVE)</span>
                    </div>
                  )}

                  <Tv className="h-8 w-8 text-indigo-400 animate-pulse mb-2 z-10" />
                  
                  {isReplaying ? (
                    <span className="text-[10px] font-black text-rose-400 text-center leading-normal z-10 uppercase tracking-widest animate-pulse">REPLAY ARCHIVED CACHE STREAM</span>
                  ) : (
                    <span className="text-[10px] font-black text-white text-center leading-normal z-10 uppercase tracking-widest">OPTICAL VIDEO SCAN FEED ACTIVE</span>
                  )}
                  
                  <span className="text-slate-500 text-[8px] mt-0.5 z-10 font-bold">{activeFeed.coordinates} • UAV ALT: {activeFeed.altitude}m</span>

                  {/* Visual sweep scanning line */}
                  <div className="absolute bottom-1 right-2 bg-slate-950/80 border border-slate-900 px-2 py-0.5 text-indigo-400 rounded-sm font-black text-[7.5px] uppercase">
                    MGRS: 43Q LD 51928 12845
                  </div>
                </div>

                {/* Sub-feed video status sliders / bookmarks controls */}
                <div className="bg-black/60 p-2 rounded-t-none border-t border-slate-850/65 z-10 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex gap-2.5 items-center text-[7.5px]">
                    <button
                      onClick={() => handleToggleFeedRecording(activeFeed.id)}
                      className={`px-2 py-0.5 border rounded-sm font-black uppercase flex items-center gap-1 transition-all ${
                        activeFeed.isRecording
                          ? "bg-red-950 border-red-700 text-red-400 animate-pulse"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {activeFeed.isRecording ? <Pause className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
                      {activeFeed.isRecording ? `${formatSeconds(activeFeed.recordingSeconds)} REC` : "REC VIDEO"}
                    </button>

                    <button
                      onClick={handleBookmarkCurrentFrame}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 hover:text-indigo-400 rounded-sm font-bold uppercase flex items-center gap-1"
                    >
                      <Bookmark className="h-2.5 w-2.5" />
                      MEM Bookmark
                    </button>
                  </div>

                  {/* Replay seeker timeline slider */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-[7px] text-slate-500 font-extrabold uppercase">Feed Timeline Slider:</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={replayTime}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setReplayTime(val);
                        setIsReplaying(val < 98);
                        onAddLog?.({ source: "SKYCORD REPLAY", type: "INFO", message: val < 98 ? `Feed timelined back to -${100 - val} minutes.` : "Live visual stream synchronized." });
                      }}
                      className="accent-indigo-505 bg-slate-800 h-1.5 w-28 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => {
                        setReplayTime(100);
                        setIsReplaying(false);
                      }}
                      className="px-1.5 py-0.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-400 border border-indigo-900 rounded text-[6.5px] uppercase font-black"
                    >
                      GO LIVE
                    </button>
                  </div>
                </div>

              </div>

              {/* Drone select deck strip */}
              <div className="grid grid-cols-3 gap-2.5 shrink-0 select-none">
                {activeMission.feeds.map(f => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveFeedId(f.id);
                      onAddLog?.({
                        source: "SKYCORD SENSOR",
                        type: "INFO",
                        message: `Focused optical lens track onto ${f.name}.`
                      });
                    }}
                    className={`p-2 rounded border text-left flex flex-col justify-between gap-1 transition-all ${
                      activeFeedId === f.id
                        ? "bg-slate-950/70 border-indigo-700 text-white shadow-md"
                        : "bg-slate-950/40 border-slate-850 text-slate-500 hover:border-slate-800"
                    }`}
                  >
                    <span className="text-[8.5px] font-black tracking-wide truncate block">{f.name}</span>
                    <div className="flex justify-between items-center text-[6.5px] text-slate-550 leading-none">
                      <span>BAT: {f.battery}%</span>
                      <span>ALT: {f.altitude}m</span>
                    </div>
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* Section B2: Multimedia Area - Image Upload / Annotation Controls / Image Comparison */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-850 pb-2">
              <span className="text-[9px] text-[#22d3ee] font-bold uppercase tracking-wider flex items-center gap-1">
                <ImageIcon className="h-3.5 w-3.5 text-cyan-400" />
                Sovereign Recon Media & Annotation Center
              </span>

              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    setActiveCompareMode(!activeCompareMode);
                    onAddLog?.({
                      source: "SKYCORD COMPARE",
                      type: "SUCCESS",
                      message: !activeCompareMode ? "Activated Image Matrix Comparison Mode." : "Deactivated Comparison Mode."
                    });
                  }}
                  className={`px-2 py-0.5 border rounded-sm text-[7px] font-black uppercase transition-all ${
                    activeCompareMode
                      ? "bg-cyan-950 border-cyan-700 text-cyan-400"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  Split Compare Pre/Post
                </button>
              </div>
            </div>

            {/* Instruction block */}
            <span className="text-[7px] text-slate-500 block leading-normal uppercase">
              Click anywhere on the imagery grids below to place target overlays and coordinate annotation flags.
            </span>

            {activeCompareMode ? (
              /* Compare Pre vs Post Side by side grid container */
              <div className="grid grid-cols-2 gap-3 pb-1">
                {uploadedImages.slice(0, 2).map((img, idx) => (
                  <div key={img.id} className="flex flex-col gap-1.5">
                    <span className="text-[7.5px] text-indigo-400 font-extrabold uppercase text-center block bg-slate-900 border border-slate-850/60 p-0.5 rounded-sm">
                      {idx === 0 ? "Matrix A: Pre-Strike Recon" : "Matrix B: Post-Strike BDA"}
                    </span>
                    <div 
                      onClick={(e) => handleImageAnnotationClick(e, img.id)}
                      className="h-28 bg-slate-950 border border-slate-800 rounded relative cursor-crosshair flex items-center justify-center overflow-hidden"
                    >
                      <polyline points="0,56 120,56 240,56" fill="none" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="0.8" strokeDasharray="3,3" />
                      <VideoIcon className="h-6 w-6 text-slate-700/60" />
                      <span className="text-slate-700 font-bold block text-[8px] absolute">{img.name}</span>

                      {/* Render annotated tags */}
                      {img.annotationPins.map((pin, pidx) => (
                        <div 
                          key={pidx} 
                          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                          className="absolute h-2 w-2 bg-red-500 rounded-full border border-white -translate-x-1/2 -translate-y-1/2 group"
                          title={pin.label}
                        >
                          <span className="hidden group-hover:block absolute left-3 bg-black border border-slate-800 text-[6.5px] text-white p-1 rounded whitespace-nowrap z-50">
                            {pin.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Single focused annotation viewport */
              <div className="flex flex-col md:flex-row gap-3 py-1">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[7.5px] bg-[#0c4a6e]/20 border border-[#0369a1]/30 p-1.5 rounded text-sky-400 tracking-wider">
                    <span className="font-bold flex items-center gap-1">
                      <Bookmark className="h-3 w-3" />
                      INTERACTIVE DESK VISUAL: {uploadedImages[0]?.name}
                    </span>
                    <span className="font-extrabold bg-sky-950 border border-sky-800 rounded px-1">HD ENCODED</span>
                  </div>

                  <div 
                    onClick={(e) => uploadedImages[0] && handleImageAnnotationClick(e, uploadedImages[0].id)}
                    className="h-36 bg-slate-950 border border-slate-800 rounded relative cursor-crosshair flex flex-col items-center justify-center overflow-hidden"
                  >
                    {/* Decorative scopes */}
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none opacity-40" />
                    <polyline points="0,72 320,72" fill="none" stroke="rgba(99, 102, 241, 0.25)" strokeWidth="0.6" strokeDasharray="3,4" />
                    <polyline points="150,0 150,150" fill="none" stroke="rgba(99, 102, 241, 0.25)" strokeWidth="0.6" strokeDasharray="3,4" />
                    <ImageIcon className="h-7 w-7 text-indigo-950/80 pointer-events-none animate-pulse" />

                    {/* Rendering Pins placement overlay */}
                    {uploadedImages[0]?.annotationPins.map((pin, i) => (
                      <div
                        key={i}
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-0.5 bg-red-950 border border-red-500 rounded-full h-3 w-3 shadow-md animate-bounce group"
                      >
                        <MapPin className="h-2 w-2 text-red-400" />
                        <span className="absolute left-3 bg-slate-950 border border-slate-800 text-[6.5px] py-0.5 px-1.5 rounded-sm whitespace-nowrap text-red-300 font-extrabold shadow-xl z-20">
                          {pin.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Annotation configurations forms side input */}
                <div className="w-full md:w-44 bg-slate-900 border border-slate-850 p-2.5 rounded flex flex-col justify-between gap-2 shrink-0">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[7.5px] text-slate-500 font-bold uppercase block leading-none">Annotation Tag Memo</span>
                    <input
                      type="text"
                      value={annotationLabel}
                      onChange={(e) => setAnnotationLabel(e.target.value)}
                      placeholder="e.g. Hostile Truck profile"
                      className="bg-slate-950 border border-slate-800 text-white rounded text-[7.5px] p-1 uppercase focus:border-cyan-500 outline-none"
                    />
                    <span className="text-[6px] text-slate-600 leading-normal uppercase">
                      Enter memo above, then click on the left map coordinate image to deploy the pin instantly.
                    </span>
                  </div>

                  {/* Drag drop zone mock */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setActiveUploadDrag(true); }}
                    onDragLeave={() => setActiveUploadDrag(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setActiveUploadDrag(false);
                      onAddLog?.({ source: "SKYCORD CORE", type: "SUCCESS", message: "MULTIMEDIA: Successfully compiled uploaded tactical files to mission archives." });
                    }}
                    className={`border border-dashed p-2 bg-slate-950 text-center rounded flex flex-col items-center justify-center gap-1.5 transition-all outline-none ${
                      activeUploadDrag ? "border-sky-505 bg-sky-955/10" : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <Upload className="h-4 w-4 text-slate-500" />
                    <span className="text-[6.3px] text-slate-450 uppercase font-black tracking-wider leading-none">
                      Drag / Drop Media Files
                    </span>
                    <span className="text-[5.5px] text-slate-600 uppercase leading-none block">PDF / PNG / AVI</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* PANEL C: RIGHT ASPECT TICKETING ENGINE (xl:col-span-3) - TARGET TICKETS / TIMELINE logs */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          
          {/* Active Target Ticketing Desk Workspace */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex flex-col h-[340px] justify-between overflow-hidden gap-2.5">
            <div className="flex justify-between items-center border-b border-slate-850 pb-2 shrink-0">
              <span className="text-[9px] text-rose-400 font-black uppercase tracking-wider flex items-center gap-1">
                <Target className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                Sovereign Target Ticket Workspace
              </span>
              <span className="text-[#9ca3af] text-[7.5px] font-bold">2 IN QUEUE</span>
            </div>

            {/* Micro selection tickets switcher list */}
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 shrink-0 select-none scrollbar-none">
              {activeMission.targets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTargetId(ticket.id)}
                  className={`px-2 py-1 rounded border font-black text-[7.5px] uppercase tracking-wide shrink-0 transition-all ${
                    selectedTargetId === ticket.id
                      ? "bg-rose-955 border-rose-800 text-rose-300"
                      : "bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-350"
                  }`}
                >
                  🎯 {ticket.id}
                </button>
              ))}
            </div>

            {activeTarget ? (
              <div className="flex-grow flex flex-col justify-between overflow-hidden gap-2">
                
                {/* Scrollable ticket details and custom comments stream */}
                <div className="flex-grow overflow-y-auto pr-0.5 flex flex-col gap-2 scrollbar-none text-[8.2px] leading-relaxed select-text">
                  
                  {/* Info table */}
                  <div className="bg-slate-900 border border-slate-850 rounded p-1.5 flex flex-col gap-1 text-[7.8px] leading-normal uppercase">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Location:</span>
                      <span className="text-cyan-400 font-black tracking-wider">{activeTarget.location}</span>
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-slate-500 font-bold">Priority:</span>
                      <span className={`font-black ${activeTarget.priority === "CRITICAL" ? "text-red-500" : "text-amber-500"}`}>
                        {activeTarget.priority}
                      </span>
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-slate-500 font-bold">Category status:</span>
                      <span className="text-white font-extrabold bg-slate-950 border border-slate-800 rounded px-1 text-[7.5px]">
                        {activeTarget.status}
                      </span>
                    </div>
                  </div>

                  {/* Target ticketing sequential actions comments stream as specified */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[7.5px] text-indigo-400 font-black uppercase tracking-wider block">Target Collaboration Feeds</span>
                    {activeTarget.comments.map((cmt, cIdx) => (
                      <div key={cIdx} className="bg-slate-900/60 border border-slate-850 rounded p-1.5 flex flex-col gap-0.5">
                        <div className="flex justify-between items-center text-[7px]">
                          <span className={`font-extrabold uppercase ${
                            cmt.author === "Operator" ? "text-sky-450" : cmt.author === "Analyst" ? "text-[#38bdf8]" : "text-amber-400 font-black"
                          }`}>
                            {cmt.author === "Lead" ? "Lead (C2 Command)" : cmt.author === "User" ? "Self (Supervisor)" : `${cmt.author} Deck`}
                          </span>
                          <span className="text-slate-600 bg-slate-950 px-1 rounded-sm">{cmt.timestamp}</span>
                        </div>
                        <span className="text-slate-250 mt-0.5 font-sans break-words select-text text-[8.5px] leading-normal">{cmt.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Complete target log database history list */}
                  <div className="border-t border-slate-900/60 pt-2 flex flex-col gap-1.5">
                    <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider block">Target Audit History</span>
                    {activeTarget.history.map((hist, hIdx) => (
                      <div key={hIdx} className="text-slate-550 border-l border-slate-800 pl-1.5 text-[7px] italic break-words">
                        {hist}
                      </div>
                    ))}
                  </div>

                </div>

                {/* Ticket action interface control tools */}
                <div className="shrink-0 border-t border-slate-850 pt-1.5 flex flex-col gap-1.5 select-none font-mono">
                  <div className="flex items-center justify-between text-[7.5px]">
                    <span className="text-slate-500 font-bold uppercase text-[7px]">Update Status:</span>
                    <div className="flex gap-1 scale-[0.9] origin-right">
                      {(["TRACKING", "CONFIRMED", "ENGAGED"] as const).map(st => (
                        <button
                          key={st}
                          onClick={() => handleChangeTargetStatus(st)}
                          className={`px-1.5 py-0.5 border rounded text-[6.5px] font-bold uppercase ${
                            activeTarget.status === st
                              ? "bg-rose-950 border-rose-800 text-rose-400 font-black"
                              : "bg-slate-900 border-transparent text-slate-550 hover:text-slate-350"
                          }`}
                        >
                          {st[0] + st.slice(1, 4).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* target comment field */}
                  <form onSubmit={handleAddTargetComment} className="flex gap-1 bg-slate-950 border border-slate-850 rounded p-0.5">
                    <input
                      type="text"
                      value={targetCommentInput}
                      onChange={(e) => setTargetCommentInput(e.target.value)}
                      placeholder="Add collaboration note on target..."
                      className="flex-grow bg-transparent text-white rounded text-[7.5px] px-1 outline-none uppercase font-mono placeholder-slate-700"
                    />
                    <button type="submit" className="px-2 py-0.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 rounded text-rose-400 font-black text-[7px] uppercase">
                      ADD
                    </button>
                  </form>
                </div>

              </div>
            ) : (
              <div className="text-slate-650 text-center py-20 italic">No targets defined inside this mission parameters. Setup nodes.</div>
            )}
          </div>

          {/* Activity Timeline Log List & Note creator (bottom) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex flex-col h-[200px] justify-between overflow-hidden gap-2.5">
            <div className="flex justify-between items-center border-b border-slate-850 pb-2 shrink-0">
              <span className="text-[9px] text-[#a855f7] font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-purple-400" />
                Live Operational Activity Timeline
              </span>
              <Activity className="h-3.5 w-3.5 text-purple-500 animate-pulse" />
            </div>

            {/* Vertical sequential Timeline body */}
            <div className="flex-grow overflow-y-auto pr-0.5 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-slate-800 pb-1 shrink-0 select-text">
              {activeMission.timeline.map(evt => {
                const isMarker = evt.type === "MARKER";
                const isStatus = evt.type === "STATUS";
                const isAsset = evt.type === "ASSET";

                return (
                  <div key={evt.id} className="flex items-start gap-1 pb-1 border-b border-slate-900/40 text-[7.9px] leading-relaxed hover:bg-slate-900/50 rounded-sm">
                    <span className="text-slate-600 bg-slate-950 border border-slate-900 rounded font-black px-1 mr-1 scale-90 block shrink-0">{evt.time}</span>
                    <span className={`font-semibold shrink-0 uppercase border rounded px-0.5 text-[6.5px] scale-90 mr-0.5 block ${
                      isMarker 
                        ? "bg-red-950/20 border-red-900 text-red-500" 
                        : isStatus 
                          ? "bg-amber-950/20 border-amber-900 text-amber-500" 
                          : isAsset 
                            ? "bg-indigo-950/20 border-indigo-900 text-indigo-400" 
                            : "bg-slate-950 border-slate-850 text-slate-500"
                    }`}>
                      {evt.type}
                    </span>
                    <span className="text-slate-200 select-text">{evt.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick general note adder */}
            <form onSubmit={handleAddGeneralNote} className="flex gap-1 border-t border-slate-850 pt-1.5 shrink-0 select-none">
              <input
                type="text"
                value={generalNoteInput}
                onChange={(e) => setGeneralNoteInput(e.target.value)}
                placeholder="Append general operational note..."
                className="flex-grow bg-slate-900 border border-slate-850 text-white rounded px-1.5 py-0.5 text-[7px] outline-none placeholder-slate-650 uppercase font-mono"
              />
              <button type="submit" className="px-2 py-0.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-900 rounded text-indigo-300 font-bold text-[7px] uppercase">
                APPEND
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
