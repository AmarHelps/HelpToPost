import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Service", alternates: { canonical: "/terms" } };

export default function Terms() {
  const mail = <a href={`mailto:${site.email}`}>{site.email}</a>;
  const law = site.governingState
    ? `the laws of the State of ${site.governingState}, United States`
    : `the laws of the United States and of the state where ${site.operator} is based`;
  return (
    <LegalPage title="Terms of Service">
      <p>
        These Terms are an agreement between you and {site.operator}, which is run by one person (&ldquo;I&rdquo;, &ldquo;me&rdquo;), for your use of {site.domain} and the{" "}
        {site.appName} app at app.{site.domain} (the &ldquo;Service&rdquo;). By using the Service you agree to these Terms and to my{" "}
        <Link href="/privacy">Privacy Policy</Link>. If you don&apos;t agree, please don&apos;t use the Service.
      </p>

      <h2>1. The Service</h2>
      <p>
        The Service lets you capture or upload photos and videos, make simple edits, preview them for different platforms, and publish or schedule
        them to social accounts you connect, such as YouTube and Instagram. Features may change as I improve the Service. During the beta, some
        features may be incomplete or unavailable.
      </p>

      <h2>2. Who can use it</h2>
      <p>You must be at least 18 years old and able to form a binding contract. If you use the Service for a business, you confirm you are allowed to accept these Terms for that business.</p>

      <h2>3. Your account</h2>
      <p>Keep your sign-in details safe and tell me at {mail} if you suspect unauthorized use. You are responsible for activity on your account.</p>

      <h2>4. Connected platforms</h2>
      <p>
        When you connect a third-party account, you authorize me to access it and to publish content to it only as you direct. Your use of those
        platforms remains subject to their own terms, including the{" "}
        <a href="https://www.youtube.com/t/terms">YouTube Terms of Service</a>, the{" "}
        <a href="https://policies.google.com/privacy">Google Privacy Policy</a>, and the{" "}
        <a href="https://help.instagram.com/581066165581870">Instagram Terms of Use</a>. By connecting YouTube, you agree to be bound by the YouTube
        Terms of Service. I am not affiliated with or endorsed by Google, YouTube, Meta or Instagram. Platforms may change or limit their services,
        reject or remove posts, or set posting limits, and I am not responsible for their decisions.
      </p>

      <h2>5. Your content</h2>
      <p>
        You keep all ownership of the photos, videos, captions and other content you put into the Service (&ldquo;Your Content&rdquo;). You give me a
        limited, worldwide, non-exclusive, royalty-free license to host, store, copy, process, edit (as you direct) and transmit Your Content only as
        needed to provide the Service to you, including publishing it to the platforms you choose. This license ends when you delete Your Content
        from the Service, except for copies already published to third-party platforms at your request.
      </p>
      <p>
        You are responsible for Your Content. You confirm that you own it or have permission to use it, including any music, images, people or
        trademarks in it, and that posting it does not break any law or any platform&apos;s rules.
      </p>

      <h2>6. Acceptable use</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>post content that is illegal, infringing, deceptive, hateful, harassing, sexually explicit, or that violates a platform&apos;s policies;</li>
        <li>send spam or artificially inflate engagement;</li>
        <li>access accounts you are not authorized to manage;</li>
        <li>interfere with, overload, reverse engineer or scrape the Service; or</li>
        <li>resell the Service without my written permission.</li>
      </ul>
      <p>I may remove content or suspend accounts that break these rules.</p>

      <h2>7. Fees</h2>
      <p>
        The Service is free during the beta. When paid plans launch, I will show the price before you subscribe. Subscriptions renew automatically
        until you cancel, and you can cancel at any time effective at the end of the current billing period. Payments are handled by my payment
        processor. Except where the law requires, fees are non-refundable. I will give you at least 30 days&apos; notice of any price change.
      </p>

      <h2>8. Ending your use</h2>
      <p>
        You can stop using the Service and delete your account at any time (see <Link href="/data-deletion">how to delete your data</Link>). I may
        suspend or end your access if you break these Terms, if required by law, or if I stop offering the Service, in which case I will try to
        give you notice and a chance to download Your Content.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. To the fullest extent the law allows, I disclaim all warranties,
        express or implied, including merchantability, fitness for a particular purpose and non-infringement. I do not promise that the Service will
        be uninterrupted or error-free, that any post will be published at a particular time, or that a platform will accept it.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the fullest extent the law allows, {site.operator} will not be liable for any indirect, incidental, special, consequential or punitive
        damages, or for lost profits, revenue, data or goodwill. My total liability for any claim relating to the Service is limited to the greater
        of the amount you paid me in the 12 months before the claim or US $50.
      </p>

      <h2>11. Indemnity</h2>
      <p>You agree to defend and hold {site.operator} harmless from claims arising out of Your Content or your breach of these Terms or of a platform&apos;s rules.</p>

      <h2>12. Governing law</h2>
      <p>These Terms are governed by {law}, without regard to conflict-of-law rules. Before filing a claim, please contact me at {mail} so I can try to resolve it informally.</p>

      <h2>13. Changes</h2>
      <p>I may update these Terms. If a change is material, I will tell you by email or in the app before it takes effect. Continuing to use the Service after that means you accept the new Terms.</p>

      <h2>14. Contact</h2>
      <p>{site.operator}, {mail}</p>
    </LegalPage>
  );
}
