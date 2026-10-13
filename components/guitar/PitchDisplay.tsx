"use client";

import React from "react";
import { PitchResult } from "@/lib/guitar/music-theory";

interface PitchDisplayProps {
  isListening: boolean;
  pitch: PitchResult | null;
  confidence: number;
  rms: number;
  isNoteCorrect: boolean | null;
  targetNoteName?: string;
}

export const PitchDisplay: React.FC<PitchDisplayProps> = ({
  isListening,
  pitch,
  confidence,
  rms,
  isNoteCorrect,
  targetNoteName,
}) => {
  if (!isListening) {
    return (
      <div className="rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-4 text-center font-mono text-xs text-[var(--ink-mute)]">
        Microphone is disabled. Click <span className="text-[var(--accent)] font-semibold">&ldquo;Enable Mic&rdquo;</span> above to detect guitar notes in real-time.
      </div>
    );
  }

  // Cents bar position (-50 to +50 cents mapped to percentage)
  const cents = pitch ? pitch.cents : 0;
  const clampedCents = Math.max(-50, Math.min(50, cents));
  const needlePercentage = ((clampedCents + 50) / 100) * 100;

  // Status color logic
  let statusBadge = (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
      Listening for acoustic guitar...
    </span>
  );

  if (pitch) {
    if (isNoteCorrect === true) {
      statusBadge = (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-green-100 text-green-800 border border-green-300">
          ✓ Correct Note {targetNoteName ? `(${targetNoteName})` : ""}
        </span>
      );
    } else if (isNoteCorrect === false) {
      statusBadge = (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-red-100 text-red-800 border border-red-300">
          ✗ Out of scale / target
        </span>
      );
    }
  }

  return (
    <div className="rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-4 sm:p-5 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
        {/* Left: Big Note & Octave */}
        <div className="flex items-baseline justify-center md:justify-start gap-2">
          <div className="text-4xl sm:text-5xl font-departure font-bold text-[var(--ink)]">
            {pitch ? pitch.note : "—"}
          </div>
          {pitch && (
            <div className="text-xl font-mono text-[var(--ink-mute)]">
              {pitch.octave}
            </div>
          )}
          <div className="ml-3">{statusBadge}</div>
        </div>

        {/* Center: Pitch Cents Tuner Needle */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-[var(--ink-mute)]">
            <span>-50c (Flat)</span>
            <span className="font-semibold text-[var(--ink)]">In Tune</span>
            <span>+50c (Sharp)</span>
          </div>

          {/* Meter Track */}
          <div className="relative h-4 bg-[var(--bg)] border border-[var(--rule)] rounded-full overflow-hidden">
            {/* Center target indicator */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-green-600/30 -translate-x-1/2" />

            {/* Needle */}
            {pitch && (
              <div
                className={`absolute top-0 bottom-0 w-2.5 -translate-x-1/2 rounded-full transition-all duration-75 ${
                  Math.abs(cents) <= 8
                    ? "bg-green-600"
                    : Math.abs(cents) <= 20
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
                style={{ left: `${needlePercentage}%` }}
              />
            )}
          </div>

          <div className="text-center font-mono text-[11px] text-[var(--ink-mute)]">
            {pitch ? (
              <span>
                {cents > 0 ? `+${cents}` : cents} cents (
                {pitch.frequency.toFixed(1)} Hz)
              </span>
            ) : (
              <span>Play any note on your guitar</span>
            )}
          </div>
        </div>

        {/* Right: Signal & Confidence Gauge */}
        <div className="flex flex-col items-center md:items-end gap-1.5 font-mono text-xs text-[var(--ink-mute)]">
          <div className="flex items-center gap-2">
            <span>Mic Volume:</span>
            <div className="w-24 h-2 bg-[var(--bg)] border border-[var(--rule)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent-teal)] transition-all duration-75"
                style={{ width: `${Math.min(100, rms * 500)}%` }}
              />
            </div>
          </div>
          <div className="text-[11px]">
            Confidence: {pitch ? `${Math.round(confidence * 100)}%` : "0%"}
          </div>
        </div>
      </div>
    </div>
  );
};
