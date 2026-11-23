import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  const mail = <a href={`mailto:${site.email}`}>{site.email}</a>;
  return (
    <LegalPage title="Privacy Policy">
      <p>
        {site.operator} is run by one person (&ldquo;I&rdquo;, &ldquo;me&rdquo;). This policy explains what information I collect when you use the website at{" "}
        {site.domain}, including the {site.appName} page at {site.domain}/helptopost, and the {site.appName} app at app.{site.domain}
        (together, the &ldquo;Service&rdquo;), how I use it, and the choices you have. If I add other apps, this policy will name them before they
        launch. The Service helps you edit photos and videos and publish them to social platforms such as YouTube and Instagram. Questions? Email {mail}.
      </p>

      <h2>Summary</h2>
      <ul>
        <li>I use your information only to run the Service: to edit, preview, schedule and publish the posts you ask me to.</li>
        <li>I never sell your information and I do not show ads.</li>
        <li>I only post to your accounts when you tell me to.</li>
        <li>You can disconnect any account and delete your data at any time.</li>
      </ul>

      <h2>Information I collect</h2>
      <h3>Information you give me</h3>
      <ul>
        <li><strong>Waitlist:</strong> your email address, the kind of business you run, and the platforms you want to post to.</li>
        <li><strong>Your account:</strong> your email address and name, and your sign-in details if you sign in with Google.</li>
        <li><strong>Your content:</strong> photos, videos, captions, titles, hashtags, edit settings, templates and schedules you create in the Service.</li>
        <li><strong>Messages:</strong> anything you send me by email or through support.</li>
      </ul>
      <h3>Information from platforms you connect</h3>
      <p>When you choose to connect a social account, the platform asks for your permission and then shares the following with me:</p>
      <ul>
        <li>
          <strong>YouTube (Google):</strong> your YouTube channel ID, channel name and profile image, and access tokens that let me upload videos
          and set their titles, descriptions, privacy and thumbnails on your behalf. I request only the permissions needed to upload to your channel
          and read your channel&apos;s basic details.
        </li>
        <li>
          <strong>Instagram (Meta):</strong> your Instagram professional account ID, username, account type and profile picture, and access tokens
          that let me publish photos, carousels and Reels you create in the Service, and check whether a post was published.
        </li>
      </ul>
      <p>I do not read your private messages, your followers&apos; personal information, or content you posted outside the Service.</p>
      <h3>Information collected automatically</h3>
      <ul>
        <li><strong>Technical data:</strong> IP address, browser and device type, and pages visited, kept in server logs for security and troubleshooting.</li>
        <li><strong>Error reports:</strong> details about errors in the app, such as a failed upload, so I can fix them.</li>
        <li><strong>Cookies:</strong> I use only cookies and local storage needed to keep you signed in and remember your settings. I do not use advertising or cross-site tracking cookies.</li>
      </ul>

      <h2>How I use information</h2>
      <ul>
        <li>To provide the Service: store and edit your media, show previews, and publish or schedule posts to the accounts you connect, only when you ask.</li>
        <li>To tell you about your posts, for example &ldquo;your post is live&rdquo; or &ldquo;this upload failed&rdquo;.</li>
        <li>To run the waitlist and send you your invite and important updates about the Service.</li>
        <li>To keep the Service secure, prevent abuse, and fix problems.</li>
        <li>To process payments once paid plans launch.</li>
        <li>If you use the optional caption helper, to send the selected photo or text to an AI provider to draft a caption for you.</li>
      </ul>

      <h2>Google and YouTube data</h2>
      <p>
        The Service uses YouTube API Services. By connecting a YouTube channel, you agree to be bound by the{" "}
        <a href="https://www.youtube.com/t/terms">YouTube Terms of Service</a>, and Google&apos;s handling of your information is described in the{" "}
        <a href="https://policies.google.com/privacy">Google Privacy Policy</a>.
      </p>
      <p>
        {site.operator}&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
        <a href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</a>, including the Limited Use
        requirements. I use Google user data only to provide the features you see in the Service, I do not use it for advertising, I do not sell it,
        and I do not allow humans to read it except with your permission, for security, or where the law requires.
      </p>
      <p>
        You can revoke my access to your Google account at any time from your{" "}
        <a href="https://security.google.com/settings/security/permissions">Google security settings</a>. When you revoke access or disconnect
        YouTube in the app, I delete the stored tokens and stop accessing your channel.
      </p>

      <h2>Instagram and Meta data</h2>
      <p>
        Data I receive from Meta is used only to publish and track the posts you create in the Service, in line with the{" "}
        <a href="https://developers.facebook.com/terms/">Meta Platform Terms</a>. You can remove my access from Instagram under Settings, then
        Apps and websites, or by disconnecting Instagram in the app. See <Link href="/data-deletion">how to delete your data</Link>.
      </p>

      <h2>How I share information</h2>
      <p>I do not sell or rent your personal information. I share it only:</p>
      <ul>
        <li><strong>With the platforms you choose:</strong> when you publish, your media and captions are sent to YouTube or Instagram, and are then governed by that platform&apos;s terms and privacy policy.</li>
        <li>
          <strong>With service providers</strong> who host and run the Service for me under contracts that limit their use of your data: website and
          app hosting (Vercel), database and sign-in (Supabase), media storage and network (Cloudflare), email delivery, error monitoring, payments
          (Stripe, once paid plans launch), and, only if you use the caption helper, an AI model provider.
        </li>
        <li><strong>For legal reasons:</strong> if required by law, or to protect the rights, safety or property of my users, the public or me.</li>
        <li><strong>In a business transfer:</strong> if the Service is sold or merged, under this policy or one at least as protective.</li>
      </ul>

      <h2>How long I keep information</h2>
      <ul>
        <li>Original photos and videos are kept while they are in your library or queue, and deleted within 30 days after you delete them or after a scheduled post is published, unless you choose to keep them in your library.</li>
        <li>Platform access tokens are deleted as soon as you disconnect an account or revoke access.</li>
        <li>Account data is deleted within 30 days after you delete your account, except where I must keep limited records by law (for example, payment records).</li>
        <li>Waitlist entries are deleted on request, or when I close the waitlist.</li>
      </ul>

      <h2>Security</h2>
      <p>
        All traffic uses HTTPS. Platform access tokens are encrypted at rest, and access to your data is limited by account-level security rules. No
        system is perfectly secure, so please use a strong password and tell me right away at {mail} if you think your account has been compromised.
      </p>

      <h2>Your choices and rights</h2>
      <ul>
        <li>You can view and edit your content and connected accounts in the app at any time.</li>
        <li>You can disconnect YouTube or Instagram at any time, in the app or from the platform&apos;s own settings.</li>
        <li>You can ask me for a copy of your personal information, or ask me to correct or delete it, by emailing {mail}. I respond within 30 days.</li>
        <li>You can unsubscribe from non-essential emails using the link in any email.</li>
      </ul>
      <p>
        Depending on where you live (for example California, or the European Economic Area and United Kingdom), you may have additional rights, such as
        to know what I collect, to object to or restrict certain uses, and to complain to a data protection authority. I will not treat you
        differently for using these rights. Where data protection law requires a legal basis, I rely on providing the Service you requested, my
        legitimate interest in running and securing it, and your consent where I ask for it. My servers are in the United States.
      </p>

      <h2>Children</h2>
      <p>The Service is for people 18 and older. I do not knowingly collect information from children under 13. If you believe a child has given me information, email {mail} and I will delete it.</p>

      <h2>Changes to this policy</h2>
      <p>If I make material changes, I will update the date above and let you know by email or in the app before the changes take effect.</p>

      <h2>Contact</h2>
      <p>{site.operator}, {mail}</p>
    </LegalPage>
  );
}
