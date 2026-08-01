"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { MessageCircleHeart, Sparkles, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeaturedUser {
  name: string;
  profileImage?: string;
  country?: string;
  isOnline?: boolean;
  isPremium?: boolean;
}

export default function Hero({ users = [] }: { users?: FeaturedUser[] }) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
  }, []);

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
          {loggedIn ? (
            <Link href="/chats">
              <Button size="lg" className="min-w-[200px] text-lg">
                <MessageCircleHeart size={22} />
                ادخل محادثاتك
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button size="lg" className="min-w-[200px] text-lg">
                <MessageCircleHeart size={22} />
                ابدأ الآن مجاناً
              </Button>
            </Link>
          )}
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

        {/* Users Showcase — replaces phone mockup */}
        <div
          className="mt-16 animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          {users.length > 0 ? (
            <div className="max-w-2xl mx-auto">
              <p className="text-sm text-text-muted mb-6">مستخدمون يتواصلون الآن</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {users.map((u, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-border/50 bg-bg-card/50 backdrop-blur-sm hover:border-accent-pink/30 hover:bg-bg-card transition-all cursor-default",
                      i < 4 && "animate-float"
                    )}
                    style={{ animationDelay: `${i * 0.3}s` }}
                  >
                    <Avatar
                      src={u.profileImage}
                      name={u.name}
                      size="lg"
                      isOnline={u.isOnline}
                      isPremium={u.isPremium}
                    />
                    <span className="text-xs font-bold truncate max-w-[80px]">{u.name}</span>
                    {u.country && (
                      <span className="text-[10px] text-text-muted">{u.country}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Fallback — animated avatars grid */
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-center -space-x-3 rtl:space-x-reverse">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-14 h-14 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg border-3 border-bg-primary shadow-lg",
                      i % 2 === 0 && "animate-float"
                    )}
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      zIndex: 7 - i,
                    }}
                  >
                    {["م", "ع", "ل", "ن", "س", "ح", "ر"][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-text-muted mt-4">
                آلاف المستخدمين ينتظرونك
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
