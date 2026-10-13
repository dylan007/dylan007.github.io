"use client";

import React, { useState } from "react";

interface ReferenceItem {
  id: string;
  category: "Circle of Fifths" | "Greek Modes" | "Fretboard Systems" | "Chord Voicings" | "Ear Training";
  title: string;
  subtitle: string;
  summary: string;
  keyFormulas: string[];
  guitarApplication: string;
  citations: {
    author: string;
    work: string;
    year: string;
    details: string;
    link?: string;
  }[];
}

const THEORY_MODULES: ReferenceItem[] = [
  {
    id: "circle_of_fifths",
    category: "Circle of Fifths",
    title: "The Circle of Fifths & Functional Harmony",
    subtitle: "Harmonic Geometry, Key Signatures & Diatonic Chord Families",
    summary:
      "The Circle of Fifths arranges the 12 chromatic pitches into a geometric wheel where clockwise movement represents ascending fifths (adding sharps) and counter-clockwise movement represents descending fifths / ascending fourths (adding flats). In any major key, the 6 core diatonic chords form a tight geometric block on the wheel: the Tonic (I), Subdominant (IV, counter-clockwise neighbor), and Dominant (V, clockwise neighbor) on the outer ring, directly paired with their relative minor counterparts (vi, ii, iii) on the inner ring.",
    keyFormulas: [
      "Clockwise: C → G → D → A → E → B → F#/Gb → Db → Ab → Eb → Bb → F → C (Interval: +7 semitones)",
      "Order of Sharps: F# – C# – G# – D# – A# – E# – B# ('Father Charles Goes Down And Ends Battle')",
      "Order of Flats: Bb – Eb – Ab – Db – Gb – Cb – Fb ('Battle Ends And Down Goes Charles' Father')",
      "Diatonic Family: I (Major), ii (Minor), iii (Minor), IV (Major), V (Major/Dom7), vi (Minor), vii° (Diminished)",
      "Pop Axis Progression: I – V – vi – IV (e.g., C – G – Am – F)",
      "Jazz Turnaround: ii – V – I (e.g., Dm7 – G7 – Cmaj7)",
    ],
    guitarApplication:
      "On guitar, adjacent strings in standard tuning (E-A-D-G, and B-E) are tuned in perfect fourths (counter-clockwise on the wheel). Knowing the Circle of Fifths enables instant transposing of chord progressions across all 12 keys using identical root fret offsets.",
    citations: [
      {
        author: "Diletsky, Nikolay",
        work: "Grammatika Musikiyskago Peniya (Grammar of Musical Singing)",
        year: "1679",
        details: "First historical depiction of the Circle of Fifths ('koleso musikiyskoye' / musical wheel).",
      },
      {
        author: "Heinichen, Johann David",
        work: "Der General-Bass in der Composition",
        year: "1728",
        details: "Formalized the 24-key major and relative minor circular harmonic system.",
      },
      {
        author: "Aldwell, E., Schachter, C., & Cadwallader, A.",
        work: "Harmony and Voice Leading (4th Edition)",
        year: "2018",
        details: "Cengage Learning, pp. 88–112 (Diatonic triads, root motion by fifths, harmonic syntax).",
      },
      {
        author: "Laitz, Steven G.",
        work: "The Complete Musician: An Integrated Approach to Theory, Analysis, and Listening",
        year: "2015",
        details: "Oxford University Press, Chapter 8: 'The Tonic, Dominant, and Subdominant Functions'.",
      },
    ],
  },
  {
    id: "greek_modes",
    category: "Greek Modes",
    title: "The 7 Greek Church Modes & Modal Harmony",
    subtitle: "Diatonic Degree Rotations, Characteristic Color Notes & Modal Vamps",
    summary:
      "A mode is a permutation of the diatonic major scale starting and resolving on a different scale degree. Each of the 7 modes possesses an unmistakable emotional flavor determined by its characteristic interval. While modes can be learned as rotations of a 'parent major scale' (Relative Approach), advanced guitarists practice modes using the Parallel Approach (comparing D Dorian to D Minor, or G Mixolydian to G Major) to immediately target the signature flavor note over chord vamps and tonic drones.",
    keyFormulas: [
      "Ionian (Degree I): 1 2 3 4 5 6 7 (Major) • Flavor: Bright, resolved, classical",
      "Dorian (Degree II): 1 2 b3 4 5 6 b7 (Minor) • Signature: Natural 6th (6) • Flavor: Jazzy, bittersweet minor",
      "Phrygian (Degree III): 1 b2 b3 4 5 b6 b7 (Minor) • Signature: Flat 2nd (b2) • Flavor: Exotic, dark Spanish flamenco, metal",
      "Lydian (Degree IV): 1 2 3 #4 5 6 7 (Major) • Signature: Sharp 4th (#4) • Flavor: Ethereal, spacey, cinematic sci-fi",
      "Mixolydian (Degree V): 1 2 3 4 5 6 b7 (Major) • Signature: Flat 7th (b7) • Flavor: Bluesy, dominant classic rock swagger",
      "Aeolian (Degree VI): 1 2 b3 4 5 b6 b7 (Minor) • Signature: Flat 6th (b6) • Flavor: Melancholic natural minor",
      "Locrian (Degree VII): 1 b2 b3 4 b5 b6 b7 (Diminished) • Signature: Diminished 5th (b5) • Flavor: Unsettled, tense dissonance",
    ],
    guitarApplication:
      "Practice each mode over a continuous tonic root drone (e.g., play D Dorian, D Phrygian, D Lydian all over a low D bass drone). When improvising, emphasize the characteristic note on downbeats to prevent the ear from hearing the mode as its parent major key.",
    citations: [
      {
        author: "Levine, Mark",
        work: "The Jazz Theory Book",
        year: "1995",
        details: "Sher Music Co., Chapter 3: 'Scale Theory & The Modes of the Major Scale', pp. 31–48.",
      },
      {
        author: "Goodrick, Mick",
        work: "The Advancing Guitarist: Toward a Harmony of Science and Art",
        year: "1987",
        details: "Hal Leonard, Section 1: 'Unilinear & Modal Playing on Guitar', pp. 9–28.",
      },
      {
        author: "Russell, George",
        work: "The Lydian Chromatic Concept of Tonal Organization",
        year: "1953 / 2001",
        details: "Concept Publishing. Foundational treatise establishing modal chord-scale theory.",
      },
    ],
  },
  {
    id: "fretboard_geometry",
    category: "Fretboard Systems",
    title: "Fretboard Geometry: CAGED & 3NPS Systems",
    subtitle: "Overcoming the Asymmetric Guitar Tuning with Symmetrical Neck Frameworks",
    summary:
      "The guitar is tuned in fourths (E-A-D-G) with a single major-third offset between strings G and B (G to B is 4 semitones instead of 5). This asymmetry shifts all horizontal patterns by 1 fret on the top two strings. To master the neck, guitar pedagogy relies on two complementary spatial systems: CAGED (5 interlocking chord-shape boxes derived from open chords) and 3NPS (7 three-notes-per-string patterns optimized for fluid scalar runs and modal visualization).",
    keyFormulas: [
      "Standard Tuning: E2 (82.4Hz) – A2 (110.0Hz) – D3 (146.8Hz) – G3 (196.0Hz) – B3 (246.9Hz) – E4 (329.6Hz)",
      "CAGED Sequence: C-Shape → A-Shape → G-Shape → E-Shape → D-Shape (repeats up the neck)",
      "Root Locations in CAGED: E-Shape (Roots on strings 6 & 1), A-Shape (Root on string 5), C-Shape (Root on string 5), D-Shape (Root on string 4), G-Shape (Roots on strings 6 & 1)",
      "3NPS Structure: 7 scale degrees = 7 distinct 3-note shapes covering 18 notes across 6 strings per position",
    ],
    guitarApplication:
      "CAGED is ideal for visualizing chord voicings, arpeggios, and rhythmic double-stops around vocal melodies. 3NPS is ideal for lead soloing, alternate picking, legato hammer-ons/pull-offs, and rapid cross-neck modal navigation.",
    citations: [
      {
        author: "Edwards, Bill",
        work: "Fretboard Logic SE: The Reasoning Behind the Guitar's Unique Tuning",
        year: "1992",
        details: "Bill Edwards Publishing. The definitive formal exposition of the CAGED system.",
      },
      {
        author: "Denyer, Ralph",
        work: "The Guitar Handbook",
        year: "1992",
        details: "Pan Books / Alfred A. Knopf, pp. 110–135 (Fretboard anatomy, movable chords, and box patterns).",
      },
      {
        author: "Stetina, Troy",
        work: "Speed Mechanics for Lead Guitar",
        year: "1999",
        details: "Hal Leonard, Section 2: 'Three-Notes-Per-String Scale Geometry & Picking Mechanics'.",
      },
    ],
  },
  {
    id: "chord_voicings",
    category: "Chord Voicings",
    title: "Chord Construction & Movable Voicings",
    subtitle: "Triad Anatomy, Seventh Chords & Movable Barre Ergonomics",
    summary:
      "Chords are built by stacking thirds above a root pitch. Triads consist of Root, 3rd, and 5th; 7th chords add the 7th interval. On guitar, notes of a chord are rarely voiced in pure close-position keyboard order (Root-3rd-5th); rather, they are distributed across strings as drop voicings or doubled across octaves. Movable barre chords utilize the index finger as a movable nut, enabling any open chord shape (predominantly E and A forms) to be translated to all 12 chromatic frets.",
    keyFormulas: [
      "Major Triad: Root + Major 3rd (4 st) + Perfect 5th (7 st) • Intervals: 1 – 3 – 5",
      "Minor Triad: Root + Minor 3rd (3 st) + Perfect 5th (7 st) • Intervals: 1 – b3 – 5",
      "Diminished Triad: Root + Minor 3rd (3 st) + Diminished 5th (6 st) • Intervals: 1 – b3 – b5",
      "Dominant 7th: Root + Major 3rd + Perfect 5th + Minor 7th • Intervals: 1 – 3 – 5 – b7",
      "Major 7th: Root + Major 3rd + Perfect 5th + Major 7th • Intervals: 1 – 3 – 5 – 7",
      "Minor 7th: Root + Minor 3rd + Perfect 5th + Minor 7th • Intervals: 1 – b3 – 5 – b7",
      "Half-Diminished (m7b5): Root + Minor 3rd + Diminished 5th + Minor 7th • Intervals: 1 – b3 – b5 – b7",
      "Suspended (Sus4 / Sus2): 3rd replaced by Perfect 4th (1 – 4 – 5) or Major 2nd (1 – 2 – 5)",
    ],
    guitarApplication:
      "Finger economy: When barring, arch the intermediate knuckles to allow open strings to ring freely. The Root-6 barre chord uses the E-shape (root on low E string); the Root-5 barre chord uses the A-shape (root on A string).",
    citations: [
      {
        author: "Greene, Ted",
        work: "Chord Chemistry",
        year: "1971",
        details: "Alfred Music Publishing. The legendary master reference on guitar voicings and voice leading.",
      },
      {
        author: "Fisher, Jody",
        work: "Jazz Guitar Harmony: The Complete Guide to Chord Voicings and Substitutions",
        year: "2002",
        details: "Alfred Music, Chapters 1–4 (Drop-2, Drop-3, voice leading and chord families).",
      },
      {
        author: "Kostka, S., Payne, D., & Almén, B.",
        work: "Tonal Harmony with an Introduction to Twentieth-Century Music (8th Edition)",
        year: "2018",
        details: "McGraw-Hill, Chapter 3: 'Triads and Seventh Chords', pp. 38–54.",
      },
    ],
  },
  {
    id: "ear_training",
    category: "Ear Training",
    title: "Interval Recognition & Psychoacoustics",
    subtitle: "Frequency Ratios, Relative Pitch Memory & Musical Mnemonics",
    summary:
      "Ear training is the neural conditioning of recognizing musical distances (intervals) and harmonic density (chord qualities) through auditory perception alone. Every musical interval corresponds to an acoustic frequency ratio. By associating each interval with iconic melodic openings (mnemonics), musicians translate abstract frequencies into immediate pitch recognition.",
    keyFormulas: [
      "Minor 2nd (1 st, ratio 16:15): 'Jaws' Theme, 'Für Elise'",
      "Major 2nd (2 st, ratio 9:8): 'Happy Birthday', 'Frère Jacques'",
      "Minor 3rd (3 st, ratio 6:5): 'Greensleeves', 'Smoke on the Water' (riff start)",
      "Major 3rd (4 st, ratio 5:4): 'When the Saints Go Marching In', 'Kumbaya'",
      "Perfect 4th (5 st, ratio 4:3): 'Here Comes the Bride', 'Amazing Grace'",
      "Tritone / Dim 5th (6 st, ratio 45:32): 'The Simpsons' Theme, 'Maria' (West Side Story)",
      "Perfect 5th (7 st, ratio 3:2): 'Star Wars' Main Theme, 'Twinkle Twinkle Little Star'",
      "Minor 6th (8 st, ratio 8:5): 'The Entertainer', 'Conquest of Paradise'",
      "Major 6th (9 st, ratio 5:3): 'NBC Chimes', 'My Bonnie Lies Over the Ocean'",
      "Minor 7th (10 st, ratio 16:9): 'Somewhere' (West Side Story), 'The Winner Takes It All'",
      "Major 7th (11 st, ratio 15:8): 'Take On Me' (chorus octave jump anticipation), 'Superman' theme motif",
      "Perfect Octave (12 st, ratio 2:1): 'Somewhere Over the Rainbow'",
    ],
    guitarApplication:
      "Sing or vocalize each note before plucking it on the fretboard. When your vocal cord tension matches the pitch in your mind, your fingers will instinctively find the correct fret without visual guessing.",
    citations: [
      {
        author: "Wyatt, K., Schroeder, C., & Elliott, J.",
        work: "Ear Training for the Contemporary Musician",
        year: "2005",
        details: "Musicians Institute Press / Hal Leonard. Comprehensive contemporary ear training syllabus.",
      },
      {
        author: "Roederer, Juan G.",
        work: "The Physics and Psychophysics of Music: An Introduction (4th Edition)",
        year: "2008",
        details: "Springer-Verlag, Chapter 2: 'Sound Waves, Pure Tones, and Hearing Perception', pp. 28–64.",
      },
      {
        author: "Benward, Bruce & Kolosick, J. Timothy",
        work: "Ear Training: A Technique for Listening (7th Edition)",
        year: "2010",
        details: "McGraw-Hill, Units 1–8: Melodic, harmonic, and rhythmic dictation methods.",
      },
    ],
  },
];

export const TheoryReferences: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    "All",
    "Circle of Fifths",
    "Greek Modes",
    "Fretboard Systems",
    "Chord Voicings",
    "Ear Training",
  ];

  const filteredModules = THEORY_MODULES.filter((mod) => {
    const matchesCategory = activeCategory === "All" || mod.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.citations.some(
        (c) =>
          c.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.work.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-4 sm:p-6 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--rule)] pb-4">
          <div>
            <span className="text-xs font-mono font-medium text-[var(--accent)] uppercase tracking-wider">
              Music Theory Foundations
            </span>
            <h2 className="text-2xl sm:text-3xl font-departure font-semibold text-[var(--ink)] mt-0.5">
              Theory References & Citations
            </h2>
          </div>
          <div className="text-xs font-mono text-[var(--ink-mute)]">
            Academic &amp; Pedagogical Foundations for Guitarists
          </div>
        </div>

        <p className="text-sm font-serif text-[var(--ink-body)] leading-relaxed">
          The Guitar Practice Studio is built upon established harmonic foundations from classical
          voice leading, jazz chord-scale theory, and ergonomic fretboard geometry. Explore the
          theoretical rules, formulas, guitar applications, and formal citations for each concept below.
        </p>

        {/* Filter Tabs & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded border transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white font-semibold shadow-2xs"
                    : "border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--accent)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search concepts or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--rule)] rounded-md px-3 py-1.5 text-xs font-mono text-[var(--ink)] placeholder:text-[var(--ink-mute)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      {/* Module Cards */}
      <div className="space-y-6">
        {filteredModules.map((item) => (
          <div
            key={item.id}
            id={item.id}
            className="rounded-lg border border-[var(--rule)] bg-[var(--bg-card)] p-5 sm:p-6 space-y-4 shadow-sm"
          >
            {/* Header */}
            <div className="border-b border-[var(--rule)] pb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--bg)] border border-[var(--rule)] text-[var(--accent)] uppercase">
                  {item.category}
                </span>
              </div>
              <h3 className="text-xl font-departure font-bold text-[var(--ink)]">
                {item.title}
              </h3>
              <p className="text-xs font-mono text-[var(--ink-mute)] mt-0.5">
                {item.subtitle}
              </p>
            </div>

            {/* Theoretical Summary */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--ink)]">
                Theoretical Overview
              </h4>
              <p className="text-sm font-serif text-[var(--ink-body)] leading-relaxed">
                {item.summary}
              </p>
            </div>

            {/* Formulas & Bullet Points */}
            <div className="space-y-1.5 p-3.5 rounded-md bg-[var(--bg)] border border-[var(--rule)] font-mono text-xs">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)] mb-2">
                Core Formulas &amp; Structural Rules
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-[var(--ink-body)] leading-relaxed">
                {item.keyFormulas.map((f, i) => (
                  <li key={i} className="text-xs">
                    <span className="font-sans">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Guitar Practical Application */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--accent-teal)]">
                Fretboard &amp; Guitar Application
              </h4>
              <p className="text-sm font-serif text-[var(--ink-body)] leading-relaxed">
                {item.guitarApplication}
              </p>
            </div>

            {/* Academic & Historical Citations */}
            <div className="pt-3 border-t border-[var(--rule)] space-y-2">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--ink-mute)]">
                Authoritative References &amp; Treatises
              </h4>
              <ol className="space-y-2 list-decimal list-inside font-serif text-xs text-[var(--ink-body)] leading-relaxed">
                {item.citations.map((c, idx) => (
                  <li key={idx} className="pl-1">
                    <strong>{c.author}</strong> ({c.year}). <em>{c.work}</em>.{" "}
                    <span className="text-[var(--ink-mute)] font-sans text-[11px]">
                      {c.details}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
