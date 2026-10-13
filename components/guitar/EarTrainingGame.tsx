"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  EarTrainingMode,
  Difficulty,
  EarTrainingQuestion,
  generateQuestion,
} from "@/lib/guitar/ear-training";
import { referenceTonePlayer } from "@/lib/guitar/reference-tone";
import { TuningDefinition, NoteName } from "@/lib/guitar/music-theory";
import { generateFretboard, FretboardPosition } from "@/lib/guitar/fretboard";
import { Fretboard } from "./Fretboard";

interface EarTrainingGameProps {
  tuning: TuningDefinition;
}

export const EarTrainingGame: React.FC<EarTrainingGameProps> = ({ tuning }) => {
  const [mode, setMode] = useState<EarTrainingMode>("interval");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [question, setQuestion] = useState<EarTrainingQuestion>(() =>
    generateQuestion("interval", "beginner")
  );

  // Interval and chord playback options
  const [intervalStyle, setIntervalStyle] = useState<"ascending" | "descending" | "harmonic">("ascending");
  const [chordStyle, setChordStyle] = useState<"strum" | "arpeggio">("strum");

  // Game state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Play audio for current question
  const playQuestionAudio = useCallback(async (q: EarTrainingQuestion) => {
    if (!q || q.audioFrequencies.length === 0) return;
    setIsPlayingAudio(true);

    try {
      if (q.mode === "interval" && q.audioFrequencies.length >= 2) {
        await referenceTonePlayer.playInterval(
          q.audioFrequencies[0],
          q.audioFrequencies[1],
          intervalStyle
        );
      } else if (q.mode === "chord_quality") {
        if (chordStyle === "arpeggio") {
          await referenceTonePlayer.playArpeggio(q.audioFrequencies, 220, 1.4);
        } else {
          await referenceTonePlayer.playChord(q.audioFrequencies, 35, 2.2);
        }
      } else {
        // single note
        await referenceTonePlayer.playNote(q.audioFrequencies[0], 1.5);
      }
    } finally {
      setTimeout(() => setIsPlayingAudio(false), 500);
    }
  }, [intervalStyle, chordStyle]);

  // Load new question
  const loadNextQuestion = useCallback(() => {
    const nextQ = generateQuestion(mode, difficulty);
    setQuestion(nextQ);
    setSelectedOptionId(null);
    setIsAnswered(false);
    playQuestionAudio(nextQ);
  }, [mode, difficulty, playQuestionAudio]);

  // Handle mode change
  const handleModeChange = (newMode: EarTrainingMode) => {
    setMode(newMode);
    const nextQ = generateQuestion(newMode, difficulty);
    setQuestion(nextQ);
    setSelectedOptionId(null);
    setIsAnswered(false);
    playQuestionAudio(nextQ);
  };

  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    const nextQ = generateQuestion(mode, newDifficulty);
    setQuestion(nextQ);
    setSelectedOptionId(null);
    setIsAnswered(false);
    playQuestionAudio(nextQ);
  };

  // Handle player answer submission
  const handleSelectOption = (optionId: string) => {
    if (isAnswered || !question) return;

    setSelectedOptionId(optionId);
    setIsAnswered(true);
    setTotalQuestions((prev) => prev + 1);

    const isCorrect = optionId === question.correctAnswerId;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  // Notes set for mini fretboard reveal
  const questionNotesSet = useMemo(() => {
    if (!question) return new Set<NoteName>();
    return new Set<NoteName>(question.notes.map((n) => n.note));
  }, [question]);

  const allPositions = useMemo(() => {
    if (!question || question.notes.length === 0) return [];
    const root = question.notes[0].note;
    return generateFretboard(tuning, root, questionNotesSet);
  }, [tuning, question, questionNotesSet]);

  const activePositions: FretboardPosition[] = useMemo(() => {
    if (!allPositions) return [];
    return allPositions.filter((p) => p.isInScaleOrChord);
  }, [allPositions]);

  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header & Modes Bar */}
      <div className="rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-4 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--rule)] pb-4">
          {/* Game Mode Tabs */}
          <div className="flex rounded-md bg-[var(--bg)] p-1 border border-[var(--rule)] font-mono text-xs">
            <button
              type="button"
              onClick={() => handleModeChange("interval")}
              className={`px-3 py-1.5 rounded transition-colors font-medium cursor-pointer ${
                mode === "interval"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--ink-mute)] hover:text-[var(--ink)]"
              }`}
            >
              Interval Training
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("chord_quality")}
              className={`px-3 py-1.5 rounded transition-colors font-medium cursor-pointer ${
                mode === "chord_quality"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--ink-mute)] hover:text-[var(--ink)]"
              }`}
            >
              Chord Quality
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("pitch_match")}
              className={`px-3 py-1.5 rounded transition-colors font-medium cursor-pointer ${
                mode === "pitch_match"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--ink-mute)] hover:text-[var(--ink)]"
              }`}
            >
              Pitch Memory
            </button>
          </div>

          {/* Difficulty Presets */}
          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="text-[var(--ink-mute)] mr-1">Level:</span>
            {(["beginner", "intermediate", "advanced"] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleDifficultyChange(d)}
                className={`px-2.5 py-1 rounded capitalize border transition-all cursor-pointer ${
                  difficulty === d
                    ? "border-[var(--accent-teal)] bg-[var(--accent-teal)] text-white font-semibold"
                    : "border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--accent-teal)]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Score & Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
          <div className="p-2.5 rounded bg-[var(--bg)] border border-[var(--rule)]">
            <div className="text-[10px] uppercase text-[var(--ink-mute)] tracking-wider">
              Score
            </div>
            <div className="text-xl font-departure font-bold text-[var(--ink)]">
              {score} / {totalQuestions}
            </div>
          </div>
          <div className="p-2.5 rounded bg-[var(--bg)] border border-[var(--rule)]">
            <div className="text-[10px] uppercase text-[var(--ink-mute)] tracking-wider">
              Streak
            </div>
            <div className="text-xl font-departure font-bold text-[var(--accent)]">
              {streak} 🔥
            </div>
          </div>
          <div className="p-2.5 rounded bg-[var(--bg)] border border-[var(--rule)]">
            <div className="text-[10px] uppercase text-[var(--ink-mute)] tracking-wider">
              Best Streak
            </div>
            <div className="text-xl font-departure font-bold text-[var(--accent-violet)]">
              {bestStreak}
            </div>
          </div>
          <div className="p-2.5 rounded bg-[var(--bg)] border border-[var(--rule)]">
            <div className="text-[10px] uppercase text-[var(--ink-mute)] tracking-wider">
              Accuracy
            </div>
            <div className="text-xl font-departure font-bold text-[var(--accent-teal)]">
              {accuracy}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Question & Challenge Card */}
      {question && (
        <div className="rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-6 space-y-6 shadow-sm">
          {/* Question Prompt & Sound Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--rule)] pb-5">
            <div>
              <span className="text-xs font-mono font-medium text-[var(--accent)] uppercase tracking-wider">
                Question Challenge
              </span>
              <h3 className="text-lg font-departure font-semibold text-[var(--ink)] mt-0.5">
                {question.prompt}
              </h3>
            </div>

            {/* Audio playback style options & Replay Button */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              {mode === "interval" && (
                <div className="flex rounded border border-[var(--rule)] bg-[var(--bg)] p-0.5 text-[11px]">
                  {(["ascending", "descending", "harmonic"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setIntervalStyle(s);
                        if (question) {
                          referenceTonePlayer.playInterval(
                            question.audioFrequencies[0],
                            question.audioFrequencies[1],
                            s
                          );
                        }
                      }}
                      className={`px-2 py-1 rounded capitalize transition-colors cursor-pointer ${
                        intervalStyle === s
                          ? "bg-[var(--accent-teal)] text-white"
                          : "text-[var(--ink-mute)]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {mode === "chord_quality" && (
                <div className="flex rounded border border-[var(--rule)] bg-[var(--bg)] p-0.5 text-[11px]">
                  {(["strum", "arpeggio"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setChordStyle(s);
                        if (question) {
                          if (s === "arpeggio") {
                            referenceTonePlayer.playArpeggio(question.audioFrequencies, 200, 1.4);
                          } else {
                            referenceTonePlayer.playChord(question.audioFrequencies, 35, 2.2);
                          }
                        }
                      }}
                      className={`px-2.5 py-1 rounded capitalize transition-colors cursor-pointer ${
                        chordStyle === s
                          ? "bg-[var(--accent-teal)] text-white"
                          : "text-[var(--ink-mute)]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Big Replay Sound Button */}
              <button
                type="button"
                onClick={() => playQuestionAudio(question)}
                disabled={isPlayingAudio}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold tracking-wide transition-all shadow-xs cursor-pointer ${
                  isPlayingAudio
                    ? "bg-[var(--accent)] text-white animate-pulse"
                    : "bg-[var(--ink)] text-white hover:opacity-90"
                }`}
              >
                <span>♫</span>
                <span>{isPlayingAudio ? "Playing..." : "Replay Audio"}</span>
              </button>
            </div>
          </div>

          {/* Answer Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
            {question.options.map((opt) => {
              let btnClass = "border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--accent-violet)] hover:bg-[var(--bg-card)]";

              if (isAnswered) {
                if (opt.isCorrect) {
                  btnClass = "border-green-600 bg-green-50 text-green-900 font-bold shadow-xs";
                } else if (selectedOptionId === opt.id) {
                  btnClass = "border-red-600 bg-red-50 text-red-900 font-bold line-through";
                } else {
                  btnClass = "border-[var(--rule)] bg-[var(--bg)] text-[var(--ink-mute)] opacity-50";
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-3.5 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                >
                  <span className="font-semibold text-sm">{opt.label}</span>
                  {isAnswered && opt.isCorrect && (
                    <span className="text-green-700 text-sm">✓ Correct</span>
                  )}
                  {isAnswered && selectedOptionId === opt.id && !opt.isCorrect && (
                    <span className="text-red-700 text-sm">✗ Wrong</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Reveal Section */}
          {isAnswered && (
            <div className="space-y-4 pt-2">
              <div
                className={`p-4 rounded-lg border font-mono text-xs space-y-1.5 ${
                  selectedOptionId === question.correctAnswerId
                    ? "bg-green-50 border-green-200 text-green-900"
                    : "bg-red-50 border-red-200 text-red-900"
                }`}
              >
                <div className="font-bold text-sm">
                  {selectedOptionId === question.correctAnswerId
                    ? "✓ Excellent ear! That's correct."
                    : "✗ Not quite!"}
                </div>
                <div className="text-xs leading-relaxed opacity-90">
                  {question.explanation}
                </div>
              </div>

              {/* Next Question Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={loadNextQuestion}
                  className="py-2.5 px-6 rounded-md bg-[var(--accent)] text-white font-mono text-xs font-semibold hover:opacity-90 shadow-xs cursor-pointer"
                >
                  Next Question →
                </button>
              </div>

              {/* Mini Fretboard Reveal */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--rule)]">
                <span className="text-xs font-mono text-[var(--ink-mute)] font-medium">
                  Fretboard Locations for these Notes ({question.notes.map((n) => n.note).join(", ")}):
                </span>
                <Fretboard
                  allPositions={allPositions}
                  activePositions={activePositions}
                  guidedTargetPosition={null}
                  detectedNote={null}
                  isNoteCorrect={null}
                  labelMode="notes"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
