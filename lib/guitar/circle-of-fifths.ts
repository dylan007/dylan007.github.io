import { NoteName, getTransposedNote } from "./music-theory";

export interface KeySignature {
  count: number;
  type: "sharp" | "flat" | "none";
  accidentals: string[];
}

export interface CircleSector {
  index: number; // 0 to 11 (0 = C / 12 o'clock)
  majorRoot: NoteName;
  minorRoot: NoteName;
  keySignature: KeySignature;
  angle: number; // in degrees from 12 o'clock (-90 for SVG top)
}

// 12 positions on Circle of Fifths starting from C (top, 12 o'clock) clockwise by ascending perfect fifths
export const CIRCLE_OF_FIFTHS: CircleSector[] = [
  {
    index: 0,
    majorRoot: "C",
    minorRoot: "A",
    keySignature: { count: 0, type: "none", accidentals: [] },
    angle: 0,
  },
  {
    index: 1,
    majorRoot: "G",
    minorRoot: "E",
    keySignature: { count: 1, type: "sharp", accidentals: ["F#"] },
    angle: 30,
  },
  {
    index: 2,
    majorRoot: "D",
    minorRoot: "B",
    keySignature: { count: 2, type: "sharp", accidentals: ["F#", "C#"] },
    angle: 60,
  },
  {
    index: 3,
    majorRoot: "A",
    minorRoot: "F#",
    keySignature: { count: 3, type: "sharp", accidentals: ["F#", "C#", "G#"] },
    angle: 90,
  },
  {
    index: 4,
    majorRoot: "E",
    minorRoot: "C#",
    keySignature: { count: 4, type: "sharp", accidentals: ["F#", "C#", "G#", "D#"] },
    angle: 120,
  },
  {
    index: 5,
    majorRoot: "B",
    minorRoot: "G#",
    keySignature: { count: 5, type: "sharp", accidentals: ["F#", "C#", "G#", "D#", "A#"] },
    angle: 150,
  },
  {
    index: 6,
    majorRoot: "F#",
    minorRoot: "D#",
    keySignature: { count: 6, type: "sharp", accidentals: ["F#", "C#", "G#", "D#", "A#", "E#"] },
    angle: 180,
  },
  {
    index: 7,
    majorRoot: "C#",
    minorRoot: "A#",
    keySignature: { count: 5, type: "flat", accidentals: ["Bb", "Eb", "Ab", "Db", "Gb"] },
    angle: 210,
  },
  {
    index: 8,
    majorRoot: "G#",
    minorRoot: "F",
    keySignature: { count: 4, type: "flat", accidentals: ["Bb", "Eb", "Ab", "Db"] },
    angle: 240,
  },
  {
    index: 9,
    majorRoot: "D#",
    minorRoot: "C",
    keySignature: { count: 3, type: "flat", accidentals: ["Bb", "Eb", "Ab"] },
    angle: 270,
  },
  {
    index: 10,
    majorRoot: "A#",
    minorRoot: "G",
    keySignature: { count: 2, type: "flat", accidentals: ["Bb", "Eb"] },
    angle: 300,
  },
  {
    index: 11,
    majorRoot: "F",
    minorRoot: "D",
    keySignature: { count: 1, type: "flat", accidentals: ["Bb"] },
    angle: 330,
  },
];

export interface DiatonicChord {
  degree: string; // "I", "ii", "iii", "IV", "V", "vi", "vii°"
  root: NoteName;
  chordId: string; // "maj", "min", "dim"
  name: string; // e.g. "C Major", "D Minor", "B Diminished"
  isPrimary: boolean; // I, IV, V are primary
}

export interface ChordProgression {
  id: string;
  name: string;
  degrees: string[]; // ["I", "V", "vi", "IV"]
  description: string;
}

export const COMMON_PROGRESSIONS: ChordProgression[] = [
  {
    id: "pop_axis",
    name: "Pop / 4-Chord Hit",
    degrees: ["I", "V", "vi", "IV"],
    description: "The most famous progression in modern music (Axis of Awesome).",
  },
  {
    id: "classic_rock",
    name: "Classic Rock & Blues",
    degrees: ["I", "IV", "V", "IV"],
    description: "Foundation of rock, blues, and folk.",
  },
  {
    id: "doo_wop",
    name: "50s Doo-Wop",
    degrees: ["I", "vi", "IV", "V"],
    description: "Classic retro progression (Stand By Me, Earth Angel).",
  },
  {
    id: "jazz_turnaround",
    name: "Jazz 2-5-1",
    degrees: ["ii", "V", "I"],
    description: "The quintessential harmonic cadence in jazz and standard songbooks.",
  },
  {
    id: "sentimental",
    name: "Sentimental Ballad",
    degrees: ["I", "iii", "IV", "V"],
    description: "Emotional, cinematic progression.",
  },
  {
    id: "minor_anthem",
    name: "Minor Anthem",
    degrees: ["vi", "IV", "I", "V"],
    description: "Heroic, dramatic minor progression (Zombie, Despacito).",
  },
];

/**
 * Returns the 7 diatonic chords for any Major Key
 */
export function getDiatonicChords(majorRoot: NoteName): DiatonicChord[] {
  // Major scale intervals: 0, 2, 4, 5, 7, 9, 11
  // Triad qualities: Major, minor, minor, Major, Major, minor, diminished
  const degreeRules: { degree: string; interval: number; chordId: string; isPrimary: boolean }[] = [
    { degree: "I", interval: 0, chordId: "maj", isPrimary: true },
    { degree: "ii", interval: 2, chordId: "min", isPrimary: false },
    { degree: "iii", interval: 4, chordId: "min", isPrimary: false },
    { degree: "IV", interval: 5, chordId: "maj", isPrimary: true },
    { degree: "V", interval: 7, chordId: "maj", isPrimary: true },
    { degree: "vi", interval: 9, chordId: "min", isPrimary: false },
    { degree: "vii°", interval: 11, chordId: "dim", isPrimary: false },
  ];

  return degreeRules.map((rule) => {
    const root = getTransposedNote(majorRoot, rule.interval);
    const suffix = rule.chordId === "min" ? "m" : rule.chordId === "dim" ? "dim" : "";
    return {
      degree: rule.degree,
      root,
      chordId: rule.chordId,
      name: `${root}${suffix}`,
      isPrimary: rule.isPrimary,
    };
  });
}

/**
 * Resolves chord progression degrees to actual chords in the selected key
 */
export function getProgressionChords(
  majorRoot: NoteName,
  progression: ChordProgression
): DiatonicChord[] {
  const diatonic = getDiatonicChords(majorRoot);
  const chordMap = new Map<string, DiatonicChord>();
  diatonic.forEach((c) => chordMap.set(c.degree, c));

  return progression.degrees
    .map((deg) => chordMap.get(deg))
    .filter((c): c is DiatonicChord => c !== undefined);
}
