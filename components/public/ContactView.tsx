"use client";

import { useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { Mail, MessageSquare, MapPin, Clock, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

const ICONS = [Mail, MessageSquare, Clock, MapPin];

const T = {
  ar: {
    info: [
      ["البريد الإلكتروني", "info@chathala.com", "للاستفسارات العامة والدعم"],
      ["الدعم الفني", "داخل التطبيق", "أسرع طريقة للحصول على المساعدة"],
      ["أوقات الدعم", "24/7", "فريق الدعم متاح على مدار الساعة"],
      ["الموقع", "المملكة العربية السعودية", "الرياض"],
    ],
    failed: "تعذّر إرسال الرسالة، حاول مجدداً", offline: "تعذّر الاتصال، تحقّق من الإنترنت وحاول مجدداً",
    h1: "اتصل بنا", lead: "نحن هنا لمساعدتك! تواصل معنا لأي استفسار أو اقتراح", infoTitle: "معلومات التواصل",
    sentTitle: "تم الإرسال بنجاح!", sentBody: "شكراً لتواصلك معنا. سنرد عليك في أقرب وقت.", another: "إرسال رسالة أخرى",
    formTitle: "أرسل لنا رسالة", name: "الاسم", namePh: "اسمك الكريم", email: "البريد الإلكتروني", subject: "الموضوع", subjectPh: "موضوع رسالتك",
    message: "الرسالة", messagePh: "اكتب رسالتك هنا...", sending: "جارٍ الإرسال…", send: "إرسال الرسالة",
    reportA: "للإبلاغ عن حساب ينتحل شخصيتك أو محتوى مسيء استعمل", reportLink: "طلب إزالة محتوى",
  },
  en: {
    info: [
      ["Email", "info@chathala.com", "General questions and support"],
      ["Technical support", "Inside the app", "The fastest way to get help"],
      ["Support hours", "24/7", "The support team is available around the clock"],
      ["Location", "Saudi Arabia", "Riyadh"],
    ],
    failed: "We couldn’t send your message. Please try again.", offline: "Connection failed. Check your internet and try again.",
    h1: "Contact us", lead: "We are here to help — get in touch with any question or suggestion", infoTitle: "Contact details",
    sentTitle: "Message sent!", sentBody: "Thank you for getting in touch. We will reply as soon as we can.", another: "Send another message",
    formTitle: "Send us a message", name: "Name", namePh: "Your name", email: "Email", subject: "Subject", subjectPh: "What is it about?",
    message: "Message", messagePh: "Write your message here...", sending: "Sending…", send: "Send message",
    reportA: "To report an account impersonating you or abusive content, use", reportLink: "Request content removal",
  },
} as const;

export default function ContactView({ locale = "ar" }: { locale?: Locale }) {
  const t = T[locale];
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const honeypot = useRef<HTMLInputElement>(null);

  // مباشرة إلى الـ API لا عبر وكيل Next: حدّ الإرسال مفتاحه IP الزائر
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("https://matchhala.chathala.com/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, website: honeypot.current?.value || "" }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setSent(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setError((locale === "ar" && data?.message) || t.failed);
      }
    } catch {
      setError(t.offline);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-black mb-4">{t.h1}</h1>
        <p className="text-text-muted text-lg max-w-xl mx-auto">
          {t.lead}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-6">{t.infoTitle}</h2>
          {t.info.map(([title, value, description], i) => {
            const Icon = ICONS[i];
            return (
              <Card key={title} hover className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-pink/10 flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-accent-pink" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{title}</h3>
                  <p className="text-accent-pink font-medium">{value}</p>
                  <p className="text-text-muted text-sm">{description}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Contact Form */}
        <div className="bg-bg-card border border-border rounded-2xl p-6 sm:p-8">
          {sent ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-success/10 mx-auto flex items-center justify-center mb-4">
                <Send size={28} className="text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t.sentTitle}</h3>
              <p className="text-text-muted">
                {t.sentBody}
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => setSent(false)}
              >
                {t.another}
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-6">{t.formTitle}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t.name}
                    placeholder={t.namePh}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <Input
                    label={t.email}
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <Input
                  label={t.subject}
                  placeholder={t.subjectPh}
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    {t.message}
                  </label>
                  <textarea
                    className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-pink focus:ring-1 focus:ring-accent-pink/50 transition-colors min-h-[120px] resize-y"
                    placeholder={t.messagePh}
                    minLength={10}
                    maxLength={5000}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  />
                </div>
                {/* حقل فخّ للروبوتات — مخفي عن البشر */}
                <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                {error && (
                  <p role="alert" className="text-sm text-error bg-error/10 border border-error/30 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full" isLoading={sending} disabled={sending}>
                  <Send size={18} />
                  {sending ? t.sending : t.send}
                </Button>
                <p className="text-xs text-text-muted">
                  {t.reportA}{" "}
                  <a href="/report-content" className="text-accent-pink hover:underline">{t.reportLink}</a>.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
