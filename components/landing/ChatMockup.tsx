import { CheckCheck, Lock, Mic, Plus, Smile, Heart, Play } from "lucide-react";

/** هاتف بمحادثة توضيحية (أسماء وصور رمزية للعرض فقط — لا بيانات مستخدمين حقيقيين) */
export default function ChatMockup() {
  return (
    <div className="relative mx-auto w-[300px] sm:w-[320px]" aria-hidden>
      {/* هالة خلفية */}
      <div className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--h-primary)_28%,transparent),transparent)] blur-2xl" />

      <div className="relative rounded-[46px] p-[10px] bg-[#16161A] shadow-[0_40px_80px_-30px_rgba(0,0,0,.55)] border border-white/10">
        <div className="hala-mock rounded-[38px] overflow-hidden bg-h-bg h-[600px] flex flex-col">
          {/* شريط الحالة */}
          <div className="h-8 flex items-center justify-between px-6 text-[11px] font-bold text-h-text" dir="ltr">
            <span>9:41</span><span className="w-20 h-5 rounded-full bg-[#16161A] -mt-1" /><span>5G ▮▮</span>
          </div>
          {/* ترويسة المحادثة */}
          <div className="flex items-center gap-2.5 px-3 py-2 bg-h-card border-b border-h-border">
            <span className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-[#E91E8C] to-[#D32F2F]">
              <span className="w-full h-full rounded-full bg-gradient-to-br from-[#FFB4D9] to-[#C084FC] flex items-center justify-center text-white font-black">ر</span>
              <span className="absolute bottom-0 end-0 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-h-card" />
            </span>
            <span className="flex-1 leading-tight">
              <span className="block font-extrabold text-sm text-h-text">ريم</span>
              <span className="block text-[11px] font-bold text-h-primary">يكتب…</span>
            </span>
          </div>

          {/* الرسائل */}
          <div className="flex-1 px-3 py-3 space-y-2 overflow-hidden text-[13px]">
            <div className="flex justify-center"><span className="text-[10px] text-h-text2 bg-h-chip rounded-full px-2.5 py-1 flex items-center gap-1"><Lock size={10} /> المحادثة خاصة بينكما</span></div>
            <Bubble>هلا! شفت في ملفك إنك تحب السفر ✈️</Bubble>
            <Bubble mine>هلا والله 😄 إيه، آخر رحلة كانت للعلا</Bubble>
            <Bubble>واااو، أحلم أزورها! وش أحلى شي فيها؟</Bubble>
            {/* رسالة صوتية */}
            <div className="flex justify-end">
              <span className="h-bubble-mine rounded-[18px] rounded-be-md px-2.5 py-2 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center"><Play size={13} className="fill-white" /></span>
                <span className="flex items-end gap-[2px] h-5" dir="ltr">
                  {[5, 9, 14, 8, 16, 11, 6, 13, 9, 15, 7, 12, 10, 5, 8, 12, 6].map((h, i) => <span key={i} className="w-[2.5px] rounded-full bg-white/80" style={{ height: h + 2 }} />)}
                </span>
                <span className="text-[10px] text-white/85">0:12</span>
              </span>
            </div>
            {/* بطاقة لعبة */}
            <div className="flex justify-start">
              <span className="w-[210px] rounded-2xl bg-h-card border border-h-border p-2.5">
                <span className="flex items-center gap-1.5 text-[12px] font-extrabold text-h-text">🤔 هل تفضّل؟</span>
                <span className="mt-2 block rounded-xl bg-h-input px-2.5 py-1.5 text-[12px] text-h-text"><b className="text-h-primary">A</b> بحر وهدوء 🌊</span>
                <span className="mt-1.5 block rounded-xl bg-h-primary/12 border border-h-primary/40 px-2.5 py-1.5 text-[12px] text-h-text"><b className="text-h-primary">B</b> جبل ومغامرة ⛰️ <span className="text-[10px] text-h-primary font-bold">· اخترتما معاً!</span></span>
              </span>
            </div>
            <div className="flex justify-end items-end gap-1">
              <span className="h-bubble-mine rounded-[18px] rounded-be-md px-3 py-2 max-w-[78%]">
                تطابقنا 😂 خلنا نخطط لها
                <span className="flex items-center justify-end gap-1 text-[10px] text-white/80 mt-0.5">9:41 <CheckCheck size={12} className="text-[#7DD3FC]" /></span>
              </span>
            </div>
            <div className="flex justify-start">
              <span className="bg-h-card border border-h-border rounded-[18px] rounded-bs-md px-3.5 py-2.5 flex gap-1">
                {[0, 1, 2].map((k) => <span key={k} className="h-typing-dot w-1.5 h-1.5 rounded-full bg-h-text2" />)}
              </span>
            </div>
          </div>

          {/* شريط الكتابة */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-h-card border-t border-h-border">
            <Plus size={20} className="text-h-primary" />
            <Smile size={20} className="text-h-text2" />
            <span className="flex-1 h-9 rounded-full bg-h-input px-3 flex items-center text-[12px] text-h-text2">اكتب رسالة…</span>
            <span className="w-9 h-9 rounded-full h-gradient flex items-center justify-center"><Mic size={16} className="text-white" /></span>
          </div>
        </div>
      </div>

      {/* شارات عائمة */}
      <span className="h-float absolute -start-6 sm:-start-14 top-24 flex items-center gap-2 rounded-2xl bg-h-card border border-h-border h-shadow px-3 py-2 text-[12px] font-bold text-h-text">
        <span className="w-7 h-7 rounded-full h-gradient flex items-center justify-center"><Heart size={14} className="fill-white text-white" /></span> تطابق جديد!
      </span>
      <span className="h-float-delay absolute -end-4 sm:-end-12 bottom-36 flex items-center gap-1.5 rounded-2xl bg-h-card border border-h-border h-shadow px-3 py-2 text-[12px] font-bold text-h-text">
        <CheckCheck size={15} className="text-[#38BDF8]" /> قُرئت الآن
      </span>
    </div>
  );
}

function Bubble({ children, mine }: { children: React.ReactNode; mine?: boolean }) {
  return (
    <div className={mine ? "flex justify-end" : "flex justify-start"}>
      <span className={mine ? "h-bubble-mine rounded-[18px] rounded-be-md px-3 py-2 max-w-[78%]" : "bg-h-card text-h-text border border-h-border rounded-[18px] rounded-bs-md px-3 py-2 max-w-[78%]"}>
        {children}
      </span>
    </div>
  );
}
