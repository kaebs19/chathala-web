"use client";

import { useState } from "react";
import { ArrowLeftCircle, Check, CheckCircle2, Flag, Forward, PenLine, RefreshCw, RotateCcw, X, XCircle } from "lucide-react";
import Sheet, { Confirm } from "@/components/hala/Sheet";
import Field from "@/components/hala/Field";
import Button from "@/components/hala/Button";
import { toast } from "@/components/hala/Toast";
import { useChatStore } from "@/stores/chatStore";
import { gameApi, GAME_REACTIONS, kindInfo, MAX_STATEMENT_LEN, MAX_SWAPS, optText, qText, type GameAction, type GameQuestion, type GameState } from "@/lib/gameApi";
import { cn, idOf } from "@/lib/utils";
import type { Message } from "@/types";
import GamePickerSheet from "./GamePickerSheet";

const BLUE = "#3B82F6", ORANGE = "#FF6B3D";

/** بطاقة اللعبة داخل المحادثة — تُرسم من message.game. الإجابات الحرّة رسائل محادثة عادية. */
export default function GameCard({ message, me, conversationId, canPlay }: { message: Message; me: string; conversationId: string; canPlay: boolean }) {
  const game = message.game as GameState | null | undefined;
  const [busy, setBusy] = useState(false);
  const [write, setWrite] = useState(false);
  const [askEnd, setAskEnd] = useState(false);
  const [again, setAgain] = useState(false);
  const [report, setReport] = useState<GameQuestion | null>(null);

  // أسماء الطرفين من المحادثة
  const conv = useChatStore((s) => s.conversations.find((c) => c._id === conversationId));
  const other = conv?.participants?.find((p) => idOf(p) !== me);
  const otherName = other?.name || "الطرف الآخر";

  if (!game || !Array.isArray(game.players)) {
    return <Shell title="لعبة" emoji="🎮"><Note>{message.content || "لعبة"}</Note></Shell>;
  }

  const info = kindInfo(game.kind);
  const myTurn = game.turn === me;
  const isInvitee = game.players[1] === me;
  const live = game.status === "invited" || game.status === "active";
  const playable = canPlay && live && !busy;

  /** تطبيق حالة جديدة على الرسالة في مكانها */
  const apply = (g: GameState) => useChatStore.getState().applyMessage({ ...message, conversationId, game: g as unknown as Record<string, unknown> });

  const send = async (action: GameAction, payload: Parameters<typeof gameApi.action>[2] = {}, optimistic?: Partial<GameState>) => {
    if (busy) return false;
    setBusy(true);
    const prev = game;
    if (optimistic) apply({ ...game, ...optimistic });
    const r = await gameApi.action(message._id, action, payload);
    setBusy(false);
    const g = r.data?.game;
    if (r.success && g) { apply(g); return true; }
    // الرفض يعيد الحالة الحالية للمزامنة، وإلا نتراجع
    apply(g || prev);
    toast.error(r.message || "تعذّر تنفيذ الإجراء");
    return false;
  };

  const react = async (emoji: string) => {
    const prev = game;
    const reactions = { ...(game.reactions || {}) };
    if (reactions[me] === emoji) delete reactions[me]; else reactions[me] = emoji;
    apply({ ...game, reactions });
    const r = await gameApi.react(message._id, emoji);
    if (r.success && r.data?.game) apply(r.data.game);
    else { apply(prev); toast.error(r.message || "تعذّر التفاعل"); }
  };

  const tags = (
    <>
      {game.level === "bold" && <MiniTag className="bg-orange-500/15 text-orange-500">🌶️ جريء</MiniTag>}
      {game.source && game.source !== "default" && <MiniTag className="bg-h-primary/12 text-h-primary">✍️ أسئلتنا</MiniTag>}
    </>
  );

  // ─────────── الحالات المنتهية
  if (game.status === "declined") {
    return <Shell title={info?.title} emoji={info?.emoji} tags={tags}><Closed icon={<XCircle size={18} />}>رُفضت الدعوة</Closed></Shell>;
  }
  if (game.status === "ended") {
    return (
      <Shell title={info?.title} emoji={info?.emoji} tags={tags}>
        <Summary game={game} me={me} otherName={otherName} />
        {canPlay && <Btn kind="primary" icon={<RotateCcw size={16} />} onClick={() => setAgain(true)}>العب مرة أخرى</Btn>}
        <GamePickerSheet open={again} onClose={() => setAgain(false)} conversationId={conversationId} initialKind={game.kind} />
      </Shell>
    );
  }

  // ─────────── الدعوة
  if (game.status === "invited") {
    return (
      <Shell title={info?.title} emoji={info?.emoji} tags={tags} onEnd={canPlay ? () => setAskEnd(true) : undefined} endLabel={isInvitee ? undefined : "إلغاء الدعوة"}>
        <p className="text-xs text-h-text2 leading-5">{info?.desc}</p>
        {isInvitee ? (
          <>
            <Note>{game.level === "bold" ? `${otherName} يدعوك للعب بمستوى جريء 🌶️ — بقبولك توافق على هذا المستوى` : `${otherName} يدعوك للعب`}</Note>
            {canPlay && (
              <div className="flex gap-2">
                <Btn kind="primary" icon={<Check size={16} />} disabled={!playable} onClick={() => send("accept")}>قبول</Btn>
                <Btn kind="secondary" icon={<X size={16} />} disabled={!playable} onClick={() => send("decline")}>رفض</Btn>
              </div>
            )}
          </>
        ) : <Note>بانتظار قبول {otherName}…</Note>}
        <Confirm open={askEnd} onClose={() => setAskEnd(false)} danger confirmText="تأكيد" title="إلغاء الدعوة؟" onConfirm={() => { setAskEnd(false); send("end"); }} />
      </Shell>
    );
  }

  // ─────────── نشطة
  const body = (() => {
    switch (game.kind) {
      case "truth_dare": return TruthDare();
      case "two_truths_lie": return TwoTruths();
      default: return PickGame();
    }
  })();

  function TruthDare() {
    const g = game!;
    const lastBlock = g.last && g.phase === "choose" ? LastRound() : null;
    if (g.phase === "choose") {
      return (
        <>
          {lastBlock}
          {myTurn ? (
            <>
              <Note>دورك — اختر:</Note>
              <div className="grid grid-cols-2 gap-2">
                <ChoiceTile emoji="🧠" label="حقيقة" color={BLUE} disabled={!playable} onClick={() => send("choose", { choice: "truth" })} />
                <ChoiceTile emoji="🔥" label="جرأة" color={ORANGE} disabled={!playable} onClick={() => send("choose", { choice: "dare" })} />
              </div>
            </>
          ) : <Note>{otherName} يختار حقيقة أو جرأة…</Note>}
        </>
      );
    }
    const isTruth = g.current?.choice === "truth";
    const swapsLeft = MAX_SWAPS - (g.current?.swaps || 0);
    return (
      <>
        <span className="text-xs font-extrabold" style={{ color: isTruth ? BLUE : ORANGE }}>{isTruth ? "🧠 حقيقة" : "🔥 جرأة"}</span>
        <QuestionBox q={g.current?.question} me={me} otherName={otherName} onReport={setReport} />
        {myTurn ? (
          <>
            <Note>أجب في المحادثة ثم اضغط «تم»</Note>
            <Btn kind="primary" icon={<CheckCircle2 size={16} />} disabled={!playable} onClick={() => send("done")}>تم — أجبت</Btn>
            <div className="flex gap-2">
              {swapsLeft > 0 && <Btn kind="secondary" icon={<RefreshCw size={15} />} disabled={!playable} onClick={() => send("swap")}>بدّل السؤال ({swapsLeft})</Btn>}
              <Btn kind="secondary" icon={<Forward size={15} />} disabled={!playable} onClick={() => send("skip")}>تخطّي</Btn>
            </div>
          </>
        ) : <Note>بانتظار إجابة {otherName}…</Note>}
      </>
    );
  }

  function LastRound() {
    const l = game!.last!;
    const byMe = l.player === me;
    return (
      <div className="rounded-xl bg-h-input/70 p-2.5 space-y-1.5">
        <p className="text-[11px] font-bold text-h-text2">آخر جولة — {byMe ? "أنت" : otherName} {l.result === "done" ? "أنجز" : "تخطّى"}</p>
        {l.question && <p className="text-xs leading-5 line-clamp-2">{l.choice === "truth" ? "🧠" : "🔥"} {qText(l.question)}</p>}
        {Reactions()}
      </div>
    );
  }

  function PickGame() {
    const g = game!;
    const isNever = g.kind === "never_have_i_ever";
    const q = g.current?.question;
    const opt = (k: "a" | "b") => (isNever ? (k === "a" ? "🙋 فعلتها" : "🙅 لم أفعلها") : optText(q?.[k]));
    if (g.phase === "pick") {
      const picked = g.current?.pickedBy?.includes(me);
      return (
        <>
          {isNever ? <QuestionBox q={q} me={me} otherName={otherName} onReport={setReport} prefix="لم أفعل قط… " /> : q?.author && <AuthorTag q={q} me={me} otherName={otherName} onReport={setReport} />}
          {(["a", "b"] as const).map((k) => (
            <button key={k} disabled={!playable || picked} onClick={() => send("pick", { choice: k }, { current: { ...g.current, pickedBy: [...(g.current?.pickedBy || []), me] } })}
              className={cn("w-full flex items-center gap-2 p-2.5 rounded-xl text-start text-sm font-semibold transition",
                "bg-h-primary/8 hover:bg-h-primary/15 disabled:hover:bg-h-primary/8", picked && "opacity-60")}>
              <KeyDot k={k} />{opt(k)}
            </button>
          ))}
          <Note>{picked ? `اخترت ✓ — بانتظار ${otherName}…` : "اختيارك سرّي حتى يختار الطرفان"}</Note>
        </>
      );
    }
    // reveal
    const picks = g.current?.picks || {};
    const otherId = g.players.find((p) => p !== me) || "";
    const mine = picks[me], theirs = picks[otherId];
    return (
      <>
        {isNever && <QuestionBox q={q} me={me} otherName={otherName} onReport={setReport} prefix="لم أفعل قط… " />}
        {(["a", "b"] as const).map((k) => (
          <div key={k} className={cn("flex items-center gap-2 p-2.5 rounded-xl text-sm font-semibold", mine === k || theirs === k ? "bg-h-primary/18" : "bg-h-primary/6")}>
            <KeyDot k={k} /><span className="flex-1">{opt(k)}</span>
            {mine === k && <MiniTag className="bg-h-primary text-white">أنت</MiniTag>}
            {theirs === k && <MiniTag className="bg-h-secondary text-white">{otherName}</MiniTag>}
          </div>
        ))}
        {mine && theirs && <p className="text-sm font-extrabold text-center">{mine === theirs ? "تطابقتما! 🎉" : isNever ? "اختلفتما 😄 — احكِ القصة!" : "اختلفتما 😄 — ناقشا السبب!"}</p>}
        {Reactions()}
        {canPlay && <Btn kind="primary" icon={<ArrowLeftCircle size={16} />} disabled={!playable} onClick={() => send("next")}>السؤال التالي</Btn>}
      </>
    );
  }

  function TwoTruths() {
    const g = game!;
    const c = g.current;
    if (g.phase === "write") {
      return myTurn ? (
        <>
          <Note>اكتب ثلاث عبارات عن نفسك: اثنتان صحيحتان وكذبة</Note>
          <Btn kind="primary" icon={<PenLine size={16} />} disabled={!playable} onClick={() => setWrite(true)}>اكتب عباراتك</Btn>
        </>
      ) : <Note>{otherName} يكتب عباراته…</Note>;
    }
    const iWrote = c?.writer === me;
    const revealed = g.phase === "reveal";
    return (
      <>
        <Note>{revealed ? "" : iWrote ? `بانتظار تخمين ${otherName}…` : "أيّها الكذبة؟"}</Note>
        {(c?.statements || []).map((t, i) => {
          const isLie = revealed && c?.lie === i;
          const guessed = c?.guess === i;
          const canGuess = !revealed && !iWrote && myTurn && playable;
          return (
            <button key={i} disabled={!canGuess} onClick={() => send("guess", { index: i })}
              className={cn("w-full flex items-center gap-2 p-2.5 rounded-xl text-start text-sm font-semibold transition",
                revealed ? (isLie ? "bg-h-error/15" : "bg-h-success/12") : "bg-h-primary/8", canGuess && "hover:bg-h-primary/15")}>
              <span className="w-[22px] h-[22px] rounded-full bg-h-primary text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="flex-1" dir="auto">{t}</span>
              {revealed && <MiniTag className={isLie ? "bg-h-error text-white" : "bg-h-success text-white"}>{isLie ? "كذبة" : "حقيقة"}</MiniTag>}
              {revealed && guessed && <MiniTag className="bg-h-chip text-h-text">التخمين</MiniTag>}
            </button>
          );
        })}
        {revealed && (
          <>
            <p className="text-sm font-extrabold text-center">
              {iWrote ? (c?.correct ? `${otherName} كشفك! 🎯` : `خدعت ${otherName}! 😎`) : (c?.correct ? "خمّنت صح! 🎉" : "أخطأت 😅")}
            </p>
            {Reactions()}
            {canPlay && <Btn kind="primary" icon={<ArrowLeftCircle size={16} />} disabled={!playable} onClick={() => send("next")}>الجولة التالية</Btn>}
          </>
        )}
      </>
    );
  }

  function Reactions() {
    const all = game!.reactions || {};
    const mine = all[me];
    const otherR = Object.entries(all).find(([u]) => u !== me)?.[1];
    return (
      <div className="space-y-1.5">
        {(mine || otherR) && (
          <div className="flex gap-1.5 flex-wrap">
            {mine && <MiniTag className="bg-h-primary/12 text-h-primary">{mine} أنت</MiniTag>}
            {otherR && <MiniTag className="bg-h-chip text-h-text">{otherR} {otherName}</MiniTag>}
          </div>
        )}
        {canPlay && (
          <div className="flex gap-1 flex-wrap">
            {GAME_REACTIONS.map((e) => (
              <button key={e} onClick={() => react(e)} aria-pressed={mine === e} aria-label={`تفاعل ${e}`}
                className={cn("w-8 h-8 rounded-full text-base transition", mine === e ? "bg-h-primary/20 scale-110" : "hover:bg-h-input")}>{e}</button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Shell title={info?.title} emoji={info?.emoji} tags={tags} round={game.round} onEnd={canPlay ? () => setAskEnd(true) : undefined}>
      {body}
      <Confirm open={askEnd} onClose={() => setAskEnd(false)} danger confirmText="إنهاء" title="إنهاء اللعبة؟" onConfirm={() => { setAskEnd(false); send("end"); }} />
      <TwoTruthsWriteSheet open={write} onClose={() => setWrite(false)} busy={busy}
        onSubmit={async (statements, lie) => { const ok = await send("submit", { statements, lie }); if (ok) setWrite(false); }} />
      <Confirm open={!!report} onClose={() => setReport(null)} danger confirmText="إبلاغ وإخفاء" title="الإبلاغ عن هذا السؤال؟"
        message="يُعطَّل السؤال فوراً ويراجعه فريق الإدارة."
        onConfirm={async () => {
          const q = report; setReport(null);
          if (!q) return;
          const r = await gameApi.reportQuestion(String(q.id), message._id);
          if (r.success) toast.success("وصل بلاغك"); else toast.error(r.message || "تعذّر الإبلاغ");
        }} />
    </Shell>
  );
}

// ─────────────────────────────────────────── أجزاء صغيرة

function Shell({ title, emoji, tags, round, onEnd, endLabel = "إنهاء اللعبة", children }: {
  title?: string; emoji?: string; tags?: React.ReactNode; round?: number; onEnd?: () => void; endLabel?: string; children: React.ReactNode;
}) {
  return (
    <div className="w-[280px] sm:w-[300px] max-w-full rounded-2xl bg-h-card text-h-text border border-h-border overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-l from-h-primary/12 to-h-secondary/10">
        <span className="text-xl">{emoji || "🎮"}</span>
        <span className="font-extrabold text-sm flex-1 truncate">{title || "لعبة"}</span>
        {tags}
        {!!round && <span className="text-[11px] text-h-text2 font-bold">الجولة {round}</span>}
      </div>
      <div className="p-3 space-y-2.5">{children}</div>
      {onEnd && (
        <button onClick={onEnd} className="w-full border-t border-h-divider py-2 text-xs font-bold text-h-text2 hover:text-h-error">{endLabel}</button>
      )}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-xs text-h-text2 font-semibold leading-5">{children}</p>;
}

function Closed({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <p className="flex items-center gap-2 text-sm font-bold text-h-text2">{icon}{children}</p>;
}

function MiniTag({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("text-[10px] font-extrabold px-1.5 py-0.5 rounded-full whitespace-nowrap", className)}>{children}</span>;
}

function KeyDot({ k }: { k: "a" | "b" }) {
  return <span className="w-[22px] h-[22px] rounded-full bg-h-primary text-white text-xs font-bold flex items-center justify-center shrink-0">{k === "a" ? "A" : "B"}</span>;
}

function Btn({ kind, icon, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind: "primary" | "secondary"; icon?: React.ReactNode }) {
  return (
    <button {...rest} className={cn("w-full h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition active:scale-[.98] disabled:opacity-50",
      kind === "primary" ? "h-gradient text-white" : "bg-h-input text-h-text")}>
      {icon}{children}
    </button>
  );
}

function ChoiceTile({ emoji, label, color, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { emoji: string; label: string; color: string }) {
  return (
    <button {...rest} className="h-20 rounded-2xl flex flex-col items-center justify-center gap-1 font-extrabold text-sm transition active:scale-95 disabled:opacity-50"
      style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
      <span className="text-2xl">{emoji}</span>{label}
    </button>
  );
}

function AuthorTag({ q, me, otherName, onReport }: { q: GameQuestion; me: string; otherName: string; onReport: (q: GameQuestion) => void }) {
  if (!q.author) return null;
  const mine = q.author === me;
  return (
    <div className="flex items-center gap-2">
      <MiniTag className="bg-h-primary/12 text-h-primary">{mine ? "✍️ سؤالك" : `✍️ سؤال من ${otherName}`}</MiniTag>
      {!mine && String(q.id).startsWith("u:") && (
        <button onClick={() => onReport(q)} className="text-[11px] font-bold text-h-text2 flex items-center gap-1 hover:text-h-error"><Flag size={11} />بلّغ</button>
      )}
    </div>
  );
}

function QuestionBox({ q, me, otherName, onReport, prefix }: { q?: GameQuestion | null; me: string; otherName: string; onReport: (q: GameQuestion) => void; prefix?: string }) {
  if (!q) return null;
  return (
    <div className="rounded-xl bg-h-input p-3 space-y-1.5">
      <AuthorTag q={q} me={me} otherName={otherName} onReport={onReport} />
      <p className="text-[15px] font-bold leading-7" dir="auto">{prefix && !qText(q).startsWith("لم أفعل") ? prefix : ""}{qText(q)}</p>
    </div>
  );
}

function Summary({ game, me, otherName }: { game: GameState; me: string; otherName: string }) {
  const s = game.stats || {};
  let rounds = "";
  if (game.kind === "truth_dare") rounds = `أُنجز ${s.done || 0} من ${game.round} جولة`;
  else if (game.kind === "two_truths_lie") rounds = `${game.round} جولة — ${s.correct || 0} تخمين صحيح`;
  else rounds = `${game.round} سؤال — تطابقتما في ${s.matched || 0}`;
  const why = game.endedBy === "timeout" ? "انتهت لعدم الرد" : game.endedBy === me ? "أنهيت اللعبة" : `${otherName} أنهى اللعبة`;
  return (
    <div className="space-y-1">
      <Closed icon={<CheckCircle2 size={18} />}>انتهت اللعبة</Closed>
      {game.round > 0 && <p className="text-xs text-h-text2">{rounds}</p>}
      <p className="text-xs text-h-text2">{why}</p>
    </div>
  );
}

function TwoTruthsWriteSheet({ open, onClose, onSubmit, busy }: { open: boolean; onClose: () => void; onSubmit: (s: string[], lie: number) => void; busy: boolean }) {
  const [st, setSt] = useState(["", "", ""]);
  const [lie, setLie] = useState<number | null>(null);
  const clean = st.map((t) => t.trim().replace(/\s+/g, " "));
  const err = clean.some((t) => t.length > 0 && t.length < 2) ? "كل عبارة حرفان على الأقل"
    : new Set(clean.filter(Boolean).map((t) => t.toLowerCase())).size !== clean.filter(Boolean).length ? "العبارات الثلاث يجب أن تكون مختلفة" : null;
  const ready = clean.every((t) => t.length >= 2) && lie !== null && !err;
  return (
    <Sheet open={open} onClose={onClose} title="حقيقتان وكذبة">
      <div className="space-y-3 py-2">
        <p className="text-sm text-h-text2 leading-6">اكتب ثلاث عبارات عن نفسك، ثم حدّد أيّها الكذبة. تبقى الكذبة سرّاً حتى يخمّن.</p>
        {st.map((t, i) => (
          <div key={i} className="flex items-start gap-2">
            <button type="button" onClick={() => setLie(i)} aria-pressed={lie === i} aria-label={`العبارة ${i + 1} هي الكذبة`}
              className={cn("mt-3 shrink-0 h-8 px-2 rounded-lg text-[11px] font-extrabold border-[1.5px]", lie === i ? "border-h-error bg-h-error/10 text-h-error" : "border-h-border text-h-text2")}>
              {lie === i ? "كذبة" : "حقيقة"}
            </button>
            <Field className="flex-1" value={t} maxLength={MAX_STATEMENT_LEN} placeholder={`العبارة ${i + 1}`}
              onChange={(e) => setSt((s) => s.map((x, k) => (k === i ? e.target.value : x)))} />
          </div>
        ))}
        {err && <p className="text-xs text-h-error font-semibold">{err}</p>}
        {lie === null && clean.every((t) => t.length >= 2) && <p className="text-xs text-h-text2">اضغط «حقيقة» بجانب العبارة الكاذبة لتحديدها</p>}
        <Button loading={busy} disabled={!ready} onClick={() => ready && onSubmit(clean, lie!)}>إرسال</Button>
      </div>
    </Sheet>
  );
}
