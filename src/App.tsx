import React, { useState } from "react";
import { Role, TacticalNode, TacticalTrack, CombatPowerIndex, TacticalLog, KillChainState, CommandSystem } from "./types";
import TacticalMap from "./components/TacticalMap";
import KillChainModule from "./components/KillChainModule";
import IntelligenceBrain from "./components/IntelligenceBrain";
import CommanderDashboard from "./components/CommanderDashboard";
import IndraAdvisor from "./components/IndraAdvisor";
import UnifiedSectorHub from "./components/UnifiedSectorHub";
import DeltaPortal from "./components/DeltaPortal";
import { Shield, Eye, Flame, Brain, Database, ShieldAlert, Compass, Play, RotateCcw, AlertTriangle, FileText } from "lucide-react";

export default function App() {
  const [currentRole, setCurrentRole] = useState<Role>(Role.COMMANDER);
  const [selectedTrack, setSelectedTrack] = useState<TacticalTrack | null>(null);
  const [killChainState, setKillChainState] = useState<KillChainState>(KillChainState.FIND);
  const [himalayanOps, setHimalayanOps] = useState<boolean>(false);
  const [insightMode, setInsightMode] = useState<"NORMAL" | "DEAD_GROUND" | "TRAFFICABILITY">("NORMAL");
  const [activeWorkspace, setActiveWorkspace] = useState<"LOBBY" | "MONITOR" | "VEZHA" | "ELEMENT" | "TARGET_HUB" | "TUBE" | "WIKI" | "DATA_FABRIC" | "PRISMA" | "BRAIN_2035">("LOBBY");

  // Indian C2 integrated systems state based on precise user specification list
  const [systems, setSystems] = useState<CommandSystem[]>([
    // ARMY (9 Systems)
    { id: "s-1", name: "Air Defence Command & Control System", acronym: "Akashteer", branch: "ARMY", status: "INTEGRATED", description: "Tactical air defence monitoring, sensor tracking, and interceptor integration.", activeOverlay: true },
    { id: "s-2", name: "Artillery Command Control System", acronym: "ACCCS Shakti", branch: "ARMY", status: "STANDBY", description: "Precision artillery trajectory mapping, fire command networks, and howitzer integration.", activeOverlay: false },
    { id: "s-3", name: "Battlefield Surveillance System", acronym: "Project Sanjay", branch: "ARMY", status: "INTEGRATED", description: "Ground sensor network surveillance and border situational reporting.", activeOverlay: false },
    { id: "s-4", name: "Battlefield Surveillance Sensor integration", acronym: "BSS", branch: "ARMY", status: "INTEGRATED", description: "Direct multi-sensor mapping and local thermal camera feeds correlation.", activeOverlay: false },
    { id: "s-5", name: "Battlefield Management System", acronym: "BMS", branch: "ARMY", status: "STANDBY", description: "Frontline scout telemetry, squad communications, and localized high-density GIS mapping.", activeOverlay: false },
    { id: "s-6", name: "Army Static Switched Communication Network", acronym: "ASCON", branch: "ARMY", status: "INTEGRATED", description: "Secure static microwave communication lines and cryptographic routing trunks.", activeOverlay: false },
    { id: "s-7", name: "Tactical Communication System", acronym: "TCS", branch: "ARMY", status: "INTEGRATED", description: "High-performance software defined tactical radios and frequency hop nodes.", activeOverlay: false },
    { id: "s-8", name: "Command Information & Decision Support System", acronym: "CIDSS", branch: "ARMY", status: "STANDBY", description: "Command room decision models, local unit maps, and deployment metrics.", activeOverlay: false },
    { id: "s-9", name: "Army Data Network", acronym: "ADN", branch: "ARMY", status: "INTEGRATED", description: "High-bandwidth military data network spine.", activeOverlay: false },

    // AIR_FORCE (6 Systems)
    { id: "s-10", name: "Integrated Air Command & Control System", acronym: "IACCS", branch: "AIR_FORCE", status: "INTEGRATED", description: "Integrated airspace tracking system linking civilian radars, AWACS, and interceptors.", activeOverlay: true },
    { id: "s-11", name: "Air Force Network", acronym: "AFNET", branch: "AIR_FORCE", status: "INTEGRATED", description: "Sovereign fibre-optic digital backbone connecting all IAF stations and airbases.", activeOverlay: false },
    { id: "s-12", name: "Air Defence Ground Environment", acronym: "ADGE", branch: "AIR_FORCE", status: "STANDBY", description: "Static ground radar array surveillance networks and early warnings.", activeOverlay: false },
    { id: "s-13", name: "Integrated Air Defence Network", acronym: "IADN", branch: "AIR_FORCE", status: "INTEGRATED", description: "Unified surface-to-air missile guidance links and tactical target routing.", activeOverlay: false },
    { id: "s-14", name: "Mission Planning Systems", acronym: "MPS", branch: "AIR_FORCE", status: "STANDBY", description: "Pre-flight flightway calculations and weapons allocation calculators.", activeOverlay: false },
    { id: "s-15", name: "Air Defence Reporting & Control Network", acronym: "ADRCN", branch: "AIR_FORCE", status: "INTEGRATED", description: "Direct voice and digital reporting link for territorial air command.", activeOverlay: false },

    // NAVY (7 Systems)
    { id: "s-16", name: "National Command Control Communication Intelligence", acronym: "NC3I", branch: "NAVY", status: "INTEGRATED", description: "Coastal radar chain integration, marine tracks management, and intelligence aggregation.", activeOverlay: false },
    { id: "s-17", name: "Information Management & Analysis Centre", acronym: "IMAC", branch: "NAVY", status: "INTEGRATED", description: "Real-time tracking of commercial vessels, AIS satellite transponders, and maritime warnings.", activeOverlay: false },
    { id: "s-18", name: "Naval Communication Network", acronym: "NCN", branch: "NAVY", status: "STANDBY", description: "Inter-fleet secure communications and tactical marine transceivers.", activeOverlay: false },
    { id: "s-19", name: "Maritime Domain Awareness System", acronym: "MDA", branch: "NAVY", status: "INTEGRATED", description: "Subsurface acoustic sensor feeds, maritime patrol coordinates, and satellite sweeps.", activeOverlay: false },
    { id: "s-20", name: "Combat Management Systems", acronym: "CMS", branch: "NAVY", status: "STANDBY", description: "Warship combat engagement computers and missile launch bays control.", activeOverlay: false },
    { id: "s-21", name: "Naval Satellite Communication System", acronym: "Naval Satcom", branch: "NAVY", status: "INTEGRATED", description: "Dedicated high-latitude SATCOM coverage linking fleets to military land portals.", activeOverlay: false },
    { id: "s-22", name: "Fleet Operational Picture", acronym: "FOP", branch: "NAVY", status: "STANDBY", description: "Unified tactical picture of all surface ships and submarine operations.", activeOverlay: false },

    // TRI_SERVICE (8 Systems)
    { id: "s-23", name: "Defence Communication Network", acronym: "DCN", branch: "TRI_SERVICE", status: "INTEGRATED", description: "Tri-service joint command and control cryptographic data pipeline.", activeOverlay: false },
    { id: "s-24", name: "IDS Info Grid", acronym: "IDS Grid", branch: "TRI_SERVICE", status: "INTEGRATED", description: "Cryptographically certified joint-service directory registry database.", activeOverlay: false },
    { id: "s-25", name: "Joint Operations Centre Systems", acronym: "JOC", branch: "TRI_SERVICE", status: "STANDBY", description: "Real-time feeds from active theater operations room.", activeOverlay: false },
    { id: "s-26", name: "Integrated Defence Communication", acronym: "IDC Infrastructure", branch: "TRI_SERVICE", status: "INTEGRATED", description: "Cross-service signal bridges and hardware interop connectors.", activeOverlay: false },
    { id: "s-27", name: "Network for Spectrum secure military band", acronym: "NFS", branch: "TRI_SERVICE", status: "INTEGRATED", description: "Dedicated frequency bands for secure armed forces wireless links.", activeOverlay: false },
    { id: "s-28", name: "Sovereign Defence Cloud secure tactical edge", acronym: "Defence Cloud", branch: "TRI_SERVICE", status: "STANDBY", description: "Highly hardened distributed private cloud infrastructure.", activeOverlay: false },
    { id: "s-29", name: "Unified Defence GIS topographics", acronym: "Defence GIS", branch: "TRI_SERVICE", status: "INTEGRATED", description: "3D topographical vector data mappings of Siachen glacier and Leh valley.", activeOverlay: false },
    { id: "s-30", name: "Joint Intelligence Fusion Systems", acronym: "Fusion Systems", branch: "TRI_SERVICE", status: "STANDBY", description: "Aggregated electronic, human, and image intelligence dashboard.", activeOverlay: false },

    // SPACE_ISR (6 Systems)
    { id: "s-31", name: "Defence Space Agency SSA", acronym: "DSA SSA", branch: "SPACE_ISR", status: "INTEGRATED", description: "Space Situational Awareness, monitoring satellites, orbital mechanics, and space hazards.", activeOverlay: false },
    { id: "s-32", name: "Satellite Tasking Systems", acronym: "Sat Tasking", branch: "SPACE_ISR", status: "STANDBY", description: "Direct orchestration of GSAT tasking windows and orbit changes.", activeOverlay: false },
    { id: "s-33", name: "Multi-Intelligence ISR Data Fusion", acronym: "ISR Data Fusion", branch: "SPACE_ISR", status: "INTEGRATED", description: "Sovereign AI platform fusing radar, sat-imagery, and drone optical feeds.", activeOverlay: false },
    { id: "s-34", name: "Geospatial Intelligence vector mapping", acronym: "Geo Intel", branch: "SPACE_ISR", status: "STANDBY", description: "Change detection, digital terrain matrices, and contour maps generation.", activeOverlay: false },
    { id: "s-35", name: "Remote Sensing Exploitation", acronym: "Remote Sensing", branch: "SPACE_ISR", status: "INTEGRATED", description: "Hyperspectral and thermal imagery analysis of camouflaged positions.", activeOverlay: false },
    { id: "s-36", name: "Electronic Intelligence signal correlator", acronym: "ELINT Fusion", branch: "SPACE_ISR", status: "STANDBY", description: "Intercepting enemy radio towers, mobile command signals, and radar footprints.", activeOverlay: false },

    // CYBER_EW (5 Systems)
    { id: "s-37", name: "Defence Cyber Agency CSAP", acronym: "DCA CSAP", branch: "CYBER_EW", status: "INTEGRATED", description: "Sovereign Cyber Situational Awareness Platform tracking external intrusion attempt campaigns.", activeOverlay: false },
    { id: "s-38", name: "Sovereign SIEM Security Center", acronym: "SIEM", branch: "CYBER_EW", status: "INTEGRATED", description: "Unified logs anomaly detection, threat hunting, and packet telemetry analysis.", activeOverlay: false },
    { id: "s-39", name: "Cyber Command Dashboards", acronym: "Cyber Command", branch: "CYBER_EW", status: "STANDBY", description: "Active defense systems status, firewall rules, and intrusion response actions.", activeOverlay: false },
    { id: "s-40", name: "EW Mission Management", acronym: "EW Mission Mgr", branch: "CYBER_EW", status: "STANDBY", description: "Electronic countermeasure management, spectrum suppression, and high altitude active jammers.", activeOverlay: false },
    { id: "s-41", name: "Spectrum Monitoring & Jamming", acronym: "Spectrum Monitoring", branch: "CYBER_EW", status: "INTEGRATED", description: "Continuous passive spectrum scanning in frontier Ladakh coordinates.", activeOverlay: false },

    // LOGISTICS (6 Systems)
    { id: "s-42", name: "Logistics Management Info System", acronym: "LMIS", branch: "LOGISTICS", status: "INTEGRATED", description: "Tracking fuel, vehicle convoys, rations, and active inventory levels.", activeOverlay: false },
    { id: "s-43", name: "Secure Munitions tracking", acronym: "Ammo Tracking", branch: "LOGISTICS", status: "INTEGRATED", description: "Ammunition depots temperature, stock, and high-altitude transport timelines.", activeOverlay: false },
    { id: "s-44", name: "Military Kerosene & Fuel management", acronym: "Fuel Management", branch: "LOGISTICS", status: "STANDBY", description: "Heavy pipeline flow monitoring and remote refueling depot statuses.", activeOverlay: false },
    { id: "s-45", name: "Maintenance & Combat readiness", acronym: "Maintenance Mgr", branch: "LOGISTICS", status: "STANDBY", description: "Predictive engine maintenance tracking for Heron UAV fleets and T-90 tank divisions.", activeOverlay: false },
    { id: "s-46", name: "Sovereign Supply Chain platform", acronym: "SCM Main", branch: "LOGISTICS", status: "INTEGRATED", description: "Border road organization routes status and tactical transit logs.", activeOverlay: false },
    { id: "s-47", name: "Military Enterprise Resource Planning", acronym: "Military ERP", branch: "LOGISTICS", status: "STANDBY", description: "Unified system of record tracking armed forces administration and financial requisitions.", activeOverlay: false },
  ]);

  const handleToggleOverlay = (systemId: string) => {
    setSystems((prev) =>
      prev.map((sys) => {
        if (sys.id === systemId) {
          const nextVal = !sys.activeOverlay;
          handleAddLog({
            source: sys.acronym.toUpperCase(),
            type: nextVal ? "SUCCESS" : "INFO",
            message: nextVal
              ? `🌐 DYNAMIC COP INTEGRATION: Overlay layer [${sys.acronym}] deployed directly onto Ladakh Sector Common Operational Picture (COP).`
              : `Removed telemetry overlay layer [${sys.acronym}] from GIS view.`
          });
          return { ...sys, activeOverlay: nextVal };
        }
        return sys;
      })
    );
  };

  const handleSetStatus = (systemId: string, status: CommandSystem["status"]) => {
    setSystems((prev) =>
      prev.map((sys) => {
        if (sys.id === systemId) {
          return { ...sys, status };
        }
        return sys;
      })
    );
  };

  // Projectile strike animation state
  const [activeStrike, setActiveStrike] = useState<{
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    stage: string;
  } | null>(null);

  // Initial Nodes
  const [nodes, setNodes] = useState<TacticalNode[]>([
    { id: "n-1", name: "GSAT-7A Military Constellation", type: "SATELLITE", status: "ONLINE", criticality: "CRITICAL", location: "Geo Orbit Delta" },
    { id: "n-2", name: "Ladakh Edge Compute Brigade Hub", type: "EDGE_SERVER", status: "ONLINE", criticality: "HIGH", location: "Sector 4 Base" },
    { id: "n-3", name: "AWACS Netra Air-Radar Patrol", type: "AWACS", status: "ONLINE", criticality: "HIGH", location: "North Airway Corridor" }
  ]);

  // Initial Tracks (Blue Force Tracking + Red Factions)
  const [tracks, setTracks] = useState<TacticalTrack[]>([
    {
      id: "r-1",
      name: "T-90 Tank Column",
      faction: "RED",
      type: "ARMOR",
      x: 62,
      y: 35,
      status: "ACTIVE",
      speed: "18 km/h",
      health: 100,
      coordinates: "43Q LD 51928 12845",
      weapons: ["125mm Smoothbore", "Refleks Guided Missile System"],
      sensorSource: "Heron-47 UAV Scan",
      lastUpdated: "Now"
    },
    {
      id: "r-2",
      name: "Mobile S-400 Missile Battery",
      faction: "RED",
      type: "AIR_DEFENSE",
      x: 78,
      y: 42,
      status: "ACTIVE",
      speed: "Stationary",
      health: 100,
      coordinates: "43Q LD 54109 13582",
      weapons: ["92N6E Engagement Radar", "Long Range 48N6 SAMs"],
      sensorSource: "AWACS SAR Scan",
      lastUpdated: "5 min ago"
    },
    {
      id: "b-1",
      name: "14 Infantry Brigade",
      faction: "BLUE",
      type: "INFANTRY",
      x: 35,
      y: 55,
      status: "ACTIVE",
      speed: "Guard stance",
      health: 95,
      coordinates: "43Q LD 42890 10231",
      weapons: ["INSAS Rifles", "81mm Mortars", "Carl Gustaf Rocket Launchers"],
      sensorSource: "Mil-Sat GSAT",
      lastUpdated: "Now"
    },
    {
      id: "b-2",
      name: "8 Mountain Division Artillery",
      faction: "BLUE",
      type: "ARTILLERY",
      x: 22,
      y: 65,
      status: "ACTIVE",
      speed: "Stationary deployment",
      health: 100,
      coordinates: "43Q LD 46210 09842",
      weapons: ["M777 Ultra-light Howitzer", "Pinaka rocket system launcher"],
      sensorSource: "SATCOM Link",
      lastUpdated: "2 min ago"
    },
    {
      id: "b-3",
      name: "4 Ladakh Scouts Recon",
      faction: "BLUE",
      type: "INFANTRY",
      x: 48,
      y: 28,
      status: "ACTIVE",
      speed: "12 km/h (Muffled Patrol)",
      health: 100,
      coordinates: "43Q LD 49200 11980",
      weapons: ["Tavor Tar-21", "Hand grenade munitions"],
      sensorSource: "Radio link relay",
      lastUpdated: "Now"
    }
  ]);

  // Initial Combat ready and logistics ERP data
  const [combatUnits, setCombatUnits] = useState<CombatPowerIndex[]>([
    { id: "c-1", name: "14 Infantry Brigade Forward", unit: "Army", health: 95, ammo: 90, fuel: 85, personnel: 1200, status: "OPERATIONAL" },
    { id: "c-2", name: "114 Helicopter Squadron", unit: "Air Force", health: 100, ammo: 78, fuel: 55, personnel: 300, status: "WARNING" },
    { id: "c-3", name: "Ladakh Scouts Patrol Force", unit: "Scouts", health: 100, ammo: 100, fuel: 95, personnel: 450, status: "OPERATIONAL" }
  ]);

  // Initial Logs stream
  const [logs, setLogs] = useState<TacticalLog[]>([
    { id: "log-1", timestamp: "07:00:15", source: "ZERO-TRUST MODULE", type: "SUCCESS", message: "Backbone cryptographically secure. Identity tokens certified for Ladakh Sector Commandant." },
    { id: "log-2", timestamp: "07:02:10", source: "COP TRACKING", type: "INFO", message: "Synchronized friendly blue force tracking units with theater grids." },
    { id: "log-3", timestamp: "07:05:42", source: "EW GUARD", type: "INFO", message: "Spectrum monitor scanning frequencies. External noise below critical threshhold." }
  ]);

  // Add Log Helper
  const handleAddLog = (log: Omit<TacticalLog, "id" | "timestamp">) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog: TacticalLog = {
      ...log,
      id: Math.random().toString(),
      timestamp
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Zero-Trust Role Change Handler
  const handleChangeRole = (role: Role) => {
    setCurrentRole(role);
    handleAddLog({
      source: "ZERO-TRUST IAM",
      type: "SUCCESS",
      message: `Access authorization switched to: ${
        role === Role.COMMANDER ? "Theatre Commander [Full Authority]" : role === Role.INTELLIGENCE_OFFICER ? "Intelligence ISR Analyst" : "Frontline Lieutenant Command"
      }. Filters adjusted.`
    });
  };

  // Node Jamming Status Handler with automatic Cognitive EW AI response
  const handleToggleNodeStatus = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const nextStatus = n.status === "ONLINE" ? "JAMMED" : "ONLINE";
          
          if (nextStatus === "JAMMED") {
            handleAddLog({
              source: "DIGITAL SPINE BACKBONE",
              type: "WARNING",
              message: `CRITICAL DETECTED: Node [${n.name}] experienced signal drop. Hostile noise jamming suspected.`
            });

            // Trigger Cognitive EW AI automatic recovery
            setTimeout(() => {
              handleAddLog({
                source: "COGNITIVE EW AI",
                type: "ALERT",
                message: `ALERT: Initializing frequency-hopping spreadsheet on node [${n.name}]. Isolating hostile jamming spectrum.`
              });

              setTimeout(() => {
                setNodes((prevNodes) =>
                  prevNodes.map((n2) => {
                    if (n2.id === nodeId) {
                      handleAddLog({
                        source: "DIGITAL SPINE RESILIENCE",
                        type: "SUCCESS",
                        message: `RECOVERY SUCCESSFUL: Cognitive EW isolated interference. Restored link security with frequency hop on node [${n.name}].`
                      });
                      return { ...n2, status: "ONLINE" };
                    }
                    return n2;
                  })
                );
              }, 2200);

            }, 800);
          } else {
            handleAddLog({
              source: "DIGITAL SPINE ADMIN",
              type: "INFO",
              message: `Node [${n.name}] manually reconnected to baseline backbone.`
            });
          }

          return { ...n, status: nextStatus };
        }
        return n;
      })
    );
  };

  // Resupply division
  const handleRestoreReadyStatus = (unitId: string) => {
    setCombatUnits((prev) =>
      prev.map((unit) => {
        if (unit.id === unitId) {
          handleAddLog({
            source: "LOGISTICS ERP",
            type: "SUCCESS",
            message: `Authorized transport convoy. Dispatched munitions and heavy reserve kerosene to [${unit.name}]. Metrics restored to 100%.`
          });
          return {
            ...unit,
            health: 100,
            ammo: 100,
            fuel: 100,
            status: "OPERATIONAL"
          };
        }
        return unit;
      })
    );
  };

  // Advance kill chain state
  const handleAdvanceKillChain = (nextState: KillChainState) => {
    setKillChainState(nextState);
    handleAddLog({
      source: "KILL CHAIN MANAGER",
      type: "INFO",
      message: `Kill-chain cycle transitioned to stage: ${nextState}. Target monitoring active.`
    });
  };

  // Nominate target spotted via SAR/ISR
  const handleNominateTarget = (name: string, type: string, coordinates: string) => {
    const newTrack: TacticalTrack = {
      id: `r-${Date.now()}`,
      name,
      faction: "RED",
      type: type as any,
      x: 70,
      y: 25,
      status: "ACTIVE",
      speed: "Stationary",
      health: 100,
      coordinates,
      weapons: ["130mm Artillery Cannons"],
      sensorSource: "SAR Change Det-Orbit B",
      lastUpdated: "Now"
    };

    setTracks((prev) => [...prev, newTrack]);
    setSelectedTrack(newTrack);
    setKillChainState(KillChainState.FIND);
  };

  // Force trigger rocket/missile strike (F5-Engage option)
  const handleTriggerStrike = (weaponOption: string) => {
    if (!selectedTrack) return;

    // Source is friendly Artillery B-2
    const sourceUnit = tracks.find((t) => t.id === "b-2") || { x: 22, y: 65 };

    setActiveStrike({
      sourceX: sourceUnit.x,
      sourceY: sourceUnit.y,
      targetX: selectedTrack.x,
      targetY: selectedTrack.y,
      stage: "LAUNCH"
    });

    handleAddLog({
      source: "PINAKA FIRE CONTROLED SYSTEM",
      type: "SUCCESS",
      message: `LAUNCH CONFIRMED: Initializing supersonic projectile trajectory. Path locked to coordinate ${selectedTrack.coordinates}. Airspace rerouted.`
    });

    // Walk through stages of rocket flight simulation
    setTimeout(() => {
      setActiveStrike((prev) => (prev ? { ...prev, stage: "INTERCEPT" } : null));
      handleAddLog({
        source: "RADAR TRACKER",
        type: "INFO",
        message: "Projectile mid-flight phase. Air space cleared of friendly aircraft flights."
      });

      setTimeout(() => {
        // Destroy target
        setTracks((prevTracks) =>
          prevTracks.map((t) => {
            if (t.id === selectedTrack.id) {
              return { ...t, status: "DESTRUCTED", health: 0 };
            }
            return t;
          })
        );

        setActiveStrike(null);
        setKillChainState(KillChainState.ASSESS);
        
        handleAddLog({
          source: "BATTLEFIELD DAMAGE ASSESS-UAV",
          type: "SUCCESS",
          message: `IMPACT ESTABLISH RESULT: Target neutralized completely. Debris thermal footprint registered at Ladakh coordinate: ${selectedTrack.coordinates}. Mission loops closed.`
        });
      }, 1500);

    }, 1500);
  };

  // Selected track helper
  const handleSelectTrack = (track: TacticalTrack | null) => {
    setSelectedTrack(track);
    if (track && track.faction === "RED") {
      setKillChainState(KillChainState.FIND);
      handleAddLog({
        source: "COMMANDER GLASS HUB",
        type: "INFO",
        message: `Identified target focus on Hostile element: ${track.name}. Launching Find-to-Assess sequence.`
      });
    }
  };

  // Himalayan ops toggle
  const handleToggleHimalayanOps = () => {
    const nextVal = !himalayanOps;
    setHimalayanOps(nextVal);
    handleAddLog({
      source: "METEOROLOGY HUB",
      type: nextVal ? "WARNING" : "INFO",
      message: nextVal
        ? "⚠️ HIGH ALTITUDE WINTER WARFARE ENABLED: Calibrating active telemetry algorithms for Siachen/Ladakh wind speeds. Adjusted Heron battery cooling cycles."
        : "Standard atmospheric flight metrics restored."
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      
      {/* Top Main C2 Cyber-Spine Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="bg-red-950 p-2 border border-red-500 rounded relative overflow-hidden flex items-center justify-center">
            <Shield className="h-5 w-5 text-red-500 animate-pulse" />
            <div className="absolute top-0 right-0 h-1.5 w-1.5 bg-cyan-400 rounded-full animate-ping"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-red-500 bg-red-950/40 border border-red-900/60 font-semibold px-1 rounded-sm leading-none animate-pulse">
                DEFCON-2 LOCK
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-bold leading-none">
                SECURE TELEMETRY ENCRYPTED
              </span>
            </div>
            <h1 className="text-sm font-black font-mono text-white tracking-widest mt-0.5 uppercase flex items-center gap-1.5">
              STORM FIRE C2 INTEGRATED COMMAND & CONTROL SUITE
            </h1>
          </div>
        </div>

        {/* Global Stats indicators */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-semibold">ACTIVE THREAT COHERENCE:</span>
            <span className="text-red-500 font-bold">HIGH</span>
          </div>
          <div className="h-4 w-px bg-slate-800"></div>
          <div>
            <span className="text-slate-500">THEATER GRID:</span>
            <span className="text-cyan-400">HQ-LADAKH-SECTOR-4</span>
          </div>
        </div>
      </header>

      {/* Main Multi-Grid Workspace */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto">
        
        {/* Left Aspect Columns: Visual COP, Intelligence, and Kill-Chain Manager */}
        <div className={activeWorkspace === "MONITOR" ? "lg:col-span-8 flex flex-col gap-4" : "lg:col-span-12 flex flex-col gap-4"}>
          <DeltaPortal
            currentRole={currentRole}
            onChangeRole={handleChangeRole}
            logs={logs}
            onAddLog={handleAddLog}
            nodes={nodes}
            onToggleNodeStatus={handleToggleNodeStatus}
            combatUnits={combatUnits}
            onRestoreReadyStatus={handleRestoreReadyStatus}
            himalayanOps={himalayanOps}
            onToggleHimalayanOps={handleToggleHimalayanOps}
            activeWorkspace={activeWorkspace}
            setActiveWorkspace={setActiveWorkspace}
            renderMonitorCopView={() => (
              <div className="flex flex-col gap-4">
                {/* Tactical COP Visualizer Map */}
                <div className="relative">
                  {/* Visual Filters Bar overlying the map */}
                  <div className="absolute top-12 right-3 z-20 flex gap-1.5 rounded bg-slate-950/90 border border-slate-800 p-1 scale-90">
                    <button
                      onClick={() => setInsightMode("NORMAL")}
                      className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                        insightMode === "NORMAL" ? "bg-cyan-950 text-cyan-400 border border-cyan-800" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      NORMAL Map
                    </button>
                    <button
                      onClick={() => setInsightMode("DEAD_GROUND")}
                      className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                        insightMode === "DEAD_GROUND" ? "bg-amber-950 text-amber-400 border border-amber-800" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      ⛰️ Dead Ground
                    </button>
                    <button
                      onClick={() => setInsightMode("TRAFFICABILITY")}
                      className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                        insightMode === "TRAFFICABILITY" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      🚜 trafficability
                    </button>
                  </div>

                  <TacticalMap
                    tracks={tracks}
                    onSelectTrack={handleSelectTrack}
                    selectedTrack={selectedTrack}
                    activeStrike={activeStrike}
                    insightMode={insightMode}
                    systems={systems}
                  />
                </div>

                {/* Unified C2 Strategic Integrator Hub */}
                <UnifiedSectorHub
                  systems={systems}
                  onToggleOverlay={handleToggleOverlay}
                  onSetStatus={handleSetStatus}
                  onAddLog={handleAddLog}
                />

                {/* Kill Chain Orchestrator Module */}
                <KillChainModule
                  selectedTrack={selectedTrack}
                  onAdvanceKillChain={handleAdvanceKillChain}
                  killChainState={killChainState}
                  onTriggerStrike={handleTriggerStrike}
                  onAddLog={handleAddLog}
                />

                {/* Intelligence Multi-Sensor Recons */}
                <IntelligenceBrain
                  onAddLog={handleAddLog}
                  onNominateTarget={handleNominateTarget}
                />

                {/* Zero-Trust Nodes, Combat metrics, strategic sliders */}
                <CommanderDashboard
                  currentRole={currentRole}
                  onChangeRole={handleChangeRole}
                  nodes={nodes}
                  onToggleNodeStatus={handleToggleNodeStatus}
                  combatUnits={combatUnits}
                  onRestoreReadyStatus={handleRestoreReadyStatus}
                  logs={logs}
                  himalayanOps={himalayanOps}
                  onToggleHimalayanOps={handleToggleHimalayanOps}
                />
              </div>
            )}
          />
        </div>

        {/* Right Aspect Column: INDRA Tactical Decision Support Advisor + Logs Feed */}
        {activeWorkspace === "MONITOR" && (
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Real-time Server-Proxy Advisor Chat with Gemini */}
            <IndraAdvisor
              tracks={tracks}
              nodes={nodes}
              logs={logs}
              himalayanOps={himalayanOps}
              systems={systems}
            />

            {/* Console Activity Log Feed */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col h-[280px] shadow-xl overflow-hidden font-mono">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 shrink-0">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  SOVEREIGN CIPHERED LOG REGISTRY
                </span>
                <button
                  onClick={() => setLogs([])}
                  className="text-[8px] bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 hover:text-red-400 px-1.5 py-0.5 rounded uppercase"
                >
                  WIPE LOGS
                </button>
              </div>

              {/* Logs stream body */}
              <div className="flex-1 overflow-y-auto pr-1 py-1.5 flex flex-col gap-1.5 scrollbar-thin">
                {logs.length === 0 ? (
                  <div className="text-slate-600 text-center py-8 text-[10px]">
                    LOGGER REGISTRY ERASED. WAITING ON BATTLESPACE EMISSIONS...
                  </div>
                ) : (
                  logs.map((log) => {
                    const isWarning = log.type === "WARNING";
                    const isAlert = log.type === "ALERT";
                    const isSuccess = log.type === "SUCCESS";
                    
                    return (
                      <div key={log.id} className="text-[9px] hover:bg-slate-950 p-1 rounded border border-transparent hover:border-slate-800/40 transition-all leading-normal flex items-start gap-1">
                        <span className="text-slate-600 select-none shrink-0 font-semibold">{log.timestamp}</span>
                        <span className={`px-1 shrink-0 bg-slate-950 border text-[8px] font-bold uppercase rounded scale-90 ${
                          isWarning 
                            ? "bg-amber-950/20 border-amber-900 text-amber-500" 
                            : isAlert 
                              ? "bg-red-950/20 border-red-900 text-red-500 animate-pulse" 
                              : isSuccess 
                                ? "bg-emerald-950/20 border-emerald-900 text-emerald-400" 
                                : "bg-slate-950 border-slate-800 text-indigo-400"
                        }`}>
                          {log.source}
                        </span>
                        <span className={`${isWarning ? "text-amber-300" : isAlert ? "text-red-400 font-bold" : isSuccess ? "text-slate-200 font-semibold" : "text-slate-400"}`}>
                          {log.message}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Cyber-footer */}
      <footer className="bg-slate-950 border-t border-slate-900/80 px-4 py-2 text-[9px] font-mono text-slate-600 text-center select-none shrink-0">
        INDIAN THEATRE DEFENSE RESEARCH NET • AUTHENTICATED COMMAND CONSOLE MODULE VERSION 4.29.1 • ALL COGNITIVE RADAR EMISSIONS STABLE • NO KEY LOG EXPOSURES
      </footer>
    </div>
  );
}
