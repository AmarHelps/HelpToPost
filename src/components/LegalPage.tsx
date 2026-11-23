import { site } from "@/lib/site";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-8 sm:py-[88px]">
      <article className="prose-legal">
        <p className="ah-eyebrow mb-4">Legal · effective {site.legalEffectiveDate}</p>
        <h1 className="text-[40px] leading-[1.04] sm:text-[56px] sm:leading-[0.98]">{title}</h1>
        {children}
      </article>
    </div>
  );
}
