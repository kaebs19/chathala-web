"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Edit3,
  Camera,
  MapPin,
  Calendar,
  Crown,
  Shield,
  Heart,
  Settings,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuthStore } from "@/stores/authStore";
import { authAPI } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import Lightbox from "@/components/ui/Lightbox";
import { getAge, getImageUrl } from "@/lib/utils";
import type { User } from "@/types";
import { logError } from "@/lib/logger";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profileImage", file);
    try {
      const res = (await authAPI.uploadProfileImage(formData)) as {
        success: boolean;
        data?: { user?: User } | User;
      };
      if (res.success && res.data) {
        const updated = res.data && "user" in (res.data as object)
          ? (res.data as { user: User }).user
          : (res.data as User);
        if (updated) setUser(updated);
        toast("تم تحديث الصورة", "success");
      }
    } catch (err) {
      logError("profile", err);
      toast("فشل رفع الصورة", "error");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black">بروفايلي</h1>
        <Link href="/profile/edit">
          <Button variant="outline" size="sm">
            <Edit3 size={16} />
            تعديل
          </Button>
        </Link>
      </div>

      {/* Profile Card */}
      <Card className="text-center mb-6">
        <div className="relative inline-block mb-4">
          <Avatar
            src={user.profileImage}
            name={user.name}
            size="xl"
            isOnline
            isPremium={user.isPremium}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 left-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center border-2 border-bg-card hover:scale-110 transition-transform"
          >
            <Camera size={14} className="text-white" />
          </button>
        </div>
        <h2 className="text-2xl font-black">{user.name}</h2>
        {user.halaId && (
          <p className="text-accent-pink text-sm font-medium">
            @{user.halaId}
          </p>
        )}

        <div className="flex items-center justify-center gap-4 mt-3 text-sm text-text-muted">
          {user.birthDate && (
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {getAge(user.birthDate)} سنة
            </span>
          )}
          {user.country && (
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {user.country}
            </span>
          )}
        </div>

        {user.bio && (
          <p className="mt-4 text-text-muted text-sm leading-relaxed max-w-md mx-auto">
            {user.bio}
          </p>
        )}

        {user.isPremium && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 text-warning text-sm font-bold">
            <Crown size={16} />
            Premium
          </div>
        )}
      </Card>

      {/* Gallery */}
      {user.photos && user.photos.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold mb-3">الصور</h3>
          <div className="grid grid-cols-3 gap-2">
            {user.photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className="aspect-square rounded-xl overflow-hidden bg-bg-card border border-border hover:opacity-80 transition-opacity cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getImageUrl(photo, "medium")}
                  alt={`صورة ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {user.interests && user.interests.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold mb-3">الاهتمامات</h3>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest) => (
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

      {/* Quick Links */}
      <div className="space-y-2">
        <Link
          href="/settings"
          className="flex items-center gap-3 p-4 bg-bg-card border border-border rounded-xl hover:bg-bg-hover transition-colors"
        >
          <Settings size={20} className="text-text-muted" />
          <span className="font-medium text-sm">الإعدادات</span>
        </Link>
        <Link
          href="/settings/privacy"
          className="flex items-center gap-3 p-4 bg-bg-card border border-border rounded-xl hover:bg-bg-hover transition-colors"
        >
          <Shield size={20} className="text-text-muted" />
          <span className="font-medium text-sm">الخصوصية والأمان</span>
        </Link>
        {!user.isPremium && (
          <Link
            href="/premium"
            className="flex items-center gap-3 p-4 bg-warning/5 border border-warning/20 rounded-xl hover:bg-warning/10 transition-colors"
          >
            <Crown size={20} className="text-warning" />
            <span className="font-medium text-sm text-warning">
              اشترك في Premium
            </span>
          </Link>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && user.photos && (
        <Lightbox
          images={user.photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
