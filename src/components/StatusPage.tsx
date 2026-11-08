import Link from "next/link";
import type { ReactNode } from "react";

import { Header } from "./Header";
import styles from "./LegalPage.module.css";

/** Frame for the "page not found" and "something went wrong" screens:
 *  the site header, a short message and ways back into the site. */
export function StatusPage({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <main>
      <Header />
      <div className={`page-container ${styles.page}`}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1>{title}</h1>
          <div className={styles.summary}>{children}</div>
        </header>
        <nav className={styles.related} aria-label="Where to go next">
          {actions}
          <Link href="/home">Home page</Link>
          <Link href="/explore">Explore universities</Link>
          <Link href="/countries">Countries</Link>
        </nav>
      </div>
    </main>
  );
}
