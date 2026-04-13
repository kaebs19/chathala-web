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
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { api, chatAPI, exploreAPI } from "@/lib/api";
import { getAge, getImageUrl } from "@/lib/utils";
import type { User } from "@/types";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = (await api(`/users/${userId}`)) as {
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
        // fallback silently
      } finally {
        setIsLoading(false);
      }
    }
    if (userId) loadProfile();
  }, [userId]);

  const handleLike = async () => {
    setActionLoading("like");
    try {
      await exploreAPI.swipe(userId, "like");
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
      };
      if (res.success && res.data) {
        const conv = res.data && "conversation" in (res.data as object)
          ? (res.data as { conversation: { _id: string } }).conversation
          : (res.data as { _id: string });
        if (conv?._id) router.push(`/chats/${conv._id}`);
        else router.push("/chats");
      }
    } catch {
      router.push("/chats");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-accent-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary">
          <ArrowRight size={22} />
        </button>
        <h1 className="text-xl font-black">الملف الشخصي</h1>
      </div>

      <Card className="text-center mb-6">
        <div className="relative inline-block mb-4">
          <Avatar
            src={profile.profileImage}
            name={profile.name}
            size="xl"
            isOnline={profile.isOnline}
            isPremium={profile.isPremium}
          />
        </div>
        <h2 className="text-2xl font-black">{profile.name}</h2>
        {profile.halaId && (
          <p className="text-accent-pink text-sm font-medium">@{profile.halaId}</p>
        )}

        <div className="flex items-center justify-center gap-4 mt-3 text-sm text-text-muted">
          {profile.birthDate && (
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {getAge(profile.birthDate)} سنة
            </span>
          )}
          {profile.age && !profile.birthDate && (
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {profile.age} سنة
            </span>
          )}
          {profile.country && (
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {profile.country}
            </span>
          )}
        </div>

        {profile.isVerified && (
          <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent-pink/10 text-accent-pink text-xs font-bold">
            <Shield size={12} />
            موثّق
          </div>
        )}

        {profile.bio && (
          <p className="mt-4 text-text-muted text-sm leading-relaxed max-w-md mx-auto">
            {profile.bio}
          </p>
        )}

        {profile.isPremium && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 text-warning text-sm font-bold">
            <Crown size={16} />
            Premium
          </div>
        )}
      </Card>

      {/* Gallery */}
      {profile.photos && profile.photos.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold mb-3">الصور</h3>
          <div className="grid grid-cols-3 gap-2">
            {profile.photos.map((photo, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl overflow-hidden bg-bg-card border border-border"
              >
                <img
                  src={getImageUrl(photo)}
                  alt={`صورة ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold mb-3">الاهتمامات</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1.5 rounded-full bg-accent-pink/10 text-accent-pink text-sm font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <Button onClick={handleMessage} isLoading={actionLoading === "message"}>
          <MessageCircle size={18} />
          محادثة
        </Button>
        <Button variant="outline" onClick={handleLike} isLoading={actionLoading === "like"}>
          <Heart size={18} />
          إعجاب
        </Button>
      </div>
    </div>
  );
}
