import { api, type ApiResult } from "@/lib/api";
import { MOBILE } from "@/lib/config";

// ألعاب المحادثة — رسالة واحدة type:'game' تتحدّث في مكانها؛ الحالة كلها في الخادم
// (routes/mobile/games.js + utils/gameEngine.js). الأسرار (اختيار الطرف الآخر/الكذبة) لا تصل قبل الكشف.

export type GameKind = "truth_dare" | "would_you_rather" | "never_have_i_ever" | "two_truths_lie";
export type GameLevel = "light" | "bold";
export type GameSource = "default" | "custom" | "mix";
export type GameAction = "accept" | "decline" | "end" | "choose" | "swap" | "done" | "skip" | "pick" | "next" | "submit" | "guess";

export type Localized = { ar?: string; en?: string };
export type GameQuestion = {
  id: number | string;
  ar?: string; en?: string;          // حقيقة/جرأة/لم أفعل قط
  a?: Localized; b?: Localized;      // هل تفضّل؟
  author?: string | null;            // سؤال من «أسئلتنا» (معرّف كاتبه)
};

export type GameState = {
  kind: GameKind;
  level?: GameLevel;
  source?: GameSource;
  status: "invited" | "active" | "ended" | "declined";
  players: [string, string];         // [صاحب الدعوة، المدعو]
  turn: string | null;
  phase: "choose" | "answer" | "pick" | "reveal" | "write" | "guess" | null;
  round: number;
  current?: {
    // حقيقة/جرأة
    choice?: "truth" | "dare"; question?: GameQuestion; swaps?: number;
    // هل تفضّل/لم أفعل قط
    pickedBy?: string[]; picks?: Record<string, "a" | "b"> | null;
    // حقيقتان وكذبة
    writer?: string; statements?: string[]; guess?: number | null; lie?: number | null; correct?: boolean | null;
  } | null;
  last?: { round: number; choice: "truth" | "dare" | null; question: GameQuestion | null; result: "done" | "skipped"; player: string } | null;
  reactions?: Record<string, string>;
  stats?: { done?: number; skipped?: number; correct?: number; matched?: number };
  endedBy?: string | null;           // معرّف المنهي أو "timeout"
  updatedAt?: string;
};

export const GAME_KINDS: { kind: GameKind; emoji: string; title: string; desc: string }[] = [
  { kind: "truth_dare", emoji: "🎭", title: "حقيقة أم جرأة", desc: "بالدور: اختر حقيقة أو جرأة ونفّذ" },
  { kind: "would_you_rather", emoji: "🤔", title: "هل تفضّل؟", desc: "يختار كلاكما سرّاً ثم تُكشف الإجابتان معاً" },
  { kind: "never_have_i_ever", emoji: "🙈", title: "لم أفعل قط", desc: "عبارة «لم أفعل قط» — من فعلها ومن لم يفعل؟" },
  { kind: "two_truths_lie", emoji: "🕵️", title: "حقيقتان وكذبة", desc: "اكتب حقيقتين وكذبة عن نفسك ودعه يخمّن" },
];

export const GAME_REACTIONS = ["😂", "🔥", "😮", "🙈", "👏", "✋", "😎", "❤️"];
export const MAX_SWAPS = 2;
export const MAX_STATEMENT_LEN = 100;

const g = (p: string) => `${MOBILE}/games${p}`;

type GameResult = ApiResult<{ messageId?: string; game?: GameState; message?: Record<string, unknown> }>;

export const gameApi = {
  config: () => api<{ enabledKinds: GameKind[] }>(g("/config")),
  /** يُرجع data.message (الرسالة كاملة بالمرسل) — 409 GAME_ALREADY_ACTIVE / 429 GAME_COOLDOWN / 403 BOLD_AGE_RESTRICTED */
  start: (conversationId: string, kind: GameKind, opts: { level?: GameLevel; source?: GameSource } = {}) =>
    api(g("/start"), { body: { conversationId, kind, level: opts.level || "light", source: opts.source || "default" } }) as Promise<GameResult>,
  /** يُرجع data.{messageId, game} — لا الرسالة كاملة. عند الرفض data.game = الحالة الحالية للمزامنة */
  action: (messageId: string, action: GameAction, payload: { choice?: string; statements?: string[]; lie?: number; index?: number } = {}) =>
    api(g(`/${messageId}/action`), { body: { action, ...payload } }) as Promise<GameResult>,
  react: (messageId: string, emoji: string) => api(g(`/${messageId}/react`), { body: { emoji } }) as Promise<GameResult>,
  history: (conversationId: string) => api(g(`/history/${conversationId}`)),
  /** بلاغ عن سؤال من «أسئلتنا» فقط (questionId بصيغة "u:<id>") */
  reportQuestion: (questionId: string, messageId: string) => api(g("/report-question"), { body: { questionId, messageId } }),
};

export function qText(q?: GameQuestion | null): string {
  return q?.ar || q?.en || "";
}
export function optText(o?: Localized): string {
  return o?.ar || o?.en || "";
}
export function kindInfo(kind?: string) {
  return GAME_KINDS.find((k) => k.kind === kind);
}
