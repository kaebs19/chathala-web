"use client";

import { useRef, useState } from "react";
import { ShieldAlert, Upload, X, CheckCircle2, Languages } from "lucide-react";
import Button from "@/components/ui/Button";

// يُرسل مباشرة إلى الـ API لا عبر وكيل Next: حدّ الطلبات مفتاحه IP المرسل،
// والوكيل كان سيجعل كل الزوّار عنواناً واحداً (127.0.0.1) فيُحجبون معاً.
const ENDPOINT = "https://matchhala.chathala.com/api/public/removal-requests";
const MAX_FILES = 3;
const MAX_BYTES = 5 * 1024 * 1024;

type Lang = "ar" | "en";

const T = {
  ar: {
    title: "طلب إزالة محتوى",
    intro:
      "إن وجدت في هلا حساباً ينتحل شخصيتك أو يستعمل صورك، أو محتوى مسيئاً أو يخالف حقوقك، أرسل هذا النموذج — ولو لم يكن لديك حساب في التطبيق. يراجع فريق الإشراف كل طلب ويردّ على بريدك.",
    inApp: "مستخدم في هلا؟ الأسرع: زرّ «إبلاغ» داخل التطبيق على الحساب أو الرسالة أو القصة.",
    type: "نوع الطلب",
    types: {
      impersonation: "حساب ينتحل شخصيتي",
      my_photos: "صوري منشورة بلا إذن",
      offensive: "محتوى مسيء أو ضار",
      copyright: "حقوق ملكية فكرية",
      underage: "حساب لشخص دون 18 عاماً",
      other: "أخرى",
    },
    relation: "صفتك",
    relations: {
      self: "أنا الشخص المعني",
      representative: "أمثّل الشخص المعني (وليّ أمر، محامٍ…)",
      rights_holder: "صاحب الحقوق",
      other: "أخرى",
    },
    name: "اسمك",
    email: "بريدك الإلكتروني",
    emailHint: "نرسل إليه رقم الطلب والردّ. لا يظهر لأحد.",
    target: "الحساب أو المحتوى المقصود",
    targetHint: "رابط الحساب أو رقم Hala ID أو الاسم الظاهر في التطبيق — كل ما يساعدنا على إيجاده.",
    description: "اشرح الطلب",
    descriptionHint: "ما المحتوى، ولماذا يجب إزالته، ومنذ متى. (20 حرفاً على الأقل)",
    evidence: "لقطات شاشة (اختياري، حتى 3 صور)",
    evidenceHint: "JPG أو PNG أو WebP، 5MB لكل صورة. لا نطلب صورة هويتك.",
    addImage: "إضافة صورة",
    confirm:
      "أقرّ بأن المعلومات صحيحة على حدّ علمي، وأنني الشخص المعني أو مخوَّل بالتصرّف عنه. الطلبات الكاذبة قد تُرفض دون ردّ.",
    submit: "إرسال الطلب",
    sending: "جارٍ الإرسال…",
    doneTitle: "استلمنا طلبك",
    doneBody: "أرسلنا رقم الطلب إلى بريدك. سيراجعه فريق الإشراف ونردّ عليك على البريد نفسه.",
    reference: "الرقم المرجعي",
    another: "إرسال طلب آخر",
    tooBig: "حجم الصورة أكبر من 5MB",
    badType: "الصور فقط: JPG أو PNG أو WebP",
    network: "تعذّر الاتصال، تحقّق من الإنترنت وحاول مجدداً",
    privacy: "نستعمل هذه المعلومات لمعالجة طلبك فقط، وفق",
    privacyLink: "سياسة الخصوصية",
    switchLang: "English",
    childSafety: "بلاغ يخصّ سلامة طفل؟ راجع",
    childSafetyLink: "معايير سلامة الأطفال",
  },
  en: {
    title: "Content Removal Request",
    intro:
      "If you found an account on Hala impersonating you or using your photos, or content that is abusive or infringes your rights, submit this form — even if you don't have an account. Our moderation team reviews every request and replies by email.",
    inApp: "Already a Hala user? The fastest way is the in-app Report button on the profile, message or story.",
    type: "Request type",
    types: {
      impersonation: "An account is impersonating me",
      my_photos: "My photos are used without permission",
      offensive: "Offensive or harmful content",
      copyright: "Copyright / intellectual property",
      underage: "Account of a person under 18",
      other: "Other",
    },
    relation: "You are",
    relations: {
      self: "The person concerned",
      representative: "Representing the person (guardian, lawyer…)",
      rights_holder: "The rights holder",
      other: "Other",
    },
    name: "Your name",
    email: "Your email",
    emailHint: "We send the reference number and our reply here. It is not shown to anyone.",
    target: "Account or content concerned",
    targetHint: "Profile link, Hala ID, or the name shown in the app — anything that helps us find it.",
    description: "Describe your request",
    descriptionHint: "What the content is, why it should be removed, and since when. (At least 20 characters)",
    evidence: "Screenshots (optional, up to 3)",
    evidenceHint: "JPG, PNG or WebP, 5MB each. We never ask for your ID.",
    addImage: "Add image",
    confirm:
      "I confirm the information is accurate to the best of my knowledge, and that I am the person concerned or authorized to act on their behalf. False requests may be rejected without reply.",
    submit: "Submit request",
    sending: "Sending…",
    doneTitle: "We received your request",
    doneBody: "We emailed you the reference number. Our moderation team will review it and reply to the same address.",
    reference: "Reference",
    another: "Submit another request",
    tooBig: "Image is larger than 5MB",
    badType: "Images only: JPG, PNG or WebP",
    network: "Connection failed — check your internet and try again",
    privacy: "We use this information only to handle your request, as described in our",
    privacyLink: "Privacy Policy",
    switchLang: "العربية",
    childSafety: "Reporting a child safety concern? See our",
    childSafetyLink: "Child Safety Standards",
  },
} as const;

const fieldCls =
  "w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-pink focus:ring-1 focus:ring-accent-pink/50 transition-colors";

export default function RemovalForm() {
  const [lang, setLang] = useState<Lang>("ar");
  const t = T[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [type, setType] = useState("");
  const [relation, setRelation] = useState("self");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [target, setTarget] = useState("");
  const [description, setDescription] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [files, setFiles] = useState<{ file: File; url: string }[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [reference, setReference] = useState("");
  const honeypot = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setError("");
    const next = [...files];
    for (const f of Array.from(list)) {
      if (next.length >= MAX_FILES) break;
      if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { setError(t.badType); continue; }
      if (f.size > MAX_BYTES) { setError(t.tooBig); continue; }
      next.push({ file: f, url: URL.createObjectURL(f) });
    }
    setFiles(next);
    if (fileInput.current) fileInput.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("type", type);
      fd.append("relation", relation);
      fd.append("name", name);
      fd.append("email", email);
      fd.append("target", target);
      fd.append("description", description);
      fd.append("confirm", confirm ? "true" : "");
      fd.append("lang", lang);
      fd.append("website", honeypot.current?.value || "");
      files.forEach((f) => fd.append("evidence", f.file));

      const res = await fetch(ENDPOINT, { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setReference(data.data.reference);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError((lang === "en" ? data?.messageEn : data?.message) || t.network);
      }
    } catch {
      setError(t.network);
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setType(""); setRelation("self"); setTarget(""); setDescription("");
    setConfirm(false); files.forEach((f) => URL.revokeObjectURL(f.url)); setFiles([]); setReference(""); setError("");
  };

  return (
    <div dir={dir} lang={lang}>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl gradient-bg mx-auto flex items-center justify-center mb-4">
          <ShieldAlert size={32} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-3">{t.title}</h1>
        <button
          type="button"
          onClick={() => { setLang(lang === "ar" ? "en" : "ar"); setError(""); }}
          className="inline-flex items-center gap-1.5 min-h-10 px-3 -mx-3 rounded-full text-sm text-accent-pink hover:bg-accent-pink/10"
        >
          <Languages size={16} /> {t.switchLang}
        </button>
      </div>

      {reference ? (
        <div className="bg-bg-card border border-border rounded-2xl p-8 text-center">
          <CheckCircle2 size={48} className="text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">{t.doneTitle}</h2>
          <p className="text-text-muted leading-relaxed mb-6">{t.doneBody}</p>
          <p className="text-sm text-text-muted mb-1">{t.reference}</p>
          <p className="text-2xl font-black tracking-wider mb-8" dir="ltr">{reference}</p>
          <Button variant="secondary" onClick={reset}>{t.another}</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="bg-bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
          <p className="text-text-muted leading-relaxed">{t.intro}</p>
          <p className="text-sm bg-accent-pink/5 border border-accent-pink/20 rounded-xl px-4 py-3 text-text-secondary">{t.inApp}</p>

          <fieldset>
            <legend className="block text-sm font-medium text-text-secondary mb-3">{t.type}</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(t.types) as Array<keyof typeof t.types>).map((k) => (
                <label
                  key={k}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                    type === k ? "border-accent-pink bg-accent-pink/10" : "border-border hover:bg-bg-hover"
                  }`}
                >
                  <input type="radio" name="type" value={k} checked={type === k} onChange={() => setType(k)} required className="accent-[var(--accent-pink)]" />
                  <span className="text-sm">{t.types[k]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="rr-relation" className="block text-sm font-medium text-text-secondary mb-2">{t.relation}</label>
            <select id="rr-relation" value={relation} onChange={(e) => setRelation(e.target.value)} className={fieldCls}>
              {(Object.keys(t.relations) as Array<keyof typeof t.relations>).map((k) => (
                <option key={k} value={k}>{t.relations[k]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rr-name" className="block text-sm font-medium text-text-secondary mb-2">{t.name}</label>
              <input id="rr-name" className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={120} autoComplete="name" />
            </div>
            <div>
              <label htmlFor="rr-email" className="block text-sm font-medium text-text-secondary mb-2">{t.email}</label>
              <input id="rr-email" type="email" dir="ltr" className={fieldCls} value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={200} autoComplete="email" />
              <p className="text-xs text-text-muted mt-1.5">{t.emailHint}</p>
            </div>
          </div>

          <div>
            <label htmlFor="rr-target" className="block text-sm font-medium text-text-secondary mb-2">{t.target}</label>
            <input id="rr-target" className={fieldCls} value={target} onChange={(e) => setTarget(e.target.value)} required minLength={2} maxLength={500} />
            <p className="text-xs text-text-muted mt-1.5">{t.targetHint}</p>
          </div>

          <div>
            <label htmlFor="rr-description" className="block text-sm font-medium text-text-secondary mb-2">{t.description}</label>
            <textarea id="rr-description" rows={5} className={`${fieldCls} resize-y`} value={description} onChange={(e) => setDescription(e.target.value)} required minLength={20} maxLength={3000} />
            <p className="text-xs text-text-muted mt-1.5">{t.descriptionHint}</p>
          </div>

          <div>
            <span className="block text-sm font-medium text-text-secondary mb-2">{t.evidence}</span>
            <div className="flex flex-wrap gap-3">
              {files.map((f, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { URL.revokeObjectURL(f.url); setFiles(files.filter((_, j) => j !== i)); }}
                    className="absolute top-1 end-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                    aria-label="remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {files.length < MAX_FILES && (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-border hover:border-accent-pink text-text-muted hover:text-accent-pink flex flex-col items-center justify-center gap-1 text-xs transition-colors"
                >
                  <Upload size={20} /> {t.addImage}
                </button>
              )}
            </div>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => addFiles(e.target.files)} />
            <p className="text-xs text-text-muted mt-1.5">{t.evidenceHint}</p>
          </div>

          {/* حقل فخّ للروبوتات — مخفي عن البشر وقارئات الشاشة */}
          <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} required className="mt-1 accent-[var(--accent-pink)]" />
            <span className="text-sm text-text-secondary leading-relaxed">{t.confirm}</span>
          </label>

          {error && (
            <p role="alert" className="text-sm text-error bg-error/10 border border-error/30 rounded-xl px-4 py-3">{error}</p>
          )}

          <Button type="submit" size="lg" className="w-full" isLoading={sending} disabled={sending}>
            {sending ? t.sending : t.submit}
          </Button>

          <p className="text-xs text-text-muted leading-relaxed">
            {t.privacy}{" "}
            <a href={lang === "en" ? "/privacy/en" : "/privacy"} className="text-accent-pink hover:underline">{t.privacyLink}</a>.
            {" "}{t.childSafety}{" "}
            <a href="/child-safety" className="text-accent-pink hover:underline">{t.childSafetyLink}</a>.
          </p>
        </form>
      )}
    </div>
  );
}
