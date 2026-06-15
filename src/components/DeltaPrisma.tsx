import React, { useState, useEffect, useRef } from "react";
import { 
  Compass, 
  Clock, 
  Radio, 
  Activity, 
  BarChart2, 
  History, 
  Cpu, 
  Tv, 
  Lock, 
  Target, 
  Zap, 
  Flame,
  Shield,
  FileText,
  Menu,
  Sliders,
  CloudLightning,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  X,
  Gauge,
  Navigation
} from "lucide-react";

// Types
interface ActiveTrack {
  callsign: string;
  val1: number;
  pct: number;
  dist: string;
  isYellow?: boolean;
  isCyan?: boolean;
  isRed?: boolean;
  isGreen?: boolean;
}

interface ThreatItem {
  id: string;
  name: string;
  status: string;
  isCritical?: boolean;
  isWarning?: boolean;
  isMoving?: boolean;
}

interface FleetAsset {
  id: string;
  name: string;
  type: string;
  state: "ROUTE" | "STRIKE" | "COMPLETE" | "READY" | "DEGRADED" | "SIMULATION";
  battery: number;
  speed: string;
}

interface DeltaPrismaProps {
  onAddLog?: (log: { source: string; type: "ALERT" | "INFO" | "SUCCESS" | "WARNING"; message: string }) => void;
  himalayanOps?: boolean;
}

export default function DeltaPrisma({ onAddLog, himalayanOps = false }: DeltaPrismaProps) {
  // Tabs and Workflow Role Selectors
  const [activeRole, setActiveRole] = useState<"COMMANDER" | "PLANNER" | "ANALYST" | "OPERATOR">("OPERATOR");
  const [prismaTab, setPrismaTab] = useState<"UNIFIED_C2_DECK" | "CAMPAIGN_SUPERVISION" | "SECURITY_PROVENANCE">("UNIFIED_C2_DECK");

  // Local Hamburger Menu Dropdown State
  const [isHamMenuOpen, setIsHamMenuOpen] = useState(false);
  const [diagnosticMode, setDiagnosticMode] = useState(false);
  const [hardenedCrypto, setHardenedCrypto] = useState(true);

  // States for Rebuilt Mission Planner
  const [activeUavSelect, setActiveUavSelect] = useState("STRIX-X9 Recon");
  const [targetPayload, setTargetPayload] = useState("Thermobaric AP");
  const [weatherCondition, setWeatherCondition] = useState<"CLEAR" | "WINDY" | "STORMY">("CLEAR");
  const [flightAltitude, setFlightAltitude] = useState<number>(3500); // meters
  const [flightSpeed, setFlightSpeed] = useState<number>(180); // knots
  const [pathSmoothing, setPathSmoothing] = useState<boolean>(true);
  const [waypoints, setWaypoints] = useState<Array<{ x: number; y: number; seq: number; label: string }>>([
    { x: 28, y: 35, seq: 1, label: "LHD A09" },
    { x: 45, y: 56, seq: 2, label: "BOROVAYA" },
    { x: 58, y: 44, seq: 3, label: "POPASNA" },
    { x: 74, y: 65, seq: 4, label: "VOLYTSMSRAD" }
  ]);

  // Autopilot Simulation States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simWaypointIndex, setSimWaypointIndex] = useState(0);
  const [simPosition, setSimPosition] = useState<{ x: number; y: number } | null>(null);
  const [simProgress, setSimProgress] = useState(0); // 0 to 100 between waypoints
  const [simAltitude, setSimAltitude] = useState(3500);
  const [simSpeed, setSimSpeed] = useState(180);

  const [isUploadingPlan, setIsUploadingPlan] = useState(false);
  const [isSwarmCampaignActive, setIsSwarmCampaignActive] = useState(false);

  // Terminal Logs state initialized directly with values representing authentic telemetry info
  const [cliLogs, setCliLogs] = useState<Array<{ timestamp: string; tag: string; description: string; type: "INFO" | "WARN" | "ALERT" }>>([
    { timestamp: "23:07:31", tag: "ALERT", description: "ENEMY TANK COLUMN DETECTED   SECTOR: DEEP RIVER-12-   5  GRID: 47Q ZO 243.0", type: "ALERT" },
    { timestamp: "23:07:30", tag: "INFO", description: "TEMP SYNC: STARLINK-A 7 SATS   RTT 0021ms  PACKET LOSS 0.2%", type: "INFO" },
    { timestamp: "23:07:30", tag: "ALERT", description: "EVAC SIG: CIVILIAN AREA  GRID: 47T WC 884  PRIORITY: HIGH", type: "ALERT" },
    { timestamp: "23:07:29", tag: "INFO", description: "STRIKE PKG KAMIKAZE-09 STATUS: ENROUTE WP3  SPD: 420kts  ALT: 15,000ft", type: "INFO" },
    { timestamp: "23:07:28", tag: "WARN", description: "ARTY SHELLING IN SECTOR 475 UD 211: ETA: 02 | STATUS: NEUTRALIZED", type: "WARN" },
    { timestamp: "23:07:29", tag: "INFO", description: "BDAS STATUS: TARGET SA-15 RE-LOCK CON-84", type: "INFO" },
    { timestamp: "23:07:27", tag: "INFO", description: "DRONE LINK STABLE  LINK: VIPER-02  SAT: STARLINK-8  BAND: Ku", type: "INFO" },
    { timestamp: "23:07:27", tag: "INFO", description: "SIGS LOCK: TGT SA-15 FREQ 3.7 GHz @100E:ACTIVE", type: "INFO" },
    { timestamp: "23:07:26", tag: "INFO", description: "COMS NODE RELAY-03->NORE-07->MOOE-228-02 LAT 48.3922N/37.9823E LOSS 0.6dB", type: "INFO" },
    { timestamp: "23:07:25", tag: "WARN", description: "ENEMY EW ACTIVITY IN GRID 48L XC 289  LEVEL: HIGH", type: "WARN" },
    { timestamp: "23:07:25", tag: "INFO", description: "SCAN COMPLETE TIME WINDOW:05-0421 HEAT MAP: NEW CONTACTS 2", type: "INFO" }
  ]);

  const [userCommandInput, setUserCommandInput] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dataset from Left Map Sidebar: ACTIVE TRACKS
  const activeTracks: ActiveTrack[] = [
    { callsign: "STRIX-ALPHA-1", val1: 88, pct: 96, dist: "12m Live", isCyan: true },
    { callsign: "DRAGON-01", val1: 78, pct: 92, dist: "52m Live", isYellow: true },
    { callsign: "VIPER-02", val1: 63, pct: 91, dist: "120m Live", isCyan: true },
    { callsign: "PHANTOM-03", val1: 37, pct: 88, dist: "210m Live", isRed: true },
    { callsign: "RAVEN-04", val1: 90, pct: 93, dist: "43m Live", isGreen: true },
    { callsign: "STRIX-STORM", val1: 95, pct: 98, dist: "10m Live", isGreen: true },
    { callsign: "SCORPION-05", val1: 28, pct: 85, dist: "315m Live", isYellow: true },
    { callsign: "HELLFIRE-06", val1: 55, pct: 90, dist: "360m Live", isYellow: true },
    { callsign: "WRAITH-07", val1: 40, pct: 87, dist: "276m Live", isYellow: true }
  ];

  // Dataset from Right Sidebar Widget 1: THREATS
  const threats: ThreatItem[] = [
    { id: "THR-01", name: "SA-15 TOR", status: "TRACKING", isCritical: true },
    { id: "THR-02", name: "SA-22 GREYHOUND", status: "TRACKING", isCritical: true },
    { id: "THR-03", name: "BM-30 SMERCH", status: "HI-LOCK", isWarning: true },
    { id: "THR-04", name: "PANTSIR S1", status: "TRACKING", isCritical: true },
    { id: "THR-05", name: "MIG-31 AAA", status: "HI-LOCK", isWarning: true },
    { id: "THR-06", name: "ORLAN-10", status: "TRACKING", isCritical: true },
    { id: "THR-07", name: "T-90M", status: "MOVING", isMoving: true },
    { id: "THR-08", name: "T-80", status: "MOVING", isMoving: true }
  ];

  // Dataset from Right Sidebar Widget 3: FLEET STATUS
  const fleet: FleetAsset[] = [
    { id: "FL-1", name: "STRIX-01", type: "X9-LIGHT", state: "READY", battery: 98, speed: "UAV" },
    { id: "FL-2", name: "STRIX-02", type: "X9-HEAVY", state: "ROUTE", battery: 91, speed: "UAV" },
    { id: "FL-3", name: "STRIX-03", type: "V4-STERE", state: "READY", battery: 88, speed: "UAV" },
    { id: "FL-4", name: "STRIX-04", type: "KAMIKAZE", state: "READY", battery: 100, speed: "UAV" },
    { id: "FL-5", name: "STRIX-05", type: "DECOY", state: "DEGRADED", battery: 45, speed: "UAV" }
  ];

  // Spectrum waveform generator (Signal Chair widget)
  useEffect(() => {
    let animationId: number;
    let offset = 0;
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#4ade80"; // Emerald green
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i++) {
        const factor = diagnosticMode ? 3.0 : 1.5;
        const sine1 = Math.sin(i * 0.08 + offset) * 12 * Math.sin(offset * 0.5);
        const sine2 = Math.cos(i * 0.23 - offset) * 4 * Math.sin(offset);
        const noise = (Math.random() - 0.5) * (diagnosticMode ? 8 : 2);
        const y = canvas.height * 0.5 + sine1 + sine2 + noise;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      offset += diagnosticMode ? 0.15 : 0.05;
      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [diagnosticMode]);

  // Autopilot simulation loop handler
  useEffect(() => {
    let timer: any = null;
    if (isSimulating && waypoints.length > 0) {
      timer = setInterval(() => {
        setSimProgress((prev) => {
          if (prev >= 100) {
            // Move to next waypoint
            setSimWaypointIndex((prevIndex) => {
              const nextIndex = prevIndex + 1;
              if (nextIndex >= waypoints.length) {
                // Done Simulation
                setIsSimulating(false);
                if (onAddLog) {
                  onAddLog({
                    source: "STRIX SIMULATOR",
                    type: "SUCCESS",
                    message: `SIM COMPLETE: UAV successfully reached the final waypoint: ${waypoints[waypoints.length-1].label}.`
                  });
                }
                return 0;
              }
              const currentWp = waypoints[nextIndex];
              if (onAddLog) {
                onAddLog({
                  source: "STRIX TELEMETRY",
                  type: "INFO",
                  message: `SIM TELEMETRY: Arrived at WP ${currentWp.seq} [${currentWp.label}]. Airspeed holds ${flightSpeed}kts, altitude ${flightAltitude}m.`
                });
              }
              return nextIndex;
            });
            return 0;
          }
          return prev + 5; // progress pace
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [isSimulating, waypoints, flightSpeed, flightAltitude]);

  // Position calculation along waypoints for simulation
  useEffect(() => {
    if (waypoints.length === 0) {
      setSimPosition(null);
      return;
    }
    if (!isSimulating) {
      setSimPosition({ x: waypoints[0]?.x || 20, y: waypoints[0]?.y || 20 });
      return;
    }

    const currentWp = waypoints[simWaypointIndex];
    const nextWp = waypoints[simWaypointIndex + 1] || waypoints[0];

    if (!currentWp || !nextWp) return;

    const dx = nextWp.x - currentWp.x;
    const dy = nextWp.y - currentWp.y;
    const ratio = simProgress / 100;

    setSimPosition({
      x: currentWp.x + dx * ratio,
      y: currentWp.y + dy * ratio
    });

    // Handle small altitude & speed drift during simulation
    setSimAltitude(flightAltitude + Math.round(Math.sin(simProgress * 0.1) * 60));
    setSimSpeed(flightSpeed + Math.round(Math.cos(simProgress * 0.2) * 4));
  }, [simWaypointIndex, simProgress, isSimulating, waypoints, flightAltitude, flightSpeed]);

  const startSimulation = () => {
    if (waypoints.length === 0) {
      if (onAddLog) {
        onAddLog({
          source: "STRIX PLANNER",
          type: "WARNING",
          message: "SIM REGISTRY ERROR: No waypoints available. Click on the map to place flight points first."
        });
      }
      return;
    }
    setIsSimulating(true);
    setSimWaypointIndex(0);
    setSimProgress(0);
    if (onAddLog) {
      onAddLog({
        source: "STRIX PLANNER",
        type: "INFO",
        message: `FLIGHT SIMULATOR COLD-START: Running mission play for ${activeUavSelect} delivering ${targetPayload} under ${weatherCondition} rules.`
      });
    }
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setSimProgress(0);
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const nextSeq = waypoints.length + 1;
    setWaypoints((prev) => [
      ...prev,
      { x: xPct, y: yPct, seq: nextSeq, label: `WP_${nextSeq}` }
    ]);

    if (onAddLog) {
      onAddLog({
        source: "STRIX PLANNER",
        type: "SUCCESS",
        message: `WAYPOINT RECORDED: Marked point WP_${nextSeq} at coordinate mapping grid [${xPct}, ${yPct}].`
      });
    }
  };

  const handleClearWaypoints = () => {
    setWaypoints([]);
    setSimWaypointIndex(0);
    setSimProgress(0);
    setIsSimulating(false);
    if (onAddLog) {
      onAddLog({
        source: "STRIX PLANNER",
        type: "INFO",
        message: "STRIX WAYPOINT DESK CLEARED. Flightpath erased."
      });
    }
  };

  // Dispatch swarm visual campaign
  const launchSwarmCampaign = () => {
    setIsSwarmCampaignActive(true);
    if (onAddLog) {
      onAddLog({
        source: "STRIX CAMPAIGN",
        type: "ALERT",
        message: "COORDINATED UAV SWARM DISPATCH: 80 active digital decoys launched from Strix-05 host ship."
      });
    }
  };

  const resetSwarmCampaign = () => {
    setIsSwarmCampaignActive(false);
  };

  const uploadFlightPlan = () => {
    setIsUploadingPlan(true);
    if (onAddLog) {
      onAddLog({
        source: "STRIX UPLINK",
        type: "INFO",
        message: `UAV FLASH RE-WRITE: Synchronizing NVRAM on ${activeUavSelect}...`
      });
    }
    setTimeout(() => {
      setIsUploadingPlan(false);
      if (onAddLog) {
        onAddLog({
          source: "STRIX UPLINK",
          type: "SUCCESS",
          message: `SYNC COMPLETE: Flight profile registered. Encrypted signature verified.`
        });
      }
    }, 1200);
  };

  const handleShellCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCommandInput.trim()) return;

    const commandStr = userCommandInput.trim().toLowerCase();
    const ts = new Date().toLocaleTimeString();
    let reply = "PRISMA CLI: Unknown syntax or secure command. Access denied.";
    let responseType: "INFO" | "WARN" | "ALERT" = "WARN";

    if (commandStr.startsWith("strike")) {
      reply = "COMMAND ACCEPTED: Cued Pinaka thermal launchers on active waypoints sector.";
      responseType = "ALERT";
    } else if (commandStr === "status") {
      reply = "SYS REPORT: Secure Strix core active. Hardened cryptology ON. Decoy fleet STANDBY.";
      responseType = "INFO";
    } else if (commandStr === "clear") {
      setCliLogs([]);
      reply = "Telemetry terminal logs cleared successfully.";
      responseType = "INFO";
    } else if (commandStr.startsWith("altitude")) {
      const match = commandStr.match(/\d+/);
      const parsedAlt = match ? parseInt(match[0]) : 4500;
      setFlightAltitude(parsedAlt);
      reply = `METRICS MODIFIED: Targeted cruising altitude calibrated to ${parsedAlt} meters.`;
      responseType = "INFO";
    }

    setCliLogs((prev) => [
      { timestamp: ts, tag: "STRIX_SHELL", description: `strix@operator-console:~$ ${userCommandInput}`, type: "INFO" },
      { timestamp: ts, tag: "SYS_RESP", description: reply, type: responseType },
      ...prev
    ]);
    setUserCommandInput("");
  };

  return (
    <div className="bg-black border border-slate-900 rounded-lg p-3 shadow-2xl select-none flex flex-col font-mono text-[9px] text-slate-300 min-h-[700px] gap-2">
      
      {/* 1. STRIX SYSTEM HEADER BAR */}
      <header className="border-b border-slate-900 pb-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo brand */}
          <div className="flex items-center gap-2">
            <header className="flex items-center gap-2">
              <span className="text-[26px] font-sans font-black tracking-tighter text-red-500 leading-none">STRIX </span>
              <div className="h-6 w-[1.5px] bg-slate-800 self-center" />
              <div className="flex flex-col">
                <span className="text-[13px] font-black text-cyan-400 tracking-[0.3em] leading-none">STORM FIRE</span>
                <span className="text-[6.5px] text-slate-500 font-extrabold uppercase mt-0.5 leading-none">
                  SOVEREIGN COMBAT COORDINATION & RECON SYSTEMS
                </span>
                <span className="text-[6.5px] text-slate-500 font-extrabold uppercase leading-none">
                  SECURE ADVANCED RADAR // COP VISUALIZATION
                </span>
              </div>
            </header>
          </div>
        </div>

        {/* Center operational highlight flag */}
        <div className="border-2 border-red-800 p-1 px-4 text-center rounded bg-red-950/20 shrink-0">
          <span className="text-[10px] font-extrabold tracking-[0.25em] text-red-500 block leading-tight">
            OPERATION COMBAT STEALTH
          </span>
          <span className="text-[7.5px] font-bold text-slate-400 leading-none">
            STREAK CALIBRATION // PH-09 // SECTOR LADAKH4
          </span>
        </div>

        {/* Right Info and Local Hamburger controls dropdown */}
        <div className="flex items-center gap-3 shrink-0 relative">
          <div className="text-right hidden sm:block">
            <span className="text-cyan-400 font-extrabold text-[9px] block">
              SECURE CHOP V1.8
            </span>
            <span className="text-[6.5px] text-slate-500 font-bold block">
              OPERATOR CODE: STRX-99
            </span>
          </div>

          <div className="h-7 w-px bg-slate-800" />

          {/* LOCAL MODULE OPTIONS HAMBURGER MENU */}
          <button
            onClick={() => setIsHamMenuOpen(!isHamMenuOpen)}
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-cyan-400 font-extrabold rounded flex items-center gap-1 transition-all"
            title="Prisma Settings Menu"
          >
            <Menu className="h-3.5 w-3.5" />
            <span className="text-[7.5px]">STRIX SETUP</span>
          </button>

          {isHamMenuOpen && (
            <div className="absolute right-0 top-9 w-52 bg-slate-950 border border-slate-850 rounded-md p-2 z-50 shadow-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                <span className="text-[7.5px] text-slate-400 font-black uppercase">DIAGNOSTIC CONTROLS</span>
                <button onClick={() => setIsHamMenuOpen(false)} className="text-red-500"><X className="h-3 w-3" /></button>
              </div>

              <div className="flex flex-col gap-1.5 text-[8px]">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>SPECTRAL DIAGNOSTIC BOOST</span>
                  <input
                    type="checkbox"
                    checked={diagnosticMode}
                    onChange={(e) => {
                      setDiagnosticMode(e.target.checked);
                      if (onAddLog) {
                        onAddLog({
                          source: "STRIX CONTROL",
                          type: "SUCCESS",
                          message: `DIAGNOSTIC UPDATE: Oscilloscope test sweep ${e.target.checked ? "ENABLED" : "DISABLED"}.`
                        });
                      }
                    }}
                    className="rounded border-slate-800 bg-slate-900 accent-cyan-400"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>CRYPTO LOCK HARDENING</span>
                  <input
                    type="checkbox"
                    checked={hardenedCrypto}
                    onChange={(e) => {
                      setHardenedCrypto(e.target.checked);
                      if (onAddLog) {
                        onAddLog({
                          source: "STRIX CRYPTO",
                          type: "WARNING",
                          message: `CIPHER LEVEL: Hardened crypto lock ${e.target.checked ? "MAX" : "STANDARD LEVEL"}.`
                        });
                      }
                    }}
                    className="rounded border-slate-800 bg-slate-900 accent-emerald-500"
                  />
                </label>

                <button
                  onClick={() => {
                    handleClearWaypoints();
                    setIsHamMenuOpen(false);
                  }}
                  className="w-full bg-red-950 border border-red-900 text-red-400 hover:text-white hover:bg-red-900 py-1 rounded text-[7.5px] uppercase"
                >
                  Force Hard Reset Waypoints
                </button>

                <button
                  onClick={() => {
                    setCliLogs([]);
                    setIsHamMenuOpen(false);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 py-1 rounded border border-slate-800 text-[7.5px] uppercase"
                >
                  Wipe Terminal Streams
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. TAB CONTROL AND WORKSPACE DECK */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-1 shrink-0">
        <div className="flex gap-1.5">
          <button
            onClick={() => setPrismaTab("UNIFIED_C2_DECK")}
            className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
              prismaTab === "UNIFIED_C2_DECK"
                ? "bg-slate-900 border-red-900 text-red-400"
                : "bg-transparent border-transparent text-slate-500 hover:text-slate-350"
            }`}
          >
            💻 COMBAT DECK OPERATIVE
          </button>
          <button
            onClick={() => setPrismaTab("CAMPAIGN_SUPERVISION")}
            className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
              prismaTab === "CAMPAIGN_SUPERVISION"
                ? "bg-slate-900 border-indigo-900 text-indigo-400"
                : "bg-transparent border-transparent text-slate-500 hover:text-slate-350"
            }`}
          >
            🛸 SWARM CAMPAIGN MANAGER
          </button>
          <button
            onClick={() => setPrismaTab("SECURITY_PROVENANCE")}
            className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
              prismaTab === "SECURITY_PROVENANCE"
                ? "bg-slate-900 border-purple-900 text-purple-400"
                : "bg-transparent border-transparent text-slate-500 hover:text-slate-350"
            }`}
          >
            🛡️ ZERO-TRUST CERTIFICATES
          </button>
        </div>

        {/* Roles select */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-0.5 border border-slate-900 rounded text-[7px] text-slate-500">
          <span>ROLE PORTAL:</span>
          {(["COMMANDER", "PLANNER", "ANALYST", "OPERATOR"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setActiveRole(r)}
              className={`px-1.5 py-0.5 rounded text-[7px] font-bold ${activeRole === r ? "bg-red-700 text-white" : "hover:text-slate-300"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {prismaTab === "UNIFIED_C2_DECK" && (
        <div className="flex flex-col gap-2 flex-grow">
          {/* Action Header bar above maps */}
          <div className="bg-slate-950 border border-slate-900 rounded p-1.5 grid grid-cols-1 md:grid-cols-12 gap-1.5 items-center">
            {/* Left aligned Actions */}
            <div className="md:col-span-5 flex items-center justify-between">
              <span className="font-extrabold text-white text-[7.5px] uppercase tracking-wider flex items-center gap-1 shrink-0">
                <span className="text-red-500 font-bold">▶</span> STRIKE TELEMETRY // SECTOR GRID
              </span>
              <div className="flex gap-1.5">
                <button onClick={() => onAddLog?.({ source: "FILESTORE", type: "INFO", message: "Strix_flightpath_sectors_north.json synced." })} className="bg-slate-900 hover:bg-slate-800 hover:text-white px-1.5 py-0.5 rounded border border-slate-800 text-slate-350 text-[6.5px]">LOAD JSON</button>
                <button onClick={isSimulating ? stopSimulation : startSimulation} className={`px-2 py-0.5 rounded text-[6.5px] font-bold flex items-center gap-1 ${isSimulating ? "bg-red-800 text-white animate-pulse" : "bg-cyan-950/40 text-cyan-400 border border-cyan-800/80 hover:bg-cyan-900/50"}`}>
                  <Play className="h-2 w-2 text-cyan-400" />
                  {isSimulating ? "STOP AUTOPILOT" : "AUTOPILOT PLAN"}
                </button>
                <button onClick={handleClearWaypoints} className="bg-slate-900 hover:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300 text-[6.5px]">RESET PATH</button>
              </div>
            </div>

            {/* Separator */}
            <div className="hidden md:block md:col-span-1 h-3 w-[1px] bg-slate-800 mx-auto" />

            {/* Right actions */}
            <div className="md:col-span-6 flex items-center justify-between gap-2">
              <span className="font-extrabold text-cyan-400 text-[7.5px] uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Sliders className="h-3 w-3 text-cyan-400" /> MISSION VEHICLES
              </span>
              <div className="flex gap-1 items-center flex-1 justify-end">
                <button onClick={uploadFlightPlan} className="bg-[#0369a1]/30 hover:bg-[#0369a1]/50 text-sky-400 border border-sky-850 px-1.5 py-0.5 rounded text-[6.5px] font-black">UPLINK FLY-PLAN</button>
                
                <select 
                  value={activeUavSelect} 
                  onChange={(e) => setActiveUavSelect(e.target.value)} 
                  className="bg-slate-950 text-slate-300 rounded border border-slate-850 px-1 py-0.5 text-[6.5px] font-bold outline-none"
                >
                  <option value="STRIX-X9 Recon">STRIX-X9 Recon</option>
                  <option value="SUDARSHAN Attack">SUDARSHAN Strike</option>
                  <option value="GHATAK Stealth">GHATAK Wingman</option>
                  <option value="VAJRA FPV Swarm">Vajra Swarm Node</option>
                </select>

                <select 
                  value={targetPayload} 
                  onChange={(e) => setTargetPayload(e.target.value)} 
                  className="bg-slate-950 text-slate-300 rounded border border-slate-850 px-1 py-0.5 text-[6.5px] font-bold outline-none"
                >
                  <option value="Thermobaric AP">Thermobaric AP</option>
                  <option value="EO/IR Dual-Cam">EO/IR Multispec</option>
                  <option value="ASCON-EW Jammer">ASCON-EW Radio</option>
                  <option value="HE-Cluster Warhead">HE-Cluster Munition</option>
                </select>
              </div>
            </div>
          </div>

          {/* MID GRID HOUSING MAPS AND COLUMN GAUGE WIDGETS */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-2 mt-0.5 items-stretch flex-grow">
            
            {/* COLUMN A: LEFT MAP - STRIKE HISTORY AND RADAR OVERLAYS (xl:col-span-4) */}
            <div className="xl:col-span-4 bg-slate-900/10 border border-slate-950 p-1.5 rounded-md flex flex-col justify-between h-[390px] relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-900 pb-0.5 shrink-0 z-10 bg-black/60">
                <span className="font-extrabold text-white text-[7.5px] uppercase flex items-center gap-1">
                  ✦ COOPERATIVE RADAR READS // SECTOR NORTH
                </span>
                <span className="text-[6.5px] text-slate-500">
                  TOTAL CHANNELS: 10,230 | PING: 18ms
                </span>
              </div>

              {/* Central Map Workspace with left-overlaid flight records */}
              <div className="flex-1 relative mt-1 bg-black rounded overflow-hidden flex">
                {/* Embedded Sidebar - ACTIVE TRACKS list */}
                <div className="w-[100px] h-full bg-slate-950/90 border-r border-slate-900 flex flex-col p-1 z-10 select-none overflow-y-auto shrink-0 scrollbar-none">
                  <span className="text-[6px] text-slate-500 font-extrabold uppercase border-b border-slate-900 pb-0.5 tracking-wider block mb-1">
                    RADAR PING TRACKS
                  </span>
                  
                  {activeTracks.map((tr, idx) => {
                    let textClass = "text-slate-400";
                    if (tr.isYellow) textClass = "text-amber-400";
                    if (tr.isCyan) textClass = "text-cyan-400";
                    if (tr.isRed) textClass = "text-red-400";
                    if (tr.isGreen) textClass = "text-emerald-400";
                    return (
                      <div key={idx} className="flex flex-col text-[6px] leading-[1.3] border-b border-slate-900/50 pb-0.5 mb-0.5">
                        <div className="flex justify-between items-center gap-0.5">
                          <span className={`font-extrabold uppercase ${textClass}`}>✦ {tr.callsign}</span>
                          <span className="font-bold text-slate-500 font-mono scale-[0.9] text-[5.5px]">{tr.val1}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 scale-[0.85] origin-left">
                          <span>{tr.pct}%</span>
                          <span>{tr.dist}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Radar Grid Map Graphics (SVG Area) with beautiful tactical elements */}
                <div className="flex-1 h-full relative cursor-crosshair">
                  {/* Grid background */}
                  <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 pointer-events-none opacity-5">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className="border border-slate-800 flex items-start p-0.5 text-[4px] text-slate-700 font-extrabold">{i + 200}</div>
                    ))}
                  </div>

                  <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Radar sweeps */}
                    <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(51,65,85,0.1)" strokeWidth="0.3" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(51,65,85,0.1)" strokeWidth="0.3" strokeDasharray="1,1" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(51,65,85,0.1)" strokeWidth="0.3" />

                    {/* S400 Threat cover dome */}
                    <circle cx="70" cy="40" r="18" fill="rgba(239, 68, 68, 0.04)" stroke="rgba(239,68,68,0.18)" strokeWidth="0.4" strokeDasharray="1.5,1.5" />

                    {/* Swooping flight lines representing past flight corridor paths */}
                    <g opacity="0.65">
                      <path d="M 12,20 Q 25,65 52,68 T 88,40" fill="none" stroke="#eab308" strokeWidth="0.6" strokeDasharray="1,1" />
                      <path d="M 15,22 Q 28,63 50,65 T 85,38" fill="none" stroke="#22d3ee" strokeWidth="0.6" />
                      <path d="M 18,25 Q 31,60 48,63 T 82,35" fill="none" stroke="#eab308" strokeWidth="0.5" />
                    </g>
                  </svg>

                  {/* Overlaid HUD Box: FLIGHT OVERVIEW */}
                  <div className="absolute bottom-1.5 right-1.5 p-1 px-1.5 border border-slate-900 bg-black/90 text-[6px] rounded w-[110px] leading-[1.3] text-slate-400 z-10 font-mono">
                    <span className="font-extrabold text-red-500 block border-b border-slate-900 pb-0.5 uppercase mb-1">
                      FLIGHT METRICS
                    </span>
                    <div className="flex justify-between"><span>TOTAL FLY-HRS</span><span className="font-bold text-slate-200">2,480 hrs</span></div>
                    <div className="flex justify-between"><span>ACTIVE PATROLS</span><span className="font-bold text-slate-200">5 Combat</span></div>
                    <div className="flex justify-between"><span>BDA DEPLOYED</span><span className="font-bold text-[#22d3ee]">99.2% OK</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN B: RECONSTRUCTED HIGH-FIDELITY ACTIVE INTERACTIVE MISSION PLANNER MAP */}
            <div className="xl:col-span-5 bg-slate-900/10 border border-slate-950 p-1.5 rounded-md flex flex-col justify-between h-[390px] relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-900 pb-0.5 shrink-0 z-10 bg-black/60">
                <span className="font-extrabold text-[#38bdf8] text-[7.5px] uppercase flex items-center gap-1">
                  <Navigation className="h-3 w-3 text-cyan-400 animate-spin" />
                  HIGH-END MISSION PATH-PLANNER
                </span>
                <span className="text-[6.5px] text-slate-500">
                  CLICK ON CARD TO CHART WAYPOINTS
                </span>
              </div>

              {/* Waypoint adjustments and weather controls on planner */}
              <div className="grid grid-cols-3 gap-1 text-[7px] bg-slate-950 p-1 border border-slate-900 shrink-0 select-none">
                <div className="flex flex-col">
                  <span className="text-slate-500 font-bold uppercase">WEATHER MODIFIER:</span>
                  <div className="flex gap-1.5 mt-0.5">
                    {(["CLEAR", "WINDY", "STORMY"] as const).map((w) => (
                      <button 
                        key={w} 
                        onClick={() => {
                          setWeatherCondition(w);
                          if (onAddLog) {
                            onAddLog({
                              source: "STRIX PLANNER",
                              type: "INFO",
                              message: `WEATHER CALIBRATION: Changed workspace environment to ${w}. Fly-parameters re-adjusted.`
                            });
                          }
                        }} 
                        className={`px-1 py-0.5 rounded text-[5.5px] font-black uppercase ${weatherCondition === w ? "bg-cyan-950 text-cyan-400 border border-cyan-800" : "bg-slate-900 text-slate-500"}`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-500 font-bold uppercase">CRUISE ALTITUDE [m]:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <input 
                      type="range" 
                      min="1000" 
                      max="8000" 
                      step="500"
                      value={flightAltitude} 
                      onChange={(e) => setFlightAltitude(parseInt(e.target.value))} 
                      className="w-full accent-red-500 bg-slate-800 h-1 rounded" 
                    />
                    <span className="text-white font-black whitespace-nowrap">{flightAltitude}m</span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-500 font-bold uppercase">AIRSPEED [kts]:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <input 
                      type="range" 
                      min="80" 
                      max="450" 
                      step="10"
                      value={flightSpeed} 
                      onChange={(e) => setFlightSpeed(parseInt(e.target.value))} 
                      className="w-full accent-cyan-400 bg-slate-800 h-1 rounded" 
                    />
                    <span className="text-white font-black whitespace-nowrap">{flightSpeed}kt</span>
                  </div>
                </div>
              </div>

              {/* Central Map with coastlines and active fly simulation */}
              <div className="flex-1 relative mt-1 bg-black rounded overflow-hidden">
                <svg
                  className="absolute inset-0 h-full w-full"
                  onClick={handleMapClick}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {/* Backdrop Coastline map */}
                  <g opacity="0.14">
                    <path d="M 5,20 Q 15,35 30,22 T 55,48 T 75,32 T 95,50 L 95,95 L 5,95 Z" fill="none" stroke="#22d3ee" strokeWidth="0.8" />
                    <path d="M 12,45 C 32,40 40,15 65,30 S 80,60 90,85 Z" fill="none" stroke="#0369a1" strokeWidth="0.5" strokeDasharray="2,2" />
                  </g>

                  {/* Airspace Boundary Warning Red Domes */}
                  <g opacity="0.15">
                    <circle cx="50" cy="55" r="14" fill="#ef4444" stroke="#ef4444" strokeWidth="0.4" strokeDasharray="1,1" />
                    <text x="39" y="58" fill="#ef4444" className="font-mono text-[2.5px] font-black uppercase">NO FLY EW ZONE</text>
                  </g>

                  {/* Flight Corridor overlay */}
                  {waypoints.length > 1 && pathSmoothing && (
                    <polyline
                      points={waypoints.map(w => `${w.x},${w.y}`).join(" ")}
                      fill="none" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                    />
                  )}

                  {/* Waypoints route path segments */}
                  {waypoints.length > 1 && (
                    <polyline
                      points={waypoints.map(w => `${w.x},${w.y}`).join(" ")}
                      fill="none" 
                      stroke={weatherCondition === "STORMY" ? "#fb7185" : weatherCondition === "WINDY" ? "#fbbf24" : "#22d3ee"} 
                      strokeWidth="1.2" 
                      strokeDasharray={isSimulating ? "2,1" : "none"}
                    />
                  )}

                  {/* Interactive waypoints dots */}
                  {waypoints.map((w, index) => (
                    <g key={index}>
                      <circle cx={w.x} cy={w.y} r="1.5" fill="#22d3ee" />
                      <circle cx={w.x} cy={w.y} r="3" fill="none" stroke="#38bdf8" strokeWidth="0.3" className="animate-pulse" />
                      <text x={w.x + 2} y={w.y + 1.2} fill="#38bdf8" className="font-mono text-[4.5px] font-bold" >
                        #{w.seq} [{w.label}]
                      </text>
                    </g>
                  ))}

                  {/* Drone Simulator Active Icon (`🛸`) */}
                  {isSimulating && simPosition && (
                    <g>
                      <circle cx={simPosition.x} cy={simPosition.y} r="4.5" fill="none" stroke="#f43f5e" strokeWidth="0.5" className="animate-ping" />
                      <path 
                        d={`M ${simPosition.x - 2},${simPosition.y} L ${simPosition.x},${simPosition.y - 2.5} L ${simPosition.x + 2},${simPosition.y} L ${simPosition.x},${simPosition.y + 2.5} Z`} 
                        fill="#ef4444" 
                      />
                      <circle cx={simPosition.x} cy={simPosition.y} r="1.2" fill="#fff" />
                      {/* Interactive Telemetry HUD tags moving with simulator drone */}
                      <rect x={simPosition.x + 4} y={simPosition.y - 7} width="24" height="6.2" rx="0.5" fill="rgba(0,0,0,0.85)" stroke="#ef4444" strokeWidth="0.3" />
                      <text x={simPosition.x + 5.2} y={simPosition.y - 2.8} fill="#ef4444" className="font-mono text-[3.2px] font-black">
                        {simSpeed}KT | {simAltitude}M
                      </text>
                    </g>
                  )}
                  
                  {/* Coast cities references mapping */}
                  <g opacity="0.6" className="font-sans font-black text-[#51e2f5] text-[3.8px] fill-cyan-400">
                    <circle cx="28" cy="22" r="0.7" /> <text x="30" y="23.5">ZMEIYKA</text>
                    <circle cx="45" cy="54" r="0.7" /> <text x="47" y="55.5">BOROVAYA</text>
                    <circle cx="68" cy="18" r="0.7" /> <text x="70" y="19.5">SYPYANSR</text>
                    <circle cx="82" cy="24" r="0.7" /> <text x="84" y="25.5">STAROBILSK</text>
                    <circle cx="34" cy="42" r="0.7" /> <text x="36" y="43.5">IZYUM</text>
                    <circle cx="56" cy="40" r="0.7" /> <text x="58" y="41.5">SYATOVI</text>
                    <circle cx="55" cy="64" r="0.7" /> <text x="57" y="65.5">POPASNA</text>
                    <circle cx="50" cy="80" r="0.7" /> <text x="52" y="81.5">VOLNOVAKHA</text>
                  </g>
                </svg>

                {/* Overlaid Objective Box: MISSION DETAILS */}
                <div className="absolute top-2 right-2 p-1 border-2 border-red-500 bg-black/95 text-[6.5px] rounded w-[155px] leading-[1.3] text-slate-350 z-10 flex gap-1 justify-between">
                  <div className="flex-1 flex flex-col font-mono text-[6.5px] scale-[0.95] origin-left select-none">
                    <span className="font-black text-red-500 block border-b border-red-900 pb-0.5 uppercase mb-1">
                      ACTIVE FLIGHT SUMMARY
                    </span>
                    <div className="grid grid-cols-12 gap-y-0.5 text-slate-300">
                      <span className="col-span-4 text-slate-500">PLATFORM</span> 
                      <span className="col-span-8 font-black text-white truncate">{activeUavSelect}</span>

                      <span className="col-span-4 text-slate-500">PAYLOAD</span> 
                      <span className="col-span-8 font-bold text-amber-400 truncate">{targetPayload}</span>

                      <span className="col-span-4 text-slate-500">CORRIDOR</span> 
                      <span className="col-span-4 font-bold text-[#38bdf8]">GRID-8A</span> 
                      <span className="col-span-4 text-emerald-400 font-extrabold text-[5px] select-none text-right">SECURED ✔</span>
                    </div>
                  </div>
                </div>

                {/* Left/Right Map footer badges */}
                <div className="absolute bottom-1.5 left-1.5 bg-red-650 font-black text-white text-[6.2px] p-0.5 px-2 rounded-sm uppercase tracking-wide">
                  {isSimulating ? "AUTOPILOT LIVE RUNNING" : "COCKPIT PLANNING DESK"}
                </div>
                <div className="absolute bottom-1.5 right-1.5 text-[6.2px] text-slate-400 bg-slate-950 px-1.5 py-0.5 border border-slate-900 rounded select-none">
                  FLY-RULES: {weatherCondition} // TARGET: LADAKH-4
                </div>

                {/* Upload status blocker */}
                {isUploadingPlan && (
                  <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center z-20">
                    <Zap className="h-6 w-6 text-cyan-400 animate-bounce mb-1" />
                    <span className="text-[9px] font-black uppercase text-cyan-400 tracking-wider">
                      RE-COMPILING UAV STRATOSPHERE COEFFICIENTS...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN C: RIGHTMOST WIDGETS COLUMN (xl:col-span-4) */}
            <div className="xl:col-span-4 flex flex-col gap-1.5 h-[390px] justify-between">
              
              {/* Widget 1: THREAT RADARS */}
              <div className="bg-slate-900/10 border border-slate-950 rounded-md p-1.5 flex flex-col gap-1 h-[142px] overflow-hidden">
                <span className="font-extrabold text-white text-[7.5px] uppercase border-b border-slate-900 pb-0.5 tracking-wider block leading-none">
                  ▶ ACTIVE THREAT GRIDS
                </span>
                <div className="flex-grow overflow-y-auto scrollbar-none pr-1 flex flex-col gap-0.5">
                  {threats.map((th) => (
                    <div key={th.id} className="flex justify-between items-center text-[6px] py-0.5 border-b border-slate-900/25">
                      <div className="flex items-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${th.isCritical ? "bg-red-500 animate-pulse" : th.isWarning ? "bg-amber-400" : "bg-cyan-400"}`} />
                        <span className="text-slate-300 font-extrabold uppercase scale-[0.95] origin-left">{th.name}</span>
                      </div>
                      <span className={`px-1 font-black rounded-sm py-0.1 select-none border text-[5.5px] scale-[0.9] ${
                        th.isCritical 
                          ? "bg-red-950/20 border-red-800 text-red-500 font-black animate-pulse" 
                          : th.isWarning 
                            ? "bg-amber-950/20 border-amber-800 text-amber-500 font-bold" 
                            : "bg-slate-950 border-slate-800 text-sky-400"
                      }`}>{th.status}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[5.5px] text-slate-500 uppercase border-t border-slate-900 pt-0.5 leading-none mt-auto">
                  FEED: SATELLITE + ACTIVE RADARS // CONFIRMED STATUS
                </div>
              </div>

              {/* Widget 2: SIGNAL CHART // OSICLLOSCOPE */}
              <div className="bg-slate-900/10 border border-slate-950 rounded-md p-1.5 flex flex-col gap-1 h-[115px]">
                <span className="font-extrabold text-white text-[7.5px] uppercase border-b border-slate-900 pb-0.5 tracking-wider block leading-none">
                  ▶ OSCILLOSCOPE SPECTROMETER // SIGINT
                </span>
                
                <div className="flex-grow bg-black relative rounded overflow-hidden p-0.5 flex flex-col gap-1">
                  <canvas ref={canvasRef} width={138} height={50} className="w-full h-14 bg-black/90 rounded" />
                  
                  {/* Data strength feedback */}
                  <div className="flex justify-between items-center border-t border-slate-900 pt-0.5 px-0.5 text-[5.5px]">
                    <span className="text-slate-500 font-bold uppercase">SECURE LINK QUALITY</span>
                    <span className="text-emerald-400 font-bold tracking-tight">E2E CRYPTO: ACTIVE</span>
                  </div>
                </div>

                <div className="text-[5.5px] text-slate-500 uppercase leading-none mt-auto">
                  ASCON-256 ROTATION HOpping | RADAR SCAN: ON
                </div>
              </div>

              {/* Widget 3: FLEET STATUS */}
              <div className="bg-slate-900/10 border border-slate-950 rounded-md p-1.5 flex flex-col gap-1 h-[115px] overflow-hidden">
                <span className="font-extrabold text-white text-[7.5px] uppercase border-b border-slate-900 pb-0.5 tracking-wider block leading-none">
                  ▶ UAV STORM FLEET // STATUS
                </span>
                <div className="flex-grow overflow-y-auto scrollbar-none flex flex-col gap-0.5 pr-1">
                  {fleet.map((fl) => (
                    <div key={fl.id} className="flex justify-between items-center text-[6px] py-0.5 border-b border-slate-900/20">
                      <div className="flex items-center gap-1">
                        <span className="h-1 w-1 bg-red-500 rounded-full" />
                        <span className="text-slate-200 font-bold uppercase">{fl.name}</span>
                        <span className="text-[5px] text-slate-500 font-bold bg-slate-950 px-1 rounded border border-slate-900 scale-90">{fl.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[5.5px] scale-[0.9]">BAT:{fl.battery}%</span>
                        <span className={`px-1 py-0.1 border text-[5.5px] rounded scale-[0.9] font-black ${
                          fl.state === "READY" 
                            ? "bg-emerald-950/20 border-emerald-920 text-emerald-400" 
                            : fl.state === "ROUTE"
                              ? "bg-cyan-950/20 border-cyan-800 text-cyan-400 animate-pulse"
                              : "bg-amber-950/20 border-amber-900 text-amber-500"
                        }`}>{fl.state}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* LOWER CLI PORTAL SHELL PANEL */}
          <div className="bg-slate-950/90 border border-slate-900 rounded p-1.5 flex flex-col gap-1.5 shrink-0">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-1">
              <span className="text-[7.5px] font-extrabold text-[#38bdf8] uppercase tracking-wider flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                STRIX COGNITIVE INTEGRATION TERMINAL SHELL
              </span>
              <span className="text-[6.5px] text-slate-500">
                ACTIVE PIPES: STRIX-TELEMETRY // EXEC-CENTRAL  |  TYPE &quot;clear&quot; OR &quot;strike&quot; OR &quot;altitude &lt;m&gt;&quot;
              </span>
            </div>

            {/* CLI Feed stream logs */}
            <div className="h-[95px] overflow-y-auto pr-1 flex flex-col gap-1 font-mono text-[7px] leading-relaxed select-text scrollbar-thin scrollbar-thumb-slate-800">
              {cliLogs.length === 0 ? (
                <div className="text-slate-600 text-center py-4">TELEMETRY SHELL CLEARED. EMITTING LOGS FROM ACTIVE STRIX ENGINES...</div>
              ) : (
                cliLogs.map((log, index) => {
                  const isAlert = log.type === "ALERT" || log.tag === "ALERT";
                  const isWarn = log.type === "WARN" || log.tag === "WARN";
                  const isSuccess = log.tag === "SYS_RESP" && !isAlert && !isWarn;

                  return (
                    <div key={index} className="flex items-start gap-1 p-0.5 rounded border border-transparent hover:bg-slate-900/40">
                      <span className="text-slate-600 select-none">{log.timestamp}</span>
                      <span className={`px-1 rounded-sm border select-none text-[6px] leading-none shrink-0 uppercase py-0.5 scale-90 ${
                        isAlert 
                          ? "bg-red-950/20 border-red-900 text-red-500 font-extrabold animate-pulse" 
                          : isWarn 
                            ? "bg-amber-950/20 border-amber-900 text-amber-500 font-bold" 
                            : isSuccess
                              ? "bg-emerald-950/20 border-emerald-900 text-emerald-400 font-bold"
                              : "bg-slate-950 border-slate-850 text-sky-400"
                      }`}>{log.tag}</span>
                      <span className={`${isAlert ? "text-red-400 font-extrabold" : isWarn ? "text-amber-400 font-bold" : isSuccess ? "text-slate-200" : "text-slate-400"}`}>
                        {log.description}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* CLI Entry prompt line */}
            <form onSubmit={handleShellCommandSubmit} className="flex gap-1.5 border-t border-slate-900 pt-1">
              <span className="text-red-500 font-bold select-none py-0.5 self-center">strix@operator:~$</span>
              <input
                type="text"
                value={userCommandInput}
                onChange={(e) => setUserCommandInput(e.target.value)}
                placeholder="PROMPT DIRECTIVES SHELL (e.g. 'altitude 5500', 'strike', 'status')"
                className="flex-1 bg-slate-950 text-white rounded border border-slate-900 hover:border-slate-850 px-2 py-0.5 text-[8.5px] outline-none focus:border-cyan-400 placeholder-slate-700 uppercase"
              />
              <button
                type="submit"
                className="px-3 bg-cyan-950 hover:bg-cyan-900 hover:text-white border border-cyan-800 text-cyan-400 py-0.5 rounded text-[8px] font-black tracking-wider uppercase transition-all"
              >
                EXECUTE
              </button>
            </form>

          </div>
        </div>
      )}

      {prismaTab === "CAMPAIGN_SUPERVISION" && (
        <div className="flex- grow flex flex-col gap-4 p-4 items-center justify-center text-center py-20">
          <div className="bg-slate-950/90 border border-slate-850 p-6 rounded-lg max-w-lg shadow-xl flex flex-col gap-3">
            <Cpu className="h-10 w-10 text-indigo-400 animate-spin mx-auto" />
            <h3 className="font-extrabold text-white text-[12px] uppercase">STRIX Swarm Campaign supervisor</h3>
            <p className="text-slate-400 text-[10px] leading-relaxed font-sans">
              Deploy integrated decoy suites globally. Generates synchronized radar phantom echoes targeting enemy air-defence systems, flooding their emission collectors and masking true waypoint routes.
            </p>

            <div className="border border-slate-900 p-2 text-left bg-slate-950 rounded flex flex-col gap-1">
              <div className="flex justify-between items-center text-[8px]">
                <span>CONNECTED PHANTOMS STRAWNODES:</span>
                <span className="text-indigo-400 font-bold">80 DEPLOYABLE</span>
              </div>
              <div className="flex justify-between items-center text-[8px]">
                <span>SPECTRAL DECOR CORRESPONDENCE:</span>
                <span className="text-emerald-400 font-bold">ALIGNED ✔</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={launchSwarmCampaign}
                className="flex-1 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 hover:border-indigo-600 text-indigo-400 hover:text-white py-1.5 rounded text-[9px] uppercase font-black"
              >
                DISPATCH SYNCHRONIZED SWARM
              </button>
              {isSwarmCampaignActive && (
                <button
                  onClick={resetSwarmCampaign}
                  className="bg-amber-950 hover:bg-amber-900 border border-amber-900 text-amber-500 py-1.5 rounded px-3 text-[9px] uppercase font-black"
                >
                  DE-ACTIVATE
                </button>
              )}
            </div>

            {isSwarmCampaignActive && (
              <span className="text-red-500 text-[7px] select-none font-bold animate-pulse block uppercase tracking-widest leading-none mt-2">
                ⚠️ ALERT: SWARM ACTIVE. CORRIDOR REFLECTION LEVEL DISPATCHING MAX GRIDS CODES.
              </span>
            )}
          </div>
        </div>
      )}

      {prismaTab === "SECURITY_PROVENANCE" && (
        <div className="flex-grow flex flex-col gap-4 p-4 items-center justify-center text-center py-20">
          <div className="bg-slate-950/90 border border-slate-850 p-6 rounded-lg max-w-lg shadow-xl flex flex-col gap-3">
            <Shield className="h-10 w-10 text-purple-400 animate-pulse mx-auto" />
            <h3 className="font-extrabold text-white text-[12px] uppercase">STRIX CRYPTO LOCKS & SECURITY SEAL</h3>
            <p className="text-slate-400 text-[10px] leading-relaxed font-sans">
              Zero-Trust cryptographic authentication keys securing UAV mission uploads. Utilizing rotating ASCON-256 blocks that isolate satellite channels even in high noise electronic jamming zones.
            </p>

            <div className="bg-slate-900 border border-slate-950 p-2 hover:border-purple-900/60 transition-all rounded text-left flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[7.5px]">
                <span>ASCON PRIVATE E2E SECURE KEY:</span>
                <span className="text-purple-400 font-bold">ROTATING_ACTIVE</span>
              </div>
              <div className="bg-black/90 p-1 border border-slate-850 rounded text-slate-500 text-[7.5px] font-mono select-all truncate">
                0x9E7F105BDC34091A882EF7BF6D8198AC29B4D522D120B883EF10BB301A
              </div>
            </div>

            <button
              onClick={() => {
                if (onAddLog) {
                  onAddLog({
                    source: "STRIX SECURITY",
                    type: "SUCCESS",
                    message: "SECURITY SEAL ROTATION: Force re-authenticated all UAV private keys with ASCON algorithms."
                  });
                }
              }}
              className="w-full bg-purple-950 hover:bg-purple-900 border border-purple-800 hover:border-purple-600 text-purple-400 hover:text-white py-1.5 rounded text-[9px] uppercase font-black"
            >
              Rotate Key Rings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
