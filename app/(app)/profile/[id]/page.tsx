"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, MessageCircle, Heart, Flag, MapPin, Calendar } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-text-muted hover:text-text-primary"
        >
          <ArrowRight size={22} />
        </button>
        <h1 className="text-xl font-black">الملف الشخصي</h1>
      </div>

      <div className="text-center">
        <Avatar name="مستخدم" size="xl" className="mx-auto mb-4" />
        <h2 className="text-2xl font-black">مستخدم</h2>
        <p className="text-text-muted text-sm mt-2">
          سيتم تحميل بيانات المستخدم #{userId}
        </p>

        <div className="flex items-center justify-center gap-3 mt-6">
          <Button>
            <MessageCircle size={18} />
            محادثة
          </Button>
          <Button variant="outline">
            <Heart size={18} />
            إعجاب
          </Button>
        </div>
      </div>
    </div>
  );
}
