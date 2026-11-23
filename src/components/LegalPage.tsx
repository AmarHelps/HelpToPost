import { site } from "@/lib/site";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="prose-legal mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm">Effective {site.legalEffectiveDate}</p>
      {children}
    </article>
  );
}
