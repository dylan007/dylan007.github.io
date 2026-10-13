import {
  NoteName,
  TuningDefinition,
  CHROMATIC_NOTES,
  getNoteIndex,
  getIntervalLabel,
  noteToFrequency,
} from "./music-theory";

export interface FretboardPosition {
  stringIndex: number; // 0 = lowest pitch string (e.g. Low E), 5 = highest pitch (e.g. High E)
  stringNumber: number; // 6 (low) down to 1 (high)
  fret: number; // 0 = open string, 1..22
  note: NoteName;
  octave: number;
  frequency: number;
  interval: string; // Interval relative to active root
  isRoot: boolean;
  isInScaleOrChord: boolean;
  cagedBox?: number; // 1 to 5 if part of CAGED
  threeNpsBox?: number; // 1 to 7 if part of 3NPS
}

export type PositionMode = "full" | "caged" | "3nps";

export const FRET_COUNT = 22;
export const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21];
export const DOUBLE_FRET_MARKERS = [12];

/**
 * Calculates note for a given open note + octave + fret offset.
 */
export function getFretNote(
  openNote: NoteName,
  openOctave: number,
  fret: number
): { note: NoteName; octave: number; frequency: number } {
  const openNoteIdx = getNoteIndex(openNote);
  const totalSemitones = openNoteIdx + openOctave * 12 + fret;
  const noteIdx = (totalSemitones % 12 + 12) % 12;
  const octave = Math.floor(totalSemitones / 12);
  const note = CHROMATIC_NOTES[noteIdx];
  const frequency = noteToFrequency(note, octave);
  return { note, octave, frequency };
}

/**
 * Generates all positions across the fretboard for a given tuning.
 */
export function generateFretboard(
  tuning: TuningDefinition,
  root: NoteName,
  activeNotes: Set<NoteName>,
  fretCount: number = FRET_COUNT
): FretboardPosition[] {
  const positions: FretboardPosition[] = [];

  // strings are ordered 0 (lowest string e.g. 6th string) to 5 (highest string e.g. 1st string)
  tuning.strings.forEach((str, stringIndex) => {
    const stringNumber = 6 - stringIndex;

    for (let fret = 0; fret <= fretCount; fret++) {
      const { note, octave, frequency } = getFretNote(str.note, str.octave, fret);
      const isRoot = note === root;
      const isInScaleOrChord = activeNotes.has(note);
      const interval = isInScaleOrChord ? getIntervalLabel(root, note) : "";

      positions.push({
        stringIndex,
        stringNumber,
        fret,
        note,
        octave,
        frequency,
        interval,
        isRoot,
        isInScaleOrChord,
      });
    }
  });

  return positions;
}

/**
 * Calculates CAGED box index (1 to 5) for Major / Minor / Pentatonic scale positions.
 * Uses fret spans based on root location.
 * Box 1 = C-shape / E-shape depending on standard CAGED ordering.
 * Standard CAGED 5 box fret ranges roughly span 4-5 frets each.
 */
export function getCagedFretRange(
  root: NoteName,
  boxNumber: number // 1, 2, 3, 4, 5
): { minFret: number; maxFret: number } {
  // In standard tuning EADGBE:
  // Root on 6th string: Fret R_6 = (getNoteIndex(root) - getNoteIndex('E') + 12) % 12
  // CAGED positions relative to 6th string root (E-shape = Box 1, D-shape = Box 2, C-shape = Box 3, A-shape = Box 4, G-shape = Box 5)
  const rootIndex = getNoteIndex(root);
  const lowEIndex = getNoteIndex("E");
  const rootFretString6 = (rootIndex - lowEIndex + 12) % 12;

  // Offsets for 5 boxes around the neck
  // Box 1 (E-shape): fret centered on rootFretString6 (span -1 to +3)
  // Box 2 (D-shape): fret span +2 to +5
  // Box 3 (C-shape): fret span +4 to +8
  // Box 4 (A-shape): fret span +7 to +10
  // Box 5 (G-shape): fret span +9 to +12
  const boxOffsets = [
    { start: -1, end: 3 },  // Box 1
    { start: 2, end: 6 },   // Box 2
    { start: 4, end: 8 },   // Box 3
    { start: 7, end: 11 },  // Box 4
    { start: 9, end: 13 },  // Box 5
  ];

  const offset = boxOffsets[(boxNumber - 1) % 5];
  let minFret = rootFretString6 + offset.start;
  let maxFret = rootFretString6 + offset.end;

  // Wrap/normalize if it falls below 0 or goes past FRET_COUNT
  if (minFret < 0) {
    minFret += 12;
    maxFret += 12;
  }
  if (maxFret > FRET_COUNT) {
    minFret -= 12;
    maxFret -= 12;
  }

  return {
    minFret: Math.max(0, minFret),
    maxFret: Math.min(FRET_COUNT, maxFret),
  };
}

/**
 * Calculates 3NPS (3 Notes Per String) box fret ranges (1 to 7).
 */
export function getThreeNpsFretRange(
  root: NoteName,
  boxNumber: number, // 1 to 7
  customIntervals?: number[]
): { minFret: number; maxFret: number } {
  const rootIndex = getNoteIndex(root);
  const lowEIndex = getNoteIndex("E");
  const rootFretString6 = (rootIndex - lowEIndex + 12) % 12;

  // 7 patterns starting from each degree of the scale
  const stepOffsets =
    customIntervals && customIntervals.length >= 7
      ? customIntervals
      : [0, 2, 4, 5, 7, 9, 11];
  const baseOffset = stepOffsets[(boxNumber - 1) % stepOffsets.length];

  let minFret = rootFretString6 + baseOffset - 1;
  let maxFret = minFret + 5;

  if (minFret < 0) {
    minFret += 12;
    maxFret += 12;
  }
  if (maxFret > FRET_COUNT) {
    minFret -= 12;
    maxFret -= 12;
  }

  return {
    minFret: Math.max(0, minFret),
    maxFret: Math.min(FRET_COUNT, maxFret),
  };
}

/**
 * Filter positions based on position mode (full, caged, 3nps)
 */
export function filterPositions(
  positions: FretboardPosition[],
  mode: PositionMode,
  root: NoteName,
  boxNumber: number,
  customIntervals?: number[]
): FretboardPosition[] {
  if (mode === "full") {
    return positions.filter((p) => p.isInScaleOrChord);
  }

  let minFret = 0;
  let maxFret = FRET_COUNT;

  if (mode === "caged") {
    const range = getCagedFretRange(root, boxNumber);
    minFret = range.minFret;
    maxFret = range.maxFret;
  } else if (mode === "3nps") {
    const range = getThreeNpsFretRange(root, boxNumber, customIntervals);
    minFret = range.minFret;
    maxFret = range.maxFret;
  }

  return positions.filter(
    (p) => p.isInScaleOrChord && p.fret >= minFret && p.fret <= maxFret
  );
}

/**
 * Generates an ordered sequence of notes for guided practice mode.
 * Sorts from lowest string (string 0, low pitch) to highest string (string 5),
 * ascending frets, then descending back down.
 */
export function getGuidedSequence(activePositions: FretboardPosition[]): FretboardPosition[] {
  // String by string ascending from lowest to highest pitch:
  const stringAscending = [...activePositions].sort((a, b) => {
    if (a.stringIndex !== b.stringIndex) {
      return a.stringIndex - b.stringIndex; // string 0 first (low E) to 5 (high E)
    }
    return a.fret - b.fret;
  });

  // Create ascending then descending sequence
  const descending = [...stringAscending].reverse().slice(1);
  return [...stringAscending, ...descending];
}
