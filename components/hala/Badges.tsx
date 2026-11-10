import { BadgeCheck, Crown } from "lucide-react";

export function VerifiedBadge({ size = 16 }: { size?: number }) {
  return <BadgeCheck size={size} className="text-[#3B82F6] shrink-0" aria-label="موثّق" />;
}
export function PremiumBadge({ size = 16 }: { size?: number }) {
  return <Crown size={size} className="text-h-gold shrink-0 fill-h-gold/30" aria-label="هلا+" />;
}
export function OfficialBadge({ size = 16 }: { size?: number }) {
  return (
    <span title="حساب رسمي" aria-label="حساب رسمي" className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size * 0.65} height={size * 0.65} fill="none" stroke="currentColor" strokeWidth="3.2"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    </span>
  );
}
export function NameBadges({ u, size = 16 }: { u?: { isVerified?: boolean; verification?: { isVerified?: boolean }; isPremium?: boolean; role?: string } | null; size?: number }) {
  if (!u) return null;
  const official = u.role === "admin" || u.role === "superadmin";
  return (
    <>
      {official && <OfficialBadge size={size} />}
      {(u.isVerified || u.verification?.isVerified) && !official && <VerifiedBadge size={size} />}
      {u.isPremium && <PremiumBadge size={size} />}
    </>
  );
}
