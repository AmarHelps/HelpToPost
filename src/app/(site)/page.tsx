import { Check } from "lucide-react";
import { WaitlistForm } from "@/components/WaitlistForm";
import { PhoneMock } from "@/components/PhoneMock";

const steps = [
  { n: "01", title: "Shoot", body: "Take a photo or video with your phone camera, or pick a few from your camera roll. At the booth, backstage or in the field." },
  { n: "02", title: "Fix", body: "Trim it, crop it to the right shape for each app, brighten it and add one line of text. No editing skills needed." },
  { n: "03", title: "Post", body: "See how it will look as a Short, a Reel or a feed post. Then post to YouTube and Instagram with one tap, or schedule it." },
];

const who = [
  { title: "Market and craft vendors", body: "A market-day post with your booth number, hours and 3 photos, ready before the first customer shows up." },
  { title: "Musicians and bands", body: "Turn a clip from last night's set into a YouTube Short and an Instagram Reel, with a link to the new track." },
  { title: "One-person businesses", body: "Bakers, florists, repair shops and makers. Anyone who sells in person and has no marketing team." },
];

const features = [
  "The right shape for each platform: 9:16, 4:5 and 1:1",
  "A warning before you post, like “too long for a Short”",
  "One caption, adjusted for each platform",
  "Templates for your trade: market day, sold out, gig tonight, new single",
  "Runs in your phone browser. Add it to your home screen, no app store",
  "Post now or schedule it for later",
];

function Section({ id, sunken, children }: { id?: string; sunken?: boolean; children: React.ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-16 ${sunken ? "border-y border-hairline bg-sunken" : ""}`}>
      <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-8 sm:py-[88px]">{children}</div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Section>
        <div className="grid items-center gap-12 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="ah-eyebrow mb-6">By Amar Helps · beta</p>
            <h1 aria-label="HelpToPost" className="text-[52px] leading-[0.9] sm:text-[88px] lg:text-[112px]">
              Help<span className="text-secondary">To</span>Post
            </h1>
            <p className="mt-6 font-display text-[24px] font-semibold uppercase leading-[1.05] tracking-[var(--track-display)] [font-kerning:none] sm:text-[34px] lg:text-[40px]">
              Shoot it, fix it, post it everywhere
            </p>
            <p className="mt-6 max-w-[62ch] text-lg text-secondary">
              The simplest way for market vendors, musicians and small businesses to post photos and videos to YouTube and Instagram from a phone. Under a minute from camera to posted.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#waitlist" className="ah-btn ah-btn-primary">Get an early invite</a>
              <a href="#how" className="ah-btn">See how it works</a>
            </div>
            <p className="ah-eyebrow mt-8">YouTube and Instagram first · Facebook and TikTok next</p>
          </div>
          <PhoneMock />
        </div>
      </Section>

      <Section id="how" sunken>
        <p className="ah-eyebrow mb-3">01 — How it works</p>
        <h2 className="text-[30px] leading-[1.1] sm:text-[40px] sm:leading-[1.04]">Three steps, one screen</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="border-t-2 border-ink-line pt-5">
              <p className="font-mono text-sm tracking-[0.14em] text-accent">{s.n}</p>
              <h3 className="mt-2 text-[22px] leading-[1.18]">{s.title}</h3>
              <p className="mt-2 text-secondary">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <p className="ah-eyebrow mb-3">02 — Who it is for</p>
        <h2 className="text-[30px] leading-[1.1] sm:text-[40px] sm:leading-[1.04]">People who sell in person</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {who.map((w) => (
            <div key={w.title} className="ah-card">
              <h3 className="text-[17px] leading-[1.25]">{w.title}</h3>
              <p className="mt-2 text-secondary">{w.body}</p>
            </div>
          ))}
        </div>
        <ul className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {features.map((f) => (
            <li key={f} className="flex gap-3">
              <Check size={18} strokeWidth={1.75} className="mt-1 shrink-0 text-accent" aria-hidden="true" />
              <span className="text-secondary">{f}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="pricing" sunken>
        <p className="ah-eyebrow mb-3">03 — Pricing</p>
        <h2 className="text-[30px] leading-[1.1] sm:text-[40px] sm:leading-[1.04]">One plan, no contract</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="ah-card ah-card-drawn">
            <p className="ah-eyebrow">During the beta</p>
            <p className="mt-3 font-display text-[40px] font-semibold uppercase leading-none">Free</p>
            <p className="mt-3 text-secondary">Free for everyone on the waitlist while it is in beta. In return, tell me what works and what does not.</p>
          </div>
          <div className="ah-card">
            <p className="ah-eyebrow">After launch</p>
            <p className="mt-3 font-display text-[40px] font-semibold uppercase leading-none">
              About $15 <span className="font-sans text-base font-normal normal-case text-secondary">a month</span>
            </p>
            <p className="mt-3 text-secondary">One plan. Stop any month you like. Beta testers keep a lower founding price.</p>
          </div>
        </div>
      </Section>

      <Section id="waitlist">
        <div className="mx-auto max-w-[720px]">
          <p className="ah-eyebrow mb-3">04 — Waitlist</p>
          <h2 className="text-[30px] leading-[1.1] sm:text-[40px] sm:leading-[1.04]">Get an early invite</h2>
          <p className="mb-8 mt-3 text-secondary">Tell me what you do and where you post. I will send an invite as soon as there is room in the beta.</p>
          <div className="ah-card ah-card-sticker">
            <WaitlistForm />
          </div>
        </div>
      </Section>
    </>
  );
}
