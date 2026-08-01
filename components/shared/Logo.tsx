import Image from "next/image";
import { cn } from "@/lib/utils";
import logoSrc from "@/public/images/logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  /** set on above-the-fold instances (header) so the mark isn't lazy-loaded */
  priority?: boolean;
}

const imageSizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

/** rendered px per size — drives the srcset Next generates */
const pixelSizeMap = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const textSizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

export default function Logo({
  size = "md",
  className,
  showText = true,
  priority = false,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src={logoSrc}
        alt="ChatHala"
        width={pixelSizeMap[size]}
        height={pixelSizeMap[size]}
        priority={priority}
        className={cn("rounded-xl object-contain", imageSizeMap[size])}
      />
      {showText && (
        <span className={cn("font-black tracking-tight", textSizeMap[size])}>
          <span className="gradient-text">Chat</span>
          <span className="text-text-primary">Hala</span>
        </span>
      )}
    </span>
  );
}
