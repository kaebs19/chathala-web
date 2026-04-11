"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { Mail, MessageSquare, MapPin, Clock, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

const contactInfo = [
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    value: "support@chathala.com",
    description: "للاستفسارات العامة والدعم",
  },
  {
    icon: MessageSquare,
    title: "الدعم الفني",
    value: "داخل التطبيق",
    description: "أسرع طريقة للحصول على المساعدة",
  },
  {
    icon: Clock,
    title: "أوقات الدعم",
    value: "24/7",
    description: "فريق الدعم متاح على مدار الساعة",
  },
  {
    icon: MapPin,
    title: "الموقع",
    value: "المملكة العربية السعودية",
    description: "الرياض",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-black mb-4">اتصل بنا</h1>
        <p className="text-text-muted text-lg max-w-xl mx-auto">
          نحن هنا لمساعدتك! تواصل معنا لأي استفسار أو اقتراح
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-6">معلومات التواصل</h2>
          {contactInfo.map((info) => (
            <Card key={info.title} hover className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-pink/10 flex items-center justify-center shrink-0">
                <info.icon size={22} className="text-accent-pink" />
              </div>
              <div>
                <h3 className="font-bold text-sm">{info.title}</h3>
                <p className="text-accent-pink font-medium">{info.value}</p>
                <p className="text-text-muted text-sm">{info.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <div className="bg-bg-card border border-border rounded-2xl p-6 sm:p-8">
          {sent ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-success/10 mx-auto flex items-center justify-center mb-4">
                <Send size={28} className="text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2">تم الإرسال بنجاح!</h3>
              <p className="text-text-muted">
                شكراً لتواصلك معنا. سنرد عليك في أقرب وقت.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => setSent(false)}
              >
                إرسال رسالة أخرى
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-6">أرسل لنا رسالة</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="الاسم"
                    placeholder="اسمك الكريم"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="البريد الإلكتروني"
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
                  label="الموضوع"
                  placeholder="موضوع رسالتك"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    الرسالة
                  </label>
                  <textarea
                    className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-pink focus:ring-1 focus:ring-accent-pink/50 transition-colors min-h-[120px] resize-y"
                    placeholder="اكتب رسالتك هنا..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Send size={18} />
                  إرسال الرسالة
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
