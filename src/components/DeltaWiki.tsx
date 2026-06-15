import React, { useState } from "react";
import { BookOpen, Layers, ShieldCheck, Cpu, Terminal, Sparkles, Server, MapPin } from "lucide-react";

interface CapabilityLayer {
  layer: number;
  name: string;
  category: string;
  items: string[];
  description: string;
  implementationStatus: "FULL" | "STANDBY" | "INTEGRATING";
}

export default function DeltaWiki() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLayer, setSelectedLayer] = useState<number | null>(1);

  const capabilities: CapabilityLayer[] = [
    {
      layer: 1,
      name: "Core Digital Infrastructure",
      category: "Foundation Services",
      description: "Underlying software frameworks ensuring identity locking, high-speed data fabric message routing, and private edge clouds.",
      items: ["Identity & Access Management", "Zero Trust Security", "Battlefield Data Fabric", "API Gateway", "Event Streaming Bus", "Data Lake", "Knowledge Graph", "Edge Computing Platform", "Cloud Orchestration", "Audit & Logging"],
      implementationStatus: "FULL"
    },
    {
      layer: 2,
      name: "Common Operational Picture",
      category: "Situational Awareness",
      description: "GIS visual mappings displaying Blue/Red force feeds, civilian AIS transponders, terrain slopes, and 3D terrain matrices.",
      items: ["Battlefield Map Engine", "Blue Force Tracking", "Red Force Tracking", "Neutral/Civilian Tracking", "Unit Readiness Dashboard", "Combat Power Dashboard", "Joint COP", "3D Battlespace Viewer", "Terrain Analysis Engine", "Command Dashboard"],
      implementationStatus: "FULL"
    },
    {
      layer: 3,
      name: "Intelligence",
      category: "Situational Awareness",
      description: "Fused HUMINT reports, SIGINT intercepts, thermal patterns of life, and AI assistants matching enemy footprints to databases.",
      items: ["Multi-INT Fusion", "HUMINT Management", "SIGINT Analysis", "ELINT Analysis", "GEOINT Platform", "OSINT Collection", "Pattern-of-Life Analysis", "Network Analysis", "Threat Database", "AI Intelligence Assistant"],
      implementationStatus: "FULL"
    },
    {
      layer: 4,
      name: "Sensor Integration",
      category: "Data Fusion",
      description: "Sovereign signal interfaces locking onto drone optics telemetry, acoustic microphones, radar arrays, and naval passive sonobuoys.",
      items: ["Radar Integration", "EO/IR Sensor Integration", "Acoustic Sensor Fusion", "Satellite Feed Integration", "Drone Feed Integration", "Ground Sensor Management", "Maritime Sensor Integration", "Sensor Tasking Engine", "Sensor Health Monitoring", "Multi-Sensor Fusion AI"],
      implementationStatus: "FULL"
    },
    {
      layer: 5,
      name: "ISR Operations",
      category: "Situational Awareness",
      description: "Tasking orchestration center coordinating satellite orbit imagery sweeps, change detection, and drone search routes.",
      items: ["ISR Collection Manager", "Reconnaissance Tasking", "Automated Target Detection", "Automated Target Classification", "Battle Damage Assessment", "Change Detection Analytics", "Persistent Surveillance", "Geospatial Analytics", "ISR Mission Planning", "ISR Knowledge Repository"],
      implementationStatus: "INTEGRATING"
    },
    {
      layer: 6,
      name: "Drone Warfare",
      category: "Remote Strike",
      description: "End-to-end telemetry feeds managing reconnaissance UAV flightway loops, active swarm coordination, and Loitering munitions control.",
      items: ["Recon UAV Control", "FPV Drone Control", "Loitering Munition Control", "Drone Swarm Management", "Autonomous Drone Operations", "UAV Traffic Management", "UAV Mission Planner", "Drone Logistics", "Counter-Drone Coordination", "AI Drone Commander"],
      implementationStatus: "FULL"
    },
    {
      layer: 7,
      name: "Fire Support",
      category: "Remote Strike",
      description: "Automated Target Nominations and weapon-system matchups matching coordinates directly to Pinaka, light howitzers, or precision BrahMos strikes.",
      items: ["Artillery Fire Control", "Rocket Force Control", "Missile Strike Planner", "Counter-Battery System", "Target Nomination", "Target Prioritization AI", "Strike Coordination", "Kill Chain Manager", "Fire Effects Assessment", "Precision Strike Optimization"],
      implementationStatus: "FULL"
    },
    {
      layer: 8,
      name: "Air Operations",
      category: "Sovereign Shield",
      description: "Theater air flight managers providing airspace authorization limits, AWACS signals routing, and fuel plane logistics.",
      items: ["Air Battle Manager", "Fighter Mission Planner", "Airspace Control", "AWACS Integration", "Air Refueling Coordination", "Air Tasking Order Generator", "SEAD/DEAD Planner", "Air Campaign Planner", "Combat Search & Rescue", "Air Operations COP"],
      implementationStatus: "STANDBY"
    },
    {
      layer: 9,
      name: "Air Defense",
      category: "Sovereign Shield",
      description: "Integrated Air Defense radar systems linking Surface-to-Air missiles, IFF status decoders, and fast threat trackers.",
      items: ["Radar Fusion", "Air Threat Tracker", "Air Defense Fire Control", "Missile Assignment Engine", "Counter-UAV Defense", "IFF Management", "Early Warning Manager", "Missile Defense Coordinator", "Air Defense Readiness Dashboard", "Integrated Air Defense COP"],
      implementationStatus: "FULL"
    },
    {
      layer: 10,
      name: "Naval Operations",
      category: "Sovereign Shield",
      description: "Coastline radar arrays and marine picture managers tracking commercial vessels, warship launch bays, and underwater sonar grids.",
      items: ["Maritime Domain Awareness", "Fleet Command System", "Naval Fire Control", "Submarine Operations Manager", "Sonar Fusion", "Anti-Submarine Warfare Planner", "Maritime Strike Planner", "Naval Air Defense", "Fleet Logistics Manager", "Naval COP"],
      implementationStatus: "STANDBY"
    },
    {
      layer: 11,
      name: "Electronic Warfare",
      category: "Signal dominance",
      description: "High-altitude active spectrum jammers, RF triangulation emitters, and cognitive auto-frequency hoppers.",
      items: ["Spectrum Monitor", "RF Geolocation", "Electronic Order of Battle", "Jamming Controller", "Electronic Attack Planner", "Electronic Protection Manager", "EW Mission Planner", "Cognitive EW AI", "Spectrum Allocation Manager", "EW Effects Assessment"],
      implementationStatus: "FULL"
    },
    {
      layer: 12,
      name: "Cyber Operations",
      category: "Signal dominance",
      description: "Intrusion platforms monitoring external scanning, vulnerability logs, and defense policies across command networks.",
      items: ["Cyber Operations Center", "Network Defense Platform", "Threat Intelligence Fusion", "Malware Analysis", "Vulnerability Management", "Offensive Cyber Planning", "Digital Forensics", "Cyber Range", "Cyber Battle Manager", "Information Warfare Dashboard"],
      implementationStatus: "FULL"
    },
    {
      layer: 13,
      name: "Communications",
      category: "Foundation Services",
      description: "Military crypto networks supporting secure chat software, voice trunks, and satellite messaging channels.",
      items: ["Secure Battlefield Chat", "Tactical Messaging", "Military Email", "Secure Voice", "Video Conferencing", "SATCOM Management", "Tactical Data Links", "Radio Network Manager", "Mesh Networking", "Digital Orders Distribution"],
      implementationStatus: "FULL"
    },
    {
      layer: 14,
      name: "Logistics",
      category: "Data Fusion",
      description: "Strategic Military ERP grids monitoring fuel supplies, ammunition counts, parts forecasts, and logistics routes status.",
      items: ["Ammunition Management", "Fuel Management", "Supply Chain Platform", "Transportation Planning", "Depot Management", "Fleet Readiness", "Predictive Maintenance", "Spare Parts Forecasting", "Medical Logistics", "Sustainment Dashboard"],
      implementationStatus: "FULL"
    },
    {
      layer: 15,
      name: "Autonomous Command & AI",
      category: "Remote Strike",
      description: "Tactical algorithms simulating battle outcomes, selecting optimal courses of action, and distributing edge computational priorities.",
      items: ["AI Intelligence Assistant", "AI Mission Planner", "Course of Action Generator", "AI Resource Allocation", "AI Risk Assessment", "AI Logistics Planner", "AI Wargaming Engine", "Multi-Agent AI Coordinator", "Autonomous Battle Manager", "AI Strategic Advisor"],
      implementationStatus: "FULL"
    },
    {
      layer: 16,
      name: "Digital Twins & Simulation",
      category: "Foundation Services",
      description: "Sovereign 3D digital twins representing battle landscapes, sensor ranges, and logistic networks for simulation previews.",
      items: ["Battlefield Digital Twin", "Unit Digital Twin", "Sensor Network Digital Twin", "Logistics Digital Twin", "Air Campaign Simulator", "Naval Warfare Simulator", "Missile Engagement Simulator", "EW Simulator", "Cyber Warfare Simulator", "Joint Wargaming Platform"],
      implementationStatus: "INTEGRATING"
    },
    {
      layer: 17,
      name: "Space Operations",
      category: "Foundation Services",
      description: "Space situational assets tracking GSAT satellite orbits, rocket launches, and debris hazards in low Earth orbit.",
      items: ["Satellite Constellation Manager", "Space Situational Awareness", "Orbital Tracking", "Missile Warning Integration", "Space ISR Fusion", "PNT Monitoring", "Launch Detection", "Anti-Satellite Threat Tracker", "Space Asset Tasking", "Strategic Warning Dashboard"],
      implementationStatus: "FULL"
    },
    {
      layer: 18,
      name: "Strategic Command",
      category: "Foundation Services",
      description: "National center dashboards correlating theater operations with reserve counts, crisis response timelines, and command nodes.",
      items: ["National Command Dashboard", "Theater Command Platform", "Joint Force Coordination", "Strategic Reserve Tracking", "National Crisis Management", "Continuity of Government Interface", "Strategic Strike Coordination", "Nuclear Command Interface", "National Security Fusion Center", "Strategic Decision Support"],
      implementationStatus: "STANDBY"
    },
    {
      layer: 19,
      name: "Autonomous Defensive Grids",
      category: "Remote Strike",
      description: "Autonomous threat jammers, alert rings, and sensor cueing engines guarding frontiers with human-on-the-loop controls.",
      items: ["Autonomous Base Defense", "Autonomous Border Surveillance", "Autonomous Counter-Drone Grid", "Autonomous Maritime Surveillance", "Autonomous Air Defense Coordinator", "Autonomous Sensor Cueing", "Automated Threat Interception", "Automated Mission Replanning", "Autonomous Patrol Management", "Human-on-the-Loop Control"],
      implementationStatus: "INTEGRATING"
    },
    {
      layer: 20,
      name: "Sovereign Enterprise Fusion Layer",
      category: "Data Fusion",
      description: "Master entity resolvers, knowledge graphs, and data pipelines tracking systemic lessons and threat vectors globally.",
      items: ["Enterprise Data Integration", "Entity Resolution Engine", "Operational Knowledge Graph", "Cross-Domain Search", "Workflow Automation", "Mission Analytics", "Predictive Threat Analysis", "Strategic Forecasting", "Lessons Learned Platform", "Global Decision Intelligence Engine"],
      implementationStatus: "FULL"
    }
  ];

  const filteredLayers = capabilities.filter(
    (cap) =>
      cap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cap.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cap.items.some((item) => item.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedLayerData = capabilities.find((cap) => cap.layer === selectedLayer);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-xl select-none flex flex-col gap-4 font-mono text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-400 animate-pulse" />
          <div>
            <h2 className="text-sm font-black text-white tracking-widest uppercase">
              INDRA-DELTA ARCHITECTURAL REFERENCE AUDIT
            </h2>
            <p className="text-[10px] text-slate-500 uppercase mt-0.5">
              Approved NATO-Delta + Svod 20-Layer Sovereign Combat Capability Blueprint
            </p>
          </div>
        </div>
        <span className="text-[9px] bg-slate-950 border border-slate-800 text-indigo-400 px-2 py-0.5 rounded uppercase font-bold">
          DOCUMENT CLASSIFICATION: SECRET
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Aspect: Layers Selection List */}
        <div className="md:col-span-5 flex flex-col gap-2">
          <div className="bg-slate-950 border border-slate-800 p-2 rounded">
            <span className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Search blueprint services:</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. Zero-Trust, Drone, Jamming..."
              className="w-full bg-slate-900 border border-slate-800 text-white rounded px-2 py-1 text-[11px] focus:border-indigo-500 outline-none uppercase font-mono"
            />
          </div>

          <div className="flex flex-col gap-1 max-h-[350px] overflow-y-auto scrollbar-thin pr-1">
            {filteredLayers.map((cap) => {
              const isSelected = selectedLayer === cap.layer;
              const statusColors = {
                FULL: "border-emerald-950 text-emerald-400 bg-emerald-950/20",
                STANDBY: "border-slate-800 text-slate-500 bg-slate-950/40",
                INTEGRATING: "border-amber-950 text-amber-500 bg-amber-950/20 animate-pulse",
              };

              return (
                <button
                  key={cap.layer}
                  onClick={() => setSelectedLayer(cap.layer)}
                  className={`p-2 rounded border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? "bg-indigo-950 border-indigo-500 text-white shadow-inner"
                      : "bg-slate-950/60 border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] font-bold text-indigo-400 bg-slate-900 border border-slate-800/80 px-1 py-0.5 rounded">
                      L-{cap.layer}
                    </span>
                    <span className="font-bold truncate uppercase">{cap.name}</span>
                  </div>
                  <span className={`text-[8px] font-black px-1 rounded border uppercase ${statusColors[cap.implementationStatus]}`}>
                    {cap.implementationStatus}
                  </span>
                </button>
              );
            })}

            {filteredLayers.length === 0 && (
              <div className="text-slate-600 text-center py-6 text-[10px] uppercase">
                No architectural layers match queries
              </div>
            )}
          </div>
        </div>

        {/* Right Aspect: Detailed Layer breakdown and items list */}
        <div className="md:col-span-7 bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col justify-between gap-3 min-h-[300px]">
          {selectedLayerData ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between border-b border-indigo-950/50 pb-2">
                <div>
                  <div className="text-[9px] text-indigo-400 uppercase font-black">
                    LAYER MODEL 0{selectedLayerData.layer} — {selectedLayerData.category}
                  </div>
                  <h3 className="text-sm font-black text-white uppercase mt-0.5">
                    {selectedLayerData.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase">INTEGRITY LOCK</span>
                  <span className="text-[10px] text-emerald-400 font-bold">VERIFIED SEAL</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Core Operational Description:</span>
                <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans">
                  {selectedLayerData.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 border-b border-slate-900 pb-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">
                    Architectural Submodules ({selectedLayerData.items.length}):
                  </span>
                  <span className="text-[8px] text-indigo-400 uppercase font-semibold">
                    INDRA/Delta Aligned
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {selectedLayerData.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 bg-slate-900 border border-slate-800 rounded flex items-center gap-1.5 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all"
                    >
                      <Cpu className="h-3 w-3 text-indigo-400 shrink-0" />
                      <span className="text-[9.5px] font-bold uppercase truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-slate-600 text-center py-20 uppercase">
              Select or search a tactical layer template
            </div>
          )}

          <div className="p-2 bg-slate-900 border border-slate-800/80 rounded flex items-center gap-2 text-slate-500 text-[9px] uppercase leading-relaxed">
            <ShieldCheck className="h-4 w-4 text-emerald-500 animate-pulse shrink-0" />
            <span>
              Homologated under the Sovereign Delta Security schema. Standardized APP-6 digital registries are replicated in regional edge centers in real-time.
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
