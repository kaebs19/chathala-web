"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { chatAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** مشغّل الرسالة الصوتية بموجة (AudioPlayerBubble). أول تشغيل لرسالة الطرف الآخر = «سُمعت» */
export default function VoicePlayer({ src, duration, waveform, mine, messageId, listened }: {
  src: string; duration?: number; waveform?: number[]; mine: boolean; messageId?: string; listened?: boolean;
}) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [total, setTotal] = useState(duration || 0);
  const reported = useRef(false);
  const bars = waveform?.length ? waveform : Array.from({ length: 32 }, (_, i) => 0.25 + 0.5 * Math.abs(Math.sin(i * 1.7)));

  useEffect(() => () => audio.current?.pause(), []);

  const toggle = () => {
    if (!audio.current) {
      const a = new Audio(src);
      a.onloadedmetadata = () => Number.isFinite(a.duration) && setTotal(a.duration);
      a.ontimeupdate = () => setPos(a.currentTime);
      a.onended = () => { setPlaying(false); setPos(0); };
      a.onpause = () => setPlaying(false);
      a.onplay = () => setPlaying(true);
      audio.current = a;
    }
    if (playing) audio.current.pause();
    else {
      // صوت واحد في كل مرة
      document.dispatchEvent(new CustomEvent("hala-voice-play", { detail: src }));
      audio.current.play().catch(() => {});
      if (!mine && messageId && !reported.current && !messageId.startsWith("temp")) { reported.current = true; chatAPI.listened(messageId); }
    }
  };
  useEffect(() => {
    const stop = (e: Event) => { if ((e as CustomEvent).detail !== src) audio.current?.pause(); };
    document.addEventListener("hala-voice-play", stop);
    return () => document.removeEventListener("hala-voice-play", stop);
  }, [src]);

  const progress = total ? pos / total : 0;
  return (
    <span className="flex items-center gap-2.5 min-w-[200px] py-0.5">
      <button onClick={toggle} aria-label={playing ? "إيقاف" : "تشغيل الرسالة الصوتية"}
        className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", mine ? "bg-white/25 text-white" : "h-gradient text-white")}>
        {playing ? <Pause size={17} className="fill-current" /> : <Play size={17} className="fill-current ms-0.5" />}
      </button>
      <span className="flex items-end gap-[2px] h-7 flex-1" dir="ltr" aria-hidden>
        {bars.map((b, i) => (
          <span key={i} className={cn("w-[3px] rounded-full", (i + 0.5) / bars.length <= progress ? (mine ? "bg-white" : "bg-h-primary") : mine ? "bg-white/45" : "bg-h-text2/40")}
            style={{ height: `${Math.max(12, b * 100)}%` }} />
        ))}
      </span>
      <span className={cn("text-[11px] tabular-nums shrink-0", mine ? "text-white/85" : "text-h-text2")}>
        {fmt(playing || pos ? pos : total)}{mine && listened ? " 🎧" : ""}
      </span>
    </span>
  );
}
