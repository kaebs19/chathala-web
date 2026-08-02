"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, Crown, Lock, CheckCircle2, MapPin } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { userAPI } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { logError } from "@/lib/logger";

interface Visitor {
  viewer: {
    _id: string;
    name: string;
    profileImage?: string;
    country?: string;
    isVerified?: boolean;
    isPremium?: boolean;
  };
  createdAt: string;
}

export default function VisitorsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = (await userAPI.getVisitors()) as {
          success: boolean;
          data?: { views?: Visitor[]; totalViews?: number; hiddenCount?: number };
        };
        if (res.success && res.data) {
          setVisitors(res.data.views || []);
          setTotalViews(res.data.totalViews || 0);
        }
      } catch (err) {
        logError("visitors", err);
        // silent
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const isPremium = user?.isPremium;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary">
          <ArrowRight size={22} />
        </button>
        <h1 className="text-xl font-black">زوّار ملفك</h1>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-accent-pink/10 to-accent-purple/10 border border-accent-pink/20 rounded-2xl p-6 mb-6 text-center">
        <Eye size={32} className="text-accent-pink mx-auto mb-2" />
        <p className="text-4xl font-black mb-1">{totalViews}</p>
        <p className="text-sm text-text-muted">شخص شاهدوا ملفك</p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !isPremium ? (
        /* Premium Lock */
        <div className="bg-bg-card border border-warning/30 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-warning" />
          </div>
          <h3 className="font-black text-lg mb-2">ميزة Premium</h3>
          <p className="text-text-muted text-sm mb-6 leading-relaxed">
            اشترك في Premium لترى من شاهد ملفك الشخصي وتواصل معهم مباشرة
          </p>
          <Link href="/premium">
            <Button size="lg">
              <Crown size={20} />
              اشترك في Premium
            </Button>
          </Link>
        </div>
      ) : visitors.length === 0 ? (
        <div className="text-center py-20">
          <Eye size={48} className="text-text-muted/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">لا يوجد زوّار بعد</h3>
          <p className="text-text-muted text-sm">سيظهرون هنا عندما يشاهد أحد ملفك</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visitors.map((v, i) => (
            <Link
              key={`${v.viewer._id}-${i}`}
              href={`/profile/${v.viewer._id}`}
              className="flex items-center gap-3 p-3 bg-bg-card border border-border rounded-2xl hover:bg-bg-hover hover:border-accent-pink/30 transition-all"
            >
              <Avatar
                src={v.viewer.profileImage}
                name={v.viewer.name}
                size="md"
                isPremium={v.viewer.isPremium}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm truncate">{v.viewer.name}</h3>
                  {v.viewer.isVerified && (
                    <CheckCircle2 size={14} className="text-accent-pink shrink-0" />
                  )}
                </div>
                {v.viewer.country && (
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <MapPin size={10} />
                    <span>{v.viewer.country}</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-text-muted shrink-0">
                {formatDate(v.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
