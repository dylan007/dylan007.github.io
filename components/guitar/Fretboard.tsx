"use client";

import React from "react";
import { NoteName } from "@/lib/guitar/music-theory";
import {
  FretboardPosition,
  FRET_COUNT,
  FRET_MARKERS,
  DOUBLE_FRET_MARKERS,
} from "@/lib/guitar/fretboard";
import { referenceTonePlayer } from "@/lib/guitar/reference-tone";

interface FretboardProps {
  allPositions: FretboardPosition[];
  activePositions: FretboardPosition[];
  guidedTargetPosition: FretboardPosition | null;
  detectedNote: NoteName | null;
  isNoteCorrect: boolean | null;
  labelMode: "notes" | "intervals";
  onPositionClick?: (pos: FretboardPosition) => void;
}

export const Fretboard: React.FC<FretboardProps> = ({
  allPositions,
  activePositions,
  guidedTargetPosition,
  detectedNote,
  isNoteCorrect,
  labelMode,
  onPositionClick,
}) => {
  // SVG dimensions & grid layout
  const width = 1100;
  const height = 240;
  const nutX = 60;
  const fretWidth = (width - nutX - 20) / FRET_COUNT;
  const stringCount = 6;
  const stringSpacing = (height - 50) / (stringCount - 1);
  const startY = 25;

  // Map active positions for quick lookup: `${stringIndex}-${fret}`
  const activeMap = new Map<string, FretboardPosition>();
  activePositions.forEach((p) => {
    activeMap.set(`${p.stringIndex}-${p.fret}`, p);
  });

  const handleNoteClick = (pos: FretboardPosition) => {
    referenceTonePlayer.playNote(pos.frequency);
    if (onPositionClick) {
      onPositionClick(pos);
    }
  };

  // Helper to get Y coordinate of a string (stringIndex: 0 = low E at bottom, 5 = high E at top)
  // Player's perspective: high E string on top (y is smaller), low E string on bottom (y is larger)
  const getStringY = (stringIndex: number): number => {
    return startY + (5 - stringIndex) * stringSpacing;
  };

  // Helper to get center X coordinate of a fret
  const getFretCenterX = (fret: number): number => {
    if (fret === 0) return nutX / 2;
    return nutX + (fret - 0.5) * fretWidth;
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-4 shadow-sm">
      <div className="min-w-[920px]">
        <svg
          viewBox={`0 0 ${width} ${height + 20}`}
          className="w-full h-auto select-none font-mono"
        >
          {/* Fretboard wood background */}
          <rect
            x={nutX}
            y={startY - 6}
            width={width - nutX - 20}
            height={(stringCount - 1) * stringSpacing + 12}
            fill="#e5e0d4"
            rx={4}
          />

          {/* Fret Markers / Inlays */}
          {FRET_MARKERS.map((fret) => {
            const centerX = getFretCenterX(fret);
            const isDouble = DOUBLE_FRET_MARKERS.includes(fret);
            const midY = startY + ((stringCount - 1) * stringSpacing) / 2;

            if (isDouble) {
              return (
                <g key={`marker-${fret}`}>
                  <circle
                    cx={centerX}
                    cy={midY - stringSpacing * 1.1}
                    r={5}
                    fill="#c8c2b3"
                  />
                  <circle
                    cx={centerX}
                    cy={midY + stringSpacing * 1.1}
                    r={5}
                    fill="#c8c2b3"
                  />
                </g>
              );
            }

            return (
              <circle
                key={`marker-${fret}`}
                cx={centerX}
                cy={midY}
                r={5}
                fill="#c8c2b3"
              />
            );
          })}

          {/* Fret Lines */}
          {Array.from({ length: FRET_COUNT + 1 }).map((_, i) => {
            const x = nutX + i * fretWidth;
            const isNut = i === 0;

            return (
              <g key={`fret-${i}`}>
                <line
                  x1={x}
                  y1={startY - 6}
                  x2={x}
                  y2={startY + (stringCount - 1) * stringSpacing + 6}
                  stroke={isNut ? "#2b2a26" : "#b0aba0"}
                  strokeWidth={isNut ? 5 : 1.5}
                />
                {/* Fret Numbers below fretboard */}
                <text
                  x={i === 0 ? nutX / 2 : nutX + (i - 0.5) * fretWidth}
                  y={height + 14}
                  fontSize="11"
                  textAnchor="middle"
                  fill="#78756c"
                  className="font-mono font-medium"
                >
                  {i === 0 ? "Open" : i}
                </text>
              </g>
            );
          })}

          {/* Strings */}
          {Array.from({ length: stringCount }).map((_, stringIndex) => {
            const y = getStringY(stringIndex);
            // Gauge simulation: string 0 (low E) is thicker (stroke 3.5), string 5 (high E) is 1.0
            const strokeWidth = 1.0 + (stringIndex === 0 ? 2.5 : stringIndex === 1 ? 2.0 : stringIndex === 2 ? 1.5 : stringIndex === 3 ? 1.0 : stringIndex === 4 ? 0.6 : 0.2);

            return (
              <line
                key={`string-${stringIndex}`}
                x1={10}
                y1={y}
                x2={width - 20}
                y2={y}
                stroke="#686358"
                strokeWidth={strokeWidth}
              />
            );
          })}

          {/* Position Dots & Interactive Elements */}
          {allPositions.map((pos) => {
            const key = `${pos.stringIndex}-${pos.fret}`;
            const activePos = activeMap.get(key);
            const isActive = !!activePos;

            const cx = getFretCenterX(pos.fret);
            const cy = getStringY(pos.stringIndex);

            const isGuidedTarget =
              guidedTargetPosition &&
              guidedTargetPosition.stringIndex === pos.stringIndex &&
              guidedTargetPosition.fret === pos.fret;

            const isDetectedAndActive =
              detectedNote === pos.note && isActive;

            // If not in active scale/chord and not guided target, render subtle click target or nothing
            if (!isActive) {
              return (
                <g
                  key={key}
                  className="cursor-pointer group"
                  onClick={() => handleNoteClick(pos)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={12}
                    fill="transparent"
                    className="hover:fill-black/5"
                  />
                </g>
              );
            }

            // Colors
            let fillColor = activePos.isRoot ? "var(--accent)" : "#ffffff";
            let textColor = activePos.isRoot ? "#ffffff" : "var(--ink)";
            let strokeColor = activePos.isRoot ? "var(--accent)" : "var(--ink-mute)";
            let strokeWidth = 1.5;

            if (isGuidedTarget) {
              fillColor = "var(--accent-teal)";
              textColor = "#ffffff";
              strokeColor = "#ffffff";
              strokeWidth = 2;
            }

            if (isDetectedAndActive) {
              if (isNoteCorrect) {
                fillColor = "#16a34a"; // Vibrant Green
                textColor = "#ffffff";
                strokeColor = "#15803d";
              } else if (isNoteCorrect === false) {
                fillColor = "#dc2626"; // Vibrant Red
                textColor = "#ffffff";
                strokeColor = "#b91c1c";
              }
            }

            const labelText =
              labelMode === "notes" ? pos.note : activePos.interval || pos.note;

            return (
              <g
                key={key}
                className="cursor-pointer transition-transform duration-100 hover:scale-110"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
                onClick={() => handleNoteClick(pos)}
              >
                {/* Glowing pulse ring for guided target */}
                {isGuidedTarget && (
                  <g pointerEvents="none">
                    <circle
                      cx={cx}
                      cy={cy}
                      r={14}
                      fill="none"
                      stroke="var(--accent-teal)"
                      strokeWidth={2.5}
                      opacity={0.8}
                    >
                      <animate
                        attributeName="r"
                        values="14;24;14"
                        dur="1.6s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.9;0.1;0.9"
                        dur="1.6s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={18}
                      fill="none"
                      stroke="var(--accent-teal)"
                      strokeWidth={1.5}
                      opacity={0.4}
                    >
                      <animate
                        attributeName="r"
                        values="18;28;18"
                        dur="1.6s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.5;0;0.5"
                        dur="1.6s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                )}

                {/* Main Note Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={12}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  className="transition-colors duration-150 shadow-sm"
                />

                {/* Text Label */}
                <text
                  x={cx}
                  y={cy + 3.5}
                  fontSize={labelText.length > 2 ? "9" : "10"}
                  fontWeight="600"
                  textAnchor="middle"
                  fill={textColor}
                  className="font-mono pointer-events-none"
                >
                  {labelText}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
