import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LegacyHashForward } from "@/components/LegacyHashForward";
import { Section } from "@/components/Section";
import { site } from "@/lib/site";

const services = [
  { n: "01", title: "Design", body: "Logos, product concepts and layouts, from first sketch to finished files." },
  { n: "02", title: "Prototyping", body: "3D models you can review on screen, then printed parts you can hold and test." },
  { n: "03", title: "Implementation", body: "I turn the approved design into a working product, whether that's a printed part, a website or a small app." },
];

export default function Home() {
  return (
    <>
      <LegacyHashForward />
      <Section>
        <div className="max-w-[860px]">
          <p className="ah-eyebrow mb-6">{site.operator} · Texas</p>
          <h1 className="text-[52px] leading-[0.9] sm:text-[88px] lg:text-[112px]">Amar Helps</h1>
          <p className="mt-6 font-display text-[24px] font-semibold uppercase leading-[1.05] tracking-[var(--track-display)] [font-kerning:none] sm:text-[34px] lg:text-[40px]">
            Simple tools for people who make and sell
          </p>
          <p className="mt-6 max-w-[62ch] text-lg text-secondary">
            I build apps and make things for small businesses, makers and musicians. Each app does one job well. The first one is {site.appName}.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/helptopost" className="ah-btn ah-btn-primary">See {site.appName}</Link>
            <a href="#contact" className="ah-btn">Get in touch</a>
          </div>
        </div>
      </Section>

      <Section id="apps" sunken>
        <p className="ah-eyebrow mb-3">01 — Apps</p>
        <h2 className="text-[30px] leading-[1.1] sm:text-[40px] sm:leading-[1.04]">What I make</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <Link href="/helptopost" className="ah-card ah-card-drawn group flex flex-col no-underline transition-colors hover:bg-raised">
            <div className="flex items-center justify-between gap-4">
              <p className="ah-eyebrow">Social posting · phone first</p>
              <span className="ah-badge">Beta</span>
            </div>
            <p aria-label={site.appName} className="mt-4 font-display text-[40px] font-semibold uppercase leading-none sm:text-[52px]">
              Help<span className="text-secondary">To</span>Post
            </p>
            <p className="mt-3 font-display text-[18px] font-semibold uppercase leading-[1.1] sm:text-[20px]">Shoot it, fix it, post it everywhere</p>
            <p className="mt-3 text-secondary">
              Post photos and videos to YouTube and Instagram from your phone in under a minute. Built for market vendors, musicians and one-person businesses.
            </p>
            <span className="ah-eyebrow mt-6 inline-flex items-center gap-2 !text-primary group-hover:!text-accent">
              Learn more <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </span>
          </Link>
          <div className="ah-card flex flex-col">
            <p className="ah-eyebrow">Next</p>
            <p className="mt-4 font-display text-[22px] font-semibold uppercase leading-[1.18]">More on the way</p>
            <p className="mt-3 text-secondary">
              New apps start from a real problem someone has. If there is a job in your business that takes too long, tell me about it.
            </p>
            <a href={`mailto:${site.email}`} className="ah-eyebrow mt-auto pt-6 !text-secondary hover:!text-accent">{site.email}</a>
          </div>
        </div>
      </Section>

      <Section id="services">
        <p className="ah-eyebrow mb-3">02 — Services</p>
        <h2 className="text-[30px] leading-[1.1] sm:text-[40px] sm:leading-[1.04]">From idea to object: design, prototyping and more</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {services.map((s) => (
            <li key={s.n} className="border-t-2 border-ink-line pt-5">
              <p className="font-mono text-sm tracking-[0.14em] text-secondary">{s.n}</p>
              <h3 className="mt-2 text-[22px] leading-[1.18]">{s.title}</h3>
              <p className="mt-2 text-secondary">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="contact" sunken>
        <div className="mx-auto max-w-[720px]">
          <p className="ah-eyebrow mb-3">03 — Contact</p>
          <h2 className="text-[30px] leading-[1.1] sm:text-[40px] sm:leading-[1.04]">Get in touch</h2>
          <div className="ah-card ah-card-sticker mt-8">
            <p className="text-secondary">For a project, a question about {site.appName}, or anything else, email me.</p>
            <a href={`mailto:${site.email}`} className="mt-4 inline-block font-display text-[24px] font-semibold uppercase leading-tight !text-primary hover:!text-accent sm:text-[32px]">
              {site.email}
            </a>
            <p className="ah-eyebrow mt-6">{site.operator} is a Texas limited liability company</p>
          </div>
        </div>
      </Section>
    </>
  );
}
