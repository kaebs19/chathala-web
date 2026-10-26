// قسم في صفحة سياسة الخصوصية — مشترك بين العربية (/privacy) والإنجليزية (/privacy/en)
export default function PolicySection({
  title,
  children,
  ltr = false,
}: {
  title: string;
  children: React.ReactNode;
  ltr?: boolean;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4 text-accent-pink">{title}</h2>
      <div
        className={`text-text-muted leading-relaxed space-y-3 [&_ul]:list-disc ${ltr ? "[&_ul]:pl-6" : "[&_ul]:pr-6"} [&_ul]:space-y-2 [&_li]:text-text-muted [&_strong]:text-text-primary`}
      >
        {children}
      </div>
    </div>
  );
}
