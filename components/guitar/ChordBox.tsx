"use client";

import React, { useState } from "react";
import { ChordVoicing, getVoicingFrequencies } from "@/lib/guitar/chord-voicings";
import { referenceTonePlayer } from "@/lib/guitar/reference-tone";

interface ChordBoxProps {
  voicing: ChordVoicing;
  chordName?: string;
}

export const ChordBox: React.FC<ChordBoxProps> = ({ voicing, chordName }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // SVG grid dimensions
  const width = 200;
  const height = 240;
  const marginX = 35;
  const marginTop = 48;
  const gridWidth = width - marginX * 2; // 130
  const gridHeight = 140;

  const stringCount = 6;
  const fretCount = 5;

  const stringSpacing = gridWidth / (stringCount - 1);
  const fretSpacing = gridHeight / fretCount;

  const isNut = voicing.baseFret <= 1;

  // Strum audio preview
  const handleStrum = async () => {
    setIsPlaying(true);
    const frequencies = getVoicingFrequencies(voicing);
    await referenceTonePlayer.playChord(frequencies, 35, 2.2);
    setTimeout(() => setIsPlaying(false), 800);
  };

  // Arpeggiate audio preview
  const handleArpeggiate = async () => {
    setIsPlaying(true);
    const frequencies = getVoicingFrequencies(voicing);
    await referenceTonePlayer.playArpeggio(frequencies, 200, 1.4);
    setTimeout(() => setIsPlaying(false), frequencies.length * 200 + 400);
  };

  return (
    <div className="flex flex-col items-center rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-4 shadow-sm">
      {/* Chord Name Header */}
      <div className="text-center mb-1">
        <h4 className="text-lg font-departure font-semibold text-[var(--ink)]">
          {chordName || `${voicing.root} ${voicing.name}`}
        </h4>
        <span className="text-xs font-mono text-[var(--ink-mute)]">
          {voicing.name}
        </span>
      </div>

      {/* SVG Diagram */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-48 h-auto select-none font-mono"
      >
        {/* Nut (fret 0) or Top Fret Line */}
        <line
          x1={marginX - 2}
          y1={marginTop}
          x2={marginX + gridWidth + 2}
          y2={marginTop}
          stroke={isNut ? "var(--ink)" : "var(--rule)"}
          strokeWidth={isNut ? 5 : 2}
        />

        {/* Base Fret Number (if higher up neck) */}
        {!isNut && (
          <text
            x={marginX - 10}
            y={marginTop + fretSpacing * 0.7}
            fontSize="11"
            fontWeight="700"
            textAnchor="end"
            fill="var(--accent)"
            className="font-mono"
          >
            {voicing.baseFret}fr
          </text>
        )}

        {/* Horizontal Frets */}
        {Array.from({ length: fretCount }).map((_, fIdx) => (
          <line
            key={`fret-line-${fIdx}`}
            x1={marginX}
            y1={marginTop + (fIdx + 1) * fretSpacing}
            x2={marginX + gridWidth}
            y2={marginTop + (fIdx + 1) * fretSpacing}
            stroke="var(--rule)"
            strokeWidth={1.5}
          />
        ))}

        {/* Vertical Strings (Strings 6 [Low E] on left to 1 [High E] on right) */}
        {Array.from({ length: stringCount }).map((_, sIdx) => {
          const x = marginX + sIdx * stringSpacing;
          // Gauge thickness: low E thicker
          const strokeWidth = 1.0 + (5 - sIdx) * 0.3;

          return (
            <line
              key={`string-line-${sIdx}`}
              x1={x}
              y1={marginTop}
              x2={x}
              y2={marginTop + gridHeight}
              stroke="#8a8375"
              strokeWidth={strokeWidth}
            />
          );
        })}

        {/* Open (O) and Mute (X) string markers above Nut */}
        {voicing.frets.map((fret, sIdx) => {
          const x = marginX + sIdx * stringSpacing;
          const y = marginTop - 12;

          if (fret === -1) {
            // Muted X
            return (
              <text
                key={`mute-${sIdx}`}
                x={x}
                y={y}
                fontSize="12"
                fontWeight="700"
                textAnchor="middle"
                fill="#b91c1c"
                className="font-mono"
              >
                ×
              </text>
            );
          }
          if (fret === 0) {
            // Open O
            return (
              <circle
                key={`open-${sIdx}`}
                cx={x}
                cy={y - 4}
                r={4}
                fill="none"
                stroke="var(--ink)"
                strokeWidth={1.5}
              />
            );
          }
          return null;
        })}

        {/* Barre line if applicable */}
        {voicing.barres?.map((b, bIdx) => {
          // fromString and toString are 1-indexed (6=low E, 1=high E)
          const leftStringIdx = 6 - b.fromString;
          const rightStringIdx = 6 - b.toString;
          const x1 = marginX + Math.min(leftStringIdx, rightStringIdx) * stringSpacing;
          const x2 = marginX + Math.max(leftStringIdx, rightStringIdx) * stringSpacing;
          const relativeFret = b.fret - voicing.baseFret + 1;
          const y = marginTop + (relativeFret - 0.5) * fretSpacing;

          return (
            <rect
              key={`barre-${bIdx}`}
              x={x1}
              y={y - 7}
              width={x2 - x1}
              height={14}
              rx={7}
              fill="var(--accent)"
              opacity={0.85}
            />
          );
        })}

        {/* Finger Dots on Frets */}
        {voicing.frets.map((fret, sIdx) => {
          if (fret <= 0) return null; // Muted or open

          const relativeFret = fret - voicing.baseFret + 1;
          if (relativeFret < 1 || relativeFret > fretCount) return null;

          const cx = marginX + sIdx * stringSpacing;
          const cy = marginTop + (relativeFret - 0.5) * fretSpacing;
          const finger = voicing.fingers[sIdx] || "";

          return (
            <g key={`dot-${sIdx}-${fret}`}>
              <circle
                cx={cx}
                cy={cy}
                r={9.5}
                fill="var(--accent)"
                stroke="var(--bg-card)"
                strokeWidth={1.5}
                className="shadow-xs"
              />
              {finger !== 0 && (
                <text
                  x={cx}
                  y={cy + 3.5}
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="middle"
                  fill="#ffffff"
                  className="font-mono pointer-events-none"
                >
                  {finger}
                </text>
              )}
            </g>
          );
        })}

        {/* String name labels below grid (E A D G B E) */}
        {["E", "A", "D", "G", "B", "E"].map((strName, sIdx) => (
          <text
            key={`str-label-${sIdx}`}
            x={marginX + sIdx * stringSpacing}
            y={marginTop + gridHeight + 16}
            fontSize="9"
            textAnchor="middle"
            fill="var(--ink-mute)"
            className="font-mono font-medium"
          >
            {strName}
          </text>
        ))}
      </svg>

      {/* Audio Playback Buttons */}
      <div className="flex gap-2 w-full mt-2 font-mono text-xs">
        <button
          type="button"
          onClick={handleStrum}
          disabled={isPlaying}
          className={`flex-1 py-1.5 px-3 rounded text-center transition-all border font-semibold cursor-pointer ${
            isPlaying
              ? "bg-[var(--accent)] text-white border-[var(--accent)]"
              : "bg-[var(--bg)] text-[var(--ink)] border-[var(--rule)] hover:border-[var(--accent)]"
          }`}
        >
          ♫ Strum
        </button>
        <button
          type="button"
          onClick={handleArpeggiate}
          disabled={isPlaying}
          className="py-1.5 px-3 rounded text-center transition-all border font-semibold border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--accent-teal)] cursor-pointer"
        >
          Arpeggio
        </button>
      </div>
    </div>
  );
};
