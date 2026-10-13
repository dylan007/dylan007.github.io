import { frequencyToPitch, NoteName, PitchResult } from "./music-theory";

export interface PitchDetectionUpdate {
  pitch: PitchResult | null;
  confidence: number;
  rms: number;
}

export type PitchCallback = (update: PitchDetectionUpdate) => void;

export class PitchDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animationFrameId: number | null = null;
  private buffer: Float32Array<ArrayBuffer> | null = null;
  private callback: PitchCallback | null = null;
  private isRunning: boolean = false;

  // Configuration
  private readonly bufferSize = 2048;
  private readonly minRmsThreshold = 0.015; // Noise gate threshold (1.5% amplitude)
  private readonly yinThreshold = 0.15; // YIN dip threshold

  // Smoothing buffer for stable detection
  private recentNotes: NoteName[] = [];
  private readonly smoothingWindow = 3;

  constructor() {}

  public async start(callback: PitchCallback): Promise<void> {
    if (this.isRunning) return;
    this.callback = callback;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error(
          "Microphone API is only available on secure origins (http://localhost or HTTPS). If you are accessing via a local network IP, please use http://localhost:3000 instead."
        );
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        },
      });

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.bufferSize;
      this.sourceNode.connect(this.analyser);

      this.buffer = new Float32Array(new ArrayBuffer(this.bufferSize * Float32Array.BYTES_PER_ELEMENT));
      this.isRunning = true;
      this.loop();
    } catch (err) {
      this.stop();
      throw err;
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
    this.buffer = null;
    this.callback = null;
    this.recentNotes = [];
  }

  private loop = (): void => {
    if (!this.isRunning || !this.analyser || !this.buffer || !this.audioContext) {
      return;
    }

    this.analyser.getFloatTimeDomainData(this.buffer);

    // Calculate RMS amplitude (volume / energy)
    let sumSquares = 0;
    for (let i = 0; i < this.buffer.length; i++) {
      sumSquares += this.buffer[i] * this.buffer[i];
    }
    const rms = Math.sqrt(sumSquares / this.buffer.length);

    if (rms < this.minRmsThreshold) {
      this.recentNotes = [];
      if (this.callback) {
        this.callback({ pitch: null, confidence: 0, rms });
      }
    } else {
      const sampleRate = this.audioContext.sampleRate;
      const { frequency, probability } = this.detectYin(this.buffer, sampleRate);

      if (probability > 0.65 && frequency > 65 && frequency < 1400) {
        const pitch = frequencyToPitch(frequency);
        if (pitch) {
          // Simple smoothing
          this.recentNotes.push(pitch.note);
          if (this.recentNotes.length > this.smoothingWindow) {
            this.recentNotes.shift();
          }

          if (this.callback) {
            this.callback({
              pitch,
              confidence: probability,
              rms,
            });
          }
        }
      } else {
        if (this.callback) {
          this.callback({ pitch: null, confidence: probability, rms });
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * YIN algorithm for pitch detection
   */
  private detectYin(
    buffer: Float32Array,
    sampleRate: number
  ): { frequency: number; probability: number } {
    const halfBufferSize = Math.floor(buffer.length / 2);
    const yinBuffer = new Float32Array(halfBufferSize);

    // Step 1: Difference Function
    for (let tau = 0; tau < halfBufferSize; tau++) {
      let sum = 0;
      for (let i = 0; i < halfBufferSize; i++) {
        const delta = buffer[i] - buffer[i + tau];
        sum += delta * delta;
      }
      yinBuffer[tau] = sum;
    }

    // Step 2: Cumulative Mean Normalized Difference Function
    yinBuffer[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau < halfBufferSize; tau++) {
      runningSum += yinBuffer[tau];
      yinBuffer[tau] = (yinBuffer[tau] * tau) / runningSum;
    }

    // Step 3: Absolute Thresholding
    let tauEstimate = -1;
    for (let tau = 2; tau < halfBufferSize; tau++) {
      if (yinBuffer[tau] < this.yinThreshold) {
        while (tau + 1 < halfBufferSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
          tau++;
        }
        tauEstimate = tau;
        break;
      }
    }

    if (tauEstimate === -1) {
      // Find global minimum if threshold not passed
      let minTau = 2;
      let minVal = yinBuffer[2];
      for (let tau = 3; tau < halfBufferSize; tau++) {
        if (yinBuffer[tau] < minVal) {
          minVal = yinBuffer[tau];
          minTau = tau;
        }
      }
      tauEstimate = minTau;
    }

    // Step 4: Parabolic Interpolation
    let betterTau: number;
    const x0 = tauEstimate < 1 ? tauEstimate : tauEstimate - 1;
    const x2 = tauEstimate + 1 < halfBufferSize ? tauEstimate + 1 : tauEstimate;

    if (x0 === tauEstimate) {
      if (yinBuffer[tauEstimate] <= yinBuffer[x2]) {
        betterTau = tauEstimate;
      } else {
        betterTau = x2;
      }
    } else if (x2 === tauEstimate) {
      if (yinBuffer[tauEstimate] <= yinBuffer[x0]) {
        betterTau = tauEstimate;
      } else {
        betterTau = x0;
      }
    } else {
      const s0 = yinBuffer[x0];
      const s1 = yinBuffer[tauEstimate];
      const s2 = yinBuffer[x2];
      betterTau = tauEstimate + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
    }

    const frequency = sampleRate / betterTau;
    const probability = 1 - (yinBuffer[tauEstimate] || 0);

    return {
      frequency,
      probability: Math.max(0, Math.min(1, probability)),
    };
  }
}
