"use client";

import { useState } from "react";
import { cn, getImageUrl } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
  isPremium?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-2xl",
};

/** rendered px — used for intrinsic width/height so avatars don't shift */
const pixelSize = { sm: 32, md: 48, lg: 64, xl: 96 };

/** 150px thumb covers every size here at 2x except xl (96px -> needs 192) */
const variantForSize = {
  sm: "thumb",
  md: "thumb",
  lg: "thumb",
  xl: "medium",
} as const;

const onlineDot = {
  sm: "w-2.5 h-2.5",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
  xl: "w-5 h-5",
};

const crownSize = {
  sm: "w-3 h-3 -top-0.5 -right-0.5",
  md: "w-4 h-4 -top-0.5 -right-0.5",
  lg: "w-5 h-5 -top-1 -right-1",
  xl: "w-6 h-6 -top-1 -right-1",
};

export default function Avatar({
  src,
  name,
  size = "md",
  isOnline,
  isPremium,
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
    : "?";

  const showImage = src && !imgError;

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      {showImage ? (
        // Already a correctly-sized WebP from the API, so next/image would add
        // server-side resizing cost for no gain.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getImageUrl(src, variantForSize[size])}
          alt={name || "avatar"}
          width={pixelSize[size]}
          height={pixelSize[size]}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className={cn(
            sizeClasses[size],
            "rounded-full object-cover",
            isPremium && "ring-2 ring-warning ring-offset-1 ring-offset-bg-primary"
          )}
        />
      ) : (
        <div
          className={cn(
            sizeClasses[size],
            "rounded-full gradient-bg flex items-center justify-center font-bold text-white",
            isPremium && "ring-2 ring-warning ring-offset-1 ring-offset-bg-primary"
          )}
        >
          {initials}
        </div>
      )}

      {/* Online indicator */}
      {isOnline !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 left-0 rounded-full border-2 border-bg-card",
            onlineDot[size],
            isOnline ? "bg-success" : "bg-text-muted/40"
          )}
        />
      )}

      {/* Premium crown badge */}
      {isPremium && (
        <span className={cn("absolute flex items-center justify-center", crownSize[size])}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-warning drop-shadow-sm w-full h-full">
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" />
          </svg>
        </span>
      )}
    </div>
  );
}
