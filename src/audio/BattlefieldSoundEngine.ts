import { SOUND_MASTER_GAIN } from '../config';
import type { TradeSide } from '../types';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export class BattlefieldSoundEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private lastShotAt = 0;
  private lastImpactAt = 0;
  enabled = false;

  static isSupported() {
    return Boolean(window.AudioContext || window.webkitAudioContext);
  }

  private isContextRunning() {
    return this.context?.state === 'running';
  }

  async setEnabled(enabled: boolean) {
    if (enabled) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;
      if (!this.context) {
        this.context = new AudioContextClass();
        this.master = this.context.createGain();
        this.compressor = this.context.createDynamicsCompressor();
        this.master.gain.value = SOUND_MASTER_GAIN;
        this.compressor.threshold.value = -16;
        this.compressor.knee.value = 18;
        this.compressor.ratio.value = 4;
        this.compressor.attack.value = 0.006;
        this.compressor.release.value = 0.18;
        this.master.connect(this.compressor);
        this.compressor.connect(this.context.destination);
      }
      if (this.context.state === 'suspended') {
        const resumed = await Promise.race<boolean>([
          this.context.resume().then(() => true).catch(() => false),
          new Promise((resolve) => setTimeout(() => resolve(false), 800))
        ]);
        if (!resumed && !this.isContextRunning()) return false;
      }
      this.master?.gain.cancelScheduledValues(this.context.currentTime);
      this.master?.gain.setTargetAtTime(SOUND_MASTER_GAIN, this.context.currentTime, 0.02);
      this.enabled = true;
      this.playActivation();
      return true;
    }
    this.enabled = false;
    if (this.context && this.master) this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.025);
    return false;
  }

  private createOutput(side: TradeSide, volume = 1) {
    if (!this.context || !this.master) throw new Error('Audio engine has not been initialized');
    const gain = this.context.createGain();
    gain.gain.value = volume;
    if (typeof this.context.createStereoPanner === 'function') {
      const panner = this.context.createStereoPanner();
      panner.pan.value = side === 'buy' ? 0.48 : -0.48;
      gain.connect(panner);
      panner.connect(this.master);
    } else {
      gain.connect(this.master);
    }
    return gain;
  }

  private playActivation() {
    if (!this.enabled || !this.context) return;
    const now = this.context.currentTime;
    [440, 660].forEach((frequency, index) => {
      const oscillator = this.context!.createOscillator();
      const gain = this.createOutput('buy', 0.11);
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.11, now + index * 0.08 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.12);
      oscillator.connect(gain);
      oscillator.start(now + index * 0.08);
      oscillator.stop(now + index * 0.08 + 0.13);
    });
  }

  playShot(side: TradeSide, whale: boolean) {
    if (!this.enabled || !this.context) return;
    const nowMs = performance.now();
    if (nowMs - this.lastShotAt < (whale ? 260 : 140)) return;
    this.lastShotAt = nowMs;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.createOutput(side, whale ? 0.28 : 0.085);
    oscillator.type = whale ? 'sawtooth' : 'square';
    oscillator.frequency.setValueAtTime(whale ? 118 : side === 'buy' ? 540 : 420, now);
    oscillator.frequency.exponentialRampToValueAtTime(whale ? 38 : 145, now + (whale ? 0.32 : 0.075));
    gain.gain.setValueAtTime(whale ? 0.28 : 0.085, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (whale ? 0.34 : 0.085));
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + (whale ? 0.35 : 0.09));
    if (whale) this.playNoise(side, 0.18, 0.24, 520);
  }

  playImpact(side: TradeSide, whale: boolean) {
    if (!this.enabled || !this.context) return;
    const nowMs = performance.now();
    if (nowMs - this.lastImpactAt < (whale ? 320 : 170)) return;
    this.lastImpactAt = nowMs;
    this.playNoise(side, whale ? 0.3 : 0.075, whale ? 0.48 : 0.12, whale ? 360 : 900);
    if (!whale) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.createOutput(side, 0.32);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(74, now);
    oscillator.frequency.exponentialRampToValueAtTime(28, now + 0.5);
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + 0.53);
  }

  private playNoise(side: TradeSide, volume: number, duration: number, cutoff: number) {
    if (!this.context) return;
    const frameCount = Math.ceil(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, frameCount, this.context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < frameCount; index += 1) {
      samples[index] = (Math.random() * 2 - 1) * (1 - index / frameCount);
    }
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.createOutput(side, volume);
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    source.start();
  }

  dispose() {
    this.enabled = false;
    if (this.context && this.context.state !== 'closed') void this.context.close();
    this.context = null;
    this.master = null;
    this.compressor = null;
  }
}
