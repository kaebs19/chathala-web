import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/links";
import { cn } from "@/lib/utils";

/** شارتا المتجرين بشكلهما المعروف (أسود، شعار + سطران) */
export default function StoreBadges({ className }: { className?: string }) {
  const base = "inline-flex items-center gap-2.5 h-12 px-4 rounded-xl bg-[#111] text-white border border-white/10 hover:bg-black transition";
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className={base} aria-label="حمّل من App Store">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden><path d="M16.37 12.6c-.02-2.14 1.75-3.17 1.83-3.22-1-1.46-2.55-1.66-3.1-1.68-1.32-.13-2.57.78-3.24.78-.67 0-1.7-.76-2.8-.74-1.44.02-2.77.84-3.51 2.13-1.5 2.6-.38 6.44 1.07 8.55.71 1.03 1.56 2.19 2.67 2.15 1.07-.04 1.48-.69 2.77-.69 1.3 0 1.66.69 2.79.67 1.15-.02 1.88-1.05 2.58-2.09.82-1.19 1.15-2.35 1.17-2.41-.03-.01-2.24-.86-2.26-3.42zM14.25 6.32c.59-.72.99-1.71.88-2.7-.85.03-1.88.57-2.49 1.28-.55.63-1.03 1.64-.9 2.61.95.07 1.92-.48 2.51-1.19z"/></svg>
        <span className="text-start leading-tight" dir="ltr"><span className="block text-[10px] opacity-80">Download on the</span><span className="block text-[15px] font-bold">App Store</span></span>
      </a>
      <a href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer" className={base} aria-label="حمّل من Google Play">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden><path fill="#34A853" d="M3.6 2.3 13.5 12 3.6 21.7c-.36-.2-.6-.6-.6-1.06V3.36c0-.46.24-.86.6-1.06z"/><path fill="#FBBC04" d="m16.8 15.3-3.3-3.3 3.3-3.3 3.72 2.15c.98.57.98 1.73 0 2.3z"/><path fill="#4285F4" d="M16.8 8.7 13.5 12 3.6 2.3c.3-.17.68-.18 1.03.02z"/><path fill="#EA4335" d="M16.8 15.3 4.63 22.28c-.35.2-.73.19-1.03.02L13.5 12z"/></svg>
        <span className="text-start leading-tight" dir="ltr"><span className="block text-[10px] opacity-80">GET IT ON</span><span className="block text-[15px] font-bold">Google Play</span></span>
      </a>
    </div>
  );
}
