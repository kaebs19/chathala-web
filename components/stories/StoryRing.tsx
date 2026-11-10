"use client";

import Avatar from "@/components/hala/Avatar";
import { cn } from "@/lib/utils";

const SIZES = { xs: 28, sm: 40, md: 52, lg: 64, xl: 96, xxl: 120 } as const;

/** صورة داخل حلقة: مقطع لكل قصة — متدرّج إن وُجد غير مشاهَد، رمادي إن شوهد الكل */
export default function StoryRing({
  src, name, size = "lg", count = 0, unseen = false, onClick, label, className, online,
}: {
  src?: string | null; name?: string; size?: keyof typeof SIZES; count?: number; unseen?: boolean;
  onClick?: () => void; label?: string; className?: string; online?: boolean;
}) {
  const px = SIZES[size];
  const stroke = px >= 64 ? 3 : 2.5;
  const gap = 4; // بين الحلقة والصورة
  const outer = px + (stroke + gap) * 2;
  const r = (outer - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const n = Math.max(1, Math.min(count || 1, 30));
  const segGap = n > 1 ? Math.min(6, circ / n / 4) : 0;
  const seg = circ / n - segGap;
  const gid = `ring-${Math.round(px)}-${n}`;
  const inner = (
    <span className="relative inline-flex items-center justify-center shrink-0" style={{ width: outer, height: outer }}>
      {count > 0 && (
        <svg className="absolute inset-0 -rotate-90" width={outer} height={outer} aria-hidden>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--h-primary)" />
              <stop offset="100%" stopColor="var(--h-accent)" />
            </linearGradient>
          </defs>
          <circle cx={outer / 2} cy={outer / 2} r={r} fill="none"
            stroke={unseen ? `url(#${gid})` : "var(--h-border)"} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={n > 1 ? `${seg} ${segGap}` : undefined} />
        </svg>
      )}
      <Avatar src={src} name={name} size={size} online={online} />
    </span>
  );
  if (!onClick) return <span className={className}>{inner}</span>;
  return (
    <button type="button" onClick={onClick} aria-label={label || (name ? `قصص ${name}` : "القصص")} className={cn("rounded-full", className)}>
      {inner}
    </button>
  );
}
