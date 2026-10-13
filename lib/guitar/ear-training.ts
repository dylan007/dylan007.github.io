import {
  NoteName,
  CHROMATIC_NOTES,
  INTERVALS,
  CHORDS,
  getTransposedNote,
  getNoteIndex,
  noteToFrequency,
} from "./music-theory";

export type EarTrainingMode = "interval" | "chord_quality" | "pitch_match";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface EarTrainingQuestion {
  id: string;
  mode: EarTrainingMode;
  prompt: string;
  audioFrequencies: number[];
  playStyle: "interval_melodic_up" | "interval_melodic_down" | "interval_harmonic" | "chord_strum" | "single_note";
  options: { id: string; label: string; isCorrect: boolean }[];
  correctAnswerId: string;
  explanation: string;
  notes: { note: NoteName; octave: number; intervalLabel?: string }[];
}

export interface IntervalOption {
  semitones: number;
  label: string;
  name: string;
  mnemonic: string;
}

export const INTERVAL_LIST: IntervalOption[] = [
  { semitones: 1, label: "m2", name: "Minor 2nd", mnemonic: "Jaws theme, Pink Panther" },
  { semitones: 2, label: "M2", name: "Major 2nd", mnemonic: "Happy Birthday, Frère Jacques" },
  { semitones: 3, label: "m3", name: "Minor 3rd", mnemonic: "Greensleeves, Smoke on the Water" },
  { semitones: 4, label: "M3", name: "Major 3rd", mnemonic: "Kumbaya, When the Saints Go Marching In" },
  { semitones: 5, label: "P4", name: "Perfect 4th", mnemonic: "Amazing Grace, Here Comes the Bride" },
  { semitones: 6, label: "d5", name: "Tritone / b5", mnemonic: "The Simpsons opening, Maria (West Side Story)" },
  { semitones: 7, label: "P5", name: "Perfect 5th", mnemonic: "Star Wars theme, Twinkle Twinkle Little Star" },
  { semitones: 8, label: "m6", name: "Minor 6th", mnemonic: "The Entertainer, Across the Stars" },
  { semitones: 9, label: "M6", name: "Major 6th", mnemonic: "My Bonnie Lies Over the Ocean, NBC chimes" },
  { semitones: 10, label: "m7", name: "Minor 7th", mnemonic: "Star Trek theme, The Winner Takes It All" },
  { semitones: 11, label: "M7", name: "Major 7th", mnemonic: "Take On Me (high leap), Superman" },
  { semitones: 12, label: "P8", name: "Octave", mnemonic: "Somewhere Over the Rainbow" },
];

/**
 * Filter intervals by difficulty
 */
function getIntervalsForDifficulty(diff: Difficulty): IntervalOption[] {
  if (diff === "beginner") {
    // Basic high-contrast intervals: m3, M3, P4, P5, Octave
    return INTERVAL_LIST.filter((i) => [3, 4, 5, 7, 12].includes(i.semitones));
  }
  if (diff === "intermediate") {
    // All diatonic intervals: M2, m3, M3, P4, P5, M6, m7, Octave
    return INTERVAL_LIST.filter((i) => [2, 3, 4, 5, 7, 9, 10, 12].includes(i.semitones));
  }
  // Advanced: all 12 chromatic intervals
  return INTERVAL_LIST;
}

/**
 * Filter chords by difficulty
 */
function getChordsForDifficulty(diff: Difficulty) {
  if (diff === "beginner") {
    // Major vs Minor vs Power
    return CHORDS.filter((c) => ["maj", "min", "power"].includes(c.id));
  }
  if (diff === "intermediate") {
    // Triads and 7ths
    return CHORDS.filter((c) =>
      ["maj", "min", "dom7", "maj7", "min7", "sus2", "sus4"].includes(c.id)
    );
  }
  // Advanced: include Diminished, Augmented, 9th, m7b5
  return CHORDS.filter((c) =>
    ["maj", "min", "dom7", "maj7", "min7", "dim", "aug", "m7b5", "sus4", "add9"].includes(c.id)
  );
}

/**
 * Generates an Ear Training question based on mode and difficulty
 */
export function generateQuestion(
  mode: EarTrainingMode,
  difficulty: Difficulty
): EarTrainingQuestion {
  const randomRoot = CHROMATIC_NOTES[Math.floor(Math.random() * CHROMATIC_NOTES.length)];
  const baseOctave = 3; // Guitar middle range

  if (mode === "interval") {
    const candidateIntervals = getIntervalsForDifficulty(difficulty);
    const targetInterval = candidateIntervals[Math.floor(Math.random() * candidateIntervals.length)];

    const note1 = randomRoot;
    const note1Octave = baseOctave;
    const note1Freq = noteToFrequency(note1, note1Octave);

    const targetNote = getTransposedNote(randomRoot, targetInterval.semitones);
    const totalSemitones = getNoteIndex(note1) + note1Octave * 12 + targetInterval.semitones;
    const note2Octave = Math.floor(totalSemitones / 12);
    const note2Freq = noteToFrequency(targetNote, note2Octave);

    // Pick 3 distractors from candidateIntervals
    const distractors = candidateIntervals
      .filter((i) => i.semitones !== targetInterval.semitones)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const allOptions = [targetInterval, ...distractors]
      .sort(() => 0.5 - Math.random())
      .map((i) => ({
        id: String(i.semitones),
        label: `${i.name} (${i.label})`,
        isCorrect: i.semitones === targetInterval.semitones,
      }));

    return {
      id: `interval-${Date.now()}-${Math.random()}`,
      mode: "interval",
      prompt: "Identify the interval played between the two notes:",
      audioFrequencies: [note1Freq, note2Freq],
      playStyle: "interval_melodic_up",
      options: allOptions,
      correctAnswerId: String(targetInterval.semitones),
      explanation: `${targetInterval.name} is ${targetInterval.semitones} semitones. (${note1} to ${targetNote}). Mnemonic: ${targetInterval.mnemonic}.`,
      notes: [
        { note: note1, octave: note1Octave, intervalLabel: "Root" },
        { note: targetNote, octave: note2Octave, intervalLabel: targetInterval.label },
      ],
    };
  }

  if (mode === "chord_quality") {
    const candidateChords = getChordsForDifficulty(difficulty);
    const targetChord = candidateChords[Math.floor(Math.random() * candidateChords.length)];

    // Build frequencies for this chord in root position
    const chordFrequencies = targetChord.intervals.map((semitones) => {
      const note = getTransposedNote(randomRoot, semitones);
      const totalSemitones = getNoteIndex(randomRoot) + baseOctave * 12 + semitones;
      const octave = Math.floor(totalSemitones / 12);
      return noteToFrequency(note, octave);
    });

    const distractors = candidateChords
      .filter((c) => c.id !== targetChord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const allOptions = [targetChord, ...distractors]
      .sort(() => 0.5 - Math.random())
      .map((c) => ({
        id: c.id,
        label: c.name,
        isCorrect: c.id === targetChord.id,
      }));

    const notesInfo = targetChord.intervals.map((semitones) => {
      const note = getTransposedNote(randomRoot, semitones);
      const totalSemitones = getNoteIndex(randomRoot) + baseOctave * 12 + semitones;
      const octave = Math.floor(totalSemitones / 12);
      return {
        note,
        octave,
        intervalLabel: INTERVALS[semitones % 12]?.label || "R",
      };
    });

    return {
      id: `chord-${Date.now()}-${Math.random()}`,
      mode: "chord_quality",
      prompt: "Listen to the chord and identify its flavor / quality:",
      audioFrequencies: chordFrequencies,
      playStyle: "chord_strum",
      options: allOptions,
      correctAnswerId: targetChord.id,
      explanation: `${randomRoot} ${targetChord.name} contains intervals [${targetChord.intervals.map((s) => INTERVALS[s % 12]?.label || "R").join(", ")}] — Notes: ${notesInfo.map((n) => n.note).join(" - ")}.`,
      notes: notesInfo,
    };
  }

  // mode === "pitch_match"
  const targetNote = randomRoot;
  const targetFreq = noteToFrequency(targetNote, baseOctave);

  // Distractors
  const otherNotes = CHROMATIC_NOTES.filter((n) => n !== targetNote)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const allOptions = [targetNote, ...otherNotes]
    .sort(() => 0.5 - Math.random())
    .map((n) => ({
      id: n,
      label: `Note ${n}`,
      isCorrect: n === targetNote,
    }));

  return {
    id: `pitch-${Date.now()}-${Math.random()}`,
    mode: "pitch_match",
    prompt: "Identify the pitch / note played:",
    audioFrequencies: [targetFreq],
    playStyle: "single_note",
    options: allOptions,
    correctAnswerId: targetNote,
    explanation: `The note played was ${targetNote} (${targetFreq.toFixed(1)} Hz).`,
    notes: [{ note: targetNote, octave: baseOctave, intervalLabel: "Pitch" }],
  };
}
