export function Section({ id, sunken, children }: { id?: string; sunken?: boolean; children: React.ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-16 ${sunken ? "border-y border-hairline bg-sunken" : ""}`}>
      <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-8 sm:py-[88px]">{children}</div>
    </section>
  );
}
