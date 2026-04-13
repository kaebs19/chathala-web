"use client";

import { useState, useEffect, useRef } from "react";
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
import { CardSkeleton } from "@/components/ui/Skeleton";
import type { SwipeCard, ApiResponse } from "@/types";

export default function ExplorePage() {
  const [cards, setCards] = useState<SwipeCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [swiping, setSwiping] = useState<"like" | "dislike" | null>(null);
  const [dragX, setDragX] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
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
      setPhotoIndex(0);
    }, 300);
  }

  const currentCard = cards[currentIndex];

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
      <div className="p-4 border-b border-border bg-bg-secondary flex items-center justify-between">
        <h1 className="text-xl font-black">اكتشاف</h1>
        {cards.length > 0 && (
          <span className="text-sm text-text-muted">{cards.length - currentIndex} متبقي</span>
        )}
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
