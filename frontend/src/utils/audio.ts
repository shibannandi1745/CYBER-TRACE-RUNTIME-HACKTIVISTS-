/**
 * CyberTrace AI - High Reliability Cyber Security Emergency Siren Engine
 * Uses Web Audio API Synthesizer (Oscillators + Gain Envelopes) + In-Memory PCM WAV Fallback.
 */

let sharedAudioCtx: AudioContext | null = null;
let activeOscillators: OscillatorNode[] = [];
let activeGainNodes: GainNode[] = [];
let soundTimeoutId: any = null;
let isPlayingSiren = false;

// Generate an in-memory 16-bit 44.1kHz mono PCM WAV Blob containing a crisp 3-pulse siren
const generateSirenWavBlob = (): Blob => {
  const sampleRate = 44100;
  const pulseDuration = 0.5;
  const pauseDuration = 0.15;
  const pulseCount = 3;
  const totalDuration = (pulseDuration + pauseDuration) * pulseCount;
  const totalSamples = Math.floor(sampleRate * totalDuration);

  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);

  // RIFF Chunk Descriptor
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + totalSamples * 2, true);
  writeString(view, 8, "WAVE");

  // "fmt " Sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // "data" Sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, totalSamples * 2, true);

  // Synthesize 3 alert pulses with exponential frequency sweep 650Hz -> 1600Hz
  let offset = 44;
  let phase = 0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const pulseIndex = Math.floor(t / (pulseDuration + pauseDuration));
    const pulseTime = t - pulseIndex * (pulseDuration + pauseDuration);

    let sampleVal = 0;

    if (pulseTime >= 0 && pulseTime <= pulseDuration && pulseIndex < pulseCount) {
      // Frequency ramps up from 650Hz to 1600Hz
      const progress = pulseTime / pulseDuration;
      const freq = 650 + (1600 - 650) * Math.pow(progress, 1.4);
      phase += (2 * Math.PI * freq) / sampleRate;

      // Primary wave + 2nd harmonic
      const wave = 0.7 * Math.sin(phase) + 0.3 * Math.sin(phase * 2);

      // Amplitude envelope (fade in/out for crisp click-free tone)
      let env = 1.0;
      if (pulseTime < 0.04) {
        env = pulseTime / 0.04;
      } else if (pulseTime > pulseDuration - 0.04) {
        env = (pulseDuration - pulseTime) / 0.04;
      }

      sampleVal = wave * env * 0.8;
    } else {
      phase = 0;
    }

    // Clamp to 16-bit signed integer
    const s = Math.max(-1, Math.min(1, sampleVal));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

let cachedSirenBlobUrl: string | null = null;
const getSirenBlobUrl = (): string => {
  if (!cachedSirenBlobUrl && typeof window !== "undefined") {
    const blob = generateSirenWavBlob();
    cachedSirenBlobUrl = URL.createObjectURL(blob);
  }
  return cachedSirenBlobUrl || "";
};

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!sharedAudioCtx && AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (e) {
    return null;
  }
};

export const initAndUnlockAudio = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return true;
  } catch (e) {
    return false;
  }
};

// Global click & interaction listeners to guarantee instant unlock on user interaction
if (typeof window !== "undefined") {
  const handleUnlock = () => {
    initAndUnlockAudio();
  };
  window.addEventListener("click", handleUnlock, { passive: true });
  window.addEventListener("pointerdown", handleUnlock, { passive: true });
  window.addEventListener("keydown", handleUnlock, { passive: true });
  window.addEventListener("touchstart", handleUnlock, { passive: true });
}

let onSirenEndCallback: (() => void) | null = null;

export const stopSiren = () => {
  isPlayingSiren = false;

  try {
    const audioEl = document.getElementById("cybertrace-siren-audio") as HTMLAudioElement | null;
    if (audioEl) {
      audioEl.pause();
      audioEl.currentTime = 0;
    }
  } catch (e) {}

  if (soundTimeoutId) {
    clearTimeout(soundTimeoutId);
    soundTimeoutId = null;
  }

  if (onSirenEndCallback) {
    const cb = onSirenEndCallback;
    onSirenEndCallback = null;
    cb();
  }
};

export const playSirenOnce = (onEnd?: () => void): boolean => {
  stopSiren();
  isPlayingSiren = true;
  onSirenEndCallback = onEnd || null;

  let audioPlayed = false;

  try {
    // 1. Try playing HTML5 Audio element
    const audioEl = document.getElementById("cybertrace-siren-audio") as HTMLAudioElement | null;
    if (audioEl) {
      audioEl.currentTime = 0;
      audioEl.volume = 1.0;
      audioEl.onended = () => stopSiren();
      
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          audioPlayed = true;
        }).catch(err => console.warn("HTML5 Audio blocked:", err));
      }
    }
  } catch (e) {
    console.error("HTML5 Audio error:", e);
  }

  try {
    // 2. Simple WebAudio API Beep (Fallback 1)
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "square";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.5);
      osc.frequency.setValueAtTime(800, ctx.currentTime + 1.0);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.5, ctx.currentTime + 1.4);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    }
  } catch (e) {
    console.warn("WebAudio Fallback failed:", e);
  }

  try {
    // 3. Text-to-Speech (Fallback 2 - Guaranteed to work if volume is on)
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance("Critical Security Alert! Action Required.");
      utterance.rate = 1.2;
      utterance.pitch = 1.5;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    console.warn("Speech Synthesis failed:", e);
  }

  soundTimeoutId = setTimeout(() => {
    stopSiren();
  }, 3500);

  return true;
};

export const playAttackSiren3Times = (onEnd?: () => void): boolean => {
  return playSirenOnce(onEnd);
};

export const isSirenPlaying = (): boolean => isPlayingSiren;
