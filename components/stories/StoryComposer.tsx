"use client";

import { useRef, useState } from "react";
import { ArrowRight, ImagePlus, Type } from "lucide-react";
import Sheet from "@/components/hala/Sheet";
import Button from "@/components/hala/Button";
import { toast } from "@/components/hala/Toast";
import { compressImage } from "@/lib/image";
import { storyApi, STORY_TEXT_MAX } from "@/lib/storyApi";
import { STORY_BACKGROUNDS, storyBackground } from "@/lib/storyBackgrounds";
import { useStoryStore } from "@/stores/storyStore";
import { cn } from "@/lib/utils";

function PolicyWarning() {
  return (
    <p className="rounded-xl bg-h-error/10 border border-h-error/25 px-3.5 py-2.5 text-[13px] leading-6 text-h-error font-semibold">
      تنبيه بشأن المحتوى: لا محتوى فاضح ولا عنيف ولا حسابات تواصل خارجية — القصص المخالفة تُحذف وقد يُمنع النشر.
    </p>
  );
}

export default function StoryComposer({ open, onClose, onPublished }: { open: boolean; onClose: () => void; onPublished?: () => void }) {
  const refreshMine = useStoryStore((s) => s.refreshMine);
  const [mode, setMode] = useState<"pick" | "image" | "text">("pick");
  const [img, setImg] = useState<{ blob: Blob; preview: string } | null>(null);
  const [text, setText] = useState("");
  const [bg, setBg] = useState(0);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    if (img) URL.revokeObjectURL(img.preview);
    setMode("pick"); setImg(null); setText(""); setBg(0); setBusy(false);
  };
  const close = () => { reset(); onClose(); };

  const pick = async (f?: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("اختر صورة");
    try {
      const { blob, preview } = await compressImage(f, 1920, 0.88);
      setImg({ blob, preview }); setMode("image");
    } catch { toast.error("تعذّر قراءة الصورة"); }
    if (fileRef.current) fileRef.current.value = "";
  };

  const publish = async () => {
    setBusy(true);
    const r = mode === "image" && img ? await storyApi.publishImage(img.blob) : await storyApi.publishText(text.trim(), bg);
    setBusy(false);
    if (r.success) {
      toast.success("نُشرت قصتك");
      await refreshMine();
      onPublished?.();
      close();
    } else toast.error(r.message || "تعذّر النشر");
  };

  const back = mode !== "pick" && (
    <button onClick={() => { if (img) URL.revokeObjectURL(img.preview); setImg(null); setMode("pick"); }}
      className="flex items-center gap-1 text-sm font-bold text-h-text2 mb-3"><ArrowRight size={16} /> رجوع</button>
  );

  return (
    <Sheet open={open} onClose={close} title="قصة جديدة">
      <div className="py-2 space-y-4">
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
        {mode === "pick" && (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => fileRef.current?.click()} className="h-32 rounded-2xl bg-h-input flex flex-col items-center justify-center gap-2 font-bold hover:ring-2 hover:ring-h-primary/40">
              <ImagePlus size={30} className="text-h-primary" /> صورة من جهازك
            </button>
            <button onClick={() => setMode("text")} className="h-32 rounded-2xl text-white flex flex-col items-center justify-center gap-2 font-bold" style={{ background: storyBackground(0) }}>
              <Type size={30} /> قصة نصّية
            </button>
          </div>
        )}

        {mode === "image" && img && (
          <div>
            {back}
            <div className="mx-auto w-full max-w-[260px] aspect-[9/16] rounded-2xl overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.preview} alt="معاينة القصة" className="w-full h-full object-contain" />
            </div>
          </div>
        )}

        {mode === "text" && (
          <div>
            {back}
            <div className="mx-auto w-full max-w-[260px] aspect-[9/16] rounded-2xl overflow-hidden flex items-center justify-center p-5 text-center" style={{ background: storyBackground(bg) }}>
              <p className="text-white text-xl font-extrabold leading-9 whitespace-pre-wrap break-words" dir="auto">{text || "اكتب شيئاً…"}</p>
            </div>
            <div className="flex justify-center gap-2 mt-3" role="radiogroup" aria-label="الخلفية">
              {STORY_BACKGROUNDS.map((_, i) => (
                <button key={i} role="radio" aria-checked={bg === i} aria-label={`خلفية ${i + 1}`} onClick={() => setBg(i)}
                  className={cn("w-8 h-8 rounded-full border-2", bg === i ? "border-h-text scale-110" : "border-transparent")}
                  style={{ background: storyBackground(i) }} />
              ))}
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, STORY_TEXT_MAX))} rows={3} dir="auto"
              placeholder="نصّ القصة" aria-label="نصّ القصة"
              className="mt-3 w-full resize-none rounded-xl bg-h-input px-4 py-3 outline-none border-[1.5px] border-transparent focus:border-h-primary leading-7" />
            <p className="text-xs text-h-text2 text-end">{text.length}/{STORY_TEXT_MAX}</p>
          </div>
        )}

        {mode !== "pick" && (
          <>
            <PolicyWarning />
            <Button onClick={publish} loading={busy} disabled={mode === "text" ? !text.trim() : !img}>نشر</Button>
          </>
        )}
        {mode === "pick" && <PolicyWarning />}
      </div>
    </Sheet>
  );
}
