import React, { useState } from "react";
import { FabricEntity } from "../types";
import { Database, Link, Bot, Info, Search, RefreshCw, Layers } from "lucide-react";

interface DeltaDataFabricProps {
  onAddLog?: (log: { source: string; type: "ALERT" | "INFO" | "SUCCESS" | "WARNING"; message: string }) => void;
  tracks?: Array<{ id: string; name: string }>;
}

export default function DeltaDataFabric({ onAddLog, tracks = [] }: DeltaDataFabricProps) {
  const [entities, setEntities] = useState<FabricEntity[]>([
    {
      id: "ent-1",
      name: "Sector 4 Rear HQ Command Bunker",
      type: "HQ_BUNKER",
      confidence: 99.4,
      associatedTracks: ["b-1", "b-3"],
      lastInferred: "1 min ago",
      connections: [
        { targetId: "ent-2", relation: "PROVIDES_TARGETS" },
        { targetId: "ent-4", relation: "DEFENDED_BY" },
      ]
    },
    {
      id: "ent-2",
      name: "Hostile Mobile S-400 Radar Tower Cluster",
      type: "RADAR_TOWER",
      confidence: 94.1,
      associatedTracks: ["r-2"],
      lastInferred: "Now",
      connections: [
        { targetId: "ent-3", relation: "INTEGRATES_AIR_COVER" }
      ]
    },
    {
      id: "ent-3",
      name: "Red T-90 Tank Column Division",
      type: "RECON_PATROL",
      confidence: 89.7,
      associatedTracks: ["r-1"],
      lastInferred: "3 min ago",
      connections: [
        { targetId: "ent-2", relation: "FEEDS_RADAR_INTEL" }
      ]
    },
    {
      id: "ent-4",
      name: "8 Mountain Division Artillery Depot",
      type: "SUPPLY_CONVOY",
      confidence: 97.2,
      associatedTracks: ["b-2"],
      lastInferred: "10 min ago",
      connections: [
        { targetId: "ent-1", relation: "REPORTS_TO" }
      ]
    }
  ]);

  const [activeEntityId, setActiveEntityId] = useState("ent-1");
  const [searchTerm, setSearchTerm] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  const handleResolveDuplicates = () => {
    setIsResolving(true);
    if (onAddLog) {
      onAddLog({
        source: "DATA FABRIC",
        type: "INFO",
        message: "COGNITIVE ENTITY RESOLUTION: Invoking Sovereign-Style signal de-duplication loop. Parsing 42 disparate database tables across Army ASCON, Air Force AFNET, and space sweeps..."
      });
    }

    setTimeout(() => {
      setIsResolving(false);
      setEntities((prev) =>
        prev.map((ent) => ({
          ...ent,
          confidence: Math.min(100, ent.confidence + 0.5),
          lastInferred: "Just resolved"
        }))
      );
      if (onAddLog) {
        onAddLog({
          source: "DATA FABRIC",
          type: "SUCCESS",
          message: "RESOLUTION COMPLETED: Duplicated drone coordinates and satellite transponder pings combined. Resolved 4 overlapping tracks into elegant entity clusters (99.8% precision index)."
        });
      }
    }, 2000);
  };

  const filteredEntities = entities.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEntity = entities.find((e) => e.id === activeEntityId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-xl select-none flex flex-col h-[320px] font-mono text-xs">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <Database className="h-4 w-4 text-emerald-400" />
          <div>
            <h3 className="font-bold text-white uppercase text-[11px] tracking-wider">SOVEREIGN DATA FABRIC</h3>
            <span className="text-[7.5px] text-slate-500 block uppercase">ENTITY RESOLUTION & OPERATIONAL KNOWLEDGE GRAPH</span>
          </div>
        </div>

        <button
          onClick={handleResolveDuplicates}
          disabled={isResolving}
          className="bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800 text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded uppercase font-mono transition-all flex items-center gap-1"
        >
          <RefreshCw className={`h-2.5 w-2.5 ${isResolving ? "animate-spin" : ""}`} />
          {isResolving ? "RESOLVING CLUTTER..." : "INVOKE ENTITY RESOLVER"}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 py-2 overflow-hidden h-full">
        {/* Left Aspect: Entities selection and search */}
        <div className="md:col-span-5 flex flex-col gap-1.5 overflow-hidden">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded shrink-0">
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search entity records..."
              className="w-full bg-transparent outline-none border-none text-[9.5px] text-white uppercase font-semibold h-4"
            />
          </div>

          <div className="flex-grow overflow-y-auto scrollbar-thin pr-1 flex flex-col gap-1.5">
            {filteredEntities.map((ent) => {
              const isActive = ent.id === activeEntityId;
              return (
                <div
                  key={ent.id}
                  onClick={() => setActiveEntityId(ent.id)}
                  className={`p-2 rounded border cursor-pointer transition-all flex flex-col gap-1 ${
                    isActive
                      ? "bg-slate-950/80 border-emerald-500 text-white shadow-md"
                      : "bg-slate-950/40 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase text-[9.5px] truncate pr-1">{ent.name}</span>
                    <span className="text-[7.5px] bg-slate-900 border border-slate-800 text-emerald-400 font-bold px-1 rounded">
                      {ent.confidence}% CONF
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[7.5px] text-slate-500">
                    <span>ASSOCIATION CODES: {ent.associatedTracks.join(", ")}</span>
                    <span className="font-semibold">{ent.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Aspect: Connections knowledge graph detail */}
        <div className="md:col-span-7 bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between h-full overflow-hidden">
          {selectedEntity ? (
            <div className="flex flex-col gap-1.5 h-full justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-1 mb-1">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase">RESOLVED METADATA RELATION</span>
                  <span className="text-[7.5px] text-slate-600 uppercase font-semibold">TENSOR WEIGHTS MATRIX LINK</span>
                </div>
                
                <h4 className="text-[10.5px] text-white font-black uppercase mb-1.5">
                  {selectedEntity.name}
                </h4>

                <div className="grid grid-cols-2 gap-1.5 text-[8.5px] text-slate-400 mb-2">
                  <div className="bg-slate-900 p-1 rounded border border-slate-850/65">
                    <span className="text-slate-500 text-[7px] uppercase font-bold block">SIGNAL TRACK CODES:</span>
                    <span className="text-slate-300 font-bold">{selectedEntity.associatedTracks.length} tracks consolidated</span>
                  </div>
                  <div className="bg-slate-900 p-1 rounded border border-slate-850/65">
                    <span className="text-slate-500 text-[7px] uppercase font-bold block">LAST RE-INFERRED:</span>
                    <span className="text-slate-300 font-bold uppercase">{selectedEntity.lastInferred}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Relationship Tree Visualizer */}
              <div className="bg-slate-900 p-1.5 rounded border border-slate-850 flex flex-col gap-1 overflow-hidden shrink-0">
                <span className="text-[7.5px] text-slate-500 uppercase font-extrabold flex items-center gap-1 mb-0.5">
                  <Link className="h-3 w-3 text-emerald-400" />
                  OPERATIONAL KNOWLEDGE GRAPH CONSTRAINTS
                </span>

                <div className="flex flex-col gap-1.5 bg-slate-950 p-1.5 border border-slate-850/50 rounded max-h-[85px] overflow-y-auto">
                  {selectedEntity.connections.map((c, idx) => {
                    const targetName = entities.find((ent) => ent.id === c.targetId)?.name || c.targetId;
                    return (
                      <div key={idx} className="flex items-center gap-1.5 text-[9px] leading-tight text-slate-450 border-b border-slate-900 pb-1 last:border-b-0 last:pb-0">
                        <span className="text-emerald-400 font-extrabold uppercase shrink-0">
                          {c.relation} ➟
                        </span>
                        <span className="font-semibold text-slate-300 truncate uppercase">{targetName}</span>
                      </div>
                    );
                  })}
                  {selectedEntity.connections.length === 0 && (
                    <div className="text-slate-600 text-center text-[7.5px] uppercase">
                      No parsed outbound relation links online
                    </div>
                  )}
                </div>
              </div>

              {/* Secure audit stamp */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-900 shrink-0 select-none">
                <div className="flex items-center gap-1 text-[8px] text-slate-500 uppercase font-bold">
                  <Bot className="h-3.5 w-3.5 text-emerald-500" />
                  <span>IDENTITY LOCK: CERTIFIED CHIP V-4.2</span>
                </div>
                <span className="text-[7.5px] text-emerald-400 font-black uppercase">
                  ZERO-TRUST AUDITED
                </span>
              </div>
            </div>
          ) : (
            <div className="text-slate-600 text-center py-20 uppercase">
              Select resolved identity to graph connections
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
