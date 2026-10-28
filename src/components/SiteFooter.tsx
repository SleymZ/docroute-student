import Link from "next/link";

import { legalInfo, legalPages } from "@/data/legal";

import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.notice}>
          <span className={styles.beta}>BETA</span>
          DocRoute is a free information and planning tool, not legal advice.
          Universities and authorities make every decision; check each rule on
          its official source.
        </p>

        <nav className={styles.links} aria-label="Legal">
          {legalPages.map((page) => (
            <Link key={page.href} href={page.href}>
              {page.label}
            </Link>
          ))}
          <a href={`mailto:${legalInfo.contactEmail}`}>Contact</a>
        </nav>
      </div>
    </footer>
  );
}
