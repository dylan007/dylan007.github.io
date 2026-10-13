import { NoteName, getNoteIndex, noteToFrequency } from "./music-theory";

export interface ChordVoicing {
  id: string;
  name: string; // e.g. "Open Position", "Root 6 Barre (E-Shape)", "Root 5 Barre (A-Shape)"
  root: NoteName;
  chordId: string; // "maj", "min", "dom7", "maj7", "min7", "dim", "aug", "sus2", "sus4", "power"
  // 6 strings from low E (string 6, index 0) to high E (string 1, index 5).
  // -1 = muted (X), 0 = open (O), 1..22 = fret number
  frets: number[];
  // Suggested fingers: 0 = none / open / muted, 1 = index, 2 = middle, 3 = ring, 4 = pinky, 'T' = thumb
  fingers: (number | string)[];
  baseFret: number; // Starting fret to display on chord box (1 for open)
  barres?: { fromString: number; toString: number; fret: number }[]; // 1-indexed string numbers (1=high E, 6=low E)
}

/**
 * Standard open chord voicing database for common roots
 */
export const OPEN_CHORD_PRESETS: Record<string, Omit<ChordVoicing, "id" | "root" | "chordId">[]> = {
  // C Chords
  "C-maj": [
    {
      name: "Open C Shape",
      frets: [-1, 3, 2, 0, 1, 0],
      fingers: [0, 3, 2, 0, 1, 0],
      baseFret: 1,
    },
  ],
  "C-dom7": [
    {
      name: "Open C7 Shape",
      frets: [-1, 3, 2, 3, 1, 0],
      fingers: [0, 3, 2, 4, 1, 0],
      baseFret: 1,
    },
  ],
  "C-maj7": [
    {
      name: "Open Cmaj7 Shape",
      frets: [-1, 3, 2, 0, 0, 0],
      fingers: [0, 3, 2, 0, 0, 0],
      baseFret: 1,
    },
  ],

  // A Chords
  "A-maj": [
    {
      name: "Open A Shape",
      frets: [-1, 0, 2, 2, 2, 0],
      fingers: [0, 0, 1, 2, 3, 0],
      baseFret: 1,
    },
  ],
  "A-min": [
    {
      name: "Open Am Shape",
      frets: [-1, 0, 2, 2, 1, 0],
      fingers: [0, 0, 2, 3, 1, 0],
      baseFret: 1,
    },
  ],
  "A-dom7": [
    {
      name: "Open A7 Shape",
      frets: [-1, 0, 2, 0, 2, 0],
      fingers: [0, 0, 2, 0, 3, 0],
      baseFret: 1,
    },
  ],
  "A-min7": [
    {
      name: "Open Am7 Shape",
      frets: [-1, 0, 2, 0, 1, 0],
      fingers: [0, 0, 2, 0, 1, 0],
      baseFret: 1,
    },
  ],
  "A-sus2": [
    {
      name: "Open Asus2 Shape",
      frets: [-1, 0, 2, 2, 0, 0],
      fingers: [0, 0, 1, 2, 0, 0],
      baseFret: 1,
    },
  ],
  "A-sus4": [
    {
      name: "Open Asus4 Shape",
      frets: [-1, 0, 2, 2, 3, 0],
      fingers: [0, 0, 1, 2, 3, 0],
      baseFret: 1,
    },
  ],

  // G Chords
  "G-maj": [
    {
      name: "Open G Shape",
      frets: [3, 2, 0, 0, 0, 3],
      fingers: [2, 1, 0, 0, 0, 3],
      baseFret: 1,
    },
    {
      name: "Open G (4-Finger)",
      frets: [3, 2, 0, 0, 3, 3],
      fingers: [2, 1, 0, 0, 3, 4],
      baseFret: 1,
    },
  ],
  "G-dom7": [
    {
      name: "Open G7 Shape",
      frets: [3, 2, 0, 0, 0, 1],
      fingers: [3, 2, 0, 0, 0, 1],
      baseFret: 1,
    },
  ],

  // E Chords
  "E-maj": [
    {
      name: "Open E Shape",
      frets: [0, 2, 2, 1, 0, 0],
      fingers: [0, 2, 3, 1, 0, 0],
      baseFret: 1,
    },
  ],
  "E-min": [
    {
      name: "Open Em Shape",
      frets: [0, 2, 2, 0, 0, 0],
      fingers: [0, 2, 3, 0, 0, 0],
      baseFret: 1,
    },
  ],
  "E-dom7": [
    {
      name: "Open E7 Shape",
      frets: [0, 2, 0, 1, 0, 0],
      fingers: [0, 2, 0, 1, 0, 0],
      baseFret: 1,
    },
  ],
  "E-min7": [
    {
      name: "Open Em7 Shape",
      frets: [0, 2, 0, 0, 0, 0],
      fingers: [0, 2, 0, 0, 0, 0],
      baseFret: 1,
    },
  ],

  // D Chords
  "D-maj": [
    {
      name: "Open D Shape",
      frets: [-1, -1, 0, 2, 3, 2],
      fingers: [0, 0, 0, 1, 3, 2],
      baseFret: 1,
    },
  ],
  "D-min": [
    {
      name: "Open Dm Shape",
      frets: [-1, -1, 0, 2, 3, 1],
      fingers: [0, 0, 0, 2, 3, 1],
      baseFret: 1,
    },
  ],
  "D-dom7": [
    {
      name: "Open D7 Shape",
      frets: [-1, -1, 0, 2, 1, 2],
      fingers: [0, 0, 0, 2, 1, 3],
      baseFret: 1,
    },
  ],
  "D-maj7": [
    {
      name: "Open Dmaj7 Shape",
      frets: [-1, -1, 0, 2, 2, 2],
      fingers: [0, 0, 0, 1, 1, 1],
      baseFret: 1,
    },
  ],
  "D-sus2": [
    {
      name: "Open Dsus2 Shape",
      frets: [-1, -1, 0, 2, 3, 0],
      fingers: [0, 0, 0, 1, 2, 0],
      baseFret: 1,
    },
  ],
  "D-sus4": [
    {
      name: "Open Dsus4 Shape",
      frets: [-1, -1, 0, 2, 3, 3],
      fingers: [0, 0, 0, 1, 2, 3],
      baseFret: 1,
    },
  ],
};

/**
 * Movable Barre Templates (offsets relative to root fret on 6th or 5th string)
 */
interface MovableTemplate {
  name: string;
  rootString: 6 | 5; // String 6 (low E) or String 5 (A string)
  fretOffsets: number[]; // 6 strings offset from root fret (-1 means muted)
  fingers: (number | string)[];
  hasBarre: boolean;
  barreSpan?: { fromString: number; toString: number };
}

const MOVABLE_TEMPLATES: Record<string, MovableTemplate[]> = {
  maj: [
    {
      name: "Root 6 Barre (E-Shape)",
      rootString: 6,
      fretOffsets: [0, 2, 2, 1, 0, 0],
      fingers: [1, 3, 4, 2, 1, 1],
      hasBarre: true,
      barreSpan: { fromString: 6, toString: 1 },
    },
    {
      name: "Root 5 Barre (A-Shape)",
      rootString: 5,
      fretOffsets: [-1, 0, 2, 2, 2, 0],
      fingers: [0, 1, 2, 3, 4, 1],
      hasBarre: true,
      barreSpan: { fromString: 5, toString: 1 },
    },
  ],
  min: [
    {
      name: "Root 6 Barre (Em-Shape)",
      rootString: 6,
      fretOffsets: [0, 2, 2, 0, 0, 0],
      fingers: [1, 3, 4, 1, 1, 1],
      hasBarre: true,
      barreSpan: { fromString: 6, toString: 1 },
    },
    {
      name: "Root 5 Barre (Am-Shape)",
      rootString: 5,
      fretOffsets: [-1, 0, 2, 2, 1, 0],
      fingers: [0, 1, 3, 4, 2, 1],
      hasBarre: true,
      barreSpan: { fromString: 5, toString: 1 },
    },
  ],
  dom7: [
    {
      name: "Root 6 Barre (E7-Shape)",
      rootString: 6,
      fretOffsets: [0, 2, 0, 1, 0, 0],
      fingers: [1, 3, 1, 2, 1, 1],
      hasBarre: true,
      barreSpan: { fromString: 6, toString: 1 },
    },
    {
      name: "Root 5 Barre (A7-Shape)",
      rootString: 5,
      fretOffsets: [-1, 0, 2, 0, 2, 0],
      fingers: [0, 1, 3, 1, 4, 1],
      hasBarre: true,
      barreSpan: { fromString: 5, toString: 1 },
    },
  ],
  maj7: [
    {
      name: "Root 6 Maj7 Shape",
      rootString: 6,
      fretOffsets: [0, -1, 1, 1, 0, -1],
      fingers: [1, 0, 3, 4, 2, 0],
      hasBarre: false,
    },
    {
      name: "Root 5 Barre (Amaj7-Shape)",
      rootString: 5,
      fretOffsets: [-1, 0, 2, 1, 2, 0],
      fingers: [0, 1, 3, 2, 4, 1],
      hasBarre: true,
      barreSpan: { fromString: 5, toString: 1 },
    },
  ],
  min7: [
    {
      name: "Root 6 Barre (Em7-Shape)",
      rootString: 6,
      fretOffsets: [0, 2, 0, 0, 0, 0],
      fingers: [1, 3, 1, 1, 1, 1],
      hasBarre: true,
      barreSpan: { fromString: 6, toString: 1 },
    },
    {
      name: "Root 5 Barre (Am7-Shape)",
      rootString: 5,
      fretOffsets: [-1, 0, 2, 0, 1, 0],
      fingers: [0, 1, 3, 1, 2, 1],
      hasBarre: true,
      barreSpan: { fromString: 5, toString: 1 },
    },
  ],
  dim: [
    {
      name: "Root 5 Diminished",
      rootString: 5,
      fretOffsets: [-1, 0, 1, 2, 1, -1],
      fingers: [0, 1, 2, 4, 3, 0],
      hasBarre: false,
    },
  ],
  dim7: [
    {
      name: "Movable Diminished 7th",
      rootString: 5,
      fretOffsets: [-1, 0, 1, -1, 1, 2],
      fingers: [0, 1, 2, 0, 3, 4],
      hasBarre: false,
    },
  ],
  m7b5: [
    {
      name: "Half-Diminished (Root 5)",
      rootString: 5,
      fretOffsets: [-1, 0, 1, 0, 1, -1],
      fingers: [0, 1, 2, 1, 3, 0],
      hasBarre: false,
    },
  ],
  power: [
    {
      name: "Root 6 Power Chord (5)",
      rootString: 6,
      fretOffsets: [0, 2, 2, -1, -1, -1],
      fingers: [1, 3, 4, 0, 0, 0],
      hasBarre: false,
    },
    {
      name: "Root 5 Power Chord (5)",
      rootString: 5,
      fretOffsets: [-1, 0, 2, 2, -1, -1],
      fingers: [0, 1, 3, 4, 0, 0],
      hasBarre: false,
    },
  ],
  sus2: [
    {
      name: "Root 5 Sus2 Barre",
      rootString: 5,
      fretOffsets: [-1, 0, 2, 2, 0, 0],
      fingers: [0, 1, 3, 4, 1, 1],
      hasBarre: true,
      barreSpan: { fromString: 5, toString: 1 },
    },
  ],
  sus4: [
    {
      name: "Root 6 Sus4 Barre",
      rootString: 6,
      fretOffsets: [0, 2, 2, 2, 0, 0],
      fingers: [1, 2, 3, 4, 1, 1],
      hasBarre: true,
      barreSpan: { fromString: 6, toString: 1 },
    },
    {
      name: "Root 5 Sus4 Barre",
      rootString: 5,
      fretOffsets: [-1, 0, 2, 2, 3, 0],
      fingers: [0, 1, 2, 3, 4, 1],
      hasBarre: true,
      barreSpan: { fromString: 5, toString: 1 },
    },
  ],
};

/**
 * Calculates fret of a given root note on String 6 (E) or String 5 (A)
 */
export function getRootFretOnString(root: NoteName, stringNumber: 6 | 5): number {
  const rootIdx = getNoteIndex(root);
  const openStringNote = stringNumber === 6 ? "E" : "A";
  const openIdx = getNoteIndex(openStringNote);
  return (rootIdx - openIdx + 12) % 12;
}

/**
 * Returns all playable chord voicings for a given root note and chord ID.
 */
export function getChordVoicings(root: NoteName, chordId: string): ChordVoicing[] {
  const voicings: ChordVoicing[] = [];
  const presetKey = `${root}-${chordId}`;

  // 1. Add preset open voicings if available
  if (OPEN_CHORD_PRESETS[presetKey]) {
    OPEN_CHORD_PRESETS[presetKey].forEach((preset, idx) => {
      voicings.push({
        id: `${presetKey}-open-${idx}`,
        name: preset.name,
        root,
        chordId,
        frets: preset.frets,
        fingers: preset.fingers,
        baseFret: preset.baseFret,
      });
    });
  }

  // 2. Add movable barre voicings based on root on string 6 and string 5
  const templates = MOVABLE_TEMPLATES[chordId] || MOVABLE_TEMPLATES["maj"];

  templates.forEach((template, idx) => {
    const rootFret = getRootFretOnString(root, template.rootString);
    // Transpose template
    const frets = template.fretOffsets.map((offset) => {
      if (offset === -1) return -1;
      return rootFret + offset;
    });

    // Determine base fret (lowest non-zero fret)
    const activeFrets = frets.filter((f) => f > 0);
    const minFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 1;
    const baseFret = minFret > 2 ? minFret : 1;

    // Check if within standard 16 fret span
    if (Math.max(...frets) <= 18) {
      // Don't duplicate if identical to an already added open chord
      const isDuplicate = voicings.some(
        (v) => JSON.stringify(v.frets) === JSON.stringify(frets)
      );

      if (!isDuplicate) {
        voicings.push({
          id: `${presetKey}-movable-${template.rootString}-${idx}`,
          name: `${template.name} (Fret ${rootFret === 0 ? "Open" : rootFret})`,
          root,
          chordId,
          frets,
          fingers: template.fingers,
          baseFret,
          barres:
            template.hasBarre && rootFret > 0 && template.barreSpan
              ? [
                  {
                    fromString: template.barreSpan.fromString,
                    toString: template.barreSpan.toString,
                    fret: rootFret,
                  },
                ]
              : undefined,
        });
      }
    }
  });

  return voicings;
}

/**
 * Calculates audio frequencies of notes played in a chord voicing (skipping muted strings)
 * Low E (string 6) to High E (string 1)
 */
export function getVoicingFrequencies(voicing: ChordVoicing): number[] {
  // Standard tuning base octaves: E2, A2, D3, G3, B3, E4
  const standardStrings: { note: NoteName; octave: number }[] = [
    { note: "E", octave: 2 },
    { note: "A", octave: 2 },
    { note: "D", octave: 3 },
    { note: "G", octave: 3 },
    { note: "B", octave: 3 },
    { note: "E", octave: 4 },
  ];

  const frequencies: number[] = [];

  voicing.frets.forEach((fret, stringIdx) => {
    if (fret >= 0) {
      const open = standardStrings[stringIdx];
      const openIdx = getNoteIndex(open.note);
      const totalSemitones = openIdx + open.octave * 12 + fret;
      const targetNoteIdx = (totalSemitones % 12 + 12) % 12;
      const targetOctave = Math.floor(totalSemitones / 12);
      const targetNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][targetNoteIdx] as NoteName;
      frequencies.push(noteToFrequency(targetNote, targetOctave));
    }
  });

  return frequencies;
}
