"use client";

import { useState } from "react";
import { useStore, EventMode } from "@/store/useStore";

export default function HUD() {
  const [showInfo, setShowInfo] = useState(false);
  const { eventMode, setEventMode } = useStore();

  const events: { id: EventMode; label: string; color: string }[] = [
    { id: 'normal', label: 'Bình Thường', color: 'bg-gray-500/50' },
    { id: 'solar_eclipse', label: 'Nhật Thực', color: 'bg-yellow-500/50' },
    { id: 'lunar_eclipse', label: 'Nguyệt Thực', color: 'bg-purple-500/50' },
    { id: 'blood_moon', label: 'Trăng Máu', color: 'bg-red-500/50' },
  ];

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-6">
      {/* Header */}
      <div className="flex justify-between items-start z-10 pointer-events-none">
        <div>
          <h1 className="text-3xl font-bold tracking-widest text-white drop-shadow-md">EARTH VR</h1>
          <p className="text-sm font-mono text-cyan-400 mt-1 uppercase tracking-widest">
            Simulation System Online
          </p>
        </div>
        <div className="flex flex-col items-end gap-4 pointer-events-auto">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full transition-all"
          >
            {showInfo ? "Hide Info" : "Show Info"}
          </button>
          
          {/* Events Panel */}
          <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white font-mono flex flex-col gap-2">
            <h3 className="text-xs text-gray-400 mb-2 uppercase tracking-widest">Astronomical Events</h3>
            {events.map((evt) => (
              <button
                key={evt.id}
                onClick={() => setEventMode(evt.id)}
                className={`py-2 px-4 rounded-md transition-all text-sm font-medium border border-transparent 
                  ${eventMode === evt.id ? `${evt.color} border-white/50 shadow-[0_0_10px_rgba(255,255,255,0.2)]` : 'bg-white/5 hover:bg-white/10'}`}
              >
                {evt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="pointer-events-auto w-64 bg-black/50 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white font-mono text-sm self-start mt-4 absolute top-24 left-6">
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span className="text-gray-400">Rotation:</span>
              <span className="text-cyan-400">0.05 rad/s</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-400">Tilt:</span>
              <span className="text-cyan-400">23.5°</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-400">Mode:</span>
              <span className="text-green-400">Interactive</span>
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-white/20 text-xs text-gray-400">
            Use mouse/touch to orbit the planet. Scroll to zoom. Use a VR headset for full immersion.
          </div>
        </div>
      )}

      {/* Controls Hint */}
      <div className="text-center z-10">
        <p className="text-xs font-mono text-white/50 mb-16 tracking-widest">
          ORBIT ENABLED • SCROLL TO ZOOM
        </p>
      </div>
    </div>
  );
}
