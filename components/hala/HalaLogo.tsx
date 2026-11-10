import Image from "next/image";
import logoSrc from "@/public/images/logo.png";

export default function HalaLogo({ size = 36, text = true }: { size?: number; text?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      {/* alt فارغ حين يجاوره النصّ «هلا» (لا تكرار لقارئ الشاشة) */}
      <Image src={logoSrc} alt={text ? "" : "هلا"} width={size} height={size} className="rounded-[22%]" priority />
      {text && <span className="font-extrabold h-gradient-text" style={{ fontSize: size * 0.62 }}>هلا</span>}
    </span>
  );
}
