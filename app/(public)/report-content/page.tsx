import type { Metadata } from "next";
import RemovalForm from "./RemovalForm";

// طلب إزالة محتوى — لمن ليس مستخدماً في هلا أيضاً (انتحال، صور بلا إذن، محتوى مسيء، حقوق).
// يرسل إلى POST /api/public/removal-requests، ويُراجَع من لوحة التحكم ← طلبات الإزالة.
export const metadata: Metadata = {
  title: "طلب إزالة محتوى | Content Removal Request",
  description:
    "أبلغ عن حساب ينتحل شخصيتك أو يستعمل صورك، أو عن محتوى مسيء في تطبيق هلا (ChatHala) — حتى لو لم يكن لديك حساب.",
};

export default function ReportContentPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <RemovalForm />
    </div>
  );
}
