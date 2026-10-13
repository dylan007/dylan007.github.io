"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  NoteName,
  SCALES,
  TUNINGS,
  ScaleDefinition,
  TuningDefinition,
  getScaleNotes,
  PitchResult,
  noteToFrequency,
} from "@/lib/guitar/music-theory";
import {
  generateFretboard,
  filterPositions,
  getGuidedSequence,
  PositionMode,
  FretboardPosition,
} from "@/lib/guitar/fretboard";
import { PitchDetector } from "@/lib/guitar/pitch-detector";
import { referenceTonePlayer } from "@/lib/guitar/reference-tone";
import { ControlPanel } from "./ControlPanel";
import { Fretboard } from "./Fretboard";
import { PitchDisplay } from "./PitchDisplay";
import { Metronome } from "./Metronome";
import { ChordStudio } from "./ChordStudio";
import { CircleOfFifths } from "./CircleOfFifths";
import { EarTrainingGame } from "./EarTrainingGame";
import { ModesStudio } from "./ModesStudio";
import { TheoryReferences } from "./TheoryReferences";

export type StudioTab =
  | "scales"
  | "modes"
  | "chords"
  | "circle_of_fifths"
  | "ear_training"
  | "theory_references";

export const GuitarPractice: React.FC = () => {
  // Top-level Studio Tab
  const [studioTab, setStudioTab] = useState<StudioTab>("scales");

  // State for scale practice
  const [rootNote, setRootNote] = useState<NoteName>("A");
  const [selectedScale, setSelectedScale] = useState<ScaleDefinition>(
    SCALES.find((s) => s.id === "pentatonic_minor") || SCALES[0]
  );
  const [selectedTuning, setSelectedTuning] = useState<TuningDefinition>(
    TUNINGS[0]
  );
  const [practiceMode, setPracticeMode] = useState<"free" | "guided">("free");
  const [positionMode, setPositionMode] = useState<PositionMode>("caged");
  const [boxNumber, setBoxNumber] = useState<number>(1);
  const [labelMode, setLabelMode] = useState<"notes" | "intervals">("notes");

  // State for chord studio synchronization
  const [selectedChordRoot, setSelectedChordRoot] = useState<NoteName>("C");
  const [selectedChordId, setSelectedChordId] = useState<string>("maj");

  // Pitch detector state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [currentPitch, setCurrentPitch] = useState<PitchResult | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [rms, setRms] = useState<number>(0);

  // Guided Mode Sequence State
  const [guidedIndex, setGuidedIndex] = useState<number>(0);
  const [justAdvanced, setJustAdvanced] = useState<boolean>(false);
  const pitchDetectorRef = useRef<PitchDetector | null>(null);

  // Selection Handlers with sequence reset
  const handleSelectRoot = useCallback((note: NoteName) => {
    setRootNote(note);
    setGuidedIndex(0);
    const freq = noteToFrequency(note, 3);
    referenceTonePlayer.playNote(freq);
  }, []);

  const handleSelectScale = useCallback((scale: ScaleDefinition) => {
    setSelectedScale(scale);
    setGuidedIndex(0);
  }, []);

  const handleSelectTuning = useCallback((tuning: TuningDefinition) => {
    setSelectedTuning(tuning);
    setGuidedIndex(0);
  }, []);

  const handleChangePositionMode = useCallback((mode: PositionMode) => {
    setPositionMode(mode);
    setGuidedIndex(0);
  }, []);

  const handleChangeBoxNumber = useCallback((box: number) => {
    setBoxNumber(box);
    setGuidedIndex(0);
  }, []);

  // Jump from Circle of Fifths to Chord Studio
  const handleSelectChordFromCircle = useCallback((cRoot: NoteName, cChordId: string) => {
    setSelectedChordRoot(cRoot);
    setSelectedChordId(cChordId);
    setStudioTab("chords");
  }, []);

  // Calculate active notes in current scale
  const activeNotesSet = useMemo(() => {
    const scaleNotes = getScaleNotes(rootNote, selectedScale);
    return new Set(scaleNotes.map((n) => n.note));
  }, [rootNote, selectedScale]);

  // Generate full fretboard positions for scales
  const allPositions = useMemo(() => {
    return generateFretboard(selectedTuning, rootNote, activeNotesSet);
  }, [selectedTuning, rootNote, activeNotesSet]);

  // Filter positions for active view (Full, CAGED, 3NPS)
  const activePositions = useMemo(() => {
    return filterPositions(allPositions, positionMode, rootNote, boxNumber);
  }, [allPositions, positionMode, rootNote, boxNumber]);

  // Guided mode sequence
  const guidedSequence = useMemo(() => {
    return getGuidedSequence(activePositions);
  }, [activePositions]);

  // Target position for guided mode
  const guidedTargetPosition: FretboardPosition | null = useMemo(() => {
    if (practiceMode !== "guided" || guidedSequence.length === 0) return null;
    return guidedSequence[guidedIndex % guidedSequence.length] || null;
  }, [practiceMode, guidedSequence, guidedIndex]);

  // Check if detected note is correct
  const isNoteCorrect = useMemo(() => {
    if (!currentPitch) return null;

    if (practiceMode === "guided") {
      if (!guidedTargetPosition) return null;
      return currentPitch.note === guidedTargetPosition.note;
    } else {
      return activeNotesSet.has(currentPitch.note);
    }
  }, [currentPitch, practiceMode, guidedTargetPosition, activeNotesSet]);

  // Guided navigation handlers
  const handleNextGuidedNote = useCallback(() => {
    if (guidedSequence.length === 0) return;
    setGuidedIndex((prev) => (prev + 1) % guidedSequence.length);
  }, [guidedSequence.length]);

  const handlePrevGuidedNote = useCallback(() => {
    if (guidedSequence.length === 0) return;
    setGuidedIndex((prev) => (prev - 1 + guidedSequence.length) % guidedSequence.length);
  }, [guidedSequence.length]);

  // Clicking on fretboard in guided mode advances if correct note clicked
  const handleFretboardPositionClick = useCallback((pos: FretboardPosition) => {
    if (practiceMode === "guided" && guidedTargetPosition) {
      if (pos.note === guidedTargetPosition.note) {
        setGuidedIndex((prev) => (prev + 1) % Math.max(1, guidedSequence.length));
        setJustAdvanced(true);
        setTimeout(() => setJustAdvanced(false), 600);
      }
    }
  }, [practiceMode, guidedTargetPosition, guidedSequence.length]);

  // Frame-based detection accumulator for guided mode (no cancelling timeouts)
  const consecutiveHitsRef = useRef<number>(0);
  const lastAdvanceTimeRef = useRef<number>(0);

  useEffect(() => {
    if (practiceMode !== "guided" || !guidedTargetPosition || !currentPitch) {
      consecutiveHitsRef.current = 0;
      return;
    }

    if (currentPitch.note === guidedTargetPosition.note) {
      const now = performance.now();
      if (now - lastAdvanceTimeRef.current > 400) {
        consecutiveHitsRef.current += 1;
        if (consecutiveHitsRef.current >= 2) {
          lastAdvanceTimeRef.current = now;
          consecutiveHitsRef.current = 0;
          setGuidedIndex((prev) => (prev + 1) % Math.max(1, guidedSequence.length));
          setJustAdvanced(true);
          setTimeout(() => setJustAdvanced(false), 600);
        }
      }
    } else {
      consecutiveHitsRef.current = 0;
    }
  }, [currentPitch, practiceMode, guidedTargetPosition, guidedSequence.length]);

  // Start / Stop Pitch Detector
  const handleToggleListening = useCallback(async () => {
    if (isListening) {
      if (pitchDetectorRef.current) {
        pitchDetectorRef.current.stop();
        pitchDetectorRef.current = null;
      }
      setIsListening(false);
      setCurrentPitch(null);
      setConfidence(0);
      setRms(0);
      setMicError(null);
    } else {
      setMicError(null);
      try {
        const detector = new PitchDetector();
        await detector.start(({ pitch, confidence, rms }) => {
          setCurrentPitch(pitch);
          setConfidence(confidence);
          setRms(rms);
        });
        pitchDetectorRef.current = detector;
        setIsListening(true);
      } catch (err: unknown) {
        const error = err as Error;
        setMicError(
          error.name === "NotAllowedError"
            ? "Microphone access denied. Please grant browser permission to enable live pitch detection."
            : `Failed to access microphone: ${error.message || "Unknown error"}`
        );
        setIsListening(false);
      }
    }
  }, [isListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pitchDetectorRef.current) {
        pitchDetectorRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-departure font-medium text-[var(--accent)] tracking-tight">
          Guitar Practice Studio
        </h1>
        <p className="text-sm font-serif text-[var(--ink-mute)]">
          Interactive guitar learning suite: scales with live microphone pitch detection,
          playable chord voicings, Circle of Fifths harmonies, and ear training games.
        </p>
      </div>

      {/* Main Top Studio Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--rule)] pb-4 font-mono text-xs">
        <button
          type="button"
          onClick={() => setStudioTab("scales")}
          className={`py-2 px-4 rounded-md font-semibold tracking-wide transition-all cursor-pointer ${
            studioTab === "scales"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "border border-[var(--rule)] bg-[var(--bg-card)] text-[var(--ink)] hover:border-[var(--accent)]"
          }`}
        >
          Scales
        </button>
        <button
          type="button"
          onClick={() => setStudioTab("modes")}
          className={`py-2 px-4 rounded-md font-semibold tracking-wide transition-all cursor-pointer ${
            studioTab === "modes"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "border border-[var(--rule)] bg-[var(--bg-card)] text-[var(--ink)] hover:border-[var(--accent)]"
          }`}
        >
          Modes
        </button>
        <button
          type="button"
          onClick={() => setStudioTab("chords")}
          className={`py-2 px-4 rounded-md font-semibold tracking-wide transition-all cursor-pointer ${
            studioTab === "chords"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "border border-[var(--rule)] bg-[var(--bg-card)] text-[var(--ink)] hover:border-[var(--accent)]"
          }`}
        >
          Chord Voicings & Shapes
        </button>
        <button
          type="button"
          onClick={() => setStudioTab("circle_of_fifths")}
          className={`py-2 px-4 rounded-md font-semibold tracking-wide transition-all cursor-pointer ${
            studioTab === "circle_of_fifths"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "border border-[var(--rule)] bg-[var(--bg-card)] text-[var(--ink)] hover:border-[var(--accent)]"
          }`}
        >
          Circle of Fifths
        </button>
        <button
          type="button"
          onClick={() => setStudioTab("ear_training")}
          className={`py-2 px-4 rounded-md font-semibold tracking-wide transition-all cursor-pointer ${
            studioTab === "ear_training"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "border border-[var(--rule)] bg-[var(--bg-card)] text-[var(--ink)] hover:border-[var(--accent)]"
          }`}
        >
          Ear Training Game 🎯
        </button>
        <button
          type="button"
          onClick={() => setStudioTab("theory_references")}
          className={`py-2 px-4 rounded-md font-semibold tracking-wide transition-all cursor-pointer ${
            studioTab === "theory_references"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "border border-[var(--rule)] bg-[var(--bg-card)] text-[var(--ink)] hover:border-[var(--accent)]"
          }`}
        >
          Theory References 📚
        </button>
      </div>

      {/* View 1: Scales */}
      {studioTab === "scales" && (
        <div className="space-y-6">
          <ControlPanel
            rootNote={rootNote}
            onSelectRoot={handleSelectRoot}
            selectedScale={selectedScale}
            onSelectScale={handleSelectScale}
            selectedTuning={selectedTuning}
            onSelectTuning={handleSelectTuning}
            practiceMode={practiceMode}
            onChangePracticeMode={setPracticeMode}
            positionMode={positionMode}
            onChangePositionMode={handleChangePositionMode}
            boxNumber={boxNumber}
            onChangeBoxNumber={handleChangeBoxNumber}
            labelMode={labelMode}
            onChangeLabelMode={setLabelMode}
            isListening={isListening}
            onToggleListening={handleToggleListening}
            micError={micError}
          />

          <PitchDisplay
            isListening={isListening}
            pitch={currentPitch}
            confidence={confidence}
            rms={rms}
            isNoteCorrect={isNoteCorrect}
            targetNoteName={guidedTargetPosition?.note}
          />

          {practiceMode === "guided" && guidedTargetPosition && (
            <div className="rounded-lg border border-[var(--accent-teal)] bg-teal-50/50 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-teal)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--accent-teal)]" />
                </span>
                <div>
                  <div className="text-xs font-mono font-semibold text-teal-900">
                    Guided Step {(guidedIndex % guidedSequence.length) + 1} of {guidedSequence.length}
                  </div>
                  <div className="text-xs font-mono text-teal-700">
                    Target: <span className="font-bold text-sm text-[var(--ink)]">{guidedTargetPosition.note}</span> on String {guidedTargetPosition.stringNumber} (fret {guidedTargetPosition.fret === 0 ? "Open" : guidedTargetPosition.fret})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {justAdvanced && (
                  <span className="text-xs font-mono font-semibold text-green-700 bg-green-100 px-2 py-1 rounded transition-all animate-pulse">
                    ✓ Got it! Next note →
                  </span>
                )}
                <button
                  type="button"
                  onClick={handlePrevGuidedNote}
                  className="px-2.5 py-1 rounded border border-[var(--rule)] bg-[var(--bg)] font-mono text-xs hover:border-[var(--accent)] cursor-pointer"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  onClick={handleNextGuidedNote}
                  className="px-2.5 py-1 rounded border border-[var(--rule)] bg-[var(--bg)] font-mono text-xs hover:border-[var(--accent)] cursor-pointer"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-mute)] px-1">
              <span>
                {selectedScale.name} in {rootNote}
                {positionMode !== "full" ? ` (${positionMode.toUpperCase()} Box ${boxNumber})` : ""}
              </span>
              <span>
                {practiceMode === "guided"
                  ? "Follow the pulsating teal target dot (or click it to advance)"
                  : "Click any dot or fret to hear the reference tone"}
              </span>
            </div>

            <Fretboard
              allPositions={allPositions}
              activePositions={activePositions}
              guidedTargetPosition={guidedTargetPosition}
              detectedNote={currentPitch?.note || null}
              isNoteCorrect={isNoteCorrect}
              labelMode={labelMode}
              onPositionClick={handleFretboardPositionClick}
            />
          </div>
        </div>
      )}

      {/* View 2: Greek Modes */}
      {studioTab === "modes" && (
        <ModesStudio
          tuning={selectedTuning}
          onSelectTuning={handleSelectTuning}
          onOpenTheory={() => setStudioTab("theory_references")}
        />
      )}

      {/* View 3: Chord Voicings & Shapes */}
      {studioTab === "chords" && (
        <ChordStudio
          initialRoot={selectedChordRoot}
          initialChordId={selectedChordId}
          tuning={selectedTuning}
          labelMode={labelMode}
        />
      )}

      {/* View 4: Circle of Fifths */}
      {studioTab === "circle_of_fifths" && (
        <CircleOfFifths
          onSelectChord={handleSelectChordFromCircle}
          onOpenTheory={() => setStudioTab("theory_references")}
        />
      )}

      {/* View 5: Ear Training Game */}
      {studioTab === "ear_training" && (
        <EarTrainingGame tuning={selectedTuning} />
      )}

      {/* View 6: Theory References */}
      {studioTab === "theory_references" && <TheoryReferences />}

      {/* Persistent Metronome */}
      <Metronome />
    </div>
  );
};
