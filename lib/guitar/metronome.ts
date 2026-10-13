export type BeatCallback = (beatNumber: number, time: number) => void;

export class WebAudioMetronome {
  private audioContext: AudioContext | null = null;
  private isRunning: boolean = false;
  private bpm: number = 90;
  private beatsPerBar: number = 4;
  private currentBeat: number = 0;
  private nextBeatTime: number = 0;
  private timerId: number | null = null;
  private onBeatCallback: BeatCallback | null = null;

  private readonly lookaheadMs = 25.0; // scheduling interval in ms
  private readonly scheduleAheadTimeSec = 0.1; // how far ahead to schedule audio in seconds

  constructor(initialBpm: number = 90) {
    this.bpm = initialBpm;
  }

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

  public setBpm(newBpm: number): void {
    this.bpm = Math.max(30, Math.min(300, newBpm));
  }

  public getBpm(): number {
    return this.bpm;
  }

  public async start(onBeat: BeatCallback): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.onBeatCallback = onBeat;
    this.currentBeat = 0;

    const ctx = await this.ensureContext();
    this.nextBeatTime = ctx.currentTime + 0.05;

    this.scheduler();
    this.timerId = window.setInterval(() => this.scheduler(), this.lookaheadMs);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.currentBeat = 0;
  }

  private nextNote(): void {
    const secondsPerBeat = 60.0 / this.bpm;
    this.nextBeatTime += secondsPerBeat;
    this.currentBeat = (this.currentBeat + 1) % this.beatsPerBar;
  }

  private scheduleClick(beatNumber: number, time: number): void {
    if (!this.audioContext) return;
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Beat 1 gets high accent pitch, others lower click
    const isFirstBeat = beatNumber === 0;
    osc.frequency.value = isFirstBeat ? 1200 : 800;

    gain.gain.setValueAtTime(isFirstBeat ? 0.4 : 0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.04);

    // Trigger visual callback slightly ahead or on schedule
    if (this.onBeatCallback) {
      const delayMs = Math.max(0, (time - ctx.currentTime) * 1000);
      window.setTimeout(() => {
        if (this.isRunning && this.onBeatCallback) {
          this.onBeatCallback(beatNumber, time);
        }
      }, delayMs);
    }
  }

  private scheduler(): void {
    if (!this.isRunning || !this.audioContext) return;
    const ctx = this.audioContext;

    while (this.nextBeatTime < ctx.currentTime + this.scheduleAheadTimeSec) {
      this.scheduleClick(this.currentBeat, this.nextBeatTime);
      this.nextNote();
    }
  }
}
