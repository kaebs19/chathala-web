"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, Crown, Eye, Pencil, Plus, Settings, Trash2, Calendar, MapPin, Lock } from "lucide-react";
import Avatar from "@/components/hala/Avatar";
import { NameBadges } from "@/components/hala/Badges";
import Button from "@/components/hala/Button";
import { Confirm } from "@/components/hala/Sheet";
import { IconButton, Row, Section, Spinner, TopBar } from "@/components/hala/Common";
import { toast } from "@/components/hala/Toast";
import { usePhotoViewer } from "@/components/hala/PhotoViewer";
import { InterestChips, useInterests } from "@/lib/interests";
import { authAPI, userAPI } from "@/lib/api";
import { compressImage } from "@/lib/image";
import { useAuthStore, myId } from "@/stores/authStore";
import { countryName } from "@/lib/countries";
import { ageOf, getImageUrl } from "@/lib/utils";
import type { Photo } from "@/types";

const MAX_GALLERY = 6;

export default function MyProfilePage() {
  const { user, loadUser } = useAuthStore();
  const interests = useInterests();
  const [gallery, setGallery] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState<"avatar" | "gallery" | null>(null);
  const [del, setDel] = useState<Photo | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const viewer = usePhotoViewer();
  const id = myId(user);

  const loadGallery = async () => {
    if (!id) return;
    // /auth/me يحوّل الصور لروابط بلا ترتيب — ملفي من مسار البروفايل فيه order (للحذف)
    const r = await userAPI.profile(id);
    const p = (r.data as { user?: { photos?: Photo[] } } | undefined)?.user?.photos;
    if (r.success && p) setGallery(p.filter((x) => (x.order || 0) > 0).sort((a, b) => (a.order || 0) - (b.order || 0)));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadGallery(); }, [id]);

  const upload = async (kind: "avatar" | "gallery", f?: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("اختر صورة");
    setUploading(kind);
    try {
      const { blob } = await compressImage(f, 1600, 0.9);
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
      const r = kind === "avatar" ? await authAPI.uploadProfileImage(file) : await authAPI.uploadGalleryPhoto(file);
      if (r.success) {
        toast.success(kind === "avatar" ? "تم تحديث صورتك" : "أُضيفت الصورة");
        await loadUser();
        await loadGallery();
      } else toast.error(r.message || "تعذّر رفع الصورة");
    } catch { toast.error("تعذّر قراءة الصورة"); }
    setUploading(null);
    if (avatarRef.current) avatarRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  };

  const removePhoto = async () => {
    if (!del) return;
    const r = await authAPI.deleteGalleryPhoto(del.order || 0);
    setDel(null);
    if (r.success) { toast.success("حُذفت الصورة"); loadGallery(); loadUser(); }
    else toast.error(r.message || "تعذّر الحذف");
  };

  if (!user) return <div className="py-20 flex justify-center"><Spinner /></div>;
  const age = ageOf(user.birthDate);
  const galleryUrls = gallery.map((p) => getImageUrl(p.original || p.medium));

  return (
    <div className="max-w-2xl mx-auto">
      <TopBar title="ملفي" actions={<Link href="/settings"><IconButton label="الإعدادات"><Settings size={21} /></IconButton></Link>} />
      <div className="px-4 py-5">
        {/* الرأس */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <button onClick={() => user.profileImage && viewer.open([getImageUrl(user.profileImage)])} aria-label="عرض الصورة">
              <Avatar src={user.profileImage} name={user.name} size="xxl" premium={user.isPremium} variant="medium" />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" hidden onChange={(e) => upload("avatar", e.target.files?.[0])} />
            <button onClick={() => avatarRef.current?.click()} aria-label="تغيير الصورة" disabled={!!uploading}
              className="absolute bottom-0 end-0 w-10 h-10 rounded-full h-gradient text-white flex items-center justify-center border-4 border-h-bg">
              {uploading === "avatar" ? <Spinner size={16} className="text-white" /> : <Camera size={17} />}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <h2 className="text-2xl font-extrabold">{user.name}{age ? `، ${age}` : ""}</h2>
            <NameBadges u={user} size={20} />
          </div>
          <div className="flex items-center gap-3 text-sm text-h-text2 mt-1">
            {user.country && <span className="flex items-center gap-1"><MapPin size={14} />{countryName(user.country)}</span>}
            {user.joinDate && <span className="flex items-center gap-1"><Calendar size={14} />انضم {new Date(user.joinDate).toLocaleDateString("ar-SA", { month: "long", year: "numeric" })}</span>}
          </div>
          <Link href="/profile/edit" className="mt-4 w-full max-w-xs"><Button variant="secondary" size="md"><Pencil size={17} /> تعديل الملف</Button></Link>
        </div>

        {/* هلا+ */}
        <Link href="/premium" className="block mt-6 rounded-2xl p-4 bg-gradient-to-l from-[#FFD600]/25 to-[#FF8C00]/15 border border-h-gold/40">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FFD600] to-[#FF8C00] flex items-center justify-center text-[#3A2400]"><Crown size={22} /></span>
            <div className="flex-1">
              <p className="font-extrabold">{user.isPremium ? "أنت مشترك في هلا+" : "اشترك في هلا+"}</p>
              <p className="text-xs text-h-text2 mt-0.5">
                {user.isPremium && user.premiumExpiresAt ? `يتجدّد/ينتهي في ${new Date(user.premiumExpiresAt).toLocaleDateString("ar-SA")}` : "من أعجب بك، زوّارك، صور أكثر، وأكثر"}
              </p>
            </div>
          </div>
        </Link>

        {/* النبذة والاهتمامات */}
        <Section title="نبذة" className="mt-6">
          <p className="px-4 py-3 text-[15px] leading-7 whitespace-pre-wrap">{user.bio || <span className="text-h-text2">لم تكتب نبذة بعد</span>}</p>
        </Section>
        {!!user.interests?.length && (
          <Section title="الاهتمامات"><div className="p-4"><InterestChips keys={user.interests} all={interests} /></div></Section>
        )}

        {/* المعرض */}
        <Section title={`صوري (${gallery.length}/${MAX_GALLERY})`}>
          <div className="p-3 grid grid-cols-3 gap-2">
            {gallery.map((p, i) => (
              <div key={p.order} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-h-chip group">
                <button onClick={() => viewer.open(galleryUrls, i)} className="w-full h-full" aria-label="عرض الصورة">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getImageUrl(p.medium || p.original)} alt="" className="w-full h-full object-cover" />
                </button>
                <button onClick={() => setDel(p)} aria-label="حذف الصورة" className="absolute top-1.5 end-1.5 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center"><Trash2 size={15} /></button>
              </div>
            ))}
            {gallery.length < MAX_GALLERY && (
              user.isPremium ? (
                <button onClick={() => galleryRef.current?.click()} disabled={!!uploading}
                  className="aspect-[3/4] rounded-xl border-2 border-dashed border-h-border flex flex-col items-center justify-center gap-1 text-h-text2 hover:border-h-primary hover:text-h-primary">
                  {uploading === "gallery" ? <Spinner size={22} /> : <><Plus size={26} /><span className="text-xs font-bold">إضافة</span></>}
                </button>
              ) : (
                <Link href="/premium" className="aspect-[3/4] rounded-xl border-2 border-dashed border-h-gold/50 flex flex-col items-center justify-center gap-1 text-h-warning text-center px-2">
                  <Lock size={22} /><span className="text-[11px] font-bold leading-4">صور المعرض لمشتركي هلا+</span>
                </Link>
              )
            )}
            <input ref={galleryRef} type="file" accept="image/*" hidden onChange={(e) => upload("gallery", e.target.files?.[0])} />
          </div>
        </Section>

        <Section>
          <Row icon={Eye} title="زوّار ملفي" href="/visitors" color="#8B5CF6" />
          <Row icon={Settings} title="الإعدادات" href="/settings" color="#6E6E78" />
        </Section>
      </div>
      <Confirm open={!!del} onClose={() => setDel(null)} onConfirm={removePhoto} danger confirmText="حذف" title="حذف الصورة؟" />
      {viewer.view}
    </div>
  );
}
