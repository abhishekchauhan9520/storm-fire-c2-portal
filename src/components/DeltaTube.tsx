import React, { useState, useEffect } from "react";
import { DeltaSensor } from "../types";
import { Tv, Activity, ShieldCheck, RefreshCw, Layers, Compass, Loader, Flame } from "lucide-react";

interface DeltaTubeProps {
  onAddLog?: (log: { source: string; type: "ALERT" | "INFO" | "SUCCESS" | "WARNING"; message: string }) => void;
}

export default function DeltaTube({ onAddLog }: DeltaTubeProps) {
  const [sensors, setSensors] = useState<DeltaSensor[]>([
    {
      id: "sens-1",
      name: "AWACS SAR Ground Radar",
      type: "RADAR_SAR",
      status: "RECEIVING",
      location: "Sector 4 Air Corridor",
      strength: 92,
      recentDetectCount: 3,
      feedUrl: "Synthetic Aperture radar scanning terrain change detection gaps.",
      healthLog: "Stable telemetry feedback"
    },
    {
      id: "sens-2",
      name: "Valleys IR High Gain Cam",
      type: "EO_THERMAL",
      status: "RECEIVING",
      location: "Karakoram Ridge Point 4",
      strength: 88,
      recentDetectCount: 1,
      feedUrl: "Thermal imaging showing temperature anomalies of troop encampments.",
      healthLog: "Optimal cooling cycle online"
    },
    {
      id: "sens-3",
      name: "Seismic Ground Microphone Array",
      type: "ACOUSTIC_ARRAY",
      status: "RECEIVING",
      location: "Demchok Border Road Zone",
      strength: 95,
      recentDetectCount: 2,
      feedUrl: "Vibrational sound spectrogram isolating heavy tank engine low-freq waves.",
      healthLog: "Microphones calibrated"
    },
    {
      id: "sens-4",
      name: "GSAT Orbit Multi-Spectral Sweep",
      type: "SATELLITE_SWEEP",
      status: "STANDBY",
      location: "High Earth Orbit Track 2",
      strength: 78,
      recentDetectCount: 0,
      feedUrl: "Optical satellite grid sweeping Ladakh glacier for camouflage nets.",
      healthLog: "Solar arrays charging"
    }
  ]);

  const [activeSensorId, setActiveSensorId] = useState("sens-1");
  const [scanSpeed, setScanSpeed] = useState(60);
  const [spectrogramData, setSpectrogramData] = useState<number[]>([12, 45, 87, 34, 21, 67, 95, 34, 56, 88, 12, 44]);

  // Animate mock spectrogram data
  useEffect(() => {
    const timer = setInterval(() => {
      setSpectrogramData((prev) =>
        prev.map(() => Math.floor(Math.random() * 85) + 15)
      );
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleSyncSensor = (id: string) => {
    setSensors((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          if (onAddLog) {
            onAddLog({
              source: s.type,
              type: "SUCCESS",
              message: `Re-calibrated sensor array loops for [${s.name}]. Baseline signal boosted.`
            });
          }
          return { ...s, strength: 99, status: "RECEIVING" };
        }
        return s;
      })
    );
  };

  const selectedSensor = sensors.find((s) => s.id === activeSensorId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-xl select-none flex flex-col h-[320px] font-mono text-xs">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <Tv className="h-4 w-4 text-purple-400 animate-pulse" />
          <div>
            <h3 className="font-bold text-white uppercase text-[11px] tracking-wider">TUBE MULTI-SENSOR STREAMS</h3>
            <span className="text-[7.5px] text-slate-500 block uppercase">FUSED ELECTROMAGNETIC TARGET EMISSIONS</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[8px] text-slate-400 font-bold uppercase">SENSITIVITY:</span>
          <input
            type="range"
            min="20"
            max="100"
            value={scanSpeed}
            onChange={(e) => setScanSpeed(parseInt(e.target.value))}
            className="w-16 accent-purple-500 cursor-pointer"
          />
          <span className="text-[9px] text-purple-400 font-bold">{scanSpeed}Hz</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 py-2 overflow-hidden h-full">
        {/* Left Side: Active Streams Lists */}
        <div className="md:col-span-5 flex flex-col gap-1.5 overflow-y-auto scrollbar-thin pr-1">
          {sensors.map((s) => {
            const isActive = s.id === activeSensorId;
            const isStandby = s.status === "STANDBY";
            return (
              <div
                key={s.id}
                onClick={() => setActiveSensorId(s.id)}
                className={`p-2 rounded border cursor-pointer transition-all flex flex-col gap-1 ${
                  isActive
                    ? "bg-purple-950/30 border-purple-500 text-white shadow-md shadow-purple-950/20"
                    : "bg-slate-950/50 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase truncate pr-1 text-[9.5px]">{s.name}</span>
                  <span className={`text-[7px] font-black px-1 rounded uppercase ${isActive ? "bg-purple-900/60 text-purple-300 border border-purple-800" : "bg-slate-900 border border-slate-800 text-slate-500"}`}>
                    {s.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[8px] text-slate-500">
                  <span className="truncate">{s.location}</span>
                  <span className="font-mono text-slate-400">SIG: {s.strength}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Visualizing detailed spectrogram and parameters */}
        <div className="md:col-span-7 bg-slate-950 border border-slate-800 rounded-lg p-2 flex flex-col justify-between h-full overflow-hidden">
          {selectedSensor ? (
            <div className="flex flex-col gap-2 h-full justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                  <span className="text-[9px] text-purple-400 font-bold uppercase">{selectedSensor.type} SPECTRAL DATA</span>
                  <span className="text-[7.5px] text-slate-600 uppercase font-semibold">REPLICATOR DECODER: ONLINE</span>
                </div>
                <p className="text-[9.5px] text-slate-400 leading-normal font-sans py-1">
                  {selectedSensor.feedUrl}
                </p>
              </div>

              {/* Dynamic waveform visualizer to mimic real-time video feed spectrogram in image */}
              <div className="bg-slate-900 p-1.5 rounded border border-slate-850 flex flex-col gap-1.5 select-none">
                <span className="text-[8px] text-slate-500 uppercase font-extrabold flex items-center justify-between">
                  <span>SPECTRUM ENVELOPE WATERFALL (REALTIME)</span>
                  <span className="text-[7.5px] text-purple-400 animate-pulse">SWEEP ACTIVE: {scanSpeed * 2.5} MS</span>
                </span>
                <div className="h-14 flex items-end gap-1 px-1 bg-slate-950 border border-slate-950/60 rounded">
                  {spectrogramData.map((val, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-purple-500/80 rounded-t transition-all duration-300"
                      style={{
                        height: `${val}%`,
                        backgroundColor: val > 75 ? "#c084fc" : val > 45 ? "#a855f7" : "#7e22ce"
                      }}
                    ></div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[8px] text-slate-500">
                  <span>0.1 GHz</span>
                  <span>1.5 GHz</span>
                  <span>3.0 GHz (COGNITIVE SHIELD)</span>
                </div>
              </div>

              {/* Operations Footer inside card */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-900 shrink-0">
                <span className="text-[8.5px] text-slate-500">HEALTH: {selectedSensor.healthLog}</span>
                <button
                  type="button"
                  onClick={() => handleSyncSensor(selectedSensor.id)}
                  className="px-2 py-0.5 bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-400 text-[8px] font-bold rounded flex items-center gap-1 uppercase transition-all"
                >
                  <RefreshCw className="h-2.5 w-2.5" />
                  CALIBRATE
                </button>
              </div>
            </div>
          ) : (
            <div className="text-slate-600 text-center py-20 uppercase">
              Select an active telemetry stream
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
