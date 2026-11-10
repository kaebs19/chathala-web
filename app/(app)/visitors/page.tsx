"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Eye, Lock, UserX } from "lucide-react";
import Button from "@/components/hala/Button";
import { CenterSpinner, EmptyState, TopBar } from "@/components/hala/Common";
import { VerifiedBadge } from "@/components/hala/Badges";
import { toast } from "@/components/hala/Toast";
import { userAPI } from "@/lib/api";
import { countryName } from "@/lib/countries";
import { formatDate, getImageUrl } from "@/lib/utils";

type View = {
  viewer: { _id: string | null; name: string | null; profileImage: string | null; country?: string | null; isVerified?: boolean; isDeactivatedAccount?: boolean; isSuspendedAccount?: boolean };
  createdAt: string;
};
type Data = { totalViews?: number; views?: View[]; page?: number; totalPages?: number; isPremiumRequired?: boolean };

export default function VisitorsPage() {
  const [views, setViews] = useState<View[]>([]);
  const [total, setTotal] = useState(0);
  const [locked, setLocked] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);

  const load = useCallback(async (p: number) => {
    if (p === 1) setLoading(true); else setMore(true);
    const res = await userAPI.visitors(p);
    const d = res.data as Data | undefined;
    if (res.success && d) {
      setViews((prev) => (p === 1 ? d.views || [] : [...prev, ...(d.views || [])]));
      setTotal(d.totalViews || 0);
      setLocked(!!d.isPremiumRequired);
      setPage(p);
      setTotalPages(d.totalPages || 1);
    } else if (!res.success) toast.error(res.message || "تعذّر جلب الزوّار");
    setLoading(false); setMore(false);
  }, []);

  useEffect(() => { load(1); }, [load]);

  return (
    <div className="max-w-3xl mx-auto">
      <TopBar title="الزوّار" back />
      {loading ? <CenterSpinner /> : !total ? (
        <EmptyState icon={Eye} title="لا زوّار بعد" text="حين يزور أحد ملفك يظهر هنا. أكمل ملفك ليظهر أكثر في الاكتشاف."
          action={<Link href="/profile/edit"><Button variant="secondary">تحسين ملفي</Button></Link>} />
      ) : (
        <div className="p-4 space-y-4">
          <p className="text-sm text-h-text2">زار ملفك <b className="text-h-text">{total}</b> {total === 1 ? "شخص" : "أشخاص"}</p>

          {locked && (
            <div className="rounded-2xl p-5 bg-gradient-to-br from-[#FFD600]/20 to-[#FF8C00]/15 border border-h-gold/40 text-center">
              <Crown size={32} className="text-h-gold mx-auto mb-2" />
              <h2 className="font-extrabold text-lg">اعرف من زار ملفك</h2>
              <p className="text-sm text-h-text2 mt-1 mb-4 leading-6">أسماء الزوّار وصورهم متاحة لمشتركي هلا+.</p>
              <Link href="/premium"><Button variant="gold">اشترك في هلا+</Button></Link>
            </div>
          )}

          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {views.map((v, i) => {
              // مخفي/موقوف: «مستخدم غير متاح» رمادي بلا صورة ولا رابط
              const gone = !!(v.viewer.isDeactivatedAccount || v.viewer.isSuspendedAccount);
              const card = (
                <div className={`aspect-[3/4] bg-h-chip relative ${gone ? "grayscale opacity-70" : ""}`}>
                  {gone ? (
                    <div className="w-full h-full flex items-center justify-center bg-h-chip"><UserX size={30} className="text-h-text2" /></div>
                  ) : v.viewer.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getImageUrl(v.viewer.profileImage, "medium")} alt={v.viewer.name ? `صورة ${v.viewer.name}` : ""} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-h-primary/25 to-h-secondary/25">
                      <Lock size={28} className="text-h-text2" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 pt-10 bg-gradient-to-t from-black/75 to-transparent text-white">
                    <p className="font-extrabold text-sm truncate flex items-center gap-1">
                      {gone ? "مستخدم غير متاح" : v.viewer.name || "زائر مخفي"} {!gone && v.viewer.isVerified && <VerifiedBadge size={14} />}
                    </p>
                    <p className="text-[11px] opacity-85 truncate">{[countryName(v.viewer.country), formatDate(v.createdAt)].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
              );
              return (
                <li key={`${v.viewer._id || "x"}-${v.createdAt}-${i}`} className="rounded-2xl overflow-hidden border border-h-border bg-h-card">
                  {gone ? card : v.viewer._id ? <Link href={`/profile/${v.viewer._id}`} className="block">{card}</Link>
                    : <Link href="/premium" className="block" aria-label="اشترك لرؤية الزائر">{card}</Link>}
                </li>
              );
            })}
          </ul>

          {!locked && page < totalPages && (
            <Button variant="secondary" loading={more} onClick={() => load(page + 1)}>المزيد</Button>
          )}
        </div>
      )}
    </div>
  );
}
