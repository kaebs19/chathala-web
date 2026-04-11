"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Save } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { authAPI } from "@/lib/api";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = (await authAPI.updateProfile(form)) as {
        success: boolean;
        data?: typeof user;
      };
      if (res.success && res.data) {
        setUser(res.data);
        router.push("/profile");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-text-muted hover:text-text-primary"
        >
          <ArrowRight size={22} />
        </button>
        <h1 className="text-xl font-black">تعديل البروفايل</h1>
      </div>

      <div className="space-y-4">
        <Input
          label="الاسم"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            النبذة
          </label>
          <textarea
            className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-pink min-h-[100px] resize-y"
            placeholder="اكتب نبذة عنك..."
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            maxLength={500}
          />
          <p className="text-xs text-text-muted mt-1 text-left">
            {form.bio.length}/500
          </p>
        </div>

        <Button onClick={handleSave} isLoading={saving} className="w-full">
          <Save size={18} />
          حفظ التغييرات
        </Button>
      </div>
    </div>
  );
}
