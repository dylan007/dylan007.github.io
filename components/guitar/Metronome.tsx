"use client";

import React, { useState, useEffect, useRef } from "react";
import { WebAudioMetronome } from "@/lib/guitar/metronome";

export const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState<number>(90);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeBeat, setActiveBeat] = useState<number>(-1);

  const metronomeRef = useRef<WebAudioMetronome | null>(null);
  const tapTimesRef = useRef<number[]>([]);

  useEffect(() => {
    metronomeRef.current = new WebAudioMetronome(90);
    return () => {
      if (metronomeRef.current) {
        metronomeRef.current.stop();
      }
    };
  }, []);

  const handleBpmChange = (newBpm: number) => {
    const clamped = Math.max(30, Math.min(260, newBpm));
    setBpm(clamped);
    if (metronomeRef.current) {
      metronomeRef.current.setBpm(clamped);
    }
  };

  const togglePlay = async () => {
    if (!metronomeRef.current) {
      metronomeRef.current = new WebAudioMetronome(bpm);
    }

    if (isPlaying) {
      metronomeRef.current.stop();
      setIsPlaying(false);
      setActiveBeat(-1);
    } else {
      await metronomeRef.current.start((beatNumber) => {
        setActiveBeat(beatNumber);
      });
      setIsPlaying(true);
    }
  };

  // Tap tempo algorithm
  const handleTap = () => {
    const now = performance.now();
    const taps = tapTimesRef.current;

    // Reset if last tap was more than 2.5 seconds ago
    if (taps.length > 0 && now - taps[taps.length - 1] > 2500) {
      taps.length = 0;
    }

    taps.push(now);
    if (taps.length > 4) {
      taps.shift();
    }

    if (taps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval =
        intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      handleBpmChange(calculatedBpm);
    }
  };

  return (
    <div className="rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-4 sm:p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Metronome Title & Beat Indicator */}
        <div className="flex items-center gap-4">
          <div>
            <span className="block text-xs font-mono font-medium text-[var(--ink-mute)] uppercase tracking-wider">
              Metronome
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {[0, 1, 2, 3].map((b) => (
                <div
                  key={b}
                  className={`w-3 h-3 rounded-full transition-all duration-75 ${
                    activeBeat === b
                      ? b === 0
                        ? "bg-[var(--accent)] scale-125 shadow-xs"
                        : "bg-[var(--accent-teal)] scale-110"
                      : "bg-[var(--rule)]"
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={togglePlay}
            className={`px-4 py-2 rounded-md font-mono text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer ${
              isPlaying
                ? "bg-[var(--accent)] text-white hover:opacity-90"
                : "bg-[var(--ink)] text-white hover:opacity-90"
            }`}
          >
            {isPlaying ? "Pause" : "Start"}
          </button>
        </div>

        {/* Center: BPM Slider & Controls */}
        <div className="flex-1 max-w-sm flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleBpmChange(bpm - 1)}
            className="w-7 h-7 rounded border border-[var(--rule)] bg-[var(--bg)] text-xs font-mono font-bold hover:border-[var(--accent)] cursor-pointer"
          >
            -
          </button>

          <input
            type="range"
            min={40}
            max={220}
            value={bpm}
            onChange={(e) => handleBpmChange(Number(e.target.value))}
            className="flex-1 accent-[var(--accent)] cursor-pointer"
          />

          <button
            type="button"
            onClick={() => handleBpmChange(bpm + 1)}
            className="w-7 h-7 rounded border border-[var(--rule)] bg-[var(--bg)] text-xs font-mono font-bold hover:border-[var(--accent)] cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Right: Big BPM Readout & Tap Tempo */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-2xl font-departure font-bold text-[var(--ink)]">
              {bpm}
            </span>
            <span className="text-xs font-mono text-[var(--ink-mute)] ml-1">
              BPM
            </span>
          </div>

          <button
            type="button"
            onClick={handleTap}
            className="px-3 py-1.5 rounded border border-[var(--rule)] bg-[var(--bg)] hover:border-[var(--accent-violet)] text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            Tap
          </button>
        </div>
      </div>
    </div>
  );
};
