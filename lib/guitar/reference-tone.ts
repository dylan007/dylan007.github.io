class SoundSynthesizer {
  private audioContext: AudioContext | null = null;

  private async ensureContext(): Promise<AudioContext> {
    if (!this.audioContext || this.audioContext.state === "closed") {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();
    }
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
    return this.audioContext;
  }

  /**
   * Internal helper to schedule a plucked note at a specific AudioContext time
   */
  private schedulePluck(
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number = 1.4,
    volumeScale: number = 1.0
  ): void {
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    masterGain.gain.setValueAtTime(0.001, startTime);
    masterGain.gain.linearRampToValueAtTime(0.25 * volumeScale, startTime + 0.012);
    masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    const osc1 = ctx.createOscillator();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(frequency, startTime);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(frequency * 2, startTime);

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.35, startTime);
    osc2Gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.7);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(frequency * 4, startTime);
    filter.frequency.exponentialRampToValueAtTime(frequency * 1.5, startTime + duration);

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    filter.connect(masterGain);

    osc1.start(startTime);
    osc2.start(startTime);

    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  /**
   * Plays a single plucked-string acoustic sound.
   */
  public async playNote(frequency: number, duration: number = 1.4): Promise<void> {
    try {
      const ctx = await this.ensureContext();
      this.schedulePluck(ctx, frequency, ctx.currentTime, duration, 1.0);
    } catch {
      // Graceful fallback if user has not interacted yet
    }
  }

  /**
   * Plays a chord with realistic staggered downstroke strumming
   */
  public async playChord(
    frequencies: number[],
    strumDelayMs: number = 32,
    duration: number = 2.2
  ): Promise<void> {
    if (!frequencies || frequencies.length === 0) return;
    try {
      const ctx = await this.ensureContext();
      const startTime = ctx.currentTime;
      const volumeScale = Math.max(0.4, 1.2 / Math.sqrt(frequencies.length));

      frequencies.forEach((freq, idx) => {
        const noteTime = startTime + (idx * strumDelayMs) / 1000;
        this.schedulePluck(ctx, freq, noteTime, duration, volumeScale);
      });
    } catch {
      // Ignore audio error
    }
  }

  /**
   * Plays chord notes one-by-one as a deliberate arpeggio
   */
  public async playArpeggio(
    frequencies: number[],
    noteDelayMs: number = 220,
    duration: number = 1.6
  ): Promise<void> {
    if (!frequencies || frequencies.length === 0) return;
    try {
      const ctx = await this.ensureContext();
      const startTime = ctx.currentTime;

      frequencies.forEach((freq, idx) => {
        const noteTime = startTime + (idx * noteDelayMs) / 1000;
        this.schedulePluck(ctx, freq, noteTime, duration, 0.85);
      });
    } catch {
      // Ignore audio error
    }
  }

  /**
   * Plays an interval (melodic ascending, descending, or harmonic unison)
   */
  public async playInterval(
    freq1: number,
    freq2: number,
    mode: "ascending" | "descending" | "harmonic" = "ascending",
    noteDuration: number = 1.3
  ): Promise<void> {
    try {
      const ctx = await this.ensureContext();
      const startTime = ctx.currentTime;

      if (mode === "harmonic") {
        this.schedulePluck(ctx, freq1, startTime, noteDuration, 0.7);
        this.schedulePluck(ctx, freq2, startTime, noteDuration, 0.7);
      } else if (mode === "descending") {
        this.schedulePluck(ctx, freq2, startTime, noteDuration, 0.9);
        this.schedulePluck(ctx, freq1, startTime + 0.65, noteDuration, 0.9);
      } else {
        // ascending
        this.schedulePluck(ctx, freq1, startTime, noteDuration, 0.9);
        this.schedulePluck(ctx, freq2, startTime + 0.65, noteDuration, 0.9);
      }
    } catch {
      // Ignore audio error
    }
  }

  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  /**
   * Starts a warm ambient tonic drone tone at specified frequency
   */
  public async startDrone(frequency: number): Promise<void> {
    this.stopDrone();
    try {
      const ctx = await this.ensureContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(frequency * 2.8, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      this.droneOsc = osc;
      this.droneGain = gain;
    } catch {
      // Ignore audio error
    }
  }

  /**
   * Stops the continuous tonic drone
   */
  public stopDrone(): void {
    if (this.droneGain && this.droneOsc && this.audioContext) {
      try {
        const now = this.audioContext.currentTime;
        this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
        this.droneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        this.droneOsc.stop(now + 0.3);
      } catch {
        // Ignore audio error
      }
    }
    this.droneOsc = null;
    this.droneGain = null;
  }

  public isDronePlaying(): boolean {
    return this.droneOsc !== null;
  }
}

export const referenceTonePlayer = new SoundSynthesizer();
