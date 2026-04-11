"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { MessageCircleHeart, Sparkles, ArrowLeft } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-pink/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-pink/30 bg-accent-pink/5 mb-8 animate-fade-in-up">
          <Sparkles size={16} className="text-accent-pink" />
          <span className="text-sm font-medium text-accent-pink">
            منصة التواصل العربية الأولى
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          تواصل، اكتشف
          <br />
          <span className="gradient-text">وابنِ علاقات حقيقية</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          انضم لآلاف المستخدمين العرب. دردش بخصوصية تامة، اكتشف أشخاص قريبين
          منك، واستمتع بتجربة تعارف آمنة ومميزة.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <Link href="/register">
            <Button size="lg" className="min-w-[200px] text-lg">
              <MessageCircleHeart size={22} />
              ابدأ الآن مجاناً
            </Button>
          </Link>
          <Link href="/download">
            <Button variant="outline" size="lg" className="min-w-[200px] text-lg">
              حمّل التطبيق
              <ArrowLeft size={18} />
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          {[
            { value: "+12,000", label: "مستخدم نشط" },
            { value: "+130,000", label: "محادثة" },
            { value: "+770,000", label: "رسالة" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black gradient-text">
                {stat.value}
              </div>
              <div className="text-sm text-text-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Phone Mockup Placeholder */}
        <div
          className="mt-16 animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="relative mx-auto w-72 h-[500px] bg-bg-card rounded-[3rem] border-2 border-border p-3 shadow-2xl shadow-accent-pink/10">
            <div className="w-full h-full bg-bg-input rounded-[2.3rem] flex items-center justify-center">
              <div className="text-center">
                <MessageCircleHeart
                  size={64}
                  className="text-accent-pink mx-auto mb-4 animate-float"
                />
                <p className="text-text-muted text-sm">
                  معاينة التطبيق
                </p>
              </div>
            </div>
            {/* Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-bg-primary rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
