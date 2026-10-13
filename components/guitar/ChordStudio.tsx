"use client";

import React, { useState, useMemo } from "react";
import {
  NoteName,
  CHROMATIC_NOTES,
  CHORDS,
  ChordDefinition,
  getChordNotes,
  TuningDefinition,
} from "@/lib/guitar/music-theory";
import {
  ChordVoicing,
  getChordVoicings,
  getVoicingFrequencies,
} from "@/lib/guitar/chord-voicings";
import {
  generateFretboard,
  FretboardPosition,
} from "@/lib/guitar/fretboard";
import { referenceTonePlayer } from "@/lib/guitar/reference-tone";
import { ChordBox } from "./ChordBox";
import { Fretboard } from "./Fretboard";

interface ChordStudioProps {
  initialRoot?: NoteName;
  initialChordId?: string;
  tuning: TuningDefinition;
  labelMode: "notes" | "intervals";
  onSelectChordForPractice?: (root: NoteName, chord: ChordDefinition) => void;
}

export const ChordStudio: React.FC<ChordStudioProps> = ({
  initialRoot = "C",
  initialChordId = "maj",
  tuning,
  labelMode,
}) => {
  const [root, setRoot] = useState<NoteName>(initialRoot);
  const [chordId, setChordId] = useState<string>(initialChordId);
  const [activeVoicingIndex, setActiveVoicingIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"grip" | "all_tones">("grip");

  const selectedChordDef = useMemo(() => {
    return CHORDS.find((c) => c.id === chordId) || CHORDS[0];
  }, [chordId]);

  // Fetch all playable voicings for the selected root and chord
  const voicings = useMemo(() => {
    return getChordVoicings(root, chordId);
  }, [root, chordId]);

  // Ensure voicing index is valid
  const currentVoicing: ChordVoicing | null = useMemo(() => {
    if (voicings.length === 0) return null;
    return voicings[activeVoicingIndex % voicings.length];
  }, [voicings, activeVoicingIndex]);

  // Chord notes for "all tones" view
  const chordNotesSet = useMemo(() => {
    const chordNotes = getChordNotes(root, selectedChordDef);
    return new Set(chordNotes.map((n) => n.note));
  }, [root, selectedChordDef]);

  // Full fretboard positions
  const allPositions = useMemo(() => {
    return generateFretboard(tuning, root, chordNotesSet);
  }, [tuning, root, chordNotesSet]);

  // Active positions on the fretboard
  const activePositions: FretboardPosition[] = useMemo(() => {
    if (viewMode === "all_tones") {
      return allPositions.filter((p) => p.isInScaleOrChord);
    }

    // "grip" mode: only highlight positions that are actually pressed in current voicing
    if (!currentVoicing) return [];

    return allPositions.filter((pos) => {
      // stringIndex in allPositions: 0 = Low E (string 6) ... 5 = High E (string 1)
      const stringIdx = pos.stringIndex;
      const targetFret = currentVoicing.frets[stringIdx];
      return targetFret >= 0 && pos.fret === targetFret;
    });
  }, [allPositions, viewMode, currentVoicing]);

  const handleSelectRoot = (newRoot: NoteName) => {
    setRoot(newRoot);
    setActiveVoicingIndex(0);
  };

  const handleSelectChord = (newChordId: string) => {
    setChordId(newChordId);
    setActiveVoicingIndex(0);
  };

  const handleStrumCurrentVoicing = async () => {
    if (!currentVoicing) return;
    const freqs = getVoicingFrequencies(currentVoicing);
    await referenceTonePlayer.playChord(freqs, 35, 2.2);
  };

  const handleArpeggiateCurrentVoicing = async () => {
    if (!currentVoicing) return;
    const freqs = getVoicingFrequencies(currentVoicing);
    await referenceTonePlayer.playArpeggio(freqs, 220, 1.4);
  };

  return (
    <div className="space-y-6">
      {/* Control Card: Root & Chord Flavor */}
      <div className="rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-4 sm:p-6 space-y-4 shadow-sm">
        {/* Root Key Selector */}
        <div>
          <label className="block text-xs font-mono font-medium text-[var(--ink-mute)] uppercase tracking-wider mb-2">
            Chord Root Note
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 font-mono text-xs">
            {CHROMATIC_NOTES.map((note) => (
              <button
                key={note}
                type="button"
                onClick={() => handleSelectRoot(note)}
                className={`py-2 px-1 text-center rounded border transition-all font-semibold cursor-pointer ${
                  root === note
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-xs"
                    : "border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--accent-violet)]"
                }`}
              >
                {note}
              </button>
            ))}
          </div>
        </div>

        {/* Chord Type Selector */}
        <div>
          <label className="block text-xs font-mono font-medium text-[var(--ink-mute)] uppercase tracking-wider mb-2">
            Chord Type / Quality
          </label>
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {CHORDS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectChord(c.id)}
                className={`px-3 py-1.5 rounded border transition-all font-medium cursor-pointer ${
                  chordId === c.id
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--accent-violet)]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Voicing Display Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left: Vertical Chord Box Diagram */}
        <div className="md:col-span-1 space-y-3">
          {currentVoicing ? (
            <ChordBox
              voicing={currentVoicing}
              chordName={`${root} ${selectedChordDef.name}`}
            />
          ) : (
            <div className="rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-6 text-center font-mono text-xs text-[var(--ink-mute)]">
              No preset voicing available for this root and chord combination.
            </div>
          )}

          {/* Voicing Switcher Carousel */}
          {voicings.length > 1 && (
            <div className="rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-mute)]">
                <span>
                  Voicing {activeVoicingIndex + 1} of {voicings.length}
                </span>
                <span className="font-semibold text-[var(--ink)]">
                  {currentVoicing?.name}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveVoicingIndex(
                      (prev) => (prev - 1 + voicings.length) % voicings.length
                    )
                  }
                  className="flex-1 py-1 px-2 rounded border border-[var(--rule)] bg-[var(--bg)] font-mono text-xs hover:border-[var(--accent)] cursor-pointer"
                >
                  ← Prev Shape
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveVoicingIndex((prev) => (prev + 1) % voicings.length)
                  }
                  className="flex-1 py-1 px-2 rounded border border-[var(--rule)] bg-[var(--bg)] font-mono text-xs hover:border-[var(--accent)] cursor-pointer"
                >
                  Next Shape →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Neck View & Mode Toggle */}
        <div className="md:col-span-2 space-y-3">
          {/* Header Controls: View Mode & Sound */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[var(--ink-mute)] font-medium">Display on Neck:</span>
              <div className="flex rounded-md bg-[var(--bg)] p-0.5 border border-[var(--rule)]">
                <button
                  type="button"
                  onClick={() => setViewMode("grip")}
                  className={`px-3 py-1 rounded transition-colors font-medium cursor-pointer ${
                    viewMode === "grip"
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--ink-mute)] hover:text-[var(--ink)]"
                  }`}
                >
                  Exact Chord Grip
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("all_tones")}
                  className={`px-3 py-1 rounded transition-colors font-medium cursor-pointer ${
                    viewMode === "all_tones"
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--ink-mute)] hover:text-[var(--ink)]"
                  }`}
                >
                  All Chord Tones (Arpeggio)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStrumCurrentVoicing}
                className="px-3 py-1.5 rounded bg-[var(--accent-teal)] text-white font-semibold hover:opacity-90 cursor-pointer"
              >
                ♫ Strum Grip
              </button>
              <button
                type="button"
                onClick={handleArpeggiateCurrentVoicing}
                className="px-3 py-1.5 rounded border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] font-semibold hover:border-[var(--accent-teal)] cursor-pointer"
              >
                Arpeggio
              </button>
            </div>
          </div>

          {/* Fretboard displaying either the grip or all chord tones */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-mute)] px-1">
              <span>
                {viewMode === "grip"
                  ? `Fretboard view for ${currentVoicing?.name || "chord grip"}`
                  : `All notes of ${root} ${selectedChordDef.name} across fretboard`}
              </span>
              <span>Click any dot to play reference note</span>
            </div>

            <Fretboard
              allPositions={allPositions}
              activePositions={activePositions}
              guidedTargetPosition={null}
              detectedNote={null}
              isNoteCorrect={null}
              labelMode={labelMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
