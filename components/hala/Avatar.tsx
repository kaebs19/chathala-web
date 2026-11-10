"use client";
import { useState } from "react";
import { cn, getImageUrl, type ImageVariant } from "@/lib/utils";

const SIZES = { xs: 28, sm: 40, md: 52, lg: 64, xl: 96, xxl: 120 } as const;

/** AvatarView: صورة دائرية + نقطة الحضور + حلقة ذهبية لهلا+ */
export default function Avatar({
  src, name, size = "md", online, premium, className, variant,
}: { src?: string | null; name?: string; size?: keyof typeof SIZES; online?: boolean; premium?: boolean; className?: string; variant?: ImageVariant }) {
  const px = SIZES[size];
  const [failed, setFailed] = useState(false);
  const v = variant || (px <= 64 ? "thumb" : "medium");
  const url = src && !failed ? getImageUrl(src, v) : null;
  const initial = (name || "؟").trim().charAt(0);
  const dot = Math.max(10, Math.round(px * 0.24));
  return (
    <span className={cn("relative inline-flex shrink-0", className)} style={{ width: px, height: px }}>
      <span className={cn("rounded-full overflow-hidden w-full h-full flex items-center justify-center bg-h-chip",
        premium && "ring-2 ring-h-gold ring-offset-2 ring-offset-h-card")}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={name ? `صورة ${name}` : ""} className="w-full h-full object-cover" loading="lazy" onError={() => setFailed(true)} />
        ) : (
          <span className="font-bold text-h-primary" style={{ fontSize: px * 0.4 }}>{initial}</span>
        )}
      </span>
      {online && (
        <span className="absolute bottom-0 end-0 rounded-full bg-[#22C55E] border-2 border-h-card" style={{ width: dot, height: dot }} aria-label="متصل" />
      )}
    </span>
  );
}
