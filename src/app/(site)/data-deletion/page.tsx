import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Delete your data", alternates: { canonical: "/data-deletion" } };

export default function DataDeletion() {
  const mail = <a href={`mailto:${site.email}?subject=Delete%20my%20data`}>{site.email}</a>;
  return (
    <LegalPage title="How to delete your data">
      <p>You can remove our access to your accounts and have your data deleted at any time. Any one of these is enough to stop us from posting for you.</p>

      <h2>Delete everything</h2>
      <p>
        Email {mail} from the address on your account with the subject &ldquo;Delete my data&rdquo;. We delete your account, media, posts,
        templates, connected-account tokens and waitlist entry within 30 days and email you when it is done. Posts already published to YouTube or
        Instagram stay on those platforms; you can delete them there.
      </p>

      <h2>Disconnect Instagram</h2>
      <ul>
        <li>In the app, open Accounts and tap Disconnect next to Instagram. We delete the stored token right away.</li>
        <li>Or, in Instagram, go to Settings, then Apps and websites, find {site.appName} and tap Remove.</li>
      </ul>

      <h2>Disconnect YouTube</h2>
      <ul>
        <li>In the app, open Accounts and tap Disconnect next to YouTube.</li>
        <li>Or remove {site.appName} from your <a href="https://security.google.com/settings/security/permissions">Google account permissions</a>.</li>
      </ul>

      <h2>Leave the waitlist</h2>
      <p>Email {mail} and we will remove your email address.</p>
    </LegalPage>
  );
}
