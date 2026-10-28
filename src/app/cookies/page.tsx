import type { Metadata } from "next";
import Link from "next/link";

import { CookieSettings } from "@/components/CookieSettings";
import { LegalPage } from "@/components/LegalPage";
import styles from "@/components/LegalPage.module.css";
import { browserStorageItems, contact, legalInfo } from "@/data/legal";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "DocRoute uses only strictly necessary cookies and browser storage: no analytics, advertising or tracking.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="COOKIE POLICY"
      title="Cookies and browser storage"
      updated={legalInfo.cookiesUpdated}
      summary={
        <p>
          <strong>In short.</strong> DocRoute uses only what is strictly
          necessary for the site to work: staying signed in, your theme and
          your progress on this device. There are no analytics, advertising
          or tracking cookies, and nothing is shared with advertisers. You
          can change your cookie choice below at any time.
        </p>
      }
    >
      <h2>1. What we store</h2>
      <p>
        Cookies and &ldquo;local storage&rdquo; are small pieces of data your
        browser keeps for a website. DocRoute uses the following, all
        first-party (set by DocRoute itself):
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Type</th>
              <th scope="col">Purpose</th>
              <th scope="col">How long</th>
            </tr>
          </thead>
          <tbody>
            {browserStorageItems.map((item) => (
              <tr key={item.name}>
                <td>
                  <code>{item.name}</code>
                </td>
                <td>{item.kind}</td>
                <td>{item.purpose}</td>
                <td>{item.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>2. Your choice</h2>
      <p>
        Under the ePrivacy rules (in Slovakia § 109(8) of Act No. 452/2021
        Coll. on Electronic Communications), storing information on your
        device needs your consent unless it is strictly necessary for a
        service you asked for. Everything listed above is strictly necessary,
        so it is used whichever option you pick.
      </p>
      <p>
        We still ask for your choice when you first visit. If you choose{" "}
        <strong>Accept all</strong>, we may in future add optional,
        privacy-friendly tools such as visit statistics; this page will list
        them before they are switched on. If you choose{" "}
        <strong>Necessary only</strong>, no optional cookie or tool will ever
        be used. Today nothing optional exists, so both choices work the same.
        You can change your choice here at any time:
      </p>
      <CookieSettings />

      <h2>3. Other websites</h2>
      <p>
        If you choose &ldquo;Continue with Google&rdquo;, the Google sign-in
        page sets its own cookies under Google&apos;s policies. Photos are
        loaded from Wikimedia (upload.wikimedia.org), which receives your IP
        address as described in the{" "}
        <Link href="/privacy">Privacy Policy</Link>. Official websites we
        link to have their own cookie rules.
      </p>

      <h2>4. How to remove them</h2>
      <p>
        Signing out removes the sign-in cookies. You can delete all cookies
        and site data for DocRoute in your browser settings at any time. The
        site still works afterwards; you will just need to sign in again, and
        progress saved only on this device will be lost.
      </p>

      <h2>5. Questions</h2>
      <p>
        Write to{" "}
        <a href={contact.href}>{contact.label}</a>
        .
      </p>
    </LegalPage>
  );
}
