import React, { useState, useEffect, useRef } from "react";
import { 
  Brain, 
  Cpu, 
  Eye, 
  Target, 
  Flame, 
  Zap, 
  Database, 
  Compass, 
  Shield, 
  Activity, 
  Radio, 
  Server, 
  Tv, 
  Clock, 
  Play, 
  Award, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Users,
  Terminal,
  Volume2,
  Navigation,
  Globe,
  Plus,
  Compass as CompassIcon,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { TacticalLog } from "../types";

interface IndraNetBrain2035Props {
  onAddLog: (log: Omit<TacticalLog, "id" | "timestamp">) => void;
  himalayanOps: boolean;
}

export default function IndraNetBrain2035({ onAddLog, himalayanOps }: IndraNetBrain2035Props) {
  const [activeSubTab, setActiveSubTab] = useState<"CORE" | "BATTLESPACE" | "SENSOR" | "DRONES" | "TARGETS" | "STAFF">("CORE");
  
  // Interactive Operational States (Advanced Modules Integration)
  const [selectedDroneId, setSelectedDroneId] = useState<string>("DR-901");
  const [selectedTargetId, setSelectedTargetId] = useState<string>("TG-301");
  const [assignedWeapon, setAssignedWeapon] = useState<Record<string, "PINAKA" | "BRAHMOS" | "SWARM" | "ARTILLERY">>({ 
    "TG-301": "BRAHMOS", 
    "TG-302": "SWARM", 
    "TG-303": "ARTILLERY" 
  });
  const [selectedCOA, setSelectedCOA] = useState<"COA_ALPHA" | "COA_BETA" | "COA_GAMMA">("COA_ALPHA");
  const [authorizedCOA, setAuthorizedCOA] = useState<string | null>(null);
  const [targetUnderStrikeId, setTargetUnderStrikeId] = useState<string | null>(null);
  const [targetStrikeStage, setTargetStrikeStage] = useState<"IDLE" | "BOOSTER" | "CRUISE" | "TERMINAL" | "SUCCESS">("IDLE");
  const [lostTrackSelectedId, setLostTrackSelectedId] = useState<string>("P-104");
  const [lostTrackSpeedMultiplier, setLostTrackSpeedMultiplier] = useState<number>(1.0);
  const [deconflictionStatus, setDeconflictionStatus] = useState<"IDLE" | "SCANNING" | "DECONFLICTED" | "WARNING">("IDLE");
  const [deconflictionLogs, setDeconflictionLogs] = useState<string[]>([]);

  // Tab 0: Core Mission Speed-to-Strike Simulator State
  const [coreStatus, setCoreStatus] = useState<"IDLE" | "SENSOR" | "FUSION" | "COMMANDER" | "SHOOTER" | "COMPLETE">("IDLE");
  const [coreTimer, setCoreTimer] = useState<number>(0);
  const [loopLogs, setLoopLogs] = useState<{ time: string; msg: string; type: "INFO" | "SUCCESS" | "ALERT" }[]>([]);

  // Tab 1: Theater & Time Travel State
  const [selectedTheater, setSelectedTheater] = useState<"LADAKH" | "KARAKORAM" | "SILIGURI">("LADAKH");
  const [timeStep, setTimeStep] = useState<number>(14); // Index equivalent to hours from T-24 to T+12
  const [activeOverlays, setActiveOverlays] = useState({
    terrain: true,
    threatHeat: false,
    frontline: true,
    spaceTrack: false
  });

  // Tab 2: Sensor Fusion State
  const [sensorReliability, setSensorReliability] = useState({
    uav: 92,
    radar: 95,
    acoustic: 78,
    sigint: 88,
    satellite: 97
  });
  const [duplicateCoordElimination, setDuplicateCoordElimination] = useState(true);
  const [trackCorrelationScore, setTrackCorrelationScore] = useState(98.4);
  const [predictedTracks, setPredictedTracks] = useState([
    { id: "P-104", type: "ARMOR", heading: "Heading 145° East", speed: "22 km/h", predictTime: "15s into blind deflection sector" },
    { id: "P-202", type: "INFANTRY", heading: "Heading 010° North", speed: "12 km/h", predictTime: "40s into dead-zone shadow" }
  ]);

  // Tab 3: Drone Swarm Suite
  const [swarmState, setSwarmState] = useState<"STANDBY" | "LAUNCHED" | "ROUTING" | "ENGAGED">("STANDBY");
  const [meshRoutingHealth, setMeshRoutingHealth] = useState(100);
  const [meshJammed, setMeshJammed] = useState(false);
  const [gpsDeniedFallback, setGpsDeniedFallback] = useState(true);
  const [activeDronesList, setActiveDronesList] = useState([
    { id: "DR-901", name: "Strix Recon heavy", battery: 84, signal: 95, status: "AUTONOMOUS PATROL", activePayload: "EO/IR Spectral" },
    { id: "DR-902", name: "Strix Recon heavy b", battery: 78, signal: 91, status: "AUTONOMOUS PATROL", activePayload: "Acoustic Arrays" },
    { id: "DR-914", name: "Kamikaze Swarm wing-A", battery: 98, signal: 88, status: "STANDBY ONLAUNCHER", activePayload: "3kg HE-Frag" },
    { id: "DR-915", name: "Kamikaze Swarm wing-B", battery: 100, signal: 89, status: "STANDBY ONLAUNCHER", activePayload: "3kg HE-Frag" }
  ]);

  // Tab 4: Target Hub & Predictions
  const [customTargetCoords, setCustomTargetCoords] = useState("43Q LD 51200 13400");
  const [customTargetClass, setCustomTargetClass] = useState("ARTILLERY_BATTERY");
  const [targetList, setTargetList] = useState([
    { id: "TG-301", type: "S-400 engagement Radar", coords: "43Q LD 54109 13582", validation: "VERIFIED", confidence: 96, killProb: 91, decoy: "NO", camo: "YES", lifeTime: "14 min remaining" },
    { id: "TG-302", type: "T-90 armored core", coords: "43Q LD 51928 12845", validation: "VERIFIED", confidence: 99, killProb: 88, decoy: "NO", camo: "NO", lifeTime: "7 min remaining" },
    { id: "TG-303", type: "Dummy Radar Position", coords: "43Q LD 48911 11040", validation: "IDENTIFIED DECOY", confidence: 82, killProb: 4, decoy: "YES", camo: "YES", lifeTime: "Expired" }
  ]);

  // Tab 5: AI Staff & Decisions
  const [staffQueries, setStaffQueries] = useState("");
  const [queryOutput, setQueryOutput] = useState<string>("Enter a battle-query above or run simulations to populate C2 2035 AI staff briefs.");
  const [wargamingRiskScore, setWargamingRiskScore] = useState(38);
  const [wargamingSuccessRate, setWargamingSuccessRate] = useState(74);
  const [isWargaming, setIsWargaming] = useState(false);
  const [wargameProgress, setWargameProgress] = useState(0);
  const [aiStaffMessage, setAiStaffMessage] = useState({
    brigade: "LADAKH SECTOR STABLE. Red Force is repositioning artillery vectors out of defensive valley grids. Monitor blind terrain coordinates.",
    intel: "Thermal satellite change detection suggests camouflaged radar footprints at Ladakh coordinate 43Q LD 54109 13582. Low decoy likelihood.",
    fires: "ACCCS Shakti is calibrated. Weapon recommended: supersonic pin-point loitering swarm. Intercept window open for 11 minutes.",
    ew: "Hostile spectrum interference picked up on standard SATCOM frequencies. Cognitive auto-frequency hopping initiated safely."
  });

  // Nominate custom target to High-Value list
  const handleNominateCustomTarget = () => {
    if (!customTargetCoords) return;
    const newTarget = {
      id: `TG-${Math.floor(Math.random() * 300 + 400)}`,
      type: customTargetClass.replace(/_/g, " "),
      coords: customTargetCoords,
      validation: "VERIFIED",
      confidence: 98,
      killProb: 87,
      decoy: "NO",
      camo: "NO",
      lifeTime: "15 min remaining"
    };
    setTargetList(prev => [newTarget, ...prev]);
    setSelectedTargetId(newTarget.id);
    onAddLog({
      source: "TARGET COGNITIVE HUB",
      type: "SUCCESS",
      message: `🎯 NOMINATED NEW TARGET: Specified coordinate grid [${customTargetCoords}] of classification [${newTarget.type}].`
    });
  };

  // Wargaming simulator handlers
  const triggerWargamingSim = () => {
    setIsWargaming(true);
    setWargameProgress(0);
  };

  useEffect(() => {
    if (isWargaming) {
      const interval = setInterval(() => {
        setWargameProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsWargaming(false);
            setWargamingSuccessRate(Math.floor(65 + Math.random() * 25));
            setWargamingRiskScore(Math.floor(20 + Math.random() * 30));
            onAddLog({
              source: "WARGAMING MC ENGINE",
              type: "SUCCESS",
              message: "🎲 MONTE CARLO SIMULATION COMPLETE: Compiled wargaming variables over 1000 iterations."
            });
            return 100;
          }
          return prev + 10;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isWargaming]);

  // Handle battle queries form submission
  const handleSearchQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffQueries.trim()) return;
    setQueryOutput("Processing natural language intent via joint models...");
    setTimeout(() => {
      const q = staffQueries.toLowerCase();
      if (q.includes("sensor")) {
        setQueryOutput("AI BRIEF: Combined sensor feed reliability is 94.2%. Active drone swarms reporting perfect spatial coverage.");
      } else if (q.includes("ladakh") || q.includes("track") || q.includes("threat")) {
        setQueryOutput(`AI SECTOR ANALYTICS: Detected 3 target nodes. S-400 radar active at 43Q LD 54109 13582 has highest weapon allocation priority.`);
      } else {
        setQueryOutput(`REPLY: Analyzed C2 intent '${staffQueries}'. Threat logs stable, weapon queues fully assigned. Recommending COA Alpha for Ladakh front.`);
      }
      onAddLog({
        source: "AI COGNITIVE DESK",
        type: "INFO",
        message: `🤖 INGESTED BATTLE INTENT QUERY: "${staffQueries}"`
      });
    }, 1000);
  };

  // Speed-to-strike simulator loop logic
  useEffect(() => {
    if (coreStatus !== "IDLE" && coreStatus !== "COMPLETE") {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setCoreTimer(elapsed);

        // Core Status progression sequence (representing Module 1 transform speed target)
        if (elapsed > 4.5) {
          setCoreStatus("COMPLETE");
          clearInterval(interval);
          setLoopLogs(prev => [
            ...prev,
            { time: "4.5s", msg: "ASSESSMENT COMPLETED: Target neutralized in Kashmir high altitudes. Kinetic impact 100%.", type: "SUCCESS" }
          ]);
          onAddLog({
            source: "AI COGNITIVE SPINE",
            type: "SUCCESS",
            message: `⚡ SENSOR-TO-SHOOTER LOOP TERMINATED: Successfully designated, routed, and shot weapon inside 4.50 seconds!`
          });
        } else if (elapsed > 3.2 && coreStatus !== "SHOOTER") {
          setCoreStatus("SHOOTER");
          setLoopLogs(prev => [
            ...prev,
            { time: "3.2s", msg: "SHOOTER DISPATCHED: Autonomous BrahMos payload designated with real-time INS telemetry.", type: "ALERT" }
          ]);
        } else if (elapsed > 2.0 && coreStatus !== "COMMANDER") {
          setCoreStatus("COMMANDER");
          setLoopLogs(prev => [
            ...prev,
            { time: "2.0s", msg: "COMMANDER AUTHORIZED: COA Designated. Decoy risk evaluated at 2.4%.", type: "INFO" }
          ]);
        } else if (elapsed > 1.0 && coreStatus !== "FUSION") {
          setCoreStatus("FUSION");
          setLoopLogs(prev => [
            ...prev,
            { time: "1.0s", msg: "AI FUSION INTEGRATION: Track P-104 and P-202 correlated. 98.4% confirmation confidence.", type: "SUCCESS" }
          ]);
        } else if (elapsed > 0.1 && coreTimer === 0) {
          setLoopLogs(prev => [
            ...prev,
            { time: "0.1s", msg: "SENSOR CAPTURED: Multilevel UAV streaming satellite change footprint indicators.", type: "INFO" }
          ]);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [coreStatus]);

  const triggerCoreSimulator = () => {
    setCoreStatus("SENSOR");
    setCoreTimer(0);
    setLoopLogs([
      { time: "0.0s", msg: "TRIGGERED SENSOR-TO-SHOOTER LOOP: Sub-second tactical integration sequence initiated.", type: "INFO" }
    ]);
    onAddLog({
      source: "AI FUSION COGNITION",
      type: "ALERT",
      message: "⚡ INITIATING SUB-SECOND COMMAND EXECUTION CHAIN."
    });
  };

  // Drone Sweep mechanism
  const triggerDroneDeconfliction = () => {
    setDeconflictionStatus("SCANNING");
    setDeconflictionLogs(["INITIATING SPATIAL GRID SCAN...", "PARSING UAV EMISSION VECTORS..."]);
    
    setTimeout(() => {
      setDeconflictionLogs(prev => [...prev, "DECONSPECTING FLIGHT COLLISION ANGLES...", "CROSS-CHECKING SAT WAVEFORMS..."]);
    }, 700);

    setTimeout(() => {
      setDeconflictionStatus("DECONFLICTED");
      setDeconflictionLogs(prev => [...prev, "✓ ZERO MESH COLLISIONS PREDICTED.", "✓ 128 CHANNELS CONFIRMED FOR LAUNCH."]);
      onAddLog({
        source: "STRIX DESK SWEEP",
        type: "SUCCESS",
        message: "✓ SWARM DECONFLICTION COMPLETED: Mesh collision paths neutralized successfully."
      });
    }, 1500);
  };

  return (
    <div id="indra-net-root" className="bg-slate-950 border border-slate-850 rounded-lg overflow-hidden flex flex-col min-h-[620px] shadow-2xl relative">
      
      {/* Dynamic Header Banner */}
      <div className="bg-slate-900/60 p-4 border-b border-slate-850 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-950/50 p-2 border border-purple-800 rounded-lg animate-pulse">
            <Brain className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-white font-extrabold text-[12px] tracking-widest uppercase flex items-center gap-2">
              INDRA-NET C2 2035 SPINE
              <span className="text-[7.5px] bg-purple-900/40 border border-purple-800 text-purple-400 px-2 py-0.5 rounded font-black tracking-normal">
                COGNITIVE AI ACTIVE
              </span>
            </h2>
            <p className="text-[8.5px] text-slate-500 uppercase font-mono mt-0.5">
              Revolutionary Join-Frictionless Sensor-to-Shooter Loop Orchestrator
            </p>
          </div>
        </div>

        {/* System parameters */}
        <div className="flex gap-4 text-xs font-mono">
          <div className="bg-slate-950 border border-slate-850 px-3 py-1 rounded text-right">
            <span className="text-slate-650 text-[7.5px] uppercase block">High Altitude Setting</span>
            <strong className={himalayanOps ? "text-cyan-400 text-[10px]" : "text-amber-500 text-[10px]"}>
              {himalayanOps ? "🗻 KARAKORAM ACTIVE (+30% WIND COMP)" : "🗻 STANDARD SEA-LEVEL GRID"}
            </strong>
          </div>
          <div className="bg-slate-950 border border-slate-850 px-3 py-1 rounded text-right">
            <span className="text-slate-650 text-[7.5px] uppercase block">Loop Latency target</span>
            <strong className="text-red-405 text-[10px] uppercase font-black tracking-wider">⚡ &lt; 5.0 SECONDS</strong>
          </div>
        </div>
      </div>

      {/* Military Subtab Selecor Belt */}
      <div className="bg-slate-950/40 border-b border-slate-905 flex overflow-x-auto">
        {[
          { id: "CORE", name: "I. SPEED-TO-STRIKE", icon: Zap, badge: "SUB-SECOND" },
          { id: "BATTLESPACE", name: "II. UNIFIED THEATER MAP", icon: Globe, badge: "LIVE COP" },
          { id: "SENSOR", name: "III. MULTI-SENSOR FUSION", icon: Tv, badge: "98.4% CONF" },
          { id: "DRONES", name: "IV. DRONE SWARM CONTROL", icon: CompassIcon, badge: "STANDBY" },
          { id: "TARGETS", name: "V. TARGET WEAPONEER", icon: Target, badge: `${targetList.length} HIGH-VAL` },
          { id: "STAFF", name: "VI. AI BRIGADE CHIEF", icon: Users, badge: "MONTE CARLO" }
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex-1 min-w-[140px] px-3 py-2.5 border-r border-slate-905 font-sans text-[10px] font-black uppercase tracking-wider flex items-center justify-between gap-1.5 transition-all text-left ${
                isActive 
                  ? "bg-slate-900 border-b-2 border-b-purple-500 text-white" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900/40"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <tab.icon className={`h-3.5 w-3.5 ${isActive ? "text-purple-400" : "text-slate-500"}`} />
                <span>{tab.name}</span>
              </div>
              <span className={`text-[6.5px] px-1 py-0.5 rounded-sm border ${
                isActive 
                  ? "bg-purple-950 text-purple-400 border-purple-800" 
                  : "bg-slate-950 text-slate-500 border-slate-850"
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Container Wrapper */}
      <div className="p-4 flex-1">
        
        {/* SUBTAB 0: CORE MISSION SPEED-TO-STRIKE SIMULATOR */}
        {activeSubTab === "CORE" && (
          <div className="flex flex-col gap-4">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left Side: Simulation controllers */}
              <div className="md:col-span-4 bg-slate-950/40 border border-slate-850 p-4 rounded-lg flex flex-col gap-4">
                <div>
                  <h3 className="text-white text-[11px] font-extrabold uppercase">Mission Core Parameter Stream</h3>
                  <p className="text-[8.5px] text-slate-550 mt-1 uppercase">
                    Continuous feedback loops that collapse traditional sensor → detection → decision → command → shooter pipelines into structured seconds metrics.
                  </p>
                </div>

                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-850 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-slate-500 uppercase font-bold">Elapsed loop clock:</span>
                    <strong className="text-red-400 font-mono text-[11px] font-black">{coreTimer.toFixed(2)}s</strong>
                  </div>

                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-slate-500 uppercase font-bold">Active step:</span>
                    <span className="bg-purple-950 border border-purple-800 text-purple-400 text-[8px] px-2 py-0.5 rounded font-black font-mono">
                      {coreStatus}
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded overflow-hidden mt-1">
                    <div 
                      className="bg-purple-500 h-full transition-all duration-75"
                      style={{ 
                        width: coreStatus === "IDLE" ? "0%" : coreStatus === "SENSOR" ? "20%" : coreStatus === "FUSION" ? "45%" : coreStatus === "COMMANDER" ? "70%" : coreStatus === "SHOOTER" ? "90%" : "100%" 
                      }} 
                    />
                  </div>
                </div>

                <button
                  onClick={triggerCoreSimulator}
                  disabled={coreStatus !== "IDLE" && coreStatus !== "COMPLETE"}
                  className="w-full p-3 bg-purple-955 hover:bg-purple-900 border border-purple-850 hover:border-purple-650 text-purple-200 hover:text-white font-sans text-[10px] font-black uppercase tracking-widest rounded transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow"
                >
                  <Play className="h-4 w-4 animate-pulse" />
                  INITIATE SPEED-TO-STRIKE LOOP
                </button>

                {coreStatus === "COMPLETE" && (
                  <button
                    onClick={() => {
                      setCoreStatus("IDLE");
                      setCoreTimer(0);
                    }}
                    className="w-full py-2 bg-slate-900 border border-slate-805 hover:bg-slate-850 text-slate-400 hover:text-white text-[9px] font-mono uppercase rounded transition-all"
                  >
                    ♻ Reset execution metrics
                  </button>
                )}
              </div>

              {/* Right Side: Step-by-Step workflow map and terminal diagnostics */}
              <div className="md:col-span-8 flex flex-col gap-4">
                
                {/* Loop Visual Workflow Map */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg">
                  <span className="text-slate-350 text-[10px] font-extrabold uppercase block mb-3 tracking-wide select-none">
                    Traditional pipeline collapse schematic
                  </span>
                  
                  <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-mono relative">
                    
                    {/* Stage 1: Sensor & AI Fusion */}
                    <div className={`p-2.5 rounded border transition-all ${
                      coreStatus === "SENSOR" || coreStatus === "FUSION" 
                        ? "bg-purple-955/20 border-purple-700 text-purple-300" 
                        : coreStatus === "COMMANDER" || coreStatus === "SHOOTER" || coreStatus === "COMPLETE"
                        ? "bg-emerald-950/20 border-emerald-900/60 text-emerald-400"
                        : "bg-slate-900 border-slate-850 text-slate-500"
                    }`}>
                      <Tv className="h-4 w-4 mx-auto mb-1.5" />
                      <strong className="block uppercase text-[10px] font-extrabold">I. SENSOR FUSION</strong>
                      <span className="text-[7px] text-slate-650 uppercase">Extrapolating Feeds</span>
                    </div>

                    {/* Stage 2: AI Commander */}
                    <div className={`p-2.5 rounded border transition-all ${
                      coreStatus === "COMMANDER" 
                        ? "bg-purple-955/20 border-purple-700 text-purple-300"
                        : coreStatus === "SHOOTER" || coreStatus === "COMPLETE"
                        ? "bg-emerald-950/20 border-emerald-900/60 text-emerald-400"
                        : "bg-slate-900 border-slate-850 text-slate-500"
                    }`}>
                      <Brain className="h-4 w-4 mx-auto mb-1.5" />
                      <strong className="block uppercase text-[10px] font-extrabold">II. COGNITIVE C2</strong>
                      <span className="text-[7px] text-slate-650 uppercase">Weaponeering recommendation</span>
                    </div>

                    {/* Stage 3: Joint Shooter */}
                    <div className={`p-2.5 rounded border transition-all ${
                      coreStatus === "SHOOTER" 
                        ? "bg-purple-955/20 border-purple-700 text-purple-300 animate-pulse"
                        : coreStatus === "COMPLETE"
                        ? "bg-emerald-950/20 border-emerald-900/60 text-emerald-400"
                        : "bg-slate-900 border-slate-850 text-slate-500"
                    }`}>
                      <Flame className="h-4 w-4 mx-auto mb-1.5" />
                      <strong className="block uppercase text-[10px] font-extrabold">III. SHOOTER LINK</strong>
                      <span className="text-[7px] text-slate-650 uppercase">ACCCS Shakti launch</span>
                    </div>

                    {/* Stage 4: Battle Assessment */}
                    <div className={`p-2.5 rounded border transition-all ${
                      coreStatus === "COMPLETE" 
                        ? "bg-emerald-950/30 border-emerald-750 text-emerald-300" 
                        : "bg-slate-900 border-slate-850 text-slate-500"
                    }`}>
                      <CheckCircle className="h-4 w-4 mx-auto mb-1.5" />
                      <strong className="block uppercase text-[10px] font-extrabold">IV. IMPACT ASSESSMENT</strong>
                      <span className="text-[7px] text-slate-650 uppercase">Decimation confirmation</span>
                    </div>

                  </div>
                </div>

                {/* Simulated C2 Spine feedback logs console */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg flex-1 flex flex-col gap-2 min-h-[160px]">
                  <span className="text-slate-350 text-[10px] font-bold uppercase block tracking-wider font-mono">
                    Real-Time Pipeline diagnostics log feed:
                  </span>

                  <div className="flex-1 bg-slate-900/60 border border-slate-900 rounded p-2.5 font-mono text-[9px] text-slate-400 overflow-y-auto max-h-[150px] flex flex-col gap-1.5">
                    {loopLogs.map((log, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-slate-600 font-extrabold shrink-0">[{log.time}]</span>
                        <span className={`font-black shrink-0 ${
                          log.type === "SUCCESS" ? "text-emerald-400" : log.type === "ALERT" ? "text-red-400 animate-pulse" : "text-sky-400"
                        }`}>
                          {log.type === "SUCCESS" ? "[SUCCESS]" : log.type === "ALERT" ? "[LAUNCH]" : "[INFO]"}
                        </span>
                        <p className={log.type === "SUCCESS" ? "text-emerald-300" : ""}>{log.msg}</p>
                      </div>
                    ))}
                    {loopLogs.length === 0 && (
                      <span className="italic text-slate-650 text-center uppercase block my-auto py-4">
                        Waiting for sensor triggers over ACCCS Shakti. Click 'Initiate Speed-to-Strike' on left.
                      </span>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* SUBTAB 1: UNIFIED THEATER MAP (COP with Time-Travel Replay) */}
        {activeSubTab === "BATTLESPACE" && (
          <div className="flex flex-col gap-4">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left Side: Map overlays & Theater Selector info */}
              <div className="md:col-span-4 bg-slate-950/40 border border-slate-850 p-4 rounded-lg flex flex-col gap-4">
                <div>
                  <h3 className="text-white text-[11px] font-extrabold uppercase">Topographic Common Operational Picture (COP)</h3>
                  <p className="text-[8.5px] text-slate-550 mt-1 uppercase">
                    Sovereign integration display combining persistent tracking vectors over rugged Karakoram terrain blocks.
                  </p>
                </div>

                {/* Theater Selectors */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[8px] text-slate-550 font-bold uppercase pl-1">Sector Theater Area</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(["LADAKH", "KARAKORAM", "SILIGURI"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setSelectedTheater(t);
                          onAddLog({
                            source: "MAP_PORTAL",
                            type: "INFO",
                            message: `🌐 COP SWAPPED: Switched maps display viewer focus directly to the [${t} SECTOR].`
                          });
                        }}
                        className={`text-[8.5px] py-1.5 font-bold rounded border transition-all ${
                          selectedTheater === t
                            ? "bg-purple-950/40 border-purple-700 text-purple-200"
                            : "bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Map Vector Overlays Toggles */}
                <div className="flex flex-col gap-2 bg-slate-900/40 border border-slate-900 p-2.5 rounded">
                  <span className="text-[8px] text-slate-550 font-bold uppercase pl-0.5">COP Vector Overlays</span>
                  
                  <div className="flex flex-col gap-1.5 text-[9px] text-slate-400 font-mono">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={activeOverlays.terrain} 
                        onChange={(e) => setActiveOverlays(prev => ({ ...prev, terrain: e.target.checked }))}
                        className="rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-0 focus:ring-offset-0" 
                      />
                      <span>Shaded Digital Terrain Relief</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        value="heat" 
                        checked={activeOverlays.threatHeat} 
                        onChange={(e) => setActiveOverlays(prev => ({ ...prev, threatHeat: e.target.checked }))}
                        className="rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-0 focus:ring-offset-0" 
                      />
                      <span>Hostile Threat heatmaps</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={activeOverlays.frontline} 
                        onChange={(e) => setActiveOverlays(prev => ({ ...prev, frontline: e.target.checked }))}
                        className="rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-0 focus:ring-offset-0" 
                      />
                      <span>Dynamic Frontlines overlay</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={activeOverlays.spaceTrack} 
                        onChange={(e) => setActiveOverlays(prev => ({ ...prev, spaceTrack: e.target.checked }))}
                        className="rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-0 focus:ring-offset-0" 
                      />
                      <span>Space trackers & orbits</span>
                    </label>
                  </div>
                </div>

                {/* Time Travel Replay slider */}
                <div className="bg-slate-900/40 border border-slate-900 p-3 rounded flex flex-col gap-2 mt-auto">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-amber-500 font-bold uppercase flex items-center gap-1">
                      <Clock className="h-3 w-3 animate-spin" style={{ animationDuration: "12s" }} /> 
                      TIME-TRAVEL REPLAY
                    </span>
                    <span className="font-mono text-slate-300 font-bold">
                      {timeStep === 12 ? "T-0 (REALTIME)" : timeStep < 12 ? `T-${12 - timeStep} hrs (HISTORIC)` : `T+${timeStep - 12} hrs (FORECAST)`}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={timeStep}
                    onChange={(e) => {
                      setTimeStep(parseInt(e.target.value));
                      onAddLog({
                        source: "TIME TRAVEL REPLAY",
                        type: "INFO",
                        message: `🕒 CALIBRATED COP TIME WINDOW: Evaluated map snapshot at index offset [${e.target.value}].`
                      });
                    }}
                    className="w-full accent-purple-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                  />

                  <div className="flex justify-between text-[7px] text-slate-650 font-mono uppercase">
                    <span>T-12 hrs</span>
                    <span>T-0 (LIVE)</span>
                    <span>T+12 hrs (FORECAST)</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Map Canvas display sandbox */}
              <div className="md:col-span-8 bg-slate-950 border border-slate-850 rounded-lg p-4 flex flex-col justify-between min-h-[340px] relative overflow-hidden">
                
                {/* Visual Grid markers and map labels */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-900 z-10 relative">
                  <div>
                    <span className="text-white text-[10.5px] font-black uppercase tracking-wider block">
                      Sector: {selectedTheater} theater GRID MAP
                    </span>
                    <span className="text-[7.5px] text-slate-500 font-mono uppercase block mt-0.5">
                      Grid reference scale 1:250,000 | Elevation limits: 4,000m - 6,500m
                    </span>
                  </div>

                  <div className="text-[7px] text-slate-650 font-mono uppercase text-right leading-none flex flex-col gap-1 select-none">
                    <span>GRID COORDINATES: 43Q LD [{52000 + timeStep * 50} 13000]</span>
                    <span>CALIBRATION: {himalayanOps ? "🗻 MOUNTAIN WIND INDUCED" : "SEA GROUND ZERO"}</span>
                  </div>
                </div>

                {/* Simulated 2D TOPOGRAPHIC CANVAS container */}
                <div className="relative flex-1 bg-slate-950 border border-slate-900 rounded overflow-hidden my-3 flex items-center justify-center min-h-[220px]">
                  
                  {/* Grid overlay */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                    backgroundImage: "linear-gradient(to right, #475569 1px, transparent 1px), linear-gradient(to bottom, #475569 1px, transparent 1px)",
                    backgroundSize: "22px 22px"
                  }} />

                  {/* Digital topography shaded grid overlay simulation */}
                  {activeOverlays.terrain && (
                    <div className="absolute inset-0 bg-radial-gradient from-emerald-950/15 via-slate-950/50 to-indigo-950/20 opacity-30 pointer-events-none" />
                  )}

                  {/* Threat Heatmap styling block */}
                  {activeOverlays.threatHeat && (
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-red-950/30 to-red-900/20 mix-blend-color-dodge transition-all" />
                  )}

                  {/* SVG drawing dynamic dots */}
                  <svg className="absolute inset-0 w-full h-full text-slate-500 pointer-events-none">
                    {/* Threat Heat circles */}
                    {activeOverlays.threatHeat && (
                      <>
                        <circle cx="70%" cy="30%" r="55" fill="rgba(239, 68, 68, 0.08)" className="animate-pulse" />
                        <circle cx="70%" cy="30%" r="20" fill="rgba(239, 68, 68, 0.15)" />
                      </>
                    )}

                    {/* Red frontline vector path */}
                    {activeOverlays.frontline && (
                      <path 
                        d={`M -20,${180 + (timeStep - 12) * 2} Q 150,${220 + (timeStep - 12) * 1.5} 410,${160 + (timeStep - 12) * 3} T 1000,${190 + (timeStep - 12) * 1.2}`}
                        fill="none" 
                        stroke="#ef4444" 
                        strokeWidth="1.5" 
                        strokeDasharray="4,4" 
                      />
                    )}

                    {/* Drone Swarm Orbit Track */}
                    {activeOverlays.spaceTrack && (
                      <ellipse cx="40%" cy="50%" rx="120" ry="60" fill="none" stroke="#a855f7" strokeWidth="0.8" strokeDasharray="3,6" className="animate-pulse" />
                    )}

                    {/* Dynamic Blue Force tracked node dot */}
                    <circle 
                      cx={150 + timeStep * 3} 
                      cy="120" 
                      r="5.5" 
                      fill="#60a5fa" 
                      className="transition-all duration-300" 
                    />
                    <text x={140 + timeStep * 3} y="105" fill="#60a5fa" fontSize="7.5" fontWeight="black" className="font-mono uppercase transition-all duration-300">
                      C_COY 11-JACK
                    </text>

                    {/* Dynamic Red force threat targets plotted dot */}
                    <circle 
                      cx={320 - (timeStep - 12) * 4} 
                      cy="90" 
                      r="6" 
                      fill="#f87171" 
                      className="transition-all duration-300 animate-pulse" 
                    />
                    <text x={310 - (timeStep - 12) * 4} y="75" fill="#f87171" fontSize="7.5" fontWeight="black" className="font-mono uppercase transition-all duration-300">
                      TG_MOBILE S-400
                    </text>

                    {/* Sensor track indicator box */}
                    <line x1={150 + timeStep * 3} y1="120" x2={320 - (timeStep - 12) * 4} y2="90" stroke="rgba(239, 68, 68, 0.3)" strokeDasharray="2,2" strokeWidth="1" />
                    <text x="35%" y="42%" fill="#f59e0b" fontSize="6.5" className="font-mono uppercase">
                      Engagement link CALC_T: {((320 - (timeStep - 12) * 4) - (150 + timeStep * 3)).toFixed(0)}m
                    </text>
                  </svg>
                  
                  {/* Digital overlay layout */}
                  <div className="absolute bottom-2 left-2 text-[7.5px] uppercase font-mono text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900">
                    Overlays rendering: [{activeOverlays.terrain ? "TERRAIN_3D " : ""}{activeOverlays.threatHeat ? "HEAT " : ""}{activeOverlays.frontline ? "FRONTLINE " : ""}{activeOverlays.spaceTrack ? "ORBITAL" : ""}]
                  </div>

                  {/* Watermark logo */}
                  <div className="absolute right-3 bottom-2 text-[7px] text-slate-750 font-black tracking-widest leading-none select-none">
                    INDRA-NET COGNITIVE SECTOR PLOT
                  </div>
                </div>

                {/* Subtab alert footer stats */}
                <div className="text-[8.5px] text-slate-550 flex justify-between uppercase font-mono border-t border-slate-900 pt-2 z-10 relative">
                  <span>Replay time window tracking index is safe and synchronous.</span>
                  <span>TIME SLIDER OFFSET RANGE: T-24 TO T+12</span>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* SUBTAB 2: MULTI-SENSOR TRACK CORRELATION & FORECAST */}
        {activeSubTab === "SENSOR" && (
          <div className="flex flex-col gap-4">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Side: Sensor reliabilities & sliders */}
              <div className="lg:col-span-4 bg-slate-950/40 border border-slate-850 p-4 rounded-lg flex flex-col gap-4">
                <div>
                  <h3 className="text-white text-[11px] font-extrabold uppercase">Multi-Sensor Track Correlation</h3>
                  <p className="text-[8.5px] text-slate-550 mt-1 uppercase">
                    Dynamically weights multi-source inputs (UAV, satellite, SIGINT, Radar, Acoustic arrays) into verified hostile tracks.
                  </p>
                </div>

                {/* Sliders for sensor reliability */}
                <div className="flex flex-col gap-3 bg-slate-900/40 border border-slate-900 p-3 rounded">
                  <span className="text-[8.5px] text-slate-450 font-extrabold uppercase pl-0.5">Weighted Sensor Coefficients</span>
                  
                  {/* UAV */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
                      <span>UAV (Strix Opticals)</span>
                      <strong className="text-purple-400">{sensorReliability.uav}%</strong>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      value={sensorReliability.uav} 
                      onChange={(e) => setSensorReliability(prev => ({ ...prev, uav: parseInt(e.target.value) }))}
                      className="accent-purple-500 h-1 bg-slate-950" 
                    />
                  </div>

                  {/* Satellite */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
                      <span>SAR Synthetic Satellite</span>
                      <strong className="text-purple-400">{sensorReliability.satellite}%</strong>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      value={sensorReliability.satellite} 
                      onChange={(e) => setSensorReliability(prev => ({ ...prev, satellite: parseInt(e.target.value) }))}
                      className="accent-purple-500 h-1 bg-slate-950" 
                    />
                  </div>

                  {/* SIGINT */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
                      <span>SIGINT/ELINT Waveform Analyzers</span>
                      <strong className="text-purple-400">{sensorReliability.sigint}%</strong>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      value={sensorReliability.sigint} 
                      onChange={(e) => setSensorReliability(prev => ({ ...prev, sigint: parseInt(e.target.value) }))}
                      className="accent-purple-500 h-1 bg-slate-950" 
                    />
                  </div>
                </div>

                {/* Duplication config */}
                <div className="bg-slate-900/40 border border-slate-900 p-3 rounded flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-slate-400 font-bold uppercase">De-Duplicate Coordinates</span>
                    <button 
                      onClick={() => setDuplicateCoordElimination(!duplicateCoordElimination)}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        duplicateCoordElimination ? "bg-emerald-950 border border-emerald-800 text-emerald-400" : "bg-slate-900 border border-slate-800 text-slate-500"
                      }`}
                    >
                      {duplicateCoordElimination ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>
                  <p className="text-[7.5px] text-slate-650 uppercase leading-tight">
                    Entity Resolution algorithm collapses identical track overlaps from separate sources into single target IDs.
                  </p>
                </div>
              </div>

              {/* Vector Extrapolation Box & Predicted list */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Left: Vector Plotting SVG */}
                  <div className="md:col-span-5 bg-slate-905 border border-slate-850 p-4 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="text-white text-[10px] font-black uppercase tracking-wider block">Dead Ground Extrapolation plot</span>
                      <span className="text-[7.5px] text-slate-500 font-mono uppercase block mt-0.5">Calculated blind-angles trajectory vectors</span>
                    </div>

                    <div className="relative bg-slate-950 border border-slate-900 h-[170px] rounded overflow-hidden my-3 p-2 flex flex-col justify-between">
                      {/* Grid overlay */}
                      <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                        backgroundImage: "linear-gradient(to right, #475569 1px, transparent 1px), linear-gradient(to bottom, #475569 1px, transparent 1px)",
                        backgroundSize: "16px 16px"
                      }} />

                      {/* Continuous sweep scan line */}
                      <div className="absolute inset-x-0 h-0.5 bg-amber-500/10 shadow-[0_0_8px_#f59e0b] animate-bounce" style={{ animationDuration: '4s' }} />

                      <svg className="absolute inset-0 w-full h-full text-amber-500 pointer-events-none">
                        {/* Predict path-1 for P-104 */}
                        <path 
                          d={`M 15,35 Q ${110 * lostTrackSpeedMultiplier},${55 + (lostTrackSpeedMultiplier - 1) * 30} ${190 + (lostTrackSpeedMultiplier - 1) * 40},${45 + (lostTrackSpeedMultiplier - 1) * 10}`} 
                          fill="none" 
                          stroke={lostTrackSelectedId === "P-104" ? "#fbbf24" : "#f59e0b"} 
                          strokeWidth={lostTrackSelectedId === "P-104" ? "2.5" : "1.2"} 
                          strokeDasharray="4,3" 
                        />
                        <circle 
                          cx={190 + (lostTrackSpeedMultiplier - 1) * 40} 
                          cy={45 + (lostTrackSpeedMultiplier - 1) * 10} 
                          r={lostTrackSelectedId === "P-104" ? "4.5" : "2.5"} 
                          fill="#fbbf24" 
                          className="animate-pulse" 
                        />
                        {lostTrackSelectedId === "P-104" && (
                          <circle 
                            cx={190 + (lostTrackSpeedMultiplier - 1) * 40} 
                            cy={45 + (lostTrackSpeedMultiplier - 1) * 10} 
                            r="12" 
                            fill="none" 
                            stroke="#fbbf24" 
                            strokeWidth="0.5" 
                            strokeDasharray="2,2" 
                            className="animate-ping" 
                          />
                        )}
                        <text x="25" y="28" fill="#f59e0b" fontSize="6.5" fontWeight="bold">EST. T-90 COLUMN (P-104)</text>
                        
                        {/* Predict path-2 for P-202 */}
                        <path 
                          d={`M 25,115 Q ${120 * lostTrackSpeedMultiplier},${90 - (lostTrackSpeedMultiplier - 1) * 20} ${210 + (lostTrackSpeedMultiplier - 1) * 30},${100 - (lostTrackSpeedMultiplier - 1) * 15}`} 
                          fill="none" 
                          stroke={lostTrackSelectedId === "P-202" ? "#ef4444" : "#dc2626"} 
                          strokeWidth={lostTrackSelectedId === "P-202" ? "2.5" : "1.2"} 
                          strokeDasharray="4,3" 
                        />
                        <circle 
                          cx={210 + (lostTrackSpeedMultiplier - 1) * 30} 
                          cy={100 - (lostTrackSpeedMultiplier - 1) * 15} 
                          r={lostTrackSelectedId === "P-202" ? "4.5" : "2.5"} 
                          fill="#ef4444" 
                          className="animate-pulse" 
                        />
                        {lostTrackSelectedId === "P-202" && (
                          <circle 
                            cx={210 + (lostTrackSpeedMultiplier - 1) * 30} 
                            cy={100 - (lostTrackSpeedMultiplier - 1) * 15} 
                            r="12" 
                            fill="none" 
                            stroke="#ef4444" 
                            strokeWidth="0.5" 
                            strokeDasharray="2,2" 
                            className="animate-ping" 
                          />
                        )}
                        <text x="35" y="108" fill="#ef4444" fontSize="6.5" fontWeight="bold">INFANTRY SHADOW (P-202)</text>
                      </svg>

                      <div className="text-[7.5px] text-yellow-400 font-bold select-none z-10 uppercase bg-slate-950/85 px-1.5 border border-slate-800 rounded self-end">
                        SELECTED: {lostTrackSelectedId}
                      </div>
                    </div>

                    {/* Speed multipler slide */}
                    <div className="flex flex-col gap-1.5 bg-slate-950 border border-slate-900 p-2 rounded">
                      <div className="flex justify-between items-center text-[8.5px] font-mono leading-none">
                        <span className="text-slate-550 uppercase font-black">Adversary Speed multiplier:</span>
                        <strong className="text-amber-500 font-bold">{lostTrackSpeedMultiplier.toFixed(1)}x</strong>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2.0" 
                        step="0.1" 
                        value={lostTrackSpeedMultiplier} 
                        onChange={(e) => setLostTrackSpeedMultiplier(parseFloat(e.target.value))}
                        className="accent-amber-500 h-1 bg-slate-900" 
                      />
                    </div>
                  </div>

                  {/* Right: Tracks list rows */}
                  <div className="md:col-span-7 bg-slate-950 p-4 border border-slate-850 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="text-white text-[10px] font-black uppercase tracking-wider block">Extrapolated Track ledger</span>
                      <span className="text-[7.5px] text-slate-500 font-mono uppercase block mt-0.5">Click rows to model dead zone parameters</span>
                    </div>

                    <div className="flex flex-col gap-2 py-3 flex-1">
                      {predictedTracks.map((tr) => {
                        const isSelected = tr.id === lostTrackSelectedId;
                        return (
                          <div 
                            key={tr.id}
                            onClick={() => setLostTrackSelectedId(tr.id)}
                            className={`p-2.5 rounded border cursor-pointer flex justify-between items-center transition-all ${
                              isSelected
                                ? "bg-amber-950/20 border-amber-800 shadow-md"
                                : "bg-slate-900/60 border-slate-850 hover:bg-slate-900 hover:border-slate-800"
                            }`}
                          >
                            <div>
                              <strong className={`text-[10px] font-mono ${isSelected ? "text-amber-400 font-extrabold" : "text-slate-200"}`}>
                                {tr.id} - {tr.type}
                              </strong>
                              <p className="text-[8px] text-slate-500 uppercase mt-0.5 font-mono">
                                Heading: {tr.heading} | Est Speed: {(parseFloat(tr.speed) * lostTrackSpeedMultiplier).toFixed(0)} km/h
                              </p>
                              <span className="text-[7px] text-slate-600 font-mono italic block">{tr.predictTime}</span>
                            </div>

                            {isSelected && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddLog({
                                    source: "COP INTEGRATOR",
                                    type: "SUCCESS",
                                    message: `🌐 RE-INTEGRATED TARGET: Successfully mapped extrapolating node [${tr.id}] to the Active Common Operational Picture (COP). Trajectory logged.`
                                  });
                                  const extraTarget = {
                                    id: `TG-${Math.floor(Math.random() * 300 + 400)}`,
                                    type: tr.type === "ARMOR" ? "T-90 tank regiment" : "Muff Recon infantry",
                                    coords: `43Q LD ${51000 + Math.floor(Math.random() * 2000)} ${12000 + Math.floor(Math.random() * 1000)}`,
                                    validation: "VERIFIED",
                                    confidence: Math.floor(95 * (2.5 - lostTrackSpeedMultiplier) / 1.5),
                                    killProb: 88,
                                    decoy: "NO",
                                    camo: "YES",
                                    lifeTime: "18 min remaining"
                                  };
                                  setTargetList(prev => [extraTarget, ...prev]);
                                  setSelectedTargetId(extraTarget.id);
                                  setActiveSubTab("TARGETS");
                                }}
                                className="bg-amber-955 hover:bg-amber-900 border border-amber-800 hover:border-amber-700 text-amber-300 font-bold px-2 py-1 rounded text-[8.5px] uppercase transition-all shadow"
                              >
                                Re-Integrate to Active COP
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-slate-900/60 p-2 border border-slate-900 rounded text-[7.5px] text-slate-500 leading-normal uppercase">
                      💡 MULTI-SENSOR CONFIRMATION: Combining SAR changes & signal logs increases tracking persistence across mountains.
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* SUBTAB 3: DRONE swarm command AND mesh deconfliction */}
        {activeSubTab === "DRONES" && (
          <div className="flex flex-col gap-4">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left Side: Swarm controls */}
              <div className="md:col-span-4 bg-slate-950/40 border border-slate-850 p-4 rounded-lg flex flex-col gap-3">
                <div>
                  <h3 className="text-white text-[11px] font-extrabold uppercase">Swarm Cloud Command Deck</h3>
                  <p className="text-[8.5px] text-slate-550 mt-1 uppercase">
                    Launch, monitor, and route multi-payload autonomous recon-strike swarms over rugged peaks.
                  </p>
                </div>

                {/* Command actions */}
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] text-slate-550 font-bold uppercase pl-1">Mesh swarm operations controls</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSwarmState("LAUNCHED");
                        onAddLog({
                          source: "SWARM COMMAND",
                          type: "SUCCESS",
                          message: "🚀 LAUNCHED: Strix recon swarms deployed into Kashmir Ladakh sky grids."
                        });
                      }}
                      className={`py-2 px-2.5 font-bold rounded border uppercase text-[8.5px] tracking-wide transition-all ${
                        swarmState === "LAUNCHED"
                          ? "bg-purple-950 border-purple-700 text-purple-300"
                          : "bg-slate-900 border-slate-850 text-slate-400 hover:text-white"
                      }`}
                    >
                      Deploy Swarms
                    </button>
                    <button
                      onClick={() => {
                        setSwarmState("ROUTING");
                        onAddLog({
                          source: "SWARM ROUTE INTERCEPT",
                          type: "INFO",
                          message: "🛰️ WAYPOINT CODES DISTRIBUTED: Mapping terrain contours dynamically."
                        });
                      }}
                      className={`py-2 px-2.5 font-bold rounded border uppercase text-[8.5px] tracking-wide transition-all ${
                        swarmState === "ROUTING"
                          ? "bg-purple-950 border-purple-700 text-purple-300"
                          : "bg-slate-900 border-slate-850 text-slate-400 hover:text-white"
                      }`}
                    >
                      Contours Routing
                    </button>
                  </div>
                </div>

                {/* Mesh Status metrics */}
                <div className="bg-slate-900/40 border border-slate-900 p-3 rounded flex flex-col gap-2">
                  <span className="text-[8px] text-slate-450 font-bold uppercase">Mesh Node Specifications</span>
                  
                  <div className="flex justify-between items-center text-[9px] font-mono leading-none">
                    <span>Mesh Network Health:</span>
                    <strong className="text-emerald-400">100.0% Operational</strong>
                  </div>
                  
                  <div className="flex justify-between items-center text-[9px] font-mono leading-none">
                    <span>GPS-Denied Fallback System:</span>
                    <button 
                      onClick={() => setGpsDeniedFallback(!gpsDeniedFallback)}
                      className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${gpsDeniedFallback ? "bg-cyan-950 border border-cyan-800 text-cyan-400" : "bg-slate-900 text-slate-550"}`}
                    >
                      {gpsDeniedFallback ? "INS FALLBACK ON" : "INS STANDBY"}
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono leading-none">
                    <span>Spectrum Jamming Override:</span>
                    <button 
                      onClick={() => setMeshJammed(!meshJammed)}
                      className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${meshJammed ? "bg-red-955 border border-red-950 text-red-400 animate-pulse" : "bg-slate-900 text-slate-550"}`}
                    >
                      {meshJammed ? "🚨 OVERRIDES ACTIVE" : "STABLE WAVEFORMS"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side: Visual Swarm grids & Sweeper scanner */}
              <div className="md:col-span-8 flex flex-col gap-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Drone fleet list board */}
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="text-white text-[10px] font-black uppercase tracking-wider block">Mesh Drone Active Fleet</span>
                      <span className="text-[7.5px] text-slate-550 font-mono uppercase block mt-0.5">Real-time coordinates and packet telemetry</span>
                    </div>

                    <div className="flex flex-col gap-2 py-3 flex-1">
                      {activeDronesList.map((dr) => (
                        <div key={dr.id} className="p-2 bg-slate-900/60 border border-slate-850 rounded flex justify-between items-center text-[8.5px] font-mono">
                          <div>
                            <strong className="text-white block uppercase text-[9px]">{dr.id} - {dr.name}</strong>
                            <span className="text-slate-550 uppercase">Payload: {dr.activePayload}</span>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1 shrink-0">
                            <span className="text-emerald-450 uppercase font-black">{dr.status}</span>
                            <div className="flex gap-2 text-[7px] text-slate-500 uppercase font-bold">
                              <span>🔋 {dr.battery}%</span>
                              <span>📶 {dr.signal}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mesh Deconfliction Sweeper scanner block */}
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg flex flex-col justify-between min-h-[220px]">
                    <div>
                      <span className="text-white text-[10px] font-black uppercase tracking-wider block">Mesh Deconfliction Optimizer</span>
                      <span className="text-[7.5px] text-slate-550 font-mono uppercase block mt-0.5">Calculates secure vector waveform offsets</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-850 p-3 rounded flex flex-col gap-2 flex-1 my-3 justify-center">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-slate-400 font-bold uppercase">Deconfliction Status:</span>
                        <strong className={`font-black uppercase text-[10px] ${
                          deconflictionStatus === "SCANNING" ? "text-amber-500 animate-pulse" : deconflictionStatus === "DECONFLICTED" ? "text-emerald-400 font-extrabold" : "text-slate-500"
                        }`}>
                          {deconflictionStatus}
                        </strong>
                      </div>

                      <div className="h-20 bg-slate-950 border border-slate-900 rounded p-2 overflow-y-auto font-mono text-[7px] flex flex-col gap-1 text-slate-400 leading-tight">
                        {deconflictionLogs.map((lg, i) => (
                          <div key={i} className="flex gap-1.5">
                            <span className="text-slate-600 shrink-0">·</span>
                            <p>{lg}</p>
                          </div>
                        ))}
                        {deconflictionLogs.length === 0 && (
                          <span className="italic uppercase text-slate-650 font-black text-center my-auto block">
                            OPTIMIZER IDLE. CLICK TRIGGER DECONFLICT SWEEP ON BOTTOM.
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={triggerDroneDeconfliction}
                      disabled={deconflictionStatus === "SCANNING"}
                      className={`w-full py-2 font-mono text-[8.5px] font-black uppercase tracking-wider rounded border transition-all ${
                        deconflictionStatus === "SCANNING"
                          ? "bg-slate-950 border-slate-900 text-slate-650 cursor-not-allowed"
                          : "bg-purple-955 hover:bg-purple-900 border-purple-800 text-purple-200 active:scale-95"
                      }`}
                    >
                      {deconflictionStatus === "SCANNING" ? "SCANNING SPECTRUM WAVEFORMS..." : "TRIGGER DECONFLICT SWEEP"}
                    </button>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* SUBTAB 4: TARGETING LEDGER AND WEAPONEER MATCHUPS */}
        {activeSubTab === "TARGETS" && (
          <div className="flex flex-col gap-4">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left Side Target creation & prioritization settings */}
              <div className="md:col-span-4 bg-slate-950/40 border border-slate-850 p-4 rounded-lg flex flex-col gap-3">
                <span className="text-[10px] text-slate-350 font-black uppercase tracking-wider block">
                  Automatic Target Creation Config
                </span>

                <div className="flex flex-col gap-2.5">
                  <div>
                    <label className="text-slate-500 text-[8.5px] uppercase block mb-1">Target Coordinates</label>
                    <input
                      type="text"
                      value={customTargetCoords}
                      onChange={(e) => setCustomTargetCoords(e.target.value)}
                      placeholder="e.g. 43Q LD 51200 13400"
                      className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white font-mono placeholder-slate-650"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 text-[8.5px] uppercase block mb-1">Target Classification</label>
                    <select
                      value={customTargetClass}
                      onChange={(e) => setCustomTargetClass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white font-mono uppercase"
                    >
                      <option value="ARTILLERY_BATTERY">Artillery Battery</option>
                      <option value="MISSILE_SILO">Mobile Missile Silo</option>
                      <option value="SATELLITE_JAMMER">Spectrum Radar Jammer</option>
                      <option value="HOSTILE_COMMAND_DESK">Adversary HQ Bunker</option>
                    </select>
                  </div>

                  <button
                    onClick={handleNominateCustomTarget}
                    className="w-full p-2 bg-amber-955 hover:bg-amber-900 border border-amber-800 hover:border-amber-700 text-amber-400 hover:text-amber-300 font-mono text-[9.5px] uppercase font-black tracking-wide rounded transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>NOMINATE TARGET NODE</span>
                  </button>
                </div>

                <div className="h-px bg-slate-850" />

                <div className="p-3 bg-slate-950 border border-slate-890 rounded-lg text-[9px] text-slate-500 leading-normal">
                   <span className="text-amber-400 font-bold uppercase block mb-1">💡 COGNITIVE WEAPONEERING:</span>
                   Analyzes decoy profiles, calculates probability of kill, predicts mobile target movement paths, and estimates collateral effects dynamically.
                </div>
              </div>

              {/* Right Side Targets Ledger Table */}
              <div className="md:col-span-8 flex flex-col gap-4">
                
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3">
                    <div>
                      <span className="text-white text-[10px] font-bold uppercase block tracking-wide block">
                        Target Hub ledgers & Predicatives (Mo. 4 & 5 Integration)
                      </span>
                      <span className="text-[7px] text-slate-500 uppercase font-mono block">Click on any target row below to match weapon platforms</span>
                    </div>
                    <span className="text-[7.5px] bg-red-955 border border-red-950 text-red-500 px-2 py-0.5 rounded font-bold uppercase leading-none">
                      Active High-Value Queue
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full font-mono text-[9px] text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 text-left uppercase">
                          <th className="py-2 pl-2">ID</th>
                          <th className="py-2 flex items-center gap-1.5">CLASSIFICATION TAG</th>
                          <th className="py-2 text-center">VALIDATION</th>
                          <th className="py-2 text-center">ASSIGNMENT</th>
                          <th className="py-2 text-right">LOWER LIFETIME PREDICTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {targetList.map((tg) => {
                          const isDecoy = tg.decoy === "YES";
                          const isSelected = selectedTargetId === tg.id;
                          const currentWeapon = assignedWeapon[tg.id] || "BRAHMOS";
                          return (
                            <tr 
                              key={tg.id} 
                              onClick={() => {
                                setSelectedTargetId(tg.id);
                                if (targetUnderStrikeId !== tg.id) {
                                  setTargetStrikeStage("IDLE");
                                  setTargetUnderStrikeId(null);
                                }
                              }}
                              className={`border-b border-slate-900 cursor-pointer transition-all ${
                                isSelected 
                                  ? "bg-red-955/20 border-red-800 shadow-inner" 
                                  : "hover:bg-slate-900"
                              }`}
                            >
                              <td className="py-2.5 pl-2 font-bold select-all flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-red-500 animate-ping" : "bg-slate-700"}`} />
                                <span className={isSelected ? "text-red-400 font-extrabold" : "text-slate-400"}>{tg.id}</span>
                              </td>
                              <td className="py-2.5 font-semibold">
                                <div className="flex flex-col">
                                  <span className={isSelected ? "text-white" : "text-slate-300"}>{tg.type}</span>
                                  <span className="text-[8px] text-slate-555 select-all">{tg.coords}</span>
                                </div>
                              </td>
                              <td className="py-2.5 text-center">
                                <span className={`px-1.5 py-0.5 rounded-sm border text-[7.5px] font-black ${
                                  isDecoy 
                                    ? "bg-amber-955/40 border-amber-800 text-amber-550 animate-pulse" 
                                    : "bg-emerald-955/45 border-emerald-900 text-emerald-450"
                                }`}>
                                  {tg.validation}
                                </span>
                              </td>
                              <td className="py-2.5 text-center">
                                <span className="bg-slate-900 border border-slate-800 text-[8px] text-slate-400 px-1.5 py-0.5 rounded uppercase">
                                  {currentWeapon}
                                </span>
                              </td>
                              <td className="py-2.5 text-right font-semibold text-slate-400 pr-2">{tg.lifeTime}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Selected Threat Weaponeering Console Desk */}
                {selectedTargetId && (
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-white text-[10px] font-black uppercase tracking-wider">
                          Cognitive Weaponeering Solution: {selectedTargetId}
                        </span>
                      </div>
                      <span className="text-[7.5px] text-slate-500 font-mono select-all">
                        COORDINATE GRID: {targetList.find(t => t.id === selectedTargetId)?.coords}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Weapon selector lists */}
                      <div className="flex flex-col gap-3">
                        <span className="text-[8px] text-slate-550 font-bold uppercase font-mono">Assigned Weapon Platform Selection</span>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { code: "BRAHMOS", name: "BrahMos Block-III", desc: "Hypersonic Cruise (Mach 4.2)" },
                            { code: "PINAKA", name: "Pinaka MBRL G-III", desc: "Guided Salvo Rockets (45km)" },
                            { code: "SWARM", name: "Kamikaze Swarm", desc: "24 Loitering Drone Cloud" },
                            { code: "ARTILLERY", name: "155mm Dhanush Shells", desc: "Heavy Precision Howitzer" }
                          ].map((w) => {
                            const activeWeapon = assignedWeapon[selectedTargetId] || "BRAHMOS";
                            const isActive = activeWeapon === w.code;
                            return (
                              <div 
                                key={w.code}
                                onClick={() => {
                                  setAssignedWeapon(prev => ({ ...prev, [selectedTargetId]: w.code as any }));
                                  onAddLog({
                                    source: "COGNITIVE WEAPONEER",
                                    type: "SUCCESS",
                                    message: `🎯 WEAPON ASSIGNED: Allocated strike vector [${w.name}] for target [${selectedTargetId}].`
                                  });
                                }}
                                className={`p-2.5 rounded-lg border cursor-pointer flex flex-col gap-1 transition-all ${
                                  isActive
                                    ? "bg-red-955/20 border-red-700 hover:border-red-650 shadow-md"
                                    : "bg-slate-900 border-slate-850 hover:border-slate-800"
                                }`}
                              >
                                <span className={`text-[9px] font-bold uppercase leading-none ${isActive ? "text-red-400" : "text-slate-200"}`}>
                                  {w.name}
                                </span>
                                <span className="text-[7px] text-slate-500 leading-tight uppercase font-mono">{w.desc}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Risk profile charts & Fire Launch Control */}
                      <div className="flex flex-col justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-850 gap-2.5">
                        <div className="flex flex-col gap-2">
                          <span className="text-[8px] text-slate-555 uppercase font-bold tracking-wider font-mono">STRIKE SUCCESS PREDICTIONS MATRIX</span>
                          
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-slate-950 border border-slate-900 p-1.5 rounded">
                              <span className="text-[6.5px] text-slate-650 uppercase block font-mono">Prob of Kill</span>
                              <strong className="text-[11px] text-emerald-400 font-mono">
                                {assignedWeapon[selectedTargetId] === "BRAHMOS" ? "92%" : assignedWeapon[selectedTargetId] === "PINAKA" ? "81%" : assignedWeapon[selectedTargetId] === "SWARM" ? "88%" : "72%"}
                              </strong>
                            </div>
                            <div className="bg-slate-950 border border-slate-900 p-1.5 rounded">
                              <span className="text-[6.5px] text-slate-650 uppercase block font-mono">Collateral Risk</span>
                              <strong className="text-[11px] text-amber-500 font-mono">
                                {assignedWeapon[selectedTargetId] === "BRAHMOS" ? "0.4%" : assignedWeapon[selectedTargetId] === "PINAKA" ? "6.8%" : assignedWeapon[selectedTargetId] === "SWARM" ? "1.2%" : "4.0%"}
                              </strong>
                            </div>
                            <div className="bg-slate-950 border border-slate-900 p-1.5 rounded">
                              <span className="text-[6.5px] text-slate-650 uppercase block font-mono">Decoy Probability</span>
                              <strong className="text-[11px] text-slate-405 font-mono">
                                {selectedTargetId === "TG-303" ? "100%" : "2.4%"}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Fire Command Trigger system */}
                        {targetUnderStrikeId === selectedTargetId ? (
                          <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-400">
                              <span>STRIKE STAGE: <strong className="text-red-400 uppercase">{targetStrikeStage}</strong></span>
                              {targetStrikeStage !== "SUCCESS" && <span className="text-red-500 animate-ping">⮚ FLIGHT ACTIVE</span>}
                            </div>

                            {/* Hypersonic trajectory plotting animation */}
                            <div className="h-5 bg-slate-900 rounded overflow-hidden relative border border-slate-950 flex items-center">
                              {/* Glowing vector line representing terminal point */}
                              <div className="absolute left-0 top-0 bottom-0 bg-red-650/15" style={{
                                width: targetStrikeStage === "BOOSTER" ? "25%" : targetStrikeStage === "CRUISE" ? "60%" : targetStrikeStage === "TERMINAL" ? "90%" : "100%"
                              }} />
                              
                              <div className="absolute inset-0 flex items-center justify-between px-3 text-[7px] font-mono text-slate-400 font-black z-10">
                                <span className={targetStrikeStage === "BOOSTER" ? "text-yellow-400 animate-pulse" : "text-slate-600"}>IGNITION</span>
                                <span className={targetStrikeStage === "CRUISE" ? "text-cyan-400 animate-pulse" : "text-slate-600"}>HYPERSONIC CRUISE</span>
                                <span className={targetStrikeStage === "TERMINAL" ? "text-amber-500 animate-pulse" : "text-slate-600"}>TERMINAL DIVE</span>
                                <span className={targetStrikeStage === "SUCCESS" ? "text-emerald-400" : "text-slate-600"}>IMPACT</span>
                              </div>
                            </div>

                            {targetStrikeStage === "SUCCESS" ? (
                              <button
                                onClick={() => {
                                  setTargetUnderStrikeId(null);
                                  setTargetStrikeStage("IDLE");
                                }}
                                className="w-full py-1.5 bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold text-[8.5px] rounded uppercase transition-all"
                              >
                                ✓ STRIKE ANALYSIS LOGGED. RESET CONSOLE
                              </button>
                            ) : (
                              <span className="text-[7.5px] text-slate-500 font-mono block text-center uppercase">
                                Telemetry Link Active over ACCCS Shakti
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setTargetUnderStrikeId(selectedTargetId);
                              setTargetStrikeStage("BOOSTER");
                              onAddLog({
                                source: "SHAKTI SHOOTER HUB",
                                type: "ALERT",
                                message: `🚀 FIRE COMMAND SUBMITTED: Authorized launch. Dispatching [${assignedWeapon[selectedTargetId] || "BRAHMOS"}] strike at coordinates [${targetList.find(t => t.id === selectedTargetId)?.coords}].`
                              });

                              // Booster stage transition
                              setTimeout(() => {
                                setTargetStrikeStage("CRUISE");
                                onAddLog({
                                  source: "TELEMETRY RADAR",
                                  type: "INFO",
                                  message: "Hypersonic booster separation completed. Speed stabilized at Mach 4.2 altitude 32km."
                                });
                              }, 1500);

                              // Cruise stage transition
                              setTimeout(() => {
                                setTargetStrikeStage("TERMINAL");
                                onAddLog({
                                  source: "MILI-RECON LASER",
                                  type: "INFO",
                                  message: "Entering terminal guidance locking. Tracking satellite telemetry."
                                });
                              }, 3200);

                              // Success impact
                              setTimeout(() => {
                                setTargetStrikeStage("SUCCESS");
                                onAddLog({
                                  source: "ACQUISITION SHOT SENSOR",
                                  type: "SUCCESS",
                                  message: "🎯 TARGET DESTROYED: Kinetic impact accomplished successfully."
                                });
                                // Mark in targetList that the target is destroyed
                                setTargetList(prev => prev.map(t => {
                                  if (t.id === selectedTargetId) {
                                    return { ...t, validation: "NEUTRALIZED", lifeTime: "0 min (Neutralized)" };
                                  }
                                  return t;
                                }));
                              }, 4800);
                            }}
                            className="w-full p-2.5 bg-red-955 hover:bg-red-900 border border-red-700 hover:border-red-500 text-red-100 hover:text-white font-mono text-[9.5px] uppercase font-black tracking-widest rounded transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow shadow-red-955/40 animate-pulse"
                          >
                            🚀 AUTHORIZE FIRE COMMAND SECONDS CHAIN
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* SUBTAB 5: DECISION STAFF WARGAMING COA (Mo. 6, 7 & 9) */}
        {activeSubTab === "STAFF" && (
          <div className="flex flex-col gap-4">
            
            {/* Top row: What-if slider panel & multi-agent metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-slate-905 border border-slate-850 p-4 rounded-lg flex flex-col justify-between h-[180px]">
                <div>
                  <h4 className="text-white font-bold text-[10.5px] uppercase">Wargaming Campaign Forecast</h4>
                  <p className="text-[8px] text-slate-500 uppercase mt-0.5">Continuous evaluation loop</p>
                </div>

                {isWargaming ? (
                  <div className="py-2.5 flex flex-col gap-1.5 justify-center items-center h-[52px]">
                    <span className="text-[7.5px] text-indigo-400 font-extrabold uppercase animate-pulse flex items-center gap-1">
                      <RefreshCw className="h-2.5 w-2.5 animate-spin text-indigo-400" />
                      SIMULATING 1000 RUNS ({wargameProgress}%)
                    </span>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full transition-all duration-150" style={{ width: `${wargameProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center py-2 border-t border-b border-slate-905">
                    <div className="text-center w-[45%]">
                      <span className="text-[7.5px] text-slate-500 block uppercase font-black text-center">Success estimate</span>
                      <strong className="text-emerald-400 font-black text-xs font-mono text-center block leading-none">{wargamingSuccessRate}%</strong>
                    </div>
                    <div className="h-6 w-px bg-slate-905" />
                    <div className="text-center w-[45%]">
                      <span className="text-[7.5px] text-slate-500 block uppercase font-black text-center">Unified risk index</span>
                      <strong className="text-red-400 font-black text-xs font-mono text-center block leading-none">{wargamingRiskScore}%</strong>
                    </div>
                  </div>
                )}

                <button
                  onClick={triggerWargamingSim}
                  disabled={isWargaming}
                  className={`w-full text-center py-1.5 text-[8.5px] uppercase font-black tracking-wide rounded transition-all ${
                    isWargaming
                      ? "bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed"
                      : "bg-indigo-950 hover:bg-slate-900 border border-indigo-850 hover:border-indigo-700 text-indigo-400 active:scale-95"
                  }`}
                >
                  {isWargaming ? "RUNNING MONTE CARLO..." : "RE-CALIBRATE ESTIMATES"}
                </button>
              </div>

              {/* Natural language battle query interface (Module 9 revolutionary features) */}
              <div className="md:col-span-2 bg-slate-905 border border-slate-850 p-4 rounded-lg flex flex-col justify-between min-h-[180px]">
                <div>
                  <h4 className="text-white font-bold text-[10.5px] uppercase">Natural Language Battle Queries Engine</h4>
                  <p className="text-[8.5px] text-slate-550 mt-0.5 leading-normal uppercase">
                    Revolutionary intent-based command. Voice-controlled COP matching models (e.g. "Draft logistics brief" or "Check Ladakh S-400 threat matrices").
                  </p>
                </div>

                <form onSubmit={handleSearchQuery} className="flex gap-2 py-2">
                  <input
                    type="text"
                    value={staffQueries}
                    onChange={(e) => setStaffQueries(e.target.value)}
                    placeholder="Ask INDRA: 'Check sensor status' or 'Summarize Ladakh Sector threat tracks'..."
                    className="flex-1 bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-white font-mono placeholder-slate-650 text-[9px]"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-950 hover:bg-indigo-900 border border-indigo-805 text-indigo-400 font-bold px-3 py-1.5 uppercase rounded text-[9px] transition-all"
                  >
                    QUERY
                  </button>
                </form>

                <div className="bg-slate-900/60 p-2 border border-slate-900 rounded font-mono text-[8.5px] text-slate-400 leading-relaxed max-h-16 overflow-y-auto">
                  {queryOutput}
                </div>
              </div>

            </div>

            {/* Bottom Row: Multi-Agent AI staff dashboard desk (Modular joint operations officer assistants) */}
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-white text-[10px] font-bold uppercase block tracking-wide">
                  COGNITIVE ASSISTANT STAFF COUNSEL (Multi-Agent Brigade Assistant)
                </span>
                <span className="text-[7.5px] text-indigo-400 uppercase">Continuous Campaign Optimization loops</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Assistant 1: Commander Assistant */}
                <div className="p-3 bg-slate-905 border border-slate-850 rounded flex flex-col justify-between">
                  <div>
                    <h5 className="text-white font-extrabold text-[9px] uppercase border-b border-slate-800 pb-1 flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-cyan-400" />
                      AI BRIGADE STAFF ASSIST.
                    </h5>
                    <p className="text-[8.5px] text-slate-400 leading-relaxed mt-1.5 italic">
                      "{aiStaffMessage.brigade}"
                    </p>
                  </div>
                  <span className="text-[7px] text-slate-500 uppercase mt-3">Level: STRATEGIC</span>
                </div>

                {/* Assistant 2: Intelligence Staff */}
                <div className="p-3 bg-slate-905 border border-slate-850 rounded flex flex-col justify-between">
                  <div>
                    <h5 className="text-white font-extrabold text-[9px] uppercase border-b border-slate-800 pb-1 flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-amber-400" />
                      AI INTEL STRATEGIST
                    </h5>
                    <p className="text-[8.5px] text-slate-400 leading-relaxed mt-1.5 italic">
                      "{aiStaffMessage.intel}"
                    </p>
                  </div>
                  <span className="text-[7px] text-slate-500 uppercase mt-3">Level: THREAT CLASSIFICATION</span>
                </div>

                {/* Assistant 3: Fires Officer */}
                <div className="p-3 bg-slate-905 border border-slate-850 rounded flex flex-col justify-between">
                  <div>
                    <h5 className="text-white font-extrabold text-[9px] uppercase border-b border-slate-800 pb-1 flex items-center gap-1">
                      <Target className="h-3.5 w-3.5 text-red-400" />
                      AI FIRES STRATEGIST
                    </h5>
                    <p className="text-[8.5px] text-slate-400 leading-relaxed mt-1.5 italic">
                      "{aiStaffMessage.fires}"
                    </p>
                  </div>
                  <span className="text-[7px] text-slate-500 uppercase mt-3">Level: WEAPONEERING</span>
                </div>

                {/* Assistant 4: EW officer advisor */}
                <div className="p-3 bg-slate-905 border border-slate-850 rounded flex flex-col justify-between">
                  <div>
                    <h5 className="text-white font-extrabold text-[9px] uppercase border-b border-slate-800 pb-1 flex items-center gap-1">
                      <Radio className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                      AI DIGITAL SPINE EW
                    </h5>
                    <p className="text-[8.5px] text-slate-400 leading-relaxed mt-1.5 italic">
                      "{aiStaffMessage.ew}"
                    </p>
                  </div>
                  <span className="text-[7px] text-slate-500 uppercase mt-3">Level: EW COGNITIVE PATHING</span>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>

      {/* Footer statistics ribbon */}
      <div className="bg-slate-950 p-2.5 border-t border-slate-850 flex items-center justify-between text-[8px] text-slate-500">
        <span>SECURITY ENVELOPE: HARDENED PL-20 CONTAINER</span>
        <span>LATENCY TRUNK: SECURE TRADING SPEED COGNITIONS COMPLETED IN 3.12 SECONDS</span>
        <span className="flex items-center gap-1.5 text-indigo-400">
          <Activity className="h-3.5 w-3.5 animate-pulse" />
          SYSTEM STABLE
        </span>
      </div>

    </div>
  );
}
