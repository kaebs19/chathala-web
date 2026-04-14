"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  X,
  Star,
  MapPin,
  Compass,
  RefreshCw,
  Send,
  SlidersHorizontal,
  CheckCircle2,
  Crown,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { exploreAPI, chatAPI } from "@/lib/api";
import { cn, getImageUrl } from "@/lib/utils";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { toast } from "@/components/ui/Toast";
import type { SwipeCard, ApiResponse } from "@/types";

interface Filters {
  onlineOnly: boolean;
  verifiedOnly: boolean;
  premiumOnly: boolean;
  ageMin: number;
  ageMax: number;
  country: string;
}

const DEFAULT_FILTERS: Filters = {
  onlineOnly: false,
  verifiedOnly: false,
  premiumOnly: false,
  ageMin: 18,
  ageMax: 60,
  country: "",
};

export default function ExplorePage() {
  const [cards, setCards] = useState<SwipeCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [swiping, setSwiping] = useState<"like" | "dislike" | null>(null);
  const router = useRouter();
  const [dragX, setDragX] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showQuickMsg, setShowQuickMsg] = useState(false);
  const [quickMsg, setQuickMsg] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const dragStartRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    loadCards();
  }, []);

  async function loadCards() {
    setIsLoading(true);
    try {
      // Server: { success, data: { cards: [...] } }
      const res = (await exploreAPI.getCards()) as {
        success: boolean;
        data?: { cards?: SwipeCard[] } | SwipeCard[];
      };
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.cards || [];
        setCards(list);
        setCurrentIndex(0);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Apply filters to cards
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      if (filters.onlineOnly && !c.isOnline) return false;
      if (filters.verifiedOnly && !c.isVerified) return false;
      if (filters.premiumOnly && !c.isPremium) return false;
      if (c.age && (c.age < filters.ageMin || c.age > filters.ageMax)) return false;
      if (filters.country && c.country && !c.country.toLowerCase().includes(filters.country.toLowerCase())) return false;
      return true;
    });
  }, [cards, filters]);

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (filters.onlineOnly) n++;
    if (filters.verifiedOnly) n++;
    if (filters.premiumOnly) n++;
    if (filters.ageMin !== 18 || filters.ageMax !== 60) n++;
    if (filters.country) n++;
    return n;
  }, [filters]);

  async function handleQuickMessage() {
    const card = filteredCards[currentIndex];
    if (!card || !quickMsg.trim() || sendingMsg) return;
    setSendingMsg(true);
    try {
      const res = (await chatAPI.sendRequest(card._id, quickMsg.trim())) as {
        success: boolean;
        data?: { conversation?: { _id: string } } | { _id: string };
        message?: string;
      };
      if (res.success && res.data) {
        toast(`تم إرسال رسالة لـ ${card.name}`, "success");
        setQuickMsg("");
        setShowQuickMsg(false);
        // Move to next card
        setTimeout(() => setCurrentIndex((i) => i + 1), 500);
      } else {
        toast(res.message || "فشل الإرسال", "error");
      }
    } catch {
      toast("حدث خطأ", "error");
    } finally {
      setSendingMsg(false);
    }
  }

  async function handleSwipe(action: "like" | "dislike" | "superlike") {
    const card = filteredCards[currentIndex];
    if (!card) return;

    setSwiping(action === "superlike" ? "like" : action);

    try {
      const res = await exploreAPI.swipe(card._id, action) as { success: boolean; data?: { match?: boolean } };
      if (res.data?.match) {
        toast(`تطابق مع ${card.name}! 🎉`, "success", 4000);
      }
    } catch {
      toast("حدث خطأ", "error");
    }

    setTimeout(() => {
      setSwiping(null);
      setCurrentIndex((i) => i + 1);
      setPhotoIndex(0);
    }, 300);
  }

  const currentCard = filteredCards[currentIndex];

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 border-b border-border bg-bg-secondary">
          <h1 className="text-xl font-black">اكتشاف</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!currentCard) {
    const hasFilters = activeFiltersCount > 0;
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <Compass size={64} className="text-text-muted/30 mx-auto mb-4" />
          <h2 className="text-xl font-black mb-2">
            {hasFilters ? "لا توجد نتائج بالفلاتر" : "لا توجد بطاقات حالياً"}
          </h2>
          <p className="text-text-muted mb-6">
            {hasFilters ? "جرّب تخفيف الفلاتر أو مسحها" : "عد لاحقاً"}
          </p>
          <div className="flex items-center justify-center gap-3">
            {hasFilters && (
              <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                <X size={18} />
                مسح الفلاتر
              </Button>
            )}
            <Button onClick={loadCards}>
              <RefreshCw size={18} />
              تحديث
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-bg-secondary flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black">اكتشاف</h1>
          {filteredCards.length > 0 && (
            <span className="text-xs text-text-muted bg-bg-input px-2 py-0.5 rounded-full">
              {filteredCards.length - currentIndex} متبقي
            </span>
          )}
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-input hover:bg-bg-hover text-sm font-medium transition-colors"
        >
          <SlidersHorizontal size={16} />
          فلاتر
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -left-1 w-5 h-5 bg-accent-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className={cn(
            "relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden border border-border shadow-2xl cursor-grab active:cursor-grabbing",
            swiping ? "transition-all duration-300" : "transition-transform duration-100",
            swiping === "like" && "translate-x-[120%] rotate-12 opacity-0",
            swiping === "dislike" && "-translate-x-[120%] -rotate-12 opacity-0"
          )}
          style={!swiping ? { transform: `translateX(${dragX}px) rotate(${dragX * 0.05}deg)` } : undefined}
          onTouchStart={(e) => { dragStartRef.current = e.touches[0].clientX; isDraggingRef.current = true; }}
          onTouchMove={(e) => { if (isDraggingRef.current) setDragX(e.touches[0].clientX - dragStartRef.current); }}
          onTouchEnd={() => {
            isDraggingRef.current = false;
            if (dragX > 100) handleSwipe("like");
            else if (dragX < -100) handleSwipe("dislike");
            setDragX(0);
          }}
          onMouseDown={(e) => { dragStartRef.current = e.clientX; isDraggingRef.current = true; }}
          onMouseMove={(e) => { if (isDraggingRef.current) setDragX(e.clientX - dragStartRef.current); }}
          onMouseUp={() => {
            isDraggingRef.current = false;
            if (dragX > 100) handleSwipe("like");
            else if (dragX < -100) handleSwipe("dislike");
            setDragX(0);
          }}
          onMouseLeave={() => { if (isDraggingRef.current) { isDraggingRef.current = false; setDragX(0); } }}
        >
          {/* Swipe Overlay */}
          {(swiping === "like" || dragX > 50) && (
            <div className="absolute top-8 right-8 z-20 border-4 border-success text-success font-black text-3xl px-4 py-1 rounded-xl rotate-[-20deg]" style={{ opacity: swiping ? 1 : Math.min((dragX - 50) / 50, 1) }}>
              LIKE
            </div>
          )}
          {(swiping === "dislike" || dragX < -50) && (
            <div className="absolute top-8 left-8 z-20 border-4 border-error text-error font-black text-3xl px-4 py-1 rounded-xl rotate-[20deg]" style={{ opacity: swiping ? 1 : Math.min((Math.abs(dragX) - 50) / 50, 1) }}>
              NOPE
            </div>
          )}

          {/* Image */}
          <div className="absolute inset-0 bg-bg-card">
            {(() => {
              const allPhotos = [
                currentCard.profileImage,
                ...(currentCard.photos || []),
              ].filter(Boolean) as string[];
              const currentPhoto = allPhotos[photoIndex] || currentCard.profileImage;
              return currentPhoto ? (
                <img
                  src={getImageUrl(currentPhoto)}
                  alt={currentCard.name}
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-bg-input">
                  <Avatar name={currentCard.name} size="xl" />
                </div>
              );
            })()}
          </div>

          {/* Photo Navigation Areas */}
          {(() => {
            const allPhotos = [currentCard.profileImage, ...(currentCard.photos || [])].filter(Boolean);
            if (allPhotos.length <= 1) return null;
            return (
              <>
                <div className="absolute top-0 left-0 w-1/2 h-1/3 z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => Math.max(0, i - 1)); }} />
                <div className="absolute top-0 right-0 w-1/2 h-1/3 z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => Math.min(allPhotos.length - 1, i + 1)); }} />
                <div className="absolute top-3 left-0 right-0 z-20 flex justify-center gap-1.5 px-4">
                  {allPhotos.map((_, i) => (
                    <div key={i} className={cn("h-1 rounded-full flex-1 transition-colors", i === photoIndex ? "bg-white" : "bg-white/30")} />
                  ))}
                </div>
              </>
            );
          })()}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-5 pb-6">
            {/* Name + age + badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h2 className="text-3xl font-black text-white">{currentCard.name}</h2>
              {currentCard.age && <span className="text-2xl text-white/80 font-bold">{currentCard.age}</span>}
              {currentCard.isVerified && (
                <span className="bg-accent-pink text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  موثّق
                </span>
              )}
              {currentCard.isPremium && (
                <span className="bg-warning text-bg-primary text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Crown size={11} />
                  Premium
                </span>
              )}
              {currentCard.isOnline && (
                <span className="flex items-center gap-1 bg-success/20 border border-success/40 text-success text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                  متصل
                </span>
              )}
            </div>

            {/* Location info */}
            <div className="flex items-center flex-wrap gap-2 text-white/80 text-sm mb-3">
              {currentCard.country && (
                <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <MapPin size={12} />
                  <span>{currentCard.country}</span>
                  {currentCard.city && <span className="text-white/60">· {currentCard.city}</span>}
                </span>
              )}
              {currentCard.distance !== undefined && currentCard.distance !== null && (
                <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <MapPin size={12} />
                  {currentCard.distance} كم
                </span>
              )}
              {currentCard.gender && (
                <span className="bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs">
                  {currentCard.gender === "male" ? "♂ ذكر" : "♀ أنثى"}
                </span>
              )}
            </div>

            {/* Bio */}
            {currentCard.bio && (
              <p className="text-white/90 text-sm leading-relaxed mb-3 line-clamp-3">
                {currentCard.bio}
              </p>
            )}

            {/* Interests */}
            {currentCard.interests && currentCard.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {currentCard.interests.slice(0, 5).map((interest) => (
                  <span key={interest} className="px-2.5 py-1 rounded-full bg-accent-pink/80 backdrop-blur-sm text-white text-xs font-medium">
                    {interest}
                  </span>
                ))}
                {currentCard.interests.length > 5 && (
                  <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs">
                    +{currentCard.interests.length - 5}
                  </span>
                )}
              </div>
            )}

            {/* View full profile link */}
            <Link
              href={`/profile/${currentCard._id}`}
              className="mt-3 inline-flex items-center gap-1 text-xs text-white/70 hover:text-white underline underline-offset-2"
            >
              عرض الملف الكامل ←
            </Link>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4 p-6">
        <button
          onClick={() => handleSwipe("dislike")}
          className="w-14 h-14 rounded-full border-2 border-error/50 flex items-center justify-center hover:bg-error/10 transition-colors"
          title="تخطي"
        >
          <X size={26} className="text-error" />
        </button>
        <button
          onClick={() => setShowQuickMsg(true)}
          className="w-14 h-14 rounded-full border-2 border-accent-purple/50 bg-accent-purple/5 flex items-center justify-center hover:bg-accent-purple/10 transition-colors"
          title="رسالة سريعة"
        >
          <Send size={22} className="text-accent-purple" />
        </button>
        <button
          onClick={() => handleSwipe("superlike")}
          className="w-14 h-14 rounded-full border-2 border-warning/50 flex items-center justify-center hover:bg-warning/10 transition-colors"
          title="Super Like"
        >
          <Star size={22} className="text-warning" />
        </button>
        <button
          onClick={() => handleSwipe("like")}
          className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center shadow-lg shadow-accent-pink/30 hover:scale-105 transition-transform"
          title="إعجاب"
        >
          <Heart size={26} className="text-white" />
        </button>
      </div>

      {/* Quick Message Modal */}
      {showQuickMsg && currentCard && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowQuickMsg(false)}>
          <div className="bg-bg-secondary border border-border rounded-2xl p-5 max-w-md w-full animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={currentCard.profileImage} name={currentCard.name} size="md" />
              <div className="flex-1">
                <h3 className="font-black text-base">رسالة لـ {currentCard.name}</h3>
                <p className="text-xs text-text-muted">ابدأ المحادثة برسالة مميزة</p>
              </div>
              <button onClick={() => setShowQuickMsg(false)} className="text-text-muted">
                <X size={20} />
              </button>
            </div>

            {/* Templates */}
            <div className="flex flex-wrap gap-2 mb-3">
              {["👋 هلا", "😊 كيف حالك؟", "✨ بروفايلك جذاب", "🌸 مرحبا، ممكن نتعرف؟"].map((tpl) => (
                <button
                  key={tpl}
                  onClick={() => setQuickMsg(tpl)}
                  className="text-xs px-3 py-1.5 rounded-full bg-bg-input hover:bg-bg-hover text-text-primary transition-colors"
                >
                  {tpl}
                </button>
              ))}
            </div>

            <textarea
              value={quickMsg}
              onChange={(e) => setQuickMsg(e.target.value)}
              placeholder="اكتب رسالة قصيرة..."
              maxLength={200}
              autoFocus
              className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-pink min-h-[80px] resize-y mb-3"
            />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-text-muted">{quickMsg.length}/200</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowQuickMsg(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-border text-sm font-bold hover:bg-bg-hover"
              >
                إلغاء
              </button>
              <button
                onClick={handleQuickMessage}
                disabled={!quickMsg.trim() || sendingMsg}
                className="flex-1 py-2.5 px-4 rounded-xl gradient-bg text-white text-sm font-bold disabled:opacity-50 shadow-md shadow-accent-pink/20"
              >
                {sendingMsg ? "جاري الإرسال..." : "إرسال"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowFilters(false)}>
          <div className="bg-bg-secondary border border-border rounded-2xl p-5 max-w-md w-full animate-fade-in-up max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-lg flex items-center gap-2">
                <SlidersHorizontal size={18} />
                فلاتر الاكتشاف
              </h3>
              <button onClick={() => setShowFilters(false)} className="text-text-muted">
                <X size={20} />
              </button>
            </div>

            {/* Toggles */}
            <div className="space-y-3 mb-5">
              {[
                { key: "onlineOnly" as const, label: "متصلون فقط", icon: "🟢" },
                { key: "verifiedOnly" as const, label: "موثّقون فقط", icon: "✓", iconEl: <CheckCircle2 size={16} className="text-accent-pink" /> },
                { key: "premiumOnly" as const, label: "Premium فقط", icon: "👑", iconEl: <Crown size={16} className="text-warning" /> },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-3 bg-bg-card border border-border rounded-xl cursor-pointer">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {item.iconEl || <span>{item.icon}</span>}
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={filters[item.key]}
                    onChange={(e) => setFilters((f) => ({ ...f, [item.key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-bg-input rounded-full peer-checked:bg-accent-pink transition-colors after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:-translate-x-5" onClick={(e) => {
                    e.preventDefault();
                    setFilters((f) => ({ ...f, [item.key]: !f[item.key] }));
                  }} />
                </label>
              ))}
            </div>

            {/* Age Range */}
            <div className="mb-5 p-4 bg-bg-card border border-border rounded-xl">
              <label className="text-sm font-bold mb-3 block">
                العمر: <span className="text-accent-pink">{filters.ageMin} - {filters.ageMax}</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={filters.ageMin}
                  onChange={(e) => setFilters((f) => ({ ...f, ageMin: Math.max(18, Number(e.target.value)) }))}
                  className="flex-1 bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-center"
                />
                <span className="self-center text-text-muted">—</span>
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={filters.ageMax}
                  onChange={(e) => setFilters((f) => ({ ...f, ageMax: Math.min(99, Number(e.target.value)) }))}
                  className="flex-1 bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-center"
                />
              </div>
            </div>

            {/* Country */}
            <div className="mb-5 p-4 bg-bg-card border border-border rounded-xl">
              <label className="text-sm font-bold mb-2 block">البلد</label>
              <input
                type="text"
                placeholder="اكتب اسم البلد..."
                value={filters.country}
                onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value }))}
                className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-border text-sm font-bold hover:bg-bg-hover"
              >
                إعادة تعيين
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 py-2.5 px-4 rounded-xl gradient-bg text-white text-sm font-bold shadow-md shadow-accent-pink/20"
              >
                تطبيق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
