"use client";

import React, { useState, useMemo } from "react";
import { NoteName } from "@/lib/guitar/music-theory";
import {
  CIRCLE_OF_FIFTHS,
  CircleSector,
  getDiatonicChords,
  COMMON_PROGRESSIONS,
  ChordProgression,
  getProgressionChords,
  DiatonicChord,
} from "@/lib/guitar/circle-of-fifths";
import { getChordVoicings, getVoicingFrequencies } from "@/lib/guitar/chord-voicings";
import { referenceTonePlayer } from "@/lib/guitar/reference-tone";
import { ChordBox } from "./ChordBox";

export interface HoveredChordInfo {
  root: NoteName;
  chordId: string;
  name: string;
  degree?: string;
}

interface CircleOfFifthsProps {
  onSelectChord?: (root: NoteName, chordId: string) => void;
  onOpenTheory?: () => void;
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({
  onSelectChord,
  onOpenTheory,
}) => {
  const [selectedMajorRoot, setSelectedMajorRoot] = useState<NoteName>("C");
  const [selectedProgression, setSelectedProgression] = useState<ChordProgression>(
    COMMON_PROGRESSIONS[0]
  );
  const [isPlayingProgression, setIsPlayingProgression] = useState<boolean>(false);
  const [playingChordIndex, setPlayingChordIndex] = useState<number>(-1);

  // Hover and pinned chord states for showing the chord pattern
  const [hoveredChord, setHoveredChord] = useState<HoveredChordInfo | null>(null);
  const [pinnedChord, setPinnedChord] = useState<HoveredChordInfo | null>(null);

  // Active sector
  const activeSector = useMemo(() => {
    return (
      CIRCLE_OF_FIFTHS.find((s) => s.majorRoot === selectedMajorRoot) ||
      CIRCLE_OF_FIFTHS[0]
    );
  }, [selectedMajorRoot]);

  // Diatonic chords for this key (I, ii, iii, IV, V, vi, vii°)
  const diatonicChords = useMemo(() => {
    return getDiatonicChords(selectedMajorRoot);
  }, [selectedMajorRoot]);

  // Progression chords
  const progressionChords = useMemo(() => {
    return getProgressionChords(selectedMajorRoot, selectedProgression);
  }, [selectedMajorRoot, selectedProgression]);

  // Active chord for showing the chord pattern (hovered takes priority, pinned or key tonic as fallback)
  const activePatternChord: HoveredChordInfo = useMemo(() => {
    if (hoveredChord) return hoveredChord;
    if (pinnedChord) return pinnedChord;
    return {
      root: selectedMajorRoot,
      chordId: "maj",
      name: `${selectedMajorRoot} Major`,
      degree: "I",
    };
  }, [hoveredChord, pinnedChord, selectedMajorRoot]);

  const activeVoicing = useMemo(() => {
    const voicings = getChordVoicings(
      activePatternChord.root,
      activePatternChord.chordId
    );
    return voicings.length > 0 ? voicings[0] : null;
  }, [activePatternChord]);

  // SVG Geometry
  const size = 360;
  const center = size / 2;
  const outerRadius = 165;
  const midRadius = 115;
  const innerRadius = 65;

  // Play an individual chord voicing audio
  const handlePlayChord = async (root: NoteName, chordId: string) => {
    const voicings = getChordVoicings(root, chordId);
    if (voicings.length > 0) {
      const freqs = getVoicingFrequencies(voicings[0]);
      await referenceTonePlayer.playChord(freqs, 35, 2.0);
    }
  };

  // Play the entire selected progression sequentially
  const handlePlayProgression = async () => {
    if (isPlayingProgression || progressionChords.length === 0) return;
    setIsPlayingProgression(true);

    for (let i = 0; i < progressionChords.length; i++) {
      setPlayingChordIndex(i);
      const chord = progressionChords[i];
      const voicings = getChordVoicings(chord.root, chord.chordId);
      if (voicings.length > 0) {
        const freqs = getVoicingFrequencies(voicings[0]);
        referenceTonePlayer.playChord(freqs, 30, 1.8);
      }
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    setPlayingChordIndex(-1);
    setIsPlayingProgression(false);
  };

  // Helper to calculate SVG arc slice path
  const describeArc = (
    rInner: number,
    rOuter: number,
    startAngleDeg: number,
    endAngleDeg: number
  ): string => {
    const degToRad = (deg: number) => ((deg - 90) * Math.PI) / 180.0;
    const a1 = degToRad(startAngleDeg);
    const a2 = degToRad(endAngleDeg);

    const x1 = center + rOuter * Math.cos(a1);
    const y1 = center + rOuter * Math.sin(a1);
    const x2 = center + rOuter * Math.cos(a2);
    const y2 = center + rOuter * Math.sin(a2);

    const x3 = center + rInner * Math.cos(a2);
    const y3 = center + rInner * Math.sin(a2);
    const x4 = center + rInner * Math.cos(a1);
    const y4 = center + rInner * Math.sin(a1);

    return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 0 0 ${x4} ${y4} Z`;
  };

  // Helper to place text label in middle of a slice
  const getSliceCenterXY = (r: number, angleDeg: number): { x: number; y: number } => {
    const rad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
    };
  };

  // Highlight check for sectors
  const isSectorPrimary = (sector: CircleSector): boolean => {
    // I, IV, V are neighboring sectors on the wheel
    const diff = (sector.index - activeSector.index + 12) % 12;
    return diff === 0 || diff === 1 || diff === 11;
  };

  return (
    <div className="space-y-6">
      {/* Overview Intro */}
      <div className="rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-4 sm:p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-departure font-semibold text-[var(--accent)]">
            Circle of Fifths Harmonic Navigator
          </h3>
          {onOpenTheory && (
            <button
              type="button"
              onClick={onOpenTheory}
              className="px-3 py-1.5 rounded border border-[var(--rule)] bg-[var(--bg)] font-mono text-xs text-[var(--ink)] hover:border-[var(--accent)] cursor-pointer shadow-2xs"
            >
              📖 Theory &amp; References →
            </button>
          )}
        </div>
        <p className="text-sm font-serif text-[var(--ink-body)]">
          Explore harmonic relationships, key signatures, and diatonic guitar chord
          families. Click any key on the wheel to map its primary (<span className="font-mono font-bold text-[var(--accent)]">I, IV, V</span>) and secondary (<span className="font-mono font-bold text-[var(--accent-teal)]">ii, iii, vi</span>) chords.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive SVG Circle of Fifths Wheel */}
        <div className="lg:col-span-6 flex flex-col items-center rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-4 shadow-sm">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[380px] h-auto select-none font-mono"
          >
            {/* Outer Ring: 12 Major Keys */}
            {CIRCLE_OF_FIFTHS.map((sector) => {
              const startAngle = sector.angle - 15;
              const endAngle = sector.angle + 15;
              const path = describeArc(midRadius, outerRadius, startAngle, endAngle);
              const textPos = getSliceCenterXY((midRadius + outerRadius) / 2, sector.angle);

              const isCurrentKey = sector.majorRoot === selectedMajorRoot;
              const isPrimaryChord = isSectorPrimary(sector);
              const isChordActive =
                activePatternChord.root === sector.majorRoot &&
                activePatternChord.chordId === "maj";

              let fillColor = "#ffffff";
              let textColor = "var(--ink)";
              let strokeColor = "var(--rule)";
              let strokeWidth = 1.5;

              if (isCurrentKey) {
                fillColor = "var(--accent)";
                textColor = "#ffffff";
                strokeColor = "var(--accent)";
              } else if (isPrimaryChord) {
                fillColor = "#fff2ec"; // subtle warm tint
                textColor = "var(--accent)";
                strokeColor = "var(--accent)";
              }

              if (isChordActive) {
                strokeColor = "var(--accent)";
                strokeWidth = 3;
              }

              return (
                <g
                  key={`major-${sector.index}`}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                  onMouseEnter={() => {
                    const diatonic = diatonicChords.find(
                      (d) => d.root === sector.majorRoot
                    );
                    setHoveredChord({
                      root: sector.majorRoot,
                      chordId: "maj",
                      name: `${sector.majorRoot} Major`,
                      degree: diatonic?.degree,
                    });
                  }}
                  onMouseLeave={() => setHoveredChord(null)}
                  onClick={() => {
                    setSelectedMajorRoot(sector.majorRoot);
                    setPinnedChord({
                      root: sector.majorRoot,
                      chordId: "maj",
                      name: `${sector.majorRoot} Major`,
                      degree: "I",
                    });
                  }}
                >
                  <path
                    d={path}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                  />
                  <text
                    x={textPos.x}
                    y={textPos.y + 4}
                    fontSize="13"
                    fontWeight="700"
                    textAnchor="middle"
                    fill={textColor}
                    className="font-mono"
                  >
                    {sector.majorRoot}
                  </text>
                </g>
              );
            })}

            {/* Inner Ring: 12 Relative Minor Keys */}
            {CIRCLE_OF_FIFTHS.map((sector) => {
              const startAngle = sector.angle - 15;
              const endAngle = sector.angle + 15;
              const path = describeArc(innerRadius, midRadius, startAngle, endAngle);
              const textPos = getSliceCenterXY((innerRadius + midRadius) / 2, sector.angle);

              const isCurrentKey = sector.majorRoot === selectedMajorRoot;
              const isPrimaryChord = isSectorPrimary(sector);
              const isChordActive =
                activePatternChord.root === sector.minorRoot &&
                activePatternChord.chordId === "min";

              let fillColor = "#f4f1ea";
              let textColor = "var(--ink-mute)";
              let strokeColor = "var(--rule)";
              let strokeWidth = 1.5;

              if (isCurrentKey) {
                fillColor = "var(--accent-teal)";
                textColor = "#ffffff";
                strokeColor = "var(--accent-teal)";
              } else if (isPrimaryChord) {
                fillColor = "#e6f4f3";
                textColor = "var(--accent-teal)";
                strokeColor = "var(--accent-teal)";
              }

              if (isChordActive) {
                strokeColor = "var(--accent-teal)";
                strokeWidth = 3;
              }

              return (
                <g
                  key={`minor-${sector.index}`}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                  onMouseEnter={() => {
                    const diatonic = diatonicChords.find(
                      (d) => d.root === sector.minorRoot
                    );
                    setHoveredChord({
                      root: sector.minorRoot,
                      chordId: "min",
                      name: `${sector.minorRoot} Minor`,
                      degree: diatonic?.degree,
                    });
                  }}
                  onMouseLeave={() => setHoveredChord(null)}
                  onClick={() => {
                    setSelectedMajorRoot(sector.majorRoot);
                    setPinnedChord({
                      root: sector.minorRoot,
                      chordId: "min",
                      name: `${sector.minorRoot} Minor`,
                      degree: "vi",
                    });
                  }}
                >
                  <path
                    d={path}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                  />
                  <text
                    x={textPos.x}
                    y={textPos.y + 3.5}
                    fontSize="10.5"
                    fontWeight="600"
                    textAnchor="middle"
                    fill={textColor}
                    className="font-mono"
                  >
                    {sector.minorRoot}m
                  </text>
                </g>
              );
            })}

            {/* Center Hub: Key Signature Readout */}
            <circle
              cx={center}
              cy={center}
              r={innerRadius - 2}
              fill="var(--bg)"
              stroke="var(--rule)"
              strokeWidth={1.5}
            />
            <text
              x={center}
              y={center - 10}
              fontSize="12"
              fontWeight="700"
              textAnchor="middle"
              fill="var(--accent)"
              className="font-mono"
            >
              Key of {selectedMajorRoot}
            </text>
            <text
              x={center}
              y={center + 6}
              fontSize="9.5"
              textAnchor="middle"
              fill="var(--ink-mute)"
              className="font-mono"
            >
              {activeSector.keySignature.count === 0
                ? "No sharps / flats"
                : `${activeSector.keySignature.count} ${
                    activeSector.keySignature.type === "sharp" ? "Sharp(s)" : "Flat(s)"
                  }`}
            </text>
            {activeSector.keySignature.accidentals.length > 0 && (
              <text
                x={center}
                y={center + 19}
                fontSize="8.5"
                textAnchor="middle"
                fill="var(--ink-body)"
                className="font-mono font-medium"
              >
                {activeSector.keySignature.accidentals.join(", ")}
              </text>
            )}
          </svg>

          {/* Quick instructions below wheel */}
          <div className="flex items-center gap-4 mt-3 text-[11px] font-mono text-[var(--ink-mute)]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" /> Major (I, IV, V)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-teal)]" /> Minor (ii, iii, vi)
            </span>
          </div>
        </div>

        {/* Right: Diatonic Chords Map & Progression Player */}
        <div className="lg:col-span-6 space-y-4">
          {/* Diatonic Chords in Selected Key */}
          <div className="rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-4 sm:p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-mono font-semibold uppercase tracking-wider text-[var(--ink)]">
                Diatonic Chords in {selectedMajorRoot} Major
              </h4>
              <span className="text-xs font-mono text-[var(--accent)] font-medium">
                Hover chord to view fret pattern
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 font-mono text-xs">
              {diatonicChords.map((chord: DiatonicChord) => {
                const isActive =
                  activePatternChord.root === chord.root &&
                  activePatternChord.chordId === chord.chordId;

                return (
                  <div
                    key={chord.degree}
                    onMouseEnter={() =>
                      setHoveredChord({
                        root: chord.root,
                        chordId: chord.chordId,
                        name: chord.name,
                        degree: chord.degree,
                      })
                    }
                    onMouseLeave={() => setHoveredChord(null)}
                    onClick={() =>
                      setPinnedChord({
                        root: chord.root,
                        chordId: chord.chordId,
                        name: chord.name,
                        degree: chord.degree,
                      })
                    }
                    className={`flex flex-col items-center p-2 rounded border transition-all text-center cursor-pointer select-none ${
                      isActive
                        ? "border-[var(--accent)] bg-[var(--bg-card)] ring-2 ring-[var(--accent)] shadow-xs"
                        : chord.isPrimary
                        ? "border-[var(--accent)] bg-[var(--bg)] shadow-2xs hover:border-[var(--accent)]"
                        : "border-[var(--rule)] bg-[var(--bg)] hover:border-[var(--accent-teal)]"
                    }`}
                  >
                    <span className="text-[10px] text-[var(--ink-mute)] font-medium">
                      {chord.degree}
                    </span>
                    <span className="font-bold text-sm my-0.5 text-[var(--ink)]">
                      {chord.name}
                    </span>
                    <div className="flex gap-1 mt-1 w-full">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayChord(chord.root, chord.chordId);
                        }}
                        title="Play Chord Sound"
                        className="flex-1 py-0.5 bg-[var(--bg-card)] hover:bg-[var(--accent)] hover:text-white rounded border border-[var(--rule)] text-[10px] transition-colors cursor-pointer"
                      >
                        ♫
                      </button>
                      {onSelectChord && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectChord(chord.root, chord.chordId);
                          }}
                          title="Practice Chord"
                          className="py-0.5 px-1 bg-[var(--bg-card)] hover:bg-[var(--accent-teal)] hover:text-white rounded border border-[var(--rule)] text-[10px] transition-colors cursor-pointer"
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Chord Pattern Preview on Hover */}
          {activeVoicing && (
            <div className="rounded-lg border-2 border-[var(--accent)] bg-[var(--bg-card)] p-4 sm:p-5 shadow-sm space-y-3 transition-all">
              <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
                    Chord Pattern
                  </span>
                  {activePatternChord.degree && (
                    <span className="px-2 py-0.5 rounded bg-[var(--accent)] text-white font-mono text-[10px] font-bold">
                      Degree {activePatternChord.degree}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-[var(--accent-teal)] font-medium">
                  {hoveredChord ? "✦ Hovering Chord" : "● Selected Chord"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="shrink-0">
                  <ChordBox
                    voicing={activeVoicing}
                    chordName={activePatternChord.name}
                  />
                </div>

                <div className="flex-1 space-y-2.5 text-center sm:text-left font-mono">
                  <div>
                    <h4 className="text-xl font-departure font-bold text-[var(--ink)]">
                      {activePatternChord.name}
                    </h4>
                    <p className="text-xs font-serif text-[var(--ink-mute)] mt-0.5">
                      Voicing: <strong>{activeVoicing.name}</strong> • Base fret:{" "}
                      <strong>
                        {activeVoicing.baseFret <= 1 ? "Open (Nut)" : `${activeVoicing.baseFret}fr`}
                      </strong>
                    </p>
                  </div>

                  <p className="text-xs text-[var(--ink-body)] font-serif leading-relaxed">
                    Hover over any chord pill or wheel sector to instantly see its guitar grip, open/muted strings, and fingerings.
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        handlePlayChord(
                          activePatternChord.root,
                          activePatternChord.chordId
                        )
                      }
                      className="px-3.5 py-1.5 rounded bg-[var(--accent)] text-white font-semibold hover:opacity-90 shadow-2xs cursor-pointer"
                    >
                      ♫ Strum Pattern
                    </button>
                    {onSelectChord && (
                      <button
                        type="button"
                        onClick={() =>
                          onSelectChord(
                            activePatternChord.root,
                            activePatternChord.chordId
                          )
                        }
                        className="px-3.5 py-1.5 rounded border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--accent-teal)] cursor-pointer"
                      >
                        Practice in Chord Studio →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Common Progressions Player */}
          <div className="rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--rule)] pb-3">
              <div>
                <h4 className="text-sm font-mono font-semibold uppercase tracking-wider text-[var(--ink)]">
                  Chord Progressions in {selectedMajorRoot}
                </h4>
                <p className="text-xs font-serif text-[var(--ink-mute)]">
                  Select a common progression and listen to how the chords resolve.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePlayProgression}
                disabled={isPlayingProgression}
                className={`py-1.5 px-4 rounded font-mono text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer ${
                  isPlayingProgression
                    ? "bg-[var(--accent)] text-white animate-pulse"
                    : "bg-[var(--ink)] text-white hover:opacity-90"
                }`}
              >
                {isPlayingProgression ? "♫ Playing..." : "► Play Progression"}
              </button>
            </div>

            {/* Progression Selector Pills */}
            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              {COMMON_PROGRESSIONS.map((prog) => (
                <button
                  key={prog.id}
                  type="button"
                  onClick={() => setSelectedProgression(prog)}
                  className={`px-3 py-1.5 rounded border transition-all cursor-pointer ${
                    selectedProgression.id === prog.id
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white font-semibold"
                      : "border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--accent-teal)]"
                  }`}
                >
                  {prog.name}
                </button>
              ))}
            </div>

            {/* Active Progression Chords Sequence Banner */}
            <div className="p-3 rounded-md bg-[var(--bg)] border border-[var(--rule)] space-y-2 overflow-hidden">
              <div className="flex items-center gap-2 overflow-x-auto p-1 font-mono [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {progressionChords.map((chord, idx) => {
                  const isActive =
                    activePatternChord.root === chord.root &&
                    activePatternChord.chordId === chord.chordId;

                  return (
                    <React.Fragment key={`${chord.degree}-${idx}`}>
                      <div
                        onMouseEnter={() =>
                          setHoveredChord({
                            root: chord.root,
                            chordId: chord.chordId,
                            name: chord.name,
                            degree: chord.degree,
                          })
                        }
                        onMouseLeave={() => setHoveredChord(null)}
                        onClick={() =>
                          setPinnedChord({
                            root: chord.root,
                            chordId: chord.chordId,
                            name: chord.name,
                            degree: chord.degree,
                          })
                        }
                        className={`flex-1 min-w-[65px] p-2 rounded text-center border transition-all cursor-pointer select-none ${
                          playingChordIndex === idx
                            ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm ring-2 ring-[var(--accent)]"
                            : isActive
                            ? "border-[var(--accent)] bg-[var(--bg-card)] ring-2 ring-[var(--accent)] text-[var(--ink)] shadow-xs font-bold"
                            : "border-[var(--rule)] bg-[var(--bg-card)] text-[var(--ink)] hover:border-[var(--accent)]"
                        }`}
                      >
                        <div className="text-[10px] text-inherit opacity-75">
                          {chord.degree}
                        </div>
                        <div className="font-bold text-base my-0.5">
                          {chord.name}
                        </div>
                      </div>
                      {idx < progressionChords.length - 1 && (
                        <span className="text-[var(--ink-mute)] text-xs font-bold">
                          →
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <p className="text-xs font-serif text-[var(--ink-mute)]">
                {selectedProgression.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
