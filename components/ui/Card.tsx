import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function Card({
  children,
  className,
  hover = false,
  glow = false,
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-bg-card border border-border rounded-2xl p-6",
        hover && "hover:border-accent-pink/50 hover:shadow-lg hover:shadow-accent-pink/10 transition-all duration-300",
        glow && "glow",
        className
      )}
    >
      {children}
    </div>
  );
}
