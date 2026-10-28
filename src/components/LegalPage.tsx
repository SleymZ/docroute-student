import Link from "next/link";
import type { ReactNode } from "react";

import { legalPages } from "@/data/legal";
import { formatPlanDate } from "@/lib/residence/deadlines";

import { Header } from "./Header";
import styles from "./LegalPage.module.css";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  updated: string;
  summary: ReactNode;
  children: ReactNode;
};

/** Shared frame for the Terms of Use, Privacy Policy and Cookie Policy. */
export function LegalPage({
  eyebrow,
  title,
  updated,
  summary,
  children,
}: LegalPageProps) {
  return (
    <main>
      <Header />

      <div className={`page-container ${styles.page}`}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1>{title}</h1>
          <p className={styles.updated}>
            Last updated {formatPlanDate(updated)}
          </p>
          <div className={styles.summary}>{summary}</div>
        </header>

        <nav className={styles.related} aria-label="Legal documents">
          {legalPages.map((page) => (
            <Link key={page.href} href={page.href}>
              {page.label}
            </Link>
          ))}
        </nav>

        <article className={styles.body}>{children}</article>
      </div>
    </main>
  );
}
