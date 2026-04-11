"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  X,
  Star,
  MapPin,
  Compass,
  RefreshCw,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { exploreAPI } from "@/lib/api";
import { cn, getImageUrl } from "@/lib/utils";
import type { SwipeCard, ApiResponse } from "@/types";

export default function ExplorePage() {
  const [cards, setCards] = useState<SwipeCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [swiping, setSwiping] = useState<"like" | "dislike" | null>(null);

  useEffect(() => {
    loadCards();
  }, []);

  async function loadCards() {
    setIsLoading(true);
    try {
      const res = (await exploreAPI.getCards()) as ApiResponse<SwipeCard[]>;
      if (res.success && res.data) {
        setCards(res.data);
        setCurrentIndex(0);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSwipe(action: "like" | "dislike" | "superlike") {
    const card = cards[currentIndex];
    if (!card) return;

    setSwiping(action === "superlike" ? "like" : action);

    try {
      await exploreAPI.swipe(card._id, action);
    } catch {
      // handle silently
    }

    setTimeout(() => {
      setSwiping(null);
      setCurrentIndex((i) => i + 1);
    }, 300);
  }

  const currentCard = cards[currentIndex];

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">جاري تحميل البطاقات...</p>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <Compass size={64} className="text-text-muted/30 mx-auto mb-4" />
          <h2 className="text-xl font-black mb-2">لا توجد بطاقات حالياً</h2>
          <p className="text-text-muted mb-6">
            عد لاحقاً أو وسّع نطاق البحث في الإعدادات
          </p>
          <Button onClick={loadCards}>
            <RefreshCw size={18} />
            تحديث
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-bg-secondary">
        <h1 className="text-xl font-black">اكتشاف</h1>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className={cn(
            "relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden border border-border shadow-2xl transition-all duration-300",
            swiping === "like" && "translate-x-20 rotate-6 opacity-0",
            swiping === "dislike" && "-translate-x-20 -rotate-6 opacity-0"
          )}
        >
          {/* Image */}
          <div className="absolute inset-0 bg-bg-card">
            {currentCard.profileImage ? (
              <img
                src={getImageUrl(currentCard.profileImage)}
                alt={currentCard.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-bg-input">
                <Avatar name={currentCard.name} size="xl" />
              </div>
            )}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-black text-white">
                {currentCard.name}
              </h2>
              {currentCard.age && (
                <span className="text-xl text-white/80">
                  {currentCard.age}
                </span>
              )}
              {currentCard.isVerified && (
                <span className="bg-accent-pink/20 text-accent-pink text-xs px-2 py-0.5 rounded-full">
                  موثّق
                </span>
              )}
            </div>
            {currentCard.country && (
              <div className="flex items-center gap-1 text-white/70 text-sm mb-2">
                <MapPin size={14} />
                <span>{currentCard.country}</span>
                {currentCard.distance && (
                  <span>· {currentCard.distance} كم</span>
                )}
              </div>
            )}
            {currentCard.bio && (
              <p className="text-white/60 text-sm line-clamp-2">
                {currentCard.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-6 p-6">
        <button
          onClick={() => handleSwipe("dislike")}
          className="w-16 h-16 rounded-full border-2 border-error/50 flex items-center justify-center hover:bg-error/10 transition-colors"
        >
          <X size={28} className="text-error" />
        </button>
        <button
          onClick={() => handleSwipe("superlike")}
          className="w-14 h-14 rounded-full border-2 border-warning/50 flex items-center justify-center hover:bg-warning/10 transition-colors"
        >
          <Star size={24} className="text-warning" />
        </button>
        <button
          onClick={() => handleSwipe("like")}
          className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center shadow-lg shadow-accent-pink/30 hover:scale-105 transition-transform"
        >
          <Heart size={28} className="text-white" />
        </button>
      </div>
    </div>
  );
}
