import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/utils";

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

export default function Avatar({
  src,
  name,
  size = "md",
  isOnline,
  isPremium,
  className,
}: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
    : "?";

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      {src ? (
        <img
          src={getImageUrl(src)}
          alt={name || "avatar"}
          className={cn(
            sizeClasses[size],
            "rounded-full object-cover",
            isPremium && "ring-2 ring-accent-pink"
          )}
        />
      ) : (
        <div
          className={cn(
            sizeClasses[size],
            "rounded-full gradient-bg flex items-center justify-center font-bold text-white"
          )}
        >
          {initials}
        </div>
      )}
      {isOnline !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 left-0 rounded-full border-2 border-bg-card",
            size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5",
            isOnline ? "bg-success" : "bg-text-muted/40"
          )}
        />
      )}
    </div>
  );
}
