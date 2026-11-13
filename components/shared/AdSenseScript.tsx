import { ADSENSE_CLIENT } from "@/lib/ads";

/**
 * سكربت AdSense كما يعطيه Google حرفياً (وسم <script async> خام — React يرفعه إلى <head>
 * في HTML الأول، وهذا ما يفحصه مراجع AdSense). يوضع في تخطيطات الصفحات العامة وحدها.
 */
export default function AdSenseScript() {
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
