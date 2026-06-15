import React, { useState } from "react";
import { Flame, ShieldAlert, Target, Play, Compass, Database, RefreshCw, AlertTriangle } from "lucide-react";

interface NominatedTarget {
  id: string;
  name: string;
  type: string;
  coordinates: string;
  vulnerabilityScore: number; // 0-100% calculation
  suggestedFirearms: string[];
  status: "PENDING" | "ENGAGING" | "DESTROYED";
  detectionRadar: string;
}

interface DeltaTargetHubProps {
  onAddLog?: (log: { source: string; type: "ALERT" | "INFO" | "SUCCESS" | "WARNING"; message: string }) => void;
  onFireWeapon?: (targetName: string, weapon: string) => void;
}

export default function DeltaTargetHub({ onAddLog, onFireWeapon }: DeltaTargetHubProps) {
  const [nominations, setNominations] = useState<NominatedTarget[]>([
    {
      id: "t-nom-1",
      name: "RED T-90 Tank Column",
      type: "ARMOR",
      coordinates: "43Q LD 51928 12845",
      vulnerabilityScore: 84,
      suggestedFirearms: ["Pinaka cluster MBRL", "Vajra FPV Swarm Node", "M777 Light Howitzer"],
      status: "PENDING",
      detectionRadar: "Heron UAV 47 Scan"
    },
    {
      id: "t-nom-2",
      name: "Hostile Mobile S-400 Radar",
      type: "AIR_DEFENSE",
      coordinates: "43Q LD 54109 13582",
      vulnerabilityScore: 92,
      suggestedFirearms: ["BrahMos Precision Strike Cruise", "Nishant Altitude Hunter"],
      status: "PENDING",
      detectionRadar: "AWACS SAR Scan"
    },
    {
      id: "t-nom-3",
      name: "Frontier Tactical Radio Tower",
      type: "COMMS_HUB",
      coordinates: "43Q LD 45190 14810",
      vulnerabilityScore: 45,
      suggestedFirearms: ["EW Spectrum Electronic Suppression", "Pinaka cluster MBRL"],
      status: "PENDING",
      detectionRadar: "ELINT Intercept Scan"
    }
  ]);

  const [activeNomId, setActiveNomId] = useState("t-nom-1");
  const [ballisticAngle, setBallisticAngle] = useState(42.5);
  const [firingSpeed, setFiringSpeed] = useState(380); // in m/s
  const [selectedWeapon, setSelectedWeapon] = useState("Pinaka cluster MBRL");
  const [isFiringSequence, setIsFiringSequence] = useState(false);

  const selectedTarget = nominations.find((t) => t.id === activeNomId);

  const handleNominateNew = () => {
    const customNames = ["Red Supply Line Convoy", "Unmanned Radar Bunker", "Red Mobile command post"];
    const coordsList = ["43Q LD 49210 11950", "43Q LD 53150 12100", "43Q LD 56120 13440"];
    const idx = Math.floor(Math.random() * customNames.length);

    const target: NominatedTarget = {
      id: `t-nom-${Date.now()}`,
      name: customNames[idx],
      type: "ARMOR",
      coordinates: coordsList[idx],
      vulnerabilityScore: Math.floor(Math.random() * 30) + 60,
      suggestedFirearms: ["Pinaka cluster MBRL", "BrahMos Precision Strike Cruise"],
      status: "PENDING",
      detectionRadar: "GSAT satellite thermal change sweep"
    };

    setNominations((prev) => [...prev, target]);
    setActiveNomId(target.id);
    if (onAddLog) {
      onAddLog({
        source: "TARGET HUB",
        type: "SUCCESS",
        message: `NOMINATED TARGET ADDED: Registered [${target.name}] to Target Hub queue. Performing digital terrain analysis.`
      });
    }
  };

  const handleCommenceStrike = (target: NominatedTarget) => {
    setIsFiringSequence(true);

    if (onAddLog) {
      onAddLog({
        source: "SHAKTI C3 ARTILLERY",
        type: "ALERT",
        message: `BALLISTIC SEQUENCE INITIALIZED: Locking weapon [${selectedWeapon}] onto coordinate [${target.coordinates}]. Angle of attack is: ${ballisticAngle}° at velocity: ${firingSpeed} m/s.`
      });
    }

    setNominations((prev) =>
      prev.map((t) => (t.id === target.id ? { ...t, status: "ENGAGING" } : t))
    );

    setTimeout(() => {
      setIsFiringSequence(false);
      setNominations((prev) =>
        prev.map((t) => (t.id === target.id ? { ...t, status: "DESTROYED" } : t))
      );

      if (onAddLog) {
        onAddLog({
          source: "DAMAGE ASSESS UAV",
          type: "SUCCESS",
          message: `IMPACT FEED CONFIRMED: Target [${target.name}] neutral. Trajectory locked ballistic angle ${ballisticAngle}° successfully matched predicted strike model.`
        });
      }

      if (onFireWeapon) {
        onFireWeapon(target.name, selectedWeapon);
      }
    }, 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-xl select-none flex flex-col h-[320px] font-mono text-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <Target className="h-4 w-4 text-red-500 animate-pulse" />
          <div>
            <h3 className="font-bold text-white uppercase text-[11px] tracking-wider">TARGET HUB TARGET-NOMINEE</h3>
            <span className="text-[7.5px] text-slate-500 block uppercase">WEAPONRY SELECTION & ENGAGEMENT COORD</span>
          </div>
        </div>

        <button
          onClick={handleNominateNew}
          className="bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 text-red-400 text-[8.5px] font-bold px-2 py-0.5 rounded uppercase font-mono transition-all"
        >
          NOMINATE NEW TARGET +
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 py-2 overflow-hidden h-full">
        {/* Left Side: Target Queue List */}
        <div className="md:col-span-5 flex flex-col gap-1.5 overflow-y-auto scrollbar-thin pr-1">
          {nominations.map((t) => {
            const isActive = t.id === activeNomId;
            const statusColors = {
              PENDING: "bg-slate-900 border-slate-800 text-slate-500",
              ENGAGING: "bg-amber-950/40 border-amber-800 text-amber-500 animate-pulse",
              DESTROYED: "bg-emerald-950/40 border-emerald-800 text-emerald-400"
            };

            return (
              <div
                key={t.id}
                onClick={() => setActiveNomId(t.id)}
                className={`p-2 rounded border cursor-pointer transition-all flex flex-col gap-1 ${
                  isActive
                    ? "bg-red-950/30 border-red-500 text-white shadow-md shadow-red-950/25"
                    : "bg-slate-950/50 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-[9px] truncate">{t.name}</span>
                  <span className={`text-[7px] font-black px-1 rounded uppercase border ${statusColors[t.status]}`}>
                    {t.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[8px] text-slate-500">
                  <span>COORD: {t.coordinates}</span>
                  <span className="font-semibold text-red-400">THREAT: {t.vulnerabilityScore}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Ballistics computations & fire triggers */}
        <div className="md:col-span-7 bg-slate-950 border border-slate-800 rounded-lg p-2 flex flex-col justify-between h-full overflow-hidden">
          {selectedTarget ? (
            <div className="flex flex-col gap-1.5 h-full justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-1 mb-1">
                  <span className="text-[9px] text-red-400 font-bold uppercase select-none">SHAKTI FIRE CALCULATIONS</span>
                  <span className="text-[7.5px] text-slate-600 uppercase font-semibold">FEED: {selectedTarget.detectionRadar}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px]">TARGET NOM:</span>
                    <span className="text-white font-bold uppercase truncate block">{selectedTarget.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px]">COORDINATE REF:</span>
                    <span className="text-white font-mono block">{selectedTarget.coordinates}</span>
                  </div>
                </div>
              </div>

              {/* Angle selector sliders */}
              <div className="bg-slate-900 p-1.5 rounded border border-slate-850 flex flex-col gap-1 text-[8.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 uppercase font-extrabold">BALLISTIC ANGLE:</span>
                  <span className="text-red-400 font-bold">{ballisticAngle}°</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="85"
                  step="0.5"
                  value={ballisticAngle}
                  onChange={(e) => setBallisticAngle(parseFloat(e.target.value))}
                  disabled={isFiringSequence}
                  className="w-full accent-red-500 h-1 rounded bg-slate-950 outline-none cursor-pointer"
                />

                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-400 uppercase font-extrabold">PROPELLANT MUZZLE SPEED:</span>
                  <span className="text-cyan-400 font-bold">{firingSpeed} m/s</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="900"
                  step="10"
                  value={firingSpeed}
                  onChange={(e) => setFiringSpeed(parseInt(e.target.value))}
                  disabled={isFiringSequence}
                  className="w-full accent-cyan-500 h-1 rounded bg-slate-950 outline-none cursor-pointer"
                />
              </div>

              {/* Weapon Selection dropdown */}
              <div>
                <span className="text-[8.5px] text-slate-500 uppercase block mb-1 font-bold">MATCH WEAPONEERING STRATEGY:</span>
                <select
                  value={selectedWeapon}
                  onChange={(e) => setSelectedWeapon(e.target.value)}
                  disabled={isFiringSequence}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded px-2 py-1 text-[10px] outline-none font-mono uppercase"
                >
                  {selectedTarget.suggestedFirearms.map((wp) => (
                    <option key={wp} value={wp}>
                      {wp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fire submission triggers */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-900 shrink-0">
                <span className="text-[8px] text-slate-500 font-bold">THEATER ENGAGEMENT RULE: DEFCON-2</span>
                {selectedTarget.status === "DESTROYED" ? (
                  <span className="text-[10px] text-emerald-400 font-black uppercase flex items-center gap-1">
                    ✓ TARGET COMPLETELY NEUTRALIZED
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCommenceStrike(selectedTarget)}
                    disabled={isFiringSequence}
                    className="px-3 py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-400 text-[10px] font-bold rounded flex items-center gap-1 uppercase transition-all"
                  >
                    <Flame className="h-3 w-3 animate-pulse text-red-500" />
                    {isFiringSequence ? "FIRE SEQUENCING LIVE..." : "COMMENCE FIRE"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-slate-600 text-center py-20 uppercase">
              Select or Nominate a target track to engage
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
