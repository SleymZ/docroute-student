import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/LegalPage";
import { contact, legalInfo } from "@/data/legal";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms for using DocRoute, a free beta planning tool for moving to Europe. DocRoute is not legal advice and does not provide legal services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const { operatorDescription, minimumAccountAge } = legalInfo;

  return (
    <LegalPage
      eyebrow="TERMS OF USE"
      title="Terms of Use"
      updated={legalInfo.termsUpdated}
      summary={
        <>
          <p>
            <strong>In short.</strong> DocRoute is a free beta. It is an
            information and planning tool, not legal advice.
          </p>
          <ul>
            <li>It costs nothing, and we never ask for payment details.</li>
            <li>
              It organises official rules into a checklist with sources and
              dates. Universities, the police and ministries make every
              decision.
            </li>
            <li>
              Rules change. Check each requirement on the linked official page
              before you apply or file anything.
            </li>
            <li>
              You can delete your account and all saved data at any time from
              your Account page.
            </li>
          </ul>
        </>
      }
    >
      <h2>1. Who runs DocRoute</h2>
      <p>
        DocRoute (&ldquo;DocRoute&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;)
        is a personal, non-commercial project run by {operatorDescription}{" "}
        (the &ldquo;operator&rdquo;). It is not a company, an
        immigration agency, a law firm or an education agent, and it is not
        connected to any university, government authority or police force.
        Contact: <a href={contact.href}>{contact.label}</a>.
      </p>
      <p>
        These terms apply when you use the website and its features
        (together, the &ldquo;service&rdquo;). By using the service or
        creating an account you agree to them. If you do not agree, please
        do not use the service.
      </p>

      <h2>2. Beta version and free of charge</h2>
      <p>
        DocRoute is in public beta. Features, coverage and the layout can
        change, some parts may not work, and the service may be paused or
        stopped. We will try to warn you on the site before removing a
        feature you rely on.
      </p>
      <p>
        The service is free. We do not take payments, do not sell
        subscriptions, do not show advertising and do not receive commissions
        from universities, employers or agencies. If we ever offer paid
        features, they will be described in separate terms that you will see
        and accept before paying; nothing will be charged automatically and
        everything available for free today stays governed by these terms.
      </p>

      <h2>3. What DocRoute is — and what it is not</h2>
      <p>
        DocRoute collects publicly available official rules (university
        admission rules, residence-permit laws and guidance published by
        authorities) and turns them into a route: a checklist of steps,
        documents and dates with a link to the source of each rule. The
        matching of your profile against those rules is an automatic
        comparison that shows which published conditions appear to be met or
        missing.
      </p>
      <p>
        <strong>DocRoute is not legal advice and is not a legal service.</strong>{" "}
        It does not provide legal services within the meaning of the Slovak
        Act No. 586/2003 Coll. on the Legal Profession (or similar laws in
        other countries), does not assess your individual legal situation,
        does not draft or submit applications for you, and does not
        represent you before any university, authority or court. If your
        situation is unusual or a lot depends on it, consult a lawyer
        (advokát), the authority itself or the university&apos;s admissions
        office.
      </p>
      <p>
        <strong>Decisions belong to others.</strong> Admission is decided only
        by the university. Residence permits are decided only by the
        competent authority (in Slovakia the Foreign Police; in Czechia the
        Ministry of the Interior). DocRoute cannot influence these decisions
        and does not guarantee admission, a residence permit, a work
        permit or any other outcome. Labels such as &ldquo;verified&rdquo; or
        &ldquo;meets&rdquo; describe how DocRoute read the published rules on
        the date shown; they are not a promise by anyone.
      </p>

      <h2>4. Accuracy of information</h2>
      <p>
        We work carefully: every rule links to its official source and shows
        the date we last checked it, and rules we could not verify are marked
        as such. Even so, official rules change, sources can be ambiguous and
        mistakes can happen. You are responsible for checking each
        requirement on the official source before you rely on it, and for
        the accuracy of the information you enter. If the information on
        DocRoute and an official source differ, the official source wins.
      </p>
      <p>
        If you find a mistake, please tell us at{" "}
        <a href={contact.href}>{contact.label}</a>. We will
        correct confirmed mistakes as soon as we reasonably can.
      </p>

      <h2>5. Your account</h2>
      <ul>
        <li>
          You may use most of DocRoute without an account. An account lets
          you save your profile, universities and progress.
        </li>
        <li>
          You must be at least {minimumAccountAge} years old to create an
          account.
        </li>
        <li>
          Keep your password secret and tell us if you think someone else
          used your account. One account is for one person.
        </li>
        <li>
          You can download your data and delete your account at any time on
          the <Link href="/account">Account</Link> page. Deleting the account
          removes your profile, saved universities and progress.
        </li>
        <li>
          We may suspend or delete an account that breaks these terms or is
          used to attack the service. Where reasonable we will tell you first.
        </li>
      </ul>

      <h2>6. Acceptable use</h2>
      <p>Please do not:</p>
      <ul>
        <li>use the service for anything unlawful or to mislead others;</li>
        <li>
          present DocRoute content as an official decision, or as advice
          from a university or an authority;
        </li>
        <li>
          try to break, overload or gain unauthorised access to the service,
          other accounts or the systems behind them;
        </li>
        <li>
          copy the service in bulk with automated tools, or resell its
          content;
        </li>
        <li>
          enter information about other people without their permission, or
          sensitive information (for example about health) that the forms do
          not ask for.
        </li>
      </ul>

      <h2>7. Content and intellectual property</h2>
      <p>
        The design, code and texts written for DocRoute belong to its
        operator. You may use them for your own, non-commercial planning and
        share links to them. Official rules, laws and documents belong to
        their authors; we link to them and summarise them. University and
        country images come from Wikimedia Commons and Wikidata and are shown
        with their author and licence; logos and names of universities belong
        to those universities and are used only to identify them.
      </p>

      <h2>8. Links to other websites</h2>
      <p>
        DocRoute links to official and third-party websites. We do not
        control them and are not responsible for their content, availability
        or privacy practices.
      </p>

      <h2>9. Liability</h2>
      <p>
        The service is provided free of charge, as it is, during a beta. To
        the extent permitted by law, we are not liable for losses that result
        from relying on DocRoute instead of the official source, from missed
        deadlines, from decisions made by universities or authorities, or
        from the service being unavailable. Nothing in these terms excludes
        or limits liability that cannot be excluded or limited under
        applicable law (for example for damage caused intentionally), and
        nothing affects your mandatory rights as a consumer.
      </p>

      <h2>10. Changes to these terms</h2>
      <p>
        We may update these terms, for example when coverage grows or if
        paid features are introduced. The date at the top shows the current
        version. For important changes we will show a notice on the site
        before they take effect. If you keep using the service after that,
        the new terms apply; if you do not agree, you can delete your
        account.
      </p>

      <h2>11. Law and disputes</h2>
      <p>
        These terms are governed by the law of the Slovak Republic. If you
        are a consumer living in another EU country, you also keep the
        protection of the mandatory rules of that country. Please contact us
        first so we can try to solve any problem together. Disputes go to
        the competent courts under applicable law.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions, corrections and complaints:{" "}
        <a href={contact.href}>{contact.label}</a>. How we handle
        personal data is described in the{" "}
        <Link href="/privacy">Privacy Policy</Link>, and what we store in
        your browser in the <Link href="/cookies">Cookie Policy</Link>.
      </p>
    </LegalPage>
  );
}
