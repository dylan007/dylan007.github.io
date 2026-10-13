"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  NoteName,
  CHROMATIC_NOTES,
  TuningDefinition,
  ModeDefinition,
  GREEK_MODES,
  getParentMajorKey,
  getCharacteristicNote,
  noteToFrequency,
} from "@/lib/guitar/music-theory";
import {
  generateFretboard,
  filterPositions,
  PositionMode,
} from "@/lib/guitar/fretboard";
import { referenceTonePlayer } from "@/lib/guitar/reference-tone";
import { Fretboard } from "./Fretboard";

interface ModesStudioProps {
  tuning: TuningDefinition;
  onSelectTuning?: (tuning: TuningDefinition) => void;
  onOpenTheory?: () => void;
}

export const ModesStudio: React.FC<ModesStudioProps> = ({ tuning, onOpenTheory }) => {
  const [selectedRoot, setSelectedRoot] = useState<NoteName>("D");
  const [selectedMode, setSelectedMode] = useState<ModeDefinition>(
    GREEK_MODES.find((m) => m.id === "dorian") || GREEK_MODES[1]
  );
  const [positionMode, setPositionMode] = useState<PositionMode>("3nps");
  const [boxNumber, setBoxNumber] = useState<number>(1);
  const [labelMode, setLabelMode] = useState<"notes" | "intervals">("notes");
  const [isDroneOn, setIsDroneOn] = useState<boolean>(false);
  const [isPlayingRun, setIsPlayingRun] = useState<boolean>(false);

  // Derived parent major key and characteristic note
  const parentMajorKey = useMemo(() => {
    return getParentMajorKey(selectedMode, selectedRoot);
  }, [selectedMode, selectedRoot]);

  const characteristicNote = useMemo(() => {
    return getCharacteristicNote(selectedMode, selectedRoot);
  }, [selectedMode, selectedRoot]);

  // Scale notes for this mode
  const scaleNotes = useMemo(() => {
    const rootIdx = CHROMATIC_NOTES.indexOf(selectedRoot);
    return selectedMode.intervals.map((interval) => {
      const idx = (rootIdx + interval) % 12;
      return CHROMATIC_NOTES[idx];
    });
  }, [selectedRoot, selectedMode]);

  const activeNotesSet = useMemo(() => {
    return new Set<NoteName>(scaleNotes);
  }, [scaleNotes]);

  // Fretboard positions
  const allPositions = useMemo(() => {
    return generateFretboard(tuning, selectedRoot, activeNotesSet);
  }, [tuning, selectedRoot, activeNotesSet]);

  const activePositions = useMemo(() => {
    return filterPositions(
      allPositions,
      positionMode,
      selectedRoot,
      boxNumber,
      selectedMode.intervals
    );
  }, [allPositions, positionMode, selectedRoot, boxNumber, selectedMode.intervals]);

  // Toggle Continuous Tonic Drone (low octave 2)
  const handleToggleDrone = useCallback(async () => {
    if (isDroneOn) {
      referenceTonePlayer.stopDrone();
      setIsDroneOn(false);
    } else {
      const droneFreq = noteToFrequency(selectedRoot, 2);
      await referenceTonePlayer.startDrone(droneFreq);
      setIsDroneOn(true);
    }
  }, [isDroneOn, selectedRoot]);

  // Update drone frequency if root changes while drone is active
  useEffect(() => {
    if (isDroneOn) {
      const droneFreq = noteToFrequency(selectedRoot, 2);
      referenceTonePlayer.startDrone(droneFreq);
    }
  }, [selectedRoot, isDroneOn]);

  // Stop drone on unmount
  useEffect(() => {
    return () => {
      referenceTonePlayer.stopDrone();
    };
  }, []);

  // Play ascending scale run of the mode
  const handlePlayScaleRun = async () => {
    if (isPlayingRun) return;
    setIsPlayingRun(true);

    const rootIdx = CHROMATIC_NOTES.indexOf(selectedRoot);
    const freqs = selectedMode.intervals.map((interval) => {
      const totalSemitones = rootIdx + interval;
      const octave = totalSemitones >= 12 ? 4 : 3;
      const note = CHROMATIC_NOTES[totalSemitones % 12];
      return noteToFrequency(note, octave);
    });
    // add high tonic octave
    freqs.push(noteToFrequency(selectedRoot, 4));

    for (let i = 0; i < freqs.length; i++) {
      referenceTonePlayer.playNote(freqs[i], 0.7);
      await new Promise((r) => setTimeout(r, 220));
    }

    setIsPlayingRun(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Intro Banner */}
      <div className="rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-4 sm:p-6 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--rule)] pb-4">
          <div>
            <span className="text-xs font-mono font-medium text-[var(--accent)] uppercase tracking-wider">
              Greek Modal Explorer
            </span>
            <h2 className="text-2xl font-departure font-semibold text-[var(--ink)] mt-0.5">
              {selectedRoot} {selectedMode.name}
            </h2>
          </div>

          {/* Quick Sound Actions */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {onOpenTheory && (
              <button
                type="button"
                onClick={onOpenTheory}
                className="px-3 py-1.5 rounded border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--accent)] font-semibold cursor-pointer shadow-2xs"
              >
                📖 Theory &amp; References →
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleDrone}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-semibold transition-all border shadow-2xs cursor-pointer ${
                isDroneOn
                  ? "bg-[var(--accent-teal)] text-white border-[var(--accent-teal)] animate-pulse"
                  : "bg-[var(--bg)] border-[var(--rule)] text-[var(--ink)] hover:border-[var(--accent-teal)]"
              }`}
            >
              <span>{isDroneOn ? "⏹ Stop Drone" : "▶ Root Drone"}</span>
              <span className="text-[10px] opacity-75">({selectedRoot}2)</span>
            </button>

            <button
              type="button"
              onClick={handlePlayScaleRun}
              disabled={isPlayingRun}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-semibold transition-all border shadow-2xs cursor-pointer ${
                isPlayingRun
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "bg-[var(--ink)] text-white border-[var(--ink)] hover:opacity-90"
              }`}
            >
              <span>♫</span>
              <span>{isPlayingRun ? "Playing..." : "Play Mode Run"}</span>
            </button>
          </div>
        </div>

        {/* 7 Greek Modes Navigation Strip */}
        <div>
          <label className="block text-xs font-mono font-medium text-[var(--ink-mute)] uppercase tracking-wider mb-2">
            Select Church Mode (Degrees I – VII)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 font-mono text-xs">
            {GREEK_MODES.map((mode) => {
              const isCurrent = mode.id === selectedMode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setSelectedMode(mode);
                    setBoxNumber(1);
                  }}
                  className={`p-2.5 rounded-md border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isCurrent
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-xs"
                      : "border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--accent)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold opacity-75 uppercase">
                      {mode.romanNumeral}
                    </span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-medium ${
                        isCurrent
                          ? "bg-white/20 text-white"
                          : mode.quality === "Major"
                          ? "bg-amber-100 text-amber-900"
                          : mode.quality === "Minor"
                          ? "bg-blue-100 text-blue-900"
                          : "bg-purple-100 text-purple-900"
                      }`}
                    >
                      {mode.quality}
                    </span>
                  </div>
                  <div className="font-bold text-sm mt-1">{mode.name}</div>
                  <div className="text-[10px] opacity-75 mt-0.5 font-sans">
                    Deg {mode.degree}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Root Key Selector */}
        <div>
          <label className="block text-xs font-mono font-medium text-[var(--ink-mute)] uppercase tracking-wider mb-2">
            Tonic Root Note
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 font-mono text-xs">
            {CHROMATIC_NOTES.map((note) => (
              <button
                key={note}
                type="button"
                onClick={() => setSelectedRoot(note)}
                className={`py-1.5 px-1 text-center rounded border transition-all font-semibold cursor-pointer ${
                  selectedRoot === note
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-xs"
                    : "border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--accent-teal)]"
                }`}
              >
                {note}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Theory & Harmonic DNA Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* Parent Major Scale */}
        <div className="p-4 rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] space-y-1.5 shadow-xs">
          <div className="text-[10px] uppercase text-[var(--ink-mute)] font-semibold tracking-wider">
            Parent Major Scale
          </div>
          <div className="text-lg font-departure font-bold text-[var(--ink)]">
            {parentMajorKey} Major
          </div>
          <p className="text-xs font-serif text-[var(--ink-body)] leading-relaxed">
            {selectedRoot} {selectedMode.name} is the <strong>{selectedMode.romanNumeral} degree</strong> of{" "}
            <strong>{parentMajorKey} Major</strong>. Both share the exact same 7 notes:{" "}
            <span className="font-mono font-semibold text-[var(--accent)]">
              {scaleNotes.join(", ")}
            </span>
            , but resolved around {selectedRoot}.
          </p>
        </div>

        {/* Characteristic Tone */}
        <div className="p-4 rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] space-y-1.5 shadow-xs">
          <div className="text-[10px] uppercase text-[var(--accent-teal)] font-semibold tracking-wider">
            Characteristic Flavor Tone
          </div>
          <div className="text-lg font-departure font-bold text-[var(--accent-teal)]">
            {characteristicNote}{" "}
            <span className="text-xs font-mono font-normal text-[var(--ink-mute)]">
              ({selectedMode.characteristicDegree})
            </span>
          </div>
          <p className="text-xs font-serif text-[var(--ink-body)] leading-relaxed">
            This single interval gives {selectedMode.name} its unique identity:{" "}
            <em>{selectedMode.flavor}</em>. Emphasize {characteristicNote} when soloing to highlight the mode!
          </p>
        </div>

        {/* Formula & Famous Songs */}
        <div className="p-4 rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] space-y-1.5 shadow-xs">
          <div className="text-[10px] uppercase text-[var(--ink-mute)] font-semibold tracking-wider">
            Formula & Iconic Examples
          </div>
          <div className="text-base font-bold text-[var(--ink)]">
            {selectedMode.formula}
          </div>
          <p className="text-xs font-serif text-[var(--ink-body)] leading-relaxed">
            <strong>Iconic Songs:</strong> {selectedMode.famousExamples}.
          </p>
        </div>
      </div>

      {/* Fretboard System Controls */}
      <div className="rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--rule)] pb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Position System */}
            <div>
              <label className="block text-[11px] font-mono text-[var(--ink-mute)] uppercase tracking-wider mb-1">
                Position Mode
              </label>
              <div className="flex rounded-md bg-[var(--bg)] p-0.5 border border-[var(--rule)] font-mono text-xs">
                {(["3nps", "caged", "full"] as PositionMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setPositionMode(m);
                      setBoxNumber(1);
                    }}
                    className={`px-3 py-1.5 rounded uppercase font-semibold transition-colors cursor-pointer ${
                      positionMode === m
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--ink-mute)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {m === "3nps" ? "3NPS Patterns" : m === "caged" ? "CAGED" : "Full Neck"}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern / Box selector */}
            {positionMode !== "full" && (
              <div>
                <label className="block text-[11px] font-mono text-[var(--ink-mute)] uppercase tracking-wider mb-1">
                  {positionMode === "3nps" ? "Pattern (Degree)" : "CAGED Box"}
                </label>
                <div className="flex flex-wrap gap-1 font-mono text-xs">
                  {Array.from({ length: positionMode === "3nps" ? 7 : 5 }).map((_, i) => (
                    <button
                      key={i + 1}
                      type="button"
                      onClick={() => setBoxNumber(i + 1)}
                      className={`px-2.5 py-1.5 rounded border transition-colors cursor-pointer ${
                        boxNumber === i + 1
                          ? "border-[var(--accent-teal)] bg-[var(--accent-teal)] text-white font-bold"
                          : "border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--accent-teal)]"
                      }`}
                    >
                      {positionMode === "3nps" ? `P${i + 1}` : `Box ${i + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Labels Mode Toggle */}
          <div>
            <label className="block text-[11px] font-mono text-[var(--ink-mute)] uppercase tracking-wider mb-1">
              Fret Labels
            </label>
            <div className="flex rounded-md bg-[var(--bg)] p-0.5 border border-[var(--rule)] font-mono text-xs">
              <button
                type="button"
                onClick={() => setLabelMode("notes")}
                className={`px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
                  labelMode === "notes"
                    ? "bg-[var(--accent-violet)] text-white"
                    : "text-[var(--ink-mute)]"
                }`}
              >
                Notes (C, D)
              </button>
              <button
                type="button"
                onClick={() => setLabelMode("intervals")}
                className={`px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
                  labelMode === "intervals"
                    ? "bg-[var(--accent-violet)] text-white"
                    : "text-[var(--ink-mute)]"
                }`}
              >
                Intervals (R, 3, 5)
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--ink-mute)]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[var(--accent)]" />
            <strong className="text-[var(--ink)]">Tonic Root ({selectedRoot})</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[var(--accent-teal)]" />
            <strong className="text-[var(--ink)]">
              Flavor Note: {characteristicNote} ({selectedMode.characteristicDegree})
            </strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[var(--ink)] opacity-70" />
            Other Modal Tones
          </span>
          <span className="text-gray-400 ml-auto hidden sm:inline">
            Click any fret dot to hear its pitch
          </span>
        </div>

        {/* Interactive Modal Fretboard */}
        <Fretboard
          allPositions={allPositions}
          activePositions={activePositions}
          guidedTargetPosition={null}
          detectedNote={null}
          isNoteCorrect={null}
          labelMode={labelMode}
          onPositionClick={(pos) => {
            referenceTonePlayer.playNote(pos.frequency);
          }}
        />
      </div>
    </div>
  );
};
