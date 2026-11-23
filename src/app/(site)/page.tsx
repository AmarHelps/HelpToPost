import { WaitlistForm } from "@/components/WaitlistForm";
import { PhoneMock } from "@/components/PhoneMock";

const steps = [
  { n: "1", title: "Shoot", body: "Snap a photo or video with your phone's camera, or pick a few from your camera roll. Works at the booth, backstage or in the field." },
  { n: "2", title: "Fix", body: "Trim, crop to the right shape for each app, brighten it up, and add one line of text. No editing skills needed." },
  { n: "3", title: "Post everywhere", body: "See exactly how it will look as a Short, a Reel or a feed post, then post to YouTube and Instagram with one tap, or schedule it." },
];

const who = [
  { title: "Farmers market and craft vendors", body: "“Market day” posts with your booth number, hours and three photos, ready before the first customer arrives." },
  { title: "Musicians and bands", body: "Turn a clip from last night's set into a YouTube Short and an Instagram Reel, with a link to your new track." },
  { title: "One-person businesses", body: "Bakers, florists, repair shops and makers: anyone who sells in person and doesn't have a marketing team." },
];

const features = [
  "Right size for every platform: 9:16, 1:1 and 4:5 crops done for you",
  "Warnings before you post, like “too long for a Short”",
  "One caption, adjusted for each platform",
  "Templates for your trade: Market day, Sold out, Gig tonight, New single",
  "Works in your phone's browser. Add it to your home screen, no app store",
  "Post now or schedule for later",
];

export default function Home() {
  return (
    <>
      <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 pb-16 pt-12 md:grid-cols-[1.15fr_1fr] md:pt-20">
        <div>
          <p className="mb-4 inline-block rounded-full bg-soft px-3 py-1 text-sm font-medium text-brand">Now inviting early testers</p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Shoot it, fix it, post it everywhere.<span className="text-accent"> In under a minute.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Amar Helps is the simplest way for market vendors, musicians and small businesses to post photos and videos to YouTube and Instagram, right from your phone.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#waitlist" className="rounded-xl bg-brand px-6 py-3 font-semibold text-brand-ink">Join the waitlist</a>
            <a href="#how" className="rounded-xl border border-line px-6 py-3 font-semibold">See how it works</a>
          </div>
          <p className="mt-6 text-sm text-muted">Starting with YouTube and Instagram. Facebook and TikTok are next.</p>
        </div>
        <PhoneMock />
      </section>

      <section id="how" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="font-display text-3xl font-semibold">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-line bg-bg p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-semibold text-brand-ink">{s.n}</div>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="font-display text-3xl font-semibold">Made for people who sell in person</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {who.map((w) => (
            <div key={w.title}>
              <h3 className="text-lg font-semibold">{w.title}</h3>
              <p className="mt-2 text-muted">{w.body}</p>
            </div>
          ))}
        </div>
        <ul className="mt-12 grid gap-3 sm:grid-cols-2">
          {features.map((f) => (
            <li key={f} className="flex gap-3 rounded-xl bg-soft p-4">
              <span aria-hidden="true" className="mt-0.5 text-brand">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="pricing" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="font-display text-3xl font-semibold">Simple pricing</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-brand bg-bg p-6">
              <h3 className="text-lg font-semibold">Early tester</h3>
              <p className="mt-2 font-display text-4xl font-semibold">Free</p>
              <p className="mt-2 text-muted">Free during the beta for everyone on the waitlist, in exchange for honest feedback.</p>
            </div>
            <div className="rounded-2xl border border-line bg-bg p-6">
              <h3 className="text-lg font-semibold">After launch</h3>
              <p className="mt-2 font-display text-4xl font-semibold">About $15<span className="text-base font-normal text-muted"> / month</span></p>
              <p className="mt-2 text-muted">One simple plan, cancel anytime. Early testers get a founding-member discount.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="waitlist" className="mx-auto max-w-2xl scroll-mt-20 px-4 py-16">
        <h2 className="font-display text-3xl font-semibold">Get an early invite</h2>
        <p className="mt-2 mb-8 text-muted">Tell us a little about what you do, and we&apos;ll invite you as soon as there&apos;s room in the beta.</p>
        <WaitlistForm />
      </section>
    </>
  );
}
