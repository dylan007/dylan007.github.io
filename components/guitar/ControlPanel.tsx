"use client";

import React from "react";
import {
  CHROMATIC_NOTES,
  NoteName,
  SCALES,
  TUNINGS,
  ScaleDefinition,
  TuningDefinition,
} from "@/lib/guitar/music-theory";
import { PositionMode } from "@/lib/guitar/fretboard";

interface ControlPanelProps {
  rootNote: NoteName;
  onSelectRoot: (note: NoteName) => void;
  selectedScale: ScaleDefinition;
  onSelectScale: (scale: ScaleDefinition) => void;
  selectedTuning: TuningDefinition;
  onSelectTuning: (tuning: TuningDefinition) => void;
  practiceMode: "free" | "guided";
  onChangePracticeMode: (mode: "free" | "guided") => void;
  positionMode: PositionMode;
  onChangePositionMode: (mode: PositionMode) => void;
  boxNumber: number;
  onChangeBoxNumber: (box: number) => void;
  labelMode: "notes" | "intervals";
  onChangeLabelMode: (mode: "notes" | "intervals") => void;
  isListening: boolean;
  onToggleListening: () => void;
  micError: string | null;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  rootNote,
  onSelectRoot,
  selectedScale,
  onSelectScale,
  selectedTuning,
  onSelectTuning,
  practiceMode,
  onChangePracticeMode,
  positionMode,
  onChangePositionMode,
  boxNumber,
  onChangeBoxNumber,
  labelMode,
  onChangeLabelMode,
  isListening,
  onToggleListening,
  micError,
}) => {
  return (
    <div className="space-y-4 rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-4 sm:p-6 shadow-sm">
      {/* Top Header: Scale info + Microphone toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--rule)] pb-4">
        {/* Active Scale Title */}
        <div>
          <span className="text-xs font-mono font-medium text-[var(--accent)] uppercase tracking-wider">
            Scale Practice
          </span>
          <h3 className="text-base font-departure font-semibold text-[var(--ink)]">
            {rootNote} {selectedScale.name}
          </h3>
        </div>

        {/* Practice Mode Toggle & Mic Button */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1 rounded-md bg-[var(--bg)] p-1 border border-[var(--rule)]">
            <button
              type="button"
              onClick={() => onChangePracticeMode("free")}
              className={`px-3 py-1.5 rounded transition-colors font-medium cursor-pointer ${
                practiceMode === "free"
                  ? "bg-[var(--accent-teal)] text-white"
                  : "text-[var(--ink-mute)] hover:text-[var(--ink)]"
              }`}
            >
              Free Play
            </button>
            <button
              type="button"
              onClick={() => onChangePracticeMode("guided")}
              className={`px-3 py-1.5 rounded transition-colors font-medium cursor-pointer ${
                practiceMode === "guided"
                  ? "bg-[var(--accent-teal)] text-white"
                  : "text-[var(--ink-mute)] hover:text-[var(--ink)]"
              }`}
            >
              Guided Mode
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleListening}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-xs font-semibold tracking-wide transition-all border shadow-sm cursor-pointer ${
              isListening
                ? "bg-green-700 hover:bg-green-800 text-white border-green-800 animate-pulse"
                : "bg-[var(--accent)] hover:opacity-90 text-white border-[var(--accent)]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isListening ? "bg-white" : "bg-white/80"
              }`}
            />
            {isListening ? "Listening (Stop)" : "Enable Mic"}
          </button>
        </div>
      </div>

      {micError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-mono">
          {micError}
        </div>
      )}

      {/* Root Note Picker */}
      <div>
        <label className="block text-xs font-mono font-medium text-[var(--ink-mute)] uppercase tracking-wider mb-2">
          Root Key
        </label>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 font-mono text-xs">
          {CHROMATIC_NOTES.map((note) => (
            <button
              key={note}
              type="button"
              onClick={() => onSelectRoot(note)}
              className={`py-2 px-1 text-center rounded border transition-all font-semibold cursor-pointer ${
                rootNote === note
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-xs"
                  : "border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--accent-violet)] hover:text-[var(--accent-violet)]"
              }`}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      {/* Selectors Grid: Type, Tuning, Position & Labels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {/* Scale Type Dropdown */}
        <div>
          <label className="block text-xs font-mono font-medium text-[var(--ink-mute)] uppercase tracking-wider mb-1.5">
            Scale Type
          </label>
          <select
            value={selectedScale.id}
            onChange={(e) => {
              const scale = SCALES.find((s) => s.id === e.target.value);
              if (scale) onSelectScale(scale);
            }}
            className="w-full bg-[var(--bg)] border border-[var(--rule)] rounded-md px-3 py-2 text-xs font-mono text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
          >
            {["Major/Minor", "Pentatonic & Blues", "Modes"].map((cat) => (
              <optgroup key={cat} label={cat}>
                {SCALES.filter((s) => s.category === cat).map((scale) => (
                  <option key={scale.id} value={scale.id}>
                    {scale.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Tuning */}
        <div>
          <label className="block text-xs font-mono font-medium text-[var(--ink-mute)] uppercase tracking-wider mb-1.5">
            Tuning
          </label>
          <select
            value={selectedTuning.id}
            onChange={(e) => {
              const tuning = TUNINGS.find((t) => t.id === e.target.value);
              if (tuning) onSelectTuning(tuning);
            }}
            className="w-full bg-[var(--bg)] border border-[var(--rule)] rounded-md px-3 py-2 text-xs font-mono text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
          >
            {TUNINGS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Position / Shape Mode */}
        <div>
          <label className="block text-xs font-mono font-medium text-[var(--ink-mute)] uppercase tracking-wider mb-1.5">
            Position System
          </label>
          <div className="flex gap-1.5">
            <select
              value={positionMode}
              onChange={(e) =>
                onChangePositionMode(e.target.value as PositionMode)
              }
              className="flex-1 bg-[var(--bg)] border border-[var(--rule)] rounded-md px-2.5 py-2 text-xs font-mono text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="full">Full Neck</option>
              <option value="caged">CAGED Boxes</option>
              <option value="3nps">3NPS Patterns</option>
            </select>

            {positionMode !== "full" && (
              <select
                value={boxNumber}
                onChange={(e) => onChangeBoxNumber(Number(e.target.value))}
                className="w-20 bg-[var(--bg)] border border-[var(--rule)] rounded-md px-2 py-2 text-xs font-mono text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
              >
                {Array.from({
                  length: positionMode === "caged" ? 5 : 7,
                }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Box {i + 1}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Note / Interval Label Toggle */}
        <div>
          <label className="block text-xs font-mono font-medium text-[var(--ink-mute)] uppercase tracking-wider mb-1.5">
            Fretboard Labels
          </label>
          <div className="flex rounded-md bg-[var(--bg)] p-0.5 border border-[var(--rule)] font-mono text-xs">
            <button
              type="button"
              onClick={() => onChangeLabelMode("notes")}
              className={`flex-1 py-1.5 rounded text-center transition-colors font-medium cursor-pointer ${
                labelMode === "notes"
                  ? "bg-[var(--accent-violet)] text-white"
                  : "text-[var(--ink-mute)] hover:text-[var(--ink)]"
              }`}
            >
              Notes (C, D)
            </button>
            <button
              type="button"
              onClick={() => onChangeLabelMode("intervals")}
              className={`flex-1 py-1.5 rounded text-center transition-colors font-medium cursor-pointer ${
                labelMode === "intervals"
                  ? "bg-[var(--accent-violet)] text-white"
                  : "text-[var(--ink-mute)] hover:text-[var(--ink)]"
              }`}
            >
              Intervals (R, 3, 5)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
