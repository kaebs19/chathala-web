"use client";

/**
 * تسجيل الصوت في المتصفح ← WAV (PCM 16kHz أحادي).
 * لماذا لا webm؟ الخادم يقبله، لكن تطبيق iOS (AVPlayer) لا يشغّل webm/opus — فتصل رسالة لا تُسمع.
 * WAV يشغّله الجميع، و16kHz أحادي ≈ 32KB/ث (دقيقة ≈ 1.9MB تحت حدّ 5MB).
 */
export const VOICE_MAX_SECONDS = 60;
const TARGET_RATE = 16000;
const WAVE_POINTS = 40;

export type VoiceResult = { file: File; duration: number; waveform: number[]; url: string };

export class VoiceRecorder {
  private stream: MediaStream | null = null;
  private rec: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private levels: number[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  startedAt = 0;

  static supported() {
    return typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && "MediaRecorder" in window;
  }

  async start(onLevel?: (v: number) => void) {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    this.rec = new MediaRecorder(this.stream);
    this.chunks = [];
    this.rec.ondataavailable = (e) => e.data.size && this.chunks.push(e.data);
    this.ctx = new AudioContext();
    const src = this.ctx.createMediaStreamSource(this.stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    src.connect(this.analyser);
    const buf = new Uint8Array(this.analyser.fftSize);
    this.levels = [];
    this.timer = setInterval(() => {
      if (!this.analyser) return;
      this.analyser.getByteTimeDomainData(buf);
      let peak = 0;
      for (const v of buf) peak = Math.max(peak, Math.abs(v - 128) / 128);
      this.levels.push(peak);
      onLevel?.(peak);
    }, 100);
    this.rec.start(250);
    this.startedAt = Date.now();
  }

  private cleanup() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.ctx?.close().catch(() => {});
    this.stream = null; this.ctx = null; this.analyser = null;
  }

  cancel() {
    try { this.rec?.stop(); } catch {}
    this.cleanup();
    this.chunks = [];
  }

  async stop(): Promise<VoiceResult> {
    const rec = this.rec!;
    const stopped = new Promise<void>((r) => (rec.onstop = () => r()));
    rec.stop();
    await stopped;
    const levels = this.levels;
    this.cleanup();
    const raw = new Blob(this.chunks, { type: rec.mimeType || "audio/webm" });
    const decoded = await new AudioContext().decodeAudioData(await raw.arrayBuffer());
    const seconds = Math.min(decoded.duration, VOICE_MAX_SECONDS);
    // إعادة أخذ العيّنات إلى 16kHz أحادي
    const off = new OfflineAudioContext(1, Math.ceil(seconds * TARGET_RATE), TARGET_RATE);
    const node = off.createBufferSource();
    node.buffer = decoded;
    node.connect(off.destination);
    node.start(0, 0, seconds);
    const rendered = await off.startRendering();
    const wav = encodeWav(rendered.getChannelData(0), TARGET_RATE);
    const file = new File([wav], "voice.wav", { type: "audio/wav" });
    return { file, duration: Math.max(1, Math.round(seconds)), waveform: downsample(levels, WAVE_POINTS), url: URL.createObjectURL(file) };
  }
}

function downsample(levels: number[], n: number): number[] {
  if (!levels.length) return Array(n).fill(0.1);
  const out: number[] = [];
  const step = levels.length / n;
  for (let i = 0; i < n; i++) {
    const slice = levels.slice(Math.floor(i * step), Math.max(Math.floor((i + 1) * step), Math.floor(i * step) + 1));
    out.push(Math.min(1, Math.max(0.05, Math.max(...slice) * 1.6)));
  }
  return out.map((v) => Math.round(v * 100) / 100);
}

function encodeWav(samples: Float32Array, rate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buffer);
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + samples.length * 2, true); w(8, "WAVE");
  w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, samples.length * 2, true);
  let o = 44;
  for (let i = 0; i < samples.length; i++, o += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}
