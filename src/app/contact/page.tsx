import type { Metadata } from "next";

import { ArrowUpRight, Camera, Clapperboard, Mail } from "lucide-react";

import { LegalPage } from "@/components/LegalPage";
import { contact, socialLinks } from "@/data/legal";

import styles from "./Contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write to DocRoute by email, or find us on Instagram and TikTok.",
  alternates: { canonical: "/contact" },
};

const icons = { Instagram: Camera, TikTok: Clapperboard } as const;

// Owner request 2026-11-18: one place with the email (first) and the
// Instagram and TikTok accounts. The operator is not named.
export default function ContactPage() {
  return (
    <LegalPage
      eyebrow="CONTACT"
      title="Contact DocRoute"
      summary={
        <p>
          Questions about a route, a rule that looks wrong, or an idea for the site: email is the best way to reach
          us. We usually answer within a few days.
        </p>
      }
    >
      <div className={styles.grid}>
        <a href={contact.href} className={`${styles.card} ${styles.main}`}>
          <span className={styles.icon} aria-hidden="true">
            <Mail size={22} />
          </span>
          <span className={styles.text}>
            <span className={styles.label}>Email</span>
            <strong>{contact.label}</strong>
          </span>
          <span className={styles.action}>
            Write to us <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </a>

        {socialLinks.map(({ network, handle, href }) => {
          const Icon = icons[network];
          return (
            <a key={network} href={href} className={styles.card} target="_blank" rel="noopener noreferrer">
              <span className={styles.icon} aria-hidden="true">
                <Icon size={20} />
              </span>
              <span className={styles.text}>
                <span className={styles.label}>{network}</span>
                <strong>{handle}</strong>
              </span>
              <ArrowUpRight size={16} aria-hidden="true" className={styles.arrow} />
            </a>
          );
        })}
      </div>
      <p className={styles.note}>
        DocRoute is not legal advice and cannot file anything for you. For a decision on your case, contact the
        university or the authority named in your route.
      </p>
    </LegalPage>
  );
}
