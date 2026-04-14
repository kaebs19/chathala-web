"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  MessageCircle,
  Heart,
  Flag,
  MapPin,
  Calendar,
  Crown,
  Shield,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import Button from "@/components/ui/Button";
import ReportModal from "@/components/ui/ReportModal";
import Lightbox from "@/components/ui/Lightbox";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import { toast } from "@/components/ui/Toast";
import { userAPI, chatAPI, exploreAPI } from "@/lib/api";
import { getAge, getImageUrl, formatDate } from "@/lib/utils";
import type { User } from "@/types";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [heroImgError, setHeroImgError] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      try {
        const res = (await userAPI.getProfile(userId)) as {
          success: boolean;
          data?: { user?: User } | User;
        };
        if (res.success && res.data) {
          const u = res.data && "user" in (res.data as object)
            ? (res.data as { user: User }).user
            : (res.data as User);
          setProfile(u);
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    }
    if (userId) {
      loadProfile();
      // Record visit (fire and forget)
      userAPI.recordVisit(userId).catch(() => {});
    }
  }, [userId]);

  const handleLike = async () => {
    setActionLoading("like");
    try {
      const res = (await exploreAPI.swipe(userId, "like")) as {
        success: boolean;
        data?: { match?: boolean };
      };
      if (res.data?.match) {
        toast(`تطابق مع ${profile?.name}! 🎉`, "success", 4000);
      } else {
        toast("تم إرسال الإعجاب", "success");
      }
    } catch {
      toast("حدث خطأ", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMessage = async () => {
    setActionLoading("message");
    try {
      const res = (await chatAPI.sendRequest(userId)) as {
        success: boolean;
        data?: { conversation?: { _id: string } } | { _id: string };
        message?: string;
      };
      if (res.success && res.data) {
        const conv = res.data && "conversation" in (res.data as object)
          ? (res.data as { conversation: { _id: string } }).conversation
          : (res.data as { _id: string });
        if (conv?._id) router.push(`/chats/${conv._id}`);
        else router.push("/chats");
      } else {
        toast(res.message || "فشل إرسال الطلب", "error");
      }
    } catch {
      toast("حدث خطأ", "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) return <ProfileSkeleton />;

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary">
            <ArrowRight size={22} />
          </button>
          <h1 className="text-xl font-black">الملف الشخصي</h1>
        </div>
        <div className="text-center py-20">
          <p className="text-text-muted">لم يتم العثور على المستخدم</p>
        </div>
      </div>
    );
  }

  const age = profile.birthDate ? getAge(profile.birthDate) : profile.age;
  const allPhotos = [
    ...(profile.profileImage ? [profile.profileImage] : []),
    ...(profile.photos?.filter(p => p !== profile.profileImage) || []),
  ];
  const heroImage = profile.profileImage && !heroImgError ? getImageUrl(profile.profileImage) : null;

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Back button */}
      <div className="sticky top-0 z-20 flex items-center gap-3 p-4 glass border-b border-border">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary">
          <ArrowRight size={22} />
        </button>
        <h1 className="text-base font-black flex-1">{profile.name}</h1>
        <button
          onClick={() => setShowReport(true)}
          className="p-2 text-error/60 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
        >
          <Flag size={18} />
        </button>
      </div>

      {/* Hero — Cover image */}
      <div className="relative">
        <button
          onClick={() => heroImage && setLightboxIndex(0)}
          className="block w-full aspect-[4/5] max-h-[500px] bg-bg-card relative overflow-hidden"
        >
          {heroImage ? (
            <img
              src={heroImage}
              alt={profile.name}
              onError={() => setHeroImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full gradient-bg flex items-center justify-center">
              <span className="text-8xl font-black text-white/80">
                {profile.name?.[0] || "?"}
              </span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
        </button>

        {/* Floating Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-3xl font-black text-white">{profile.name}</h2>
                {age && <span className="text-2xl text-white/80 font-bold">{age}</span>}
                {profile.isVerified && (
                  <span className="bg-accent-pink text-white p-1 rounded-full" title="موثّق">
                    <CheckCircle2 size={14} />
                  </span>
                )}
                {profile.isPremium && (
                  <span className="bg-warning/90 text-bg-primary px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                    <Crown size={12} />
                    Premium
                  </span>
                )}
              </div>
              {profile.halaId && (
                <p className="text-accent-pink text-sm font-medium mt-1">@{profile.halaId}</p>
              )}
            </div>

            {/* Online indicator */}
            {profile.isOnline ? (
              <div className="flex items-center gap-1.5 bg-success/20 border border-success/40 text-success px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                متصل الآن
              </div>
            ) : profile.lastSeen ? (
              <div className="flex items-center gap-1.5 bg-bg-card/70 text-text-muted px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                <Clock size={12} />
                {formatDate(profile.lastSeen)}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-5 py-6 space-y-5">
        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {profile.country && (
            <div className="bg-bg-card border border-border rounded-2xl p-3 text-center">
              <MapPin size={16} className="text-accent-pink mx-auto mb-1" />
              <p className="text-xs text-text-muted mb-0.5">البلد</p>
              <p className="text-sm font-bold truncate">{profile.country}</p>
            </div>
          )}
          {profile.city && (
            <div className="bg-bg-card border border-border rounded-2xl p-3 text-center">
              <MapPin size={16} className="text-accent-purple mx-auto mb-1" />
              <p className="text-xs text-text-muted mb-0.5">المدينة</p>
              <p className="text-sm font-bold truncate">{profile.city}</p>
            </div>
          )}
          {age && (
            <div className="bg-bg-card border border-border rounded-2xl p-3 text-center">
              <Calendar size={16} className="text-accent-pink mx-auto mb-1" />
              <p className="text-xs text-text-muted mb-0.5">العمر</p>
              <p className="text-sm font-bold">{age} سنة</p>
            </div>
          )}
          {profile.gender && (
            <div className="bg-bg-card border border-border rounded-2xl p-3 text-center">
              <Sparkles size={16} className="text-warning mx-auto mb-1" />
              <p className="text-xs text-text-muted mb-0.5">الجنس</p>
              <p className="text-sm font-bold">{profile.gender === "male" ? "ذكر" : "أنثى"}</p>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="bg-bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-bold text-text-muted mb-2 flex items-center gap-2">
              <Shield size={14} />
              نبذة
            </h3>
            <p className="text-base leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="bg-bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-bold text-text-muted mb-3 flex items-center gap-2">
              <Heart size={14} />
              الاهتمامات
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1.5 rounded-full bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Photos Gallery */}
        {allPhotos.length > 1 && (
          <div className="bg-bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-bold text-text-muted mb-3">
              الصور ({allPhotos.length})
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {allPhotos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className="aspect-square rounded-xl overflow-hidden bg-bg-input border border-border hover:opacity-80 hover:border-accent-pink/50 transition-all group relative"
                >
                  <img
                    src={getImageUrl(photo)}
                    alt={`صورة ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Member since */}
        {profile.createdAt && (
          <p className="text-xs text-text-muted/60 text-center">
            عضو منذ {new Date(profile.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long" })}
          </p>
        )}
      </div>

      {/* Sticky Actions */}
      <div className="sticky bottom-0 z-20 glass border-t border-border p-4">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Button
            onClick={handleMessage}
            isLoading={actionLoading === "message"}
            className="flex-1"
            size="lg"
          >
            <MessageCircle size={20} />
            محادثة
          </Button>
          <Button
            variant="outline"
            onClick={handleLike}
            isLoading={actionLoading === "like"}
            size="lg"
          >
            <Heart size={20} />
          </Button>
        </div>
      </div>

      {/* Report Modal */}
      {showReport && (
        <ReportModal
          userId={userId}
          userName={profile.name}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && allPhotos.length > 0 && (
        <Lightbox
          images={allPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
