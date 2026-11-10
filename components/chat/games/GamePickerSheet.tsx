"use client";

import { useEffect, useState } from "react";
import Sheet from "@/components/hala/Sheet";
import Button from "@/components/hala/Button";
import { toast } from "@/components/hala/Toast";
import { useChatStore } from "@/stores/chatStore";
import { GAME_KINDS, gameApi, type GameKind, type GameLevel, type GameSource } from "@/lib/gameApi";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

let enabledCache: GameKind[] | null = null;

/** اختيار اللعبة ومستواها ومصدر الأسئلة ثم الدعوة. عبارات «حقيقتان وكذبة» تُكتب بعد القبول (لا عند البدء). */
export default function GamePickerSheet({ open, onClose, conversationId, initialKind }: { open: boolean; onClose: () => void; conversationId: string; initialKind?: GameKind }) {
  const [enabled, setEnabled] = useState<GameKind[] | null>(enabledCache);
  const [kind, setKind] = useState<GameKind>(initialKind || "truth_dare");
  const [level, setLevel] = useState<GameLevel>("light");
  const [source, setSource] = useState<GameSource>("default");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || enabledCache) return;
    gameApi.config().then((r) => {
      const k = r.data?.enabledKinds;
      enabledCache = r.success && Array.isArray(k) ? k : GAME_KINDS.map((x) => x.kind);
      setEnabled(enabledCache);
    });
  }, [open]);

  const list = GAME_KINDS.filter((k) => !enabled || enabled.includes(k.kind));
  const hasQuestions = kind !== "two_truths_lie";

  const start = async () => {
    setBusy(true);
    const r = await gameApi.start(conversationId, kind, { level: hasQuestions ? level : "light", source: hasQuestions ? source : "default" });
    setBusy(false);
    const m = r.data?.message as Message | undefined;
    if (r.success && m) {
      useChatStore.getState().applyMessage({ ...m, conversationId });
      onClose();
      return;
    }
    toast.error(r.message || "تعذّر بدء اللعبة");
  };

  return (
    <Sheet open={open} onClose={onClose} title="ألعاب">
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="اللعبة">
          {list.map((k) => (
            <button key={k.kind} role="radio" aria-checked={kind === k.kind} onClick={() => setKind(k.kind)}
              className={cn("rounded-2xl p-3 text-start border-[1.5px] transition", kind === k.kind ? "border-h-primary bg-h-primary/8" : "border-h-border")}>
              <span className="text-2xl">{k.emoji}</span>
              <span className="block font-extrabold text-sm mt-1">{k.title}</span>
              <span className="block text-[11px] text-h-text2 leading-4 mt-0.5">{k.desc}</span>
            </button>
          ))}
        </div>

        {hasQuestions && (
          <>
            <Segment label="المستوى" value={level} onChange={setLevel}
              options={[["light", "خفيف"], ["bold", "🌶️ جريء"]]} />
            {level === "bold" && <p className="text-xs text-h-text2 leading-5 -mt-2">رومانسي وشخصي بلا محتوى جنسي، للطرفين 18+ وبقبول الدعوة.</p>}
            <Segment label="الأسئلة" value={source} onChange={setSource}
              options={[["default", "العامة"], ["custom", "أسئلتنا"], ["mix", "مزيج"]]} />
            {source !== "default" && <p className="text-xs text-h-text2 leading-5 -mt-2">«أسئلتنا» من أسئلتكما الخاصة في التطبيق، وإن لم توجد فمن العامة.</p>}
          </>
        )}

        <Button loading={busy} onClick={start} disabled={!list.some((k) => k.kind === kind)}>دعوة للعب</Button>
      </div>
    </Sheet>
  );
}

function Segment<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div>
      <p className="text-sm font-bold mb-1.5">{label}</p>
      <div className="flex gap-1 bg-h-input rounded-xl p-1" role="radiogroup" aria-label={label}>
        {options.map(([v, l]) => (
          <button key={v} role="radio" aria-checked={value === v} onClick={() => onChange(v)}
            className={cn("flex-1 h-9 rounded-lg text-sm font-bold transition", value === v ? "bg-h-card text-h-primary shadow-sm" : "text-h-text2")}>{l}</button>
        ))}
      </div>
    </div>
  );
}
