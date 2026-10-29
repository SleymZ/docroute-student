import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/LegalPage";
import styles from "@/components/LegalPage.module.css";
import { WaitlistLeave } from "@/components/WaitlistLeave";
import { contact, legalInfo } from "@/data/legal";
import { WAITLIST_MAX_MONTHS } from "@/lib/waitlist";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What personal data DocRoute processes, why, who helps us run the service, how long data is kept and how to download or delete it.",
  alternates: { canonical: "/privacy" },
};

const dataRows = [
  {
    what: "Account: email address and password (stored only as a hash by our authentication provider). If you sign in with Google: your Google email, name and profile picture link sent by Google.",
    why: "To create your account, let you sign in and send emails you ask for (confirming your address, resetting your password).",
    basis: "Contract — providing the service you asked for (GDPR Art. 6(1)(b)).",
    kept: "Until you delete your account.",
  },
  {
    what: "Applicant profile you choose to save: destination, field, degree and intake; citizenship; country of your school; current residence status; education status; grade scale and average; languages and certificate levels; exemption evidence you select. No documents are uploaded.",
    why: "To compare your profile with published admission and residence rules and build your route.",
    basis: "Contract (Art. 6(1)(b)).",
    kept: "Until you change it or delete your account.",
  },
  {
    what: "Saved universities and the route tasks you tick off.",
    why: "To remember your shortlist and progress across devices.",
    basis: "Contract (Art. 6(1)(b)).",
    kept: "Until you remove them or delete your account.",
  },
  {
    what: "Answers to route questions and your move date when you are not signed in. These live only in the page address (URL) and on your device; we do not save them in our database.",
    why: "So the route can be built and shared as a link without an account.",
    basis: "Contract (Art. 6(1)(b)).",
    kept: "Not stored by us, apart from technical logs below.",
  },
  {
    what: "Waitlist (only if you press \u201cI want the full route\u201d and tick the consent box): your email address, which route you were viewing (for example study in Slovakia), the time you agreed and the version of the consent text.",
    why: "To email you once if a fuller version of the route launches, and to count how many people want it for each route.",
    basis: "Your consent (GDPR Art. 6(1)(a)). You can withdraw it at any time (see section 5); this does not affect what was done before.",
    kept: `Until we send that one email, until you withdraw, or at most ${WAITLIST_MAX_MONTHS} months after you joined, whichever comes first. Then deleted.`,
  },
  {
    what: "Technical data: IP address, browser type, the page requested (including its address), time and errors, recorded automatically by our hosting and database providers.",
    why: "To deliver pages, keep the service secure and fix errors.",
    basis: "Legitimate interest in a secure, working service (Art. 6(1)(f)).",
    kept: "For the providers' standard log periods (typically days to a few weeks).",
  },
  {
    what: "Messages you send us by email.",
    why: "To answer you, fix reported mistakes and handle your requests.",
    basis: "Legitimate interest in answering you (Art. 6(1)(f)); legal obligation for data-protection requests (Art. 6(1)(c)).",
    kept: "As long as needed to deal with the matter, at most 3 years.",
  },
];

const processors = [
  {
    name: "Supabase, Inc.",
    role: "Database and sign-in (stores your account, profile, saved universities, progress and waitlist emails).",
    link: "https://supabase.com/privacy",
  },
  {
    name: "Vercel, Inc.",
    role: "Hosting: delivers the website and records technical logs.",
    link: "https://vercel.com/legal/privacy-policy",
  },
  {
    name: "Google LLC / Google Ireland Ltd",
    role: "Only if you choose “Continue with Google”: confirms your identity to us.",
    link: "https://policies.google.com/privacy",
  },
  {
    name: "Wikimedia Foundation",
    role: "University and country photos are loaded from upload.wikimedia.org, so your browser sends your IP address to Wikimedia when it shows a photo. No account data is shared.",
    link: "https://foundation.wikimedia.org/wiki/Policy:Privacy_policy",
  },
];

export default function PrivacyPage() {
  const {
    operatorDescription,
    minimumAccountAge,
    supervisoryAuthority,
  } = legalInfo;

  return (
    <LegalPage
      eyebrow="PRIVACY POLICY"
      title="Privacy Policy"
      updated={legalInfo.privacyUpdated}
      summary={
        <>
          <p>
            <strong>In short.</strong> We keep only what is needed to build and
            save your route.
          </p>
          <ul>
            <li>No advertising, no analytics trackers, no selling of data.</li>
            <li>
              Nothing is shared with universities, employers or authorities.
            </li>
            <li>No documents are uploaded; you never send us your passport.</li>
            <li>
              A waitlist email is used only to write to you once about the
              full route, never for newsletters or advertising.
            </li>
            <li>
              You can download or delete everything from your{" "}
              <Link href="/account">Account</Link> page at any time.
            </li>
          </ul>
        </>
      }
    >
      <h2>1. Who is responsible for your data</h2>
      <p>
        The controller of personal data processed through DocRoute is{" "}
        the operator of DocRoute, {operatorDescription}, who runs DocRoute as a free, non-commercial project. Contact for every
        privacy question or request:{" "}
        <a href={contact.href}>{contact.label}</a>.
        {!contact.isEmail && (
          <>
            {" "}
            GitHub issues are public, so never post personal data there;
            you can download or delete your own data at any time on the{" "}
            <Link href="/account">Account</Link> page, and a private email
            address will be published here soon.
          </>
        )}{" "}
        DocRoute has no
        data protection officer because it is not required to have one.
      </p>
      <p>
        This policy follows the EU General Data Protection Regulation
        (Regulation (EU) 2016/679, &ldquo;GDPR&rdquo;) and the Slovak Act No.
        18/2018 Coll. on the Protection of Personal Data.
      </p>

      <h2>2. What we process, why, and for how long</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Data</th>
              <th scope="col">Purpose</th>
              <th scope="col">Legal basis</th>
              <th scope="col">Kept</th>
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row) => (
              <tr key={row.what}>
                <td>{row.what}</td>
                <td>{row.why}</td>
                <td>{row.basis}</td>
                <td>{row.kept}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Giving us data is voluntary. Without an email address we cannot create
        an account, but you can still explore universities and build routes
        without one.
      </p>
      <p>
        We do not ask for special categories of data (such as health,
        religion or ethnic origin). Citizenship and residence status are
        needed because the rules depend on them; please do not enter
        anything the forms do not ask for.
      </p>

      <h2>3. Automated matching</h2>
      <p>
        DocRoute automatically compares your profile with published rules and
        shows statuses such as &ldquo;meets&rdquo; or &ldquo;missing
        information&rdquo;. This is information for you only. It is not a
        decision about you, has no legal effect and is not sent to anyone, so
        Article 22 GDPR on automated decisions does not apply. Admission and
        residence decisions are made only by universities and authorities.
      </p>

      <h2>4. Who helps us run DocRoute</h2>
      <p>
        We do not sell or rent personal data and do not share it for
        marketing. These providers process data for us, under their data
        processing terms:
      </p>
      <ul>
        {processors.map((processor) => (
          <li key={processor.name}>
            <strong>{processor.name}</strong> — {processor.role}{" "}
            <a href={processor.link} target="_blank" rel="noreferrer">
              Their privacy policy
            </a>
          </li>
        ))}
      </ul>
      <p>
        Some of these providers are based in the United States or may process
        data there. Such transfers rely on the EU–U.S. Data Privacy Framework
        where the provider is certified, or on the European Commission&apos;s
        Standard Contractual Clauses (GDPR Art. 46) included in the
        providers&apos; data processing terms.
      </p>
      <p>
        We may disclose data to a public authority only where the law
        requires it.
      </p>

      <h2>5. Your rights</h2>
      <p>Under the GDPR you have the right to:</p>
      <ul>
        <li>access your data and get a copy of it (Art. 15);</li>
        <li>have incorrect data corrected (Art. 16);</li>
        <li>have your data deleted (Art. 17);</li>
        <li>restrict processing (Art. 18);</li>
        <li>receive your data in a machine-readable format (Art. 20);</li>
        <li>
          object to processing based on legitimate interest (Art. 21).
        </li>
      </ul>
      <p>
        Most of this you can do yourself: edit your profile at any time, and
        use <strong>Download my data</strong> or{" "}
        <strong>Delete my account</strong> on the{" "}
        <Link href="/account">Account</Link> page. Deleting your account
        removes your account, profile, saved universities, progress and
        waitlist entries made with the same email from our database
        immediately; copies in our providers&apos; backups are
        overwritten within their backup cycle. For anything else, email{" "}
        <a href={contact.href}>{contact.label}</a>. We answer
        within one month.
      </p>
      <h3 id="waitlist">Leaving the waitlist</h3>
      <p>
        You can withdraw your waitlist consent at any time, as easily as you
        gave it: enter the email below and it is deleted at once. For your
        privacy, the page does not say whether the email was on the list.
      </p>
      <WaitlistLeave />
      <p>
        You also have the right to lodge a complaint with a supervisory
        authority. In Slovakia this is the {supervisoryAuthority.name},{" "}
        {supervisoryAuthority.address},{" "}
        <a href={supervisoryAuthority.url} target="_blank" rel="noreferrer">
          {supervisoryAuthority.url.replace("https://", "")}
        </a>
        . You can also contact the authority in the EU country where you live.
      </p>

      <h2>6. Age</h2>
      <p>
        Accounts are for people aged {minimumAccountAge} or older. If you
        believe a younger person created an account, write to us and we will
        delete it.
      </p>

      <h2>7. Security</h2>
      <p>
        Connections are encrypted (HTTPS). Each saved record is protected by
        database rules so that only you, when signed in, can read or change
        it. Waitlist emails cannot be read through the website at all; only
        the operator sees them. Passwords are never stored in readable form. No system is
        perfectly secure; if a breach likely puts your rights at risk, we
        will notify the authority and, where required, you.
      </p>

      <h2>8. Cookies</h2>
      <p>
        DocRoute uses only strictly necessary cookies and browser storage,
        for example to keep you signed in. Details are in the{" "}
        <Link href="/cookies">Cookie Policy</Link>.
      </p>

      <h2>9. Changes</h2>
      <p>
        We will update this policy when what we do with data changes, for
        example if paid features or new providers are added. The date at the
        top shows the current version; important changes will be announced
        on the site before they apply.
      </p>
    </LegalPage>
  );
}
