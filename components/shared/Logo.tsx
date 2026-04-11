import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

const imageSizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

const textSizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

export default function Logo({ size = "md", className, showText = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img
        src="/images/logo.png"
        alt="ChatHala"
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
