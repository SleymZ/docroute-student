import Link from "next/link";

import {
  ArrowUpRight,
  Compass,
  GraduationCap,
  LogIn,
  MapPinned,
  Route,
  Signpost,
} from "lucide-react";

import styles from "./Header.module.css";

const navigation = [
  {
    label: "Explore",
    href: "/explore",
    icon: Compass,
  },
  {
    label: "Universities",
    href: "/#universities",
    icon: GraduationCap,
  },
  {
    label: "Residence routes",
    href: "/#residence",
    icon: MapPinned,
  },
  {
    label: "How it works",
    href: "/#how-it-works",
    icon: Signpost,
  },
];

export function Header() {
  return (
    <header className={styles.header}>
      <Link
        href="/"
        className={styles.brand}
        aria-label="DocRoute Student — home"
      >
        <span className={styles.brandMark}>
          <Route
            size={25}
            strokeWidth={1.7}
            aria-hidden="true"
          />
        </span>

        <span className={styles.brandText}>
          <span className={styles.brandName}>DocRoute</span>
          <span className={styles.brandCaption}>STUDENT</span>
        </span>
      </Link>

      <nav
        className={styles.navigation}
        aria-label="Main navigation"
      >
        {navigation.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className={styles.navLink}
          >
            <Icon
              size={16}
              strokeWidth={1.7}
              aria-hidden="true"
            />

            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.actions}>
        <Link
          href="/auth?mode=login"
          className={styles.login}
        >
          <LogIn size={16} aria-hidden="true" />
          <span>Log in</span>
        </Link>

        <Link
          href="/auth?mode=signup"
          className={styles.buildRoute}
        >
          <span>Build my route</span>
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}