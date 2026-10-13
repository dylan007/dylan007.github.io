export type NoteName =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

export const CHROMATIC_NOTES: NoteName[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const ENHARMONIC_MAP: Record<string, NoteName> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
  "C#": "C#",
  "D#": "D#",
  "F#": "F#",
  "G#": "G#",
  "A#": "A#",
  C: "C",
  D: "D",
  E: "E",
  F: "F",
  G: "G",
  A: "A",
  B: "B",
};

export interface IntervalInfo {
  semitones: number;
  label: string; // e.g., 'R', 'b3', '3', '5', 'b7', '7'
  name: string;
}

export const INTERVALS: Record<number, { label: string; name: string }> = {
  0: { label: "R", name: "Root" },
  1: { label: "b2", name: "Minor 2nd" },
  2: { label: "2", name: "Major 2nd" },
  3: { label: "b3", name: "Minor 3rd" },
  4: { label: "3", name: "Major 3rd" },
  5: { label: "4", name: "Perfect 4th" },
  6: { label: "b5", name: "Diminished 5th / Tritone" },
  7: { label: "5", name: "Perfect 5th" },
  8: { label: "b6", name: "Minor 6th" },
  9: { label: "6", name: "Major 6th" },
  10: { label: "b7", name: "Minor 7th" },
  11: { label: "7", name: "Major 7th" },
};

export interface ScaleDefinition {
  id: string;
  name: string;
  category: "Major/Minor" | "Pentatonic & Blues" | "Modes";
  intervals: number[]; // semitone offsets from root
}

export const SCALES: ScaleDefinition[] = [
  // Major/Minor
  {
    id: "major",
    name: "Major (Ionian)",
    category: "Major/Minor",
    intervals: [0, 2, 4, 5, 7, 9, 11],
  },
  {
    id: "natural_minor",
    name: "Natural Minor (Aeolian)",
    category: "Major/Minor",
    intervals: [0, 2, 3, 5, 7, 8, 10],
  },
  {
    id: "harmonic_minor",
    name: "Harmonic Minor",
    category: "Major/Minor",
    intervals: [0, 2, 3, 5, 7, 8, 11],
  },
  {
    id: "melodic_minor",
    name: "Melodic Minor (Ascending)",
    category: "Major/Minor",
    intervals: [0, 2, 3, 5, 7, 9, 11],
  },

  // Pentatonic & Blues
  {
    id: "pentatonic_major",
    name: "Major Pentatonic",
    category: "Pentatonic & Blues",
    intervals: [0, 2, 4, 7, 9],
  },
  {
    id: "pentatonic_minor",
    name: "Minor Pentatonic",
    category: "Pentatonic & Blues",
    intervals: [0, 3, 5, 7, 10],
  },
  {
    id: "blues",
    name: "Blues",
    category: "Pentatonic & Blues",
    intervals: [0, 3, 5, 6, 7, 10],
  },

  // Modes
  {
    id: "ionian",
    name: "Ionian (Major)",
    category: "Modes",
    intervals: [0, 2, 4, 5, 7, 9, 11],
  },
  {
    id: "dorian",
    name: "Dorian",
    category: "Modes",
    intervals: [0, 2, 3, 5, 7, 9, 10],
  },
  {
    id: "phrygian",
    name: "Phrygian",
    category: "Modes",
    intervals: [0, 1, 3, 5, 7, 8, 10],
  },
  {
    id: "lydian",
    name: "Lydian",
    category: "Modes",
    intervals: [0, 2, 4, 6, 7, 9, 11],
  },
  {
    id: "mixolydian",
    name: "Mixolydian",
    category: "Modes",
    intervals: [0, 2, 4, 5, 7, 9, 10],
  },
  {
    id: "aeolian",
    name: "Aeolian (Natural Minor)",
    category: "Modes",
    intervals: [0, 2, 3, 5, 7, 8, 10],
  },
  {
    id: "locrian",
    name: "Locrian",
    category: "Modes",
    intervals: [0, 1, 3, 5, 6, 8, 10],
  },
];

export interface ModeDefinition {
  id: string;
  name: string;
  degree: number; // 1 to 7
  romanNumeral: string; // I, ii, iii, IV, V, vi, vii°
  quality: "Major" | "Minor" | "Diminished";
  intervals: number[];
  formula: string;
  parentOffsetSemitones: number; // semitones below root where parent Major tonic is located
  characteristicDegree: string; // e.g. "Natural 6th (6)"
  characteristicIntervalIndex: number; // semitone index of characteristic note
  flavor: string;
  famousExamples: string;
}

export const GREEK_MODES: ModeDefinition[] = [
  {
    id: "ionian",
    name: "Ionian",
    degree: 1,
    romanNumeral: "I",
    quality: "Major",
    intervals: [0, 2, 4, 5, 7, 9, 11],
    formula: "1 2 3 4 5 6 7",
    parentOffsetSemitones: 0,
    characteristicDegree: "Major 3rd (3) & Major 7th (7)",
    characteristicIntervalIndex: 11,
    flavor: "Bright, resolved, pure major optimism",
    famousExamples: "Let It Be (Beatles), Ode to Joy",
  },
  {
    id: "dorian",
    name: "Dorian",
    degree: 2,
    romanNumeral: "ii",
    quality: "Minor",
    intervals: [0, 2, 3, 5, 7, 9, 10],
    formula: "1 2 b3 4 5 6 b7",
    parentOffsetSemitones: 2,
    characteristicDegree: "Natural 6th (6)",
    characteristicIntervalIndex: 9,
    flavor: "Soulful, jazzy, bittersweet minor",
    famousExamples: "Oye Como Va (Santana), So What (Miles Davis), Eleanor Rigby",
  },
  {
    id: "phrygian",
    name: "Phrygian",
    degree: 3,
    romanNumeral: "iii",
    quality: "Minor",
    intervals: [0, 1, 3, 5, 7, 8, 10],
    formula: "1 b2 b3 4 5 b6 b7",
    parentOffsetSemitones: 4,
    characteristicDegree: "Flat 2nd (b2)",
    characteristicIntervalIndex: 1,
    flavor: "Dark, exotic, Spanish flamenco, heavy metal tension",
    famousExamples: "Wherever I May Roam (Metallica), White Rabbit (Jefferson Airplane)",
  },
  {
    id: "lydian",
    name: "Lydian",
    degree: 4,
    romanNumeral: "IV",
    quality: "Major",
    intervals: [0, 2, 4, 6, 7, 9, 11],
    formula: "1 2 3 #4 5 6 7",
    parentOffsetSemitones: 5,
    characteristicDegree: "Sharp 4th (#4 / Tritone)",
    characteristicIntervalIndex: 6,
    flavor: "Dreamy, spacey, ethereal, futuristic cinematic major",
    famousExamples: "The Simpsons Theme, E.T. Flying Theme, For the Love of God (Steve Vai)",
  },
  {
    id: "mixolydian",
    name: "Mixolydian",
    degree: 5,
    romanNumeral: "V",
    quality: "Major",
    intervals: [0, 2, 4, 5, 7, 9, 10],
    formula: "1 2 3 4 5 6 b7",
    parentOffsetSemitones: 7,
    characteristicDegree: "Flat 7th (b7)",
    characteristicIntervalIndex: 10,
    flavor: "Bluesy, swaggering dominant classic rock",
    famousExamples: "Sweet Home Alabama (Lynyrd Skynyrd), Norwegian Wood (Beatles), Fire on the Mountain",
  },
  {
    id: "aeolian",
    name: "Aeolian",
    degree: 6,
    romanNumeral: "vi",
    quality: "Minor",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    formula: "1 2 b3 4 5 b6 b7",
    parentOffsetSemitones: 9,
    characteristicDegree: "Flat 6th (b6)",
    characteristicIntervalIndex: 8,
    flavor: "Somber, dramatic, melancholic natural minor",
    famousExamples: "Stairway to Heaven (Led Zeppelin), Losing My Religion (R.E.M.)",
  },
  {
    id: "locrian",
    name: "Locrian",
    degree: 7,
    romanNumeral: "vii°",
    quality: "Diminished",
    intervals: [0, 1, 3, 5, 6, 8, 10],
    formula: "1 b2 b3 4 b5 b6 b7",
    parentOffsetSemitones: 11,
    characteristicDegree: "Diminished 5th (b5) & Flat 2nd (b2)",
    characteristicIntervalIndex: 6,
    flavor: "Dark, tense, highly unstable diminished dissonance",
    famousExamples: "Army of Lovers (Rush), Painkiller intro (Judas Priest)",
  },
];

export function getParentMajorKey(mode: ModeDefinition, root: NoteName): NoteName {
  const rootIdx = getNoteIndex(root);
  const parentIdx = (rootIdx - mode.parentOffsetSemitones + 12) % 12;
  return CHROMATIC_NOTES[parentIdx];
}

export function getCharacteristicNote(mode: ModeDefinition, root: NoteName): NoteName {
  const rootIdx = getNoteIndex(root);
  const charIdx = (rootIdx + mode.characteristicIntervalIndex) % 12;
  return CHROMATIC_NOTES[charIdx];
}


export interface ChordDefinition {
  id: string;
  name: string;
  category: "Basic & Triads" | "7th Chords" | "Extended & Added";
  intervals: number[]; // semitone offsets from root
}

export const CHORDS: ChordDefinition[] = [
  // Basic & Triads
  { id: "maj", name: "Major", category: "Basic & Triads", intervals: [0, 4, 7] },
  { id: "min", name: "Minor", category: "Basic & Triads", intervals: [0, 3, 7] },
  { id: "power", name: "5 (Power)", category: "Basic & Triads", intervals: [0, 7] },
  { id: "sus2", name: "Sus2", category: "Basic & Triads", intervals: [0, 2, 7] },
  { id: "sus4", name: "Sus4", category: "Basic & Triads", intervals: [0, 5, 7] },
  { id: "dim", name: "Diminished", category: "Basic & Triads", intervals: [0, 3, 6] },
  { id: "aug", name: "Augmented", category: "Basic & Triads", intervals: [0, 4, 8] },

  // 7th Chords
  { id: "dom7", name: "Dominant 7th (7)", category: "7th Chords", intervals: [0, 4, 7, 10] },
  { id: "maj7", name: "Major 7th (Maj7)", category: "7th Chords", intervals: [0, 4, 7, 11] },
  { id: "min7", name: "Minor 7th (m7)", category: "7th Chords", intervals: [0, 3, 7, 10] },
  { id: "dim7", name: "Diminished 7th (dim7)", category: "7th Chords", intervals: [0, 3, 6, 9] },
  { id: "m7b5", name: "Half-Diminished (m7b5)", category: "7th Chords", intervals: [0, 3, 6, 10] },

  // Extended & Added
  { id: "add9", name: "Add9", category: "Extended & Added", intervals: [0, 4, 7, 2] },
  { id: "maj6", name: "6th (Maj6)", category: "Extended & Added", intervals: [0, 4, 7, 9] },
  { id: "min6", name: "Minor 6th (m6)", category: "Extended & Added", intervals: [0, 3, 7, 9] },
  { id: "9", name: "9th (Dominant 9)", category: "Extended & Added", intervals: [0, 4, 7, 10, 2] },
  { id: "maj9", name: "Maj9", category: "Extended & Added", intervals: [0, 4, 7, 11, 2] },
  { id: "min9", name: "Min9", category: "Extended & Added", intervals: [0, 3, 7, 10, 2] },
  { id: "11", name: "11th", category: "Extended & Added", intervals: [0, 4, 7, 10, 2, 5] },
  { id: "13", name: "13th", category: "Extended & Added", intervals: [0, 4, 7, 10, 2, 9] },
];

export interface TuningDefinition {
  id: string;
  name: string;
  strings: { note: NoteName; octave: number }[];
}

export const TUNINGS: TuningDefinition[] = [
  {
    id: "standard",
    name: "Standard (E A D G B E)",
    strings: [
      { note: "E", octave: 2 },
      { note: "A", octave: 2 },
      { note: "D", octave: 3 },
      { note: "G", octave: 3 },
      { note: "B", octave: 3 },
      { note: "E", octave: 4 },
    ],
  },
  {
    id: "drop_d",
    name: "Drop D (D A D G B E)",
    strings: [
      { note: "D", octave: 2 },
      { note: "A", octave: 2 },
      { note: "D", octave: 3 },
      { note: "G", octave: 3 },
      { note: "B", octave: 3 },
      { note: "E", octave: 4 },
    ],
  },
  {
    id: "dadgad",
    name: "DADGAD",
    strings: [
      { note: "D", octave: 2 },
      { note: "A", octave: 2 },
      { note: "D", octave: 3 },
      { note: "G", octave: 3 },
      { note: "A", octave: 3 },
      { note: "D", octave: 4 },
    ],
  },
  {
    id: "open_g",
    name: "Open G (D G D G B D)",
    strings: [
      { note: "D", octave: 2 },
      { note: "G", octave: 2 },
      { note: "D", octave: 3 },
      { note: "G", octave: 3 },
      { note: "B", octave: 3 },
      { note: "D", octave: 4 },
    ],
  },
  {
    id: "open_d",
    name: "Open D (D A D F# A D)",
    strings: [
      { note: "D", octave: 2 },
      { note: "A", octave: 2 },
      { note: "D", octave: 3 },
      { note: "F#", octave: 3 },
      { note: "A", octave: 3 },
      { note: "D", octave: 4 },
    ],
  },
  {
    id: "half_step_down",
    name: "Half-Step Down (Eb Ab Db Gb Bb Eb)",
    strings: [
      { note: "D#", octave: 2 },
      { note: "G#", octave: 2 },
      { note: "C#", octave: 3 },
      { note: "F#", octave: 3 },
      { note: "A#", octave: 3 },
      { note: "D#", octave: 4 },
    ],
  },
];

export function getNoteIndex(note: NoteName): number {
  return CHROMATIC_NOTES.indexOf(note);
}

export function getTransposedNote(root: NoteName, semitones: number): NoteName {
  const rootIndex = getNoteIndex(root);
  const targetIndex = (rootIndex + (semitones % 12) + 12) % 12;
  return CHROMATIC_NOTES[targetIndex];
}

export function getIntervalBetween(root: NoteName, target: NoteName): number {
  const rootIdx = getNoteIndex(root);
  const targetIdx = getNoteIndex(target);
  return (targetIdx - rootIdx + 12) % 12;
}

export function getIntervalLabel(root: NoteName, target: NoteName): string {
  const semitones = getIntervalBetween(root, target);
  return INTERVALS[semitones]?.label ?? "";
}

export function getScaleNotes(root: NoteName, scale: ScaleDefinition): { note: NoteName; interval: string; semitone: number }[] {
  return scale.intervals.map((interval) => {
    const note = getTransposedNote(root, interval);
    return {
      note,
      interval: INTERVALS[interval % 12]?.label || "R",
      semitone: interval % 12,
    };
  });
}

export function getChordNotes(root: NoteName, chord: ChordDefinition): { note: NoteName; interval: string; semitone: number }[] {
  return chord.intervals.map((interval) => {
    const note = getTransposedNote(root, interval);
    return {
      note,
      interval: INTERVALS[interval % 12]?.label || "R",
      semitone: interval % 12,
    };
  });
}

export function noteToFrequency(note: NoteName, octave: number): number {
  const noteIndex = getNoteIndex(note);
  const a4Index = 9 + 4 * 12; // 57
  const targetIndex = noteIndex + octave * 12;
  const semitonesFromA4 = targetIndex - a4Index;
  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

export interface PitchResult {
  note: NoteName;
  octave: number;
  frequency: number;
  cents: number; // -50 to +50
}

export function frequencyToPitch(freq: number): PitchResult | null {
  if (!freq || freq < 20 || freq > 5000) return null;

  const midiNum = 69 + 12 * Math.log2(freq / 440);
  const roundedMidi = Math.round(midiNum);
  const cents = Math.round((midiNum - roundedMidi) * 100);

  const noteIndex = (roundedMidi - 12) % 12;
  const octave = Math.floor((roundedMidi - 12) / 12);
  const note = CHROMATIC_NOTES[(noteIndex + 12) % 12];

  return {
    note,
    octave,
    frequency: freq,
    cents,
  };
}
